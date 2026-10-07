(() => {
'use strict';
const D=window.BD_DATA;
const KEY='bdtrip_plan_v1';
const $=s=>document.querySelector(s);
const bn=n=>String(n).replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[d]);
const money=n=>'৳'+Math.round(Number(n)||0).toLocaleString('bn-BD');
const blank=()=>({title:'',days:[],budget:{travel:0,hotel:0,food:0,other:0}});
let plan=blank();
try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved&&Array.isArray(saved.days))plan={...blank(),...saved,budget:{...blank().budget,...(saved.budget||{})}};}catch(_){}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function toast(msg){let x=$('#plannerToast');if(!x){x=document.createElement('div');x.id='plannerToast';x.style='position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:99;background:#0b3d3a;color:#fff;padding:11px 16px;border-radius:12px;box-shadow:0 10px 30px #0003;font-weight:700';document.body.appendChild(x)}x.textContent=msg;x.hidden=false;clearTimeout(x._t);x._t=setTimeout(()=>x.hidden=true,2200)}
function total(){return ['travel','hotel','food','other'].reduce((s,k)=>s+(Number(plan.budget[k])||0),0)}
function render(){
$('#plannerTitle').value=plan.title||'';
$('#plannerDays').innerHTML=plan.days.map((day,i)=>`<div class="day"><div class="day-head"><b>দিন ${bn(i+1)}</b><button class="remove" type="button" data-remove="${i}" aria-label="দিন মুছুন">×</button></div><div class="day-fields"><select class="select" data-district="${i}"><option value="">জেলা বেছে নিন</option>${D.districts.map(d=>`<option value="${d.id}" ${Number(day.district)===d.id?'selected':''}>${esc(d.bn)} — ${esc(d.en)}</option>`).join('')}</select><input class="input" data-date="${i}" type="date" value="${esc(day.date||'')}"><textarea class="note" data-note="${i}" rows="3" maxlength="500" placeholder="আজ কী করবেন? কোথায় থাকবেন?">${esc(day.note||'')}</textarea></div></div>`).join('');
$('#plannerEmpty').hidden=plan.days.length>0;
document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{plan.days.splice(Number(b.dataset.remove),1);render()});
document.querySelectorAll('[data-district]').forEach(x=>x.onchange=()=>{plan.days[Number(x.dataset.district)].district=Number(x.value)||null;refreshStats()});
document.querySelectorAll('[data-date]').forEach(x=>x.onchange=()=>{plan.days[Number(x.dataset.date)].date=x.value});
document.querySelectorAll('[data-note]').forEach(x=>x.oninput=()=>{plan.days[Number(x.dataset.note)].note=x.value});
['travel','hotel','food','other'].forEach(k=>$('#plan'+k[0].toUpperCase()+k.slice(1)).value=plan.budget[k]||'');
$('#planTotal').textContent=money(total());refreshStats();
}
function refreshStats(){const ids=new Set(plan.days.map(d=>Number(d.district)).filter(Boolean));$('#statDistricts').textContent=bn(ids.size);$('#statDays').textContent=bn(plan.days.length);$('#heroDays').textContent=bn(plan.days.length)}
function encode(){
const bytes=new TextEncoder().encode(JSON.stringify(plan));let s='';bytes.forEach(b=>s+=String.fromCharCode(b));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function decode(code){try{const s=atob(code.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-code.length%4)%4));return JSON.parse(new TextDecoder().decode(Uint8Array.from(s,c=>c.charCodeAt(0))))}catch(_){return null}}
const shared=decode(new URLSearchParams(location.search).get('p')||'');if(shared&&Array.isArray(shared.days)){plan={...blank(),...shared,budget:{...blank().budget,...(shared.budget||{})}};try{localStorage.setItem(KEY,JSON.stringify(plan))}catch(_){}}
$('#plannerTitle').oninput=e=>{plan.title=e.target.value;};
$('#plannerAdd').onclick=()=>{plan.days.push({district:null,date:'',note:''});render();setTimeout(()=>document.querySelector('.day:last-child')?.scrollIntoView({behavior:'smooth',block:'center'}),50)};
['travel','hotel','food','other'].forEach(k=>$('#plan'+k[0].toUpperCase()+k.slice(1)).oninput=e=>{plan.budget[k]=Number(e.target.value)||0;$('#planTotal').textContent=money(total())});
$('#plannerSave').onclick=()=>{try{localStorage.setItem(KEY,JSON.stringify(plan));toast('ট্রিপ প্ল্যান সেভ হয়েছে।')}catch(_){toast('প্ল্যান সেভ করা যায়নি।')}};
$('#plannerReset').onclick=()=>{if(confirm('এই প্ল্যানের সব তথ্য রিসেট করবেন?')){plan=blank();render();toast('প্ল্যান রিসেট হয়েছে।')}};
$('#plannerShare').onclick=async()=>{const url=location.origin+'/planner/?p='+encode();$('#sharePreview').textContent=url;try{await navigator.clipboard.writeText(url);toast('ট্রিপ প্ল্যান লিংক কপি হয়েছে।')}catch(_){prompt('এই লিংকটি কপি করুন:',url)}};
$('#yr').textContent=new Date().getFullYear();
render();
})();