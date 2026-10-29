/* ============================================================
   川渝大数据岗位市场洞察 · 交互逻辑
   ECharts 暗黑主题 / Hero 粒子 / 滚动动效 / 代码高亮
   ============================================================ */

/* ---------- 真实数据（fallback，与 chart_data.json 一致） ---------- */
const EMBEDDED = {
  edu:   { cats: ["大专","本科","硕士","博士","不限"], vals: [28,135,41,1,220] },
  city:  [
    {name:"重庆·主城",value:172},{name:"泸州",value:23},{name:"大渡口区",value:20},
    {name:"四川·其他",value:18},{name:"成都",value:17},{name:"德阳",value:16},
    {name:"北碚区",value:16},{name:"南岸区",value:15},{name:"南川区",value:10},
    {name:"合川区",value:9},{name:"内江",value:8},{name:"江津区",value:8},
    {name:"平昌县",value:7},{name:"九龙坡区",value:6}
  ],
  skills: [
    {name:"工程",value:609},{name:"技术",value:417},{name:"计算机",value:324},
    {name:"电子",value:249},{name:"数学",value:232},{name:"网络",value:140},
    {name:"管理",value:109},{name:"软件工程",value:104},{name:"数据",value:83},
    {name:"通信",value:70},{name:"教师",value:64},{name:"分析",value:63},
    {name:"设计",value:58},{name:"Python",value:41},{name:"Java",value:30},
    {name:"数据库",value:27},{name:"人工智能",value:12},{name:"信息安全",value:8}
  ],
  sal_hist: [
    {range:"<3k",value:21},{range:"3-4k",value:64},{range:"4-5k",value:64},
    {range:"5-7k",value:55},{range:"7-10k",value:58},{range:">10k",value:13}
  ],
  sal_box: { min:2000, q1:3000, median:4000, q3:7000, max:17000 },
  face_to_face: 150
};

/* ECharts 配色 */
const C_CYAN = "#00F0FF", C_PURPLE = "#b14bff", C_TEXT = "#c9d4e3", C_MUTED = "#7a8aa3";
const gradV = (c1, c2) => new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:c1},{offset:1,color:c2}]);
const gradH = (c1, c2) => new echarts.graphic.LinearGradient(0,0,1,0,[{offset:0,color:c1},{offset:1,color:c2}]);

function baseGrid() {
  return {
    textStyle: { color: C_TEXT, fontFamily: "Rajdhani, sans-serif" },
    backgroundColor: "transparent"
  };
}
function axisStyle() {
  return {
    axisLine: { lineStyle: { color: "rgba(0,240,255,0.25)" } },
    axisLabel: { color: C_MUTED },
    splitLine: { lineStyle: { color: "rgba(0,240,255,0.08)", type: "dashed" } },
    axisTick: { show: false }
  };
}

/* ---------- 学历柱状图 ---------- */
function renderEdu(d) {
  const ch = echarts.init(document.getElementById("chart-edu"));
  ch.setOption({
    ...baseGrid(),
    tooltip: { trigger: "axis", backgroundColor:"rgba(11,17,32,0.92)", borderColor:C_CYAN,
      textStyle:{color:C_TEXT}, axisPointer:{type:"shadow"} },
    grid: { left: 50, right: 20, top: 20, bottom: 36 },
    xAxis: { type: "category", data: d.edu.cats, ...axisStyle() },
    yAxis: { type: "value", name: "岗位数", ...axisStyle() },
    series: [{
      type: "bar", barWidth: "52%",
      data: d.edu.vals.map((v,i) => ({
        value: v,
        itemStyle: { color: i === d.edu.cats.indexOf("不限")
          ? gradV(C_PURPLE, C_CYAN)
          : gradV(C_CYAN, "#1b6cff") }
      })),
      label: { show: true, position: "top", color: C_TEXT, fontFamily:"Orbitron" },
      itemStyle: { borderRadius: [6,6,0,0] }
    }]
  });
  return ch;
}

