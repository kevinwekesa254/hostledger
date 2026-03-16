import { useState, useMemo } from "react";

/* ─── TOKENS ──────────────────────────────────────────────────────────── */
const T = {
  bg:"#F8FAFC", surface:"#FFFFFF", card:"#FFFFFF", surfaceAlt:"#F1F5F9",
  border:"#E2E8F0", borderMid:"#CBD5E1",
  ink:"#0F172A", inkMid:"#475569", inkLight:"#94A3B8",
  primary:"#4F46E5", primaryBg:"#EEF2FF", primaryBorder:"#C7D2FE",
  green:"#059669",  greenBg:"#D1FAE5",  greenBorder:"#6EE7B7",
  red:"#DC2626",    redBg:"#FEE2E2",    redBorder:"#FCA5A5",
  amber:"#D97706",  amberBg:"#FEF3C7",  amberBorder:"#FDE68A",
  blue:"#2563EB",   blueBg:"#EFF6FF",   blueBorder:"#BFDBFE",
  purple:"#7C3AED", purpleBg:"#F5F3FF", purpleBorder:"#DDD6FE",
  teal:"#0D9488",   tealBg:"#F0FDFA",   tealBorder:"#99F6E4",
  pink:"#DB2777",   pinkBg:"#FDF2F8",   pinkBorder:"#F9A8D4",
};
const FD="'Playfair Display',Georgia,serif";
const FB="'IBM Plex Sans',system-ui,sans-serif";
const FM="'IBM Plex Mono','Courier New',monospace";

/* ─── GLOBAL CSS ─────────────────────────────────────────────────────── */
const GLOBAL_CSS=`
  *,*::before,*::after{box-sizing:border-box;}
  input,select,textarea{font-family:'IBM Plex Sans',system-ui,sans-serif;}
  input:focus,select:focus,textarea:focus{outline:none!important;border-color:#4F46E5!important;box-shadow:0 0 0 3px rgba(79,70,229,0.12)!important;}
  .tbl-row:hover td{background:#F1F5F9!important;}
  .btn-primary:hover:not(:disabled){background:#3730A3!important;border-color:#3730A3!important;}
  .btn-default:hover:not(:disabled){background:#F1F5F9!important;}
  .btn-green:hover:not(:disabled){background:#A7F3D0!important;}
  .btn-red:hover:not(:disabled){background:#FECACA!important;}
  .btn-blue:hover:not(:disabled){background:#DBEAFE!important;}
  .btn-amber:hover:not(:disabled){background:#FDE68A!important;}
  .btn-ghost:hover:not(:disabled){background:#F1F5F9!important;color:#475569!important;}
  .tab-btn:hover{color:#0F172A!important;}
  .sett-tab:hover{background:#F1F5F9!important;color:#0F172A!important;}
  .prop-card{transition:box-shadow 0.2s ease,transform 0.2s ease;}
  .prop-card:hover{box-shadow:0 8px 30px rgba(15,23,42,0.1)!important;transform:translateY(-2px);}
  button{transition:all 0.15s ease;cursor:pointer;}
  ::-webkit-scrollbar{width:5px;height:5px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:3px;}
  ::-webkit-scrollbar-thumb:hover{background:#94A3B8;}
`;

/* ─── BOOKING STATUSES ───────────────────────────────────────────────── */
const BOOKING_STATUSES={
  confirmed:  {label:"Confirmed",  color:T.blue,  bg:T.blueBg,  icon:"✓" },
  checked_in: {label:"Checked In", color:T.green, bg:T.greenBg, icon:"🏠"},
  checked_out:{label:"Checked Out",color:T.teal,  bg:T.tealBg,  icon:"✔" },
  cancelled:  {label:"Cancelled",  color:T.red,   bg:T.redBg,   icon:"✕" },
  pending:    {label:"Pending",    color:T.amber, bg:T.amberBg, icon:"⏳"},
  no_show:    {label:"No Show",    color:T.purple,bg:T.purpleBg,icon:"!" },
};
const PAYMENT_STATUSES={
  paid:    {label:"Paid",    color:T.green, bg:T.greenBg},
  pending: {label:"Pending", color:T.amber, bg:T.amberBg},
  partial: {label:"Partial", color:T.blue,  bg:T.blueBg },
  refunded:{label:"Refunded",color:T.red,   bg:T.redBg  },
  overdue: {label:"Overdue", color:T.red,   bg:T.redBg  },
};
const PAYMENT_METHODS=["Platform Payout","Bank Transfer","M-Pesa","Cash","Card","Cheque","Other"];
const ID_TYPES=["Passport","National ID","Driver's License","Other"];

/* ─── DEFAULT SETTINGS ───────────────────────────────────────────────── */
const DEFAULT_SETTINGS = {
  owners:[
    {id:"o1",name:"Self",       color:"#1A7A4A",email:"",phone:"",note:"Personal portfolio"},
    {id:"o2",name:"Wanjiku M.", color:"#DB2777",email:"wanjiku@email.com",phone:"+254 722 000 001",note:"Managed client"},
    {id:"o3",name:"Otieno R.",  color:"#0891B2",email:"otieno@email.com", phone:"+254 722 000 002",note:"Managed client"},
    {id:"o4",name:"Kamau J.",   color:"#7C3AED",email:"kamau@email.com",  phone:"+254 722 000 003",note:"Managed client"},
  ],
  propertyTypes:["Studio","Apartment","Cottage","Villa","Bungalow","House","Cabin","Penthouse","Riad","Hostel","Guesthouse","Other"],
  incomeCategories:[
    {id:"ic1",name:"Airbnb",          icon:"🏠",color:"#FF5A5F",taxable:true },
    {id:"ic2",name:"Booking.com",     icon:"🔵",color:"#003580",taxable:true },
    {id:"ic3",name:"Direct Booking",  icon:"📞",color:"#1A7A4A",taxable:true },
    {id:"ic4",name:"Vrbo",            icon:"🏡",color:"#1C5799",taxable:true },
    {id:"ic5",name:"Expedia",         icon:"✈️",color:"#FFC72C",taxable:true },
    {id:"ic6",name:"Security Deposit",icon:"🔒",color:"#9C9690",taxable:false},
    {id:"ic7",name:"Other",           icon:"💰",color:"#5C574F",taxable:true },
  ],
  expenseCategories:[
    {id:"ec1", name:"Cleaning",      icon:"🧹",color:"#0891B2",deductible:true, note:"Cleaning & laundry fees"},
    {id:"ec2", name:"Maintenance",   icon:"🔧",color:"#D97706",deductible:true, note:"Repairs and upkeep"},
    {id:"ec3", name:"Utilities",     icon:"💡",color:"#7C3AED",deductible:true, note:"Electricity, water, gas"},
    {id:"ec4", name:"Insurance",     icon:"🛡️",color:"#1D4ED8",deductible:true, note:"Property insurance premiums"},
    {id:"ec5", name:"Furnishing",    icon:"🛋️",color:"#DB2777",deductible:true, note:"Furniture & equipment"},
    {id:"ec6", name:"Platform Fees", icon:"📱",color:"#EA580C",deductible:true, note:"Airbnb, Booking.com fees"},
    {id:"ec7", name:"Supplies",      icon:"🧴",color:"#059669",deductible:true, note:"Toiletries, kitchen supplies"},
    {id:"ec8", name:"Mortgage/Rent", icon:"🏦",color:"#BE185D",deductible:false,note:"Mortgage payments"},
    {id:"ec9", name:"Property Tax",  icon:"📋",color:"#9333EA",deductible:true, note:"Annual property rates"},
    {id:"ec10",name:"WiFi/Cable",    icon:"📶",color:"#0F766E",deductible:true, note:"Internet & TV subscriptions"},
    {id:"ec11",name:"Pest Control",  icon:"🐛",color:"#B45309",deductible:true, note:"Pest management services"},
    {id:"ec12",name:"Management Fee",icon:"👤",color:"#6366F1",deductible:true, note:"Property management fees"},
    {id:"ec13",name:"Other",         icon:"📦",color:"#5C574F",deductible:true, note:"Miscellaneous expenses"},
  ],
  tax:{
    jurisdiction:"Kenya (KRA)",taxYear:new Date().getFullYear(),
    taxRate:10,vatRate:16,applyVAT:false,vatThreshold:5000000,
    method:"cash",currency:"KES",withholdingTax:7.5,includeWithholding:true,
    disclaimer:"Estimated figures only. Consult a licensed tax professional or accountant for official KRA filings.",
    customNotes:"",
  },
  currencies:{
    KES:{symbol:"KES",name:"Kenyan Shilling",  rate:1,      flag:"🇰🇪",active:true },
    USD:{symbol:"USD",name:"US Dollar",         rate:0.00775,flag:"🇺🇸",active:true },
    AED:{symbol:"AED",name:"UAE Dirham",        rate:0.0285, flag:"🇦🇪",active:true },
    GBP:{symbol:"GBP",name:"British Pound",     rate:0.0061, flag:"🇬🇧",active:true },
    EUR:{symbol:"EUR",name:"Euro",              rate:0.0071, flag:"🇪🇺",active:true },
    TZS:{symbol:"TZS",name:"Tanzanian Shilling",rate:20.5,   flag:"🇹🇿",active:false},
    UGX:{symbol:"UGX",name:"Ugandan Shilling",  rate:28.9,   flag:"🇺🇬",active:false},
  },
  app:{
    appName:"HostLedger PRO",defaultCurrency:"KES",dateFormat:"YYYY-MM-DD",
    fiscalYearStart:"January",showOccupancyTarget:true,occupancyTarget:75,
    managementFeeRate:10,autoCalcMgmtFee:false,
  },
};

/* ─── PROPERTIES ──────────────────────────────────────────────────────── */
const DEFAULT_PROPERTIES=[
  {id:1, name:"The Ivory Loft",        location:"Westlands, Nairobi",  type:"Studio",   beds:1,baths:1,sqm:45, ownerId:"o1",emoji:"🏙️",color:"#6366F1",nightly:6500 },
  {id:2, name:"Lavender Garden Suite", location:"Karen, Nairobi",      type:"Apartment",beds:2,baths:2,sqm:85, ownerId:"o1",emoji:"🌿",color:"#059669",nightly:9500 },
  {id:3, name:"Riverside Cottage",     location:"Runda, Nairobi",      type:"Cottage",  beds:3,baths:2,sqm:120,ownerId:"o1",emoji:"🏡",color:"#D97706",nightly:14000},
  {id:4, name:"The Coral House",       location:"Nyali, Mombasa",      type:"Villa",    beds:4,baths:3,sqm:200,ownerId:"o2",emoji:"🐚",color:"#DB2777",nightly:22000},
  {id:5, name:"Savanna View Flat",     location:"Kilimani, Nairobi",   type:"Apartment",beds:2,baths:1,sqm:70, ownerId:"o3",emoji:"🌅",color:"#EA580C",nightly:8500 },
  {id:6, name:"Diani Beach Bungalow",  location:"Ukunda, Mombasa",     type:"Bungalow", beds:3,baths:2,sqm:150,ownerId:"o2",emoji:"🏖️",color:"#0891B2",nightly:18000},
  {id:7, name:"Naivasha Lake House",   location:"Naivasha",            type:"House",    beds:4,baths:3,sqm:180,ownerId:"o1",emoji:"🦒",color:"#7C3AED",nightly:16000},
  {id:8, name:"Gigiri Executive Apt",  location:"Gigiri, Nairobi",     type:"Apartment",beds:2,baths:2,sqm:95, ownerId:"o4",emoji:"🏛️",color:"#BE185D",nightly:11000},
  {id:9, name:"Maasai Mara Camp",      location:"Narok",               type:"Cabin",    beds:2,baths:1,sqm:60, ownerId:"o1",emoji:"🦁",color:"#B45309",nightly:19000},
  {id:10,name:"Kileleshwa Penthouse",  location:"Kileleshwa, Nairobi", type:"Penthouse",beds:3,baths:2,sqm:160,ownerId:"o3",emoji:"✨",color:"#0F766E",nightly:25000},
  {id:11,name:"Old Town Riad",         location:"Old Town, Mombasa",   type:"Riad",     beds:3,baths:2,sqm:130,ownerId:"o4",emoji:"🕌",color:"#9333EA",nightly:15000},
  {id:12,name:"Limuru Tea Estate",     location:"Limuru",              type:"Cottage",  beds:2,baths:1,sqm:90, ownerId:"o1",emoji:"🍃",color:"#15803D",nightly:11000},
];

const PROPERTY_EMOJIS=["🏠","🏡","🏢","🏙️","🌿","🐚","🌅","🏖️","🦒","🦁","✨","🕌","🍃","🏛️","🏔️","🌊","🌴","🏕️","🌺","⛩️"];
const MONTHS_SHORT=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const OCCUPANCY_DATA={
  1:[18,14,22,25,19,21,16,20,23,26,18,15],2:[22,18,25,27,21,24,19,23,26,28,22,20],
  3:[20,16,24,26,22,25,18,22,25,27,21,19],4:[25,22,28,29,24,27,21,26,28,30,25,23],
  5:[19,15,22,24,18,21,16,20,22,25,19,17],6:[24,20,27,28,23,26,20,25,27,29,24,22],
  7:[22,18,26,27,22,24,19,23,26,28,22,20],8:[21,17,25,26,20,23,18,22,24,27,21,19],
  9:[26,23,28,30,25,28,22,27,29,31,26,24],10:[27,24,29,30,26,28,23,27,30,31,27,25],
  11:[23,19,26,28,22,25,20,24,27,29,23,21],12:[20,17,23,25,19,22,17,21,24,26,20,18],
};

