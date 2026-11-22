const { chromium } = require('playwright');
const fake = `
  const BASE = 0x10000a00, LO = BASE - 0x6000, buf = new DataView(new ArrayBuffer(0xC000)); const put = (o, v) => buf.setFloat64(BASE + o - LO, v, true); const put32 = (o, v) => buf.setFloat32(BASE + o - LO, v, true);
  put(0, -1); put(8, 430); put(-0x1a8, 0.033); put(-0x950, 8.5); put(-0x260, 0.73);
  const cap = 0.033 * 1000 / 8 / 1000;
  let finger = 0, head = 0, last = performance.now(), px = 5000, py = 5000, base = 0; const hist = []; const T0 = performance.now();
  setInterval(() => {                                  // zigzag: drift slowly + swing +-70 deg about once a second
    const t = (performance.now() - T0) / 1000; base += 0.3 * 16.7 / 1000;
    finger = base + 40 * Math.PI / 180 * Math.sin(2 * Math.PI * 0.6 * t);
    const r = 90 + 20 * Math.sin(t * 1.3);
    put32(0x2a00, 430 + r * Math.cos(finger)); put32(0x2a04, 200 - r * Math.sin(finger));   // hidden finger (F32 screen X/Y)
    hist.push([performance.now(), finger]);
  }, 16.7);
  (function frame() {
    const now = performance.now(), dt = now - last; last = now;
    while (hist.length > 1 && now - hist[1][0] >= 60) hist.shift();
    const wanted = hist.length ? hist[0][1] : 0;
    let d = wanted - head; d = ((d + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
    const m = cap * dt; head = head + Math.max(-m, Math.min(m, d)); head = ((head % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    px += Math.cos(head) * 0.2 * dt; py += Math.sin(head) * 0.2 * dt;           // snake map position (the decoy)
    put(-0x10, head); put(-0x810, px); put(-0x808, py); put(-0x800, px + 3); put(-0x7f0, py - 2);
    put(-0x908, head); for (let z = 0; z < 150; z++) put(-0x3f00 + z * 8, Math.random() * 5);
    setTimeout(frame, 16.7);
  })();
  const key = a => parseInt(a, 16);
  window.h5gg = { clearResults(){}, searchNumber(){}, searchNearby(){}, getResults(){ return [{address: '0x' + BASE.toString(16)}]; },
    getValue(a, t){ const e = performance.now() + 0.15; while (performance.now() < e) {} const o = key(a) - LO; if (o < 0 || o + 8 > 0xC000) return 0; return t === 'F32' ? buf.getFloat32(o, true) : buf.getFloat64(o, true); },
    setValue(a, v, t){ const o = key(a) - LO; if (o >= 0 && o + 8 <= 0xC000) { if (t === 'F32') buf.setFloat32(o, Number(v), true); else buf.setFloat64(o, Number(v), true); } return true; } };
  window.setWindowRect = function(){}; window.setWindowDrag = function(){}; window.setButtonImage = function(){};`;
(async () => {
  const b = await chromium.launch({ args: ['--js-flags=--jitless'] }); const p = await (await b.newContext({ viewport: { width: 520, height: 360 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await p.addInitScript(fake);
  await p.goto('file:///home/user/2.0.1/patch/H5Menu.ultimate.html');
  await p.evaluate(() => startExecution()); await p.waitForTimeout(800);
  const T = Date.now(); await p.evaluate(() => fingerHunt());
  for (let i = 0; i < 160; i++) { await p.waitForTimeout(500); if (await p.evaluate(() => document.getElementById('utBox').style.display === 'block')) break; }
  console.log('finished after', ((Date.now() - T) / 1000).toFixed(1), 's');
  console.log(await p.evaluate(() => document.getElementById('utText').textContent));
  console.log('errors:', errs.length ? errs : 'none'); await b.close();
})();
