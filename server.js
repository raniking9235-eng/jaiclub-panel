const https = require("https");
const http = require("http");

const TOKEN = "8661647746:AAH-uJ3-TLugpAmejvf7VmEpwOF9p6W1cPA";
const PORT = process.env.PORT || 3000;

function fetch91Club() {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      pageSize: 10, pageNo: 1, typeId: 1, language: 0,
      random: "e0697d4c6011408d917314fc67c1f34b",
      signature: "B53CDAE581B7E927B1EC6BB79A44A523",
      timestamp: 1727792520
    });
    const options = {
      hostname: "91clubapi.com",
      path: "/api/webapi/GetNoaverageEmerdList",
      method: "POST",
      headers: {"Content-Type":"application/json","Content-Length":Buffer.byteLength(payload)}
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => { try{resolve(JSON.parse(data));}catch(e){reject(e);} });
    });
    req.on("error", reject);
    req.write(payload); req.end();
  });
}

function sendTelegram(chatId, text) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({chat_id:chatId,text:text,parse_mode:"HTML"});
    const options = {
      hostname:"api.telegram.org",
      path:`/bot${TOKEN}/sendMessage`,
      method:"POST",
      headers:{"Content-Type":"application/json","Content-Length":Buffer.byteLength(body)}
    };
    const req = https.request(options, res => {
      let d=""; res.on("data",c=>d+=c);
      res.on("end",()=>resolve(JSON.parse(d)));
    });
    req.on("error",reject); req.write(body); req.end();
  });
}

let lastUpdateId = 0;
function getUpdates() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname:"api.telegram.org",
      path:`/bot${TOKEN}/getUpdates?offset=${lastUpdateId+1}&timeout=10`,
      method:"GET"
    };
    const req = https.request(options, res => {
      let d=""; res.on("data",c=>d+=c);
      res.on("end",()=>resolve(JSON.parse(d)));
    });
    req.on("error",reject); req.end();
  });
}

let latestList = [];

function formatMsg(list) {
  const first = list[0];
  const period = first.issueNumber||first.issue||"?";
  let number = parseInt(first.number||first.result||0);
  if(isNaN(number)) number=0;
  const isBig = number>=5;
  let b=0,s=0;
  list.forEach(i=>{const n=parseInt(i.number||i.result||0);if(n>=5)b++;else s++;});
  const t=b+s, bp=Math.floor((b/t)*100), sp=100-bp;
  const trend=bp>sp?"🔥 BIG SIDE STRONG":sp>bp?"⚠️ SMALL SIDE STRONG":"⚡ BALANCED";
  let hist="";
  list.slice(0,5).forEach(i=>{
    const p=String(i.issueNumber||i.issue||"-").slice(-6);
    const n=i.number||i.result||"-";
    const bs=parseInt(n)>=5?"🟢 BIG":"🔴 SML";
    hist+=`  ${p} | ${n} | ${bs}\n`;
  });
  return `⚡ <b>JAI CLUB LIVE</b> ⚡\n\n📌 <b>Period:</b> ${period}\n🎯 <b>Result:</b> ${isBig?"🟢 BIG":"🔴 SMALL"} (${number})\n\n📊 <b>Trend:</b> ${trend}\n🟢 BIG: ${bp}%  |  🔴 SMALL: ${sp}%\n\n📜 <b>History:</b>\n${hist}\n🕐 ${new Date().toLocaleTimeString("en-IN")}`;
}

