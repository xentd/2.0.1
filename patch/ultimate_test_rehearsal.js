const { chromium } = require('playwright');
const fake = `
  const BASE = 0x10000a00, mem = new Map(); const put = (o, v) => mem.set(BASE + o, v);
  put(0, -1); put(8, 430); put(-0x1a8, 0.033); put(-0x1c8, 5.39); put(-0x950, 8.5); put(-0x260, 0.73); put(-0x150, 100); put(-0x140, 100);
  const cap = 0.033 * 1000 / 8 / 1000;                 // rad per ms
  let finger = 0, wanted = 0, head = 0, last = performance.now(); const hist = [];
  setInterval(() => { finger = (finger + 150 * Math.PI / 180 * 16.7 / 1000) % (2 * Math.PI); put(-0x940, finger); hist.push([performance.now(), finger]); }, 16.7);
  (function frame() {                                   // game loop, 60 fps, 10% long frames
    const now = performance.now(), dt = now - last; last = now;
    while (hist.length > 1 && now - hist[1][0] >= 60) hist.shift();   // 60 ms input latency
    wanted = hist.length ? hist[0][1] : 0;
    let d = wanted - head; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    const m = cap * dt; head = head + Math.max(-m, Math.min(m, d)); head = (head % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    put(-0x10, head); put(-0x150, mem.get(BASE - 0x150) + 1);
    setTimeout(frame, Math.random() < 0.1 ? 33.3 : 16.7);
  })();
  setInterval(() => put(-0x260, 0.73), 30);            // game pulls zoom back
  const key = a => parseInt(a, 16);
  window.h5gg = { clearResults(){}, searchNumber(){}, searchNearby(){}, getResults(){ return [{address: '0x' + BASE.toString(16)}]; },
    getValue(a){ const v = mem.get(key(a)); return v === undefined ? 0 : v; }, setValue(a, v){ mem.set(key(a), Number(v)); return true; } };
  window.setWindowRect = function(){}; window.setWindowDrag = function(){}; window.setButtonImage = function(){};`;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 520, height: 360 } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await p.addInitScript(fake);
  await p.goto('file:///home/user/2.0.1/patch/H5Menu.ultimate.html');
  await p.evaluate(() => { startExecution(); const z = document.getElementById('zoomwhere'); z.checked = true; z.dispatchEvent(new Event('change'));
    const s = document.getElementById('zzomsec'); s.value = 0.35; s.dispatchEvent(new Event('input')); });
  await p.waitForTimeout(1500);
  await p.evaluate(() => ultimateTest());
  await p.waitForTimeout(16500);
  console.log(await p.evaluate(() => document.getElementById('utText').textContent));
  await p.screenshot({ path: 'ult/report.png' });
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
})();
