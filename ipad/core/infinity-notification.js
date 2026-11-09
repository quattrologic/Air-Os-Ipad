/* AGPL-3.0: adapted lifecycle from InfinityOS adapt.js OSNotification at
 * a6584135cbcad837d57484211119451bbb2d8fb2. Uses the existing Air-OS toast host.
 * Excludes native Notification impersonation, parent injection and permission bypass. */
(()=>{class NotificationView{
 constructor(host,title,options={}){this.host=host;this.options=options;this.closed=false;host._noticeView?.close();host._noticeView=this;host.replaceChildren();const text=document.createElement('span');text.textContent=title;host.append(text);if(options.onclick){const open=document.createElement('button');open.type='button';open.textContent='Öffnen';open.onclick=e=>{this.close();if(typeof options.onclick==='function')options.onclick.call(this,e);};host.append(open);}const close=document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label','Mitteilung schließen');close.onclick=()=>this.close();host.append(close);host.hidden=false;if(options.onshow)options.onshow();if(!options.requireInteraction)this.timeout=setTimeout(()=>this.close(),options.duration??2500);}
 close(){if(this.closed)return;this.closed=true;clearTimeout(this.timeout);if(this.host._noticeView===this){this.host.hidden=true;this.host._noticeView=null;}if(typeof this.options.onclose==='function')this.options.onclose();}
}window.airInfinityNotification=Object.freeze({NotificationView});})();
