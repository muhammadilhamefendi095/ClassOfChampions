/* Sinkronisasi guru dan murid lewat Firebase Realtime Database.
   Pasang: <script src="champions-sync.js"></script> setelah <script src="champions-ui.js"></script> (sebelum </body>). */
(()=>{
const CFG={apiKey:"AIzaSyAMlNEYKTyadvrW4b2YOqggthexCG_vn24",authDomain:"clash-of-champion.firebaseapp.com",
 databaseURL:"https://clash-of-champion-default-rtdb.asia-southeast1.firebasedatabase.app",projectId:"clash-of-champion",
 storageBucket:"clash-of-champion.firebasestorage.app",messagingSenderId:"590446266888",appId:"1:590446266888:web:6dda85b652893a453c9fbd"};
const PATH='quest/v1/state'; /* ganti angka versi (v1 -> v2) untuk memulai data baru yang bersih */

const badge=document.createElement('div');
badge.style.cssText='position:fixed;left:10px;bottom:10px;z-index:60;font:800 12px Nunito,system-ui,sans-serif;padding:4px 10px;border-radius:99px;background:#0d2347;color:#eaf4ff;border:1px solid #2c5da8;opacity:.92';
badge.textContent='⏳ Menghubungkan…';document.body.appendChild(badge);
const setBadge=t=>{badge.textContent=t};

/*PURE-START*/
const arr=x=>Array.isArray(x)?x.filter(e=>e!=null):(x&&typeof x==='object'?Object.values(x):[]);
const mapx=x=>{const o={};if(x&&typeof x==='object')Object.keys(x).forEach(k=>{if(x[k]!=null)o[k]=x[k]});return o};
const nz=x=>x===undefined||(Array.isArray(x)&&!x.length)?null:x;
const isO=x=>x&&typeof x==='object'&&!Array.isArray(x);
function norm(v,d){v=v||{};const b1=v.b1||{},b2=v.b2||{},b3=v.b3||{},st=arr(v.students),tn=arr(v.tn),fin=arr(b3.fin);
 return{pin:v.pin!=null?String(v.pin):d.pin,incB1:v.incB1!=null?+v.incB1:d.incB1,nT:+v.nT||d.nT,tn:tn.length?tn:d.tn,students:st.length?st:d.students,
  open:Object.assign({1:1,2:0,3:0},mapx(v.open)),
  b1:{claims:mapx(b1.claims),att:mapx(b1.att)},
  b2:{cur:b2.cur!=null?+b2.cur:null,ring:b2.ring!=null?+b2.ring:null,tried:arr(b2.tried),done:mapx(b2.done)},
  b3:{fin:fin.length?fin:null,turn:+b3.turn||0,relay:b3.relay||null,done:mapx(b3.done),pts:mapx(b3.pts),ended:+b3.ended||0}}}
function diff(a,b,p,out){
 if(isO(a)){const bb=isO(b)?b:{};
  Object.keys(a).forEach(k=>diff(a[k],bb[k],p?p+'/'+k:k,out));
  Object.keys(bb).forEach(k=>{if(!(k in a))out[p?p+'/'+k:k]=null})}
 else if(JSON.stringify(nz(a))!==JSON.stringify(nz(b)))out[p]=nz(a)}
const strip=s=>{const o={};['pin','incB1','nT','tn','students','open','b1','b2','b3'].forEach(k=>o[k]=s[k]);return o};
/*PURE-END*/

let R=null,ref=null,dirty=false;
const origSave=window.save;
function push(){if(!R||!ref)return;const out={};diff(strip(S),R,'',out);
 if(Object.keys(out).length)ref.update(out).catch(e=>{console.warn(e);setBadge('⚠️ Gagal menyimpan')})}
const typing=()=>{const el=document.activeElement;return el&&/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)&&document.getElementById('app').contains(el)};
function refresh(){if(typing()){dirty=true;return}render()}
document.addEventListener('focusout',()=>{if(dirty)setTimeout(()=>{if(!typing()){dirty=false;render()}},60)});

function apply(v){
 const prevRing=S&&S.b2?S.b2.ring:null;
 R=norm(v,defS());const snd=S.snd;
 Object.keys(R).forEach(k=>{S[k]=JSON.parse(JSON.stringify(R[k]))});S.snd=snd;
 origSave();
 if(R.b2.ring!=null&&R.b2.ring!==prevRing){try{sndBell()}catch(e){}}
 refresh()}

function load(src){return new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s)})}
function start(){
 firebase.initializeApp(CFG);const db=firebase.database();ref=db.ref(PATH);
 window.save=function(){origSave();push()};
 db.ref('.info/connected').on('value',s=>setBadge(s.val()?'🟢 Online':'🔴 Offline'));
 ref.on('value',snap=>{const v=snap.val();
  if(v==null&&!R){R=norm(null,defS());push();return}  /* database masih kosong: kirim data lokal */
  apply(v)},e=>{console.warn(e);setBadge('⚠️ Akses ditolak (cek Rules)')})}
const V='10.12.2',G='https://www.gstatic.com/firebasejs/'+V+'/';
load(G+'firebase-app-compat.js').then(()=>load(G+'firebase-database-compat.js')).then(start)
 .catch(()=>setBadge('⚠️ Tanpa sinkron (internet/Firebase tidak terjangkau)'));
})();
