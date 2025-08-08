'use client';
import { useEffect, useState } from 'react';
export default function AffiliatePortal(){
  const [data,setData]=useState<any>(null);
  const [code,setCode]=useState('');
  const [dest,setDest]=useState('');
  useEffect(()=>{(async()=>{ const r=await fetch('/api/affiliate/me'); const j=await r.json(); if(j.success) setData(j); })();},[]);
  async function createLink(){ const r=await fetch('/api/affiliate/links',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code,destination_url:dest})}); const j=await r.json(); if(j.success) setData((d:any)=>({...d,links:[j.link,...(d.links||[])]})); }
  if(!data) return <div className="p-6">Loading…</div>;
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Affiliate Portal</h1>
      <div className="bg-white border rounded p-4">
        <div className="font-semibold mb-2">Your Account</div>
        <div>Status: <b>{data.account.status}</b> • Default Rate: <b>{data.account.default_rate_percent}%</b></div>
      </div>
      <div className="bg-white border rounded p-4 space-y-2">
        <div className="font-semibold">Create Link</div>
        <input className="border p-2 w-full" placeholder="code (e.g. john-doe)" value={code} onChange={e=>setCode(e.target.value)} />
        <input className="border p-2 w-full" placeholder="destination URL (optional)" value={dest} onChange={e=>setDest(e.target.value)} />
        <button onClick={createLink} className="px-3 py-2 bg-indigo-600 text-white rounded">Create</button>
      </div>
      <div className="bg-white border rounded p-4">
        <div className="font-semibold mb-2">Your Links</div>
        <ul className="list-disc ml-5">
          {(data.links||[]).map((l:any)=> (
            <li key={l.id} className="mb-1">{l.code} — pixel: <code>/api/affiliate/track?code={l.code}</code></li>
          ))}
        </ul>
      </div>
    </div>
  );
}