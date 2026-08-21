"use client";
import {useMemo, useState} from "react";
import {createClient} from "@/lib/supabase/client";

type Session = {id:string; minutes:number; completed_at:string};
type Profile = {name:string; age:number; profession:string} | null;

export default function DashboardClient({user, profile, sessions}:{user:any; profile:Profile; sessions:Session[]}) {
  const [name,setName]=useState(profile?.name ?? "");
  const [age,setAge]=useState(profile?.age?.toString() ?? "");
  const [profession,setProfession]=useState(profile?.profession ?? "");
  const [showOnboarding,setShowOnboarding]=useState(!profile);
  const [running,setRunning]=useState(false);
  const [remaining,setRemaining]=useState(5*60);
  const [duration,setDuration]=useState(5);
  const [localSessions,setLocalSessions]=useState(sessions);
  const supabase=createClient();

  const stats=useMemo(()=>{
    const total=localSessions.reduce((s,x)=>s+x.minutes,0);
    const days=new Set(localSessions.map(x=>new Date(x.completed_at).toISOString().slice(0,10)));
    let streak=0, d=new Date();
    const today=d.toISOString().slice(0,10);
    if(!days.has(today)) d.setDate(d.getDate()-1);
    while(days.has(d.toISOString().slice(0,10))){streak++;d.setDate(d.getDate()-1);}
    return {total,sessions:localSessions.length,streak,goal:Math.min(100,Math.round(total/70*100))};
  },[localSessions]);

  async function saveProfile() {
    if(!name.trim() || !age || !profession) return;
    const {error}=await supabase.from("profiles").upsert({
      id:user.id,name:name.trim(),age:Number(age),profession
    });
    if(!error) setShowOnboarding(false);
  }

  async function completeSession() {
    setRunning(false); setRemaining(duration*60);
    const {data,error}=await supabase.from("meditation_sessions").insert({
      user_id:user.id, minutes:duration
    }).select("id,minutes,completed_at").single();
    if(!error && data) setLocalSessions([data,...localSessions]);
  }

  function start() {
    setRunning(true);
    let left=remaining;
    const timer=setInterval(()=>{
      left--;
      setRemaining(left);
      if(left<=0){clearInterval(timer);completeSession();}
    },1000);
  }

  const mm=String(Math.floor(remaining/60)).padStart(2,"0");
  const ss=String(remaining%60).padStart(2,"0");

  return <main className="app-shell">
    <header className="topbar">
      <div><div className="brand">🌿 CalmFlow</div><p>Mindfulness for busy lives.</p></div>
      <form action="/auth/signout" method="post"><button className="secondary">Sign out</button></form>
    </header>

    <section className="hero">
      <div><span className="eyebrow">PERSONALIZED WELLNESS</span>
      <h1>Good Morning, {profile?.name || "there"} 🌿</h1>
      <p>Take a few minutes to slow down, breathe comfortably and reconnect with the present moment.</p></div>
      <div className="hero-art">🧘</div>
    </section>

    <section className="stats">
      <article><b>🔥 {stats.streak}</b><span>day streak</span></article>
      <article><b>⏱️ {stats.total}</b><span>minutes completed</span></article>
      <article><b>🧘 {stats.sessions}</b><span>sessions completed</span></article>
      <article><b>🌱 {stats.goal}%</b><span>weekly goal</span></article>
    </section>

    <section className="content-grid">
      <article className="card">
        <h2>Quick Calm</h2><p>Choose a session that fits your schedule.</p>
        <div className="chips">
          {[2,5,10].map(m=><button key={m} onClick={()=>{setDuration(m);setRemaining(m*60);setRunning(false)}} className={duration===m?"chip active":"chip"}>{m} min</button>)}
        </div>
        <div className="timer">{mm}:{ss}</div>
        <button className="primary" onClick={running?undefined:start}>{running?"Breathe…":"Start meditation"}</button>
        <p className="hint">Your progress increases only after the full session is completed.</p>
      </article>

      <article className="card">
        <h2>Your progress</h2>
        <div className="progress"><span style={{width:`${stats.goal}%`}}/></div>
        <p>{stats.total} of 70 minutes toward your weekly goal.</p>
        <h3>Recent sessions</h3>
        {localSessions.slice(0,5).map(s=><div className="row" key={s.id}><span>{new Date(s.completed_at).toLocaleDateString()}</span><b>{s.minutes} min</b></div>)}
        {!localSessions.length && <p className="muted">No completed sessions yet. Your dashboard starts at zero.</p>}
      </article>
    </section>

    <section className="card">
      <h2>Peaceful sound ideas</h2>
      <div className="sound-grid"><div>🌧️ Rain</div><div>🌊 Ocean</div><div>🌲 Forest</div><div>🔥 Fireplace</div></div>
      <p className="hint">For production audio, upload licensed sound files to your storage bucket rather than using copyrighted music without permission.</p>
    </section>

    {showOnboarding && <div className="overlay"><div className="modal">
      <div className="brand">🌿 CalmFlow</div><h2>Tell us about yourself</h2><p>We use this information to personalize your experience.</p>
      <label>Name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/></label>
      <label>Age<input value={age} onChange={e=>setAge(e.target.value)} type="number" min="5" max="120"/></label>
      <label>Profession<select value={profession} onChange={e=>setProfession(e.target.value)}><option value="">Choose one</option><option>Student</option><option>Corporate Worker</option><option>Teacher</option><option>Doctor</option><option>Engineer</option><option>Business Owner</option><option>Parent / Homemaker</option><option>Freelancer</option><option>Retired</option><option>Other</option></select></label>
      <button className="primary" onClick={saveProfile}>Continue</button>
    </div></div>}
  </main>
}
