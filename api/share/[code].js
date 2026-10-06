export default function handler(req,res){
  const code = String(req.query?.code || '').replace(/[^A-Za-z0-9_-]/g,'');
  if (!code || code.length < 10 || code.length > 40) return res.status(404).send('Not found');
  const title='BDTrip — বন্ধুর ভ্রমণ ম্যাপ';
  const desc='বন্ধুর BDTrip ভ্রমণ ম্যাপ খুলুন এবং নিজের ভ্রমণের সাথে তুলনা করুন।';
  const app='/';
  const html='<!doctype html><html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+'</title><meta name="description" content="'+desc+'"><meta property="og:title" content="'+title+'"><meta property="og:description" content="'+desc+'"><meta property="og:type" content="website"><meta property="og:image" content="https://bdtrip.vercel.app/og-image.svg"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="https://bdtrip.vercel.app/og-image.svg"><meta http-equiv="refresh" content="0;url='+app+'?m='+encodeURIComponent(code)+'"><script>location.replace("'+app+'?m='+encodeURIComponent(code)+'")</script></head><body><p>BDTrip ম্যাপ লোড হচ্ছে…</p></body></html>';
  res.setHeader('Cache-Control','public, s-maxage=86400, stale-while-revalidate=604800');
  res.setHeader('Content-Type','text/html; charset=utf-8');
  return res.status(200).send(html);
}
