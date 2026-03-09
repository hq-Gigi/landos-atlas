import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import NavBar from '../../../../components/NavBar';

export default function Page(){
 const {query}=useRouter();
 const [data,setData]=useState({comments:[],tasks:[],activity:[]});
 const [body,setBody]=useState('');
 const [task,setTask]=useState('');
 async function load(){ const token=localStorage.getItem('atlas_token'); const r=await fetch(`/api/projects/${query.projectId}/collaboration`,{headers:{Authorization:`Bearer ${token}`}}); setData(await r.json()); }
 useEffect(()=>{ if(query.projectId) load(); },[query.projectId]);
 async function post(){ const token=localStorage.getItem('atlas_token'); await fetch(`/api/projects/${query.projectId}/collaboration`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({body})}); setBody(''); load(); }
 async function createTask(){ const token=localStorage.getItem('atlas_token'); await fetch(`/api/projects/${query.projectId}/collaboration`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({type:'task',title:task})}); setTask(''); load(); }
 return <main className="min-h-screen bg-slate-950 text-white"><NavBar /><section className="mx-auto max-w-5xl px-6 py-12"><h1 className="text-3xl font-bold capitalize">Collaboration</h1><div className="mt-3 flex gap-2"><input className="flex-1 rounded bg-slate-900 px-3 py-2" value={body} onChange={(e)=>setBody(e.target.value)} placeholder="Comment" /><button className="rounded bg-cyan-500 px-3" onClick={post}>Add comment</button></div><div className="mt-3 flex gap-2"><input className="flex-1 rounded bg-slate-900 px-3 py-2" value={task} onChange={(e)=>setTask(e.target.value)} placeholder="Task title" /><button className="rounded border border-cyan-300 px-3" onClick={createTask}>Create task</button></div><h2 className="mt-6 font-semibold">Comments</h2><div className="mt-2 space-y-2">{data.comments.map((c)=><div key={c.id} className="rounded border border-white/10 p-2">{c.body}</div>)}</div><h2 className="mt-6 font-semibold">Tasks</h2><div className="mt-2 space-y-2">{data.tasks.map((t)=><div key={t.id} className="rounded border border-white/10 p-2">{t.title} · {t.status}</div>)}</div><h2 className="mt-6 font-semibold">Activity</h2><div className="mt-2 space-y-2">{data.activity.map((a)=><div key={a.id} className="rounded border border-white/10 p-2">{a.action}</div>)}</div></section></main>
}
