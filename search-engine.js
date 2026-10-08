/* BDTrip — unified search engine
   Shared by homepage search and global navbar search.
   Supports Bangla/English, partial matches, districts, places, food, divisions and guides.
*/
(() => {
  'use strict';

  let readyPromise = null;

  const norm = (value) => String(value ?? '')
    .toLocaleLowerCase('bn')
    .normalize('NFKC')
    .replace(/[\u200c\u200d]/g, '')
    .replace(/[’']/g, '')
    .replace(/[\s\-_.,/()]+/g, '');

  const slugify = (value) => String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const aliases = {
    chittagong: ['chattogram','chattagram'],
    chittagram: ['chattogram','chittagong'],
    comilla: ['cumilla'],
    cumilla: ['comilla'],
    jessore: ['jashore'],
    jashore: ['jessore'],
    barisal: ['barishal'],
    barishal: ['barisal'],
    bogra: ['bogura'],
    bogura: ['bogra'],
    chapai: ['chapainawabganj'],
    cox: ['coxsbazar','coxsbazar'],
    coxsbazar: ['cox'],
    dhaka: ['dhaka'],
    sylhet: ['sylhet']
  };

  const ensureData = () => {
    if (window.BD_DATA?.districts?.length && window.BD_INFO) return Promise.resolve(true);
    if (readyPromise) return readyPromise;
    readyPromise = new Promise(resolve => {
      const need = [];
      if (!window.BD_DATA?.districts?.length) need.push('/data.js');
      if (!window.BD_INFO) need.push('/info.js');
      if (!need.length) return resolve(true);
      let left = need.length, failed = false;
      need.forEach(src => {
        const el = document.querySelector('script[src="'+src+'"]') ||
          document.querySelector('script[src$="'+src+'"]');
        const done = ok => { if(!ok) failed=true; if(--left===0) resolve(!failed); };
        if (el) {
          if ((src.endsWith('data.js') && window.BD_DATA?.districts?.length) ||
              (src.endsWith('info.js') && window.BD_INFO)) done(true);
          else {
            el.addEventListener('load',()=>done(true),{once:true});
            el.addEventListener('error',()=>done(false),{once:true});
          }
        } else {
          const s=document.createElement('script');
          s.src=src; s.onload=()=>done(true); s.onerror=()=>done(false);
          document.head.appendChild(s);
        }
      });
    });
    return readyPromise;
  };

  const aliasTerms = (q) => {
    const raw=String(q||'').toLowerCase().trim();
    return [raw, ...(aliases[raw]||[])].filter(Boolean).map(norm);
  };

  const query = async (input) => {
    await ensureData();
    const q=norm(input);
    const ds=Array.isArray(window.BD_DATA?.districts)?window.BD_DATA.districts:[];
    const divs=Array.isArray(window.BD_DATA?.divisions)?window.BD_DATA.divisions:[];
    const info=window.BD_INFO||{};
    if(!q) return [];

    const terms=aliasTerms(input);
    const out=[];

    ds.forEach(d=>{
      const places=Array.isArray(info[d.en]?.a)?info[d.en].a:[];
      const food=String(info[d.en]?.f||'');
      const division=divs.find(x=>x.id===d.div);
      const divisionText=division ? division.bn+' '+division.en : '';
      const guideText=d.bn+' '+d.en+' '+divisionText+' জেলা গাইড district guide';
      const fields=[
        {type:'district', text:d.bn+' '+d.en+' '+slugify(d.en), label:'📍 জেলা', weight:100},
        ...places.map(p=>({type:'place',text:p,label:'🏛 দর্শনীয় স্থান',weight:72})),
        ...(food?[{type:'food',text:food,label:'🍛 খাবার / পণ্য',weight:65}]:[]),
        {type:'division',text:divisionText,label:'🗺 বিভাগ',weight:55},
        {type:'guide',text:guideText,label:'📖 জেলা গাইড',weight:35}
      ];

      fields.forEach(f=>{
        const textNorm=norm(f.text);
        const hit=terms.some(t=>textNorm.includes(t));
        if(!hit)return;
        let score=f.weight;
        if(norm(d.bn)===q || norm(d.en)===q || terms.includes(norm(d.en))) score+=120;
        if(textNorm.startsWith(q)) score+=25;
        if(f.type==='place' && norm(f.text).includes(q)) score+=20;
        if(f.type==='food' && norm(f.text).includes(q)) score+=15;
        out.push({
          district:d,
          division,
          type:f.type,
          label:f.label,
          title:f.type==='district'?d.bn:f.text,
          subtitle:f.type==='district'
            ? (d.en+' · '+(division?.bn||''))
            : d.bn+' · '+(division?.bn||''),
          url:'/district/'+encodeURIComponent(slugify(d.en))+'/',
          score
        });
      });
    });

    // Keep the best match for each semantic result, while allowing
    // a district to appear once for its strongest place/food match.
    const seen=new Map();
    out.forEach(item=>{
      const key=item.type+'|'+item.district.id+'|'+norm(item.title);
      const prev=seen.get(key);
      if(!prev || item.score>prev.score) seen.set(key,item);
    });

    return [...seen.values()]
      .sort((a,b)=>b.score-a.score || a.district.id-b.district.id)
      .slice(0,12);
  };

  window.BDTripSearch={query,ensureData,norm,slugify};
})();