'use client';
import { useEffect, useState } from 'react';
export default function AdminAffiliates(){
  const [rows,setRows]=useState<any[]>([]);
  useEffect(()=>{(async()=>{ const r=await fetch('/api/admin/affiliates'); const j=await r.json(); if(j.success) setRows(j.affiliates); })();},[]);
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Affiliates</h1>
      <div className="bg-white border rounded">
        <div className="p-4 font-semibold">Accounts</div>
        <table className="w-full text-sm"><thead><tr className="bg-gray-50"><th className="p-2 text-left">User</th><th className="p-2">Status</th><th className="p-2">Rate %</th><th className="p-2">Links</th></tr></thead><tbody>
          {rows.map(a=> (
            <tr key={a.id} className="border-t"><td className="p-2">{a.user_id}</td><td className="p-2">{a.status}</td><td className="p-2">{a.default_rate_percent}</td><td className="p-2">{a.affiliate_links?.length||0}</td></tr>
          ))}
        </tbody></table>
      </div>
    </div>
  );
}