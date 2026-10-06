import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const load = (file, globalName) => {
  const code = fs.readFileSync(path.join(root, file), 'utf8');
  const box = {};
  return new Function('window', code + `\nreturn window.${globalName};`)(box);
};
const D = load('data.js', 'BD_DATA');
const INFO = load('info.js', 'BD_INFO');

const esc = (s) => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const slug = (s) => String(s).toLowerCase().replace(/['’]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const transport = {
  1:'ঢাকা থেকে সাধারণভাবে বাস/ট্রেন; পার্বত্য জেলায় পৌঁছে স্থানীয় জিপ/বাস লাগে।',
  2:'ঢাকা থেকে সাধারণভাবে ট্রেন বা দূরপাল্লার বাস; গন্তব্য অনুযায়ী সময় ও রুট বদলায়।',
  3:'ঢাকা থেকে সাধারণভাবে ট্রেন বা বাস; সুন্দরবন/মোংলা এলাকায় স্থানীয় নৌযান লাগতে পারে।',
  4:'ঢাকা থেকে বাস বা লঞ্চ; নদীপথের সময়সূচি আগে যাচাই করুন।',
  5:'ঢাকা থেকে ট্রেন বা বাসে সিলেট অঞ্চলে, এরপর স্থানীয় যান।',
  6:'ঢাকা থেকে বাস/ট্রেন/সড়কপথে; জেলার অবস্থান অনুযায়ী সময় ও রুট আলাদা।',
  7:'ঢাকা থেকে ট্রেন বা দূরপাল্লার বাসে; পরে স্থানীয় যানবাহন।',
  8:'ঢাকা থেকে ট্রেন বা বাসে; পরে স্থানীয় বাস/সিএনজি/অটোরিকশা।'
};
const gov = { Chattogram:'chittagong' };
const pages = D.districts.map((d) => {
  const s = slug(d.en), div = D.divisions.find(x=>x.id===d.div), info = INFO[d.en] || {};
  const places = info.a?.length ? info.a : ['জেলা ও আশপাশের দর্শনীয় স্থান'];
  const nearby = D.districts.filter(x=>x.div===d.div && x.id!==d.id).slice(0,3);
  const canonical = `https://bdtrip.vercel.app/district/${s}/`;
  const source = (info.src||[]).map(x=>`<li><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.name)} ↗</a></li>`).join('') + `<li><a href="https://${gov[d.en]||s}.gov.bd" target="_blank" rel="noopener">জেলা প্রশাসনের সরকারি পোর্টাল ↗</a></li>`;
  return {s, html:`<!doctype html><html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(d.bn)} জেলা ভ্রমণ গাইড — দর্শনীয় স্থান, সেরা সময় ও খাবার | BDTrip</title><meta name="description" content="${esc(d.bn)} জেলা ভ্রমণ গাইড: দর্শনীয় স্থান, সেরা সময়, খাবার, ঢাকা থেকে যাওয়ার সাধারণ উপায় ও কাছের জেলা।"><meta name="robots" content="index,follow"><link rel="canonical" href="${canonical}"><link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/v2.css"><meta property="og:type" content="article"><meta property="og:title" content="${esc(d.bn)} জেলা ভ্রমণ গাইড | BDTrip"><meta property="og:description" content="${esc(d.bn)}-এর দর্শনীয় স্থান, সেরা সময়, খাবার ও ট্রিপ তথ্য।"><meta property="og:image" content="https://bdtrip.vercel.app/og-image.svg"></head><body><header class="nav"><a class="brand" href="/">BD<b>Trip</b></a><nav class="links"><a href="/">ম্যাপ</a><a href="/#guide">জেলা গাইড</a><a href="/#budget">বাজেট</a></nav></header><main class="district-page"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">BDTrip</a><span>›</span><a href="/#guide">জেলা গাইড</a><span>›</span><strong>${esc(d.bn)}</strong></nav><section class="district-hero"><span class="tag">${esc(div.bn)} বিভাগ · ${esc(d.en)}</span><h1>${esc(d.bn)} জেলা ভ্রমণ গাইড</h1><p>বাংলায় ${esc(d.bn)} ভ্রমণ গাইড—ঘোরার জায়গা, সেরা সময়, খাবার ও যাতায়াত।</p><div class="district-actions"><a class="cta" href="/?district=${d.id}&mark=v#tool">✓ ঘুরেছি</a><a class="cta ghost" href="/?district=${d.id}&mark=w#tool">★ ঘুরতে চাই</a></div></section><div class="district-grid"><article class="card"><h2>ঘুরে দেখার জায়গা</h2><ul class="district-list">${places.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><section><h2>ভ্রমণের সেরা সময়</h2><p>${esc(info.s||'অক্টোবর–মার্চ')}</p></section><section><h2>বিখ্যাত খাবার ও পণ্য</h2><p>${esc(info.f||'স্থানীয় খাবার ও পণ্য; যাত্রার আগে সরকারি তথ্য যাচাই করুন।')}</p></section><section><h2>ঢাকা থেকে যাওয়ার সাধারণ উপায়</h2><p>${transport[d.div]}</p><small>ভাড়া, সময়সূচি ও রাস্তার অবস্থা বদলাতে পারে—যাত্রার আগে যাচাই করুন।</small></section><section><h2>তথ্যসূত্র</h2><ul class="source-list">${source}</ul></section></article><aside class="card district-side"><h2>${esc(d.bn)} এক নজরে</h2><svg class="mini-map" viewBox="0 0 ${D.w} ${D.h}" role="img" aria-label="${esc(d.bn)} জেলার অবস্থান"><path d="${d.d}"/></svg><p><strong>বিভাগ:</strong> ${esc(div.bn)}</p><a class="btn primary" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.bn+' জেলা, বাংলাদেশ')}" target="_blank" rel="noopener">Google Maps-এ দেখুন</a><h3>কাছের জেলা</h3><div class="nearby">${nearby.map(n=>`<a href="/district/${slug(n.en)}/">${esc(n.bn)}</a>`).join('')}</div></aside></div><section class="card district-cta"><h2>BDTrip ম্যাপে ${esc(d.bn)} যোগ করুন</h2><p>এক ক্লিকে “ঘুরেছি” বা “ঘুরতে চাই” স্ট্যাটাস সেট করুন।</p><a class="btn primary" href="/?district=${d.id}&mark=v#tool">ম্যাপে যোগ করুন</a></section></main><footer class="foot"><div class="foot-card"><div class="foot-content"><div class="foot-bottom"><span>© ${new Date().getFullYear()} BDTrip</span><span>ম্যাপ ডেটা: geoBoundaries</span></div></div></div></footer></body></html>`};
});
for (const p of pages) {
  const dir = path.join(root,'district',p.s);
  fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'index.html'),p.html);
}
const urls = ['https://bdtrip.vercel.app/', ...pages.map(p=>`https://bdtrip.vercel.app/district/${p.s}/`)];
fs.writeFileSync(path.join(root,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log(`Generated ${pages.length} district pages and sitemap.`);
