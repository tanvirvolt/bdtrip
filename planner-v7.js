(() => {
'use strict';
const KEY='bdtrip_spots_v1';
const $=s=>document.querySelector(s);
const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(_){return {}}};
const write=x=>{try{localStorage.setItem(KEY,JSON.stringify(x))}catch(_){}};
function addPickers(){
 const data=window.BD_DATA,info=window.BD_INFO||{};
 if(!data||!$('#plannerDays'))return;
 document.querySelectorAll('#plannerDays .day').forEach((day,i)=>{
  if(day.querySelector('.spot-picker'))return;
  const select=day.querySelector('[data-district]');
  const d=data.districts.find(x=>Number(x.id)===Number(select&&select.value));
  const places=d&&info[d.en]&&Array.isArray(info[d.en].a)?info[d.en].a:[];
  const saved=read(),picked=Array.isArray(saved[i])?saved[i]:[];
  const box=document.createElement('div');box.className='spot-picker';
  box.innerHTML='<div class="spot-title"><span>📍 দর্শনীয় স্থান বেছে নিন</span><span>'+picked.length+'টি নির্বাচিত</span></div><div class="spot-list">'+(places.length?places.map((p,j)=>'<label class="spot-chip"><input type="checkbox" data-v7-place="'+i+'" data-v7-index="'+j+'" '+(picked.includes(p)?'checked':'')+'><span>'+esc(p)+'</span></label>').join(''):'<span class="spot-empty">প্রথমে জেলা নির্বাচন করুন। এই জেলার গাইডে থাকা স্থানগুলো এখানে দেখাবে।</span>')+'</div>';
  const fields=day.querySelector('.day-fields');if(fields)fields.insertBefore(box,fields.querySelector('[data-note]'));
 });
}
document.addEventListener('change',e=>{
 if(e.target.matches('[data-district]')){const s=read();s[e.target.dataset.district]=[];write(s);setTimeout(addPickers,0)}
 if(e.target.matches('[data-v7-place]')){
  const i=e.target.dataset.v7Place,j=Number(e.target.dataset.v7Index),day=document.querySelectorAll('#plannerDays .day')[i],district=window.BD_DATA.districts.find(d=>Number(d.id)===Number(day.querySelector('[data-district]').value)),places=(district&&window.BD_INFO[district.en]&&window.BD_INFO[district.en].a)||[],p=places[j],s=read(),arr=Array.isArray(s[i])?s[i]:[];
  s[i]=e.target.checked?[...new Set([...arr,p])]:arr.filter(x=>x!==p);write(s);
  const t=e.target.closest('.spot-picker').querySelector('.spot-title span:last-child');t.textContent=s[i].length+'টি নির্বাচিত';
 }
});
new MutationObserver(()=>addPickers()).observe($('#plannerDays'),{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',addPickers);
setTimeout(addPickers,100);
})();