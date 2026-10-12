import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function load(file, name) {
  const code = fs.readFileSync(path.join(root, file), 'utf8');
  const box = {};
  return new Function('window', code + '; return window.' + name + ';')(box);
}

const D = load('data.js', 'BD_DATA');
const INFO = load('info.js', 'BD_INFO');

const esc = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const slug = (value) => String(value)
  .toLowerCase()
  .replace(/['’]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const transport = {
  1: 'ঢাকা থেকে সাধারণভাবে বাস/ট্রেন; গন্তব্য অনুযায়ী স্থানীয় যান লাগে।',
  2: 'ঢাকা থেকে সাধারণভাবে ট্রেন বা দূরপাল্লার বাস; রুট অনুযায়ী সময় বদলায়।',
  3: 'ঢাকা থেকে ট্রেন/বাস; সুন্দরবন বা মোংলা এলাকায় স্থানীয় নৌযান লাগতে পারে।',
  4: 'ঢাকা থেকে বাস বা লঞ্চ; নদীপথের সময়সূচি আগে যাচাই করুন।',
  5: 'ঢাকা থেকে ট্রেন/বাসে সিলেট অঞ্চলে, এরপর স্থানীয় যান।',
  6: 'ঢাকা থেকে বাস/ট্রেন/সড়কপথে; অবস্থান অনুযায়ী রুট আলাদা।',
  7: 'ঢাকা থেকে ট্রেন বা দূরপাল্লার বাসে; পরে স্থানীয় যানবাহন।',
  8: 'ঢাকা থেকে ট্রেন বা বাসে; পরে স্থানীয় বাস/সিএনজি/অটোরিকশা।'
};

function themeFor(d, info) {
  const text = ((info.a || []).join(' ') + ' ' + d.bn).toLowerCase();
  if (/সমুদ্র|সৈকত|সেন্টমার্টিন|উপকূল/.test(text)) {
    return { emoji: '🌊', tag: 'SEA & COAST', c1: '#087f8c', c2: '#35b8c4' };
  }
  if (/পাহাড়|ঝর্ণা|লেক|বগা|সাজেক|আলুটিলা/.test(text)) {
    return { emoji: '⛰️', tag: 'HILLS & ADVENTURE', c1: '#0b5145', c2: '#4c9a76' };
  }
  if (/হাওর|নদী|চর|লঞ্চ|পদ্মা|মেঘনা|যমুনা|ব্রহ্মপুত্র/.test(text)) {
    return { emoji: '🛶', tag: 'RIVERS & WETLANDS', c1: '#175a7a', c2: '#55a6b8' };
  }
  if (/মসজিদ|বিহার|কেল্লা|জাদুঘর|রাজবাড়ী|কুঠিবাড়ি|মাজার|ঐতিহাসিক/.test(text)) {
    return { emoji: '🏛️', tag: 'HISTORY & CULTURE', c1: '#694b28', c2: '#c18b4b' };
  }
  return { emoji: '🌿', tag: 'NATURE & CULTURE', c1: '#17634d', c2: '#72aa63' };
}

function profileFor(d, info) {
  const places = info.a || [];
  const text = (places.join(' ') + ' ' + d.bn).toLowerCase();
  let type = 'প্রকৃতি ও সংস্কৃতি';
  if (/সমুদ্র|সৈকত|সেন্টমার্টিন/.test(text)) type = 'সমুদ্র ও উপকূল';
  else if (/পাহাড়|ঝর্ণা|লেক|বান্দরবান|রাঙ্গামাটি|খাগড়াছড়ি/.test(text)) type = 'পাহাড়, লেক ও অ্যাডভেঞ্চার';
  else if (/হাওর|নদী|চর|লঞ্চ/.test(text)) type = 'নদী, হাওর ও জলভ্রমণ';
  else if (/মসজিদ|মাজার|বিহার|জাদুঘর|রাজবাড়ী|কেল্লা|কুঠিবাড়ি|ঐতিহাসিক/.test(text)) type = 'ইতিহাস ও সংস্কৃতি';

  const duration = places.length >= 5 ? '২–৩ দিন' : places.length >= 3 ? '২ দিন' : '১ দিন';
  const plan = places.slice(0, 4);
  const tips = [
    'ছুটির দিন ও জনপ্রিয় স্পটে ভিড়ের সময় আগে পরিকল্পনা করুন।',
    'যাতায়াতের ভাড়া ও সময়সূচি যাত্রার দিন আবার যাচাই করুন।',
    'প্রকৃতি, নদী, পাহাড় বা বন্যপ্রাণী এলাকায় স্থানীয় নির্দেশনা মেনে চলুন।',
    'পরিচয়পত্র, ফোন চার্জ ও কিছু নগদ টাকা সঙ্গে রাখুন।'
  ];
  const route = transport[d.div] || transport[6];
  const stayArea = /সমুদ্র|সৈকত|সেন্টমার্টিন|কক্সবাজার/.test(text)
    ? 'প্রধান সৈকত/শহরকেন্দ্রের কাছাকাছি থাকলে খাবার, যানবাহন ও ট্যুর অপশন সহজে পাওয়া যায়। দ্বীপ বা দূরবর্তী স্পটে গেলে যাতায়াতের সময়ের সঙ্গে মিলিয়ে থাকা ঠিক করুন।'
    : /পাহাড়|ঝর্ণা|লেক|বান্দরবান|রাঙ্গামাটি|খাগড়াছড়ি|খাগড়াছড়ি/.test(text)
    ? 'জেলা সদর বা অনুমোদিত ট্যুরের মিলনস্থলের কাছাকাছি আবাসন বেছে নিন। দুর্গম স্পটে যাওয়ার আগে গাইড, অনুমতি ও ফেরার যানবাহন নিশ্চিত করুন।'
    : /হাওর|নদী|চর|লঞ্চ|পদ্মা|মেঘনা|যমুনা|ব্রহ্মপুত্র/.test(text)
    ? 'জেলা সদর/ঘাটের কাছে থাকুন, যাতে ভোরের নৌযাত্রা বা দিনের ট্রিপে সহজে পৌঁছানো যায়। নৌভ্রমণের দিন ফেরার নৌযান ও আবহাওয়া আগে নিশ্চিত করুন।'
    : 'প্রথমবার গেলে জেলা সদর বা প্রধান বাস/রেলস্টেশনের কাছাকাছি আবাসন নিন। এতে স্থানীয় পরিবহন, খাবার ও একাধিক দর্শনীয় স্থানে যাতায়াত সহজ হয়।';
  const foodGuide = info.f || 'স্থানীয় বাজার, পরিচিত খাবারের দোকান ও ব্যস্ত রেস্টুরেন্টে জেলার মৌসুমি খাবার ও আঞ্চলিক বিশেষত্ব খুঁজুন। খাবারের উপকরণ, দাম ও খোলার সময় দোকানেই যাচাই করুন।';
  const travelSteps = [
    'প্রথমে আপনার শহর থেকে জেলা সদরের বাস/ট্রেন/লঞ্চ রুট মিলিয়ে টিকিট ও সময়সূচি যাচাই করুন।',
    route,
    'জেলা সদরে পৌঁছে গন্তব্য অনুযায়ী লোকাল বাস, সিএনজি/অটোরিকশা, রিকশা বা অনুমোদিত নৌযান নিন; ওঠার আগে ভাড়া ঠিক করুন।'
  ];
  const budget = /পাহাড়|ঝর্ণা|লেক|সমুদ্র|সৈকত|দ্বীপ|হাওর|নৌকা/.test(text)
    ? 'কম খরচে আনুমানিক ৳১,৫০০–৩,০০০/জন (১ রাত, শেয়ার করা যাতায়াত ও সাধারণ খাবার); নৌকা/গাইড/রিজার্ভ গাড়ি নিলে খরচ বাড়বে।'
    : 'কম খরচে আনুমানিক ৳১,২০০–২,৫০০/জন (১ রাত, সাধারণ আবাসন ও খাবারসহ); যাতায়াতের দূরত্ব, টিকিট ও আবাসনের মান অনুযায়ী খরচ বদলাবে।';
  return { type, duration, plan, tips, route, stayArea, foodGuide, travelSteps, budget };
}

const HOTEL_GUIDES = {
  Coxsbazar: [{n:'Hotel Sea Palace',a:'কলাতলী রোড',t:'সৈকত/শহরকেন্দ্রের কাছাকাছি'},{n:'Hotel Sea Crown',a:'মেরিন ড্রাইভ রোড, কলাতলী',t:'সৈকত এলাকার বিকল্প'}],
  Chattogram: [{n:'Hotel Agrabad',a:'আগ্রাবাদ',t:'ব্যবসায়িক এলাকা'},{n:'Radisson Blu Chattogram Bay View',a:'এসএস খালেদ রোড',t:'উচ্চ বাজেট'},{n:'Hotel Shaikat (Bangladesh Parjatan Corporation)',a:'রেলওয়ে স্টেশন রোড',t:'সরকারি পর্যটন আবাসন'}],
  Dhaka: [{n:'Hotel 71',a:'বিজয়নগর',t:'শহরকেন্দ্র'},{n:'Hotel Purbani International',a:'দিলকুশা',t:'মতিঝিল/দিলকুশা এলাকা'},{n:'Hotel Abakash (Bangladesh Parjatan Corporation)',a:'মহাখালী',t:'সরকারি পর্যটন আবাসন'}],
  Sylhet: [{n:'Hotel Star Pacific',a:'দরগাহ গেট এলাকা',t:'শহরকেন্দ্র'},{n:'Hotel Noorjahan Grand',a:'দরগাহ গেট',t:'শহরকেন্দ্র'},{n:'Grand Sylhet Hotel & Resort',a:'এয়ারপোর্ট রোড',t:'বিমানবন্দর এলাকার বিকল্প'}],
  Bandarban: [{n:'Hotel Hill View',a:'বান্দরবান শহর',t:'শহরভিত্তিক থাকার বিকল্প'},{n:'Hotel Plaza Bandarban',a:'বান্দরবান শহর',t:'শহরকেন্দ্র'},{n:'পর্যটন মোটেল, বান্দরবান',a:'বান্দরবান শহর',t:'সরকারি পর্যটন আবাসন—প্রাপ্যতা যাচাই করুন'}],
  Rangamati: [{n:'Parjatan Holiday Complex, Rangamati',a:'রাঙামাটি শহর/কাপ্তাই লেক এলাকা',t:'সরকারি পর্যটন আবাসন'},{n:'Hotel Sufia International',a:'রাঙামাটি শহর',t:'শহরকেন্দ্রের বিকল্প'}],
  Khagrachhari: [{n:'Parjatan Motel, Khagrachhari',a:'খাগড়াছড়ি শহর',t:'সরকারি পর্যটন আবাসন'},{n:'Hotel Gairing',a:'খাগড়াছড়ি শহর',t:'শহরকেন্দ্রের বিকল্প'}],
  Rajshahi: [{n:'Hotel Nice International',a:'রাজশাহী শহর',t:'শহরকেন্দ্রের বিকল্প'},{n:'Hotel X',a:'রাজশাহী শহর',t:'বুকিংয়ের আগে নাম/ঠিকানা যাচাই করুন'}],
  Khulna: [{n:'Hotel Castle Salam',a:'খুলনা শহর',t:'শহরকেন্দ্র'},{n:'Hotel Royal International',a:'খুলনা শহর',t:'শহরের আবাসন বিকল্প'}],
  Bagerhat: [{n:'Hotel/মোটেল in Mongla',a:'মোংলা শহর',t:'সুন্দরবন/করমজল যাওয়ার আগে অবস্থান অনুযায়ী বুক করুন'}],
  Patuakhali: [{n:'Kuakata Hotel-Motel Zone',a:'কুয়াকাটা সৈকত এলাকা',t:'সৈকত এলাকার আবাসন; নাম ও রুমের অবস্থা যাচাই করুন'}],
  Sunamganj: [{n:'শহরকেন্দ্রের হোটেল/গেস্টহাউস',a:'সুনামগঞ্জ সদর',t:'টাঙ্গুয়ার হাওর ট্রিপের নৌযাত্রা ও ফেরার সময়ের সঙ্গে মিলিয়ে বুক করুন'}],
  Bogura: [{n:'Hotel Naz Garden',a:'ছিলিমপুর, বগুড়া',t:'শহরের আবাসন বিকল্প'}],
  Cumilla: [{n:'শহরকেন্দ্রের হোটেল/গেস্টহাউস',a:'কুমিল্লা সদর',t:'কান্দিরপাড়/শহরকেন্দ্রের কাছাকাছি থাকার বিকল্প'}]
};

function dhakaRoute(d, division, profile) {
  const bn = d.bn;
  const div = division?.bn || '';
  if (/কক্সবাজার|চট্টগ্রাম|বান্দরবান|রাঙামাটি|খাগড়াছড়ি|ফেনী|নোয়াখালী|লক্ষ্মীপুর|চাঁদপুর|কুমিল্লা|ব্রাহ্মণবাড়িয়া/.test(bn)) {
    return [
      'ঢাকা থেকে সরাসরি দূরপাল্লার বাসে যাওয়ার অপশন আগে দেখুন; চট্টগ্রাম/কুমিল্লা করিডরে কিছু গন্তব্যে ট্রেনও সুবিধাজনক হতে পারে।',
      'গন্তব্যভেদে বাসের কাউন্টার ও নামার স্থান আলাদা—টিকিটে লেখা স্টপেজ নিশ্চিত করুন।',
      'বান্দরবান/রাঙামাটি/খাগড়াছড়ির মতো পাহাড়ি গন্তব্যে শেষ অংশে স্থানীয় জিপ/চাঁদের গাড়ি বা অনুমোদিত পরিবহন লাগতে পারে; আবহাওয়া ও স্থানীয় বিধিনিষেধ যাচাই করুন।'
    ];
  }
  if (/সিলেট|মৌলভীবাজার|হবিগঞ্জ|সুনামগঞ্জ/.test(bn)) {
    return [
      'ঢাকা থেকে সিলেটগামী ট্রেন বা বাস বিবেচনা করুন; ট্রেনের টিকিট বাংলাদেশ রেলওয়ের অফিসিয়াল চ্যানেলে যাচাই করুন।',
      'জেলার নাম অনুযায়ী সিলেট শহর বা সংশ্লিষ্ট জেলা সদরে নামার রুট বাছুন; সব গন্তব্যে সিলেট শহর হয়ে যাওয়া সবচেয়ে দ্রুত নাও হতে পারে।',
      'শেষ অংশে লোকাল বাস/সিএনজি/জিপ বা হাওর এলাকায় নৌকা লাগতে পারে; মৌসুম, আবহাওয়া ও ফেরার নৌযান আগে নিশ্চিত করুন।'
    ];
  }
  if (/বরিশাল|পটুয়াখালী|ভোলা|বরগুনা|পিরোজপুর|ঝালকাঠি/.test(bn)) {
    return [
      'ঢাকা থেকে গন্তব্য অনুযায়ী বাস অথবা বরিশাল/দক্ষিণাঞ্চলগামী লঞ্চের রুট তুলনা করুন।',
      'লঞ্চের ঘাট, কেবিন/ডেক, ছাড়ার সময় ও পৌঁছানোর ঘাট টিকিট কেনার আগে নিশ্চিত করুন।',
      'জেলা সদর থেকে উপকূল/দ্বীপে গেলে বাস, স্থানীয় যান বা নৌযানের আলাদা সংযোগ লাগতে পারে।'
    ];
  }
  if (/খুলনা|বাগেরহাট|সাতক্ষীরা|যশোর|ঝিনাইদহ|কুষ্টিয়া|চুয়াডাঙ্গা|মেহেরপুর|নড়াইল|মাগুরা/.test(bn)) {
    return [
      'ঢাকা থেকে খুলনা/যশোর করিডরে বাস বা ট্রেনের রুট তুলনা করুন; নির্দিষ্ট জেলার জন্য কোন স্টেশন সুবিধাজনক তা আগে দেখুন।',
      'টিকিটে উল্লেখিত স্টেশন/বাসস্ট্যান্ডে নামার পর জেলা সদরের সংযোগ পরিবহন নিন।',
      'সুন্দরবন/মোংলা/উপকূলীয় স্পটে গেলে অনুমোদিত ট্যুর অপারেটর, নৌযান ও প্রবেশ-অনুমতির প্রয়োজন আগেই যাচাই করুন।'
    ];
  }
  if (/রাজশাহী|চাঁপাইনবাবগঞ্জ|নওগাঁ|নাটোর|পাবনা|সিরাজগঞ্জ|বগুড়া|জয়পুরহাট/.test(bn)) {
    return [
      'ঢাকা থেকে গন্তব্য অনুযায়ী আন্তঃনগর ট্রেন বা দূরপাল্লার বাস বেছে নিন; গন্তব্যের নিকটতম স্টেশন/বাসস্ট্যান্ড তুলনা করুন।',
      'ট্রেনের টিকিট ও সময়সূচি বাংলাদেশ রেলওয়ের অফিসিয়াল চ্যানেলে এবং বাসের সময় সংশ্লিষ্ট অপারেটরের কাছে যাচাই করুন।',
      'জেলা সদরে নেমে স্থানীয় বাস/সিএনজি/অটোরিকশায় দর্শনীয় স্থানে যান; দূরের স্পট এক দিনে বেশি গুঁজে দেবেন না।'
    ];
  }
  return [
    'ঢাকা থেকে গন্তব্যের জন্য সরাসরি বাস/ট্রেন আছে কি না যাচাই করুন; না থাকলে বিভাগীয় শহর বা কাছের বড় টার্মিনাল হয়ে সংযোগ নিন।',
    'টিকিট কেনার আগে নামার স্টপেজ, যাত্রার সময়, লাগেজের নিয়ম ও ফেরার টিকিট নিশ্চিত করুন।',
    'জেলা সদরে পৌঁছে স্থানীয় বাস/সিএনজি/অটোরিকশা বা প্রয়োজনমতো নৌযান নিন; ভাড়া ওঠার আগে ঠিক করুন।'
  ];
}

const css = `
:root{--g:#0f7a5a;--d:#0b3d3a;--y:#ffb703;--bg:#f4f7f5;--ink:#102c29;--muted:#687a75;--line:#dfe9e4}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:"Hind Siliguri","Noto Sans Bengali",sans-serif;font-size:16px;line-height:1.65}
.dp{width:calc(100% - 48px);max-width:1600px;margin:0 auto;padding:14px 0 50px;box-sizing:border-box}.dpnav{display:flex;align-items:center;gap:18px;padding:11px 16px;background:#fffffff4;backdrop-filter:blur(18px);border:1px solid var(--line);border-radius:18px;box-shadow:0 12px 32px #0b3d3a12;position:sticky;top:10px;z-index:20}
.brand{font-weight:800;color:var(--d);text-decoration:none;white-space:nowrap;font-size:19px}.brand b{color:#f39c00}.dlinks{display:flex;gap:5px;flex:1;justify-content:center}.dlinks a{color:#41534e;text-decoration:none;padding:8px 10px;border-radius:9px;font-size:13px}.dlinks a:hover{background:#e8f5f0;color:var(--g)}
.hero{position:relative;overflow:hidden;margin-top:14px;border-radius:29px;padding:40px;background:linear-gradient(115deg,#0b3d3a,#0f6958 65%,#15906f);color:#fff;min-height:330px;display:flex;align-items:end}.hero:after{content:"";position:absolute;right:-100px;bottom:-190px;width:520px;height:520px;border-radius:50%;border:1px solid #ffffff25;box-shadow:0 0 0 60px #ffffff09,0 0 0 120px #ffffff05}
.hero-copy{position:relative;z-index:2;max-width:700px}.crumb{color:#b9e4d7;font-size:12px;font-weight:700}.hero h1{font-family:"Noto Sans Bengali","Hind Siliguri",sans-serif;font-size:clamp(42px,6vw,68px);line-height:1.04;margin:9px 0 10px}.hero h1 span{color:#ffd34e}.hero p{color:#d6ebe5;max-width:650px;font-size:17px}
.badges{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}.badge{padding:7px 12px;border-radius:999px;background:#ffffff12;border:1px solid #ffffff28;font-size:12px}.hero-map{position:absolute;right:38px;top:25px;width:300px;height:300px;opacity:.18}.hero-map path{fill:#fff;stroke:#fff}
.actions{display:flex;gap:9px;margin-top:18px}.btn{display:inline-flex;text-decoration:none;border-radius:12px;padding:10px 16px;font-weight:700;font-size:13px}.primary{background:var(--y);color:#19352f}.ghost{background:#ffffff14;color:#fff;border:1px solid #ffffff35}
.guide-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:15px 0}.guide-stat{background:#fff;border:1px solid var(--line);border-radius:16px;padding:14px}.guide-stat small{display:block;color:var(--muted);font-size:11px}.guide-stat b{display:block;color:var(--d);font-size:15px;margin-top:2px}
.layout{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:15px}.card{background:#fff;border:1px solid var(--line);border-radius:20px;padding:22px;box-shadow:0 8px 25px #103c3510}.content h2,.side h2{font-size:20px;margin:0 0 13px;color:var(--d)}
.section{padding:0 0 21px;margin-bottom:21px;border-bottom:1px solid #edf1ef}.section:last-child{border-bottom:0;margin-bottom:0}.places{display:grid;grid-template-columns:1fr 1fr;gap:9px}.place{padding:13px 14px;border:1px solid var(--line);border-radius:13px;background:#f8faf9}.place b{font-size:14px}.place small{display:block;color:var(--muted);font-size:11px;margin-top:2px}
.info-row{display:grid;grid-template-columns:42px 1fr;gap:11px;align-items:start;margin:9px 0}.ico{width:38px;height:38px;border-radius:11px;background:#e7f5ef;color:var(--g);display:grid;place-items:center;font-weight:800}.info-row b{display:block;font-size:14px}.info-row p{margin:1px 0;color:#61716c;font-size:13px}
.gallery{display:grid;grid-template-columns:1.6fr 1fr 1fr;gap:8px;margin-bottom:20px}.gallery figure{margin:0;position:relative;overflow:hidden;border-radius:15px;background:#eaf2ef;min-height:145px}.gallery figure:first-child{grid-row:span 2;min-height:300px}.gallery img{width:100%;height:100%;object-fit:cover;display:block}.gallery figcaption{position:absolute;left:8px;right:8px;bottom:8px;padding:6px 9px;border-radius:9px;background:#0b3d3acc;color:#fff;font-size:10px}.overview{background:#eef8f4;border:1px solid #d6ebe3;border-radius:15px;padding:15px;margin-bottom:20px}.overview b{color:var(--d)}.plan,.route-grid,.hotel-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.plan-item{padding:12px;border-radius:13px;background:#f4f8f6;border:1px solid var(--line);font-size:13px}.plan-item span{display:block;color:var(--muted);font-size:11px;margin-top:2px}.tips{display:grid;grid-template-columns:1fr 1fr;gap:8px}.tip-item{padding:11px 12px;background:#f8faf9;border-radius:12px;font-size:12px;color:#536760}
.cover-art{height:220px;margin:-22px -22px 18px;border-radius:20px 20px 0 0;position:relative;overflow:hidden}.cover-glow{position:absolute;width:190px;height:190px;right:12%;top:-65px;border-radius:50%;background:#ffffff28}.cover-title{position:absolute;left:25px;top:24px;color:#fff;z-index:2}.cover-title span{font-size:32px;display:block}.cover-title small{display:block;font-size:10px;letter-spacing:.14em;font-weight:800;color:#ffffffc7;margin-top:4px}.cover-title strong{display:block;font-family:"Noto Sans Bengali","Hind Siliguri",sans-serif;font-size:38px;line-height:1.05;margin-top:2px}.cover-title em{font-style:normal;font-size:12px;color:#ffffffbd}.cover-land{position:absolute;left:-5%;right:-5%;bottom:-8px;height:100px}.cover-land span,.cover-land i,.cover-land b{position:absolute;bottom:0;display:block;background:#ffffff18;border-radius:100% 100% 0 0}.cover-land span{left:4%;width:35%;height:70px;transform:skewX(-18deg)}.cover-land i{left:33%;width:32%;height:105px;transform:skewX(22deg)}.cover-land b{right:5%;width:38%;height:75px;transform:skewX(-14deg)}
.mapbox{background:#f7faf8;border-radius:15px;padding:10px}.mapbox svg{width:100%;height:310px}.mapbox path{fill:#cce8de;stroke:#fff;stroke-width:1}.mapbox path.sel{fill:var(--g);stroke:var(--d);stroke-width:2}.side .btn{width:100%;justify-content:center;margin-top:10px}.near{display:grid;gap:7px;margin-top:8px}.near a{padding:9px 10px;background:#f3f7f5;border-radius:9px;color:#3d554e;text-decoration:none;font-size:13px}.source{font-size:12px}.source a{color:var(--g)}.tip{background:#fff8e6;border:1px solid #f2dda2;border-radius:15px;padding:14px;margin-top:15px}.tip b{color:#9b6a00}.foot{margin-top:15px;padding:16px 20px;background:var(--d);color:#cde0da;border-radius:17px;display:flex;justify-content:space-between;font-size:12px}
@media(max-width:850px){.dlinks{display:none}.hero{padding:30px;min-height:300px}.hero-map{width:230px;height:230px;right:-20px;top:30px}.layout{grid-template-columns:1fr}.side{display:grid;grid-template-columns:1fr 1fr;gap:15px}.side .mapbox{grid-column:1/-1}.places{grid-template-columns:1fr}.guide-strip{grid-template-columns:repeat(2,1fr)}}
@media(max-width:560px){.dp{width:calc(100% - 24px);padding:9px 0 30px}.dpnav{position:static}.hero{border-radius:22px;padding:25px 20px}.hero h1{font-size:42px}.hero-map{opacity:.1}.actions{flex-wrap:wrap}.actions .btn{flex:1;justify-content:center}.card{padding:17px;border-radius:17px}.side{display:block}.plan,.route-grid,.hotel-list,.tips,.guide-strip{grid-template-columns:1fr}.cover-art{margin:-17px -17px 18px}.foot{flex-direction:column;gap:5px}}
`;

const pages = D.districts.map((d) => {
  const division = D.divisions.find((x) => x.id === d.div);
  const info = INFO[d.en] || {};
  const theme = themeFor(d, info);
  const profile = profileFor(d, info);
  const places = info.a?.length ? info.a : ['জেলা ও আশপাশের দর্শনীয় স্থান'];
  // Use stable Wikimedia Commons file redirects instead of image CDN URLs.
  // These are real Bangladesh travel photos and the redirect resolves to the image file.
  const photoSets = {
    coast: [
      'https://commons.wikimedia.org/wiki/Special:Redirect/file/Beautiful%20Bangladesh%20(30836379842).jpg',
      'https://commons.wikimedia.org/wiki/Special:Redirect/file/Beautiful%20Rangamati.jpg',
      'https://commons.wikimedia.org/wiki/Special:Redirect/file/View%20of%20Rangamati.jpg'
    ],
    hills: [
      'https://commons.wikimedia.org/wiki/Special:Redirect/file/Beautiful%20Rangamati.jpg',
      'https://commons.wikimedia.org/wiki/Special:Redirect/file/Hanging%20Bridge%20of%20Rangamati.jpg',
      'https://commons.wikimedia.org/wiki/Special:Redirect/file/Scenic%20pathway%20in%20Sajek,%20Rangamati.jpg'
    ],
    rivers: [
      'https://commons.wikimedia.org/wiki/Special:Redirect/file/View%20of%20Rangamati.jpg',
      'https://commons.wikimedia.org/wiki/Special:Redirect/file/Some%20boats.jpg',
      'https://commons.wikimedia.org/wiki/Special:Redirect/file/Water%20festival%20in%20Kaptai,%20Rangamati,%20Bangladesh.jpg'
    ],
    general: [
      'https://commons.wikimedia.org/wiki/Special:Redirect/file/Beautiful%20Bangladesh%20(30836379842).jpg',
      'https://commons.wikimedia.org/wiki/Special:Redirect/file/Beautiful%20Rangamati.jpg',
      'https://commons.wikimedia.org/wiki/Special:Redirect/file/Some%20boats.jpg'
    ]
  };
  const photoKey = theme.tag === 'SEA & COAST' ? 'coast' : theme.tag === 'HILLS & ADVENTURE' ? 'hills' : theme.tag === 'RIVERS & WETLANDS' ? 'rivers' : 'general';
  const photos = photoSets[photoKey];
  const overview = info.f ? `${d.bn} ভ্রমণে ${info.f} ও স্থানীয় অভিজ্ঞতা যোগ করতে পারেন।` : `${d.bn} ভ্রমণে স্থানীয় খাবার, বাজার ও জেলার নিজস্ব সংস্কৃতি ঘুরে দেখার সুযোগ রাখুন।`;
  const practical = `এই গাইডের স্থানগুলোকে একসাথে ধরে ${profile.duration} সময়ের একটি সহজ itinerary সাজানো যায়। দূরের স্পট হলে যাতায়াতের সময় আলাদা করে ধরুন।`;
  const nearby = D.districts.filter((x) => x.div === d.div && x.id !== d.id).slice(0, 5);
  const map = `<svg viewBox="0 0 ${D.w} ${D.h}" aria-label="${esc(d.bn)} জেলার মানচিত্র"><path class="sel" d="${d.d}"></path></svg>`;
  const sources = (info.src || []).map((x) => `<li><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.name)} ↗</a></li>`).join('') || '<li>জেলা প্রশাসনের সরকারি পোর্টাল</li>';

  const html = `<!doctype html>
<html lang="bn">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.bn)} জেলা ভ্রমণ গাইড | BDTrip</title>
<meta name="description" content="${esc(d.bn)} জেলা ভ্রমণ গাইড—দর্শনীয় স্থান, সেরা সময়, খাবার, যাতায়াত ও কাছের জেলা।">
<link rel="canonical" href="https://bdtrip.vercel.app/district/${slug(d.en)}/">
<link rel="icon" href="/api/favicon">
<link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/navbar.css">
<link rel="stylesheet" href="/design-tokens.css">
<style>${css}
body.dark{background:#071C19!important;color:#DFF5ED!important}body.dark .top{background:#0B2925!important;border-color:#21453E!important}body.dark .crumb,body.dark .hero p,body.dark .note,body.dark .footer{color:#9DBAB2!important}body.dark .card{background:#0B2925!important;border-color:#21453E!important;color:#DFF5ED!important}body.dark .card h2,body.dark .hero h1{color:#9DE0C7!important}body.dark .fact{border-color:#21453E!important}body.dark .cta{background:#0F8A61!important}</style>
</head>
<body>
<div id="bdtrip-nav"></div>
<div class="dp">
<main>
<section class="hero">
<div class="hero-copy">
<div class="crumb">BANGLADESH DISTRICT GUIDE · ${esc(division?.bn || '')} বিভাগ</div>
<h1>${esc(d.bn)} <span>জেলা</span></h1>
<p>${esc(d.bn)}-এর দর্শনীয় স্থান, ভ্রমণের সেরা সময়, খাবার, যাতায়াত ও কাছের জেলার তথ্য—সব এক জায়গায়।</p>
<div class="badges"><span class="badge">📍 ${esc(division?.bn || '')} বিভাগ</span><span class="badge">🇧🇩 বাংলাদেশ</span><span class="badge">✦ BDTrip Guide</span></div>
<div class="actions"><a class="btn primary" href="/?district=${d.id}&mark=v#tool">✓ ঘুরেছি</a><a class="btn ghost" href="/?district=${d.id}&mark=w#tool">★ ঘুরতে চাই</a></div>
</div>
<div class="hero-map">${map}</div>
</section>

<div class="guide-strip">
<div class="guide-stat"><small>ভ্রমণের ধরন</small><b>${esc(profile.type)}</b></div>
<div class="guide-stat"><small>প্রস্তাবিত সময়</small><b>${esc(profile.duration)}</b></div>
<div class="guide-stat"><small>দর্শনীয় স্থান</small><b>${places.length}টি তালিকাভুক্ত</b></div>
<div class="guide-stat"><small>গাইড</small><b>BDTrip Travel Guide</b></div>
</div>

<div class="layout">
<article class="card content">
<div class="cover-art" style="background:linear-gradient(135deg,${theme.c1},${theme.c2})">
<div class="cover-glow"></div>
<div class="cover-title"><span>${theme.emoji}</span><small>${theme.tag}</small><strong>${esc(d.bn)}</strong><em>${esc(division?.bn || '')} বিভাগ · বাংলাদেশ</em></div>
<div class="cover-land"><span></span><i></i><b></b></div>
</div>

<div class="gallery">
<figure><img src="${photos[0]}" alt="${esc(d.bn)} ভ্রমণ ছবি" loading="eager" referrerpolicy="no-referrer" onerror="this.style.display='none'"><figcaption>${esc(d.bn)} · Travel Photo</figcaption></figure>
<figure><img src="${photos[1]}" alt="${esc(d.bn)} travel photo" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none'"><figcaption>Explore ${esc(d.bn)}</figcaption></figure>
<figure><img src="${photos[2]}" alt="${esc(d.bn)} Bangladesh" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none'"><figcaption>Bangladesh</figcaption></figure>
</div>
<div class="overview"><b>📝 জেলা সম্পর্কে</b><br><span>${esc(overview)}</span><br><small>${esc(practical)}</small></div><section class="section"><h2>🌿 ঘুরে দেখার জায়গা</h2><div class="places">
${places.map((p) => `<div class="place"><b>${esc(p)}</b><small>দর্শনীয় স্থান</small></div>`).join('')}
</div></section>

<section class="section"><h2>🧭 ভ্রমণ তথ্য</h2>
<div class="info-row"><span class="ico">☀</span><div><b>ভ্রমণের সেরা সময়</b><p>${esc(info.s || 'অক্টোবর–মার্চ')}</p></div></div>
<div class="info-row"><span class="ico">🍽</span><div><b>বিখ্যাত খাবার ও পণ্য</b><p>${esc(info.f || 'স্থানীয় খাবার ও পণ্য; যাওয়ার আগে যাচাই করুন।')}</p></div></div>
<div class="info-row"><span class="ico">🚌</span><div><b>কীভাবে যাবেন</b><p>${esc(transport[d.div] || transport[6])}</p></div></div>
</section>

<section class="section"><h2>🚌 ঢাকা থেকে কীভাবে যাবেন</h2><div class="route-grid">${profile.travelSteps.map((step,i)=>`<div class="plan-item"><b>${['১. ঢাকা থেকে মূল যাত্রা','২. কোথায় নামবেন','৩. শেষ অংশের যাত্রা'][i]}</b><span>${esc(step)}</span></div>`).join('')}</div><div class="tip"><b>টিকিট ও রুট যাচাই</b><br><span>সময়সূচি/ভাড়া পরিবর্তনশীল। ট্রেনের জন্য <a href="https://eticket.railway.gov.bd/" target="_blank" rel="noopener">বাংলাদেশ রেলওয়ে e-ticket</a>, আর বাস/লঞ্চের জন্য সংশ্লিষ্ট অপারেটরের অফিসিয়াল চ্যানেল দেখুন।</span><br><a href="https://www.google.com/maps/dir/Dhaka/${encodeURIComponent(d.bn+' Bangladesh')}" target="_blank" rel="noopener">ঢাকা থেকে Google Maps route দেখুন ↗</a></div></section>

<section class="section"><h2>🏨 কোথায় থাকবেন — হোটেল গাইড</h2><p>নিচের নামগুলো সম্ভাব্য শুরু করার তালিকা, রিয়েল-টাইম availability বা endorsement নয়। বুকিংয়ের আগে বর্তমান ঠিকানা, ফোন, রুমের দাম, রিভিউ ও বাতিল নীতি নিজে যাচাই করুন।</p><div class="hotel-list">${(HOTEL_GUIDES[d.en] || []).map(h=>`<div class="plan-item"><b>${esc(h.n)}</b><span>📍 ${esc(h.a)} · ${esc(h.t)}</span><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.n+' '+h.a+' '+d.bn+' Bangladesh')}" target="_blank" rel="noopener">ম্যাপে খুঁজুন ↗</a></div>`).join('') || `<div class="plan-item"><b>${esc(d.bn)} সদরের আবাসন</b><span>নির্দিষ্ট হোটেল ও সাম্প্রতিক রিভিউ দেখতে ম্যাপ সার্চ ব্যবহার করুন।</span><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('hotels in '+d.bn+' Bangladesh')}" target="_blank" rel="noopener">এই জেলার হোটেল খুঁজুন ↗</a></div>`}<div class="plan-item"><b>সরকারি পর্যটন আবাসন</b><span>সরকারি হোটেল/মোটেলের নাম ও বুকিং তথ্য যাচাই করুন।</span><a href="https://hotels.gov.bd/" target="_blank" rel="noopener">সরকারি বুকিং পোর্টাল ↗</a></div></div><div class="tip"><b>বুকিং চেকলিস্ট</b><br><span>রুমের মোট দাম ও VAT/সার্ভিস চার্জ, AC/non-AC, পরিবার/শিশু নীতি, check-in time, cancellation policy এবং সাম্প্রতিক রিভিউ নিশ্চিত করুন। কোনো অগ্রিম পাঠানোর আগে হোটেলের অফিসিয়াল নম্বর যাচাই করুন।</span></div></section>

<section class="section"><h2>🛏️ কোথায় থাকবেন</h2><div class="overview"><b>আবাসন বেছে নেওয়ার সহজ উপায়</b><br><span>${esc(profile.stayArea)}</span></div><div class="tips"><div class="tip-item"><b>💸 বাজেট</b><br>সাধারণ হোটেল/গেস্টহাউস; রুম দেখেই বুকিং ও অতিরিক্ত চার্জ নিশ্চিত করুন।</div><div class="tip-item"><b>👨‍👩‍👧 পরিবার</b><br>পরিবারবান্ধব, নিরাপদ প্রবেশপথ ও রিভিউ আছে এমন আবাসন বেছে নিন।</div><div class="tip-item"><b>📍 লোকেশন</b><br>বাসস্ট্যান্ড/স্টেশন বা আপনার প্রধান স্পটের কাছে থাকলে যাতায়াত খরচ কমতে পারে।</div><div class="tip-item"><b>✅ বুকিং টিপ</b><br>সাপ্তাহিক ছুটি ও মৌসুমে আগে বুক করুন; সাম্প্রতিক রিভিউ ও বাতিল নীতি পড়ুন।</div></div></section>

<section class="section"><h2>🍲 কী খাবেন</h2><div class="overview"><b>স্থানীয় খাবারের গাইড</b><br><span>${esc(profile.foodGuide)}</span></div><p>পরিচ্ছন্ন ও ব্যস্ত দোকান বেছে নিন। মাছ/মাংস, অ্যালার্জি, খাবারের দাম এবং পরিবেশনের সময় আগে জেনে নিন।</p></section>

<section class="section"><h2>💰 সম্ভাব্য বাজেট</h2><div class="overview"><b>১ রাতের সাশ্রয়ী ট্রিপ (প্রতি ব্যক্তি)</b><br><span>${esc(profile.budget)}</span></div><div class="tips"><div class="tip-item">যাতায়াত: রুট ও যানবাহন অনুযায়ী</div><div class="tip-item">আবাসন: রুম শেয়ার করলে কম হতে পারে</div><div class="tip-item">খাবার: স্থানীয় সাধারণ খাবার ধরুন</div><div class="tip-item">স্পট/গাইড/নৌকা: প্রয়োজন হলে আলাদা রাখুন</div></div><small>এটি পরিকল্পনার আনুমানিক হিসাব, বর্তমান বাজারদর নয়। বুকিংয়ের আগে দাম যাচাই করুন।</small></section>

<section class="section"><h2>🗓️ সহজ ১–৩ দিনের পরিকল্পনা</h2><div class="plan">
${profile.plan.map((p, i) => `<div class="plan-item"><b>দিন ${i + 1}</b><span>${esc(p)}</span></div>`).join('')}
</div></section>

<section class="section"><h2>🎒 যাওয়ার আগে যা জানবেন</h2><div class="tips">
${profile.tips.map((t) => `<div class="tip-item">✓ ${esc(t)}</div>`).join('')}
</div></section>

<section class="section"><h2>📚 তথ্যসূত্র</h2><ul class="source">${sources}</ul></section>
<div class="tip"><b>ভ্রমণ টিপস</b><br><span>ভাড়া, সময়সূচি, আবহাওয়া ও স্থানীয় নিয়ম যাত্রার আগে যাচাই করুন।</span></div>
</article>

<aside class="side">
<div class="card"><h2>📍 ${esc(d.bn)} এক নজরে</h2><div class="mapbox">${map}</div>
<a class="btn primary" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.bn + ' জেলা, বাংলাদেশ')}" target="_blank" rel="noopener">Google Maps-এ দেখুন ↗</a>
</div>
<div class="card"><h2>🧭 কাছের জেলা</h2><div class="near">
${nearby.map((n) => `<a href="/district/${slug(n.en)}/">${esc(n.bn)} →</a>`).join('')}
</div></div>
</aside>
</div>
</main>
<footer class="foot"><span>© ${new Date().getFullYear()} BDTrip · Explore Bangladesh</span><span>Map data: geoBoundaries</span></footer>
</div>
<script src="/navbar.js" defer></script>
</body>
</html>`;

  return { slug: slug(d.en), html };
});

for (const page of pages) {
  const dir = path.join(root, 'district', page.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page.html);
}

const base = 'https://bdtrip.vercel.app';

const pageUrls = [
  '/',
  '/district-guide/',
  '/planner/',
  '/journal/',
  '/budget/',
  '/checklist/',
  '/journey/',
  '/en/'
].map((url) => base + url);

const districtUrls = pages.map((p) => `${base}/district/${p.slug}/`);

const urlset = (urls) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>
`;

const sitemapPages = urlset(pageUrls);
const sitemapDistricts = urlset(districtUrls);
const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${base}/sitemap-pages.xml</loc></sitemap>
  <sitemap><loc>${base}/sitemap-districts.xml</loc></sitemap>
</sitemapindex>
`;

fs.writeFileSync(path.join(root, 'sitemap-pages.xml'), sitemapPages);
fs.writeFileSync(path.join(root, 'sitemap-districts.xml'), sitemapDistricts);
fs.writeFileSync(path.join(root, 'sitemap-index.xml'), sitemapIndex);

// Keep sitemap.xml as a compatibility entry point for existing Search Console setups.
fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemapIndex);
console.log(`Generated ${pages.length} district pages + split sitemap index.`);
