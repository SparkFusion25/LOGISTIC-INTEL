'use client';
import useSWR from 'swr';
const fetcher=(url:string)=>fetch(url).then(r=>r.json());

export default function AffiliatePage(){
  const { data } = useSWR('/api/admin/affiliates',fetcher); // RLS shows only own via policies if not admin
  const myLinks = (data?.links||[]); const myReferrals = (data?.referrals||[]);
  return (
    <div className='max-w-3xl mx-auto p-6 space-y-6'>
      <h1 className='text-2xl font-bold'>Affiliate Dashboard</h1>
      <div className='bg-white border rounded p-4'>
        <h2 className='font-semibold mb-2'>Your Links</h2>
        <ul className='text-sm space-y-1'>
          {myLinks.map((l:any)=> <li key={l.id} className='flex items-center justify-between'><span>/{l.code}</span><span className='text-gray-500'>{l.is_active?'active':'inactive'}</span></li>)}
        </ul>
      </div>
      <div className='bg-white border rounded p-4'>
        <h2 className='font-semibold mb-2'>Referrals</h2>
        <ul className='text-sm space-y-1'>
          {myReferrals.map((r:any)=> <li key={r.id} className='flex items-center justify-between'><span>{r.plan||'—'}</span><span className='text-gray-500'>${r.amount_usd||0} → ${r.commission_usd||0}</span></li>)}
        </ul>
      </div>
    </div>
  );
}