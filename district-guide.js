(()=>{'use strict';
const D=window.BD_DATA,I=window.BD_INFO||{},$=s=>document.querySelector(s);
let q='',div=0;
const divs=D.divisions;
const colors=['#0f7a5a','#159f7a','#287e9c','#718b3e','#a06a2f'];
const norm=v=>String(v??'').toLocaleLowerCase('bn').normalize('NFKC').replace(/[\u200c\u200d]/g,'').replace(/[\s\-_.,/()]+/g,'');
const slug=v=>String(v||'').toLowerCase().trim().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
const aliases={chittagong:'chattogram',chittagram:'chattagram',comilla:'cumilla',cumilla:'comilla',jeshore:'jashore',jessore:'jashore',barisal:'barishal',bogra:'bogura',chapai:'chapainawabganj',cox:'coxsbazar'};
function scoreDistrict(d,query){
 const info=I[d.en]||{},places=info.a||[],q=norm(query);
 if(!q)return 1;
 const fields=[d.bn,d.en,slug(d.en),...places].map(norm);
 let score=fields.some(x=>x===q)?100:fields.some(x=>x.startsWith(q))?70:fields.some(x=>x.includes(q))?35:0;
 const a=aliases[String(query||'').toLowerCase().trim()];
 if(a&&norm(a)===norm(d.en))score=Math.max(score,95);
 if(places.some(p=>norm(p).includes(q)))score+=45;
 return score;
}
function card(d){
 const info=I[d.en]||{},places=info.a||[],grad=colors[d.id%colors.length];
 return '<a class="district-card" href="/district/'+slug(d.en)+'/" data-name="'+escapeHtml([d.bn,d.en,...places].join(' '))+'"><div class="dc-img" style="background:linear-gradient(135deg,'+grad+',#0b3d3a)"><span>'+escapeHtml(d.bn)+'</span></div><div class="dc-body"><h3>'+escapeHtml(d.bn)+'</h3><p>'+escapeHtml(places[0]||'জেলার দর্শনীয় স্থান ও ভ্রমণ তথ্য')+'</p><div class="dc-meta"><span>📍 '+Math.max(1,places.length)+' স্থান</span><span></span></div></div></a>';
}
function render(){
 const sort=$('#sort')?.value||'default';
 let arr=D.districts.filter(d=>!div||d.div===div).map(d=>({d,s:scoreDistrict(d,q)})).filter(x=>!q||x.s>0).sort((a,b)=>q?(b.s-a.s||a.d.id-b.d.id):(sort==='name'?a.d.bn.localeCompare(b.d.bn,'bn'):b.d.id-a.d.id)).map(x=>x.d);
 $('#count').textContent=arr.length;
 $('#grid').innerHTML=arr.map(card).join('')||'<div class="empty"><b>কোনো জেলা বা স্থান পাওয়া যায়নি</b><small>বাংলা, English বা দর্শনীয় স্থানের নাম দিয়ে চেষ্টা করুন।</small></div>';
 $('#popular').innerHTML=D.districts.slice(0,5).map((d,i)=>'<a class="pop" href="/district/'+slug(d.en)+'/"><span><span class="rank">'+(i+1)+'</span>'+escapeHtml(d.bn)+'</span><b>→</b></a>').join('');
}
function map(){const svg=$('#bdMap');if(!svg)return;svg.innerHTML=D.districts.map(d=>'<path data-id="'+d.id+'" d="'+d.d+'"><title>'+escapeHtml(d.bn)+'</title></path>').join('');svg.querySelectorAll('path').forEach(p=>p.addEventListener('click',()=>{const d=D.districts.find(x=>x.id==p.dataset.id);if(d)location.href='/district/'+slug(d.en)+'/'}));}
function escapeHtml(v){return String(v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
divs.forEach(d=>{const b=document.createElement('button');b.textContent=d.bn+' ('+D.districts.filter(x=>x.div===d.id).length+')';b.onclick=()=>{div=d.id;document.querySelectorAll('#divFilters button').forEach(x=>x.classList.remove('active'));b.classList.add('active');render()};$('#divFilters')?.appendChild(b)});
$('#search')?.addEventListener('input',e=>{q=e.target.value;const side=$('#sideSearch');if(side)side.value=q;render()});
$('#sideSearch')?.addEventListener('input',e=>{q=e.target.value;const main=$('#search');if(main)main.value=q;render()});
$('#sort')?.addEventListener('change',render);
$('#clear')?.addEventListener('click',()=>{div=0;q='';if($('#search'))$('#search').value='';if($('#sideSearch'))$('#sideSearch').value='';document.querySelectorAll('#divFilters button').forEach(x=>x.classList.remove('active'));render()});
$('#gridView')?.addEventListener('click',()=>{$('#grid').style.gridTemplateColumns='repeat(3,minmax(0,1fr))';$('#gridView').classList.add('active');$('#listView')?.classList.remove('active')});
$('#listView')?.addEventListener('click',()=>{$('#grid').style.gridTemplateColumns='1fr';$('#listView').classList.add('active');$('#gridView')?.classList.remove('active')});
map();render();
})();