const PANEL = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>JAI CLUB LIVE</title><style>*{margin:0;padding:0;box-sizing:border-box;font-family:Arial,sans-serif;}body{background:#030712;color:white;display:flex;justify-content:center;align-items:center;min-height:100vh;padding:20px;}.panel{width:100%;max-width:430px;background:#071427;border-radius:35px;padding:20px;border:2px solid #00ffd5;box-shadow:0 0 25px #00ffd5;animation:glow 2s infinite alternate;}@keyframes glow{from{box-shadow:0 0 20px #00ffd5;}to{box-shadow:0 0 40px #00ffd5;}}.title{text-align:center;font-size:28px;font-weight:bold;margin-bottom:20px;color:#00ffd5;text-shadow:0 0 20px #00ffd5;}.card{background:#0d1d35;padding:18px;margin-bottom:15px;border-radius:22px;border:1px solid #00ffd544;}.label{font-size:13px;color:#93a7c9;margin-bottom:10px;}.value{font-size:26px;font-weight:bold;color:#00ffd5;}.result{text-align:center;font-size:48px;font-weight:bold;padding:22px;border-radius:30px;margin-bottom:18px;background:#020b18;border:2px solid #00ffd5;box-shadow:0 0 25px #00ffd5;animation:pulse 1.5s infinite;}@keyframes pulse{0%{transform:scale(1);}50%{transform:scale(1.03);}100%{transform:scale(1);}}.barBox{margin-top:10px;margin-bottom:15px;}.barBg{height:18px;background:#111;border-radius:20px;overflow:hidden;margin-top:5px;}.bar{height:100%;width:50%;transition:1s;}.greenBar{background:#00ff66;}.redBar{background:#ff4444;}.aiBox{text-align:center;font-size:20px;font-weight:bold;margin-top:15px;color:#00ffd5;}.history{margin-top:15px;}.historyItem{background:#0d1d35;padding:12px;border-radius:15px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;font-size:15px;}.green{color:#00ff66;font-weight:bold;}.red{color:#ff4444;font-weight:bold;}.footer{display:flex;justify-content:space-between;margin-top:15px;font-size:14px;color:#9cb3d8;}.blink{animation:blink 1s infinite;}@keyframes blink{50%{opacity:0.4;}}</style></head><body><div class="panel"><div class="title">⚡ JAI CLUB LIVE ⚡</div><div class="card"><div class="label">LIVE PERIOD</div><div class="value" id="period">Loading...</div></div><div class="card"><div class="label">SERVER STATUS</div><div class="value green blink" id="status">CONNECTED</div></div><div class="result" id="prediction">---</div><div class="card"><div class="label">AI TREND ANALYSIS</div><div class="barBox">BIG PRESSURE<div class="barBg"><div class="bar greenBar" id="bigBar"></div></div></div><div class="barBox">SMALL PRESSURE<div class="barBg"><div class="bar redBar" id="smallBar"></div></div></div><div class="aiBox" id="trendText">ANALYZING...</div></div><div class="footer"><div class="green">🟢 LIVE AI</div><div id="time"></div></div><div class="history" id="history"></div></div><script>async function load(){try{const r=await fetch('/api/data');const list=await r.json();if(!list||!list.length)return;const first=list[0];document.getElementById('period').innerText=first.issueNumber||first.issue||'?';let n=parseInt(first.number||first.result||0);if(isNaN(n))n=0;const isBig=n>=5;const pred=document.getElementById('prediction');pred.innerText=isBig?'BIG':'SMALL';pred.style.color=isBig?'#00ff66':'#ff4444';pred.style.borderColor=isBig?'#00ff66':'#ff4444';pred.style.boxShadow=isBig?'0 0 25px #00ff66':'0 0 25px #ff4444';let b=0,s=0;list.forEach(i=>{const x=parseInt(i.number||i.result||0);if(x>=5)b++;else s++;});const t=b+s;const bp=Math.floor((b/t)*100),sp=100-bp;document.getElementById('bigBar').style.width=bp+'%';document.getElementById('smallBar').style.width=sp+'%';const trend=bp>sp?'🔥 BIG SIDE STRONG':sp>bp?'⚠ SMALL SIDE STRONG':'⚡ BALANCED TREND';document.getElementById('trendText').innerText=trend+'  '+bp+'% / '+sp+'%';const h=document.getElementById('history');h.innerHTML='';list.slice(0,8).forEach(i=>{const p=i.issueNumber||i.issue||'-';const x=i.number||i.result||'-';const bs=parseInt(x)>=5?'BIG':'SMALL';h.innerHTML+='<div class="historyItem"><div>'+p+'</div><div>'+x+'</div><div class="'+(bs==='BIG'?'green':'red')+'">'+bs+'</div></div>';});document.getElementById('status').innerText='CONNECTED ✓';}catch(e){document.getElementById('status').innerText='ERROR';}}setInterval(()=>document.getElementById('time').innerText=new Date().toLocaleTimeString(),1000);load();setInterval(load,10000);</script></body></html>`;

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin","*");
  if(req.url==="/api/data"){
    res.writeHead(200,{"Content-Type":"application/json"});
    res.end(JSON.stringify(latestList));
  } else if(req.url==="/"||req.url==="/panel"){
    res.writeHead(200,{"Content-Type":"text/html"});
    res.end(PANEL);
  } else { res.writeHead(404); res.end("Not found"); }
});

server.listen(PORT,()=>console.log(`✅ Server on port ${PORT}`));

async function autoFetch(){
  try{
    const data=await fetch91Club();
    let list=data?.data?.list||data?.data||(Array.isArray(data)?data:[]);
    if(list.length>0){latestList=list;console.log("✅ Updated:",new Date().toLocaleTimeString());}
  }catch(e){console.log("Fetch error:",e.message);}
}

async function botLoop(){
  console.log("🤖 Bot active!");
  while(true){
    try{
      const updates=await getUpdates();
      if(updates.ok){
        for(const update of updates.result){
          lastUpdateId=update.update_id;
          const msg=update.message;
          if(!msg)continue;
          const chatId=msg.chat.id;
          const text=(msg.text||"").trim().toLowerCase();
          if(text==="/start"){
            await sendTelegram(chatId,"⚡ <b>JAI CLUB LIVE BOT</b>\n\n/live — Latest result\n/trend — Trend analysis\n/history — Last 8 periods");
          } else if(text==="/live"){
            if(latestList.length>0)await sendTelegram(chatId,formatMsg(latestList));
            else await sendTelegram(chatId,"Thoda wait karo data load ho raha hai...");
          } else if(text==="/trend"){
            if(latestList.length>0){
              let b=0,s=0;
              latestList.forEach(i=>{const n=parseInt(i.number||i.result||0);if(n>=5)b++;else s++;});
              const t=b+s,bp=Math.floor((b/t)*100),sp=100-bp;
              const trend=bp>sp?"🔥 BIG HEAVY":sp>bp?"⚠️ SMALL HEAVY":"⚡ BALANCED";
              await sendTelegram(chatId,`📊 <b>Trend:</b> ${trend}\n🟢 BIG: ${bp}%\n🔴 SMALL: ${sp}%`);
            }
          } else if(text==="/history"){
            if(latestList.length>0){
              let m="📜 <b>Last 8 Periods:</b>\n\n";
              latestList.slice(0,8).forEach(i=>{
                const p=String(i.issueNumber||i.issue||"-").slice(-6);
                const n=i.number||i.result||"-";
                const bs=parseInt(n)>=5?"🟢 BIG":"🔴 SML";
                m+=`${p} | ${n} | ${bs}\n`;
              });
              await sendTelegram(chatId,m);
            }
          }
        }
      }
    }catch(e){console.log("Bot error:",e.message);}
    await new Promise(r=>setTimeout(r,2000));
  }
}

autoFetch();
setInterval(autoFetch,10000);
botLoop();
