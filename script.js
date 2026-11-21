const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

let step  = 0;       // رقم الخطوة الحالية
let saved = false;   // هل تسجل؟

const roster = [
  ["Leader name", 1, "👑 Leader"],
  ["Participant 2"],
  ["Participant 3"],
  ["Participant 4"],
  ["Participant 5", 0, "Optional"]
];

$("#roster").innerHTML = roster.map((r, i) => `
  <div class="member" data-i="${i}">
    <span class="helmet">🪖</span>
    <div class="f"><label>${r[0]}</label><input id="m${i}" autocomplete="off"></div>
    ${r[2] ? `<span class="badge ${i == 4 ? "opt" : ""}">${r[2]}</span>` : ""}
  </div>`).join("");
  function cd(){
  const d = new Date("2026-12-10T09:00:00") - new Date();
  if (d <= 0){ $("#cd").textContent = "The event has started!"; return; }
  const v = [["Days", d/864e5], ["Hours", d/36e5 % 24], ["Min", d/6e4 % 60], ["Sec", d/1e3 % 60]];
  $("#cd").innerHTML = v.map(x =>
    `<div><b>${String(Math.floor(x[1])).padStart(2,"0")}</b><small>${x[0]}</small></div>`).join("");
}
cd();
setInterval(cd, 1000);
const rules = {
  name:  () => $("#club").value.trim().length >= 2,
  uni:   () => $("#uni").value !== "",
  phone: () => /^(?:\+213|0)[5-7]\d{8}$/.test($("#phone").value.replace(/[\s.-]/g, "")),
  email: () => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test($("#email").value.trim())
};
const memberOk = i => $("#m" + i).value.trim().length >= 2;

function mark(key, show){
  const f  = document.querySelector(`[data-v=${key}]`);
  const ok = rules[key]();
  f.classList.toggle("ok", ok);
  f.classList.toggle("bad", show && !ok);
  f.querySelector(".st").textContent = ok ? (key == "phone" ? "📞" : key == "email" ? "📬" : "✔") : "✖";
  return ok;
}
function progress(){
  let n = 0;
  Object.keys(rules).forEach(k => { if (rules[k]()) n++; });
  for (let i = 0; i < 4; i++) if (memberOk(i)) n++;

  const p = Math.round(n / 8 * 100);
  $("#fill").style.width = (saved ? 100 : p) + "%";
  $("#pct").textContent  = saved ? "Forest saved" : "Fire " + (100 - p) + "%";
  $("#ico").textContent  = saved ? "🌳" : p < 35 ? "🔥" : p < 80 ? "🌿" : "🌱";
  if (!saved) $("#glow").style.opacity = Math.max(.08, 1 - p / 100);
  $$(".member").forEach((m, i) => m.classList.toggle("ok", memberOk(i)));
}
Object.keys(rules).forEach(k => {
  const e = document.querySelector(`[data-v=${k}] input, [data-v=${k}] select`);
  e.addEventListener("input",  () => { mark(k, false); progress(); });
  e.addEventListener("blur",   () => { mark(k, true);  progress(); });
  e.addEventListener("change", () => { mark(k, true);  progress(); });
});

$$(".member input").forEach(e => e.addEventListener("input", () => {
  e.closest(".member").style.borderColor = "";
  progress();
}));

$("#phone").addEventListener("input", e => {
  let d = e.target.value.replace(/[^\d+]/g, "");
  if (!d.startsWith("+")){
    d = d.slice(0, 10).replace(/(\d{4})(\d{0,2})(\d{0,2})(\d{0,2})/,
        (_, a, b, c, x) => [a, b, c, x].filter(Boolean).join(" "));
  }
  e.target.value = d;
});
function valid(s){
  if (s == 0) return ["name", "uni"].map(k => mark(k, true)).every(Boolean);
  if (s == 1) return ["phone", "email"].map(k => mark(k, true)).every(Boolean);
  if (s == 2){
    let ok = true;
    for (let i = 0; i < 4; i++){
      if (!memberOk(i)){
        ok = false;
        const m = $("#m" + i).closest(".member");
        m.style.borderColor = "var(--red)";
        m.animate([{transform:"translateX(-6px)"}, {transform:"translateX(6px)"}, {transform:"none"}], {duration:300});
      }
    }
    return ok;
  }
  return true;
}