/* ─── DATA GENERATION ────────────────────────────────────────────────── */
function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function uid(){return "x"+Math.random().toString(36).slice(2,9);}
function todayStr(){return new Date().toISOString().slice(0,10);}
function nightsBetween(a,b){return Math.max(0,Math.round((new Date(b)-new Date(a))/(1000*60*60*24)));}

function generateTransactions(properties,incCats,expCats){
  const txns=[];let id=1;
  const now=new Date();
  const incBase={1:[[0,52000],[2,8000]],2:[[0,68000],[2,12000]],3:[[0,85000],[1,18000]],4:[[0,120000],[1,25000],[2,15000]],5:[[0,75000],[2,10000]],6:[[0,110000],[1,30000],[3,20000]],7:[[0,95000],[2,20000]],8:[[0,88000],[4,15000]],9:[[0,105000],[2,35000]],10:[[0,140000],[2,40000]],11:[[0,90000],[1,22000]],12:[[0,65000],[2,15000]]};
  const expBase={1:[[0,10000],[2,4500],[5,6240],[9,2000]],2:[[0,12000],[2,5500],[5,8160]],3:[[0,16000],[2,7000],[7,35000],[5,10200]],4:[[0,22000],[2,12000],[7,60000],[5,16800]],5:[[0,14000],[2,6500],[5,9000],[8,5000]],6:[[0,20000],[2,9000],[7,55000],[5,16800]],7:[[0,18000],[2,8500],[7,45000],[5,11400]],8:[[0,16000],[2,7000],[5,10320],[9,3000]],9:[[0,14000],[2,6000],[5,12600]],10:[[0,25000],[2,14000],[7,80000],[5,21600]],11:[[0,18000],[2,9000],[5,11520]],12:[[0,12000],[2,5000],[5,7800],[8,4000]]};
  for(let mo=0;mo<12;mo++){
    const mIdx=(now.getMonth()-11+mo+12)%12;
    const yr=now.getFullYear()-(mo<now.getMonth()+1?0:1);
    const ds=`${yr}-${String(mIdx+1).padStart(2,"0")}`;
    properties.forEach(p=>{
      (incBase[p.id]||[]).forEach(([ci,base])=>{
        const cat=incCats[ci]||incCats[0];
        const amt=Math.round((base*(1+rand(-15,25)/100))/500)*500;
        if(amt>0)txns.push({id:id++,type:"income",propertyId:p.id,categoryId:cat.id,categoryName:cat.name,amount:amt,date:`${ds}-${String(rand(1,28)).padStart(2,"0")}`,note:`${cat.name} payout`,monthKey:ds,moIdx:mIdx,fromBooking:false});
      });
      (expBase[p.id]||[]).forEach(([ci,base])=>{
        const cat=expCats[ci]||expCats[0];
        const amt=Math.round((base*(1+rand(-8,12)/100))/100)*100;
        txns.push({id:id++,type:"expense",propertyId:p.id,categoryId:cat.id,categoryName:cat.name,amount:amt,date:`${ds}-${String(rand(1,28)).padStart(2,"0")}`,note:cat.name,monthKey:ds,moIdx:mIdx,fromBooking:false});
      });
      if(rand(0,3)===0){const mcat=expCats.find(c=>c.name==="Maintenance")||expCats[1];txns.push({id:id++,type:"expense",propertyId:p.id,categoryId:mcat.id,categoryName:mcat.name,amount:rand(5,50)*1000,date:`${ds}-${String(rand(1,28)).padStart(2,"0")}`,note:"Maintenance/repairs",monthKey:ds,moIdx:mIdx,fromBooking:false});}
    });
  }
  return txns.sort((a,b)=>b.date.localeCompare(a.date));
}

/* ─── HELPERS ─────────────────────────────────────────────────────────── */
function convertAmt(amt,settings,cur){const rate=settings.currencies[cur]?.rate||1;return amt*rate;}
function fmtC(amt,settings,cur){
  const c=cur||settings.app.defaultCurrency;const v=convertAmt(amt,settings,c);
  if(v>=1e6)return`${c} ${(v/1e6).toFixed(2)}M`;
  if(v>=1e3)return`${c} ${(v/1e3).toFixed(1)}K`;
  return`${c} ${v.toLocaleString(undefined,{maximumFractionDigits:2})}`;
}
function fmtFull(amt,settings,cur){
  const c=cur||settings.app.defaultCurrency;const rate=settings.currencies[c]?.rate||1;const v=amt*rate;
  return`${c} ${v.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;
}
function fmtKES(n){return`KES ${Number(n||0).toLocaleString("en-KE",{maximumFractionDigits:0})}`;}
function pct(a,b){return b>0?((a/b)*100).toFixed(1):"0.0";}
function exportCSV(rows,filename){
  if(!rows.length)return;
  const h=Object.keys(rows[0]);
  const csv=[h.join(","),...rows.map(r=>h.map(k=>{const v=String(r[k]??"").replace(/"/g,'""');return v.includes(",")||v.includes('"')?`"${v}"`:v;}).join(","))].join("\n");
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=filename;a.click();
}

/* ─── UI PRIMITIVES ──────────────────────────────────────────────────── */
function Pill({label,color,bg,icon}){
  return<span style={{background:bg,color,borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:600,fontFamily:FB,whiteSpace:"nowrap",display:"inline-flex",alignItems:"center",gap:3,letterSpacing:"0.01em"}}>{icon&&<span style={{fontSize:10}}>{icon}</span>}{label}</span>;
}
function StatusPill({status}){const s=BOOKING_STATUSES[status]||BOOKING_STATUSES.pending;return<Pill label={s.label} color={s.color} bg={s.bg} icon={s.icon}/>;}
function PayPill({status}){const s=PAYMENT_STATUSES[status]||PAYMENT_STATUSES.pending;return<Pill label={s.label} color={s.color} bg={s.bg}/>;}
function Btn({children,onClick,variant="default",small,full,disabled}){
  const V={
    default:{bg:T.surface,cl:T.ink,br:`1px solid ${T.border}`,cn:"btn-default"},
    primary:{bg:T.ink,cl:"#fff",br:`1px solid ${T.ink}`,cn:"btn-primary"},
    green:  {bg:T.greenBg,cl:T.green,br:`1px solid ${T.greenBorder}`,cn:"btn-green"},
    red:    {bg:T.redBg,cl:T.red,br:`1px solid ${T.redBorder}`,cn:"btn-red"},
    blue:   {bg:T.blueBg,cl:T.blue,br:`1px solid ${T.blueBorder}`,cn:"btn-blue"},
    amber:  {bg:T.amberBg,cl:T.amber,br:`1px solid ${T.amberBorder}`,cn:"btn-amber"},
    ghost:  {bg:"transparent",cl:T.inkLight,br:"none",cn:"btn-ghost"},
  }[variant]||{};
  return<button onClick={onClick} disabled={disabled} className={V.cn} style={{padding:small?"5px 11px":full?"12px":"8px 16px",width:full?"100%":"auto",background:V.bg,color:V.cl,border:V.br,borderRadius:8,fontFamily:FB,fontWeight:600,fontSize:small?11:13,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.5:1,display:"inline-flex",alignItems:"center",gap:5,whiteSpace:"nowrap",justifyContent:"center",letterSpacing:"-0.01em"}}>{children}</button>;
}
function FInput({label,hint,right,...props}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {label&&<label style={{fontFamily:FB,fontSize:11,fontWeight:600,color:T.inkMid,letterSpacing:"0.07em",textTransform:"uppercase",display:"flex",justifyContent:"space-between",alignItems:"center"}}>{label}{right&&<span style={{fontWeight:400,color:T.inkLight,textTransform:"none",letterSpacing:0}}>{right}</span>}</label>}
      <input {...props} style={{border:`1px solid ${T.borderMid}`,borderRadius:8,padding:"9px 13px",fontFamily:props.type==="number"?FM:FB,fontSize:13,color:T.ink,background:T.surface,width:"100%",boxSizing:"border-box",transition:"border-color 0.15s,box-shadow 0.15s",...(props.style||{})}}/>
      {hint&&<div style={{fontSize:11,color:T.inkLight,lineHeight:1.4}}>{hint}</div>}
    </div>
  );
}
function FSelect({label,children,hint,...props}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {label&&<label style={{fontFamily:FB,fontSize:11,fontWeight:600,color:T.inkMid,letterSpacing:"0.07em",textTransform:"uppercase"}}>{label}</label>}
      <select {...props} style={{border:`1px solid ${T.borderMid}`,borderRadius:8,padding:"9px 13px",fontFamily:FB,fontSize:13,color:T.ink,background:T.surface,width:"100%",cursor:"pointer",transition:"border-color 0.15s,box-shadow 0.15s"}}>{children}</select>
      {hint&&<div style={{fontSize:11,color:T.inkLight}}>{hint}</div>}
    </div>
  );
}
function FTextarea({label,...props}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {label&&<label style={{fontFamily:FB,fontSize:11,fontWeight:600,color:T.inkMid,letterSpacing:"0.07em",textTransform:"uppercase"}}>{label}</label>}
      <textarea {...props} style={{border:`1px solid ${T.borderMid}`,borderRadius:8,padding:"9px 13px",fontFamily:FB,fontSize:13,color:T.ink,background:T.surface,width:"100%",boxSizing:"border-box",resize:"vertical",transition:"border-color 0.15s,box-shadow 0.15s",...(props.style||{})}}/>
    </div>
  );
}
function Toggle({checked,onChange,label}){
  return(
    <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",userSelect:"none"}}>
      <div onClick={()=>onChange(!checked)} style={{width:40,height:22,background:checked?"#4F46E5":T.borderMid,borderRadius:11,position:"relative",transition:"background 0.2s",flexShrink:0}}>
        <div style={{position:"absolute",top:3,left:checked?20:3,width:16,height:16,background:"#fff",borderRadius:"50%",transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}/>
      </div>
      {label&&<span style={{fontFamily:FB,fontSize:13,color:T.inkMid,lineHeight:1.4}}>{label}</span>}
    </label>
  );
}
function TabBtn({active,onClick,children}){
  return<button onClick={onClick} className="tab-btn" style={{padding:"13px 20px",border:"none",borderBottom:`2px solid ${active?T.ink:"transparent"}`,background:"transparent",color:active?T.ink:T.inkLight,fontFamily:FB,fontWeight:active?600:400,fontSize:13,cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.15s ease",letterSpacing:"-0.01em"}}>{children}</button>;
}
function StatCard({label,value,sub,accent,icon}){
  return(
    <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"20px 22px",display:"flex",flexDirection:"column",gap:10,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:accent,borderRadius:"12px 12px 0 0"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <span style={{fontFamily:FB,fontSize:11,fontWeight:600,color:T.inkLight,letterSpacing:"0.08em",textTransform:"uppercase",lineHeight:1.4}}>{label}</span>
        {icon&&<div style={{width:34,height:34,borderRadius:9,background:accent+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{icon}</div>}
      </div>
      <div style={{fontFamily:FM,fontSize:26,fontWeight:600,color:T.ink,lineHeight:1,letterSpacing:"-0.02em"}}>{value}</div>
      {sub&&<div style={{fontFamily:FB,fontSize:12,color:T.inkLight,marginTop:-4}}>{sub}</div>}
    </div>
  );
}
function SectionDiv({label}){
  return<div style={{fontFamily:FB,fontSize:11,fontWeight:600,color:T.inkLight,letterSpacing:"0.08em",textTransform:"uppercase",borderBottom:`1px solid ${T.border}`,paddingBottom:8,marginBottom:14,marginTop:4}}>{label}</div>;
}
function InfoRow({label,value,mono,color}){
  return(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${T.border}44`}}>
      <span style={{fontSize:12,color:T.inkMid,fontFamily:FB}}>{label}</span>
      <span style={{fontSize:13,fontWeight:600,fontFamily:mono?FM:FB,color:color||T.ink}}>{value}</span>
    </div>
  );
}
function SectionCard({title,subtitle,children,action}){
  return(
    <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden",marginBottom:16}}>
      <div style={{padding:"16px 22px",borderBottom:`1px solid ${T.border}`,background:T.bg,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontFamily:FB,fontWeight:700,fontSize:14,color:T.ink,letterSpacing:"-0.01em"}}>{title}</div>
          {subtitle&&<div style={{fontFamily:FB,fontSize:12,color:T.inkLight,marginTop:3}}>{subtitle}</div>}
        </div>
        {action}
      </div>
      <div style={{padding:"20px 22px"}}>{children}</div>
    </div>
  );
}
function SettTabBtn({active,onClick,icon,label}){
  return<button onClick={onClick} className={`sett-tab${active?" sett-tab-active":""}`} style={{display:"flex",alignItems:"center",gap:9,padding:"10px 14px",border:"none",borderRadius:9,background:active?T.ink:"transparent",color:active?"#fff":T.inkMid,fontFamily:FB,fontWeight:active?600:400,fontSize:13,cursor:"pointer",width:"100%",textAlign:"left",marginBottom:2}}><span style={{fontSize:15}}>{icon}</span>{label}</button>;
}

