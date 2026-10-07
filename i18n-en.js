(() => {
  const UI = {
    "প্রধান মেনু":"Main menu","ম্যাপ":"Map","জেলা গাইড":"District Guide","প্ল্যানার":"Planner","জার্নাল":"Journal","বাজেট":"Budget","চেকলিস্ট":"Checklist","প্রশ্নোত্তর":"FAQ","জেলা খুঁজুন":"Find a district",
    "৬৪ জেলা · ৮ বিভাগ · সম্পূর্ণ ফ্রি":"64 districts · 8 divisions · Completely free","বাংলাদেশের":"Bangladesh's","কতটুকু":"how much","ঘুরে দেখেছেন?":"have you explored?",
    "ম্যাপ বানানো শুরু করুন":"Start My Travel Map","জেলা গাইড দেখুন":"Explore District Guides","আপনার ভ্রমণ লেভেল":"Your travel level","নতুন ভ্রমণকারী":"New Traveler","প্রথম জেলাটি বেছে নিন":"Choose your first district",
    "জেলা বাছাই":"Choose districts","সব ঘুরেছি":"Mark all visited","সব মুছুন":"Clear all","কোনো জেলা পাওয়া যায়নি।":"No districts found.",
    "ঘুরেছি":"Visited","ঘুরতে চাই":"Want to visit","রঙ":"Theme","আপনার ছবি যোগ করুন":"Add your photo","ছবি সরান":"Remove photo","আপনার নাম (ঐচ্ছিক)":"Your name (optional)","জেলার নাম দেখান":"Show district names",
    "মোড বেছে নিয়ে তালিকা বা ম্যাপে ক্লিক করুন। আবার ক্লিক করলে মুছে যাবে। কোনো জেলায় ক্লিক করলে নিচে":"Choose a mode and click a district in the list or map. Click again to remove it. Selecting a district shows its",
    "ম্যাপ সেভ করুন বা শেয়ার করুন":"Save or Share Your Map","ছবি হিসেবে রাখুন, অথবা বন্ধুদের সাথে আপনার ভ্রমণ অগ্রগতি শেয়ার করুন।":"Save it as an image or share your travel progress with friends.",
    "ম্যাপ সেভ":"Save map","বন্ধুদের সাথে শেয়ার":"Share with friends","ম্যাপ শেয়ার করুন":"Share my map","লিংক কপি":"Copy link","টেক্সট কপি":"Copy text","রেডি টেমপ্লেট":"Ready templates",
    "বিভাগ অনুযায়ী অগ্রগতি":"Progress by division","একটি জেলা বেছে নিন, এখানে তার গাইড দেখাবে।":"Choose a district to see its guide here.","আমার ট্রিপ লিস্ট":"My trip list","৬৪ জেলার পূর্ণ ভ্রমণ গাইড":"Complete guides for all 64 districts",
    "ডার্ক মোড":"Dark mode","জেলা":"district","বিভাগ":"division","সম্পন্ন":"complete","টি জেলা ভ্রমণ":"districts visited","টি বিভাগ সম্পূর্ণ":"divisions complete",
    "সব ৬৪ জেলা ঘোরা শেষ, অভিনন্দন!":"You have explored all 64 districts. Congratulations!","ঘুরতে চাই":"Want to visit",
    "এখনো বাছাই হয়নি":"Not selected yet","ঘোরার জায়গা":"Places to visit","ভ্রমণের সেরা সময়":"Best time to visit","বিখ্যাত খাবার ও পণ্য":"Famous food & products",
    "ঢাকা থেকে যাওয়ার সাধারণ উপায়":"Typical route from Dhaka","তথ্যসূত্র":"Sources","কাছের জেলা":"Nearby districts","ম্যাপে যোগ করুন":"Add to map",
    "ম্যাপ":"Map","ভ্রমণ ম্যাপ":"Travel Map","আমার বাংলাদেশ":"My Bangladesh","আমার ভ্রমণ মানচিত্র":"My Travel Map",
    "তৈরি হচ্ছে...":"Creating...","ডাউনলোড করা যায়নি।":"Download failed.","আপনার প্রোফাইল ছবি":"Your profile photo"
  };

  const districts = new Map((window.BD_DATA?.districts || []).map(d => [d.bn, d.en]));
  const divisions = new Map((window.BD_DATA?.divisions || []).map(d => [d.bn, d.en]));
  const levels = {"নতুন ভ্রমণকারী":"New Traveler","ঘুরতে শুরু":"Getting Started","পথের সাথী":"Travel Companion","অভিযাত্রী":"Explorer","দেশ-দর্শক":"Country Explorer","প্রায় সারা দেশ":"Almost All of Bangladesh","বাংলাদেশ জয়ী":"Bangladesh Champion"};

  function translateText(text) {
    let t = text;
    if (!t.trim()) return t;
    if (districts.has(t.trim())) return text.replace(t.trim(), districts.get(t.trim()));
    if (divisions.has(t.trim())) return text.replace(t.trim(), divisions.get(t.trim()) + " Division");
    if (levels[t.trim()]) return text.replace(t.trim(), levels[t.trim()]);
    if (UI[t.trim()]) return text.replace(t.trim(), UI[t.trim()]);
    for (const [bn,en] of Object.entries(UI)) {
      if (t.includes(bn)) t = t.split(bn).join(en);
    }
    return t;
  }

  function apply(root=document.body) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const n of nodes) {
      const old = n.nodeValue;
      const next = translateText(old);
      if (next !== old) n.nodeValue = next;
    }
    root.querySelectorAll?.('input[placeholder],button[aria-label],a[aria-label],svg[aria-label],img[alt]').forEach(el => {
      for (const a of ['placeholder','aria-label','alt']) {
        const v = el.getAttribute(a);
        if (v) el.setAttribute(a, translateText(v));
      }
    });
    root.querySelectorAll?.('.chip, .wtag, .g-title h3, .g-title small, .d-row span, #heroLevel').forEach(el => {
      if (el.childElementCount === 0) {
        const v = el.textContent;
        el.textContent = translateText(v);
      }
    });
  }

  localStorage.setItem("bdtrip_lang","en");
  apply();
  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      if (m.type === "childList") m.addedNodes.forEach(n => { if (n.nodeType === 1) apply(n); });
      else if (m.type === "characterData") {
        const next = translateText(m.target.nodeValue);
        if (next !== m.target.nodeValue) m.target.nodeValue = next;
      }
    }
  });
  observer.observe(document.body, {subtree:true, childList:true, characterData:true});
})();