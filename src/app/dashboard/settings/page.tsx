'use client';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SettingsPage(){
  const supabase = createClientComponentClient();
  const [profile,setProfile]=useState<any>(null);
  const [saving,setSaving]=useState(false);
  useEffect(()=>{(async()=>{ const r=await fetch('/api/me/profile'); const j=await r.json(); if(j.success) setProfile(j.profile||{}); })();},[]);
  if(!profile) return <div className="p-6">Loading…</div>;
  async function save(){ setSaving(true); await fetch('/api/me/profile',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(profile)}); setSaving(false); }
  async function upload(bucket:string, field:string, file:File){ const { data:{ user } } = await supabase.auth.getUser(); if(!user) return; const path=`${user.id}/${field}-${Date.now()}.png`; await supabase.storage.from(bucket).upload(path,file,{upsert:true}); const { data } = supabase.storage.from(bucket).getPublicUrl(path); setProfile((p:any)=>({...p,[field]:data.publicUrl})); }
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Account Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded p-4 space-y-3">
          <h2 className="font-semibold">Profile</h2>
          <input className="border p-2 w-full" placeholder="Full name" value={profile.full_name||''} onChange={e=>setProfile({...profile,full_name:e.target.value})}/>
          <input className="border p-2 w-full" placeholder="Company" value={profile.company||''} onChange={e=>setProfile({...profile,company:e.target.value})}/>
          <div>
            <label className="block text-sm mb-1">Avatar</label>
            <input type="file" accept="image/*" onChange={e=>e.target.files&&upload('avatars','avatar_url',e.target.files[0])}/>
            {profile.avatar_url && <img src={profile.avatar_url} alt="avatar" className="mt-2 h-12 w-12 rounded-full"/>}
          </div>
          <div>
            <label className="block text-sm mb-1">Company Logo</label>
            <input type="file" accept="image/*" onChange={e=>e.target.files&&upload('logos','company_logo_url',e.target.files[0])}/>
            {profile.company_logo_url && <img src={profile.company_logo_url} alt="logo" className="mt-2 h-10"/>}
          </div>
        </div>
        <div className="bg-white border rounded p-4 space-y-3">
          <h2 className="font-semibold">Email & Signature</h2>
          <input className="border p-2 w-full" placeholder="Sender Name" value={profile.sender_name||''} onChange={e=>setProfile({...profile,sender_name:e.target.value})}/>
          <input className="border p-2 w-full" placeholder="Sender Email" value={profile.sender_email||''} onChange={e=>setProfile({...profile,sender_email:e.target.value})}/>
          <textarea className="border p-2 w-full h-28" placeholder="Signature HTML" value={profile.signature_html||''} onChange={e=>setProfile({...profile,signature_html:e.target.value})}/>
        </div>
      </div>
      <button onClick={save} disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded">{saving?'Saving…':'Save Changes'}</button>
    </div>
  );
}