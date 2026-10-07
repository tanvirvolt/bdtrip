(() => {
const M = {
"প্রধান মেনু":"Main menu","বাংলাদেশের ৬৪ জেলার ট্রাভেল ম্যাপ, জেলা গাইড ও ট্রিপ প্ল্যানিং টুল।":"Bangladesh travel map, district guides and trip planning tools.","ম্যাপ":"Map","জেলা গাইড":"District Guide","প্ল্যানার":"Planner","জার্নাল":"Journal","বাজেট":"Budget","চেকলিস্ট":"Checklist","প্রশ্নোত্তর":"FAQ","জেলা খুঁজুন":"Find a district",
"৬৪ জেলা · ৮ বিভাগ · সম্পূর্ণ ফ্রি":"64 districts · 8 divisions · Completely free","বাংলাদেশের কতটুকু ঘুরে দেখেছেন?":"How much of Bangladesh have you explored?",
"ম্যাপ বানানো শুরু করুন":"Start My Travel Map","জেলা গাইড দেখুন":"Explore District Guides","আপনার ভ্রমণ লেভেল":"Your travel level","নতুন ভ্রমণকারী":"New Traveler","প্রথম জেলাটি বেছে নিন":"Choose your first district",
"জেলা বাছাই":"Choose districts","সব ঘুরেছি":"Mark all visited","সব মুছুন":"Clear all","কোনো জেলা পাওয়া যায়নি।":"No districts found.",
"ঘুরেছি":"Visited","ঘুরতে চাই":"Want to visit","রঙ":"Theme","আপনার ছবি যোগ করুন":"Add your photo","ছবি সরান":"Remove photo","আপনার নাম (ঐচ্ছিক)":"Your name (optional)","জেলার নাম দেখান":"Show district names",
"মোড বেছে নিয়ে তালিকা বা ম্যাপে ক্লিক করুন। আবার ক্লিক করলে মুছে যাবে। কোনো জেলায় ক্লিক করলে নিচে":"Choose a mode and click a district in the list or map. Click again to remove it. Selecting a district shows its",
"জেলা গাইড":"district guide below.","ম্যাপ · ভ্রমণ ম্যাপ":"Map · Travel map","ম্যাপ · ভ্রমণ ম্যাপ":"Map · Travel map","আমার বাংলাদেশ":"My Bangladesh","সম্পন্ন":"complete","ম্যাপ সেভ করুন বা শেয়ার করুন":"Save or Share Your Map",
"ছবি হিসেবে রাখুন, অথবা বন্ধুদের সাথে আপনার ভ্রমণ অগ্রগতি শেয়ার করুন।":"Save it as an image or share your travel progress with friends.",
"ম্যাপ সেভ":"Save map","বন্ধুদের সাথে শেয়ার":"Share with friends","ম্যাপ শেয়ার করুন":"Share my map","লিংক কপি":"Copy link","টেক্সট কপি":"Copy text",
"রেডি টেমপ্লেট":"Ready templates","জেলা গাইড":"District Guide","বিভাগ অনুযায়ী অগ্রগতি":"Progress by division",
"একটি জেলা বেছে নিন, এখানে তার গাইড দেখাবে।":"Choose a district to see its guide here.","আমার ট্রিপ লিস্ট":"My trip list","৬৪ জেলার পূর্ণ ভ্রমণ গাইড":"Complete guides for all 64 districts",
"ঘোরার জায়গা":"Places to visit","সেরা সময়":"Best time","বিখ্যাত খাবার":"Famous food","তথ্যসূত্র":"Sources",
"ম্যাপে যোগ করুন":"Add to map","ম্যাপে":"Map","ডার্ক মোড":"Dark mode"
};
const attr={};
function walk(root=document.body){
const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
const nodes=[]; while(w.nextNode()) nodes.push(w.currentNode);
for(const n of nodes){
 const t=n.nodeValue.trim(); if(!t) continue;
 if(M[t]) n.nodeValue=n.nodeValue.replace(t,M[t]);
}
document.querySelectorAll('input[placeholder],button[aria-label],a[aria-label],svg[aria-label]').forEach(el=>{
 for(const a of ['placeholder','aria-label']) if(el.getAttribute(a)&&M[el.getAttribute(a)]) el.setAttribute(a,M[el.getAttribute(a)]);
});
}
localStorage.setItem("bdtrip_lang","en");
walk();
new MutationObserver(()=>walk()).observe(document.body,{subtree:true,childList:true});
})();