/* ═══════════════════════════════════════════════════════════════════════
   BOOKING FORM MODAL  — replaces the old "+ Income" modal
   Saves as income transaction(s) automatically on submit
═══════════════════════════════════════════════════════════════════════ */
function BookingFormModal({onSave, onClose, properties, settings, editingBooking}){
  const blankBooking=(pid)=>{
    const p=properties.find(x=>x.id===parseInt(pid))||properties[0];
    const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);
    return{
      bookingRef:`HL-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`,
      propertyId:p?.id||properties[0]?.id,
      categoryId:"ic1", // income category (platform)
      status:"confirmed",paymentStatus:"pending",paymentMethod:"M-Pesa",
      guest:{firstName:"",lastName:"",email:"",phone:"",nationality:"",idType:"Passport",idNumber:"",adults:1,children:0,specialRequests:""},
      checkIn:todayStr(),
      checkOut:tomorrow.toISOString().slice(0,10),
      nights:1,
      nightlyRate:p?.nightly||10000,
      subtotal:p?.nightly||10000,
      extraFees:[],extraTotal:0,
      grossTotal:p?.nightly||10000,
      platformFeeRate:3,platformFeeAmt:0,
      netPayout:p?.nightly||10000,
      depositPaid:0,balanceDue:p?.nightly||10000,
      internalNotes:"",review:"",rating:null,
    };
  };

  const [form,setForm]=useState(editingBooking||blankBooking(properties[0]?.id));
  const [section,setSection]=useState("booking");
  const [newFee,setNewFee]=useState({name:"",amount:""});

  function recalc(f){
    const p=properties.find(x=>x.id===parseInt(f.propertyId));
    const nights=nightsBetween(f.checkIn,f.checkOut);
    const nightly=parseFloat(f.nightlyRate)||p?.nightly||0;
    const subtotal=nights*nightly;
    const extraTotal=(f.extraFees||[]).reduce((s,e)=>s+parseFloat(e.amount||0),0);
    const gross=subtotal+extraTotal;
    const pfee=Math.round(gross*((parseFloat(f.platformFeeRate)||0)/100));
    const net=gross-pfee;
    const bal=Math.max(0,net-parseFloat(f.depositPaid||0));
    return{...f,nights,subtotal,extraTotal,grossTotal:gross,platformFeeAmt:pfee,netPayout:net,balanceDue:bal};
  }

  function set(path,value){
    setForm(prev=>{
      let u={...prev};
      if(path.startsWith("guest.")){u.guest={...prev.guest,[path.slice(6)]:value};}
      else{
        u[path]=value;
        if(path==="propertyId"){const p=properties.find(x=>x.id===parseInt(value));u.nightlyRate=p?.nightly||prev.nightlyRate;}
      }
      return recalc(u);
    });
  }

  function addFee(){
    if(!newFee.name||!newFee.amount)return;
    const fees=[...(form.extraFees||[]),{name:newFee.name,amount:parseFloat(newFee.amount)}];
    setForm(prev=>recalc({...prev,extraFees:fees}));
    setNewFee({name:"",amount:""});
  }
  function removeFee(i){setForm(prev=>recalc({...prev,extraFees:prev.extraFees.filter((_,idx)=>idx!==i)}));}

  function handleSave(){
    if(!form.checkIn||!form.checkOut||form.nights<1)return;
    // Build income transaction from the booking net payout
    const cat=settings.incomeCategories.find(c=>c.id===form.categoryId)||settings.incomeCategories[0];
    const g=form.guest;
    const guestName=`${g.firstName} ${g.lastName}`.trim()||"Guest";
    const incTxn={
      id:uid(),type:"income",
      propertyId:form.propertyId,
      categoryId:cat.id,categoryName:cat.name,
      amount:form.netPayout,
      date:form.checkIn,
      monthKey:form.checkIn.slice(0,7),
      moIdx:new Date(form.checkIn).getMonth(),
      note:`${guestName} · ${form.checkIn}→${form.checkOut} · ${form.nights}n · ${form.bookingRef}`,
      fromBooking:true,
      booking:form,
    };
    onSave(incTxn);
  }

  const prop=properties.find(p=>p.id===parseInt(form.propertyId));
  const sections=[{id:"booking",icon:"📋",label:"Booking"},{id:"guest",icon:"👤",label:"Guest"},{id:"finances",icon:"💰",label:"Financials"},{id:"notes",icon:"📝",label:"Notes"}];

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,backdropFilter:"blur(6px)",WebkitBackdropFilter:"blur(6px)",padding:16}}>
      <div style={{background:T.surface,borderRadius:18,width:"100%",maxWidth:780,maxHeight:"94vh",display:"flex",flexDirection:"column",border:`1px solid ${T.border}`,boxShadow:"0 40px 100px rgba(15,23,42,0.22)"}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 28px",borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
          <div>
            <div style={{fontFamily:FB,fontSize:18,fontWeight:700,letterSpacing:"-0.02em",color:T.ink}}>Record Booking / Income</div>
            <div style={{fontSize:11,color:T.inkLight,marginTop:3,fontFamily:FM,letterSpacing:"0.02em"}}>{form.bookingRef} · auto-creates income transaction</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {prop&&<div style={{display:"flex",alignItems:"center",gap:8,background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"7px 13px"}}><span style={{fontSize:18}}>{prop.emoji}</span><div><div style={{fontSize:12,fontWeight:700,color:T.ink}}>{prop.name}</div><div style={{fontSize:10,color:T.inkLight}}>{prop.location}</div></div></div>}
            <button onClick={onClose} style={{background:T.bg,border:`1px solid ${T.border}`,width:32,height:32,borderRadius:8,fontSize:18,color:T.inkLight,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>×</button>
          </div>
        </div>

        {/* Section tabs */}
        <div style={{display:"flex",gap:0,borderBottom:`1px solid ${T.border}`,paddingLeft:16,flexShrink:0,background:T.bg}}>
          {sections.map(s=>(
            <button key={s.id} onClick={()=>setSection(s.id)} className="tab-btn"
              style={{padding:"11px 18px",border:"none",borderBottom:`2px solid ${section===s.id?T.ink:"transparent"}`,background:"transparent",color:section===s.id?T.ink:T.inkLight,fontFamily:FB,fontWeight:section===s.id?600:400,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:6,transition:"all 0.15s"}}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{flex:1,overflowY:"auto",padding:"22px 26px"}}>

          {/* ── BOOKING INFO ── */}
          {section==="booking"&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <SectionDiv label="Property & Platform"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <FSelect label="Property" value={form.propertyId} onChange={e=>set("propertyId",e.target.value)}>
                  {properties.map(p=>{const o=settings.owners.find(x=>x.id===p.ownerId);return<option key={p.id} value={p.id}>{p.emoji} {p.name} — {o?.name||""}</option>;})}
                </FSelect>
                <FSelect label="Booking Platform / Source" value={form.categoryId} onChange={e=>set("categoryId",e.target.value)}>
                  {settings.incomeCategories.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </FSelect>
              </div>
              <SectionDiv label="Dates"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
                <FInput label="Check-In" type="date" value={form.checkIn} onChange={e=>set("checkIn",e.target.value)}/>
                <FInput label="Check-Out" type="date" value={form.checkOut} onChange={e=>set("checkOut",e.target.value)}/>
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  <label style={{fontFamily:FB,fontSize:11,fontWeight:700,color:T.inkMid,letterSpacing:"0.08em",textTransform:"uppercase"}}>Duration</label>
                  <div style={{border:`1px solid ${T.borderMid}`,borderRadius:7,padding:"9px 12px",background:"#fff",display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontFamily:FM,fontSize:20,fontWeight:700,color:T.ink}}>{form.nights}</span>
                    <span style={{fontSize:13,color:T.inkLight}}>night{form.nights!==1?"s":""}</span>
                  </div>
                </div>
              </div>
              <SectionDiv label="Status"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <FSelect label="Booking Status" value={form.status} onChange={e=>set("status",e.target.value)}>
                  {Object.entries(BOOKING_STATUSES).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
                </FSelect>
                <FSelect label="Payment Status" value={form.paymentStatus} onChange={e=>set("paymentStatus",e.target.value)}>
                  {Object.entries(PAYMENT_STATUSES).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                </FSelect>
              </div>
            </div>
          )}

          {/* ── GUEST ── */}
          {section==="guest"&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <SectionDiv label="Guest Identity"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <FInput label="First Name" value={form.guest.firstName} onChange={e=>set("guest.firstName",e.target.value)} placeholder="Amina"/>
                <FInput label="Last Name"  value={form.guest.lastName}  onChange={e=>set("guest.lastName",e.target.value)}  placeholder="Hassan"/>
                <FInput label="Email"  type="email" value={form.guest.email}  onChange={e=>set("guest.email",e.target.value)}  placeholder="guest@email.com"/>
                <FInput label="Phone"  value={form.guest.phone}  onChange={e=>set("guest.phone",e.target.value)}  placeholder="+254 7xx xxx xxx"/>
                <FInput label="Nationality" value={form.guest.nationality} onChange={e=>set("guest.nationality",e.target.value)} placeholder="Kenyan"/>
              </div>
              <SectionDiv label="ID Verification"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <FSelect label="ID Type" value={form.guest.idType} onChange={e=>set("guest.idType",e.target.value)}>
                  {ID_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                </FSelect>
                <FInput label="ID Number" value={form.guest.idNumber} onChange={e=>set("guest.idNumber",e.target.value)} placeholder="e.g. A1234567"/>
              </div>
              <SectionDiv label="Party Size"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <FInput label="Adults"   type="number" min="1" value={form.guest.adults}   onChange={e=>set("guest.adults",parseInt(e.target.value)||1)}/>
                <FInput label="Children" type="number" min="0" value={form.guest.children} onChange={e=>set("guest.children",parseInt(e.target.value)||0)}/>
              </div>
              <FTextarea label="Special Requests" rows={3} value={form.guest.specialRequests||""} onChange={e=>set("guest.specialRequests",e.target.value)} placeholder="e.g. Late check-in, baby cot, vegetarian…"/>
            </div>
          )}

          {/* ── FINANCIALS ── */}
          {section==="finances"&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <SectionDiv label="Nightly Rate"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <FInput label="Nightly Rate (KES)" type="number" value={form.nightlyRate} onChange={e=>set("nightlyRate",parseFloat(e.target.value)||0)} right={`× ${form.nights}n = ${fmtKES(form.subtotal)}`}/>
                <FSelect label="Payment Method" value={form.paymentMethod} onChange={e=>set("paymentMethod",e.target.value)}>
                  {PAYMENT_METHODS.map(m=><option key={m} value={m}>{m}</option>)}
                </FSelect>
              </div>
              <SectionDiv label="Extra Fees (cleaning, safari, extras…)"/>
              <div style={{background:T.bg,borderRadius:10,border:`1px solid ${T.border}`,padding:14}}>
                {form.extraFees.length>0&&(
                  <div style={{marginBottom:10}}>
                    {form.extraFees.map((f,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${T.border}44`}}>
                        <span style={{fontSize:13,color:T.inkMid}}>{f.name}</span>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <span style={{fontFamily:FM,fontSize:13,fontWeight:600}}>{fmtKES(f.amount)}</span>
                          <button onClick={()=>removeFee(i)} style={{background:"transparent",border:"none",color:T.red,cursor:"pointer",fontSize:18,lineHeight:1}}>×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{display:"flex",gap:8}}>
                  <input placeholder="Fee name (e.g. Cleaning Fee)" value={newFee.name} onChange={e=>setNewFee(f=>({...f,name:e.target.value}))}
                    style={{flex:2,border:`1px solid ${T.borderMid}`,borderRadius:7,padding:"8px 11px",fontFamily:FB,fontSize:13,color:T.ink,background:"#fff",outline:"none"}}/>
                  <input type="number" placeholder="KES" value={newFee.amount} onChange={e=>setNewFee(f=>({...f,amount:e.target.value}))}
                    style={{flex:1,border:`1px solid ${T.borderMid}`,borderRadius:7,padding:"8px 11px",fontFamily:FM,fontSize:13,color:T.ink,background:"#fff",outline:"none"}}/>
                  <Btn variant="primary" small onClick={addFee}>+ Add</Btn>
                </div>
              </div>
              <SectionDiv label="Platform Commission"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <FInput label="Platform Fee (%)" type="number" step="0.5" min="0" max="30" value={form.platformFeeRate} onChange={e=>set("platformFeeRate",parseFloat(e.target.value)||0)} hint="Airbnb host fee ≈ 3%, Booking.com ≈ 15%"/>
                <div style={{background:T.bg,borderRadius:8,border:`1px solid ${T.border}`,padding:"10px 14px"}}>
                  <div style={{fontSize:11,color:T.inkLight,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:4}}>Fee Deducted</div>
                  <div style={{fontFamily:FM,fontSize:18,fontWeight:700,color:T.red}}>{fmtKES(form.platformFeeAmt)}</div>
                </div>
              </div>
              <SectionDiv label="Deposit & Balance"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <FInput label="Deposit Collected (KES)" type="number" value={form.depositPaid} onChange={e=>set("depositPaid",parseFloat(e.target.value)||0)}/>
                <div style={{background:T.bg,borderRadius:8,border:`1px solid ${T.border}`,padding:"10px 14px"}}>
                  <div style={{fontSize:11,color:T.inkLight,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:4}}>Balance Due</div>
                  <div style={{fontFamily:FM,fontSize:18,fontWeight:700,color:form.balanceDue>0?T.amber:T.green}}>{fmtKES(form.balanceDue)}</div>
                </div>
              </div>
              {/* Summary box */}
              <div style={{background:T.bg,borderRadius:12,border:`1px solid ${T.border}`,padding:18}}>
                <div style={{fontSize:11,fontWeight:700,color:T.inkLight,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>Booking Financial Summary</div>
                <InfoRow label={`${form.nights} nights × ${fmtKES(form.nightlyRate)}`} value={fmtKES(form.subtotal)} mono/>
                {form.extraFees.map((f,i)=><InfoRow key={i} label={f.name} value={fmtKES(f.amount)} mono/>)}
                <InfoRow label="Gross Total" value={fmtKES(form.grossTotal)} mono/>
                <InfoRow label={`Platform Fee (${form.platformFeeRate}%)`} value={`− ${fmtKES(form.platformFeeAmt)}`} mono color={T.red}/>
                <div style={{borderTop:`2px solid ${T.borderMid}`,marginTop:6,paddingTop:6}}>
                  <InfoRow label="Net Payout → Income Recorded" value={fmtKES(form.netPayout)} mono color={T.green}/>
                  <InfoRow label="Deposit Paid" value={`− ${fmtKES(form.depositPaid)}`} mono/>
                  <InfoRow label="Balance Due" value={fmtKES(form.balanceDue)} mono color={form.balanceDue>0?T.amber:T.green}/>
                </div>
              </div>
              <div style={{background:T.blueBg,border:`1px solid #BFDBFE`,borderRadius:9,padding:"11px 16px",fontSize:12,color:T.blue}}>
                ℹ️ <strong>Net Payout ({fmtKES(form.netPayout)})</strong> will be automatically recorded as an income transaction under <strong>{settings.incomeCategories.find(c=>c.id===form.categoryId)?.name||"Income"}</strong> on <strong>{form.checkIn}</strong>.
              </div>
            </div>
          )}

          {/* ── NOTES ── */}
          {section==="notes"&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <SectionDiv label="Internal Notes"/>
              <FTextarea label="Internal Notes (not visible to guest)" rows={4} value={form.internalNotes} onChange={e=>set("internalNotes",e.target.value)} placeholder="e.g. Door code: 4521. Parking spot B3. Late check-in approved."/>
              <SectionDiv label="Post-Stay (fill in after checkout)"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  <label style={{fontFamily:FB,fontSize:11,fontWeight:700,color:T.inkMid,letterSpacing:"0.08em",textTransform:"uppercase"}}>Guest Rating</label>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    {[1,2,3,4,5].map(n=>(
                      <button key={n} onClick={()=>set("rating",n)}
                        style={{width:36,height:36,borderRadius:8,border:`2px solid ${(form.rating||0)>=n?"#F59E0B":T.border}`,background:(form.rating||0)>=n?"#FEF3C7":"transparent",fontSize:18,cursor:"pointer"}}>⭐</button>
                    ))}
                    {form.rating&&<span style={{fontFamily:FM,fontSize:14,fontWeight:700,color:T.amber}}>{form.rating}/5</span>}
                  </div>
                </div>
                <FSelect label="Final Status" value={form.status} onChange={e=>set("status",e.target.value)}>
                  {Object.entries(BOOKING_STATUSES).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
                </FSelect>
              </div>
              <FTextarea label="Review / Comments" rows={3} value={form.review||""} onChange={e=>set("review",e.target.value)} placeholder="e.g. Excellent guest. Left property in great condition."/>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{borderTop:`1px solid ${T.border}`,padding:"14px 28px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0,background:T.bg}}>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <StatusPill status={form.status}/>
            <PayPill status={form.paymentStatus}/>
            <span style={{fontSize:12,color:T.inkLight,fontFamily:FM}}>{form.nights}n · {fmtKES(form.netPayout)} net</span>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn variant="default" onClick={onClose}>Cancel</Btn>
            <Btn variant="primary" onClick={handleSave}>Save Booking & Record Income</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   EXPENSE MODAL  — unchanged simple modal
═══════════════════════════════════════════════════════════════════════ */
function ExpenseModal({onSave,onClose,properties,settings}){
  const [form,setForm]=useState({propertyId:String(properties[0]?.id||""),categoryId:settings.expenseCategories[0]?.id||"",amount:"",date:todayStr(),note:""});
  function submit(){
    const amt=parseFloat(form.amount);if(!amt||isNaN(amt))return;
    const cat=settings.expenseCategories.find(c=>c.id===form.categoryId)||settings.expenseCategories[0];
    onSave({id:uid(),type:"expense",propertyId:parseInt(form.propertyId),categoryId:cat.id,categoryName:cat.name,amount:amt,date:form.date,note:form.note,monthKey:form.date.slice(0,7),moIdx:new Date(form.date).getMonth(),fromBooking:false});
  }
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,backdropFilter:"blur(6px)",WebkitBackdropFilter:"blur(6px)"}}>
      <div style={{background:T.surface,borderRadius:16,padding:28,width:460,border:`1px solid ${T.border}`,boxShadow:"0 32px 80px rgba(15,23,42,0.2)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
          <div style={{fontFamily:FB,fontSize:18,fontWeight:700,letterSpacing:"-0.02em",color:T.ink}}>Record Expense</div>
          <button onClick={onClose} style={{background:T.bg,border:`1px solid ${T.border}`,width:32,height:32,borderRadius:8,fontSize:18,color:T.inkLight,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <FSelect label="Property" value={form.propertyId} onChange={e=>setForm(f=>({...f,propertyId:e.target.value}))}>
            {properties.map(p=>{const o=settings.owners.find(x=>x.id===p.ownerId);return<option key={p.id} value={p.id}>{p.emoji} {p.name} — {o?.name||""}</option>;})}
          </FSelect>
          <FSelect label="Expense Category" value={form.categoryId} onChange={e=>setForm(f=>({...f,categoryId:e.target.value}))}>
            {settings.expenseCategories.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </FSelect>
          <FInput label="Amount (KES)" type="number" placeholder="e.g. 12000" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))}/>
          <FInput label="Date" type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/>
          <FInput label="Note (optional)" type="text" placeholder="Short description…" value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))}/>
          <div style={{display:"flex",gap:8,marginTop:4}}>
            <button onClick={submit} style={{flex:1,padding:"12px",borderRadius:9,border:"none",background:T.red,color:"#fff",fontFamily:FB,fontWeight:700,fontSize:14,cursor:"pointer",transition:"background 0.15s"}} className="btn-red">Save Expense</button>
            <button onClick={onClose} style={{padding:"12px 18px",borderRadius:9,border:`1px solid ${T.border}`,background:T.surface,color:T.inkMid,fontFamily:FB,fontWeight:600,fontSize:14,cursor:"pointer"}} className="btn-default">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SETTINGS PANEL  — unchanged from v3
═══════════════════════════════════════════════════════════════════════ */
function SettingsPanel({settings,setSettings,properties,setProperties}){
  const [activeSection,setActiveSection]=useState("app");
  const [editingOwner,setEditingOwner]=useState(null);
  const [editingProp,setEditingProp]=useState(null);
  const [editingInCat,setEditingInCat]=useState(null);
  const [editingExCat,setEditingExCat]=useState(null);
  const [saved,setSaved]=useState(false);
  function save(){setSaved(true);setTimeout(()=>setSaved(false),2000);}
  function updateTax(k,v){setSettings(s=>({...s,tax:{...s.tax,[k]:v}}));}
  function updateApp(k,v){setSettings(s=>({...s,app:{...s.app,[k]:v}}));}
  function updateCur(code,k,v){setSettings(s=>({...s,currencies:{...s.currencies,[code]:{...s.currencies[code],[k]:v}}}));}
  function saveOwner(o){setSettings(s=>({...s,owners:s.owners.find(x=>x.id===o.id)?s.owners.map(x=>x.id===o.id?o:x):[...s.owners,o]}));setEditingOwner(null);}
  function delOwner(id){if(properties.some(p=>p.ownerId===id)){alert("Reassign properties first.");return;}setSettings(s=>({...s,owners:s.owners.filter(o=>o.id!==id)}));}
  function saveProp(p){setProperties(ps=>ps.find(x=>x.id===p.id)?ps.map(x=>x.id===p.id?p:x):[...ps,{...p,id:ps.length?Math.max(...ps.map(x=>x.id))+1:1}]);setEditingProp(null);}
  function delProp(id){setProperties(ps=>ps.filter(p=>p.id!==id));}
  function saveInCat(c){setSettings(s=>({...s,incomeCategories:s.incomeCategories.find(x=>x.id===c.id)?s.incomeCategories.map(x=>x.id===c.id?c:x):[...s.incomeCategories,c]}));setEditingInCat(null);}
  function delInCat(id){setSettings(s=>({...s,incomeCategories:s.incomeCategories.filter(c=>c.id!==id)}));}
  function saveExCat(c){setSettings(s=>({...s,expenseCategories:s.expenseCategories.find(x=>x.id===c.id)?s.expenseCategories.map(x=>x.id===c.id?c:x):[...s.expenseCategories,c]}));setEditingExCat(null);}
  function delExCat(id){setSettings(s=>({...s,expenseCategories:s.expenseCategories.filter(c=>c.id!==id)}));}
  function addPropType(v){if(v&&!settings.propertyTypes.includes(v))setSettings(s=>({...s,propertyTypes:[...s.propertyTypes,v]}));}
  function delPropType(v){setSettings(s=>({...s,propertyTypes:s.propertyTypes.filter(t=>t!==v)}));}

  const sects=[{id:"app",icon:"⚙️",label:"App Settings"},{id:"owners",icon:"👤",label:"Owners"},{id:"properties",icon:"🏠",label:"Properties"},{id:"income_cats",icon:"💰",label:"Income Categories"},{id:"expense_cats",icon:"📤",label:"Expense Categories"},{id:"prop_types",icon:"🏷️",label:"Property Types"},{id:"tax",icon:"🧾",label:"Tax & Calculation"},{id:"currencies",icon:"💱",label:"Currencies & Rates"}];

  return(
    <div style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:20}}>
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:12,height:"fit-content",position:"sticky",top:80}}>
        <div style={{fontFamily:FD,fontSize:15,fontWeight:700,color:T.ink,padding:"6px 14px 14px",borderBottom:`1px solid ${T.border}`,marginBottom:10}}>Settings</div>
        {sects.map(s=><SettTabBtn key={s.id} active={activeSection===s.id} onClick={()=>setActiveSection(s.id)} icon={s.icon} label={s.label}/>)}
        <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${T.border}`}}>
          <Btn variant={saved?"green":"primary"} onClick={save} full>{saved?"✓ Saved!":"💾 Save Settings"}</Btn>
        </div>
      </div>
      <div>
        {activeSection==="app"&&(
          <SectionCard title="General App Settings" subtitle="Configure your workspace defaults">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <FInput label="App Name" value={settings.app.appName} onChange={e=>updateApp("appName",e.target.value)}/>
              <FSelect label="Default Currency" value={settings.app.defaultCurrency} onChange={e=>updateApp("defaultCurrency",e.target.value)}>{Object.keys(settings.currencies).map(k=><option key={k} value={k}>{k}</option>)}</FSelect>
              <FSelect label="Date Format" value={settings.app.dateFormat} onChange={e=>updateApp("dateFormat",e.target.value)}>{["YYYY-MM-DD","DD/MM/YYYY","MM/DD/YYYY"].map(f=><option key={f} value={f}>{f}</option>)}</FSelect>
              <FSelect label="Fiscal Year Start" value={settings.app.fiscalYearStart} onChange={e=>updateApp("fiscalYearStart",e.target.value)}>{MONTHS_SHORT.map(m=><option key={m} value={m}>{m}</option>)}</FSelect>
              <FInput label="Occupancy Target (%)" type="number" value={settings.app.occupancyTarget} onChange={e=>updateApp("occupancyTarget",parseFloat(e.target.value))}/>
              <FInput label="Management Fee Rate (%)" type="number" value={settings.app.managementFeeRate} onChange={e=>updateApp("managementFeeRate",parseFloat(e.target.value))}/>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:16,paddingTop:16,borderTop:`1px solid ${T.border}`}}>
              <Toggle checked={settings.app.showOccupancyTarget} onChange={v=>updateApp("showOccupancyTarget",v)} label="Show occupancy target on charts"/>
              <Toggle checked={settings.app.autoCalcMgmtFee}    onChange={v=>updateApp("autoCalcMgmtFee",v)}    label="Auto-calculate management fee from income"/>
            </div>
          </SectionCard>
        )}
        {activeSection==="owners"&&(
          <div>
            <SectionCard title="Property Owners" subtitle="Self-owned and managed client portfolios" action={<Btn variant="primary" small onClick={()=>setEditingOwner({id:uid(),name:"",color:"#1A7A4A",email:"",phone:"",note:""})}>+ Add Owner</Btn>}>
              {settings.owners.map(o=>(
                <div key={o.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{width:34,height:34,borderRadius:"50%",background:o.color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:14,flexShrink:0}}>{o.name.slice(0,1).toUpperCase()}</div>
                  <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>{o.name}</div><div style={{fontSize:12,color:T.inkLight}}>{[o.email,o.phone,o.note].filter(Boolean).join(" · ")||"No details"}</div></div>
                  <div style={{fontSize:12,color:T.inkLight}}>{properties.filter(p=>p.ownerId===o.id).length} props</div>
                  <Btn small onClick={()=>setEditingOwner({...o})}>Edit</Btn>
                  <Btn small variant="red" onClick={()=>delOwner(o.id)}>Delete</Btn>
                </div>
              ))}
            </SectionCard>
            {editingOwner&&<OwnerModal owner={editingOwner} onSave={saveOwner} onClose={()=>setEditingOwner(null)}/>}
          </div>
        )}
        {activeSection==="properties"&&(
          <div>
            <SectionCard title="Properties" subtitle={`${properties.length} in portfolio`} action={<Btn variant="primary" small onClick={()=>setEditingProp({id:null,name:"",location:"",type:settings.propertyTypes[0],beds:1,baths:1,sqm:60,ownerId:settings.owners[0]?.id,emoji:"🏠",color:"#6366F1",nightly:10000})}>+ Add Property</Btn>}>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr style={{background:T.bg,borderBottom:`1px solid ${T.border}`}}>{["","Property","Owner","Type","Beds","Nightly",""].map(h=><th key={h} style={{padding:"9px 12px",textAlign:"left",fontSize:11,color:T.inkLight,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
                  <tbody>{properties.map((p,i)=>{const o=settings.owners.find(x=>x.id===p.ownerId);return(<tr key={p.id} style={{borderBottom:`1px solid ${T.border}44`,background:i%2===0?T.surface:T.bg}}><td style={{padding:"10px 12px"}}><span style={{width:8,height:8,borderRadius:"50%",background:p.color,display:"inline-block"}}/> {p.emoji}</td><td style={{padding:"10px 12px",fontWeight:600,fontSize:13}}>{p.name}<div style={{fontSize:11,color:T.inkLight}}>{p.location}</div></td><td style={{padding:"10px 12px",fontSize:12,color:T.inkMid}}>{o?.name||"—"}</td><td style={{padding:"10px 12px",fontSize:12,color:T.inkMid}}>{p.type}</td><td style={{padding:"10px 12px",fontSize:12,color:T.inkMid}}>{p.beds}bd</td><td style={{padding:"10px 12px",fontFamily:FM,fontSize:12}}>{p.nightly?.toLocaleString()}</td><td style={{padding:"10px 12px"}}><div style={{display:"flex",gap:6}}><Btn small onClick={()=>setEditingProp({...p})}>Edit</Btn><Btn small variant="red" onClick={()=>delProp(p.id)}>Del</Btn></div></td></tr>);})}</tbody>
                </table>
              </div>
            </SectionCard>
            {editingProp&&<PropertyModal prop={editingProp} settings={settings} onSave={saveProp} onClose={()=>setEditingProp(null)}/>}
          </div>
        )}
        {activeSection==="income_cats"&&(
          <div>
            <SectionCard title="Income Categories" subtitle="Booking platforms and income sources" action={<Btn variant="primary" small onClick={()=>setEditingInCat({id:uid(),name:"",icon:"💰",color:"#1A7A4A",taxable:true})}>+ Add</Btn>}>
              {settings.incomeCategories.map(c=>(
                <div key={c.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{width:32,height:32,borderRadius:8,background:c.color+"22",border:`1px solid ${c.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{c.icon}</div>
                  <div style={{flex:1,fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:8}}>{c.name}{c.taxable?<Pill label="Taxable" color={T.red} bg={T.redBg}/>:<Pill label="Non-taxable" color={T.inkLight} bg={T.border}/>}</div>
                  <Btn small onClick={()=>setEditingInCat({...c})}>Edit</Btn>
                  <Btn small variant="red" onClick={()=>delInCat(c.id)}>Del</Btn>
                </div>
              ))}
            </SectionCard>
            {editingInCat&&<IncomeCatModal cat={editingInCat} onSave={saveInCat} onClose={()=>setEditingInCat(null)}/>}
          </div>
        )}
        {activeSection==="expense_cats"&&(
          <div>
            <SectionCard title="Expense Categories" subtitle="Operational costs" action={<Btn variant="primary" small onClick={()=>setEditingExCat({id:uid(),name:"",icon:"📦",color:"#5C574F",deductible:true,note:""})}>+ Add</Btn>}>
              {settings.expenseCategories.map(c=>(
                <div key={c.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{width:32,height:32,borderRadius:8,background:c.color+"22",border:`1px solid ${c.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{c.icon}</div>
                  <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>{c.name}{c.deductible?<Pill label="Deductible" color={T.green} bg={T.greenBg}/>:<Pill label="Not Deductible" color={T.amber} bg={T.amberBg}/>}</div>{c.note&&<div style={{fontSize:11,color:T.inkLight}}>{c.note}</div>}</div>
                  <Btn small onClick={()=>setEditingExCat({...c})}>Edit</Btn>
                  <Btn small variant="red" onClick={()=>delExCat(c.id)}>Del</Btn>
                </div>
              ))}
            </SectionCard>
            {editingExCat&&<ExpenseCatModal cat={editingExCat} onSave={saveExCat} onClose={()=>setEditingExCat(null)}/>}
          </div>
        )}
        {activeSection==="prop_types"&&(
          <SectionCard title="Property Types" subtitle="Used when adding properties">
            <PropTypesManager types={settings.propertyTypes} onAdd={addPropType} onDelete={delPropType}/>
          </SectionCard>
        )}
        {activeSection==="tax"&&(
          <div>
            <SectionCard title="Tax Jurisdiction & Rates">
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <FInput label="Jurisdiction" value={settings.tax.jurisdiction} onChange={e=>updateTax("jurisdiction",e.target.value)}/>
                <FInput label="Tax Year" type="number" value={settings.tax.taxYear} onChange={e=>updateTax("taxYear",parseInt(e.target.value))}/>
                <FInput label="Income Tax Rate (%)" type="number" step="0.1" value={settings.tax.taxRate} onChange={e=>updateTax("taxRate",parseFloat(e.target.value))}/>
                <FInput label="Withholding Tax (%)" type="number" step="0.1" value={settings.tax.withholdingTax} onChange={e=>updateTax("withholdingTax",parseFloat(e.target.value))}/>
                <FInput label="VAT Rate (%)" type="number" step="0.1" value={settings.tax.vatRate} onChange={e=>updateTax("vatRate",parseFloat(e.target.value))}/>
                <FInput label="VAT Threshold (KES)" type="number" value={settings.tax.vatThreshold} onChange={e=>updateTax("vatThreshold",parseFloat(e.target.value))}/>
                <FSelect label="Accounting Method" value={settings.tax.method} onChange={e=>updateTax("method",e.target.value)}><option value="cash">Cash Basis</option><option value="accrual">Accrual Basis</option></FSelect>
                <FSelect label="Reporting Currency" value={settings.tax.currency} onChange={e=>updateTax("currency",e.target.value)}>{Object.keys(settings.currencies).map(k=><option key={k} value={k}>{k}</option>)}</FSelect>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:16,paddingTop:16,borderTop:`1px solid ${T.border}`}}>
                <Toggle checked={settings.tax.applyVAT} onChange={v=>updateTax("applyVAT",v)} label="Apply VAT calculations"/>
                <Toggle checked={settings.tax.includeWithholding} onChange={v=>updateTax("includeWithholding",v)} label="Include withholding tax in reports"/>
              </div>
            </SectionCard>
            <SectionCard title="Report Disclaimer">
              <FTextarea label="Disclaimer" rows={3} value={settings.tax.disclaimer} onChange={e=>updateTax("disclaimer",e.target.value)}/>
              <div style={{marginTop:12}}><FTextarea label="Custom Notes" rows={2} value={settings.tax.customNotes} onChange={e=>updateTax("customNotes",e.target.value)} placeholder="e.g. Prepared for XYZ Accountants."/></div>
            </SectionCard>
          </div>
        )}
        {activeSection==="currencies"&&(
          <SectionCard title="Currencies & Exchange Rates" subtitle="Rates are against KES. Update manually for accuracy.">
            {Object.entries(settings.currencies).map(([code,cur])=>(
              <div key={code} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:`1px solid ${T.border}`}}>
                <div style={{fontSize:22,flexShrink:0}}>{cur.flag}</div>
                <div style={{width:50,flexShrink:0}}><Pill label={code} color={cur.active?T.blue:T.inkLight} bg={cur.active?T.blueBg:T.border}/></div>
                <div style={{flex:1,fontWeight:700,fontSize:13}}>{cur.name}{code==="KES"&&<span style={{fontSize:11,color:T.inkLight,fontWeight:400}}> · base currency</span>}</div>
                {code!=="KES"&&(<div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:12,color:T.inkLight,whiteSpace:"nowrap"}}>1 KES =</span><input type="number" step="0.00001" value={cur.rate} onChange={e=>updateCur(code,"rate",parseFloat(e.target.value))} style={{width:90,border:`1px solid ${T.borderMid}`,borderRadius:6,padding:"6px 10px",fontFamily:FM,fontSize:13,color:T.ink,background:T.bg,outline:"none"}}/><span style={{fontSize:12,color:T.inkLight}}>{code}</span></div>)}
                {code!=="KES"&&<Toggle checked={cur.active} onChange={v=>updateCur(code,"active",v)}/>}
              </div>
            ))}
            <div style={{marginTop:14,padding:"12px 16px",background:T.amberBg,borderRadius:9,fontSize:12,color:T.amber}}>💡 Check <strong>xe.com</strong> for current rates.</div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}

/* ── Sub-modals for Settings ── */
function Modal({title,onClose,children}){return(<div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(6px)",WebkitBackdropFilter:"blur(6px)"}}><div style={{background:T.surface,borderRadius:16,padding:28,width:490,maxHeight:"90vh",overflowY:"auto",border:`1px solid ${T.border}`,boxShadow:"0 32px 80px rgba(15,23,42,0.2)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}><div style={{fontFamily:FB,fontSize:17,fontWeight:700,letterSpacing:"-0.02em",color:T.ink}}>{title}</div><button onClick={onClose} style={{background:T.bg,border:`1px solid ${T.border}`,width:32,height:32,borderRadius:8,fontSize:18,color:T.inkLight,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button></div>{children}</div></div>);}
function OwnerModal({owner,onSave,onClose}){const[o,setO]=useState(owner);return(<Modal title={owner.name?`Edit: ${owner.name}`:"New Owner"} onClose={onClose}><div style={{display:"flex",flexDirection:"column",gap:13}}><FInput label="Name" value={o.name} onChange={e=>setO(x=>({...x,name:e.target.value}))}/><FInput label="Email" type="email" value={o.email} onChange={e=>setO(x=>({...x,email:e.target.value}))}/><FInput label="Phone" value={o.phone} onChange={e=>setO(x=>({...x,phone:e.target.value}))}/><FInput label="Note" value={o.note} onChange={e=>setO(x=>({...x,note:e.target.value}))}/><div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontFamily:FB,fontSize:11,fontWeight:700,color:T.inkMid,letterSpacing:"0.08em",textTransform:"uppercase"}}>Colour</label><input type="color" value={o.color} onChange={e=>setO(x=>({...x,color:e.target.value}))} style={{height:40,width:80,border:`1px solid ${T.borderMid}`,borderRadius:7,cursor:"pointer",padding:2}}/></div><div style={{display:"flex",gap:8,marginTop:4}}><Btn variant="primary" full onClick={()=>onSave(o)}>Save</Btn><Btn variant="default" onClick={onClose}>Cancel</Btn></div></div></Modal>);}
function PropertyModal({prop,settings,onSave,onClose}){const[p,setP]=useState(prop);return(<Modal title={p.id?`Edit: ${prop.name||"Property"}`:"New Property"} onClose={onClose}><div style={{display:"flex",flexDirection:"column",gap:13}}><FInput label="Name" value={p.name} onChange={e=>setP(x=>({...x,name:e.target.value}))}/><FInput label="Location" value={p.location} onChange={e=>setP(x=>({...x,location:e.target.value}))}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><FSelect label="Owner" value={p.ownerId} onChange={e=>setP(x=>({...x,ownerId:e.target.value}))}>{settings.owners.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</FSelect><FSelect label="Type" value={p.type} onChange={e=>setP(x=>({...x,type:e.target.value}))}>{settings.propertyTypes.map(t=><option key={t} value={t}>{t}</option>)}</FSelect><FInput label="Beds" type="number" value={p.beds} onChange={e=>setP(x=>({...x,beds:parseInt(e.target.value)}))}/><FInput label="Baths" type="number" value={p.baths} onChange={e=>setP(x=>({...x,baths:parseInt(e.target.value)}))}/><FInput label="Sqm" type="number" value={p.sqm} onChange={e=>setP(x=>({...x,sqm:parseInt(e.target.value)}))}/><FInput label="Nightly (KES)" type="number" value={p.nightly} onChange={e=>setP(x=>({...x,nightly:parseInt(e.target.value)}))}/></div><div><label style={{fontFamily:FB,fontSize:11,fontWeight:700,color:T.inkMid,letterSpacing:"0.08em",textTransform:"uppercase",display:"block",marginBottom:6}}>Icon</label><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{PROPERTY_EMOJIS.map(e=><button key={e} onClick={()=>setP(x=>({...x,emoji:e}))} style={{width:34,height:34,borderRadius:7,border:`2px solid ${p.emoji===e?T.ink:T.border}`,background:p.emoji===e?T.ink+"11":"transparent",fontSize:18,cursor:"pointer"}}>{e}</button>)}</div></div><div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontFamily:FB,fontSize:11,fontWeight:700,color:T.inkMid,letterSpacing:"0.08em",textTransform:"uppercase"}}>Colour</label><input type="color" value={p.color} onChange={e=>setP(x=>({...x,color:e.target.value}))} style={{height:40,width:80,border:`1px solid ${T.borderMid}`,borderRadius:7,cursor:"pointer",padding:2}}/></div><div style={{display:"flex",gap:8,marginTop:4}}><Btn variant="primary" full onClick={()=>onSave(p)}>Save</Btn><Btn variant="default" onClick={onClose}>Cancel</Btn></div></div></Modal>);}
function IncomeCatModal({cat,onSave,onClose}){const[c,setC]=useState(cat);return(<Modal title={cat.name?`Edit: ${cat.name}`:"New Income Category"} onClose={onClose}><div style={{display:"flex",flexDirection:"column",gap:13}}><FInput label="Name" value={c.name} onChange={e=>setC(x=>({...x,name:e.target.value}))}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><FInput label="Icon" value={c.icon} onChange={e=>setC(x=>({...x,icon:e.target.value}))}/><div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontFamily:FB,fontSize:11,fontWeight:700,color:T.inkMid,letterSpacing:"0.08em",textTransform:"uppercase"}}>Colour</label><input type="color" value={c.color} onChange={e=>setC(x=>({...x,color:e.target.value}))} style={{height:40,width:60,border:`1px solid ${T.borderMid}`,borderRadius:7,cursor:"pointer",padding:2}}/></div></div><Toggle checked={c.taxable} onChange={v=>setC(x=>({...x,taxable:v}))} label="Taxable income"/><div style={{display:"flex",gap:8,marginTop:4}}><Btn variant="primary" full onClick={()=>onSave(c)}>Save</Btn><Btn variant="default" onClick={onClose}>Cancel</Btn></div></div></Modal>);}
function ExpenseCatModal({cat,onSave,onClose}){const[c,setC]=useState(cat);return(<Modal title={cat.name?`Edit: ${cat.name}`:"New Expense Category"} onClose={onClose}><div style={{display:"flex",flexDirection:"column",gap:13}}><FInput label="Name" value={c.name} onChange={e=>setC(x=>({...x,name:e.target.value}))}/><FInput label="Note" value={c.note} onChange={e=>setC(x=>({...x,note:e.target.value}))}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><FInput label="Icon" value={c.icon} onChange={e=>setC(x=>({...x,icon:e.target.value}))}/><div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontFamily:FB,fontSize:11,fontWeight:700,color:T.inkMid,letterSpacing:"0.08em",textTransform:"uppercase"}}>Colour</label><input type="color" value={c.color} onChange={e=>setC(x=>({...x,color:e.target.value}))} style={{height:40,width:60,border:`1px solid ${T.borderMid}`,borderRadius:7,cursor:"pointer",padding:2}}/></div></div><Toggle checked={c.deductible} onChange={v=>setC(x=>({...x,deductible:v}))} label="Tax deductible"/><div style={{display:"flex",gap:8,marginTop:4}}><Btn variant="primary" full onClick={()=>onSave(c)}>Save</Btn><Btn variant="default" onClick={onClose}>Cancel</Btn></div></div></Modal>);}
function PropTypesManager({types,onAdd,onDelete}){const[val,setVal]=useState("");return(<div><div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>{types.map(t=><div key={t} style={{display:"flex",alignItems:"center",gap:6,background:T.bg,border:`1px solid ${T.border}`,borderRadius:7,padding:"6px 12px"}}><span style={{fontSize:13,fontWeight:600}}>{t}</span><button onClick={()=>onDelete(t)} style={{background:"transparent",border:"none",color:T.red,cursor:"pointer",fontSize:16,lineHeight:1,padding:0}}>×</button></div>)}</div><div style={{display:"flex",gap:8}}><input value={val} onChange={e=>setVal(e.target.value)} placeholder="Add new type…" onKeyDown={e=>{if(e.key==="Enter"){onAdd(val);setVal("");}}} style={{border:`1px solid ${T.borderMid}`,borderRadius:7,padding:"9px 12px",fontFamily:FB,fontSize:13,color:T.ink,background:T.bg,outline:"none",flex:1}}/><Btn variant="primary" onClick={()=>{onAdd(val);setVal("");}}>Add</Btn></div></div>);}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════════════ */
export default function App(){
  const [settings,setSettings]     = useState(DEFAULT_SETTINGS);
  const [properties,setProperties] = useState(DEFAULT_PROPERTIES);
  const [tab,setTab]               = useState("dashboard");
  const [currency,setCurrency]     = useState("KES");
  const [propFilter,setPropFilter] = useState("all");
  const [ownerFilter,setOwnerFilter]= useState("all");
  const [txnType,setTxnType]       = useState("all");
  const [catFilter,setCatFilter]   = useState("all");
  const [searchQ,setSearchQ]       = useState("");
  const [sortCol,setSortCol]       = useState("date");
  const [sortDir,setSortDir]       = useState("desc");
  const [showBookingModal,setShowBookingModal] = useState(false);
  const [showExpenseModal,setShowExpenseModal] = useState(false);
  const [editingBookingTxn,setEditingBookingTxn] = useState(null);

  const baseTxns = useMemo(()=>generateTransactions(properties,settings.incomeCategories,settings.expenseCategories),[properties,settings.incomeCategories,settings.expenseCategories]);
  const [extraTxns,setExtraTxns]   = useState([]);
  const allTxns = useMemo(()=>[...extraTxns,...baseTxns].sort((a,b)=>b.date.localeCompare(a.date)),[extraTxns,baseTxns]);

  const activeCurrencies = useMemo(()=>Object.entries(settings.currencies).filter(([,v])=>v.active),[settings.currencies]);
  const visibleProps = useMemo(()=>properties.filter(p=>ownerFilter==="all"||settings.owners.find(o=>o.id===p.ownerId)?.name===ownerFilter),[properties,ownerFilter,settings.owners]);
  const owners = useMemo(()=>[...new Set(properties.map(p=>settings.owners.find(o=>o.id===p.ownerId)?.name).filter(Boolean))],[properties,settings.owners]);

  const filtered = useMemo(()=>{
    let t=allTxns;
    if(propFilter!=="all") t=t.filter(x=>x.propertyId===parseInt(propFilter));
    else if(ownerFilter!=="all") t=t.filter(x=>{const o=settings.owners.find(o2=>o2.id===properties.find(p=>p.id===x.propertyId)?.ownerId);return o?.name===ownerFilter;});
    if(txnType!=="all") t=t.filter(x=>x.type===txnType);
    if(catFilter!=="all") t=t.filter(x=>x.categoryId===catFilter||x.categoryName===catFilter);
    if(searchQ){const q=searchQ.toLowerCase();t=t.filter(x=>{const p=properties.find(p2=>p2.id===x.propertyId);return p?.name.toLowerCase().includes(q)||x.categoryName?.toLowerCase().includes(q)||x.note?.toLowerCase().includes(q);});}
    return [...t].sort((a,b)=>{let av=a[sortCol],bv=b[sortCol];if(sortCol==="amount"){av=+av;bv=+bv;}return sortDir==="asc"?(av<bv?-1:av>bv?1:0):(av>bv?-1:av<bv?1:0);});
  },[allTxns,propFilter,ownerFilter,txnType,catFilter,searchQ,sortCol,sortDir,settings.owners,properties]);

  const totalIncome=filtered.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
  const totalExpense=filtered.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
  const netProfit=totalIncome-totalExpense;

  const monthlyData=useMemo(()=>{const map={};filtered.forEach(t=>{const k=t.monthKey||t.date.slice(0,7);if(!map[k])map[k]={income:0,expense:0};map[k][t.type]+=t.amount;});return Object.entries(map).sort((a,b)=>a[0].localeCompare(b[0])).slice(-12);},[filtered]);
  const propStats=useMemo(()=>properties.map(p=>{const pt=allTxns.filter(t=>t.propertyId===p.id);const inc=pt.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);const exp=pt.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);const occ=OCCUPANCY_DATA[p.id]||[];const nights=occ.reduce((s,n)=>s+n,0);const owner=settings.owners.find(o=>o.id===p.ownerId);return{...p,income:inc,expense:exp,net:inc-exp,margin:pct(inc-exp,inc),totalNights:nights,occRate:pct(nights,360),revPAN:nights>0?inc/nights:0,ownerName:owner?.name||"Unknown"}}).sort((a,b)=>b.net-a.net),[properties,allTxns,settings.owners]);
  const taxSummary=useMemo(()=>properties.map(p=>{const pt=allTxns.filter(t=>t.propertyId===p.id);const inc=pt.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);const ded=pt.filter(t=>t.type==="expense"&&settings.expenseCategories.find(c=>c.id===t.categoryId||c.name===t.categoryName)?.deductible!==false).reduce((s,t)=>s+t.amount,0);const taxable=Math.max(0,inc-ded);const owner=settings.owners.find(o=>o.id===p.ownerId);return{...p,grossIncome:inc,deductions:ded,taxableIncome:taxable,estimatedTax:taxable*(settings.tax.taxRate/100),withholdingTax:settings.tax.includeWithholding?inc*(settings.tax.withholdingTax/100):0,ownerName:owner?.name||"Unknown"}}),[properties,allTxns,settings]);
  const expBreak=useMemo(()=>{const map={};filtered.filter(t=>t.type==="expense").forEach(t=>{map[t.categoryName]=(map[t.categoryName]||0)+t.amount;});return Object.entries(map).sort((a,b)=>b[1]-a[1]);},[filtered]);
  const incBreak=useMemo(()=>{const map={};filtered.filter(t=>t.type==="income").forEach(t=>{map[t.categoryName]=(map[t.categoryName]||0)+t.amount;});return Object.entries(map).sort((a,b)=>b[1]-a[1]);},[filtered]);

  function toggleSort(col){if(sortCol===col)setSortDir(d=>d==="asc"?"desc":"asc");else{setSortCol(col);setSortDir("desc");}}

  function saveIncomeTxn(txn){
    setExtraTxns(prev=>{const exists=prev.find(x=>x.id===txn.id);return exists?prev.map(x=>x.id===txn.id?txn:x):[txn,...prev];});
    setShowBookingModal(false);setEditingBookingTxn(null);
  }
  function saveExpenseTxn(txn){setExtraTxns(prev=>[txn,...prev]);setShowExpenseModal(false);}
  function handleExportCSV(){exportCSV(filtered.map(t=>{const p=properties.find(x=>x.id===t.propertyId);const o=settings.owners.find(x=>x.id===p?.ownerId);const b=t.booking;return{Date:t.date,Property:p?.name||"",Owner:o?.name||"",Type:t.type,Category:t.categoryName,Note:t.note,Amount_KES:t.amount,BookingRef:b?.bookingRef||"",GuestName:b?`${b.guest?.firstName||""} ${b.guest?.lastName||""}`.trim():"",CheckIn:b?.checkIn||"",CheckOut:b?.checkOut||"",Nights:b?.nights||"",Platform:b?t.categoryName:"",NetPayout:b?.netPayout||""};}),`hostledger-transactions-${todayStr()}.csv`);}
  function handleExportTax(){exportCSV(taxSummary.map(p=>({Property:p.name,Owner:p.ownerName,Gross:p.grossIncome,Deductions:p.deductions,Taxable:p.taxableIncome,Tax:p.estimatedTax,Withholding:p.withholdingTax,Margin:p.margin})),`hostledger-tax-${settings.tax.taxYear}.csv`);}

  const maxBar=Math.max(...monthlyData.map(([,d])=>Math.max(d.income||0,d.expense||0)),1);
  const maxPI=Math.max(...propStats.map(p=>p.income),1);
  const cur=settings.currencies[currency];

  return(
    <div style={{fontFamily:FB,background:T.bg,minHeight:"100vh",color:T.ink}}>
      <style>{GLOBAL_CSS}</style>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>

      {/* TOPBAR */}
      <header style={{background:"rgba(255,255,255,0.95)",borderBottom:`1px solid ${T.border}`,padding:"0 28px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
          <div style={{width:36,height:36,background:"linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:FB,fontWeight:800,fontSize:16,letterSpacing:"-0.03em",boxShadow:"0 2px 8px rgba(79,70,229,0.3)"}}>H</div>
          <div>
            <div style={{fontFamily:FB,fontWeight:800,fontSize:16,letterSpacing:"-0.03em",color:T.ink,lineHeight:1}}>HostLedger <span style={{color:T.primary}}>PRO</span></div>
            <div style={{fontSize:11,color:T.inkLight,marginTop:2}}>Short-Term Rental Finance</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,border:`1px solid ${T.border}`,borderRadius:8,padding:"6px 11px",background:T.bg}}>
            <span style={{fontSize:13}}>{cur?.flag}</span>
            <select value={currency} onChange={e=>setCurrency(e.target.value)} style={{border:"none",background:"transparent",fontFamily:FB,fontWeight:600,fontSize:12,color:T.ink,cursor:"pointer"}}>
              {activeCurrencies.map(([k,v])=><option key={k} value={k}>{k} – {v.name}</option>)}
            </select>
          </div>
          <select value={ownerFilter} onChange={e=>{setOwnerFilter(e.target.value);setPropFilter("all");}} style={{border:`1px solid ${T.border}`,borderRadius:8,padding:"7px 12px",fontSize:12,fontFamily:FB,color:T.ink,background:T.bg,cursor:"pointer"}}>
            <option value="all">All Owners</option>
            {owners.map(o=><option key={o} value={o}>{o}</option>)}
          </select>
          <select value={propFilter} onChange={e=>setPropFilter(e.target.value)} style={{border:`1px solid ${T.border}`,borderRadius:8,padding:"7px 12px",fontSize:12,fontFamily:FB,color:T.ink,background:T.bg,cursor:"pointer"}}>
            <option value="all">All ({visibleProps.length})</option>
            {visibleProps.map(p=><option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
          </select>
          <Btn variant="green" onClick={()=>{setEditingBookingTxn(null);setShowBookingModal(true);}}>+ Booking / Income</Btn>
          <Btn variant="red"   onClick={()=>setShowExpenseModal(true)}>+ Expense</Btn>
        </div>
      </header>

      {/* TABS */}
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"0 24px",display:"flex",overflowX:"auto",gap:2}}>
        {[["dashboard","Dashboard"],["transactions","Transactions"],["properties","Properties"],["occupancy","Occupancy"],["tax","Tax Report"],["settings","Settings"]].map(([id,lbl])=>(
          <TabBtn key={id} active={tab===id} onClick={()=>setTab(id)}>{lbl}</TabBtn>
        ))}
      </div>

      <main style={{maxWidth:1300,margin:"0 auto",padding:"26px 28px"}}>

        {/* ══ SETTINGS ══ */}
        {tab==="settings"&&<SettingsPanel settings={settings} setSettings={setSettings} properties={properties} setProperties={setProperties}/>}

        {/* ══ DASHBOARD ══ */}
        {tab==="dashboard"&&(
          <div style={{display:"flex",flexDirection:"column",gap:22}}>
            {currency!=="KES"&&<div style={{background:T.amberBg,border:`1px solid ${T.amberBorder}`,borderRadius:10,padding:"11px 16px",fontSize:12,color:T.amber,display:"flex",alignItems:"center",gap:8}}><span>💱</span><span>Showing in <strong>{currency}</strong> — converted from KES. Manage rates in Settings → Currencies.</span></div>}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
              <StatCard label="Gross Income"   value={fmtC(totalIncome,settings,currency)}  sub={`${filtered.filter(t=>t.type==="income").length} transactions`}  accent={T.green}  icon="💰"/>
              <StatCard label="Total Expenses" value={fmtC(totalExpense,settings,currency)} sub={`${filtered.filter(t=>t.type==="expense").length} transactions`} accent={T.red}    icon="📤"/>
              <StatCard label="Net Profit"     value={fmtC(netProfit,settings,currency)}    sub="After all costs" accent={netProfit>=0?T.green:T.red} icon="📈"/>
              <StatCard label="Profit Margin"  value={`${pct(netProfit,totalIncome)}%`}     sub={`${visibleProps.length} properties active`} accent={T.primary} icon="🎯"/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:16}}>
              <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:24}}>
                <div style={{fontFamily:FB,fontSize:15,fontWeight:700,letterSpacing:"-0.02em",marginBottom:20,color:T.ink}}>Monthly Revenue vs Expenses</div>
                <div style={{display:"flex",gap:6,alignItems:"flex-end",height:180}}>
                  {monthlyData.map(([key,d])=>{const mo=parseInt(key.slice(5))-1;return(<div key={key} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5,minWidth:0}}><div style={{display:"flex",gap:3,alignItems:"flex-end",height:155}}><div style={{width:14,borderRadius:"4px 4px 0 0",background:T.green,height:`${Math.max(2,Math.round(((d.income||0)/maxBar)*155))}px`,opacity:0.85,transition:"height 0.3s ease"}}/><div style={{width:14,borderRadius:"4px 4px 0 0",background:T.red,height:`${Math.max(2,Math.round(((d.expense||0)/maxBar)*155))}px`,opacity:0.85,transition:"height 0.3s ease"}}/></div><div style={{fontSize:9,color:T.inkLight,fontFamily:FM,letterSpacing:"0.03em"}}>{MONTHS_SHORT[mo]}</div></div>);})}
                </div>
                <div style={{display:"flex",gap:20,marginTop:16,paddingTop:14,borderTop:`1px solid ${T.border}`}}>
                  {[[T.green,"Income"],[T.red,"Expenses"]].map(([c,l])=><div key={l} style={{display:"flex",gap:7,alignItems:"center"}}><div style={{width:10,height:10,borderRadius:3,background:c}}/><span style={{fontSize:12,color:T.inkMid,fontWeight:500}}>{l}</span></div>)}
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:20,flex:1}}>
                  <div style={{fontSize:11,fontWeight:600,color:T.inkLight,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:14}}>Income by Platform</div>
                  {incBreak.slice(0,5).map(([n,a])=>(<div key={n} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,color:T.inkMid,fontWeight:500}}>{n}</span><span style={{fontSize:12,fontFamily:FM,color:T.green,fontWeight:600}}>{fmtC(a,settings,currency)}</span></div><div style={{background:T.border,borderRadius:4,height:5}}><div style={{height:"100%",borderRadius:4,background:T.green,width:`${totalIncome>0?(a/totalIncome*100):0}%`,opacity:0.75}}/></div></div>))}
                </div>
                <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:20,flex:1}}>
                  <div style={{fontSize:11,fontWeight:600,color:T.inkLight,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:14}}>Top Expenses</div>
                  {expBreak.slice(0,5).map(([n,a])=>(<div key={n} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,color:T.inkMid,fontWeight:500}}>{n}</span><span style={{fontSize:12,fontFamily:FM,color:T.red,fontWeight:600}}>{fmtC(a,settings,currency)}</span></div><div style={{background:T.border,borderRadius:4,height:5}}><div style={{height:"100%",borderRadius:4,background:T.red,width:`${expBreak[0]?a/expBreak[0][1]*100:0}%`,opacity:0.75}}/></div></div>))}
                </div>
              </div>
            </div>
            <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:24}}>
              <div style={{fontFamily:FB,fontSize:15,fontWeight:700,letterSpacing:"-0.02em",marginBottom:16,color:T.ink}}>Portfolio Snapshot</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:12}}>
                {propStats.slice(0,6).map((p,i)=>(
                  <div key={p.id} className="prop-card" style={{background:T.bg,borderRadius:12,padding:"14px 15px",border:`1px solid ${T.border}`,borderTop:`3px solid ${p.color}`,cursor:"pointer"}}>
                    <div style={{fontSize:22,marginBottom:6}}>{p.emoji}</div>
                    <div style={{fontWeight:700,fontSize:12,lineHeight:1.35,marginBottom:3,color:T.ink}}>{p.name}</div>
                    <div style={{fontSize:10,color:T.inkLight,marginBottom:10}}>{p.ownerName}</div>
                    <div style={{fontFamily:FM,fontSize:14,fontWeight:700,color:p.net>=0?T.green:T.red}}>{fmtC(p.net,settings,currency)}</div>
                    <div style={{fontSize:10,color:T.inkLight,marginTop:2}}>{p.margin}% margin · {p.occRate}% occ</div>
                    {i===0&&<div style={{marginTop:8}}><Pill label="Top performer" color={T.amber} bg={T.amberBg}/></div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ TRANSACTIONS ══ */}
        {tab==="transactions"&&(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
              <div style={{fontFamily:FB,fontSize:20,fontWeight:700,letterSpacing:"-0.03em",color:T.ink}}>Transactions</div>
              <Btn variant="blue" onClick={handleExportCSV}>Export CSV</Btn>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <input placeholder="Search property, category, note…" value={searchQ} onChange={e=>setSearchQ(e.target.value)} style={{border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 13px",fontSize:13,fontFamily:FB,color:T.ink,background:T.surface,width:260}}/>
              <div style={{display:"flex",gap:2,background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:3}}>
                {["all","income","expense"].map(f=><button key={f} onClick={()=>setTxnType(f)} style={{padding:"6px 13px",borderRadius:6,border:"none",background:txnType===f?T.surface:"transparent",color:txnType===f?T.ink:T.inkLight,fontFamily:FB,fontWeight:txnType===f?600:400,fontSize:12,cursor:"pointer",boxShadow:txnType===f?"0 1px 3px rgba(0,0,0,0.08)":"none",textTransform:"capitalize"}}>{f}</button>)}
              </div>
              <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} style={{border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 12px",fontSize:12,fontFamily:FB,color:T.ink,background:T.surface,cursor:"pointer"}}>
                <option value="all">All Categories</option>
                {[...settings.incomeCategories,...settings.expenseCategories].map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
              <StatCard label="Income"   value={fmtC(filtered.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0),settings,currency)}  sub={`${filtered.filter(t=>t.type==="income").length} transactions`}  accent={T.green} icon="↑"/>
              <StatCard label="Expenses" value={fmtC(filtered.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0),settings,currency)} sub={`${filtered.filter(t=>t.type==="expense").length} transactions`} accent={T.red}   icon="↓"/>
              <StatCard label="Net"      value={fmtC(filtered.reduce((s,t)=>t.type==="income"?s+t.amount:s-t.amount,0),settings,currency)}   sub={`${filtered.length} total entries`} accent={T.primary} icon="="/>
            </div>
            <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{borderBottom:`1px solid ${T.border}`,background:T.bg}}>
                    {[["date","Date"],["propertyId","Property"],["type","Type"],["categoryName","Category"],["note","Note / Guest"],["amount","Amount"]].map(([col,lbl])=>(
                      <th key={col} onClick={()=>toggleSort(col)} style={{padding:"11px 14px",textAlign:"left",fontSize:11,fontFamily:FB,fontWeight:600,color:T.inkLight,letterSpacing:"0.07em",textTransform:"uppercase",cursor:"pointer",userSelect:"none",whiteSpace:"nowrap"}}>{lbl}{sortCol===col?<span style={{marginLeft:4,color:T.primary}}>{sortDir==="asc"?"↑":"↓"}</span>:""}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0,100).map((t)=>{
                    const p=properties.find(x=>x.id===t.propertyId);
                    const cat=[...settings.incomeCategories,...settings.expenseCategories].find(c=>c.id===t.categoryId);
                    const bk=t.booking;
                    return(
                      <tr key={t.id} className="tbl-row" style={{borderBottom:`1px solid ${T.border}`,background:T.surface}}>
                        <td style={{padding:"11px 14px",fontSize:12,fontFamily:FM,color:T.inkMid,whiteSpace:"nowrap"}}>{t.date}</td>
                        <td style={{padding:"11px 14px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:7}}>
                            <div style={{width:8,height:8,borderRadius:"50%",background:p?.color||T.border,flexShrink:0}}/>
                            <div>
                              <div style={{fontWeight:600,fontSize:13,color:T.ink}}>{p?.emoji} {p?.name||"Unknown"}</div>
                              <div style={{fontSize:11,color:T.inkLight}}>{settings.owners.find(o=>o.id===p?.ownerId)?.name||""}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{padding:"11px 14px"}}>
                          <div style={{display:"flex",flexDirection:"column",gap:3}}>
                            <Pill label={t.type==="income"?"Income":"Expense"} color={t.type==="income"?T.green:T.red} bg={t.type==="income"?T.greenBg:T.redBg}/>
                            {bk&&<Pill label="Booking" color={T.blue} bg={T.blueBg}/>}
                          </div>
                        </td>
                        <td style={{padding:"11px 14px",fontSize:12,color:T.inkMid}}>{cat?.icon||""} {t.categoryName}</td>
                        <td style={{padding:"11px 14px",fontSize:12,color:T.inkLight,maxWidth:220}}>
                          {bk?(
                            <div>
                              <div style={{fontWeight:600,color:T.ink,fontSize:13}}>{bk.guest?.firstName} {bk.guest?.lastName}</div>
                              <div style={{fontSize:11,color:T.inkLight,marginTop:2,display:"flex",alignItems:"center",gap:5}}><span>{bk.checkIn} → {bk.checkOut} · {bk.nights}n</span><StatusPill status={bk.status}/></div>
                            </div>
                          ):<span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"block"}}>{t.note}</span>}
                        </td>
                        <td style={{padding:"11px 14px",fontFamily:FM,fontSize:13,fontWeight:700,color:t.type==="income"?T.green:T.red,whiteSpace:"nowrap"}}>{t.type==="income"?"+":"-"}{fmtFull(t.amount,settings,currency)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length===0&&<div style={{padding:48,textAlign:"center",color:T.inkLight,fontFamily:FB,fontSize:14}}>No transactions match your filters.</div>}
            </div>
          </div>
        )}

        {/* ══ PROPERTIES ══ */}
        {tab==="properties"&&(
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <div style={{fontFamily:FB,fontSize:20,fontWeight:700,letterSpacing:"-0.03em",color:T.ink}}>All {propStats.length} Properties</div>
            <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:24}}>
              <div style={{fontSize:11,fontWeight:600,color:T.inkLight,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:16}}>Revenue Ranking</div>
              {propStats.map((p,i)=>(
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10,padding:"6px 0"}}>
                  <div style={{width:24,fontFamily:FM,fontSize:11,color:T.inkLight,textAlign:"right",flexShrink:0}}>#{i+1}</div>
                  <span style={{fontSize:16,flexShrink:0}}>{p.emoji}</span>
                  <div style={{width:170,fontSize:13,fontWeight:600,flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:T.ink}}>{p.name}</div>
                  <div style={{flex:1,background:T.border,borderRadius:4,height:8,overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:4,background:p.color,width:`${(p.income/maxPI*100).toFixed(1)}%`,opacity:0.85}}/>
                  </div>
                  <div style={{width:120,fontFamily:FM,fontSize:12,fontWeight:700,color:T.green,textAlign:"right",flexShrink:0}}>{fmtC(p.income,settings,currency)}</div>
                  <div style={{width:100,fontFamily:FM,fontSize:12,fontWeight:600,color:p.net>=0?T.green:T.red,textAlign:"right",flexShrink:0}}>{fmtC(p.net,settings,currency)}</div>
                  <div style={{width:60,flexShrink:0,textAlign:"right"}}><Pill label={`${p.occRate}%`} color={parseFloat(p.occRate)>settings.app.occupancyTarget?T.green:parseFloat(p.occRate)>50?T.amber:T.red} bg={parseFloat(p.occRate)>settings.app.occupancyTarget?T.greenBg:parseFloat(p.occRate)>50?T.amberBg:T.redBg}/></div>
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
              {propStats.map(p=>{
                const owner=settings.owners.find(o=>o.id===p.ownerId);
                const incBySrc={};
                allTxns.filter(t=>t.propertyId===p.id&&t.type==="income").forEach(t=>{incBySrc[t.categoryName]=(incBySrc[t.categoryName]||0)+t.amount;});
                return(
                  <div key={p.id} className="prop-card" style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden"}}>
                    <div style={{background:p.color,padding:"18px 20px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div>
                          <div style={{fontSize:26}}>{p.emoji}</div>
                          <div style={{fontFamily:FB,fontWeight:700,fontSize:15,color:"#fff",marginTop:6,lineHeight:1.2,letterSpacing:"-0.01em"}}>{p.name}</div>
                          <div style={{fontSize:11,color:"rgba(255,255,255,0.75)",marginTop:3}}>{p.location} · {p.type} · {p.beds}bd</div>
                        </div>
                        <Pill label={p.ownerName==="Self"?"Self":"Managed"} color="#fff" bg="rgba(255,255,255,0.2)"/>
                      </div>
                      <div style={{display:"flex",gap:14,marginTop:12}}>
                        <div style={{color:"rgba(255,255,255,0.9)",fontSize:12,fontFamily:FM}}>KES {p.nightly?.toLocaleString()}/night</div>
                        <div style={{color:"rgba(255,255,255,0.9)",fontSize:12}}>Occ {p.occRate}%</div>
                      </div>
                    </div>
                    <div style={{padding:"16px 20px"}}>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
                        {[["Income",p.income,T.green],["Expenses",p.expense,T.red],["Net",p.net,p.net>=0?T.green:T.red]].map(([l,v,c])=>(
                          <div key={l}>
                            <div style={{fontSize:10,color:T.inkLight,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>{l}</div>
                            <div style={{fontFamily:FM,fontSize:13,fontWeight:700,color:c,marginTop:3}}>{fmtC(v,settings,currency)}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{borderTop:`1px solid ${T.border}`,paddingTop:12}}>
                        <div style={{fontSize:10,color:T.inkLight,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>Income Sources</div>
                        {Object.entries(incBySrc).map(([n,a])=>(
                          <div key={n} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                            <span style={{color:T.inkMid}}>{n}</span>
                            <span style={{fontFamily:FM,color:T.green,fontWeight:600}}>{fmtC(a,settings,currency)}</span>
                          </div>
                        ))}
                      </div>
                      {owner&&owner.name!=="Self"&&<div style={{marginTop:12,padding:"8px 12px",background:T.blueBg,borderRadius:8,fontSize:12,color:T.blue,fontWeight:600}}>Managed for {owner.name}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ OCCUPANCY ══ */}
        {tab==="occupancy"&&(
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <div style={{fontFamily:FB,fontSize:20,fontWeight:700,letterSpacing:"-0.03em",color:T.ink}}>Occupancy & RevPAN Tracker</div>
            <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:T.bg,borderBottom:`1px solid ${T.border}`}}>
                    {["Property","Owner","Type","Nightly","Nights","Occupancy","RevPAN","Revenue","Net"].map(h=>(
                      <th key={h} style={{padding:"11px 14px",textAlign:"left",fontSize:11,fontFamily:FB,fontWeight:600,color:T.inkLight,letterSpacing:"0.07em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {propStats.map(p=>{
                    const occ=parseFloat(p.occRate);
                    const occColor=occ>settings.app.occupancyTarget?T.green:occ>50?T.amber:T.red;
                    const occBg=occ>settings.app.occupancyTarget?T.greenBg:occ>50?T.amberBg:T.redBg;
                    return(
                      <tr key={p.id} className="tbl-row" style={{borderBottom:`1px solid ${T.border}`,background:T.surface}}>
                        <td style={{padding:"12px 14px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{width:9,height:9,borderRadius:"50%",background:p.color,flexShrink:0}}/>
                            <div>
                              <div style={{fontWeight:700,fontSize:13,color:T.ink}}>{p.emoji} {p.name}</div>
                              <div style={{fontSize:11,color:T.inkLight,marginTop:1}}>{p.location}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{padding:"12px 14px",fontSize:12,color:T.inkMid}}>{p.ownerName}</td>
                        <td style={{padding:"12px 14px",fontSize:12,color:T.inkMid}}>{p.type}</td>
                        <td style={{padding:"12px 14px",fontFamily:FM,fontSize:12,color:T.ink}}>{fmtC(p.nightly,settings,currency)}</td>
                        <td style={{padding:"12px 14px",fontFamily:FM,fontSize:13,fontWeight:700,color:T.ink}}>{p.totalNights}/360</td>
                        <td style={{padding:"12px 14px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{width:52,background:T.border,borderRadius:4,height:7,overflow:"hidden"}}>
                              <div style={{height:"100%",borderRadius:4,width:`${p.occRate}%`,background:occColor}}/>
                            </div>
                            <Pill label={`${p.occRate}%`} color={occColor} bg={occBg}/>
                          </div>
                        </td>
                        <td style={{padding:"12px 14px",fontFamily:FM,fontSize:13,fontWeight:700,color:T.purple}}>{fmtC(p.revPAN,settings,currency)}</td>
                        <td style={{padding:"12px 14px",fontFamily:FM,fontSize:13,fontWeight:700,color:T.green}}>{fmtC(p.income,settings,currency)}</td>
                        <td style={{padding:"12px 14px",fontFamily:FM,fontSize:13,fontWeight:700,color:p.net>=0?T.green:T.red}}>{fmtC(p.net,settings,currency)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:24}}>
              <div style={{fontSize:11,fontWeight:600,color:T.inkLight,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:16}}>Nights Booked — Monthly Heatmap</div>
              <div style={{overflowX:"auto"}}>
                <table style={{borderCollapse:"separate",borderSpacing:"4px"}}>
                  <thead>
                    <tr>
                      <td style={{padding:"0 10px 8px",fontSize:11,color:T.inkLight,fontWeight:600,whiteSpace:"nowrap",minWidth:160}}>Property</td>
                      {MONTHS_SHORT.map(m=><td key={m} style={{padding:"0 4px 8px",fontSize:11,color:T.inkLight,fontWeight:600,textAlign:"center",minWidth:34}}>{m}</td>)}
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map(p=>(
                      <tr key={p.id}>
                        <td style={{padding:"3px 10px",fontSize:12,fontWeight:600,whiteSpace:"nowrap",color:T.ink}}>{p.emoji} {p.name}</td>
                        {(OCCUPANCY_DATA[p.id]||Array(12).fill(0)).map((n,mi)=>{
                          const intensity=n/30;
                          const bg=`rgba(${intensity>0.75?"5,150,105":intensity>0.5?"217,119,6":"220,38,38"},${0.12+intensity*0.72})`;
                          return(
                            <td key={mi} title={`${n} nights`} style={{padding:"3px 4px",textAlign:"center"}}>
                              <div style={{background:bg,borderRadius:5,padding:"4px 2px",fontSize:11,fontFamily:FM,fontWeight:700,color:intensity>0.55?"#fff":T.ink,minWidth:28}}>{n}</div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══ TAX ══ */}
        {tab==="tax"&&(
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
              <div style={{fontFamily:FB,fontSize:20,fontWeight:700,letterSpacing:"-0.03em",color:T.ink}}>Tax Report — {settings.tax.jurisdiction} · FY {settings.tax.taxYear}</div>
              <Btn variant="blue" onClick={handleExportTax}>Export CSV</Btn>
            </div>
            <div style={{background:T.amberBg,border:`1px solid ${T.amberBorder}`,borderRadius:10,padding:"13px 18px",fontSize:13,color:T.amber,lineHeight:1.5}}><strong>Disclaimer:</strong> {settings.tax.disclaimer}{settings.tax.customNotes&&<div style={{marginTop:8,paddingTop:8,borderTop:`1px solid ${T.amberBorder}`}}>{settings.tax.customNotes}</div>}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
              <StatCard label="Gross Revenue"    value={fmtC(taxSummary.reduce((s,p)=>s+p.grossIncome,0),settings,currency)}   sub="All properties"       accent={T.green}   icon="💰"/>
              <StatCard label="Tax Deductions"   value={fmtC(taxSummary.reduce((s,p)=>s+p.deductions,0),settings,currency)}    sub="Deductible expenses"  accent={T.amber}   icon="📉"/>
              <StatCard label="Net Taxable"      value={fmtC(taxSummary.reduce((s,p)=>s+p.taxableIncome,0),settings,currency)}  sub="Revenue − deductions" accent={T.primary} icon="🧮"/>
              <StatCard label={`Est. Tax (${settings.tax.taxRate}%)`} value={fmtC(taxSummary.reduce((s,p)=>s+p.estimatedTax,0),settings,currency)} sub="Income tax estimate" accent={T.red} icon="🧾"/>
            </div>
            <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:T.bg,borderBottom:`1px solid ${T.border}`}}>
                    {["Property","Owner","Gross Income","Deductions","Taxable","Est. Tax","Margin"].map(h=>(
                      <th key={h} style={{padding:"11px 14px",textAlign:"left",fontSize:11,fontFamily:FB,fontWeight:600,color:T.inkLight,letterSpacing:"0.07em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {taxSummary.map(p=>(
                    <tr key={p.id} className="tbl-row" style={{borderBottom:`1px solid ${T.border}`,background:T.surface}}>
                      <td style={{padding:"12px 14px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:9,height:9,borderRadius:"50%",background:p.color,flexShrink:0}}/>
                          <div>
                            <div style={{fontWeight:700,fontSize:13,color:T.ink}}>{p.emoji} {p.name}</div>
                            <div style={{fontSize:11,color:T.inkLight,marginTop:1}}>{p.location}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{padding:"12px 14px"}}><Pill label={p.ownerName==="Self"?"Self":"Managed"} color={p.ownerName==="Self"?T.green:T.blue} bg={p.ownerName==="Self"?T.greenBg:T.blueBg}/></td>
                      <td style={{padding:"12px 14px",fontFamily:FM,fontSize:12,fontWeight:700,color:T.green}}>{fmtFull(p.grossIncome,settings,currency)}</td>
                      <td style={{padding:"12px 14px",fontFamily:FM,fontSize:12,color:T.red}}>{fmtFull(p.deductions,settings,currency)}</td>
                      <td style={{padding:"12px 14px",fontFamily:FM,fontSize:13,fontWeight:700,color:T.ink}}>{fmtFull(p.taxableIncome,settings,currency)}</td>
                      <td style={{padding:"12px 14px",fontFamily:FM,fontSize:13,fontWeight:700,color:T.amber}}>{fmtFull(p.estimatedTax,settings,currency)}</td>
                      <td style={{padding:"12px 14px"}}><Pill label={`${p.margin}%`} color={parseFloat(p.margin)>40?T.green:parseFloat(p.margin)>15?T.amber:T.red} bg={parseFloat(p.margin)>40?T.greenBg:parseFloat(p.margin)>15?T.amberBg:T.redBg}/></td>
                    </tr>
                  ))}
                  <tr style={{borderTop:`2px solid ${T.borderMid}`,background:T.bg}}>
                    <td colSpan={2} style={{padding:"14px",fontFamily:FB,fontWeight:800,fontSize:14,color:T.ink}}>TOTAL</td>
                    <td style={{padding:"14px",fontFamily:FM,fontSize:14,fontWeight:800,color:T.green}}>{fmtFull(taxSummary.reduce((s,p)=>s+p.grossIncome,0),settings,currency)}</td>
                    <td style={{padding:"14px",fontFamily:FM,fontSize:14,fontWeight:800,color:T.red}}>{fmtFull(taxSummary.reduce((s,p)=>s+p.deductions,0),settings,currency)}</td>
                    <td style={{padding:"14px",fontFamily:FM,fontSize:14,fontWeight:800,color:T.ink}}>{fmtFull(taxSummary.reduce((s,p)=>s+p.taxableIncome,0),settings,currency)}</td>
                    <td style={{padding:"14px",fontFamily:FM,fontSize:14,fontWeight:800,color:T.amber}}>{fmtFull(taxSummary.reduce((s,p)=>s+p.estimatedTax,0),settings,currency)}</td>
                    <td style={{padding:"14px"}}><Pill label={`${pct(taxSummary.reduce((s,p)=>s+p.taxableIncome,0),taxSummary.reduce((s,p)=>s+p.grossIncome,0))}%`} color={T.primary} bg={T.primaryBg}/></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:22}}>
              <div style={{fontSize:11,fontWeight:600,color:T.inkLight,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:14}}>Deductible vs Non-Deductible Expense Categories</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
                {settings.expenseCategories.map(c=>{
                  const total=allTxns.filter(t=>t.type==="expense"&&(t.categoryId===c.id||t.categoryName===c.name)).reduce((s,t)=>s+t.amount,0);
                  if(!total)return null;
                  return(
                    <div key={c.id} style={{background:T.bg,borderRadius:10,padding:"13px 14px",border:`1px solid ${T.border}`}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                        <span style={{fontSize:15}}>{c.icon}</span>
                        <span style={{fontSize:12,fontWeight:600,color:T.inkMid,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</span>
                      </div>
                      <div style={{fontFamily:FM,fontSize:14,fontWeight:700,color:T.ink,marginBottom:6}}>{fmtC(total,settings,currency)}</div>
                      <Pill label={c.deductible?"Deductible":"Not Deductible"} color={c.deductible?T.green:T.amber} bg={c.deductible?T.greenBg:T.amberBg}/>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* BOOKING / INCOME MODAL */}
      {showBookingModal&&(
        <BookingFormModal
          onSave={saveIncomeTxn}
          onClose={()=>{setShowBookingModal(false);setEditingBookingTxn(null);}}
          properties={properties}
          settings={settings}
          editingBooking={editingBookingTxn?.booking||null}
        />
      )}

      {/* EXPENSE MODAL */}
      {showExpenseModal&&(
        <ExpenseModal onSave={saveExpenseTxn} onClose={()=>setShowExpenseModal(false)} properties={properties} settings={settings}/>
      )}
    </div>
  );
}
