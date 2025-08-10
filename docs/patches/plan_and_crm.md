## Frontend wiring

1) Fetch plan once and gate features
```ts
useEffect(()=>{(async()=>{
  const r = await fetch('/api/me/plan',{cache:'no-store'}); const j = await r.json();
  if (j.success) {
    setUserPlan(j.plan); // 'trial'|'starter'|'pro'|'enterprise'
    setEntitlements(j.entitlements); // modes, companies, contacts, export
  }
})();},[]);
```

2) Add-to-CRM call
Keep your existing call to `/api/crm/contacts`. It now auto-resolves `company_id` from `company_name` and enforces RLS:
```ts
await fetch('/api/crm/contacts', {
  method: 'POST', headers: {'Content-Type':'application/json'},
  body: JSON.stringify({
    company_name: record.unified_company_name,
    full_name: record.contact_person,
    email: record.primary_email,
    phone: record.primary_phone,
    title: record.title,
    hs_code: record.hs_code,
    notes: 'Added from Trade Search'
  })
});
```

3) Search gating
If `entitlements.modes.air` is `false`, disable Air mode toggle and filter server queries accordingly.