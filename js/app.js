/* 嘉宸歆玥学习乐园 · 主程序 */
(function () {
  'use strict';
  const D = DATA, G = GEN, S = STORE;
  const $app = document.getElementById('app');
  S.load();
  const SPEED = /[?&]fast/.test(location.search) ? 0.15 : 1; // 测试加速

  // ---------- DOM 小工具 ----------
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'html') el.innerHTML = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat(Infinity)) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
    return el;
  }
  const svgNS = 'http://www.w3.org/2000/svg';
  function s(tag, attrs, ...kids) { const el = document.createElementNS(svgNS, tag); for (const k in attrs || {}) { if (k.startsWith('on')) el.addEventListener(k.slice(2), attrs[k]); else el.setAttribute(k, attrs[k]); } kids.flat().forEach(c => c != null && el.append(c.nodeType ? c : document.createTextNode(String(c)))); return el; }
  const btn = (label, cls, fn, extra) => h('button', Object.assign({ class: 'btn ' + (cls || ''), onclick: e => { SFX.click(); fn && fn(e); } }, extra || {}), label);
  function mount(...nodes) { $app.replaceChildren(...nodes); window.scrollTo(0, 0); }
  const GRADE_CN = { 1: '一年级', 2: '二年级', 3: '三年级' };
  const SUBJ = { math: { name: '数学', icon: '🧮', color: 'blue', boss: '算术魔王' }, chinese: { name: '语文', icon: '📖', color: 'red', boss: '墨水怪' }, english: { name: '英语', icon: '🔤', color: 'green', boss: 'ABC大魔龙' } };
  const PRAISE = ['太棒了！', '真厉害！', '答对啦！', '好聪明！', '完美！', '你真行！', '继续保持！'];
  const pickOne = a => a[Math.floor(Math.random() * a.length)];
  function toast(msg, cls = '') { const t = h('div', { class: 'toast ' + cls }, msg); document.body.append(t); setTimeout(() => t.remove(), 1800); }
  function confetti(n = 24) {
    const box = h('div', { class: 'confetti' });
    const colors = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6'];
    for (let i = 0; i < n; i++) box.append(h('i', { style: { left: Math.random() * 100 + '%', background: pickOne(colors), animationDelay: Math.random() * 0.3 + 's', animationDuration: 1 + Math.random() * 0.8 + 's', transform: `rotate(${Math.random() * 360}deg)` } }));
    document.body.append(box); setTimeout(() => box.remove(), 2200);
  }

  // ---------- 头像 ----------
  function avatar(p, size = 64) {
    const bg = (D.bgColors.find(b => b[0] === p.bg) || D.bgColors[0])[3];
    const acc = D.accessories.find(a => a[0] === p.acc);
    return h('div', { class: 'avatar', style: { width: size + 'px', height: size + 'px', background: bg, fontSize: size * 0.58 + 'px' } },
      h('span', { class: 'av-face' }, p.avatar),
      acc && acc[3] ? h('span', { class: 'av-acc av-' + acc[0] }, acc[3]) : null);
  }

  // ---------- 路由 ----------
  const routes = {};
  let current = null;
  function go(name, arg) { if (current && current.cleanup) current.cleanup(); current = { name, arg }; routes[name](arg); }
  window.__go = go; // 测试用

  // ---------- 选择小朋友 ----------
  routes.profiles = () => {
    const st = S.state;
    mount(h('div', { class: 'screen profiles' },
      h('header', { class: 'hero' }, h('div', { class: 'logo' }, h('span', { class: 'logo-icon' }, '🏰'), h('div', null, h('h1', null, '嘉宸歆玥学习乐园'), h('p', null, '数学 · 语文 · 英语，边玩边学'))), h('div', { class: 'clouds' })),
      h('h2', { class: 'section-title' }, '今天谁来学习呀？'),
      h('div', { class: 'profile-grid' },
        st.profiles.map(p => h('button', { class: 'profile-card', 'data-testid': 'profile-' + p.name, onclick: () => { SFX.unlock(); SFX.pop(); st.current = p.id; S.save(); go('home'); } },
          avatar(p, 96), h('div', { class: 'pname' }, p.name), h('div', { class: 'pgrade' }, GRADE_CN[p.grade]), h('div', { class: 'pstars' }, '⭐ ', p.stars, '　🔥 ', p.streak, '天'))),
        h('button', { class: 'profile-card add', onclick: () => addProfileDialog() }, h('div', { class: 'add-plus' }, '＋'), h('div', { class: 'pname' }, '添加小朋友'))),
      h('footer', { class: 'foot' }, parentGateButton(), h('p', { class: 'privacy' }, '无广告 · 不联网收集任何信息 · 学习记录只保存在本设备'))));
  };
  function addProfileDialog(edit) {
    let grade = edit ? edit.grade : 1, av = edit ? edit.avatar : '🐼';
    const input = h('input', { class: 'text-input', maxlength: 8, placeholder: '小朋友的名字', value: edit ? edit.name : '' });
    const gradeRow = h('div', { class: 'chips' });
    const avRow = h('div', { class: 'chips' });
    const drawG = () => gradeRow.replaceChildren(...[1, 3].map(g => h('button', { class: 'chip' + (g === grade ? ' on' : ''), onclick: () => { grade = g; drawG(); } }, GRADE_CN[g])));
    const drawA = () => avRow.replaceChildren(...D.avatars.slice(0, 9).map(a => h('button', { class: 'chip emoji' + (a === av ? ' on' : ''), onclick: () => { av = a; drawA(); } }, a)));
    drawG(); drawA();
    const m = modal(h('div', null, h('h3', null, edit ? '修改信息' : '添加小朋友'), input, h('p', { class: 'muted' }, '年级（内容按人教版/部编版）'), gradeRow, edit ? null : h('p', { class: 'muted' }, '选一个头像'), edit ? null : avRow,
      h('div', { class: 'row' }, btn('取消', 'ghost', () => m.close()), btn('保存', 'primary', () => {
        const name = input.value.trim(); if (!name) { input.focus(); return; }
        if (edit) { edit.name = name; edit.grade = grade; } else S.state.profiles.push(S.newProfile(name, grade, av, pickOne(['sky', 'peach', 'lemon'])));
        S.save(); m.close(); go(current.name, current.arg);
      }))));
    setTimeout(() => input.focus(), 50);
  }
  function modal(content, cls = '') {
    const back = h('div', { class: 'modal-back', onclick: e => { if (e.target === back) close(); } }, h('div', { class: 'modal ' + cls }, content));
    function close() { back.remove(); }
    document.body.append(back); return { close, el: back };
  }
  function parentGateButton() {
    let timer = null, start = 0, raf = 0;
    const fill = h('i');
    const b = h('button', { class: 'parent-gate', 'data-testid': 'parent-gate' }, fill, h('span', null, '👨‍👩‍👧 家长中心（长按 2 秒）'));
    const stop = () => { clearTimeout(timer); cancelAnimationFrame(raf); fill.style.width = '0'; };
    const anim = () => { fill.style.width = Math.min(100, (Date.now() - start) / 20) + '%'; raf = requestAnimationFrame(anim); };
    b.addEventListener('pointerdown', e => { e.preventDefault(); start = Date.now(); anim(); timer = setTimeout(() => { stop(); SFX.pop(); go('parent'); }, 2000); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => b.addEventListener(t, stop));
    b.addEventListener('contextmenu', e => e.preventDefault());
    return b;
  }

  // ---------- 首页 ----------
  function topbar(p, opts = {}) {
    return h('div', { class: 'topbar' },
      opts.back ? h('button', { class: 'icon-btn', 'aria-label': '返回', onclick: () => { SFX.click(); opts.back(); } }, '‹') : h('button', { class: 'icon-btn av-btn', 'aria-label': '换人', onclick: () => { SFX.click(); go('profiles'); } }, avatar(p, 44)),
      h('div', { class: 'tb-title' }, opts.title || p.name),
      h('div', { class: 'pill star-pill', 'data-testid': 'stars' }, '⭐ ', h('b', null, p.stars)),
      h('div', { class: 'pill fire-pill' }, '🔥 ', h('b', null, p.streak)));
  }
  function goalBar(p) {
    const d = p.days[S.dayStr()] || { n: 0 };
    const pct = Math.min(100, Math.round(d.n / p.goal * 100));
    return h('div', { class: 'goal' }, h('div', { class: 'goal-text' }, h('span', null, '🎯 今日目标'), h('b', null, `${Math.min(d.n, p.goal)} / ${p.goal} 题`), pct >= 100 ? h('span', { class: 'done' }, '已完成！') : null),
      h('div', { class: 'bar' }, h('i', { style: { width: pct + '%' } })));
  }
  routes.home = () => {
    const p = S.cur(); if (!p) return go('profiles');
    const hour = new Date().getHours();
    const hi = hour < 11 ? '早上好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好';
    mount(h('div', { class: 'screen home' }, topbar(p),
      h('div', { class: 'greet' }, h('div', null, h('h2', null, `${hi}，${p.name}！`), h('p', null, `${GRADE_CN[p.grade]} · 今天也要闪闪发光 ✨`)), avatar(p, 72)),
      goalBar(p),
      h('button', { class: 'daily-card', 'data-testid': 'daily', onclick: () => { SFX.click(); startGame({ mode: 'daily' }); } }, h('span', { class: 'big-emoji' }, '🎁'), h('div', null, h('b', null, '每日一练'), h('small', null, '10道题，三科混合，专挑需要加强的')), h('span', { class: 'go' }, '开始 ›')),
      h('div', { class: 'subject-grid' }, Object.keys(SUBJ).map(k => h('button', { class: 'subject-card ' + SUBJ[k].color, 'data-testid': 'subj-' + k, onclick: () => { SFX.click(); go('subject', { sub: k, grade: p.grade }); } },
        h('span', { class: 'subj-icon' }, SUBJ[k].icon), h('b', null, SUBJ[k].name), h('small', null, subjProgress(p, k))))),
      h('div', { class: 'menu-grid' },
        menuItem('📒', '贴纸册', `${p.stickers.length}/${D.stickers.length}`, () => go('album')),
        menuItem('🎨', '装扮屋', '用星星换装扮', () => go('shop')),
        menuItem('🏅', '成就', `${p.badges.length}/${D.badges.length}`, () => go('album', 'badges')),
        menuItem('🔁', '换人', '切换小朋友', () => go('profiles')))));
  };
  const menuItem = (ic, name, sub, fn) => h('button', { class: 'menu-item', onclick: () => { SFX.click(); fn(); } }, h('span', null, ic), h('b', null, name), h('small', null, sub));
  function skillsFor(sub, grade) { return G.SKILLS.filter(x => x.sub === sub && (x.g === 0 || x.g === grade)); }
  function subjProgress(p, sub) {
    const list = skillsFor(sub, p.grade); const stars = list.reduce((a, sk) => a + mastery(p, sk.id), 0);
    return `★ ${stars}/${list.length * 3}`;
  }
  function mastery(p, id) { const b = (p.skills[id] || {}).best || 0; return b >= 10 ? 3 : b >= 8 ? 2 : b >= 6 ? 1 : 0; }

  // ---------- 科目页 ----------
  routes.subject = ({ sub, grade }) => {
    const p = S.cur(); const info = SUBJ[sub];
    const list = skillsFor(sub, grade);
    mount(h('div', { class: 'screen subject theme-' + info.color }, topbar(p, { back: () => go('home'), title: info.icon + ' ' + info.name }),
      sub !== 'english' ? h('div', { class: 'chips center' }, [1, 3].map(g => h('button', { class: 'chip' + (g === grade ? ' on' : ''), onclick: () => go('subject', { sub, grade: g }) }, GRADE_CN[g] + (g === 1 ? '上册' : '上册')))) :
        h('div', { class: 'chips center' }, [1, 3].map(g => h('button', { class: 'chip' + (g === grade ? ' on' : ''), onclick: () => go('subject', { sub, grade: g }) }, g === 1 ? '入门词汇' : '进阶词汇'))),
      h('button', { class: 'boss-card', 'data-testid': 'boss', onclick: () => { SFX.click(); startGame({ mode: 'boss', sub, grade }); } },
        bossSvg(sub, 70), h('div', null, h('b', null, `Boss 大作战：${info.boss}`), h('small', null, '答对就攻击！3颗爱心，打败它赢大奖')), h('span', { class: 'go' }, '⚔️')),
      h('div', { class: 'skill-grid' }, list.map(sk => {
        const m = mastery(p, sk.id), st = p.skills[sk.id];
        return h('div', { class: 'skill-card', 'data-testid': 'skill-' + sk.id },
          h('div', { class: 'sk-top' }, h('span', { class: 'sk-icon' }, sk.icon), h('div', null, h('b', null, sk.name), h('small', null, sk.desc))),
          h('div', { class: 'sk-stars' }, [0, 1, 2].map(i => h('span', { class: i < m ? 'on' : '' }, '★')), st ? h('em', null, `正确率 ${Math.round(st.r / st.n * 100)}%`) : h('em', null, '新关卡')),
          h('div', { class: 'sk-btns' }, btn('▶ 闯关', 'primary sm', () => startGame({ mode: 'practice', skill: sk.id, grade }), { 'data-testid': 'play-' + sk.id }),
            sk.timed ? btn('⏱ 限时', 'warn sm', () => startGame({ mode: 'timed', skill: sk.id, grade }), { 'data-testid': 'timed-' + sk.id }) : null));
      }))));
  };

  function bossSvg(sub, size = 120, hurt = false) {
    const col = { math: ['#6366f1', '#a5b4fc'], chinese: ['#1f2937', '#6b7280'], english: ['#16a34a', '#86efac'] }[sub] || ['#6366f1', '#a5b4fc'];
    return s('svg', { viewBox: '0 0 120 120', width: size, height: size, class: 'boss-svg' + (hurt ? ' hurt' : '') },
      s('ellipse', { cx: 60, cy: 112, rx: 34, ry: 6, fill: 'rgba(0,0,0,.15)' }),
      sub === 'english' ? s('path', { d: 'M22 40 L12 18 L36 32 Z M98 40 L108 18 L84 32 Z', fill: col[0] }) : s('path', { d: 'M30 34 L24 10 L44 28 Z M90 34 L96 10 L76 28 Z', fill: '#fbbf24', stroke: '#b45309', 'stroke-width': 2 }),
      s('path', { d: 'M18 70 Q18 26 60 26 Q102 26 102 70 L102 100 Q92 92 84 100 Q74 92 66 100 Q60 94 54 100 Q46 92 36 100 Q28 92 18 100 Z', fill: col[0] }),
      s('ellipse', { cx: 60, cy: 74, rx: 26, ry: 20, fill: col[1], opacity: 0.5 }),
      s('circle', { cx: 44, cy: 58, r: 11, fill: '#fff' }), s('circle', { cx: 76, cy: 58, r: 11, fill: '#fff' }),
      s('circle', { cx: 46, cy: 60, r: 5, fill: '#111' }), s('circle', { cx: 74, cy: 60, r: 5, fill: '#111' }),
      s('path', { d: 'M34 44 L52 50 M86 44 L68 50', stroke: '#111', 'stroke-width': 4, 'stroke-linecap': 'round' }),
      s('path', { d: 'M44 80 Q60 92 76 80', stroke: '#111', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }),
      s('path', { d: 'M50 83 L53 89 L56 84 M64 84 L67 89 L70 83', fill: '#fff' }),
      sub === 'math' ? s('text', { x: 60, y: 22, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 900, fill: '#fbbf24' }, '+−×÷') : null,
      sub === 'chinese' ? s('text', { x: 60, y: 22, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 900, fill: '#111' }, '墨') : null);
  }

  // ---------- 游戏引擎 ----------
  function buildQueue(cfg, p) {
    if (cfg.mode === 'daily') {
      const list = G.SKILLS.filter(x => x.g === 0 || x.g === p.grade);
      const weight = sk => { const st = p.skills[sk.id]; if (!st || st.n < 3) return 2; return 1 + (1 - st.r / st.n) * 4; };
      const out = [];
      for (let i = 0; i < 10; i++) { const tot = list.reduce((a, x) => a + weight(x), 0); let r = Math.random() * tot; let pick = list[0]; for (const x of list) { r -= weight(x); if (r <= 0) { pick = x; break; } } out.push(pick.id); }
      return out;
    }
    if (cfg.mode === 'boss') { const list = skillsFor(cfg.sub, cfg.grade); return Array.from({ length: 40 }, () => pickOne(list).id); }
    return Array.from({ length: cfg.mode === 'timed' ? 200 : 10 }, () => cfg.skill);
  }
  function startGame(cfg) {
    const p = S.cur();
    const gameGrade = cfg.grade || p.grade;
    const queue = buildQueue(cfg, p);
    const G0 = { cfg, i: 0, right: 0, wrong: 0, combo: 0, maxCombo: 0, starsEarned: 0, hearts: 3, bossHp: 8, bossMax: 8, timeLeft: 60, over: false, timer: null, busy: false };
    let lastKey = '';
    const titleMap = { practice: () => G.byId[cfg.skill].name, timed: () => '⏱ ' + G.byId[cfg.skill].name, boss: () => 'Boss：' + SUBJ[cfg.sub].boss, daily: () => '🎁 每日一练' };
    const head = h('div', { class: 'game-head' });
    const stage = h('div', { class: 'stage' });
    const root = h('div', { class: 'screen game mode-' + cfg.mode }, head, stage);
    mount(root);
    current.cleanup = () => { clearInterval(G0.timer); G0.over = true; try { speechSynthesis.cancel(); } catch (e) { } };

    function drawHead() {
      const quit = h('button', { class: 'icon-btn', 'aria-label': '退出', onclick: () => { SFX.click(); if (G0.i === 0 || confirm('确定要退出吗？这一轮的进度不会保存星星奖励哦。')) back(); } }, '✕');
      let mid;
      if (cfg.mode === 'timed') mid = h('div', { class: 'timer' }, h('div', { class: 'bar t' }, h('i', { style: { width: G0.timeLeft / 60 * 100 + '%' } })), h('b', null, `⏱ ${G0.timeLeft}s　✔ ${G0.right}`));
      else if (cfg.mode === 'boss') mid = h('div', { class: 'boss-head' }, h('div', { class: 'hearts' }, [0, 1, 2].map(k => h('span', { class: k < G0.hearts ? '' : 'lost' }, '❤️'))), h('div', { class: 'bar hp' }, h('i', { style: { width: G0.bossHp / G0.bossMax * 100 + '%' } })), h('small', null, `${SUBJ[cfg.sub].boss} HP ${G0.bossHp}/${G0.bossMax}`));
      else mid = h('div', { class: 'dots' }, queue.map((_, k) => h('i', { class: k < G0.i ? (G0.hist[k] ? 'ok' : 'no') : k === G0.i ? 'now' : '' })));
      head.replaceChildren(quit, h('div', { class: 'gh-mid' }, h('div', { class: 'gh-title' }, titleMap[cfg.mode]()), mid), h('div', { class: 'pill star-pill' }, '⭐ ', h('b', null, '+' + G0.starsEarned)));
    }
    G0.hist = [];
    function back() { current.cleanup(); if (cfg.mode === 'daily') go('home'); else go('subject', { sub: cfg.sub || G.byId[cfg.skill].sub, grade: gameGrade }); }

    if (cfg.mode === 'timed') {
      G0.timer = setInterval(() => { if (G0.over) return; G0.timeLeft--; if (G0.timeLeft <= 5 && G0.timeLeft > 0) SFX.tick(); drawHead(); if (G0.timeLeft <= 0) finish(); }, 1000);
    }

    function nextQuestion() {
      if (G0.over) return;
      if ((cfg.mode === 'practice' || cfg.mode === 'daily') && G0.i >= queue.length) return finish();
      if (cfg.mode === 'boss' && (G0.bossHp <= 0 || G0.hearts <= 0)) return finish();
      let q, tries = 0;
      do { q = G.make(queue[G0.i % queue.length], gameGrade); tries++; } while (S.questionText(q) === lastKey && tries < 5);
      lastKey = S.questionText(q);
      G0.q = q; G0.busy = false; window.__curQ = q; window.__qn = (window.__qn || 0) + 1;
      drawHead();
      const card = renderQuestion(q, onAnswer);
      stage.replaceChildren(...[cfg.mode === 'boss' ? h('div', { class: 'boss-arena' }, h('div', { class: 'boss-wrap' }, bossSvg(cfg.sub, 110)), h('div', { class: 'hero-wrap' }, avatar(p, 64))) : null, card].filter(Boolean));
      if (q.autoSpeak && q.speak) setTimeout(() => !G0.over && G0.q === q && SPEAK.speak(q.speak.text, q.speak.lang), 350);
    }

    function onAnswer(correct, given, opts = {}) {
      if (G0.busy || G0.over) return; G0.busy = true;
      const q = G0.q;
      const ev = S.record(p, q, correct, given);
      G0.hist[G0.i] = correct;
      if (correct) {
        G0.right++; G0.combo++; G0.maxCombo = Math.max(G0.maxCombo, G0.combo); G0.starsEarned++; S.addStars(p, 1);
        SFX.correct();
        if (q.after) setTimeout(() => SPEAK.speak(q.after.text, q.after.lang), 150);
        if (cfg.mode === 'boss') { G0.bossHp--; const b = stage.querySelector('.boss-svg'); if (b) { b.classList.add('hurt'); setTimeout(() => SFX.hit(), 120); } stage.append(h('div', { class: 'zap' }, '💥')); }
        showPraise(G0.combo);
      } else {
        G0.wrong++; G0.combo = 0; SFX.wrong();
        if (cfg.mode === 'boss') { G0.hearts--; root.classList.add('shake'); setTimeout(() => root.classList.remove('shake'), 500); }
      }
      if (ev.includes('goal')) { S.addStars(p, 5); G0.starsEarned += 5; setTimeout(() => { toast('🎯 今日目标完成！+5⭐', 'gold'); confetti(40); SFX.star(); }, 600); }
      S.save(); drawHead();
      const advance = () => { G0.i++; nextQuestion(); };
      if (correct) setTimeout(advance, (opts.delay || 950) * SPEED);
      else if (cfg.mode === 'timed') { showExplain(q, true); setTimeout(advance, 1500 * SPEED); }
      else showExplain(q, false, advance);
    }
    function showPraise(combo) {
      const t = h('div', { class: 'praise' }, pickOne(PRAISE), combo >= 3 ? h('small', null, `连对 ${combo} 题 🔥`) : null, h('span', { class: 'plus' }, '+1⭐'));
      stage.append(t); setTimeout(() => t.remove(), 900);
    }
    function showExplain(q, auto, cb) {
      const ans = Array.isArray(q.answer) ? q.answer.join(q.en ? '' : ' ') : q.answer;
      const ansNode = q.kind === 'sort' || q.kind === 'pair' ? null : h('div', { class: 'ans' }, '正确答案：', q.frac ? fracNode(ans) : q.picLabels ? picNode(q.picLabels[ans]) : h('b', null, ans));
      const box = h('div', { class: 'explain', 'data-testid': 'explain' }, h('div', { class: 'ex-title' }, '😮 再想一想'), ansNode, h('p', null, q.explain),
        q.speak && q.speak.lang === 'en-US' ? btn('🔊 再听一遍', 'ghost sm', () => SPEAK.speak(q.speak.text, q.speak.lang)) : null,
        auto ? null : btn('知道了，继续 ▶', 'primary', () => { box.remove(); cb(); }, { 'data-testid': 'continue' }));
      stage.append(box);
    }
    function finish() {
      if (G0.over) return; G0.over = true; clearInterval(G0.timer);
      const total = G0.right + G0.wrong;
      let bonus = 0, win = null, sticker = null;
      if (cfg.mode === 'practice' || cfg.mode === 'daily') {
        if (G0.right === 10) bonus = 5; else if (G0.right >= 8) bonus = 3;
        if (cfg.mode === 'practice') { const sk = p.skills[cfg.skill] || (p.skills[cfg.skill] = { n: 0, r: 0, best: 0 }); sk.best = Math.max(sk.best || 0, G0.right); }
        if (G0.right >= 6) sticker = giveSticker(p);
      } else if (cfg.mode === 'boss') {
        win = G0.bossHp <= 0;
        if (win) { bonus = 10; p.bossWins++; sticker = giveSticker(p); }
      } else if (cfg.mode === 'timed') {
        const prev = p.bestTimed[cfg.skill] || 0;
        if (G0.right > prev) { p.bestTimed[cfg.skill] = G0.right; if (prev > 0) bonus = 3; }
        if (G0.right >= 10) sticker = giveSticker(p);
      }
      if (bonus) { S.addStars(p, bonus); G0.starsEarned += bonus; }
      const badges = S.checkBadges(p, { session: true, maxCombo: G0.maxCombo, perfect: (cfg.mode === 'practice' || cfg.mode === 'daily') && G0.right === 10, timedScore: cfg.mode === 'timed' ? G0.right : 0 });
      S.save();
      const good = win === true || (win === null && (cfg.mode === 'timed' ? G0.right >= 5 : G0.right >= 6));
      if (good) { SFX.win(); confetti(60); } else SFX.lose();
      const title = cfg.mode === 'boss' ? (win ? '🏆 打败了' + SUBJ[cfg.sub].boss + '！' : '😵 差一点点！再来挑战') : cfg.mode === 'timed' ? `⏱ 时间到！答对 ${G0.right} 题` : G0.right === 10 ? '💯 全部答对！' : G0.right >= 8 ? '🎉 真棒！' : G0.right >= 6 ? '👍 不错哦！' : '💪 继续加油！';
      const starsShown = cfg.mode === 'boss' ? (win ? 3 : 1) : cfg.mode === 'timed' ? (G0.right >= 15 ? 3 : G0.right >= 10 ? 2 : G0.right >= 5 ? 1 : 0) : (G0.right >= 10 ? 3 : G0.right >= 8 ? 2 : G0.right >= 6 ? 1 : 0);
      stage.replaceChildren(h('div', { class: 'result', 'data-testid': 'result' },
        h('h2', null, title),
        h('div', { class: 'big-stars' }, [0, 1, 2].map(k => h('span', { class: k < starsShown ? 'on' : '', style: { animationDelay: k * 0.2 + 's' } }, '★'))),
        h('div', { class: 'res-stats' }, h('div', null, h('b', null, G0.right), h('small', null, '答对')), h('div', null, h('b', null, total ? Math.round(G0.right / total * 100) + '%' : '-'), h('small', null, '正确率')), h('div', null, h('b', null, '+' + G0.starsEarned), h('small', null, '星星')), h('div', null, h('b', null, G0.maxCombo), h('small', null, '最高连对'))),
        cfg.mode === 'timed' ? h('p', { class: 'muted' }, `最好成绩：${p.bestTimed[cfg.skill] || 0} 题`) : null,
        sticker ? h('div', { class: 'reward' }, h('span', { class: 'sticker-big' }, sticker[0]), h('div', null, h('b', null, '获得新贴纸！'), h('small', null, sticker[1]))) : null,
        badges.map(id => { const b = D.badges.find(x => x[0] === id); return h('div', { class: 'reward badge' }, h('span', { class: 'sticker-big' }, b[3]), h('div', null, h('b', null, '解锁成就：' + b[1]), h('small', null, b[2]))); }),
        h('div', { class: 'row' }, btn('🔁 再来一次', 'primary', () => startGame(cfg), { 'data-testid': 'again' }), btn('返回', 'ghost', back))));
      drawHead();
    }
    nextQuestion();
  }
  function giveSticker(p) {
    const left = D.stickers.filter(x => !p.stickers.includes(x[0]));
    if (!left.length) { S.addStars(p, 2); return null; }
    const st = pickOne(left); p.stickers.push(st[0]); return st;
  }

  // ---------- 题目渲染 ----------
  function fracNode(str) {
    if (!/^\d+\/\d+$/.test(str)) return h('span', { class: 'frac-whole' }, str);
    const [n, d] = str.split('/');
    return h('span', { class: 'frac' }, h('span', null, n), h('span', { class: 'fl' }), h('span', null, d));
  }
  function picNode(label) {
    if (!label) return h('span');
    if (label.startsWith('#')) return h('span', { class: 'swatch', style: { background: label } });
    if (label.startsWith('num:')) return h('span', { class: 'numpic' }, label.slice(4));
    return h('span', { class: 'emoji-pic' }, label);
  }
  function visualNode(v) {
    if (!v) return null;
    if (v.type === 'dots') {
      const wrap = h('div', { class: 'dots-vis' });
      for (let r = 0; r < Math.ceil(v.n / 10); r++) { const row = h('div', { class: 'ten-row' }); for (let k = 0; k < 10; k++) { const idx = r * 10 + k; row.append(h('span', { class: idx < v.n ? '' : 'empty' }, idx < v.n ? v.emoji : '')); if (k === 4) row.append(h('b', { class: 'gap' })); } wrap.append(row); }
      return wrap;
    }
    if (v.type === 'clock') return clockSvg(v.h, v.m);
    if (v.type === 'fraction') return fractionSvg(v);
    if (v.type === 'emoji') return h('div', { class: 'vis-emoji' }, v.text);
    if (v.type === 'pic') return h('div', { class: 'vis-pic' }, picNode(v.text));
    if (v.type === 'rows') return h('div', { class: 'rows-vis' }, v.rows.map(([e, n], k) => h('div', { class: 'rv' }, h('small', null, k === 0 ? '第一行' : '第二行'), h('div', null, Array.from({ length: n }, () => h('span', null, e))))));
    return null;
  }
  function clockSvg(hh, mm) {
    const g = s('svg', { viewBox: '0 0 200 200', class: 'clock', width: 190, height: 190 });
    g.append(s('circle', { cx: 100, cy: 100, r: 94, fill: '#fff', stroke: '#f59e0b', 'stroke-width': 8 }));
    for (let k = 0; k < 60; k++) { const a = k * 6 * Math.PI / 180, r1 = k % 5 ? 82 : 76; g.append(s('line', { x1: 100 + Math.sin(a) * r1, y1: 100 - Math.cos(a) * r1, x2: 100 + Math.sin(a) * 86, y2: 100 - Math.cos(a) * 86, stroke: '#374151', 'stroke-width': k % 5 ? 1.5 : 3.5 })); }
    for (let k = 1; k <= 12; k++) { const a = k * 30 * Math.PI / 180; g.append(s('text', { x: 100 + Math.sin(a) * 62, y: 100 - Math.cos(a) * 62 + 7, 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 800, fill: '#1f2937' }, k)); }
    const ha = ((hh % 12) + mm / 60) * 30, ma = mm * 6;
    g.append(s('line', { x1: 100, y1: 100, x2: 100 + Math.sin(ha * Math.PI / 180) * 44, y2: 100 - Math.cos(ha * Math.PI / 180) * 44, stroke: '#ef4444', 'stroke-width': 8, 'stroke-linecap': 'round', class: 'hand-h' }));
    g.append(s('line', { x1: 100, y1: 100, x2: 100 + Math.sin(ma * Math.PI / 180) * 70, y2: 100 - Math.cos(ma * Math.PI / 180) * 70, stroke: '#2563eb', 'stroke-width': 5, 'stroke-linecap': 'round', class: 'hand-m' }));
    g.append(s('circle', { cx: 100, cy: 100, r: 6, fill: '#111' }));
    return h('div', { class: 'clock-wrap' }, g, h('small', { class: 'muted' }, '红色短针是时针，蓝色长针是分针'));
  }
  function fractionSvg({ shape, n, d }) {
    const g = s('svg', { viewBox: '0 0 220 140', class: 'frac-svg', width: 220, height: 140 });
    const on = '#fb923c', off = '#fff7ed', st = '#9a3412';
    if (shape === 'circle') {
      if (d === 1) g.append(s('circle', { cx: 110, cy: 70, r: 62, fill: on, stroke: st, 'stroke-width': 3 }));
      for (let k = 0; k < d; k++) {
        const a0 = k / d * 2 * Math.PI - Math.PI / 2, a1 = (k + 1) / d * 2 * Math.PI - Math.PI / 2;
        const p = `M110 70 L${110 + 62 * Math.cos(a0)} ${70 + 62 * Math.sin(a0)} A62 62 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${110 + 62 * Math.cos(a1)} ${70 + 62 * Math.sin(a1)} Z`;
        g.append(s('path', { d: p, fill: k < n ? on : off, stroke: st, 'stroke-width': 3, 'stroke-linejoin': 'round' }));
      }
    } else if (shape === 'rect') {
      const cols = d % 2 === 0 && d > 4 ? d / 2 : d, rows = cols === d ? 1 : 2, w = 180 / cols, hgt = 110 / rows;
      for (let k = 0; k < d; k++) { const c = k % cols, r = Math.floor(k / cols); g.append(s('rect', { x: 20 + c * w, y: 15 + r * hgt, width: w, height: hgt, fill: k < n ? on : off, stroke: st, 'stroke-width': 3 })); }
    } else {
      const w = 200 / d;
      for (let k = 0; k < d; k++) g.append(s('rect', { x: 10 + k * w, y: 45, width: w, height: 50, rx: 2, fill: k < n ? '#60a5fa' : '#eff6ff', stroke: '#1e3a8a', 'stroke-width': 3 }));
    }
    return h('div', { class: 'frac-wrap' }, g);
  }

  function renderQuestion(q, answer) {
    const card = h('div', { class: 'qcard kind-' + q.kind, 'data-testid': 'qcard', 'data-skill': q.skill, 'data-kind': q.kind });
    const top = h('div', { class: 'q-prompt' }, q.speak ? h('button', { class: 'speak-btn', 'aria-label': '朗读', 'data-testid': 'speak', onclick: () => { SFX.unlock(); SPEAK.speak(q.speak.text, q.speak.lang); } }, '🔊') : null, h('span', null, q.prompt));
    card.append(top);
    if (q.emoji) card.append(h('div', { class: 'deco-emoji' }, q.emoji));
    if (q.visual) card.append(visualNode(q.visual));
    if (q.big) card.append(h('div', { class: 'q-big' }, q.big));
    if (q.bigHanzi) card.append(h('div', { class: 'q-hanzi' }, q.bigHanzi));
    if (q.pinyinBig) card.append(h('div', { class: 'q-pinyin' }, q.pinyinBig));
    if (q.bigFrac) card.append(h('div', { class: 'q-big fr' }, fracNode(q.bigFrac[0]), h('span', { class: 'circ' }, '○'), fracNode(q.bigFrac[1])));
    if (q.bigExpr) card.append(h('div', { class: 'q-big fr' }, q.bigExpr.map(t => /\//.test(t) || /^\d+$/.test(t) ? fracNode(t) : h('span', { class: 'op' }, t)), h('span', { class: 'op' }, '= ?')));
    if (q.poemLines) card.append(h('div', { class: 'poem' }, q.poemLines.map(l => h('div', null, l.split(/(＿+)/).map(seg => /＿/.test(seg) ? h('span', { class: 'blank' }, '　'.repeat(seg.length)) : seg)))));
    if (!SPEAK.canSpeak() && q.speak && q.autoSpeak) card.append(h('p', { class: 'warn-text' }, '此浏览器不支持朗读，请换用 Safari / Chrome 打开'));
    const area = h('div', { class: 'answer-area' }); card.append(area);
    ({ choice: renderChoice, keypad: renderKeypad, numberline: renderLine, drag: renderDrag, sort: renderSort, pair: renderPair })[q.kind](q, area, answer);
    return card;
  }
  function optionLabel(q, o) {
    if (q.picLabels) return picNode(q.picLabels[o]);
    if (q.frac) return fracNode(o);
    if (q.emojiOpts) return h('span', { class: 'emoji-pic' }, o);
    return o;
  }
  function renderChoice(q, area, answer) {
    const cls = 'options' + (q.wide ? ' wide' : '') + (q.long ? ' long' : '') + (q.pinyin ? ' pinyin' : '') + (q.hanzi ? ' hanzi' : '') + (q.en ? ' en' : '') + (q.picLabels || q.emojiOpts ? ' pics' : '') + (q.frac ? ' fracs' : '');
    const box = h('div', { class: cls });
    q.options.forEach(o => box.append(h('button', { class: 'opt', 'data-value': o, onclick: e => {
      if (box.dataset.done) return; box.dataset.done = 1;
      const ok = G.grade(q, o); const b = e.currentTarget;
      b.classList.add(ok ? 'right' : 'wrong');
      if (!ok) box.querySelectorAll('.opt').forEach(x => { if (x.dataset.value === q.answer) x.classList.add('right'); });
      answer(ok, o);
    } }, optionLabel(q, o))));
    area.append(box);
  }
  function renderKeypad(q, area, answer) {
    let val = '';
    const disp = h('div', { class: 'kp-display', 'data-testid': 'kp-display' }, h('span', { class: 'ph' }, '?'));
    const draw = () => disp.replaceChildren(val ? h('span', null, val) : h('span', { class: 'ph' }, '输入答案'));
    const press = k => {
      if (area.dataset.done) return;
      if (k === '⌫') val = val.slice(0, -1);
      else if (k === 'OK') { if (!val) return; area.dataset.done = 1; const ok = G.grade(q, val); disp.classList.add(ok ? 'right' : 'wrong'); document.removeEventListener('keydown', onKey); answer(ok, val); return; }
      else if (val.length < q.maxLen) val += k;
      SFX.click(); draw();
    };
    const onKey = e => { if (!document.body.contains(area)) return document.removeEventListener('keydown', onKey); if (/^\d$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') press('⌫'); else if (e.key === 'Enter') press('OK'); };
    document.addEventListener('keydown', onKey);
    const pad = h('div', { class: 'keypad' }, ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'OK'].map(k => h('button', { class: 'key' + (k === 'OK' ? ' ok' : k === '⌫' ? ' del' : ''), 'data-key': k, onclick: () => press(k) }, k === 'OK' ? '✓ 确定' : k)));
    draw(); area.append(disp, pad);
  }
  function renderLine(q, area, answer) {
    const L = q.line, n = (L.max - L.min) / L.step, W = 1000, pad = 40, y = 110, dx = (W - pad * 2) / n;
    const X = v => pad + (v - L.min) / L.step * dx;
    const svg = s('svg', { viewBox: `0 0 ${W} 190`, class: 'nl-svg' });
    svg.append(s('line', { x1: pad - 20, y1: y, x2: W - pad + 26, y2: y, stroke: '#334155', 'stroke-width': 5, 'stroke-linecap': 'round' }));
    svg.append(s('path', { d: `M${W - pad + 30} ${y} l-16 -10 v20 z`, fill: '#334155' }));
    const frog = s('text', { x: X(L.start != null ? L.start : L.min), y: y - 22, 'text-anchor': 'middle', 'font-size': 44, class: 'frog' + (L.start != null ? '' : ' hidden') }, '🐸');
    for (let k = 0; k <= n; k++) {
      const v = L.min + k * L.step, x = X(v), major = k % L.label === 0;
      svg.append(s('line', { x1: x, y1: y - (major ? 18 : 12), x2: x, y2: y + (major ? 18 : 12), stroke: '#334155', 'stroke-width': major ? 4 : 3 }));
      if (major) svg.append(s('text', { x, y: y + 52, 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 800, fill: '#1e293b' }, v));
      const hit = s('rect', { x: x - dx / 2, y: y - 60, width: dx, height: 130, fill: 'transparent', class: 'nl-hit', 'data-v': v });
      hit.addEventListener('click', () => {
        if (area.dataset.done) return; area.dataset.done = 1;
        const ok = G.grade(q, v);
        frog.classList.remove('hidden'); frog.setAttribute('x', x); frog.classList.add('jump');
        svg.append(s('circle', { cx: x, cy: y, r: 13, fill: ok ? '#22c55e' : '#ef4444' }));
        if (!ok) { svg.append(s('circle', { cx: X(q.answer), cy: y, r: 13, fill: '#22c55e' })); svg.append(s('text', { x: X(q.answer), y: y - 30, 'text-anchor': 'middle', 'font-size': 28, 'font-weight': 900, fill: '#16a34a' }, q.answer)); }
        else svg.append(s('text', { x, y: y - 72, 'text-anchor': 'middle', 'font-size': 28, 'font-weight': 900, fill: '#16a34a' }, v));
        answer(ok, v, { delay: 1200 });
      });
      svg.append(hit);
    }
    svg.append(frog);
    area.append(h('div', { class: 'nl-wrap' }, svg), h('p', { class: 'muted center' }, L.step > 1 ? `每一小格代表 ${L.step}，点一点正确的刻度` : '点一点数轴上的刻度（每一小格是 1）'));
  }

  // 拖放：支持按住拖动，也支持“点一下放进去”
  function makeDraggable(el, onDrop, onTap) {
    let sx, sy, ghost = null, moved = false;
    el.addEventListener('pointerdown', e => {
      if (el.classList.contains('used')) return;
      e.preventDefault(); sx = e.clientX; sy = e.clientY; moved = false;
      el.setPointerCapture && el.setPointerCapture(e.pointerId);
      const move = ev => {
        if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 8) { moved = true; ghost = el.cloneNode(true); ghost.classList.add('ghost'); document.body.append(ghost); el.classList.add('dragging'); }
        if (ghost) { const r = el.getBoundingClientRect(); ghost.style.left = ev.clientX - r.width / 2 + 'px'; ghost.style.top = ev.clientY - r.height / 2 + 'px'; ghost.style.width = r.width + 'px'; }
      };
      const up = ev => {
        el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
        el.classList.remove('dragging');
        if (ghost) { ghost.remove(); ghost = null; const t = document.elementFromPoint(ev.clientX, ev.clientY); onDrop(t && t.closest('[data-drop]')); }
        else if (!moved) onTap();
      };
      el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    });
  }
  function renderDrag(q, area, answer) {
    const slots = [], filled = [];
    const line = h('div', { class: 'drag-line' + (q.en ? ' en' : '') });
    q.parts.forEach(p => { if (typeof p === 'object') { const sl = h('button', { class: 'slot', 'data-drop': 'slot', 'data-i': p.slot, onclick: () => clearSlot(p.slot) }); slots[p.slot] = sl; line.append(sl); } else line.append(h('span', { class: 'part' }, p)); });
    const tray = h('div', { class: 'tray' });
    const tiles = q.tiles.map((t, k) => { const el = h('div', { class: 'tile' + (q.en ? ' en' : ''), 'data-tile': k }, t); tray.append(el); makeDraggable(el, target => { if (target && target.dataset.drop === 'slot') place(k, +target.dataset.i); }, () => { const i = filled.findIndex((f, j) => f == null && slots[j]); const first = slots.findIndex((_, j) => filled[j] == null); if (first >= 0) place(k, first); }); return el; });
    function place(k, i) {
      if (area.dataset.done) return;
      if (filled[i] != null) tiles[filled[i]].classList.remove('used');
      filled[i] = k; tiles[k].classList.add('used'); slots[i].textContent = q.tiles[k]; slots[i].classList.add('filled'); SFX.pop();
      if (slots.every((_, j) => filled[j] != null)) setTimeout(check, 250);
    }
    function clearSlot(i) { if (area.dataset.done || filled[i] == null) return; tiles[filled[i]].classList.remove('used'); filled[i] = null; slots[i].textContent = ''; slots[i].classList.remove('filled'); SFX.click(); }
    function check() {
      if (area.dataset.done) return; area.dataset.done = 1;
      const resp = slots.map((_, j) => q.tiles[filled[j]]); const ok = G.grade(q, resp);
      slots.forEach((sl, j) => sl.classList.add(resp[j] === q.answer[j] ? 'right' : 'wrong'));
      answer(ok, resp.join(q.en ? '' : ' '));
    }
    area.append(line, tray, h('p', { class: 'muted center' }, '按住拖到方框里，或者直接点一下数字；点方框可以取回'));
  }
  function renderSort(q, area, answer) {
    let mistakes = 0, done = 0, sel = null;
    const buckets = q.buckets.map((b, i) => h('div', { class: 'bucket b' + i, 'data-drop': 'bucket', 'data-i': i, onclick: () => { if (sel != null) tryPut(sel, i); } }, h('div', { class: 'roof' }), h('b', null, b), h('div', { class: 'inbox' })));
    const tray = h('div', { class: 'tray' });
    const items = q.items.map((it, k) => { const el = h('div', { class: 'tile pinyin-tile' }, it.text); tray.append(el); makeDraggable(el, t => { if (t && t.dataset.drop === 'bucket') tryPut(k, +t.dataset.i); }, () => { items.forEach(x => x.classList.remove('sel')); sel = k; el.classList.add('sel'); }); return el; });
    function tryPut(k, i) {
      if (items[k].classList.contains('used')) return;
      items.forEach(x => x.classList.remove('sel')); sel = null;
      if (G.checkSort(q, k, i)) { items[k].classList.add('used'); buckets[i].querySelector('.inbox').append(h('span', null, q.items[k].text)); SFX.pop(); done++; if (done === q.items.length) setTimeout(() => answer(mistakes === 0, mistakes ? `错${mistakes}次` : '全对'), 300); }
      else { mistakes++; SFX.wrong(); items[k].classList.add('shake-el'); buckets[i].classList.add('shake-el'); setTimeout(() => { items[k].classList.remove('shake-el'); buckets[i].classList.remove('shake-el'); }, 450); toast('不是这里哦，再试试！'); }
    }
    area.append(h('div', { class: 'buckets' }, buckets), tray, h('p', { class: 'muted center' }, '拖到房子里，或先点拼音再点房子'));
  }
  function renderPair(q, area, answer) {
    let selL = null, selR = null, mistakes = 0, done = 0;
    const colors = ['#fde68a', '#bbf7d0', '#bfdbfe', '#fbcfe8'];
    const L = q.left.map(t => h('button', { class: 'pair-item l' + (q.speakLeft ? ' en' : ''), onclick: () => { if (L_el(t).disabled) return; if (q.speakLeft) SPEAK.speak(t, q.speakLeft); selL = t; mark(); tryMatch(); } }, t));
    const R = q.right.map(t => h('button', { class: 'pair-item r' + (q.rightPic ? ' pic' : ''), onclick: () => { if (R_el(t).disabled) return; selR = t; mark(); tryMatch(); } }, q.rightPic ? picNode(t) : t));
    const L_el = t => L[q.left.indexOf(t)], R_el = t => R[q.right.indexOf(t)];
    function mark() { L.forEach((b, i) => b.classList.toggle('sel', q.left[i] === selL)); R.forEach((b, i) => b.classList.toggle('sel', q.right[i] === selR)); SFX.click(); }
    function tryMatch() {
      if (selL == null || selR == null) return;
      const l = L_el(selL), r = R_el(selR);
      if (G.checkPair(q, selL, selR)) { const c = colors[done % 4]; [l, r].forEach(b => { b.disabled = true; b.classList.add('matched'); b.style.background = c; }); done++; SFX.pop(); if (done === q.left.length) setTimeout(() => answer(mistakes === 0, mistakes ? `错${mistakes}次` : '全对'), 300); }
      else { mistakes++; SFX.wrong(); [l, r].forEach(b => { b.classList.add('shake-el'); setTimeout(() => b.classList.remove('shake-el'), 450); }); }
      selL = selR = null; L.forEach(b => b.classList.remove('sel')); R.forEach(b => b.classList.remove('sel'));
    }
    area.append(h('div', { class: 'pairs' }, h('div', { class: 'col' }, L), h('div', { class: 'col' }, R)), h('p', { class: 'muted center' }, '先点左边，再点右边配对的那个'));
  }

  // ---------- 贴纸册 & 成就 ----------
  routes.album = tab => {
    const p = S.cur(); tab = tab || 'stickers';
    mount(h('div', { class: 'screen album' }, topbar(p, { back: () => go('home'), title: '📒 我的收藏' }),
      h('div', { class: 'chips center' }, btn(`贴纸 ${p.stickers.length}/${D.stickers.length}`, 'chip' + (tab === 'stickers' ? ' on' : ''), () => go('album', 'stickers')), btn(`成就 ${p.badges.length}/${D.badges.length}`, 'chip' + (tab === 'badges' ? ' on' : ''), () => go('album', 'badges'))),
      tab === 'stickers' ? h('div', null, h('p', { class: 'muted center' }, '闯关答对6题以上、限时挑战答对10题、打败Boss，都能抽到新贴纸！'),
        h('div', { class: 'sticker-grid' }, D.stickers.map(([e, n]) => p.stickers.includes(e) ? h('div', { class: 'sticker' }, h('span', null, e), h('small', null, n)) : h('div', { class: 'sticker locked' }, h('span', null, '?'), h('small', null, '未解锁')))))
        : h('div', { class: 'badge-list' }, D.badges.map(([id, n, d, e]) => h('div', { class: 'badge-item' + (p.badges.includes(id) ? '' : ' locked') }, h('span', null, e), h('div', null, h('b', null, n), h('small', null, d)))))));
  };

  // ---------- 装扮屋 ----------
  routes.shop = tab => {
    const p = S.cur(); tab = tab || 'avatar';
    const owned = (kind, id, cost) => cost === 0 || p.owned[kind].includes(id);
    const buy = (kind, id, cost, apply) => {
      if (owned(kind, id, cost)) { apply(); S.save(); SFX.pop(); return go('shop', tab); }
      if (p.stars < cost) { SFX.wrong(); toast(`还差 ${cost - p.stars} 颗星星，去答题赚星星吧！`); return; }
      const m = modal(h('div', null, h('h3', null, `花 ${cost}⭐ 购买？`), h('div', { class: 'row' }, btn('再想想', 'ghost', () => m.close()), btn('买！', 'primary', () => { p.stars -= cost; p.owned[kind].push(id); apply(); S.save(); m.close(); SFX.star(); confetti(30); go('shop', tab); }))));
    };
    let items;
    if (tab === 'avatar') items = D.avatars.map(a => { const c = D.avatarCost[a] || 0; return shopItem(h('span', { class: 'shop-emoji' }, a), c ? c + '⭐' : '免费', owned('avatars', a, c), p.avatar === a, () => buy('avatars', a, c, () => p.avatar = a)); });
    else if (tab === 'acc') items = D.accessories.map(([id, n, c, e]) => shopItem(h('span', { class: 'shop-emoji' }, e || '🚫'), (c ? c + '⭐ ' : '') + n, owned('acc', id, c), p.acc === id, () => buy('acc', id, c, () => p.acc = id)));
    else items = D.bgColors.map(([id, n, c, css]) => shopItem(h('span', { class: 'shop-bg', style: { background: css } }), (c ? c + '⭐ ' : '') + n, owned('bg', id, c), p.bg === id, () => buy('bg', id, c, () => p.bg = id)));
    mount(h('div', { class: 'screen shop' }, topbar(p, { back: () => go('home'), title: '🎨 装扮屋' }),
      h('div', { class: 'shop-preview' }, avatar(p, 140), h('p', null, `我有 ⭐ ${p.stars}`)),
      h('div', { class: 'chips center' }, [['avatar', '小动物'], ['acc', '饰品'], ['bg', '背景']].map(([k, n]) => btn(n, 'chip' + (tab === k ? ' on' : ''), () => go('shop', k)))),
      h('div', { class: 'shop-grid' }, items)));
  };
  const shopItem = (icon, label, own, using, fn) => h('button', { class: 'shop-item' + (using ? ' using' : '') + (own ? ' owned' : ''), onclick: fn }, icon, h('small', null, using ? '使用中' : own ? '已拥有' : label));

  // ---------- 家长中心 ----------
  routes.parent = pid => {
    const st = S.state; const p = st.profiles.find(x => x.id === pid) || st.profiles[0];
    if (!p) return go('profiles');
    const days = []; for (let k = 6; k >= 0; k--) { const d = new Date(); d.setDate(d.getDate() - k); const key = S.dayStr(d); days.push([key, p.days[key] || { n: 0, r: 0 }]); }
    const totalN = Object.values(p.skills).reduce((a, x) => a + x.n, 0), totalR = Object.values(p.skills).reduce((a, x) => a + x.r, 0);
    const bySub = {}; for (const [id, x] of Object.entries(p.skills)) { const sk = G.byId[id]; if (!sk) continue; const b = bySub[sk.sub] || (bySub[sk.sub] = { n: 0, r: 0 }); b.n += x.n; b.r += x.r; }
    const weak = Object.entries(p.skills).filter(([id, x]) => G.byId[id] && x.n >= 5 && x.r / x.n < 0.75).sort((a, b) => a[1].r / a[1].n - b[1].r / b[1].n);
    const maxN = Math.max(10, ...days.map(d => d[1].n));
    const chart = s('svg', { viewBox: '0 0 350 160', class: 'chart' });
    days.forEach(([key, d], k) => { const x = 15 + k * 48, hN = d.n / maxN * 110, hR = d.r / maxN * 110;
      chart.append(s('rect', { x, y: 125 - hN, width: 30, height: hN, rx: 4, fill: '#fecaca' }), s('rect', { x, y: 125 - hR, width: 30, height: hR, rx: 4, fill: '#34d399' }), s('text', { x: x + 15, y: 145, 'text-anchor': 'middle', 'font-size': 11, fill: '#475569' }, key.slice(5)), s('text', { x: x + 15, y: 120 - hN, 'text-anchor': 'middle', 'font-size': 11, fill: '#334155' }, d.n || ''));
    });
    chart.append(s('line', { x1: 10, y1: 125 - p.goal / maxN * 110, x2: 345, y2: 125 - p.goal / maxN * 110, stroke: '#f59e0b', 'stroke-dasharray': '5 4', 'stroke-width': 2 }));
    const pct = (r, n) => n ? Math.round(r / n * 100) + '%' : '—';
    const today = p.days[S.dayStr()] || { n: 0, r: 0 };
    mount(h('div', { class: 'screen parent' },
      h('div', { class: 'topbar' }, h('button', { class: 'icon-btn', onclick: () => go(st.current ? 'home' : 'profiles') }, '‹'), h('div', { class: 'tb-title' }, '👨‍👩‍👧 家长中心')),
      h('div', { class: 'chips center' }, st.profiles.map(x => btn(x.name, 'chip' + (x.id === p.id ? ' on' : ''), () => go('parent', x.id)))),
      h('div', { class: 'panel' }, h('div', { class: 'pc-head' }, avatar(p, 64), h('div', null, h('h3', null, p.name + '　' + GRADE_CN[p.grade]), h('small', { class: 'muted' }, `已解锁 ${p.stickers.length} 张贴纸 · ${p.badges.length} 个成就 · Boss胜利 ${p.bossWins} 次`))),
        h('div', { class: 'kpis' }, kpi('今日', `${today.n}/${p.goal}`), kpi('连续打卡', p.streak + '天'), kpi('累计星星', p.totalStars), kpi('总题数', totalN), kpi('总正确率', pct(totalR, totalN)))),
      h('div', { class: 'panel' }, h('h4', null, '最近7天（红=做题数，绿=答对数，虚线=每日目标）'), chart),
      h('div', { class: 'panel' }, h('h4', null, '各科正确率'), Object.keys(SUBJ).map(k => { const b = bySub[k] || { n: 0, r: 0 }; return h('div', { class: 'subbar' }, h('span', null, SUBJ[k].name), h('div', { class: 'bar' }, h('i', { class: SUBJ[k].color, style: { width: (b.n ? b.r / b.n * 100 : 0) + '%' } })), h('em', null, `${pct(b.r, b.n)}（${b.n}题）`)); })),
      h('div', { class: 'panel' }, h('h4', null, '⚠️ 需要加强（做过5题以上、正确率低于75%）'), weak.length ? h('ul', { class: 'weak' }, weak.map(([id, x]) => h('li', null, h('b', null, G.byId[id].name), `　${SUBJ[G.byId[id].sub].name} · 正确率 ${pct(x.r, x.n)}（${x.n}题）`))) : h('p', { class: 'muted' }, '暂时没有明显的薄弱环节，继续保持！'),
        h('h4', null, '各关卡明细'), h('table', { class: 'tbl' }, h('tr', null, h('th', null, '关卡'), h('th', null, '题数'), h('th', null, '正确率'), h('th', null, '闯关最好')), Object.entries(p.skills).filter(([id]) => G.byId[id]).map(([id, x]) => h('tr', null, h('td', null, G.byId[id].icon + ' ' + G.byId[id].name), h('td', null, x.n), h('td', null, pct(x.r, x.n)), h('td', null, (x.best || 0) + '/10'))))),
      h('div', { class: 'panel' }, h('h4', null, '📝 最近错题'), p.wrongLog.length ? h('ul', { class: 'wrong-log' }, p.wrongLog.slice(0, 12).map(w => h('li', null, h('small', null, (G.byId[w.skill] || {}).name || ''), h('div', null, w.text), h('div', { class: 'wl-ans' }, '孩子答：', h('b', { class: 'bad' }, w.given || '—'), '　正确：', h('b', { class: 'good' }, w.ans))))) : h('p', { class: 'muted' }, '还没有错题记录。')),
      h('div', { class: 'panel' }, h('h4', null, '⚙️ 设置'),
        h('p', null, '每日目标（题数）'), h('div', { class: 'chips' }, [10, 15, 20, 30, 40, 50].map(n => btn(n + '题', 'chip' + (p.goal === n ? ' on' : ''), () => { p.goal = n; S.save(); go('parent', p.id); }, { 'data-testid': 'goal-' + n }))),
        h('p', null, '声音'), h('div', { class: 'chips' }, btn('音效 ' + (st.settings.sound ? '开' : '关'), 'chip' + (st.settings.sound ? ' on' : ''), () => { st.settings.sound = !st.settings.sound; S.save(); go('parent', p.id); }), btn('朗读 ' + (st.settings.voice ? '开' : '关'), 'chip' + (st.settings.voice ? ' on' : ''), () => { st.settings.voice = !st.settings.voice; S.save(); go('parent', p.id); })),
        h('p', { class: 'muted' }, SPEAK.canSpeak() ? `朗读：中文语音${SPEAK.hasLang('zh') ? '可用' : '未检测到'}，英文语音${SPEAK.hasLang('en') ? '可用' : '未检测到'}。` : '当前浏览器不支持朗读，听音题可点 🔊 无效，建议用 Safari 或 Chrome。'),
        h('div', { class: 'row wrap' }, btn('✏️ 改名字/年级', 'ghost sm', () => addProfileDialog(p)), btn('🧹 清空学习记录', 'ghost sm', () => { if (confirm(`确定清空 ${p.name} 的所有学习记录和星星吗？`)) { const n = S.newProfile(p.name, p.grade, p.avatar, p.bg); n.id = p.id; Object.assign(p, n); S.save(); go('parent', p.id); } }), st.profiles.length > 1 ? btn('🗑️ 删除这个小朋友', 'danger sm', () => { if (confirm(`确定删除 ${p.name} 吗？无法恢复。`)) { st.profiles = st.profiles.filter(x => x.id !== p.id); if (st.current === p.id) st.current = null; S.save(); go('parent'); } }) : null)),
      h('p', { class: 'privacy center' }, '本网站无广告、无第三方统计，所有记录只保存在这台设备的浏览器里。')));
  };
  const kpi = (n, v) => h('div', { class: 'kpi' }, h('b', null, v), h('small', null, n));

  // ---------- 启动 ----------
  document.addEventListener('pointerdown', () => SFX.unlock(), { once: true });
  if (S.state.current && S.cur()) go('home'); else go('profiles');
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => { });
})();
