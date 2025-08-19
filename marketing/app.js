// App.js
const { useState, useEffect, useMemo } = React;
const { BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } = Recharts;

// ---------- Helpers ----------
const cls = (...xs) => xs.filter(Boolean).join(" ");
const platforms = [
  { key: "facebook", label: "Facebook", hint: "Pages & Groups" },
  { key: "instagram", label: "Instagram", hint: "Business" },
  { key: "x", label: "X (Twitter)", hint: "API v2" },
  { key: "tiktok", label: "TikTok", hint: "Upload API" },
  { key: "youtube", label: "YouTube", hint: "For DRFTube" },
  { key: "telegram", label: "Telegram", hint: "Channel/Bot" },
];
const hashtagSuggestions = ["#DigitalRufiya","#DRFMedia","#DRFTube","#Crypto","#Web3","#Maldives","#BSC","#DeFi"];
const demoStats = [
  { name: "Mon", impressions: 2100, engagement: 220 },
  { name: "Tue", impressions: 3400, engagement: 410 },
  { name: "Wed", impressions: 2900, engagement: 380 },
  { name: "Thu", impressions: 4100, engagement: 520 },
  { name: "Fri", impressions: 4700, engagement: 680 },
  { name: "Sat", impressions: 3900, engagement: 430 },
  { name: "Sun", impressions: 5200, engagement: 800 },
];
const pieData = [
  { name: "TikTok", value: 36 },
  { name: "YouTube", value: 22 },
  { name: "Facebook", value: 18 },
  { name: "Instagram", value: 14 },
  { name: "X", value: 6 },
  { name: "Telegram", value: 4 },
];
const pieColors = ["#60a5fa","#34d399","#a78bfa","#fbbf24","#f87171","#22d3ee"];

function formatNumber(n){try{return new Intl.NumberFormat().format(n);}catch{return String(n);}}
function makePostPayload({ text, hashtags, image, video, links, platforms }) {
  return {
    id:`post_${Date.now()}`, text, hashtags,
    image:image?{name:image.name,size:image.size}:null,
    video:video?{name:video.name,size:video.size}:null,
    links, platforms, createdAt:new Date().toISOString()
  };
}
function notify(setToast, msg){setToast(msg);}

// ---------- Components ----------
function Header(){ return (
  <div className="bg-white rounded-2xl p-4 shadow-sm border flex justify-between items-center">
    <div>
      <h2 className="font-semibold text-lg">Welcome, Hassan 👋</h2>
      <p className="text-slate-500 text-sm">Ship your DRF content everywhere in one click.</p>
    </div>
    <button className="px-3 py-2 rounded-xl border bg-white hover:bg-slate-50">Logout</button>
  </div>
);}

function Sidebar({ active, setActive }){
  const items=[
    {label:"Dashboard",key:"home"}, {label:"Create Post",key:"create"},
    {label:"Schedule",key:"schedule"}, {label:"Analytics",key:"analytics"},
    {label:"Settings",key:"settings"},
  ];
  return (
    <div className="w-64 bg-white p-4 shadow-sm border flex flex-col gap-2">
      <h1 className="font-bold text-xl mb-4">DRF Marketing</h1>
      {items.map(i=>(
        <button key={i.key} onClick={()=>setActive(i.key)} className={cls("text-left px-3 py-2 rounded-xl",active===i.key?"bg-slate-900 text-white":"hover:bg-slate-50")}>
          {i.label}
        </button>
      ))}
      <p className="text-xs text-slate-400 mt-4">Tips: Post daily + 1 weekly giveaway</p>
    </div>
  );
}

function QuickStats({ totalFollowers, todayEngagement, bestPost }){
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-2xl shadow-sm border">
        <h3 className="font-semibold text-sm">Total Followers</h3>
        <p className="text-lg font-bold">{formatNumber(totalFollowers)}</p>
      </div>
      <div className="bg-white p-4 rounded-2xl shadow-sm border">
        <h3 className="font-semibold text-sm">Engagement Today</h3>
        <p className="text-lg font-bold">{formatNumber(todayEngagement)}</p>
      </div>
      <div className="bg-white p-4 rounded-2xl shadow-sm border">
        <h3 className="font-semibold text-sm">Best Post</h3>
        <p className="text-sm">{bestPost?.text || "(No posts yet)"}</p>
      </div>
    </div>
  );
}

