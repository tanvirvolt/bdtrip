(()=>{'use strict';
const D=window.BD_DATA||{},I=window.BD_INFO||{},$=s=>document.querySelector(s);
const STORE='bdtrip_v2';
let q='',div=0,experience='',sort='default',selected=0,visible=12,view='grid';
const slug=v=>String(v||'').toLowerCase().trim().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
const esc=v=>String(v??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const state=()=>{try{const s=JSON.parse(localStorage.getItem(STORE)||'{}');return{v:new Set(s.v||[]),w:new Set(s.w||[])}}catch(_){return{v:new Set(),w:new Set()}}};
const saveStatus=(id,type)=>{try{const s=JSON.parse(localStorage.getItem(STORE)||'{}');const v=new Set(s.v||[]),w=new Set(s.w||[]);v.delete(id);w.delete(id);if(type==='v')v.add(id);if(type==='w')w.add(id);localStorage.setItem(STORE,JSON.stringify({...s,v:[...v],w:[...w]}))}catch(_){}};
const status=(id)=>{const s=state();return s.v.has(id)?'v':s.w.has(id)?'w':null};
const places=d=>(I[d.en]?.a||[]);
const food=d=>String(I[d.en]?.f||'');
const season=d=>String(I[d.en]?.s||'');
const tags=d=>{const text=(d.bn+' '+d.en+' '+places(d).join(' ')+' '+food(d)+' '+season(d)).toLowerCase();const t=[];if(/সমুদ্র|সৈকত|বিচ|beach|inani|cox/.test(text))t.push('beach');if(/পাহাড়|পাহাড়|hill|mountain|নীলগিরি|সাজেক|বগা/.test(text))t.push('mountain');if(/উদ্যান|বন|হাওর|লেক|lake|ঝর্ণা|নদী|জলাবন|nature/.test(text))t.push('nature');if(/কেল্লা|মসজিদ|বিহার|জাদুঘর|রাজবাড়ী|রাজবাড়ী|মাজার|history|ঐতিহাসিক/.test(text))t.push('history');if(food(d))t.push('food');if(/বর্ষা|জুলাই|আগস্ট|সেপ্টেম্বর|অক্টোবর|monsoon/.test(season(d)))t.push('monsoon');return [...new Set(t)]};
const tagLabel={beach:'🌊 Beach',mountain:'⛰ Mountain',nature:'🌿 Nature',history:'🏛 History',food:'🍛 Food',monsoon:'🌧 Monsoon'};
const tagClass=t=>'<span class="dc-tag">'+tagLabel[t]+'</span>';
const photoCache=new Map();
function findPhoto(name,place){
 const key=name+'|'+place;
 if(photoCache.has(key))return photoCache.get(key);
 const cleanName=String(name||'').replace(/[^a-z0-9 ]/gi,' ').trim();
 const cleanPlace=String(place||'').replace(/[^a-z0-9 \u0980-\u09ff]/gi,' ').trim();
 const queries=[
  'filetype:bitmap intitle:"'+cleanPlace+'" Bangladesh',
  'filetype:bitmap '+cleanPlace+' '+cleanName+' Bangladesh tourism',
  'filetype:bitmap '+cleanName+' Bangladesh tourist attraction'
 ].filter((q,i,a)=>q.length>12&&a.indexOf(q)===i);
 const task=(async()=>{
  for(const query of queries){
   try{
    const url='https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch='+encodeURIComponent(query)+'&gsrnamespace=6&gsrlimit=20&prop=imageinfo&iiprop=url|mime&iiurlwidth=900&format=json&origin=*';
    const response=await fetch(url);
    if(!response.ok)continue;
    const data=await response.json();
    const pages=Object.values(data.query?.pages||{});
    const reject=/\b(map|maps|location|locator|administrative|districts?|division|outline|blank|svg|flag|logo|icon|coat of arms|emblem|seal|diagram|geography|boundary|political|province|municipal|ward)\b/i;
    const usable=pages.filter(p=>{
     const title=p.title||'',info=p.imageinfo?.[0]||{};
     return info.thumburl&&/^image\/(jpeg|png|webp)$/i.test(info.mime||'')&&!reject.test(title);
    });
    if(!usable.length)continue;
    const words=(cleanPlace+' '+cleanName).toLowerCase().split(/[^a-z0-9\u0980-\u09ff]+/).filter(w=>w.length>3);
    const scored=usable.map(p=>{
     const title=(p.title||'').toLowerCase();
     let score=words.reduce((n,w)=>n+(title.includes(w)?4:0),0);
     if(/tour|travel|landscape|beach|hill|lake|waterfall|garden|forest|tea|river|palace|fort|temple|monastery|mosque|park|island|bridge/i.test(title))score+=2;
     if(/map|location|district|division|boundary|administrative|flag|coat of arms|logo|icon/i.test(title))score-=20;
     return {url:p.imageinfo[0].thumburl,score};
    }).sort((a,b)=>b.score-a.score);
    if(scored[0]&&scored[0].score>=1)return scored[0].url;
   }catch(e){}
  }
  return '';
 })();
 photoCache.set(key,task);
 return task;
}
function hydratePhotos(root=document){
 root.querySelectorAll('[data-photo-id][data-photo-name]').forEach(async el=>{
  if(el.dataset.photoLoaded)return;
  el.dataset.photoLoaded='1';
  const url=await findPhoto(el.dataset.photoName,el.dataset.photoPlace||'');
  if(!url||!el.isConnected)return;
  const img=document.createElement('img');
  img.className='district-photo';
  img.src=url;
  img.alt=(el.dataset.photoPlace||el.dataset.photoName)+' travel photo';
  img.loading='lazy';
  img.decoding='async';
  img.addEventListener('error',()=>{img.remove();el.classList.remove('has-photo')},{once:true});
  el.prepend(img);
  el.classList.add('has-photo');
 });
}
function matches(d){if(div&&d.div!==div)return false;if(experience&&!tags(d).includes(experience))return false;if(q){const text=[d.bn,d.en,...places(d),food(d),season(d)].join(' ');if(window.BDTripSearch){/* unified search is used for the hero/top result UI */}const n=window.BDTripSearch?.norm||((x)=>String(x).toLowerCase().replace(/\s+/g,''));const terms=n(q).split('').length? [n(q)]:[];if(!terms.some(t=>n(text).includes(t)))return false}return true}
function list(){let a=D.districts.filter(matches);if(sort==='name')a.sort((x,y)=>x.bn.localeCompare(y.bn,'bn'));if(sort==='places')a.sort((x,y)=>places(y).length-places(x).length||x.id-y.id);return a}
function card(d){const st=status(d.id),ps=places(d),ts=tags(d);const grad=['#0b5d4b','#1f7891','#6b7d3b','#8b5e34','#5a4b86'][d.id%5];return '<article class="district-card" data-id="'+d.id+'"><a href="/district/'+slug(d.en)+'/" aria-label="'+esc(d.bn)+' জেলা গাইড"><div class="dc-visual" data-photo-id="'+d.id+'" data-photo-name="'+esc(d.en)+'" data-photo-place="'+esc(ps[0]||d.en)+'" style="background:linear-gradient(145deg,'+grad+',#073b36)"><span class="dc-label">'+esc(d.bn)+'</span></div></a><div class="dc-status"><button class="status-btn '+(st==='v'?'active':'')+'" data-status="v" data-id="'+d.id+'" title="Visited" aria-label="'+esc(d.bn)+' visited">✓</button><button class="status-btn '+(st==='w'?'active':'')+'" data-status="w" data-id="'+d.id+'" title="Wishlist" aria-label="'+esc(d.bn)+' wishlist">★</button></div><div class="dc-body"><h3>'+esc(d.bn)+'</h3><div class="dc-en">'+esc(d.en)+'</div><div class="dc-place">'+esc(ps[0]||'জেলার ভ্রমণ গাইড দেখুন')+'</div><div class="dc-meta"><span>📍 '+ps.length+' স্থান</span><span>'+esc(season(d).split(';')[0]||'সেরা সময় দেখুন')+'</span></div><div class="dc-tags">'+ts.slice(0,3).map(tagClass).join('')+'</div></div></article>'}
function renderFeatured(){const picks=['coxsbazar','sajek','sylhet','bandarban'];const ds=picks.map(sl=>D.districts.find(d=>slug(d.en)===sl)).filter(Boolean);$('#featuredGrid').innerHTML=ds.map(d=>'<a class="featured-card" href="/district/'+slug(d.en)+'/" data-featured="'+d.id+'" data-photo-id="'+d.id+'" data-photo-name="'+esc(d.en)+'" data-photo-place="'+esc(places(d)[0]||d.en)+'"><div><h3>'+esc(d.bn)+'</h3><p>'+esc(places(d)[0]||'জনপ্রিয় ভ্রমণ গন্তব্য')+'</p><span>গাইড দেখুন →</span></div></a>').join('');hydratePhotos($('#featuredGrid'))}
function renderDivisions(){const wrap=$('#divisionChips'),filters=$('#divFilters');wrap.innerHTML='<button class="division-chip '+(!div?'active':'')+'" data-div="0">সব বিভাগ · '+D.districts.length+'</button>';filters.innerHTML='<button class="filter-btn '+(!div?'active':'')+'" data-div="0">সব বিভাগ · '+D.districts.length+'</button>';D.divisions.forEach(x=>{const n=D.districts.filter(d=>d.div===x.id).length;wrap.insertAdjacentHTML('beforeend','<button class="division-chip '+(div===x.id?'active':'')+'" data-div="'+x.id+'">'+esc(x.bn)+' · '+n+'</button>');filters.insertAdjacentHTML('beforeend','<button class="filter-btn '+(div===x.id?'active':'')+'" data-div="'+x.id+'">'+esc(x.bn)+' · '+n+'</button>')})}
function syncInputs(value){['topGuideSearch','heroSearch'].forEach(id=>{const e=$('#'+id);if(e&&e.value!==value)e.value=value})}
function render(){const all=list(),shown=all.slice(0,visible);$('#grid').classList.toggle('list-mode',view==='list');$('#grid').innerHTML=shown.map(card).join('')||'<div class="empty"><strong>কোনো জেলা পাওয়া যায়নি</strong><small>অন্য search term বা filter দিয়ে আবার চেষ্টা করুন।</small></div>';hydratePhotos($('#grid'));$('#countLabel').textContent='· '+all.length+'টি';$('#resultHint').textContent=q?'Search: '+q:experience?'Experience: '+tagLabel[experience]:div?'Division filter active':'সব জেলা দেখানো হচ্ছে';$('#more').hidden=shown.length>=all.length;$('#more').textContent='আরও '+Math.min(12,Math.max(0,all.length-shown.length))+' জেলা দেখুন ↓';bindCards();updateProgress();if(selected)highlightMap(selected)}
function bindCards(){document.querySelectorAll('.district-card').forEach(c=>c.addEventListener('click',e=>{const b=e.target.closest('[data-status]');if(b){e.preventDefault();e.stopPropagation();const id=Number(b.dataset.id);const cur=status(id);saveStatus(id,cur===b.dataset.status?null:b.dataset.status);render();return}const id=Number(c.dataset.id);selected=id;highlightMap(id)}))}
function highlightMap(id){const d=D.districts.find(x=>x.id===Number(id));if(!d)return;document.querySelectorAll('#bdMap path').forEach(p=>p.classList.toggle('sel',Number(p.dataset.id)===d.id));const ps=places(d);$('#selectedCard').innerHTML='<strong>'+esc(d.bn)+'</strong><p>'+esc(d.en)+' · '+esc(ps[0]||'ভ্রমণ গাইড')+'</p><p>'+esc(season(d)||'সেরা সময়ের তথ্য দেখুন')+'</p>';$('#selectedGuide').href='/district/'+slug(d.en)+'/';$('#selectedPlan').href='/planner/?district='+d.id;selected=d.id}
function renderMap(){const svg=$('#bdMap');svg.innerHTML=D.districts.map(d=>'<path data-id="'+d.id+'" d="'+d.d+'"><title>'+esc(d.bn)+'</title></path>').join('');svg.querySelectorAll('path').forEach(p=>p.addEventListener('click',()=>{selected=Number(p.dataset.id);highlightMap(selected);document.querySelector('[data-id="'+selected+'"]')?.scrollIntoView({behavior:'smooth',block:'center'})}))}
function updateProgress(){const s=state(),v=s.v.size,w=s.w.size,p=Math.round(v/64*100);$('#progressVisited').textContent=v;$('#progressBar').style.width=p+'%';$('#progressText').textContent=v?'আপনি '+v+'টি জেলা ঘুরেছেন · '+p+'% complete':'এখনও কোনো জেলা marked নেই।';$('#visitedHero').textContent=v;$('#wishHero').textContent=w}
async function smartSearch(value){q=value.trim();syncInputs(value);visible=12;render();const box=$('#heroSearch');if(!value.trim()||!window.BDTripSearch)return;let panel=document.querySelector('#guideSearchResults');if(!panel){panel=document.createElement('div');panel.id='guideSearchResults';panel.style='position:absolute;left:44px;top:170px;width:min(700px,calc(100% - 88px));z-index:20;background:#fff;color:#102a27;border:1px solid #dce8e3;border-radius:14px;box-shadow:0 20px 45px #001f1b30;overflow:hidden';$('.dg-hero').appendChild(panel)}panel.innerHTML='<div style="padding:13px;color:#6b7c77">খুঁজছি…</div>';try{const items=await window.BDTripSearch.query(value);panel.innerHTML=items.slice(0,7).map(x=>'<a href="'+esc(x.url)+'" style="display:flex;gap:10px;padding:11px 14px;text-decoration:none;color:#102a27;border-bottom:1px solid #edf2ef"><b>'+esc(x.title)+'</b><small style="color:#6b7c77">'+esc(x.label)+' · '+esc(x.subtitle)+'</small></a>').join('')||'<div style="padding:13px;color:#6b7c77">কোনো ফলাফল নেই।</div>'}catch(_){panel.innerHTML=''}box?.focus()}
['topGuideSearch','heroSearch'].forEach(id=>$('#'+id)?.addEventListener('input',e=>smartSearch(e.target.value)));
document.addEventListener('click',e=>{const p=$('#guideSearchResults');if(p&&!e.target.closest('.guide-search-premium'))p.remove()});
document.querySelectorAll('.intent-chip,.filter-btn[data-experience]').forEach(b=>b.addEventListener('click',()=>{const x=b.dataset.intent||b.dataset.experience;experience=experience===x?'':x;document.querySelectorAll('[data-experience]').forEach(y=>y.classList.toggle('active',y.dataset.experience===experience));document.querySelectorAll('.intent-chip').forEach(y=>y.classList.toggle('active',y.dataset.intent===experience));visible=12;render()}));
document.addEventListener('click',e=>{const b=e.target.closest('[data-div]');if(!b)return;div=Number(b.dataset.div);renderDivisions();visible=12;render()});
$('#sort')?.addEventListener('change',e=>{sort=e.target.value;render()});
$('#more')?.addEventListener('click',()=>{visible+=12;render()});
$('#gridView')?.addEventListener('click',()=>{view='grid';$('#gridView').classList.add('active');$('#listView').classList.remove('active');render()});
$('#listView')?.addEventListener('click',()=>{view='list';$('#listView').classList.add('active');$('#gridView').classList.remove('active');render()});
$('#clear')?.addEventListener('click',()=>{q='';div=0;experience='';sort='default';visible=12;syncInputs('');$('#sort').value='default';document.querySelectorAll('.intent-chip,.filter-btn[data-experience]').forEach(x=>x.classList.remove('active'));renderDivisions();render();$('#heroSearch')?.focus()});
renderFeatured();renderDivisions();renderMap();render();
})();