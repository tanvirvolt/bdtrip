(()=> {
const BASE_ITEMS=[
 {cat:"Documents & Booking",items:["জাতীয় পরিচয়পত্র / আইডি কার্ড","অগ্রিম টিকিট ও হোটেল বুকিং"]},
 {cat:"Electronics",items:["ফোন চার্জার ও পাওয়ার ব্যাংক"]},
 {cat:"Money & Essentials",items:["নগদ টাকা (দূরের এলাকার জন্য)","পানির বোতল ও হালকা খাবার"]},
 {cat:"Health & Safety",items:["প্রয়োজনীয় ওষুধ ও ফার্স্ট এইড"]},
 {cat:"Weather",items:["ছাতা / রেইনকোট","আবহাওয়ার পূর্বাভাস দেখে নেওয়া"]},
 {cat:"Local & Responsible Travel",items:["স্থানীয় নিয়ম ও অনুমতি যাচাই (পাহাড়, দ্বীপ, বনাঞ্চল)"]}
];
const CONTEXT={
 "coxsbazar":[{cat:"Cox's Bazar — Beach Essentials",items:["Beach sandals","Sunscreen","Extra clothes"]}],
 "bandarban":[{cat:"Bandarban — Hill & Rain Essentials",items:["Comfortable shoes","Rain protection","Power bank","Cash"]}],
 "rangamati":[{cat:"Rangamati — Hill & Lake Essentials",items:["Comfortable shoes","Rain protection","Power bank","Cash"]}],
 "khagrachhari":[{cat:"Khagrachhari — Hill Essentials",items:["Comfortable shoes","Rain protection","Power bank","Cash"]}],
 "sajek":[{cat:"Sajek — Hill Essentials",items:["Comfortable shoes","Warm clothes","Rain protection","Power bank","Cash"]}],
 "sundarban":[{cat:"Sundarbans — Nature Essentials",items:["Comfortable shoes","Mosquito repellent","Rain protection","Power bank","ID"]}]
};
function slugText(v){return String(v||"").toLowerCase().replace(/[^a-z0-9]+/g,"").trim()}
function getPlanContext(){
 try{
  const p=JSON.parse(localStorage.getItem("bdtrip_plan_v1")||"null");
  const first=p?.days?.find(d=>d?.district);
  if(!first)return null;
  const d=window.BD_DATA?.districts?.find(x=>Number(x.id)===Number(first.district));
  return d||null;
 }catch(_){return null}
}
function getChecklistItems(){
 const d=getPlanContext();
 if(!d)return {items:BASE_ITEMS,district:null};
 const key=slugText(d.en);
 const extra=CONTEXT[key]||[];
 return {items:[...BASE_ITEMS,...extra],district:d};
}
const context=getChecklistItems();
const items=context.items;const key="bdtrip_chk_v2",list=document.querySelector("#checkList"); let done={};
const contextBox=document.querySelector("#checklistContext");
if(contextBox){
 contextBox.hidden=!context.district;
 if(context.district) contextBox.innerHTML="🧭 <b>"+context.district.bn+"</b> — আপনার Planner থেকে destination-specific checklist যোগ করা হয়েছে।";
}
try{done=JSON.parse(localStorage.getItem(key)||"{}")}catch{}
const flat=items.flatMap(x=>x.items);
function render(){
 list.innerHTML="";
 let count=0;
 items.forEach((group,gi)=>{
  const card=document.createElement("article");card.className="ck-cat";
  const h=document.createElement("h3");h.textContent=group.cat;card.appendChild(h);
  group.items.forEach((t,ii)=>{
   const index=items.slice(0,gi).reduce((n,g)=>n+g.items.length,0)+ii;
   const row=document.createElement("label");row.className="ck-item";
   const cb=document.createElement("input");cb.type="checkbox";cb.checked=!!done[index];
   const span=document.createElement("span");span.textContent=t;
   if(cb.checked){row.classList.add("done");count++}
   cb.addEventListener("change",()=>{done[index]=cb.checked;localStorage.setItem(key,JSON.stringify(done));render()});
   row.append(cb,span);card.appendChild(row);
  });
  list.appendChild(card);
 });
 const total=flat.length,pct=total?Math.round(count/total*100):0;
 const pctEl=document.querySelector("#pct"),bar=document.querySelector("#bar"),countEl=document.querySelector("#countText");
 if(pctEl)pctEl.textContent=pct+"%";if(bar)bar.style.width=pct+"%";if(countEl)countEl.textContent=count+" / "+total+" সম্পন্ন";
}
document.querySelector("#markAll")?.addEventListener("click",()=>{flat.forEach((_,i)=>done[i]=true);localStorage.setItem(key,JSON.stringify(done));render()});
document.querySelector("#clear")?.addEventListener("click",()=>{done={};localStorage.setItem(key,"{}");render()});
document.querySelector("#print")?.addEventListener("click",()=>window.print());
render();
})();