#!/usr/bin/env python3
"""Read-only bounded ISO9660 inventory. Never mounts or executes ISO payloads.
Usage: python3 scripts/inspect-infinity-iso.py /path/to.iso /outside/repo/report.json
Optional external squashfs extraction must be performed separately in a sandbox.
"""
import argparse, hashlib, json, pathlib, struct
SECTOR=2048

def inspect(path):
    path=pathlib.Path(path); size=path.stat().st_size
    if size<SECTOR*17: raise ValueError('Too small for an ISO9660 descriptor')
    digest=hashlib.sha256()
    with path.open('rb') as source:
        for block in iter(lambda:source.read(8*1024*1024),b''): digest.update(block)
        primary=None
        for number in range(16,min(size//SECTOR,80)):
            source.seek(number*SECTOR); record=source.read(SECTOR)
            if record[1:6]!=b'CD001': continue
            if record[0]==1: primary=record;break
        if primary is None: raise ValueError('No ISO9660 PVD. UDF/other filesystems need a separate read-only tool.')
        result={'inputName':path.name,'sizeBytes':size,'sha256':digest.hexdigest(),'filesystem':'ISO9660','volumeId':primary[40:72].decode('ascii','replace').strip(),'systemId':primary[8:40].decode('ascii','replace').strip(),'files':[],'association':'unresolved; compare actual metadata to pinned source definitions','executedPayloads':0}
        visited=set()
        def directory(extent,length,parent,depth):
            if depth>24 or len(result['files'])>50000: raise ValueError('Inventory limit exceeded')
            if extent in visited:return
            visited.add(extent)
            if length>32*1024*1024 or extent*SECTOR+length>size: raise ValueError('Directory extent outside input')
            source.seek(extent*SECTOR); data=source.read(length); offset=0
            while offset<len(data):
                if len(result['files'])>=50000:raise ValueError('Inventory limit exceeded')
                n=data[offset]
                if n==0:offset=((offset//SECTOR)+1)*SECTOR;continue
                if n<34 or offset+n>len(data):raise ValueError('Malformed directory record')
                entry=data[offset:offset+n];offset+=n;name=entry[33:33+entry[32]]
                if name in (b'\x00',b'\x01'):continue
                name=name.decode('ascii','replace').split(';')[0]
                if name in ('','.','..') or '/' in name or '\\' in name:raise ValueError('Unsafe ISO path')
                full=parent+'/'+name;start=struct.unpack_from('<I',entry,2)[0];count=struct.unpack_from('<I',entry,10)[0];isdir=bool(entry[25]&2)
                if start*SECTOR+count>size:raise ValueError('Payload extent outside input')
                row={'path':full,'bytes':count,'extentSector':start,'directory':isdir};result['files'].append(row)
                if isdir:directory(start,count,full,depth+1)
                elif name.lower() in ('os-release','filesystem.manifest','filesystem.manifest-remove','packages.txt','sha256sum','md5sum.txt') and count<=8*1024*1024:
                    source.seek(start*SECTOR);raw=source.read(count);row['text']=raw.decode('utf-8','replace');row['sha256']=hashlib.sha256(raw).hexdigest()
                elif name.lower().endswith(('.squashfs','.sfs')):row['nextStep']='Read-only unsquashfs inspection required; not executed or extracted here'
        r=primary[156:];directory(struct.unpack_from('<I',r,2)[0],struct.unpack_from('<I',r,10)[0],'',0)
        return result

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('iso');p.add_argument('report');a=p.parse_args();out=pathlib.Path(a.report).resolve();repo=pathlib.Path(__file__).resolve().parents[1]
    if out.is_relative_to(repo):p.error('Write private inventory outside the git repository')
    report=inspect(a.iso);out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'report':str(out),'files':len(report['files']),'sha256':report['sha256'],'executedPayloads':0}))
