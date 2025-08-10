'use client';
import useSWR from 'swr';
const fetcher=(url:string)=>fetch(url).then(r=>r.json());

export default function AdminPage(){
  const { data:users } = useSWR('/api/admin/users',fetcher);
  const { data:subs } = useSWR('/api/admin/subscriptions',fetcher);
  const { data:aff } = useSWR('/api/admin/affiliates',fetcher);
  const { data:codes, mutate:mutateCodes } = useSWR('/api/admin/promo-codes',fetcher);

  async function createPromo(){
    const code = prompt('Code (e.g. LAUNCH20)'); if(!code) return;
    await fetch('/api/admin/promo-codes',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ code, percent_off:20 }) });
    mutateCodes();
  }

  return (
    <div className='p-6 space-y-8'>
      <h1 className='text-2xl font-bold'>Admin</h1>

      <section className='bg-white border rounded p-4'>
        <h2 className='font-semibold mb-2'>Users</h2>
        <div className='text-sm text-gray-600'>Total: {users?.users?.length||0}</div>
      </section>

      <section className='bg-white border rounded p-4'>
        <h2 className='font-semibold mb-2'>Subscriptions</h2>
        <div className='text-sm text-gray-600'>Active rows: {subs?.subscriptions?.length||0}</div>
      </section>

      <section className='bg-white border rounded p-4'>
        <div className='flex items-center justify-between'>
          <h2 className='font-semibold'>Promo Codes</h2>
          <button onClick={createPromo} className='px-3 py-1.5 bg-indigo-600 text-white rounded text-sm'>New Code</button>
        </div>
        <ul className='mt-3 space-y-1 text-sm'>
          {(codes?.codes||[]).map((c:any)=> (
            <li key={c.id} className='flex items-center justify-between border-b py-1'>
              <div>{c.code} {c.percent_off?`- ${c.percent_off}%`:''}</div>
              <div className='text-gray-500'>Used {c.redemptions_used||0}{c.max_redemptions?`/${c.max_redemptions}`:''}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className='bg-white border rounded p-4'>
        <h2 className='font-semibold mb-2'>Affiliates</h2>
        <div className='text-sm text-gray-600 mb-2'>Accounts: {aff?.accounts?.length||0} · Links: {aff?.links?.length||0} · Referrals: {aff?.referrals?.length||0}</div>
      </section>
    </div>
  );
}