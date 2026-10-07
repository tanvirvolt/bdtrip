(()=> {
const $=s=>document.querySelector(s), n=id=>Math.max(0,parseFloat($(id)?.value)||0), money=x=>"৳"+Math.round(x).toLocaleString("bn-BD");
const rates={budget:{travel:1500,hotel:2000,food:600,other:500},mid:{travel:2500,hotel:3500,food:900,other:900},luxury:{travel:4500,hotel:6500,food:1600,other:1500}};
let mode="budget";
function calc(){
 const p=Math.max(1,n("#b_people")),d=Math.max(1,n("#b_days")),rooms=n("#b_rooms"),nights=Math.max(0,d-1),r=rates[mode];
 const travel=r.travel*p,hotel=r.hotel*rooms*nights,food=r.food*p*d,other=r.other*p,total=travel+hotel+food+other;
 $("#o_total").textContent=money(total);$("#o_pp").textContent="প্রতি জন: "+money(total/p);
 $("#s_travel").textContent=money(travel);$("#s_hotel").textContent=money(hotel);$("#s_food").textContent=money(food);$("#s_other").textContent=money(other);
 $("#summary").textContent=d+" দিন · "+p+" জন";
 const vals=[travel,hotel,food,other],sum=vals.reduce((a,b)=>a+b,0);
 vals.forEach((v,i)=>{$("#bar"+(i+1)).style.width=(sum?v/sum*100:0)+"%";$("#pct"+(i+1)).textContent=(sum?(v/sum*100).toFixed(1):0)+"%"});
 const names=["যাতায়াত","থাকা","খাবার","অন্যান্য"];
 $("#details").innerHTML=vals.map((v,i)=>'<div style="display:flex;justify-content:space-between;gap:10px;padding:11px 0;border-bottom:1px solid #edf1ef;font-size:14px"><span>'+names[i]+'</span><b>'+money(v)+'</b></div>').join("");
}
document.querySelectorAll("[data-mode]").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("[data-mode]").forEach(x=>x.classList.remove("active"));b.classList.add("active");mode=b.dataset.mode;calc()}));
document.querySelectorAll("#b_days,#b_people,#b_rooms,#destination").forEach(x=>x.addEventListener("input",calc));
document.querySelector("#calcBtn")?.addEventListener("click",calc);
document.querySelector("#resetBtn")?.addEventListener("click",()=>{$("#b_days").value=3;$("#b_people").value=2;$("#b_rooms").value=1;mode="budget";document.querySelectorAll("[data-mode]").forEach(x=>x.classList.toggle("active",x.dataset.mode==="budget"));calc()});
calc();
})();