function go(to){
  const cur = $(`.panel[data-step="${step}"]`);
  cur.classList.add("out");
  setTimeout(() => {
    cur.classList.remove("out", "active");
    step = to;
    $(`.panel[data-step="${step}"]`).classList.add("active");
    $$("#steps span").forEach((s, i) => s.classList.toggle("on", i <= step));
    $("#back").style.visibility = step ? "visible" : "hidden";
    $("#next").textContent = step == 3 ? "Extinguish the fire 🧯" : "Next";
    $("#next").classList.toggle("fire-btn", step == 3);
    if (step == 3) summary();
  }, 280);
}

function summary(){
  const names = [0,1,2,3,4].map(i => $("#m" + i).value.trim()).filter(Boolean);
  const esc = s => s.replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  $("#sum").innerHTML = [
    ["Club", $("#club").value], ["University", $("#uni").value],
    ["Phone", $("#phone").value], ["Email", $("#email").value],
    ["Leader", names[0]], ["Team", names.slice(1).join(", ")]
  ].map(r => `<div><span>${r[0]}</span><b>${esc(r[1].trim())}</b></div>`).join("");
}

$("#next").onclick = () => {
  if (step < 3){ if (valid(step)) go(step + 1); return; }
  saved = true;
  document.body.classList.add("saved");
  $$(".panel,.steps,.nav").forEach(e => e.style.display = "none");
  $("#done").style.display = "block";
  progress();
  confetti();
  $("#form").scrollIntoView({block: "center"});
};
$("#back").onclick = () => go(step - 1);
$("#join").onclick = () => $("#form").scrollIntoView({block: "start"});
const cv = $("#embers"), cx = cv.getContext("2d");
let W, H, P = [];

function size(){ W = cv.width = innerWidth; H = cv.height = innerHeight; }
size();
addEventListener("resize", size);

const mk = () => ({
  x: Math.random() * W, y: H + 10,
  r: Math.random() * 2.4 + .6,
  vy: Math.random() * 1.2 + .4,
  vx: Math.random() * .8 - .4,
  a: Math.random() * .7 + .3
});
for (let i = 0; i < 70; i++){ const p = mk(); p.y = Math.random() * H; P.push(p); }

(function tick(){
  cx.clearRect(0, 0, W, H);
  const c = saved ? "121,174,68" : "240,110,50";
  P.forEach(p => {
    p.y -= p.vy;
    p.x += p.vx + Math.sin(p.y / 40) * .3;
    p.a -= .0015;
    if (p.y < -10 || p.a <= 0) Object.assign(p, mk());
    cx.beginPath();
    cx.fillStyle   = `rgba(${c},${p.a})`;
    cx.shadowColor = `rgb(${c})`;
    cx.shadowBlur  = 8;
    cx.arc(p.x, p.y, p.r, 0, 7);
    cx.fill();
  });
  requestAnimationFrame(tick);
})();
function confetti(){
  const c = $("#conf"), g = c.getContext("2d");
  c.width = innerWidth; c.height = innerHeight;
  const cols = ["#79AE44", "#a3d36f", "#F8FAF9", "#DF3331"];
  const f = Array.from({length: 150}, () => ({
    x: innerWidth / 2, y: innerHeight * .6,
    vx: (Math.random() - .5) * 16,
    vy: -Math.random() * 16 - 4,
    s: Math.random() * 8 + 4,
    c: cols[Math.random() * 4 | 0],
    r: Math.random() * 6
  }));
  let t = 0;
  (function d(){
    g.clearRect(0, 0, c.width, c.height);
    f.forEach(p => {
      p.vy += .35; p.x += p.vx; p.y += p.vy; p.r += .2;
      g.save();
      g.translate(p.x, p.y); g.rotate(p.r);
      g.fillStyle = p.c;
      g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      g.restore();
    });
    if (++t < 170) requestAnimationFrame(d); else g.clearRect(0, 0, c.width, c.height);
  })();
}

progress(); 
