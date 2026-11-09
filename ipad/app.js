/* Air-OS iPad: no external requests, trackers, APIs or Electron dependencies. */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const audio = $('#audio');
  const STORE = 'air-os-ipad-tracks-v1';
  const KEYS = Object.freeze({ last: 'air-ipad:last-track-v1', progress: 'air-ipad:last-progress-v1',
    events: 'air-ipad:calendar-v1', timer: 'air-ipad:timer-v1' });
  const state = { records: [], currentId: '', lastId: '', objectUrl: null, unlocked: false, db: null,
    registration: null, pendingReload: false, timer: { duration: 300, remaining: 300, endAt: null, done: false } };
  let lastPositionSave = 0;
  let calendarFilter={mode:'Alle',date:'',query:''};let calendarCache=null,musicFilter={query:'',sort:'Importreihenfolge',ids:null},shuffle=false,repeat=false;
  function visibleRecords(){let rows=state.records.filter(r=>(!musicFilter.ids||musicFilter.ids.includes(r.id))&&(r.title+' '+r.artist).toLowerCase().includes(musicFilter.query.toLowerCase()));if(musicFilter.sort==='Titel')rows.sort((a,b)=>a.title.localeCompare(b.title));if(musicFilter.sort==='Favoriten')rows=rows.filter(r=>r.favorite);if(musicFilter.sort==='Zuletzt gespielt')rows.sort((a,b)=>(b.lastPlayedAt||0)-(a.lastPlayedAt||0));return rows;}
  async function refreshCalendar(){await airStore.open();try{await airStore.migrate();calendarCache=await airStore.list('event');}catch(e){window.airMigrationError=e.message;toast(e.message);}renderEvents();}
  async function saveEvents(events){if(window.airMigrationError)throw Error(window.airMigrationError);const before=calendarCache||[];await airStore.transaction((rows,store)=>{for(const old of before)if(!events.some(e=>e.id===old.id)){const actual=rows.find(r=>r.key==='event:'+old.id);if(actual?.revision!==old.revision)throw Error('Termin inzwischen geändert. Bitte neu laden.');store.delete('event:'+old.id);}for(const e of events){const previous=before.find(r=>r.id===e.id);if(previous&&['title','date','time'].every(k=>previous[k]===e[k]))continue;const actual=rows.find(r=>r.key==='event:'+e.id);if(previous&&actual?.revision!==previous.revision)throw Error('Termin inzwischen geändert. Entwurf bleibt erhalten.');store.put({...e,key:'event:'+e.id,kind:'event',revision:(actual?.revision||0)+1,updatedAt:Date.now()});}},true);calendarCache=await airStore.list('event');document.dispatchEvent(new CustomEvent('air-data-changed',{detail:'event'}));}

  let toastTimeout;

  function presentNotice(message,appId=null){const host=$('#toast');clearTimeout(toastTimeout);return new airInfinityNotification.NotificationView(host,String(message),{duration:4200,onclick:appId?()=>window.airDesktop?.open(appId):null});}
  function toast(message) {document.dispatchEvent(new CustomEvent('air-ipad-notice',{detail:{title:String(message),source:'toast'}}));presentNotice(message);}

  function safeJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  }
  function seconds(value) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  }
  function time(value) {
    const sec = seconds(value);
    return String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0');
  }
  function dateTime() {
    const now = new Date();
    $('#lock-date').textContent = now.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
    $('#lock-time').textContent = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }
  function setArt(el, data) {
    const valid = typeof data === 'string' &&
      /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(data) && data.length < 180000;
    el.style.backgroundImage = valid ? 'url("' + data + '")' : '';
    el.textContent = valid ? '' : '♫';
  }
  function setProgress(prefix, position, duration) {
    $('#' + prefix + '-elapsed').textContent = time(position);
    const total = $('#' + prefix + '-total');
    if (total) total.textContent = time(duration);
    const fill = $('#' + prefix + '-fill');
    fill.style.width = duration > 0 ? Math.min(100, Math.max(0, position / duration * 100)) + '%' : '0%';
  }

  function openDB() { return window.airStore.open(); }
  function database(mode, fn) {
    return new Promise((resolve, reject) => {
      const tx = state.db.transaction('tracks', mode);
      const request = fn(tx.objectStore('tracks'));
      tx.oncomplete = () => resolve(request?.result);
      tx.onerror = () => reject(tx.error || new Error('Lokaler Speicherfehler.'));
      tx.onabort = () => reject(tx.error || new Error('Speichertransaktion abgebrochen.'));
    });
  }
  async function patchTrack(id,patch){const old=await airStore.get('trackmeta',id);await airStore.save('trackmeta',{...old,...patch,id},old?.revision||0);const t=song(id);if(t)Object.assign(t,patch);}
  const song = id => state.records.find(record => record.id === id);
  const current = () => song(state.currentId);
  const last = () => song(state.lastId);
  async function refreshLibrary() {
    const tracks=await database('readonly',db=>db.getAll()),metadata=await airStore.list('trackmeta');state.records=tracks.map(t=>{const m=metadata.find(m=>m.id===t.id);return m?{...t,...Object.fromEntries(['title','artist','artwork','favorite','lastPlayedAt'].filter(k=>m[k]!==undefined).map(k=>[k,m[k]]))}:t;});
    state.records.sort((a, b) => a.addedAt - b.addedAt);
    state.lastId = localStorage.getItem(KEYS.last) || '';
    if (!song(state.lastId)) {
      state.lastId = '';
      localStorage.removeItem(KEYS.last);
    }
    if (!current()) state.currentId = state.lastId || state.records[0]?.id || '';
    renderLibrary();
    renderMedia();
  }

  function renderLibrary() {
    const list = $('#song-list');
    list.replaceChildren();
    if (!state.records.length) {
      const note = document.createElement('p');
      note.className = 'hint';
      note.textContent = 'Noch keine Musik importiert. Tippe auf „Musik importieren“.';
      list.append(note);
      return;
    }
    for (const record of visibleRecords()) {
      const row = document.createElement('div');
      row.className = 'song-row' + (record.id === state.currentId ? ' active' : '');
      const choose = document.createElement('button');
      choose.type = 'button';
      choose.setAttribute('aria-label',record.title);
      const art=document.createElement('span');art.className='s3-song-art';art.style.backgroundImage=record.artwork?'url('+JSON.stringify(record.artwork)+')':'';art.textContent=record.artwork?'':'♫';
      const labels=document.createElement('span');labels.className='s3-song-label';const title=document.createElement('strong'),artist=document.createElement('small');title.textContent=record.title;artist.textContent=record.artist||'Air Music';labels.append(title,artist);choose.append(art,labels);
      choose.title = record.title;
      choose.addEventListener('click', () => { void playTrack(record.id); });
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.setAttribute('aria-label', 'Titel entfernen: ' + record.title);
      remove.textContent = '×';
      remove.addEventListener('click', async () => {
        if (!confirm('Diesen Titel aus Air-OS entfernen?')) return;
        try {
          await database('readwrite', db => db.delete(record.id));
          if (state.currentId === record.id) {
            audio.pause();
            audio.removeAttribute('src');
            if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
            state.objectUrl = null; state.currentId = '';
          }
          if (state.lastId === record.id) localStorage.removeItem(KEYS.last);
          await refreshLibrary();
        } catch (error) { toast('Löschen fehlgeschlagen: ' + error.message); }
      });
      row.append(choose, remove);
      list.append(row);
    }
  }
  function renderMedia() {
    document.documentElement.dataset.mediaPaused=String(audio.paused);
    const track = current();
    const recent = last();
    $('#player-title').textContent = track?.title || 'Noch keine Musik';
    $('#player-artist').textContent = track?.artist || 'Füge lokale Musikdateien hinzu';
    setArt($('#player-cover'), track?.artwork);
    $('#notch-title').textContent = recent?.title || 'Keine Musik';
    $('#notch-artist').textContent = recent?.artist || 'Öffne Air Music';
    setArt($('#notch-cover'), recent?.artwork);
    $('#notch-label').textContent = recent?.title || 'Air-OS';
    $('.pulse').classList.toggle('playing', !audio.paused);
    const savedProgress = safeJSON(KEYS.progress, {});
    const position = track?.id === savedProgress.id && !audio.src ? seconds(savedProgress.position) : seconds(audio.currentTime);
    const duration = seconds(audio.duration) || seconds(savedProgress.id === track?.id ? savedProgress.duration : 0);
    setProgress('player', position, duration);
    if(!window.airPlaybackMetadata){$('#lock-music').hidden=!recent;if(recent){$('#lock-title').textContent=recent.title;$('#lock-artist').textContent=recent.artist||'Air Music';setArt($('#lock-cover'),recent.artwork);}}
    document.dispatchEvent(new Event('air-ipad-media'));
    $$('[data-control]').forEach(button => {
      button.disabled = !state.unlocked || !track;
      if (button.dataset.control === 'toggle') {
        button.textContent = audio.paused ? '▶' : '❚❚';
        button.setAttribute('aria-label', audio.paused ? 'Abspielen' : 'Pausieren');
      }
    });
  }
  function rememberPosition() {
    if (!state.lastId || state.currentId !== state.lastId) return;
    const now = Date.now();
    if (now - lastPositionSave < 1500 && !audio.paused) return;
    lastPositionSave = now;
    localStorage.setItem(KEYS.progress, JSON.stringify({
      id: state.lastId,
      position: seconds(audio.currentTime),
      duration: seconds(audio.duration)
    }));
  }
  async function playTrack(id) {
    const record = song(id);
    if (!record) return;
    if (state.currentId !== id || !audio.src) {
      audio.pause();
      if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
      state.objectUrl = URL.createObjectURL(record.blob);
      state.currentId = id;
      audio.src = state.objectUrl;
      const progress=safeJSON(KEYS.progress,{});if(progress.id===id)audio.addEventListener('loadedmetadata',()=>{if(state.currentId===id&&Number.isFinite(audio.duration))audio.currentTime=Math.min(Math.max(0,Number(progress.position)||0),Math.max(0,audio.duration-.1));},{once:true});
      renderLibrary();
    }
    try { await audio.play(); }
    catch (error) { toast('Titel kann nicht abgespielt werden. Prüfe das Audioformat.'); }
    renderMedia();
  }
  function next(delta) {
    if (!state.records.length) return;
    const records=visibleRecords();if(!records.length)return;const index=records.findIndex(item=>item.id===state.currentId);
    const nextId=records[shuffle?Math.floor(Math.random()*records.length):(index+delta+records.length)%records.length].id;
    void playTrack(nextId);
  }
  async function importTracks(files) {
    let success = 0;
    for (const file of files) {
      if (!file || !file.size || !/^(audio\/|application\/ogg)/.test(file.type) && !/\.(mp3|m4a|wav|ogg|aac)$/i.test(file.name)) continue;
      try {
        if(file.size>64*1024*1024)throw Error('Musikimport maximal 64 MB pro Datei.');const meta=await window.airMusicMetadata?.read(file)||{};let artwork='';if(meta.picture&&meta.picture.bytes.length<128000){let raw='';for(let i=0;i<meta.picture.bytes.length;i+=8192)raw+=String.fromCharCode(...meta.picture.bytes.subarray(i,i+8192));artwork='data:'+meta.picture.mime+';base64,'+btoa(raw);}
        await database('readwrite', db => db.put({
          id: crypto.randomUUID(), title: meta.title||file.name.replace(/\.[^.]+$/, '').slice(0, 150),
          artist: meta.artist||'Lokale Datei', artwork, fileName:file.name,blob: file, addedAt: Date.now() + success
        }));
        success++;
      } catch (error) {
        toast('Speicherplatz reicht möglicherweise nicht aus. Import angehalten.');
        break;
      }
    }
    if (success) { await refreshLibrary(); toast(success + ' Titel lokal gespeichert.'); }
    else toast('Keine unterstützten Audiodateien importiert.');
  }
  function processCover(file) {
    if (!file || !['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 5*1024*1024) {
      toast('Bitte ein PNG/JPG/WebP-Bild unter 5 MB wählen.'); return;
    }
    const record = current();
    if (!record) { toast('Wähle zuerst einen Titel.'); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = async () => {
      try {
        const size = 320;
        const canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d');
        const ratio = Math.max(size / img.naturalWidth, size / img.naturalHeight);
        const w = img.naturalWidth * ratio, h = img.naturalHeight * ratio;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        const artwork = canvas.toDataURL('image/jpeg', 0.75);
        if (artwork.length >= 180000) throw new Error('Bild ist zu groß.');
        record.artwork = artwork;
        await patchTrack(record.id,{artwork:record.artwork});
        renderMedia(); toast('Cover lokal gespeichert.');
      } catch (error) { toast('Cover konnte nicht gespeichert werden.'); }
      finally { URL.revokeObjectURL(url); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); toast('Bild konnte nicht geladen werden.'); };
    img.src = url;
  }
  function openPanel(name) {
    if(window.airDesktop){if(name)void airDesktop.open(name);else{const active=[...airDesktop.windows].find(([,w])=>w.classList.contains('focused'));if(active)void airDesktop.close(active[0]);}return;}
    $$('.app-panel').forEach(panel => { panel.hidden = panel.id !== name + '-panel'; });
  }

  function getEvents() {
    const stored = calendarCache??safeJSON(KEYS.events, []);
    return Array.isArray(stored) ? stored.filter(e => e && typeof e.title === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(e.date || '') && /^\d{2}:\d{2}$/.test(e.time || '')) : [];
  }
  function renderEvents() {
    const list = $('#event-list');
    list.replaceChildren();
    const events = getEvents().filter(e=>{if(!e.title.toLowerCase().includes(calendarFilter.query.toLowerCase()))return false;if(calendarFilter.mode==='Tag')return e.date===calendarFilter.date;if(calendarFilter.mode==='Woche'){const start=Date.parse(calendarFilter.date+'T00:00'),d=Date.parse(e.date+'T00:00');return d>=start&&d<start+7*86400000;}return true;}).sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time));
    if (!events.length) {
      const p = document.createElement('p'); p.className='hint'; p.textContent='Noch keine Termine gespeichert.'; list.append(p); return;
    }
    for (const event of events) {
      const row = document.createElement('div'); row.className='event-row';
      const text = document.createElement('span'); const name = document.createElement('strong'), when = document.createElement('small');
      name.textContent=event.title; when.textContent=event.date+' · '+event.time; text.append(name,when);
      const remove = document.createElement('button'); remove.type='button'; remove.textContent='×'; remove.setAttribute('aria-label','Termin entfernen');
      remove.addEventListener('click',async()=>{if(!confirm('Termin löschen?'))return;try{await saveEvents(getEvents().filter(e=>e.id!==event.id));renderEvents();}catch(e){toast(e.message);}});
      const edit=document.createElement('button');edit.type='button';edit.textContent='Bearbeiten';edit.onclick=()=>{const form=$('#event-form');form.elements.title.value=event.title;form.elements.date.value=event.date;form.elements.time.value=event.time;form.dataset.editingId=event.id;form.querySelector('button[type=submit]').textContent='Speichern';};row.append(edit);
      row.append(text,remove);list.append(row);
    }
  }
  function loadTimer() {
    const saved = safeJSON(KEYS.timer, {});
    if(Number.isFinite(saved.duration)&&saved.duration>=1&&saved.duration<=86400) state.timer.duration=saved.duration;
    if (Number.isFinite(saved.remaining) && saved.remaining>=0 && saved.remaining<=state.timer.duration) state.timer.remaining=saved.remaining;
    if (Number.isFinite(saved.endAt) && saved.endAt > 0) state.timer.endAt=saved.endAt;
    state.timer.done=!!saved.done;
    tickTimer();
  }
  function timerSnapshot(){const t=state.timer;return{...t,remaining:t.endAt?Math.max(0,Math.ceil((t.endAt-Date.now())/1000)):t.remaining};}
  function saveTimer() { localStorage.setItem(KEYS.timer,JSON.stringify(state.timer)); }
  function tickTimer() {
    const t=state.timer;
    if (t.endAt) {
      t.remaining=Math.max(0,Math.ceil((t.endAt-Date.now())/1000));
      if (!t.remaining) { t.endAt=null;t.done=true;saveTimer();toast('Dein Air-OS Timer ist abgelaufen.'); }
    }
    $('#timer-display').textContent=time(t.remaining);
    $('#notch-timer').textContent=time(t.remaining);
    $('#timer-status').textContent=t.done?'Zeit abgelaufen':t.endAt?'Läuft':t.remaining<t.duration?'Pausiert':'Bereit';
    $('#timer-toggle').textContent=t.done?'Fertig':t.endAt?'Pause':t.remaining<t.duration?'Fortsetzen':'Starten';
    $$('[data-minutes]').forEach(el=>el.classList.toggle('selected',Number(el.dataset.minutes)*60===t.duration));document.dispatchEvent(new CustomEvent('air-ipad-timer',{detail:timerSnapshot()}));
  }
  function timerAction(reset) {
    const t=state.timer;
    if(reset||t.done){t.endAt=null;t.remaining=t.duration;t.done=false;}
    else if(t.endAt){t.remaining=Math.max(0,Math.ceil((t.endAt-Date.now())/1000));t.endAt=null;}
    else t.endAt=Date.now()+t.remaining*1000;
    saveTimer();tickTimer();document.dispatchEvent(new Event('air-timer-schedule'));
  }

  async function safeReload(){if(document.hidden){state.pendingReload=true;return;}if(!audio.paused||window.airDesktop?.dirty()||window.airTransfers?.busy()||window.airSpotify?.snapshot().authorizing||window.airSecurity?.hasOAuthReturn()){state.pendingReload=true;toast('Update wartet: Musik pausieren und alle Entwürfe speichern.');return;}rememberPosition();await window.airDesktop?.flush();if(!audio.paused||window.airDesktop?.dirty()||window.airTransfers?.busy()||window.airSpotify?.snapshot().authorizing||window.airSecurity?.hasOAuthReturn()){state.pendingReload=true;return;}await window.airPlaybackMetadata?.flush();if(!audio.paused||window.airDesktop?.dirty()||window.airTransfers?.busy()||window.airSpotify?.snapshot().authorizing||window.airSecurity?.hasOAuthReturn()){state.pendingReload=true;return;}location.reload();}
  async function setupUpdates() {
    if(!('serviceWorker' in navigator)||!isSecureContext){$('#settings-offline').textContent='HTTPS erforderlich';return;}
    try{const registration=await navigator.serviceWorker.register('./sw.js',{scope:'./'});state.registration=registration;$('#settings-offline').textContent='Offlinecache wird vorbereitet';
      navigator.serviceWorker.ready.then(()=>$('#settings-offline').textContent='Service Worker aktiv; Offlinecache installiert');
      let controlled=!!navigator.serviceWorker.controller;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(controlled)void safeReload();controlled=true;});
      navigator.serviceWorker.addEventListener('message',async event=>{const m=event.data||{};if(![registration.waiting,registration.active,registration.installing].includes(event.source)||!event.source||event.source.scriptURL!==new URL('./sw.js',location.href).href)return;if(m.type==='CHECK_UPDATE_SAFETY'&&typeof m.token==='string'&&/^[A-Za-z0-9-]{1,100}$/.test(m.token)){const ready=audio.paused&&!window.airDesktop?.dirty()&&!window.airTransfers?.busy()&&!window.airSpotify?.snapshot().authorizing&&!window.airSecurity?.hasOAuthReturn();if(ready){rememberPosition();await window.airDesktop?.flush();}event.source?.postMessage({type:'UPDATE_SAFETY',token:m.token,ready:ready&&audio.paused&&!window.airDesktop?.dirty()&&!window.airTransfers?.busy()&&!window.airSpotify?.snapshot().authorizing&&!window.airSecurity?.hasOAuthReturn()});}if(m.type==='UPDATE_BLOCKED')toast('Ein anderer Air-OS-Tab spielt Musik oder enthält ungespeicherte Entwürfe.');});
      const installButton=document.createElement('button');installButton.type='button';installButton.textContent='Geladenes Update sicher aktivieren';installButton.hidden=true;installButton.className='primary';$('#check-update').after(installButton);
      const showWaiting=()=>{installButton.hidden=!registration.waiting;if(registration.waiting)$('#update-state').textContent='Update vollständig geladen. Vor Aktivierung Backup erstellen und Entwürfe speichern.';};
      installButton.onclick=async()=>{if(!registration.waiting)return;if(!audio.paused||window.airDesktop?.dirty()||window.airTransfers?.busy()||window.airSpotify?.snapshot().authorizing||window.airSecurity?.hasOAuthReturn()){toast('Bitte Musik pausieren und Entwürfe speichern.');return;}await window.airDesktop?.flush();registration.waiting.postMessage({type:'REQUEST_SAFE_UPDATE',token:crypto.randomUUID()});};
      registration.addEventListener('updatefound',()=>{registration.installing?.addEventListener('statechange',showWaiting);});showWaiting();
      const check=async()=>{if(!navigator.onLine)return;try{await registration.update();showWaiting();}catch{$('#update-state').textContent='Privater Server nicht erreichbar. Vorhandener Offlinecache bleibt erhalten.';}};
      $('#check-update').addEventListener('click',()=>void check());window.addEventListener('online',()=>void check());document.addEventListener('visibilitychange',()=>{if(!document.hidden){tickTimer();void check();}});
    }catch(error){$('#settings-offline').textContent='Offlineeinrichtung fehlgeschlagen';$('#update-state').textContent='HTTPS, freien Speicher und private Serververbindung prüfen. Bestehende Daten bleiben erhalten.';}
  }
  function networkStatus() {
    $('#network-state').textContent=navigator.onLine?'Netz bereit':'Offline';
    $('#settings-network').textContent=navigator.onLine?'Netz bereit':'Offline';
  }
  function wire() {
    $('#unlock').addEventListener('click',()=>{
      state.unlocked=true;$('#lockscreen').hidden=true;$('#desktop').hidden=false;document.dispatchEvent(new CustomEvent('air-ipad-session',{detail:true}));
      renderMedia();
    });
    $('#lock-again').addEventListener('click',()=>{
      $('#toast').hidden=true;clearTimeout(toastTimeout);state.unlocked=false;document.dispatchEvent(new CustomEvent('air-ipad-session',{detail:false}));$('#desktop').hidden=true;$('#lockscreen').hidden=false;
      window.airProNotch?.close(true);renderMedia();
    });
    $$('.app-tile').forEach(button=>button.addEventListener('click',()=>openPanel(button.dataset.panel)));
    $$('[data-close]').forEach(button=>button.addEventListener('click',()=>openPanel('')));
    $('#notch-toggle').addEventListener('click',event=>{
      if(event.target.closest('.pn-mini-timer')&&!event.target.closest('[hidden]'))void window.airProNotch?.show('timer');else if(event.target.closest('.pn-mini-art')&&!event.target.closest('[hidden]'))void window.airProNotch?.show('music');else window.airProNotch?.toggle();
    });
    $('#notch-close').addEventListener('click',()=>{
      window.airProNotch?.close();
    });
    $$('[data-control]').forEach(button=>button.addEventListener('click',()=>{
      if (!state.unlocked)return;
      const action=button.dataset.control;
      if(action==='prev')next(-1);
      if(action==='next')next(1);
      if(action==='toggle'){if(audio.paused)void playTrack(state.currentId);else audio.pause();}
    }));
    $('#import-audio').addEventListener('change',event=>{
      const files=[...event.target.files];event.target.value='';
      void importTracks(files);
    });
    $('#import-cover').addEventListener('change',event=>{
      const file=event.target.files?.[0];event.target.value='';processCover(file);
    });
    audio.addEventListener('play',()=>{
      state.lastId=state.currentId;localStorage.setItem(KEYS.last,state.lastId);const record=current();if(record){record.lastPlayedAt=Date.now();void patchTrack(record.id,{lastPlayedAt:record.lastPlayedAt}).catch(e=>toast(e.message));}
      rememberPosition();renderMedia();
    });
    audio.addEventListener('pause',()=>{
      rememberPosition();renderMedia();
      if(state.pendingReload)void safeReload();
    });
    audio.addEventListener('ended',()=>{rememberPosition();if(repeat)void playTrack(state.currentId);else next(1);});
    audio.addEventListener('timeupdate',()=>{rememberPosition();renderMedia();});
    audio.addEventListener('loadedmetadata',()=>{rememberPosition();renderMedia();});
    audio.addEventListener('error',()=>toast('Audio kann nicht abgespielt werden.'));
    $('#timer-toggle').addEventListener('click',()=>timerAction(false));
    $('#timer-reset').addEventListener('click',()=>timerAction(true));
    $$('[data-minutes]').forEach(button=>button.addEventListener('click',()=>{
      state.timer={duration:Number(button.dataset.minutes)*60,remaining:Number(button.dataset.minutes)*60,endAt:null,done:false};
      saveTimer();tickTimer();
    }));
    $('#event-form').addEventListener('submit',async event=>{
      event.preventDefault();const form=event.currentTarget;
      const data=new FormData(form);
      const title=String(data.get('title')||'').trim().slice(0,100);
      const date=String(data.get('date')||''),hour=String(data.get('time')||'');
      if(!title||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(hour))return;
      const events=getEvents();
      const id=form.dataset.editingId||crypto.randomUUID(),i=events.findIndex(e=>e.id===id),item={id,title,date,time:hour};if(i>=0)events[i]=item;else events.push(item);
      try{await saveEvents(events);delete form.dataset.editingId;form.reset();form.querySelector('button[type=submit]').textContent='Hinzufügen';renderEvents();toast('Termin lokal gespeichert.');}catch(e){toast(e.message);}
    });
    window.addEventListener('offline',networkStatus);
    window.addEventListener('pagehide',event=>{rememberPosition();audio.pause();if(!event.persisted&&state.objectUrl)URL.revokeObjectURL(state.objectUrl);});

  }

  async function start() {
    wire();networkStatus();dateTime();try{await airStore.completeLegacyRestore();}catch(e){toast(e.message);}renderEvents();loadTimer();document.addEventListener('air-storage-blocked',()=>toast('Datenbankupgrade wartet. Bitte alte Air-OS-Tabs schließen; keine Daten werden zurückgesetzt.'));
    let clockJob;const clock=()=>{clearTimeout(clockJob);if(document.hidden)return;dateTime();tickTimer();clockJob=setTimeout(clock,state.timer.endAt?1000:15000);};document.addEventListener('visibilitychange',clock);document.addEventListener('air-timer-schedule',clock);window.addEventListener('pageshow',e=>{if(e.persisted)clock();});window.addEventListener('pagehide',()=>clearTimeout(clockJob),{once:true});clock();
    document.addEventListener('air-transfer-changed',()=>{if(state.pendingReload&&!window.airTransfers?.busy()&&!window.airSpotify?.snapshot().authorizing&&!window.airSecurity?.hasOAuthReturn())void safeReload();});await refreshCalendar();
    try { state.db=await openDB(); await refreshLibrary(); }
    catch(error) {
      toast('Lokaler Musikspeicher nicht verfügbar. Prüfe Safari-Einstellungen und freien Speicherplatz.');
      $('#import-audio').disabled=true;$('#import-cover').disabled=true;
    }
    void setupUpdates();
  }
  window.airIPad=Object.freeze({toast,presentNotice,sessionOpen:()=>state.unlocked,timer:Object.freeze({snapshot:timerSnapshot,toggle:()=>timerAction(false),reset:()=>timerAction(true),setDuration:value=>{if(!Number.isInteger(value)||value<1||value>86400)return;state.timer={duration:value,remaining:value,endAt:null,done:false};saveTimer();tickTimer();document.dispatchEvent(new Event('air-timer-schedule'));},addMinute:()=>{const t=state.timer;if(t.duration>86340||timerSnapshot().remaining>86340)return;t.duration+=60;if(t.endAt)t.endAt+=60000;else t.remaining+=60;t.done=false;saveTimer();tickTimer();document.dispatchEvent(new Event('air-timer-schedule'));}}),calendar:Object.freeze({list:getEvents,refresh:refreshCalendar,filter:options=>{calendarFilter={...calendarFilter,...options};renderEvents();}}),music:Object.freeze({refresh:refreshLibrary,current,record:id=>song(id),visibleIds:()=>visibleRecords().map(r=>r.id),filter:options=>{musicFilter={...musicFilter,...options};renderLibrary();},favorite:async()=>{const t=current();if(t){await patchTrack(t.id,{favorite:!t.favorite});await refreshLibrary();}},shuffle:()=>{shuffle=!shuffle;toast(shuffle?'Shuffle ein':'Shuffle aus');},repeat:()=>{repeat=!repeat;toast(repeat?'Repeat ein':'Repeat aus');},seek:value=>{if(Number.isFinite(audio.duration))audio.currentTime=Math.max(0,Math.min(1,value))*audio.duration;},volume:value=>audio.volume=Math.max(0,Math.min(1,value)),play:playTrack,toggle:()=>audio.paused?playTrack(state.currentId||state.lastId):audio.pause(),next,snapshot:()=>({id:state.currentId,title:current()?.title||'',artist:current()?.artist||'',artwork:current()?.artwork||'',paused:audio.paused,position:audio.currentTime||0,duration:Number.isFinite(audio.duration)?audio.duration:0,tracks:state.records.length,shuffle,repeat})})});
  window.airIPadReady=start();
})();
