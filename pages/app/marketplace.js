import { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';

export default function Page(){
 const [data,setData]=useState({listings:[],opportunities:[]});
 const [listingTitle,setListingTitle]=useState('Prime mixed-use plot');
 const [opportunityTitle,setOpportunityTitle]=useState('JV coastal mixed-use opportunity');
 async function load(){ const token=localStorage.getItem('atlas_token'); const r=await fetch('/api/marketplace',{headers:{Authorization:`Bearer ${token}`}}); setData(await r.json()); }
 useEffect(()=>{load();},[]);
 async function addListing(){ const token=localStorage.getItem('atlas_token'); await fetch('/api/marketplace',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({title:listingTitle,payload:{location:'Lagos',assetType:'Mixed Use'}})}); load(); }
 async function addOpportunity(){ const token=localStorage.getItem('atlas_token'); await fetch('/api/marketplace',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({kind:'opportunity',title:opportunityTitle,type:'JV',payload:{targetIRR:'22%'}})}); load(); }
 return <main className="min-h-screen bg-slate-950 text-white"><NavBar /><section className="mx-auto max-w-5xl px-6 py-12"><h1 className="text-3xl font-bold capitalize">Marketplace</h1><div className="mt-4 grid gap-3 md:grid-cols-2"><div className="rounded border border-white/10 p-3"><h2 className="font-semibold">Create Listing</h2><input className="mt-2 w-full rounded bg-slate-900 px-3 py-2" value={listingTitle} onChange={(e)=>setListingTitle(e.target.value)} /><button className="mt-2 rounded bg-cyan-500 px-3 py-2" onClick={addListing}>Publish listing</button></div><div className="rounded border border-white/10 p-3"><h2 className="font-semibold">Create Opportunity</h2><input className="mt-2 w-full rounded bg-slate-900 px-3 py-2" value={opportunityTitle} onChange={(e)=>setOpportunityTitle(e.target.value)} /><button className="mt-2 rounded border border-cyan-300 px-3 py-2" onClick={addOpportunity}>Publish opportunity</button></div></div><h2 className="mt-6 font-semibold">Listings</h2><ul className="mt-2 space-y-2">{data.listings.map((x)=><li key={x.id} className="rounded border border-white/10 p-2">{x.title} · {x.status}</li>)}</ul><h2 className="mt-6 font-semibold">Opportunities</h2><ul className="mt-2 space-y-2">{data.opportunities.map((x)=><li key={x.id} className="rounded border border-white/10 p-2">{x.title} · {x.type} · {x.status}</li>)}</ul></section></main>
}
