'use client';
import { useEffect, useState } from 'react';
export default function AdminPage(){
  const [users,setUsers]=useState<any[]>([]);
  useEffect(()=>{(async()=>{ const r=await fetch('/api/admin/users'); const j=await r.json(); if(j.success) setUsers(j.users);} )();},[]);
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin</h1>
      <div className="bg-white border rounded">
        <div className="p-4 font-semibold">Users</div>
        <table className="w-full text-sm"><thead><tr className="bg-gray-50"><th className="p-2 text-left">Name</th><th className="p-2">Email</th><th className="p-2">Role</th><th className="p-2">Plan</th></tr></thead><tbody>
          {users.map(u=> (
            <tr key={u.id} className="border-t"><td className="p-2">{u.full_name||'-'}</td><td className="p-2">{u.email}</td><td className="p-2">{u.role}</td><td className="p-2">{u.plan}</td></tr>
          ))}
        </tbody></table>
      </div>
    </div>
  );
}