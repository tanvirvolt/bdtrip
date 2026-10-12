(() => {
'use strict';
const D=window.BD_DATA;
const KEY='bdtrip_plan_v1';
const $=s=>document.querySelector(s);
const bn=n=>String(n).replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[d]);
const money=n=>'৳'+Math.round(Number(n)||0).toLocaleString('bn-BD');
const blank=()=>({title:'',days:[],budget:{travel:0,hotel:0,food:0,other:0}});
let plan=blank(),saveTimer;
try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved&&Array.isArray(saved.days))plan={...blank(),...saved,budget:{...blank().budget,...(saved.budget||{})}};}catch(_){}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function toast(msg){let x=$('#plannerToast');if(!x){x=document.createElement('div');x.id='plannerToast';x.style='position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:99;background:#0b3d3a;color:#fff;padding:11px 16px;border-radius:12px;box-shadow:0 10px 30px #0003;font-weight:700';document.body.appendChild(x)}x.textContent=msg;x.hidden=false;clearTimeout(x._t);x._t=setTimeout(()=>x.hidden=true,2400)}
function status(msg){const el=$('#saveStatus');if(el)el.textContent=msg}
function total(){return ['travel','hotel','food','other'].reduce((s,k)=>s+Math.max(0,Number(plan.budget[k])||0),0)}
function persist(silent=true){try{localStorage.setItem(KEY,JSON.stringify(plan));status('✓ এই ডিভাইসে সেভ');if(!silent)toast('ট্রিপ প্ল্যান সেভ হয়েছে।');return true}catch(_){status('সেভ হয়নি');if(!silent)toast('প্ল্যান সেভ করা যায়নি—ব্রাউজার স্টোরেজ পরীক্ষা করুন।');return false}}
function scheduleSave(){status('সেভ হচ্ছে…');clearTimeout(saveTimer);saveTimer=setTimeout(()=>persist(true),350)}
function render(){
$('#plannerTitle').value=plan.title||'';
$('#plannerDays').innerHTML=plan.days.map((day,i)=>`<div class="day"><div class="day-head"><b>দিন ${bn(i+1)}</b><button class="remove" type="button" data-remove="${i}" aria-label="দিন মুছুন">×</button></div><div class="day-fields"><select class="select" data-district="${i}"><option value="">জেলা বেছে নিন</option>${D.districts.map(d=>`<option value="${d.id}" ${Number(day.district)===d.id?'selected':''}>${esc(d.bn)} — ${esc(d.en)}</option>`).join('')}</select><input class="input" data-date="${i}" type="date" value="${esc(day.date||'')}"><textarea class="note" data-note="${i}" rows="3" maxlength="500" placeholder="আজ কী করবেন? কোথায় থাকবেন?">${esc(day.note||'')}</textarea></div></div>`).join('');
$('#plannerEmpty').hidden=plan.days.length>0;
document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{plan.days.splice(Number(b.dataset.remove),1);render();scheduleSave()});
document.querySelectorAll('[data-district]').forEach(x=>x.onchange=()=>{plan.days[Number(x.dataset.district)].district=Number(x.value)||null;refreshStats();scheduleSave()});
document.querySelectorAll('[data-date]').forEach(x=>x.onchange=()=>{plan.days[Number(x.dataset.date)].date=x.value;scheduleSave()});
document.querySelectorAll('[data-note]').forEach(x=>x.oninput=()=>{plan.days[Number(x.dataset.note)].note=x.value;scheduleSave()});
['travel','hotel','food','other'].forEach(k=>$('#plan'+k[0].toUpperCase()+k.slice(1)).value=plan.budget[k]||'');
$('#planTotal').textContent=money(total());refreshStats();
}
function refreshStats(){const ids=new Set(plan.days.map(d=>Number(d.district)).filter(Boolean));$('#statDistricts').textContent=bn(ids.size);$('#statDays').textContent=bn(plan.days.length);$('#heroDays').textContent=bn(plan.days.length)}
function encode(){const bytes=new TextEncoder().encode(JSON.stringify(plan));let s='';bytes.forEach(b=>s+=String.fromCharCode(b));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function decode(code){try{const s=atob(code.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-code.length%4)%4));return JSON.parse(new TextDecoder().decode(Uint8Array.from(s,c=>c.charCodeAt(0))))}catch(_){return null}}
function validPlan(value){return value&&typeof value==='object'&&Array.isArray(value.days)&&value.days.length<=100&&value.days.every(d=>d&&typeof d==='object')&&(!value.budget||typeof value.budget==='object')}
function normalize(value){return {...blank(),...value,title:String(value.title||'').slice(0,50),days:value.days.map(d=>({district:Number(d.district)||null,date:String(d.date||'').slice(0,10),note:String(d.note||'').slice(0,500)})),budget:{...blank().budget,...(value.budget||{})}}}
const shared=decode(new URLSearchParams(location.search).get('p')||'');if(validPlan(shared)){plan=normalize(shared);try{localStorage.setItem(KEY,JSON.stringify(plan))}catch(_){}}
$('#plannerTitle').oninput=e=>{plan.title=e.target.value.slice(0,50);scheduleSave()};
$('#plannerAdd').onclick=()=>{if(plan.days.length>=60){toast('সর্বোচ্চ ৬০ দিন যোগ করা যাবে।');return}plan.days.push({district:null,date:'',note:''});render();scheduleSave();setTimeout(()=>document.querySelector('.day:last-child')?.scrollIntoView({behavior:'smooth',block:'center'}),50)};
['travel','hotel','food','other'].forEach(k=>$('#plan'+k[0].toUpperCase()+k.slice(1)).oninput=e=>{plan.budget[k]=Math.max(0,Number(e.target.value)||0);$('#planTotal').textContent=money(total());scheduleSave()});
$('#plannerSave').onclick=()=>{clearTimeout(saveTimer);persist(false)};
$('#plannerReset').onclick=()=>{if(confirm('এই প্ল্যানের সব তথ্য রিসেট করবেন?')){plan=blank();render();persist(true);$('#sharePreview').textContent='এখনো লিংক তৈরি হয়নি';toast('প্ল্যান রিসেট হয়েছে।')}};
$('#plannerShare').onclick=async()=>{const url=location.origin+'/planner/?p='+encode();$('#sharePreview').textContent=url;try{await navigator.clipboard.writeText(url);toast('ট্রিপ প্ল্যান লিংক কপি হয়েছে।')}catch(_){prompt('এই লিংকটি কপি করুন:',url)}};
$('#plannerPrint').onclick=()=>{persist(true);window.print()};
$('#plannerBackup').onclick=()=>{const blob=new Blob([JSON.stringify({app:'BDTrip',version:1,exportedAt:new Date().toISOString(),plan},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=(plan.title||'bdtrip-plan').replace(/[^\p{L}\p{N}-]+/gu,'-').slice(0,48)+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('JSON ব্যাকআপ ডাউনলোড হয়েছে।')};
$('#plannerImport').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{const raw=JSON.parse(await file.text());const candidate=raw.plan||raw;if(!validPlan(candidate))throw new Error('invalid');if(!confirm('বর্তমান প্ল্যানের বদলে ব্যাকআপ ইমপোর্ট করবেন?'))return;plan=normalize(candidate);render();persist(true);toast('ব্যাকআপ ইমপোর্ট হয়েছে।')}catch(_){toast('ফাইলটি সঠিক BDTrip JSON ব্যাকআপ নয়।')}finally{e.target.value=''}};
const importBtn=document.createElement('button');importBtn.className='btn';importBtn.type='button';importBtn.textContent='⬆️ JSON ইমপোর্ট';importBtn.onclick=()=>$('#plannerImport').click();$('#plannerBackup').insertAdjacentElement('afterend',importBtn);
$('#yr').textContent=new Date().getFullYear();
render();
})();