function CreatePost({ connected, onPost, onSchedule }){
  const [text,setText]=useState(""); const [hashtags,setHashtags]=useState(["#DigitalRufiya","#DRFMedia","#DRFTube"]);
  const [image,setImage]=useState(null); const [video,setVideo]=useState(null); const [links,setLinks]=useState("");
  const [targetPlatforms,setTargetPlatforms]=useState(()=>Object.fromEntries(Object.keys(connected).map(k=>[k,connected[k]])));
  const [schedule,setSchedule]=useState({enabled:false,date:"",time:""});
  useEffect(()=>{setTargetPlatforms(Object.fromEntries(Object.keys(connected).map(k=>[k,connected[k]])));},[connected]);
  const selectedPlatforms=useMemo(()=>Object.entries(targetPlatforms).filter(([,v])=>v).map(([k])=>k),[targetPlatforms]);

  const clearForm=()=>{setText(""); setHashtags(["#DigitalRufiya","#DRFMedia","#DRFTube"]); setImage(null); setVideo(null); setLinks("");
    setTargetPlatforms(Object.fromEntries(Object.keys(connected).map(k=>[k,connected[k]]))); setSchedule({enabled:false,date:"",time:""});};

  const handlePostNow=()=>{const payload=makePostPayload({text,hashtags,image,video,links,platforms:selectedPlatforms}); onPost(payload); clearForm();};
  const handleSchedulePost=()=>{if(!schedule.date||!schedule.time)return; const when=new Date(`${schedule.date}T${schedule.time}`); const item={id:`sch_${Date.now()}`, text, hashtags, links, hasImage:!!image, hasVideo:!!video, platforms:selectedPlatforms, runAt:when.toISOString(), createdAt:new Date().toISOString()}; onSchedule(item); clearForm();};

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl shadow-sm border space-y-3">
        <div>
          <label className="text-xs text-slate-500">Text</label>
          <textarea value={text} onChange={e=>setText(e.target.value)} className="w-full rounded-xl border p-2"></textarea>
        </div>
        <div>
          <label className="text-xs text-slate-500">Hashtags</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {hashtags.map((h,i)=><span key={i} className="px-2 py-1 rounded-full bg-slate-100">{h}</span>)}
          </div>
          <div className="flex gap-2 mt-2">
            <input placeholder="#AddYourTag" onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault(); const val=e.currentTarget.value.trim(); if(val)setHashtags(hs=>[...hs,val.startsWith("#")?val:"#"+val]); e.currentTarget.value="";}}} className="flex-1 rounded-xl border px-3 py-2"/>
            <button onClick={()=>setHashtags(Array.from(new Set([...hashtags,...hashtagSuggestions])))} className="px-3 py-2 rounded-xl border bg-white">Add Suggestions</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2 px-3 py-2 border rounded-xl cursor-pointer">Image
            <input type="file" accept="image/*" className="hidden" onChange={e=>setImage(e.target.files[0]||null)}/>
            {image&&<span className="text-xs">{image.name}</span>}
          </label>
          <label className="flex items-center gap-2 px-3 py-2 border rounded-xl cursor-pointer">Video
            <input type="file" accept="video/*" className="hidden" onChange={e=>setVideo(e.target.files[0]||null)}/>
            {video&&<span className="text-xs">{video.name}</span>}
          </label>
        </div>
        <div>
          <label className="text-xs text-slate-500">Links</label>
          <input value={links} onChange={e=>setLinks(e.target.value)} className="w-full rounded-xl border px-3 py-2" placeholder="https://drfchain.org"/>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {platforms.map(p=>(
            <button key={p.key} onClick={()=>setTargetPlatforms(s=>({...s,[p.key]:!s[p.key]}))} className={cls("px-3 py-2 rounded-xl border",targetPlatforms[p.key]?"bg-slate-900 text-white":"bg-white hover:bg-slate-50")}>
              <div className="text-sm font-medium">{p.label}</div>
              <div className="text-[10px] opacity-70">{p.hint}</div>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {!schedule.enabled?<button onClick={handlePostNow} className="px-4 py-2 rounded-2xl bg-slate-900 text-white">Post Now</button>:<button onClick={handleSchedulePost} className="px-4 py-2 rounded-2xl bg-slate-900 text-white">Schedule</button>}
          <button onClick={clearForm} className="px-4 py-2 rounded-2xl border">Reset</button>
        </div>
      </div>
      {/* Live Preview */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border">
        <h3 className="font-semibold mb-2">Live Preview</h3>
        <div className="rounded-xl border bg-slate-50 p-3 space-y-2">
          <div>{text||"(Your post text will appear here)"}</div>
          <div className="flex flex-wrap gap-2">{hashtags.map((h,i)=><span key={i} className="px-2 py-1 rounded-full bg-white border">{h}</span>)}</div>
          {links&&<div className="text-xs text-slate-600 break-all">Links: {links}</div>}
          <div className="text-xs text-slate-500">Platforms: {selectedPlatforms.length?selectedPlatforms.join(","):"(none)"}</div>
        </div>
      </div>
    </div>
  );
}

// ---------- Toast ----------
function Toast({ toast, onClose }){
  useEffect(()=>{if(!toast)return; const t=setTimeout(onClose,2200); return()=>clearTimeout(t);},[toast]);
  if(!toast)return null;
  return <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-2xl">{toast}</div>;
}

// ---------- Main App ----------
function DRFMarketingDashboard(){
  const [active,setActive]=useState("home");
  const [connected,setConnected]=useState({facebook:false,instagram:false,x:false,tiktok:false,youtube:false,telegram:false});
  const [scheduled,setScheduled]=useState([]);
  const [posts,setPosts]=useState([]);
  const [toast,setToast]=useState(null);

  const totalFollowers=12800; const todayEngagement=1540; const bestPost=posts[0];

  return (
    <div className="min-h-screen flex gap-4 p-4 bg-slate-100">
      <Sidebar active={active} setActive={setActive}/>
      <div className="flex-1 space-y-4">
        <Header/>
        {active==="home"&&<QuickStats totalFollowers={totalFollowers} todayEngagement={todayEngagement} bestPost={bestPost}/>}
        {active==="create"&&<CreatePost connected={connected} onPost={p=>{setPosts(prev=>[p,...prev].slice(0,50));notify(setToast,"Posted (demo)")}} onSchedule={item=>{setScheduled(prev=>[item,...prev]);notify(setToast,"Scheduled (demo)")}}/>}
      </div>
      <Toast toast={toast} onClose={()=>setToast(null)}/>
    </div>
  );
}

// ---------- Render ----------
ReactDOM.render(<DRFMarketingDashboard/>,document.getElementById("root"));
