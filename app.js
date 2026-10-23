/* Thomduck browser client. All secrets remain on the server. */
const TD_API='/api';
async function tdRequest(path,opts={}){
  const headers={...(opts.body instanceof FormData?{}:{'Content-Type':'application/json'}),...(opts.headers||{})};
  const r=await fetch(TD_API+path,{credentials:'same-origin',...opts,headers});
  const j=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(j.error||'Request failed');
  return j;
}
function getLoggedUser(){try{return JSON.parse(sessionStorage.getItem('td_user')||'null')}catch{return null}}
function setLoggedUser(u){if(u)sessionStorage.setItem('td_user',JSON.stringify(u));else sessionStorage.removeItem('td_user');}
async function refreshLoggedUser(){const r=await tdRequest('/auth/me');setLoggedUser(r.user);return r.user;}
function clearLoggedUser(){sessionStorage.removeItem('td_user')}
async function fetchBin(){return tdRequest('/legacy-view')}
async function saveBin(d){return tdRequest('/legacy-save',{method:'POST',body:JSON.stringify(d)})}
function generateUniqueReferralCode(){return 'TD'+Math.random().toString(36).slice(2,8).toUpperCase()}
function makeCustomerId(){return 'TD-'+Date.now().toString(36).toUpperCase()}
async function logout(){try{await tdRequest('/auth/logout',{method:'POST',body:'{}'})}catch{}clearLoggedUser();location.href='/login.html'}
function setupInstallBanner(){
  if('serviceWorker' in navigator && (location.protocol==='https:' || location.hostname==='localhost' || location.hostname==='127.0.0.1'))navigator.serviceWorker.register('/sw.js').catch(()=>{});
  let deferred=null;
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;showInstallPrompt(()=>{if(deferred){deferred.prompt();deferred=null}})});
  if(/iPhone|iPad|iPod/i.test(navigator.userAgent)&&!navigator.standalone)showInstallPrompt(()=>alert('To install Thomduck: tap Share, then Add to Home Screen.'));
}
function showInstallPrompt(onInstall){if(document.getElementById('td-install'))return;const b=document.createElement('div');b.id='td-install';b.style='position:fixed;z-index:99999;bottom:14px;left:14px;right:14px;background:#071a3d;color:#fff;border:1px solid #d9ad35;border-radius:14px;padding:14px;box-shadow:0 10px 40px #0008;font:14px system-ui';b.innerHTML='<b style="color:#d9ad35">Install Thomduck</b><div style="margin:6px 0 10px">Add Thomduck to your home screen for quick access on Android, iPhone or iPad.</div><button id="td-install-now" style="background:#d9ad35;color:#071a3d;border:0;padding:9px 14px;border-radius:8px;font-weight:700">Install / Instructions</button> <button id="td-install-close" style="background:transparent;color:white;border:1px solid #fff6;padding:8px 12px;border-radius:8px">Later</button>';document.body.appendChild(b);document.getElementById('td-install-now').onclick=onInstall;document.getElementById('td-install-close').onclick=()=>b.remove()}
function mountRewardTools(){if(!getLoggedUser()||document.getElementById('td-reward-tools')||/admin\.html/.test(location.pathname))return;const box=document.createElement('section');box.id='td-reward-tools';box.style='position:fixed;z-index:9998;right:14px;bottom:14px;width:min(320px,calc(100vw - 28px));background:#0b2452;color:#fff;border:1px solid #d9ad35;border-radius:16px;padding:14px;box-shadow:0 12px 36px #0008;font:14px system-ui';box.innerHTML='<div style="font-weight:800;color:#d9ad35;margin-bottom:10px">Thomduck Rewards</div><button id="td-open-gift" style="width:100%;padding:10px;margin:3px 0;background:#d9ad35;color:#071a3d;border:0;border-radius:9px;font-weight:800">Claim Gift</button><button id="td-daily" style="width:100%;padding:10px;margin:3px 0;background:#fff;color:#071a3d;border:0;border-radius:9px;font-weight:800">Claim Daily ₦1,000</button><div id="td-reward-msg" aria-live="polite" style="margin-top:8px;color:#dce6f7"></div>';document.body.appendChild(box);document.getElementById('td-open-gift').onclick=()=>{const code=prompt('Enter your Thomduck gift code');if(code)tdClaimGift(code)};document.getElementById('td-daily').onclick=async()=>{const m=document.getElementById('td-reward-msg');m.textContent='Processing claim…';try{const r=await tdClaimDaily();m.textContent='₦'+Number(r.amount).toLocaleString('en-NG')+' added. Next claim in 24 hours.';const u=getLoggedUser();if(u){u.balance=r.balance;setLoggedUser(u)} }catch(e){m.textContent=e.message}}}
async function tdClaimGift(code){const m=document.getElementById('td-reward-msg');if(m)m.textContent='Checking gift code…';try{const r=await tdRequest('/gifts/claim',{method:'POST',body:JSON.stringify({code})});if(m)m.textContent='₦'+Number(r.amount).toLocaleString('en-NG')+' gift claimed. Remaining claims: '+r.remaining+'.';const u=getLoggedUser();if(u){u.balance=r.balance;setLoggedUser(u)}return r}catch(e){if(m)m.textContent=e.message;throw e}}
async function tdClaimDaily(){return tdRequest('/rewards/daily/claim',{method:'POST',body:'{}'})}
async function tdSubmitPurchase(formData){return tdRequest('/purchases',{method:'POST',body:formData})}
/* Client-side idle timeout is UX only; server sessions must also be configured to expire. */
(function(){if(/login|signup|index\.html?$/.test(location.pathname))return;let timer;const isAdmin=/admin\.html?$/.test(location.pathname);const endSession=async()=>{try{await tdRequest(isAdmin?'/admin/logout':'/auth/logout',{method:'POST',body:'{}'})}catch{}clearLoggedUser();if(isAdmin){location.reload()}else{location.replace('/login.html')}};const reset=()=>{clearTimeout(timer);timer=setTimeout(endSession,60000)};['mousemove','keydown','click','touchstart','scroll'].forEach(e=>document.addEventListener(e,reset,{passive:true}));document.addEventListener('visibilitychange',()=>{if(!document.hidden)reset()});reset()})();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{setupInstallBanner();mountRewardTools()});else{setupInstallBanner();mountRewardTools()}
