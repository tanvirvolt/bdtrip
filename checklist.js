(()=> {
const items=[
 {cat:"Documents & Booking",items:["জাতীয় পরিচয়পত্র / আইডি কার্ড","অগ্রিম টিকিট ও হোটেল বুকিং"]},
 {cat:"Electronics",items:["ফোন চার্জার ও পাওয়ার ব্যাংক"]},
 {cat:"Money & Essentials",items:["নগদ টাকা (দূরের এলাকার জন্য)","পানির বোতল ও হালকা খাবার"]},
 {cat:"Health & Safety",items:["প্রয়োজনীয় ওষুধ ও ফার্স্ট এইড"]},
 {cat:"Weather",items:["ছাতা / রেইনকোট","আবহাওয়ার পূর্বাভাস দেখে নেওয়া"]},
 {cat:"Local & Responsible Travel",items:["স্থানীয় নিয়ম ও অনুমতি যাচাই (পাহাড়, দ্বীপ, বনাঞ্চল)"]}
];
const key="bdtrip_chk",list=document.querySelector("#checkList"); let done={};
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