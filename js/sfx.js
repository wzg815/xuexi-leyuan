/* 音效（WebAudio 合成，无需音频文件）与朗读（Web Speech API） */
(function (root) {
  let ctx = null;
  const on = () => !root.STORE || root.STORE.state.settings.sound;
  function ac() {
    if (!ctx) { const C = root.AudioContext || root.webkitAudioContext; if (!C) return null; ctx = new C(); }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, dur, { type = 'sine', vol = 0.18, delay = 0, slide = 0 } = {}) {
    const c = ac(); if (!c || !on()) return;
    const t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, vol = 0.15) {
    const c = ac(); if (!c || !on()) return;
    const b = c.createBuffer(1, c.sampleRate * dur, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = c.createBufferSource(), g = c.createGain(), f = c.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 1200; g.gain.value = vol; s.buffer = b; s.connect(f).connect(g).connect(c.destination); s.start();
  }
  const SFX = {
    unlock: ac,
    click() { tone(660, 0.06, { type: 'triangle', vol: 0.1 }); },
    correct() { [523, 659, 784].forEach((f, i) => tone(f, 0.18, { type: 'triangle', delay: i * 0.08 })); },
    wrong() { tone(220, 0.25, { type: 'square', vol: 0.07, slide: -80 }); tone(165, 0.3, { type: 'square', vol: 0.06, delay: 0.12, slide: -40 }); },
    star() { [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, 0.12, { vol: 0.1, delay: i * 0.05 })); },
    win() { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i === 5 ? 0.5 : 0.16, { type: 'triangle', delay: i * 0.12, vol: 0.16 })); },
    lose() { [392, 330, 262].forEach((f, i) => tone(f, 0.3, { type: 'triangle', delay: i * 0.2, vol: 0.12 })); },
    hit() { noise(0.25, 0.2); tone(120, 0.2, { type: 'sawtooth', vol: 0.1, slide: -60 }); },
    tick() { tone(1200, 0.03, { type: 'square', vol: 0.04 }); },
    pop() { tone(880, 0.08, { type: 'sine', vol: 0.12, slide: 300 }); }
  };
  // ---- 朗读 ----
  let voices = [];
  const syn = root.speechSynthesis;
  function loadVoices() { try { voices = syn ? syn.getVoices() : []; } catch (e) { voices = []; } }
  if (syn) { loadVoices(); syn.onvoiceschanged = loadVoices; }
  function speak(text, lang = 'zh-CN') {
    if (!syn || (root.STORE && !root.STORE.state.settings.voice)) return false;
    try {
      syn.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang; u.rate = lang.startsWith('zh') ? 0.8 : 0.75; u.pitch = 1.05;
      const pref = lang.toLowerCase(), base = pref.split('-')[0];
      const v = voices.find(v => v.lang.toLowerCase().replace('_', '-') === pref) || voices.find(v => v.lang.toLowerCase().startsWith(base));
      if (v) u.voice = v;
      syn.speak(u); return true;
    } catch (e) { return false; }
  }
  const canSpeak = () => !!syn;
  root.SFX = SFX; root.SPEAK = { speak, canSpeak, hasLang: l => voices.some(v => v.lang.toLowerCase().startsWith(l)) };
})(self);
