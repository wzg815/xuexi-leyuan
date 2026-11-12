/* 本地存档：所有数据只保存在本设备 localStorage */
(function (root) {
  const KEY = 'xxly_v1';
  const pad = n => String(n).padStart(2, '0');
  const dayStr = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dayStr(d); };
  let uid = () => 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  function newProfile(name, grade, avatar, bg) {
    return { id: uid(), name, grade, avatar: avatar || '🐯', acc: 'none', bg: bg || 'sky',
      owned: { avatars: [], acc: ['none'], bg: [] }, stars: 0, totalStars: 0, streak: 0, lastDay: '',
      goal: grade >= 3 ? 20 : 15, days: {}, skills: {}, stickers: [], badges: [], bossWins: 0,
      subRight: { math: 0, chinese: 0, english: 0 }, bestTimed: {}, wrongLog: [], created: Date.now() };
  }
  function defaults() {
    const a = newProfile('嘉宸', 3, '🐯', 'sky'); const b = newProfile('歆玥', 1, '🐰', 'peach');
    return { v: 1, profiles: [a, b], current: null, settings: { sound: true, voice: true } };
  }
  let state;
  function load() {
    try { state = JSON.parse(localStorage.getItem(KEY)); } catch (e) { state = null; }
    if (!state || !Array.isArray(state.profiles)) state = defaults();
    state.settings = Object.assign({ sound: true, voice: true }, state.settings || {});
    return state;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* 存储已满或隐私模式 */ } }
  const cur = () => state.profiles.find(p => p.id === state.current) || null;

  function touchDay(p) {
    const t = dayStr();
    if (p.lastDay !== t) { p.streak = p.lastDay === yesterday() ? p.streak + 1 : 1; p.lastDay = t; }
    return p.days[t] || (p.days[t] = { n: 0, r: 0, goalHit: false });
  }
  // 记录一次作答，返回事件列表
  function record(p, q, correct, given) {
    const ev = [];
    const d = touchDay(p);
    d.n++; if (correct) d.r++;
    const s = p.skills[q.skill] || (p.skills[q.skill] = { n: 0, r: 0, best: 0 });
    s.n++; if (correct) { s.r++; p.subRight[q.sub] = (p.subRight[q.sub] || 0) + 1; }
    if (!correct) {
      p.wrongLog.unshift({ skill: q.skill, text: questionText(q), ans: answerText(q), given: given == null ? '' : String(given), t: Date.now() });
      p.wrongLog.length = Math.min(p.wrongLog.length, 30);
    }
    if (!d.goalHit && d.n >= p.goal) { d.goalHit = true; ev.push('goal'); }
    return ev;
  }
  function questionText(q) {
    let t = q.prompt;
    if (q.big) t += ' ' + q.big; if (q.bigHanzi) t += ' ' + q.bigHanzi; if (q.pinyinBig) t += ' ' + q.pinyinBig;
    if (q.bigExpr) t += ' ' + q.bigExpr.join(' '); if (q.bigFrac) t += ' ' + q.bigFrac.join(' ○ ');
    if (q.poemLines) t += ' ' + q.poemLines.join('，');
    if (q.visual && q.visual.type === 'clock') t += ` [钟面 ${q.visual.h}:${String(q.visual.m).padStart(2, '0')}]`;
    if (q.visual && q.visual.type === 'fraction') t += ` [图形 ${q.visual.n}/${q.visual.d}]`;
    if (q.speak) t += ` [听：${q.speak.text}]`;
    return t;
  }
  function answerText(q) {
    if (Array.isArray(q.answer)) return q.answer.join(' ');
    if (q.kind === 'sort' || q.kind === 'pair') return q.explain;
    return String(q.answer);
  }
  function addStars(p, n) { p.stars += n; p.totalStars += n; }
  function checkBadges(p, ctx = {}) {
    const has = id => p.badges.includes(id), got = [];
    const give = id => { if (!has(id)) { p.badges.push(id); got.push(id); } };
    if (ctx.session) give('first');
    if (ctx.maxCombo >= 10) give('combo10');
    if (ctx.perfect) give('perfect');
    if (p.streak >= 3) give('streak3'); if (p.streak >= 7) give('streak7');
    if (p.totalStars >= 100) give('stars100'); if (p.totalStars >= 500) give('stars500');
    if (p.bossWins >= 1) give('boss1'); if (p.bossWins >= 10) give('boss10');
    if (p.subRight.math >= 100) give('math100'); if (p.subRight.chinese >= 100) give('chinese100'); if (p.subRight.english >= 100) give('english100');
    if (ctx.timedScore >= 15) give('flash15');
    if (Object.values(p.days).some(d => d.goalHit)) give('goal1');
    if (p.stickers.length >= 20) give('sticker20');
    return got;
  }
  root.STORE = { load, save, cur, newProfile, record, addStars, checkBadges, dayStr, get state() { return state; }, questionText };
})(self);