/* ---------- 城市需求（横向柱状） ---------- */
function renderCity(d) {
  const ch = echarts.init(document.getElementById("chart-city"));
  const arr = [...d.city].sort((a,b)=>a.value-b.value);
  ch.setOption({
    ...baseGrid(),
    tooltip: { trigger: "axis", axisPointer:{type:"shadow"}, backgroundColor:"rgba(11,17,32,0.92)", borderColor:C_CYAN, textStyle:{color:C_TEXT} },
    grid: { left: 80, right: 24, top: 10, bottom: 20 },
    xAxis: { type: "value", ...axisStyle() },
    yAxis: { type: "category", data: arr.map(x=>x.name), ...axisStyle() },
    series: [{
      type: "bar", barWidth: "60%",
      data: arr.map(x => ({
        value: x.value,
        itemStyle: { color: gradH(C_CYAN, C_PURPLE), borderRadius:[0,6,6,0] }
      })),
      label: { show: true, position: "right", color: C_TEXT }
    }]
  });
  return ch;
}

/* ---------- 技能词频（横向柱状，Top18） ---------- */
function renderSkill(d) {
  const ch = echarts.init(document.getElementById("chart-skill"));
  const arr = [...d.skills].sort((a,b)=>a.value-b.value);
  ch.setOption({
    ...baseGrid(),
    tooltip: { trigger: "axis", axisPointer:{type:"shadow"}, backgroundColor:"rgba(11,17,32,0.92)", borderColor:C_CYAN, textStyle:{color:C_TEXT} },
    grid: { left: 90, right: 40, top: 10, bottom: 20 },
    xAxis: { type: "value", name: "出现频次", ...axisStyle() },
    yAxis: { type: "category", data: arr.map(x=>x.name), ...axisStyle() },
    series: [{
      type: "bar", barWidth: "62%",
      data: arr.map((x,i) => ({
        value: x.value,
        itemStyle: {
          color: gradH(C_PURPLE, C_CYAN),
          borderRadius:[0,6,6,0],
          shadowColor: "rgba(0,240,255,0.35)", shadowBlur: 8
        }
      })),
      label: { show: true, position: "right", color: C_TEXT, fontFamily:"Orbitron" }
    }]
  });
  return ch;
}

/* ---------- 薪资分布（直方图 + 分位线） ---------- */
function renderSalary(d) {
  const ch = echarts.init(document.getElementById("chart-salary"));
  const b = d.sal_box;
  ch.setOption({
    ...baseGrid(),
    tooltip: { trigger: "axis", axisPointer:{type:"shadow"}, backgroundColor:"rgba(11,17,32,0.92)", borderColor:C_CYAN, textStyle:{color:C_TEXT} },
    grid: { left: 56, right: 24, top: 30, bottom: 40 },
    xAxis: { type: "category", data: d.sal_hist.map(x=>x.range), ...axisStyle() },
    yAxis: { type: "value", name: "岗位数", ...axisStyle() },
    series: [{
      type: "bar", barWidth: "55%",
      data: d.sal_hist.map(x=>({ value:x.value, itemStyle:{ color: gradV(C_CYAN, C_PURPLE), borderRadius:[6,6,0,0] } })),
      label: { show: true, position: "top", color: C_TEXT },
      markLine: {
        symbol: "none", silent: true,
        lineStyle: { color: "#ff5f9e", type: "dashed", width: 1.5 },
        label: { color: "#ff9ec7", formatter: "中位数 {c}" },
        data: [{ yAxis: b.median }, { yAxis: b.q1, lineStyle:{color:"#7a8aa3"} }, { yAxis: b.q3, lineStyle:{color:"#7a8aa3"} }]
      }
    }]
  });
  return ch;
}

/* ---------- 加载数据并渲染 ---------- */
async function bootCharts() {
  let d = EMBEDDED;
  try {
    const r = await fetch("chart_data.json", { cache: "no-store" });
    if (r.ok) d = await r.json();
  } catch (e) { /* file:// 下 fetch 失败，使用内嵌数据 */ }

  const charts = [renderEdu(d), renderCity(d), renderSkill(d), renderSalary(d)];
  window.addEventListener("resize", () => charts.forEach(c => c.resize()));
}

