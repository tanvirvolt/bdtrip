import React from 'react';
import { ImageResponse } from '@vercel/og';

export default function handler(req,res){
  const code=String(req.query?.code||'').replace(/[^A-Za-z0-9_-]/g,'');
  if(!code||code.length<10||code.length>40)return res.status(404).send('Not found');
  const raw=Buffer.from(code.replace(/-/g,'+').replace(/_/g,'/'),'base64');
  let visited=0,wish=0;
  const vals=Array.from({length:64},(_,i)=>{const v=(raw[Math.floor(i/4)]>>((i%4)*2))&3;if(v===1)visited++;if(v===2)wish++;return v;});
  const pct=Math.round(visited/64*100);
  if(req.query?.image==='1'){
    const cells=vals.map((v,i)=>React.createElement('div',{key:i,style:{width:54,height:40,borderRadius:9,backgroundColor:v===1?'#0f7a5a':v===2?'#f5a623':'#dfe8e3'}}));
    const grid=React.createElement('div',{style:{display:'flex',flexWrap:'wrap',gap:16,width:560}},cells);
    const content=React.createElement('div',{style:{width:'100%',height:'100%',display:'flex',flexDirection:'column',padding:48,backgroundColor:'#f3efe3',color:'#11302f',fontFamily:'sans-serif'}},
      React.createElement('div',{style:{fontSize:28,fontWeight:700,color:'#62706d'}},'BDTrip · বাংলাদেশ ভ্রমণ ম্যাপ'),
      React.createElement('div',{style:{fontSize:58,fontWeight:800,marginTop:18}},'আমার ভ্রমণ ম্যাপ'),
      React.createElement('div',{style:{fontSize:26,color:'#62706d',marginTop:10}},visited+' / 64 জেলা ঘোরা · '+pct+'%'),
      React.createElement('div',{style:{display:'flex',marginTop:28}},grid),
      React.createElement('div',{style:{display:'flex',fontSize:22,fontWeight:700,marginTop:24,gap:35}},'ঘুরেছি '+visited,'উইশলিস্ট '+wish)
    );
    return new ImageResponse(content,{width:1200,height:630,headers:{'Cache-Control':'public, s-maxage=86400, stale-while-revalidate=604800'}});
  }
  const title='BDTrip — বন্ধুর ভ্রমণ ম্যাপ',desc='বন্ধুর BDTrip ভ্রমণ ম্যাপ খুলুন এবং নিজের ভ্রমণের সাথে তুলনা করুন।',img='https://bdtrip.vercel.app/api/share/'+code+'?image=1';
  const html='<!doctype html><html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+'</title><meta name="description" content="'+desc+'"><meta property="og:title" content="'+title+'"><meta property="og:description" content="'+desc+'"><meta property="og:type" content="website"><meta property="og:image" content="'+img+'"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="'+img+'"><meta http-equiv="refresh" content="0;url=/?m='+encodeURIComponent(code)+'"><script>location.replace("/?m='+encodeURIComponent(code)+'")</script></head><body><p>BDTrip ম্যাপ লোড হচ্ছে…</p></body></html>';
  res.setHeader('Cache-Control','public, s-maxage=86400, stale-while-revalidate=604800');res.setHeader('Content-Type','text/html; charset=utf-8');return res.status(200).send(html);
}
