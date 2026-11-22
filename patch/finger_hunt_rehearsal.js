const { chromium } = require('playwright');
const fake = `
  const BASE = 0x10000a00, mem = new Map(); const put = (o, v) => mem.set(BASE + o, v);
  put(0, -1); put(8, 430); put(-0x1a8, 0.033); put(-0x1c8, 5.39); put(-0x950, 8.5); put(-0x260, 0.73); put(-0x150, 100); put(-0x140, 100);
  const cap = 0.033 * 1000 / 8 / 1000;                 // rad per ms
  let finger = 0, wanted = 0, head = 0, last = performance.now(); const hist = [];
  setInterval(() => { finger = (finger + 88 * Math.PI / 180 * 16.7 / 1000) % (2 * Math.PI); const r = 90 + 30 * Math.sin(performance.now() / 700); put(0x2a00, 430 + r * Math.cos(finger)); put(0x2a04, 200 - r * Math.sin(finger)); put(-0x940, Math.random() * 6); const el = performance.now() - (window.__t0 || (window.__t0 = performance.now())); put(0x500, el < 6000 ? Math.random() * 3 : 1e300); put(0x508, el < 6000 ? Math.random() * 3 : Infinity); put(0x510, el < 6000 ? Math.random() * 3 : 1e9 * Math.random()); put(0x518, el < 6000 ? 2 + Math.random() : 1e15); put(0x1000, Math.random() * 50); put(0x1008, performance.now() % 1000); put(-0x3000, Math.sin(performance.now()/300) * 3); hist.push([performance.now(), finger]); }, 16.7);
  (function frame() {                                   // game loop, 60 fps, 10% long frames
    const now = performance.now(), dt = now - last; last = now;
    while (hist.length > 1 && now - hist[1][0] >= 60) hist.shift();   // 60 ms input latency
    wanted = hist.length ? hist[0][1] : 0;
    let d = wanted - head; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    const m = cap * dt; head = head + Math.max(-m, Math.min(m, d)); head = (head % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    put(-0x10, head); put(-0x150, mem.get(BASE - 0x150) + 1);
    setTimeout(frame, Math.random() < 0.1 ? 33.3 : 16.7);
  })();
  setInterval(() => put(-0x260, 0.73), 30); setInterval(() => put(-0x908, head), 66);            // game pulls zoom back
  const key = a => parseInt(a, 16);
  window.h5gg = { clearResults(){}, searchNumber(){}, searchNearby(){}, getResults(){ return [{address: '0x' + BASE.toString(16)}]; },
    getValue(a){ const e = performance.now() + 0.15; while (performance.now() < e) {} const v = mem.get(key(a)); return v === undefined ? 0 : v; }, setValue(a, v){ mem.set(key(a), Number(v)); return true; } };
  window.setWindowRect = function(){}; window.setWindowDrag = function(){}; window.setButtonImage = function(){};`;
(async () => {
  const b = await chromium.launch({ args: ['--js-flags=--jitless'] }); const ctx = await b.newContext({ viewport: { width: 520, height: 360 } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await p.addInitScript(fake);
  await p.goto('file:///home/user/2.0.1/patch/H5Menu.ultimate.html');
  await p.evaluate(() => { startExecution(); const z = document.getElementById('zoomwhere'); z.checked = true; z.dispatchEvent(new Event('change'));
    const s = document.getElementById('zzomsec'); s.value = 0.35; s.dispatchEvent(new Event('input')); });
  await p.waitForTimeout(1500);
  const T0 = Date.now(); await p.evaluate(() => fingerHunt()); const seen = new Set(); for (let i = 0; i < 160; i++) { await p.waitForTimeout(500); const pr = await p.evaluate(() => (document.getElementById('utPrompt')||{}).textContent || ''); if (pr) seen.add(pr.replace(/[0-9]+ s[)]/,'N s)').replace(/[0-9]+%/,'N%')); if (await p.evaluate(() => document.getElementById('utBox').style.display === 'block')) break; } console.log('progress lines seen:', [...seen].slice(0,8).join(' | ')); console.log('finished after', ((Date.now()-T0)/1000).toFixed(1), 's'); await p.evaluate(() => { let v = 0.35; setInterval(() => { v = v > 0.5 ? 0.3 : v + 0.05; const s = document.getElementById('zzomsec'); s.value = v; s.dispatchEvent(new Event('input')); }, 1000); });
  
  console.log(await p.evaluate(() => document.getElementById('utText').textContent));
  await p.screenshot({ path: 'ult/report.png' });
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
})();
