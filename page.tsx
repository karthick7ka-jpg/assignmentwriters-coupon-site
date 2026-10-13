 "use client";
import { useEffect, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

type Coupon = {code:string;status:string;customer_id:string|null;created_at:string;customers?:{full_name:string;place:string;feedback:string}|null};
export default function Admin() {
  const [client,setClient] = useState<SupabaseClient|null>(null);
  const [email,setEmail] = useState(""); const [password,setPassword] = useState("");
  const [sessionToken,setSessionToken] = useState(""); const [coupons,setCoupons] = useState<Coupon[]>([]);
  const [message,setMessage] = useState(""); const [busy,setBusy] = useState(false);
  const [quantity,setQuantity] = useState("20");
  const [code,setCode] = useState(""); const [name,setName] = useState(""); const [place,setPlace] = useState(""); const [feedback,setFeedback] = useState("");
  useEffect(()=>{ if(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) setClient(createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)); },[]);
  async function refresh(token=sessionToken) {
    const res=await fetch("/api/admin",{headers:{Authorization:`Bearer ${token}`}});
    const data=await res.json(); if(!res.ok) throw new Error(data.error||"Could not load dashboard."); setCoupons(data.coupons||[]);
  }
  async function login(e:React.FormEvent) {
    e.preventDefault(); setBusy(true);setMessage("");
    try { if(!client) throw new Error("Add the Supabase settings to your environment first.");
      const {data,error}=await client.auth.signInWithPassword({email,password}); if(error||!data.session) throw new Error(error?.message||"Login failed.");
      setSessionToken(data.session.access_token); await refresh(data.session.access_token); setMessage("Signed in.");
    } catch(err){setMessage(err instanceof Error?err.message:"Login failed.");} finally{setBusy(false);}
  }
  async function action(payload:Record<string,unknown>) {
    setBusy(true);setMessage("");
    try { const res=await fetch("/api/admin",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${sessionToken}`},body:JSON.stringify(payload)});
      const data=await res.json();if(!res.ok)throw new Error(data.error||"Action failed.");
      if(data.coupons){setMessage("Generated coupon codes — copy/print the codes below.");setCoupons(prev=>[...data.coupons,...prev]);}
      else {setMessage(payload.action==="approve"?`Approved. Customer ID: ${data.customerId}`:"Updated successfully."); if(payload.action==="approve") {setCode("");setName("");setPlace("");setFeedback("");} await refresh();}
    } catch(err){setMessage(err instanceof Error?err.message:"Action failed.");} finally{setBusy(false);}
  }
  if(!sessionToken) return <main className="wrap"><div className="nav"><a className="brand" href="/">← AssignmentWriters.com</a></div><section className="panel hero"><h1>Owner dashboard</h1><p className="muted">Sign in with the owner account you create in Supabase Authentication.</p><form onSubmit={login}><input className="input" type="email" placeholder="Owner email" value={email} onChange={e=>setEmail(e.target.value)} required/><input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required/><button className="btn" style={{width:"100%"}} disabled={busy}>{busy?"Signing in…":"Sign in"}</button></form>{message&&<p className="notice error">{message}</p>}</section></main>;
  return <main className="wrap"><div className="nav"><div><div className="brand">AssignmentWriters.com</div><h1>Owner dashboard</h1></div><button className="btn secondary" onClick={async()=>{await client?.auth.signOut();setSessionToken("");setCoupons([]);}}>Sign out</button></div>
    {message&&<p className="notice">{message}</p>}
    <div className="grid">
      <section className="panel"><h2>1. Generate codes</h2><p className="muted">Codes start with PRSH and are not usable until approved.</p><label>How many codes?</label><input className="input" type="number" min="1" max="500" value={quantity} onChange={e=>setQuantity(e.target.value)}/><button className="btn" disabled={busy} onClick={()=>action({action:"generate",quantity:Number(quantity)})}>Generate coupon codes</button></section>
      <section className="panel"><h2>2. Approve feedback</h2><p className="muted">Review the photo in Instagram/WhatsApp first, then enter the details below.</p><form onSubmit={e=>{e.preventDefault();action({action:"approve",code,full_name:name,place,feedback});}}><input className="input" placeholder="Printed coupon code" value={code} onChange={e=>setCode(e.target.value.toUpperCase())} required/><input className="input" placeholder="Customer name" value={name} onChange={e=>setName(e.target.value)} required/><input className="input" placeholder="Place / city" value={place} onChange={e=>setPlace(e.target.value)} required/><textarea className="input" placeholder="Feedback written on card" value={feedback} onChange={e=>setFeedback(e.target.value)} required rows={3}/><button className="btn" disabled={busy}>Save details & approve</button></form></section>
    </div>
    <section className="panel" style={{marginTop:18}}><div className="row" style={{justifyContent:"space-between"}}><h2>Coupon list</h2><button className="btn secondary" onClick={()=>refresh()}>Refresh</button></div><p className="muted small">After you actually apply the 5% discount to the next order, mark that coupon as redeemed.</p>
    <div style={{overflowX:"auto"}}><table><thead><tr><th>Code</th><th>Status</th><th>Customer</th><th>Customer ID</th><th>Feedback details</th><th>Actions</th></tr></thead><tbody>{coupons.map(c=>{const customer=Array.isArray(c.customers)?c.customers[0]:c.customers;return <tr key={c.code}><td><strong>{c.code}</strong></td><td><span className={`status ${c.status}`}>{c.status}</span></td><td>{customer?.full_name||"—"}<br/><span className="muted small">{customer?.place||""}</span></td><td>{c.customer_id||"—"}</td><td>{customer?.feedback||"—"}</td><td><div className="row">{c.status==="approved"&&<button className="btn" disabled={busy} onClick={()=>{if(confirm("Only continue if you have applied the discount to the customer's next order. Mark as redeemed?")) action({action:"mark-redeemed",code:c.code});}}>Mark redeemed</button>}{["generated","approved"].includes(c.status)&&<button className="btn secondary" disabled={busy} onClick={()=>{if(confirm("Deactivate this coupon?"))action({action:"deactivate",code:c.code});}}>Deactivate</button>}</div></td></tr>})}</tbody></table></div></section>
    <p className="muted small">Keep the admin login private. Codes shown as generated are not active until feedback is approved.</p>
  </main>;
}