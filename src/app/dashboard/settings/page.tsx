'use client';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SettingsPage(){
  const supabase = createClientComponentClient();
  const [loading,setLoading]=useState(true);
  const [profile,setProfile]=useState<any>({});
  const [avatarFile,setAvatarFile]=useState<File|null>(null);
  const [logoFile,setLogoFile]=useState<File|null>(null);

  useEffect(()=>{ (async()=>{
    const res = await fetch('/api/me/profile');
    const j = await res.json();
    if(j.success) setProfile(j.profile||{});
    setLoading(false);
  })(); },[]);

  const upload = async (file:File, folder:'avatars'|'logos')=>{
    const { data:{ user } } = await supabase.auth.getUser();
    const path = `${folder}/${user!.id}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('public-assets').upload(path, file, { upsert:false });
    if(error) throw error;
    const { data } = supabase.storage.from('public-assets').getPublicUrl(path);
    return data.publicUrl;
  }

  const save = async ()=>{
    try{
      let avatar_url = profile.avatar_url;
      let company_logo_url = profile.company_logo_url;
      if(avatarFile) avatar_url = await upload(avatarFile,'avatars');
      if(logoFile) company_logo_url = await upload(logoFile,'logos');
      const body = { full_name: profile.full_name||'', company: profile.company||'', company_domain: profile.company_domain||'', email_signature_html: profile.email_signature_html||'', avatar_url, company_logo_url };
      const res = await fetch('/api/me/profile',{ method:'PATCH', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body) });
      const j = await res.json();
      if(!j.success) throw new Error(j.error||'Failed');
      alert('Saved!');
    }catch(e:any){ alert(e.message); }
  }

  if(loading) return <div className='p-6'>Loading...</div>;
  return (
    <div className='max-w-4xl mx-auto p-6 space-y-6'>
      <h1 className='text-2xl font-bold'>Account Settings</h1>

      <div className='bg-white border rounded-lg p-4 space-y-4'>
        <h2 className='font-semibold'>Profile</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <input className='border rounded p-2' placeholder='Full name' value={profile.full_name||''} onChange={e=>setProfile({...profile, full_name:e.target.value})} />
          <input className='border rounded p-2' placeholder='Company name' value={profile.company||''} onChange={e=>setProfile({...profile, company:e.target.value})} />
          <input className='border rounded p-2' placeholder='Company domain' value={profile.company_domain||''} onChange={e=>setProfile({...profile, company_domain:e.target.value})} />
          <div className='flex items-center gap-2'>
            <input type='file' accept='image/*' onChange={e=>setAvatarFile(e.target.files?.[0]||null)} />
            {profile.avatar_url && <img src={profile.avatar_url} alt='avatar' className='h-10 w-10 rounded-full object-cover' />}
          </div>
          <div className='flex items-center gap-2'>
            <input type='file' accept='image/*' onChange={e=>setLogoFile(e.target.files?.[0]||null)} />
            {profile.company_logo_url && <img src={profile.company_logo_url} alt='logo' className='h-10 object-contain' />}
          </div>
        </div>
      </div>

      <div className='bg-white border rounded-lg p-4 space-y-2'>
        <h2 className='font-semibold'>Email Signature</h2>
        <textarea className='w-full border rounded p-2 h-40' value={profile.email_signature_html||''} onChange={e=>setProfile({...profile, email_signature_html:e.target.value})} />
      </div>

      <div className='flex justify-end'>
        <button onClick={save} className='px-4 py-2 bg-indigo-600 text-white rounded'>Save Settings</button>
      </div>
    </div>
  );
}