/* ===================== Hero 粒子网络 ===================== */
function heroParticles() {
  const cv = document.getElementById("hero-canvas");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  let W, H, pts;
  function resize() {
    W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight;
    const n = Math.min(90, Math.floor(W * H / 16000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random()*W, y: Math.random()*H,
      vx: (Math.random()-0.5)*0.5, vy: (Math.random()-0.5)*0.5
    }));
  }
  function draw() {
    ctx.clearRect(0,0,W,H);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x<0||p.x>W) p.vx*=-1; if (p.y<0||p.y>H) p.vy*=-1;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 7);
      ctx.fillStyle = "rgba(0,240,255,0.8)"; ctx.fill();
    }
    for (let i=0;i<pts.length;i++) for (let j=i+1;j<pts.length;j++) {
      const a=pts[i], b=pts[j], dx=a.x-b.x, dy=a.y-b.y, dist=Math.hypot(dx,dy);
      if (dist < 130) {
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
        ctx.strokeStyle = `rgba(177,75,255,${0.16*(1-dist/130)})`;
        ctx.lineWidth = 1; ctx.stroke();
      }
    }
    requestAnimationFrame(draw);
  }
  resize(); draw();
  window.addEventListener("resize", resize);
}

/* ===================== 滚动浮出 ===================== */
function revealOnScroll() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));
}

/* ===================== 导航高亮（scrollspy） ===================== */
function scrollspy() {
  const links = [...document.querySelectorAll(".nav-link")];
  const secs = links.map(l => document.querySelector(l.getAttribute("href")));
  window.addEventListener("scroll", () => {
    const y = window.scrollY + 120;
    let idx = 0;
    secs.forEach((s,i) => { if (s && s.offsetTop <= y) idx = i; });
    links.forEach((l,i) => l.classList.toggle("active", i === idx));
  });
}

/* ===================== 折叠面板 ===================== */
function accordion() {
  document.querySelectorAll(".acc-item").forEach(item => {
    const head = item.querySelector(".acc-head");
    head.addEventListener("click", () => {
      const body = item.querySelector(".acc-body");
      const open = item.classList.toggle("open");
      body.style.maxHeight = open ? body.scrollHeight + "px" : "0px";
    });
  });
}

/* ===================== Mermaid 流程图（暗黑主题） ===================== */
function initMermaid() {
  if (!window.mermaid) {
    console.warn("[mermaid] 库未加载，流程图跳过渲染");
    return;
  }
  try {
    // startOnLoad 必须关闭：main.js 在 DOMContentLoaded 后执行，事件已错过，自动渲染不会触发
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      flowchart: { htmlLabels: true, curve: "basis" },
      themeVariables: {
        darkMode: true,
        background: "transparent",
        primaryColor: "rgba(0,240,255,0.12)",
        primaryTextColor: "#c9d4e3",
        primaryBorderColor: "#00F0FF",
        lineColor: "#7a8aa3",
        secondaryColor: "rgba(177,75,255,0.14)",
        tertiaryColor: "rgba(13,21,38,0.65)",
        clusterBkg: "rgba(13,21,38,0.55)",
        clusterBorder: "rgba(0,240,255,0.25)",
        fontFamily: "Rajdhani, sans-serif"
      }
    });
    // 显式触发渲染（mermaid v10+ API）
    if (typeof mermaid.run === "function") {
      mermaid.run({ querySelector: ".mermaid" }).catch(err => {
        console.error("[mermaid] 渲染失败:", err);
      });
    } else {
      // 兼容旧 API
      mermaid.init(undefined, document.querySelectorAll(".mermaid"));
    }
  } catch (e) {
    console.error("[mermaid] 初始化异常:", e);
  }
}

/* ===================== 启动 ===================== */
window.addEventListener("DOMContentLoaded", () => {
  if (window.echarts) bootCharts();
  if (window.hljs) hljs.highlightAll();
  initMermaid();
  heroParticles();
  revealOnScroll();
  scrollspy();
  accordion();
});
