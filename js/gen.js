/* 题目生成器：纯函数，可在浏览器与 Node 中运行 */
(function (root) {
  const D = (typeof module !== 'undefined' && module.exports) ? require('./data.js') : root.DATA;

  // ---------- 工具 ----------
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sample = (arr, n) => shuffle(arr).slice(0, n);
  const chance = p => Math.random() < p;
  // 生成包含答案的不重复选项
  function opts(answer, candidates, n = 4, isBad) {
    const ans = String(answer); const set = [ans];
    for (const c of shuffle(candidates.map(String))) {
      if (set.length >= n) break;
      if (set.includes(c)) continue;
      if (isBad && isBad(c)) continue;
      set.push(c);
    }
    return shuffle(set);
  }
  function numOpts(ans, spread, lo, hi, n = 4) {
    const c = [];
    for (let d = -spread; d <= spread; d++) if (d !== 0) { const v = ans + d; if (v >= lo && v <= hi) c.push(v); }
    return opts(ans, c, n);
  }
  const CN = ['零','一','二','三','四','五','六','七','八','九','十'];
  const gcd = (a, b) => b ? gcd(b, a % b) : a;

  // ---------- 拼音标调 ----------
  const TONE = { a:'āáǎà', o:'ōóǒò', e:'ēéěè', i:'īíǐì', u:'ūúǔù', 'ü':'ǖǘǚǜ' };
  function addTone(base, tone) {
    if (!tone || tone < 1 || tone > 4) return base;
    let idx = -1;
    if (base.includes('a')) idx = base.indexOf('a');
    else if (base.includes('o')) idx = base.indexOf('o');
    else if (base.includes('e')) idx = base.indexOf('e');
    else if (base.includes('iu')) idx = base.indexOf('iu') + 1;
    else if (base.includes('ui')) idx = base.indexOf('ui') + 1;
    else { for (let k = base.length - 1; k >= 0; k--) if ('iuü'.includes(base[k])) { idx = k; break; } }
    if (idx < 0) return base;
    const v = base[idx];
    return base.slice(0, idx) + TONE[v][tone - 1] + base.slice(idx + 1);
  }
  function stripTone(s) {
    let tone = 0, out = '';
    for (const ch of s) {
      let found = false;
      for (const v in TONE) { const k = TONE[v].indexOf(ch); if (k >= 0) { out += v; tone = k + 1; found = true; break; } }
      if (!found) out += ch;
    }
    return { base: out, tone };
  }

  // ---------- 数学 · 一年级 ----------
  const EMOJIS = ['🍎','🍓','⭐','🐟','🌸','🍬','🐥','⚽','🎈','🍩'];
  function g1_count() {
    const v = ri(0, 9);
    if (v < 5) {
      const n = ri(1, 20), e = pick(EMOJIS);
      return { kind:'choice', prompt:'数一数，一共有几个？', visual:{ type:'dots', n, emoji:e }, options:numOpts(n, 3, 1, 20), answer:String(n), meta:{ t:'count', n }, explain:`一共有 ${n} 个。数的时候可以10个10个地数。` };
    }
    if (v < 7) {
      const n = ri(11, 19);
      return { kind:'choice', prompt:`${n} 里面有 1 个十和几个一？`, options:numOpts(n - 10, 3, 0, 9), answer:String(n - 10), meta:{ t:'ones', n }, explain:`${n} = 10 + ${n - 10}，所以有 ${n - 10} 个一。` };
    }
    if (v < 8) {
      const k = ri(0, 9), n = 10 + k;
      return { kind:'choice', prompt:`1 个十和 ${k} 个一组成的数是几？`, options:numOpts(n, 3, 1, 20), answer:String(n), meta:{ t:'compose', n }, explain:`10 + ${k} = ${n}` };
    }
    const more = chance(0.5), n = more ? ri(1, 19) : ri(1, 20), ans = more ? n + 1 : n - 1;
    return { kind:'choice', prompt:`比 ${n} ${more ? '多' : '少'} 1 的数是几？`, options:numOpts(ans, 3, 0, 20), answer:String(ans), meta:{ t:'neighbor', n, more }, explain:`${n} ${more ? '+' : '-'} 1 = ${ans}` };
  }
  function cmpSym(a, b) { return a > b ? '>' : a < b ? '<' : '='; }
  function g1_compare() {
    let left, right, L, R;
    if (chance(0.6)) { L = ri(0, 20); R = chance(0.2) ? L : ri(0, 20); left = String(L); right = String(R); }
    else { const x = ri(1, 12), y = ri(0, Math.min(9, 20 - x)); L = x + y; R = chance(0.25) ? L : Math.max(0, Math.min(20, L + ri(-3, 3))); left = `${x} + ${y}`; right = String(R);
      if (chance(0.5)) { [left, right] = [right, left]; [L, R] = [R, L]; } }
    const ans = cmpSym(L, R);
    return { kind:'choice', prompt:'在 ○ 里填上 >、< 或 =', big:`${left} ○ ${right}`, options:['>','<','='], answer:ans, meta:{ t:'cmp', L, R }, explain:`${left} ${ans} ${right}`, wide:true };
  }
  function g1_add() {
    const v = ri(0, 9); let a, b;
    if (v < 2) { a = ri(0, 10); b = ri(0, 10 - a); }
    else if (v < 7) { a = ri(2, 9); b = ri(11 - a, 9); }          // 进位加法
    else { a = ri(10, 18); b = ri(0, 20 - a); if (a > 10 && (a % 10) + b > 9) b = 9 - (a % 10); } // 十几加几
    if (chance(0.5)) [a, b] = [b, a];
    const s = a + b;
    if (chance(0.2)) return { kind:'keypad', prompt:'括号里填几？', big:`${a} + ( ) = ${s}`, answer:String(b), maxLen:2, meta:{ t:'addMissing', a, s }, explain:`${s} - ${a} = ${b}` };
    let ex = `${a} + ${b} = ${s}`;
    if (a >= 2 && a <= 9 && b >= 2 && b <= 9 && s > 10) { const big = Math.max(a, b), small = Math.min(a, b); ex += `。凑十法：${big} + ${10 - big} = 10，再加 ${small - (10 - big)} 得 ${s}`; }
    return { kind:'keypad', prompt:'算一算', big:`${a} + ${b} = ?`, answer:String(s), maxLen:2, meta:{ t:'add', a, b }, explain:ex };
  }
  function g1_sub() {
    const v = ri(0, 9); let a, b;
    if (v < 2) { a = ri(1, 10); b = ri(0, a); }
    else if (v < 7) { a = ri(11, 18); b = ri((a % 10) + 1, 9); }    // 退位减法
    else if (v < 9) { a = ri(11, 19); b = ri(0, a % 10); }          // 十几减几不退位
    else { a = 20; b = pick([10, ri(1, 9)]); }
    const d = a - b;
    if (chance(0.2)) return { kind:'keypad', prompt:'括号里填几？', big:`( ) - ${b} = ${d}`, answer:String(a), maxLen:2, meta:{ t:'subMissing', b, d }, explain:`${d} + ${b} = ${a}` };
    let ex = `${a} - ${b} = ${d}`;
    if (a > 10 && a < 20 && b > a % 10) ex += `。破十法：10 - ${b} = ${10 - b}，${10 - b} + ${a % 10} = ${d}`;
    return { kind:'keypad', prompt:'算一算', big:`${a} - ${b} = ?`, answer:String(d), maxLen:2, meta:{ t:'sub', a, b }, explain:ex };
  }
  function g1_make10() {
    if (chance(0.5)) {
      const a = ri(1, 9), ans = 10 - a;
      const tiles = opts(ans, [1,2,3,4,5,6,7,8,9]);
      return { kind:'drag', prompt:`把数字拖进方框，和 ${a} 凑成 10`, parts:[String(a), ' + ', { slot:0 }, ' = 10'], tiles, answer:[String(ans)], meta:{ t:'make10', a }, explain:`${a} + ${ans} = 10` };
    }
    const a = ri(7, 9), b = ri(11 - a, 9), ans = a + b - 10;
    const tiles = opts(ans, [1,2,3,4,5,6,7,8]);
    return { kind:'drag', prompt:'用凑十法：拖一拖，填上合适的数', parts:[`${a} + ${b} = 10 + `, { slot:0 }], tiles, answer:[String(ans)], meta:{ t:'make10b', a, b }, explain:`${a} 和 ${10 - a} 凑成 10，${b} 拆成 ${10 - a} 和 ${ans}，所以 ${a} + ${b} = 10 + ${ans} = ${a + b}` };
  }
  function g1_line() {
    const v = ri(0, 2);
    if (v === 0) { const n = ri(0, 20); return { kind:'numberline', prompt:`在数轴上找到 ${n}，点一点它`, line:{ min:0, max:20, step:1, label:5 }, answer:n, meta:{ t:'find', n }, explain:`${n} 在这里哦` }; }
    if (v === 1) { const a = ri(0, 15), b = ri(1, 20 - a); return { kind:'numberline', prompt:`小青蛙从 ${a} 出发，向右跳 ${b} 格，跳到几？`, line:{ min:0, max:20, step:1, label:5, start:a }, answer:a + b, meta:{ t:'right', a, b }, explain:`${a} + ${b} = ${a + b}` }; }
    const a = ri(3, 20), b = ri(1, a); return { kind:'numberline', prompt:`小青蛙从 ${a} 出发，向左跳 ${b} 格，跳到几？`, line:{ min:0, max:20, step:1, label:5, start:a }, answer:a - b, meta:{ t:'left', a, b }, explain:`${a} - ${b} = ${a - b}` };
  }
  function g1_order() {
    const nums = sample([...Array(21).keys()], 4), asc = chance(0.6);
    const sorted = nums.slice().sort((x, y) => asc ? x - y : y - x).map(String);
    return { kind:'drag', prompt:asc ? '从小到大排一排（拖动数字）' : '从大到小排一排（拖动数字）', parts:[{ slot:0 }, asc ? ' < ' : ' > ', { slot:1 }, asc ? ' < ' : ' > ', { slot:2 }, asc ? ' < ' : ' > ', { slot:3 }], tiles:shuffle(nums.map(String)), answer:sorted, meta:{ t:'order', nums, asc }, explain:sorted.join(asc ? ' < ' : ' > ') };
  }

  // ---------- 数学 · 三年级上 ----------
  function g3_addsub() {
    const v = ri(0, 9); let a, b, op;
    if (v < 2) { op = chance(0.5) ? '+' : '-'; a = ri(10, 99); b = ri(10, 99); if (op === '-' && b > a) [a, b] = [b, a]; if (op === '-' && a === b) a++; }
    else if (v < 4) { op = '+'; a = ri(100, 999); b = ri(100, 999); }
    else if (v < 6) { op = '-'; a = ri(200, 999); b = ri(100, a - 1); }
    else if (v < 7) { op = '-'; a = pick([300, 400, 500, 600, 700, 800, 900, 1000, ri(1, 9) * 100 + ri(1, 9)]); b = ri(101, a - 1); }
    else if (v < 8) { op = chance(0.5) ? '+' : '-'; a = ri(1, 9) * 100 + ri(1, 9) * 10; b = ri(1, 9) * 100 + ri(1, 9) * 10; if (op === '-' && b > a) [a, b] = [b, a]; if (op === '-' && a === b) { a += 100; } }
    else { op = chance(0.5) ? '+' : '-'; if (op === '+') { a = ri(1000, 8999); b = ri(100, 999); } else { a = ri(1000, 9999); b = ri(100, 999); } }
    const r = op === '+' ? a + b : a - b;
    return { kind:'keypad', prompt:op === '+' ? '算一算（加法）' : '算一算（减法）', big:`${a} ${op} ${b} = ?`, answer:String(r), maxLen:5, meta:{ t:'as', a, b, op }, explain:`${a} ${op} ${b} = ${r}。${op === '+' ? '相同数位对齐，满十进一。' : '相同数位对齐，不够减向前一位借1当10。'}` };
  }
  function g3_mul() {
    const v = ri(0, 9); let a; const b = ri(2, 9);
    if (v < 2) a = chance(0.5) ? ri(1, 9) * 10 : ri(1, 9) * 100;
    else if (v < 4) a = ri(11, 99);
    else if (v < 7) a = ri(100, 999);
    else if (v < 8) a = ri(1, 9) * 100 + ri(1, 9);
    else a = ri(11, 99) * 10;
    const r = a * b;
    let ex = `${a} × ${b} = ${r}。`;
    if (a % 10 === 0) { const z = String(a).match(/0+$/)[0].length; ex += `先算 ${a / Math.pow(10, z)} × ${b} = ${a / Math.pow(10, z) * b}，再在末尾添上 ${z} 个 0。`; }
    else ex += '从个位乘起，用一位数依次去乘每一位，满几十就向前一位进几。';
    return { kind:'keypad', prompt:'算一算（乘法）', big:`${a} × ${b} = ?`, answer:String(r), maxLen:5, meta:{ t:'mul', a, b }, explain:ex };
  }
  const timeStr = (h, m) => m === 0 ? `${h}时` : `${h}时${m}分`;
  const TIME_UNIT_ITEMS = [['眨一下眼睛大约需要1__','秒'],['小学一节课是40__','分'],['跳绳30下大约需要15__','秒'],['晚上睡觉大约10__','时'],
    ['做一次眼保健操大约5__','分'],['跑50米大约需要10__','秒'],['看一场电影大约2__','时'],['刷一次牙大约3__','分']];
  function g3_time() {
    const v = ri(0, 9);
    if (v < 4) {
      const h = ri(1, 12), m = chance(0.7) ? ri(0, 11) * 5 : ri(1, 59);
      const ans = timeStr(h, m), cand = [];
      const hn = h % 12 + 1, hp = (h + 10) % 12 + 1;
      cand.push(timeStr(hn, m), timeStr(hp, m));
      if (m % 5 === 0 && m > 0 && m / 5 !== h) cand.push(timeStr(m / 5, h * 5 % 60));
      cand.push(timeStr(h, (m + 5) % 60), timeStr(h, (m + 55) % 60));
      return { kind:'choice', prompt:'钟面上是几时几分？', visual:{ type:'clock', h, m }, options:opts(ans, cand), answer:ans, meta:{ t:'clock', h, m }, explain:`时针过了 ${h}，分针指向 ${m === 0 ? '12' : m + ' 分'}，是 ${ans}。` };
    }
    if (v < 7) {
      const t = ri(0, 4); let big, ans, ex, a, b;
      if (t === 0) { a = ri(2, 9); big = `${a}分 = (  )秒`; ans = a * 60; ex = `1分 = 60秒，${a}分 = ${a} × 60 = ${ans}秒`; }
      else if (t === 1) { a = ri(2, 9); big = `${a * 60}秒 = (  )分`; ans = a; ex = `60秒 = 1分，${a * 60}秒 = ${a}分`; }
      else if (t === 2) { a = ri(5, 55); big = `1时${a}分 = (  )分`; ans = 60 + a; ex = `1时 = 60分，60 + ${a} = ${ans}分`; }
      else if (t === 3) { a = ri(1, 3); b = ri(5, 55); big = `${a}分${b}秒 = (  )秒`; ans = a * 60 + b; ex = `${a}分 = ${a * 60}秒，${a * 60} + ${b} = ${ans}秒`; }
      else { a = ri(2, 5); big = `${a}时 = (  )分`; ans = a * 60; ex = `1时 = 60分，${a}时 = ${ans}分`; }
      return { kind:'keypad', prompt:'时间单位换算', big, answer:String(ans), maxLen:3, meta:{ t:'tconv', k:t, a, b }, explain:ex };
    }
    if (v < 9) {
      const h = ri(7, 16), m = ri(0, 11) * 5, d = ri(2, 11) * 5;
      const end = h * 60 + m + d, h2 = Math.floor(end / 60), m2 = end % 60;
      return { kind:'keypad', prompt:`从 ${timeStr(h, m)} 到 ${timeStr(h2, m2)}，经过了多少分？`, answer:String(d), maxLen:3, meta:{ t:'elapsed', h, m, h2, m2 }, explain:`${timeStr(h2, m2)} - ${timeStr(h, m)} = ${d}分` };
    }
    const it = pick(TIME_UNIT_ITEMS);
    return { kind:'choice', prompt:'填上合适的时间单位', big:it[0].replace('__', '（  ）'), options:['时','分','秒'], answer:it[1], wide:true, meta:{ t:'tunit' }, explain:it[0].replace('__', it[1]) };
  }
  function g3_measure() {
    const v = ri(0, 9);
    if (v < 3) {
      const it = pick(D.unitItems);
      return { kind:'choice', prompt:'填上合适的单位', big:it[0].replace('__', '（  ）'), options:opts(it[1], D.unitGroups[it[2]], 4), answer:it[1], wide:true, meta:{ t:'unit' }, explain:it[0].replace('__', it[1]) };
    }
    const [B, S, r] = pick(D.unitRates); const t = ri(0, 3); let big, ans, ex;
    if (t === 0) { const a = ri(2, 9); big = `${a}${B} = (  )${S}`; ans = a * r; ex = `1${B} = ${r}${S}，${a}${B} = ${ans}${S}`; }
    else if (t === 1) { const a = ri(2, 9); big = `${a * r}${S} = (  )${B}`; ans = a; ex = `${r}${S} = 1${B}，所以是 ${a}${B}`; }
    else if (t === 2) { const a = ri(1, 9), b = r === 10 ? ri(1, 9) : r === 100 ? ri(1, 99) : ri(1, 9) * 100; big = `${a}${B}${b}${S} = (  )${S}`; ans = a * r + b; ex = `${a}${B} = ${a * r}${S}，${a * r} + ${b} = ${ans}${S}`; }
    else { const b = r === 10 ? ri(1, 9) : r === 100 ? ri(1, 9) * 10 : ri(1, 9) * 100; big = `1${B} - ${b}${S} = (  )${S}`; ans = r - b; ex = `1${B} = ${r}${S}，${r} - ${b} = ${ans}${S}`; }
    return { kind:'keypad', prompt:'单位换算', big, answer:String(ans), maxLen:5, meta:{ t:'conv', B, S, r }, explain:ex };
  }
  const fstr = (n, d) => `${n}/${d}`;
  const fval = s => { if (!s.includes('/')) return Number(s); const [n, d] = s.split('/').map(Number); return n / d; };
  function fracOpts(ans, cands) {
    const av = fval(ans);
    return opts(ans, cands, 4, c => Math.abs(fval(c) - av) < 1e-9 || fval(c) <= 0);
  }
  function g3_fraction() {
    const v = ri(0, 9);
    if (v < 3) {
      const d = ri(2, 8), n = ri(1, d - 1), shape = pick(['circle', 'rect', 'bar']);
      const ans = fstr(n, d), c = [fstr(d - n, d), fstr(n, d + 1), fstr(d, n + d), fstr(n, Math.max(2, d - 1)), fstr(n + 1, d), fstr(Math.max(1, n - 1), d), fstr(d - n, d + 1)].filter(s => { const [a, b] = s.split('/').map(Number); return a < b; });
      return { kind:'choice', prompt:'涂色部分占整个图形的几分之几？', visual:{ type:'fraction', shape, n, d }, options:fracOpts(ans, c), answer:ans, frac:true, meta:{ t:'shade', n, d }, explain:`平均分成 ${d} 份，涂色 ${n} 份，就是 ${CN[d]}分之${CN[n]}（${n}/${d}）。` };
    }
    if (v < 4) {
      const d = ri(2, 10), n = ri(1, d - 1), ans = fstr(n, d);
      return { kind:'choice', prompt:`“${CN[d]}分之${CN[n]}”写作？`, options:fracOpts(ans, [fstr(d, n), fstr(n, d + 1), fstr(Math.max(1, n - 1), d), fstr(n + 1, d + 2), fstr(n, d + 3)]), answer:ans, frac:true, meta:{ t:'read', n, d }, explain:`分母是 ${d}，分子是 ${n}，写作 ${n}/${d}。` };
    }
    if (v < 6) {
      let a, b, c, d;
      if (chance(0.5)) { d = ri(3, 10); a = ri(1, d - 1); c = ri(1, d - 1); b = d; }
      else { a = c = ri(1, 3); b = ri(a + 1, 10); d = ri(a + 1, 10); }
      const ans = cmpSym(a / b, c / d);
      return { kind:'choice', prompt:'比一比，在 ○ 里填 >、< 或 =', bigFrac:[fstr(a, b), fstr(c, d)], options:['>','<','='], answer:ans, wide:true, meta:{ t:'fcmp', a, b, c, d }, explain:b === d ? '分母相同，分子大的分数大。' : '分子相同，分母越大，每份越小，分数就越小。' };
    }
    if (v < 8) {
      const d = ri(3, 10), a = ri(1, d - 1), b = ri(1, d - a), s = a + b, ans = s === d ? '1' : fstr(s, d);
      const c = [fstr(s, d + d), fstr(Math.max(1, s - 1), d), fstr(s + 1 <= d ? s + 1 : 1, d), fstr(a * b <= 20 ? a * b : 1, d), fstr(s, d + 1)].filter(x => fval(x) <= 1);
      return { kind:'choice', prompt:'同分母分数加法', bigExpr:[fstr(a, d), '+', fstr(b, d)], options:fracOpts(ans, c.concat(s === d ? [fstr(d - 1, d)] : ['1'])), answer:ans, frac:true, meta:{ t:'fadd', a, b, d }, explain:`分母不变，分子相加：${a} + ${b} = ${s}，结果是 ${ans === '1' ? `${d}/${d}，也就是 1` : ans}。` };
    }
    const d = ri(3, 10); let a, b, ans, ex, expr;
    if (chance(0.5)) { a = ri(2, d - 1); b = ri(1, a - 1); ans = fstr(a - b, d); expr = [fstr(a, d), '-', fstr(b, d)]; ex = `分母不变，分子相减：${a} - ${b} = ${a - b}`; }
    else { a = d; b = ri(1, d - 1); ans = fstr(d - b, d); expr = ['1', '-', fstr(b, d)]; ex = `把 1 看成 ${d}/${d}，${d} - ${b} = ${d - b}`; }
    const c = [fstr(a - b, d + d), fstr(a - b + 1, d), fstr(Math.max(1, a - b - 1), d), fstr(b, d), fstr(a - b, Math.max(2, d - 1))].filter(x => fval(x) < 1);
    return { kind:'choice', prompt:'同分母分数减法', bigExpr:expr, options:fracOpts(ans, c), answer:ans, frac:true, meta:{ t:'fsub', a, b, d }, explain:`${ex}，结果是 ${ans}。` };
  }
  const ANIMALS = [['小兔','🥕','个','萝卜'],['小猴','🍑','个','桃子'],['小松鼠','🌰','颗','松果'],['小熊','🍯','罐','蜂蜜'],['小猫','🐟','条','鱼']];
  function g3_times() {
    const v = ri(0, 9);
    if (v < 3) {
      const a = ri(2, 4), k = ri(2, 5), e1 = pick(['🔴','🟦','⭐']), e2 = pick(['🍎','🌼','🐟']);
      return { kind:'choice', prompt:'第二行的个数是第一行的几倍？', visual:{ type:'rows', rows:[[e1, a], [e2, a * k]] }, options:numOpts(k, 2, 1, 9), answer:String(k), meta:{ t:'rows', a, b:a * k }, explain:`把 ${a} 个看成 1 份，${a * k} 里面有 ${k} 个 ${a}，就是 ${k} 倍。${a * k} ÷ ${a} = ${k}` };
    }
    const a = ri(2, 9), k = ri(2, 9), [A, E, M, N] = pick(ANIMALS), B = pick(ANIMALS.filter(x => x[0] !== A))[0];
    if (v < 6) return { kind:'keypad', prompt:`${A}有 ${a} ${M}${N}，${B}的${N}是${A}的 ${k} 倍。${B}有多少${M}${N}？`, emoji:E, answer:String(a * k), maxLen:3, meta:{ t:'multiple', a, k }, explain:`求 ${a} 的 ${k} 倍是多少，用乘法：${a} × ${k} = ${a * k}` };
    if (v < 9) return { kind:'keypad', prompt:`${A}有 ${a} ${M}${N}，${B}有 ${a * k} ${M}${N}。${B}的${N}是${A}的几倍？`, emoji:E, answer:String(k), maxLen:2, meta:{ t:'howmany', a, b:a * k }, explain:`求 ${a * k} 是 ${a} 的几倍，用除法：${a * k} ÷ ${a} = ${k}` };
    return { kind:'keypad', prompt:`${a * k} 是 ${a} 的几倍？`, answer:String(k), maxLen:2, meta:{ t:'howmany', a, b:a * k }, explain:`${a * k} ÷ ${a} = ${k}` };
  }
  function g3_line() {
    if (chance(0.5)) { const n = ri(0, 10) * 100; return { kind:'numberline', prompt:`在数轴上找到 ${n}`, line:{ min:0, max:1000, step:100, label:5 }, answer:n, meta:{ t:'find', n }, explain:`每一格是 100，${n} 在第 ${n / 100} 格。` }; }
    if (chance(0.5)) { const n = ri(0, 10) * 1000; return { kind:'numberline', prompt:`在数轴上找到 ${n}`, line:{ min:0, max:10000, step:1000, label:5 }, answer:n, meta:{ t:'find', n }, explain:`每一格是 1000，${n} 在第 ${n / 1000} 格。` }; }
    const a = ri(1, 7) * 100, b = ri(1, (1000 - a) / 100) * 100;
    return { kind:'numberline', prompt:`比 ${a} 多 ${b} 的数在哪里？`, line:{ min:0, max:1000, step:100, label:5, start:a }, answer:a + b, meta:{ t:'right', a, b }, explain:`${a} + ${b} = ${a + b}` };
  }

  // ---------- 语文 · 一年级 ----------
  const CONFUSE = { b:['d','p','q'], d:['b','p','q'], p:['q','b','d'], q:['p','b','d'], m:['n','l'], n:['m','l'], l:['n','r'], f:['t','h'], t:['f','d'], zh:['z','ch','sh'], z:['zh','c','s'], ch:['c','zh','sh'], c:['ch','z','s'], sh:['s','zh','ch'], s:['sh','z','c'], r:['l','sh'], j:['q','x'], q2:['j','x'], x:['j','q'], g:['k','h'], k:['g','h'], h:['g','k'], y:['w','j'], w:['y','m'] };
  function c1_shengmu() {
    const [s, ch] = pick(D.shengmu);
    if (chance(0.7)) {
      const conf = (CONFUSE[s] || []).concat(D.shengmu.map(x => x[0]));
      return { kind:'choice', prompt:'听一听，是哪个声母？', speak:{ text:ch, lang:'zh-CN' }, autoSpeak:true, options:opts(s, conf), answer:s, pinyin:true, meta:{ t:'sm' }, explain:`这是声母 ${s}（读音像“${ch}”）。` };
    }
    const cands = sample(D.yunmu, 6);
    return { kind:'choice', prompt:'下面哪一个是声母？', options:opts(s, cands), answer:s, pinyin:true, meta:{ t:'which' }, explain:`${s} 是声母，其他的是韵母。` };
  }
  function c1_classify() {
    const items = shuffle([
      ...sample(D.shengmu.map(x => x[0]), 2).map(t => ({ text:t, bucket:0 })),
      ...sample(D.yunmu, 2).map(t => ({ text:t, bucket:1 })),
      ...sample(D.zhengti.map(x => x[0]), 2).map(t => ({ text:t, bucket:2 }))
    ]);
    return { kind:'sort', prompt:'把拼音送回家：拖到对应的房子里', buckets:['声母','韵母','整体认读'], items, pinyin:true, meta:{ t:'sort' }, explain:'声母23个，韵母24个，整体认读音节16个。' };
  }
  const NOT_ZT = ['ba','ma','hua','zha','cu','su','la','ge','ku','he','ji','qu','xi','ru','zu','niu','bao','tou','che','sha','nü','lü'];
  function c1_zhengti() {
    const [b, t, ch] = pick(D.zhengti);
    if (chance(0.65)) {
      return { kind:'choice', prompt:'听一听，选出正确的音节', speak:{ text:ch, lang:'zh-CN' }, autoSpeak:true, options:opts(t, D.zhengti.map(x => x[1])), answer:t, pinyin:true, meta:{ t:'listen' }, explain:`“${ch}”读 ${t}，${b} 是整体认读音节。` };
    }
    return { kind:'choice', prompt:'哪一个是整体认读音节？', options:opts(b, NOT_ZT), answer:b, pinyin:true, meta:{ t:'which' }, explain:`${b} 是整体认读音节，要整体认读，不用拼。` };
  }
  const TN = ['','一声','二声','三声','四声'];
  function c1_tone() {
    const [py, tone, ch] = pick(D.tones);
    if (chance(0.6)) return { kind:'choice', prompt:`“${ch}” ${py} 是第几声？`, speak:{ text:ch, lang:'zh-CN' }, autoSpeak:true, options:['一声','二声','三声','四声'], answer:TN[tone], wide:true, pinyinBig:py, meta:{ t:'tone', py, tone }, explain:`${py} 是${TN[tone]}。一声平、二声扬、三声拐弯、四声降。` };
    const base = stripTone(py).base;
    return { kind:'choice', prompt:`给 ${base} 标上${TN[tone]}（${ch}）`, speak:{ text:ch, lang:'zh-CN' }, options:shuffle([1, 2, 3, 4].map(k => addTone(base, k))), answer:py, pinyin:true, meta:{ t:'mark', base, tone }, explain:`${base} 的${TN[tone]}写作 ${py}。有 a 先找 a，没 a 找 o e，i u 并列标在后。` };
  }
  function c1_pinpic() {
    const w = pick(D.picWords);
    if (chance(0.6)) return { kind:'choice', prompt:'看图，选出正确的拼音', visual:{ type:'emoji', text:w[2] }, options:opts(w[1], D.picWords.map(x => x[1])), answer:w[1], pinyin:true, after:{ text:w[0], lang:'zh-CN' }, meta:{ t:'pic2py' }, explain:`${w[2]} ${w[0]}：${w[1]}` };
    const others = D.picWords.filter(x => x[1] !== w[1]);
    return { kind:'choice', prompt:`读一读：${w[1]}，是哪个图？`, pinyinBig:w[1], speak:{ text:w[0], lang:'zh-CN' }, options:opts(w[2], others.map(x => x[2])), answer:w[2], emojiOpts:true, meta:{ t:'py2pic' }, explain:`${w[1]} 是 ${w[0]} ${w[2]}` };
  }
  function c1_char() {
    const c = pick(D.chars1), v = ri(0, 2);
    const base = stripTone(c[1]).base;
    const pool = D.chars1.filter(x => stripTone(x[1]).base !== base);
    if (v === 0) return { kind:'choice', prompt:'看拼音，选汉字', pinyinBig:c[1], options:opts(c[0], pool.map(x => x[0])), answer:c[0], hanzi:true, after:{ text:c[2], lang:'zh-CN' }, meta:{ t:'py2char' }, explain:`${c[1]} 是“${c[0]}”，${c[2]}的${c[0]}。` };
    if (v === 1) return { kind:'choice', prompt:'听一听，选出听到的字', speak:{ text:`${c[2]}的${c[0]}`, lang:'zh-CN' }, autoSpeak:true, options:opts(c[0], pool.map(x => x[0])), answer:c[0], hanzi:true, meta:{ t:'listen' }, explain:`是“${c[0]}”（${c[1]}），${c[2]}的${c[0]}。` };
    return { kind:'choice', prompt:`“${c[0]}”的读音是？`, bigHanzi:c[0], options:opts(c[1], pool.map(x => x[1])), answer:c[1], pinyin:true, after:{ text:c[0], lang:'zh-CN' }, meta:{ t:'char2py' }, explain:`“${c[0]}”读 ${c[1]}，${c[2]}的${c[0]}。` };
  }

  // ---------- 语文 · 三年级上 ----------
  const SEG = [[0, 2], [2, 4], [4, 7]];
  const POETS_EXTRA = ['白居易','杜甫','王维','孟浩然','贺知章'];
  function c3_poem() {
    const p = pick(D.poems), li = ri(0, 3), line = p.lines[li], [s, e] = pick(SEG);
    const ans = line.slice(s, e);
    const cands = D.poems.flatMap(q => q.lines.map(l => l.slice(s, e)));
    const shown = line.slice(0, s) + '＿'.repeat(e - s) + line.slice(e);
    const ctx = li % 2 === 0 ? [shown, p.lines[li + 1]] : [p.lines[li - 1], shown];
    return { kind:'choice', prompt:`《${p.title}》 ${p.dyn}·${p.author}　补全诗句`, poemLines:ctx, options:opts(ans, cands), answer:ans, hanzi:true, after:{ text:ctx.join('，').replace(/＿+/, ans), lang:'zh-CN' }, meta:{ t:'fill', title:p.title, li, s, e }, explain:`${p.lines[li - (li % 2)]}，${p.lines[li - (li % 2) + 1]}。` };
  }
  function c3_poempair() {
    if (chance(0.5)) {
      const pairs = sample(D.poems, 4).map(p => { const k = pick([0, 2]); return [p.lines[k], p.lines[k + 1]]; });
      return { kind:'pair', prompt:'诗句接龙：把上下句连起来', left:pairs.map(x => x[0]), right:shuffle(pairs.map(x => x[1])), map:Object.fromEntries(pairs), meta:{ t:'lines' }, explain:pairs.map(x => x.join('，')).join('；') };
    }
    const ps = []; const seen = new Set();
    for (const p of shuffle(D.poems)) { if (seen.has(p.author)) continue; seen.add(p.author); ps.push(p); if (ps.length === 4) break; }
    return { kind:'pair', prompt:'把古诗和作者连起来', left:ps.map(p => `《${p.title}》`), right:shuffle(ps.map(p => `${p.dyn}·${p.author}`)), map:Object.fromEntries(ps.map(p => [`《${p.title}》`, `${p.dyn}·${p.author}`])), meta:{ t:'authors' }, explain:ps.map(p => `《${p.title}》${p.dyn}·${p.author}`).join('；') };
  }
  function c3_poet() {
    const p = pick(D.poems), v = ri(0, 2);
    const authors = [...new Set(D.poems.map(x => x.author).concat(POETS_EXTRA))];
    if (v === 0) return { kind:'choice', prompt:`《${p.title}》的作者是谁？`, options:opts(p.author, authors), answer:p.author, hanzi:true, meta:{ t:'author', title:p.title }, explain:`《${p.title}》是${p.dyn}代诗人${p.author}写的。` };
    if (v === 1) { const l = pick(p.lines); const titles = D.poems.filter(x => x.author !== p.author || x.title === p.title).map(x => `《${x.title}》`);
      return { kind:'choice', prompt:`“${l}”出自哪首诗？`, options:opts(`《${p.title}》`, titles), answer:`《${p.title}》`, hanzi:true, meta:{ t:'source', l }, explain:`出自${p.dyn}·${p.author}《${p.title}》。` }; }
    return { kind:'choice', prompt:`写《${p.title}》的${p.author}是哪个朝代的？`, options:['唐','宋','元','清'], answer:p.dyn, wide:true, hanzi:true, meta:{ t:'dyn', title:p.title }, explain:`${p.author}是${p.dyn}代诗人。` };
  }
  function c3_idiom() {
    const [w, m] = pick(D.idioms), v = ri(0, 2);
    if (v === 0) {
      const k = ri(0, 3), ans = w[k];
      const cands = [...new Set(D.idioms.flatMap(x => x[0].split('')))].filter(c => !w.includes(c));
      return { kind:'choice', prompt:'补全成语', bigHanzi:w.slice(0, k) + '□' + w.slice(k + 1), options:opts(ans, cands), answer:ans, hanzi:true, after:{ text:w, lang:'zh-CN' }, meta:{ t:'fill', w, k }, explain:`${w}：${m}` };
    }
    if (v === 1) return { kind:'choice', prompt:`“${w}”是什么意思？`, options:opts(m, D.idioms.map(x => x[1])), answer:m, long:true, meta:{ t:'mean', w }, explain:`${w}：${m}` };
    return { kind:'choice', prompt:`“${m}”，说的是哪个成语？`, options:opts(w, D.idioms.map(x => x[0])), answer:w, hanzi:true, meta:{ t:'which', w }, explain:`${w}：${m}` };
  }
  function c3_words() {
    const anto = chance(0.5), list = anto ? D.antonyms : D.synonyms, pair = pick(list), flip = chance(0.5);
    const [q, a] = flip ? [pair[1], pair[0]] : pair;
    const sameLen = list.flatMap(x => x).filter(x => x.length === q.length && x !== q && x !== a);
    return { kind:'choice', prompt:`“${q}”的${anto ? '反义词' : '近义词'}是？`, options:opts(a, sameLen), answer:a, hanzi:true, meta:{ t:anto ? 'anto' : 'syno', q }, explain:`“${q}”的${anto ? '反义词' : '近义词'}是“${a}”。` };
  }

  // ---------- 英语 ----------
  function enPool(grade) {
    const base = D.english.filter(x => grade >= 3 || x[3] === 1);
    const nums = D.numbersEn.slice(1).map((w, i) => [w, CN[i + 1], `num:${i + 1}`, w.length <= 4 ? 1 : 3]).filter(x => grade >= 3 || x[3] === 1);
    return base.concat(nums);
  }
  const picOf = it => it[2];
  function e_listen(grade) {
    const pool = enPool(grade), w = pick(pool);
    const others = pool.filter(x => x[0] !== w[0]);
    const labels = {}; pool.forEach(x => labels[x[0]] = picOf(x));
    return { kind:'choice', prompt:'听一听，选出对应的图片', speak:{ text:w[0], lang:'en-US' }, autoSpeak:true, options:opts(w[0], others.map(x => x[0])), answer:w[0], picLabels:labels, meta:{ t:'listen' }, explain:`${w[0]} 是“${w[1]}”。` };
  }
  function e_pic(grade) {
    const pool = enPool(grade), w = pick(pool);
    return { kind:'choice', prompt:'看图，选出正确的单词', visual:{ type:'pic', text:picOf(w) }, options:opts(w[0], pool.map(x => x[0])), answer:w[0], en:true, after:{ text:w[0], lang:'en-US' }, meta:{ t:'pic' }, explain:`${w[0]} 是“${w[1]}”。` };
  }
  function e_pair(grade) {
    const ws = sample(enPool(grade), 4);
    return { kind:'pair', prompt:'把单词和图片连起来', left:ws.map(x => x[0]), right:shuffle(ws.map(x => picOf(x))), map:Object.fromEntries(ws.map(x => [x[0], picOf(x)])), rightPic:true, speakLeft:'en-US', meta:{ t:'pair' }, explain:ws.map(x => `${x[0]} ${x[1]}`).join('，') };
  }
  function e_spell(grade) {
    const pool = enPool(grade).filter(x => grade >= 3 ? x[0].length <= 6 : x[0].length <= 4);
    const w = pick(pool), letters = w[0].split('');
    return { kind:'drag', prompt:'听一听，拼出单词', visual:{ type:'pic', text:picOf(w) }, speak:{ text:w[0], lang:'en-US' }, autoSpeak:true, parts:letters.map((_, i) => ({ slot:i })), tiles:shuffle(letters), answer:letters, en:true, meta:{ t:'spell', w:w[0] }, explain:`${w[0]}：${letters.join('-')}（${w[1]}）` };
  }

  // ---------- 技能目录 ----------
  const SKILLS = [
    { id:'g1_count', sub:'math', g:1, name:'数一数', icon:'🔢', desc:'认识20以内的数', gen:g1_count, timed:true },
    { id:'g1_compare', sub:'math', g:1, name:'比大小', icon:'🐊', desc:'>、<、= 小鳄鱼', gen:g1_compare, timed:true },
    { id:'g1_add', sub:'math', g:1, name:'20以内加法', icon:'➕', desc:'进位加法、凑十法', gen:g1_add, timed:true },
    { id:'g1_sub', sub:'math', g:1, name:'20以内减法', icon:'➖', desc:'退位减法、破十法', gen:g1_sub, timed:true },
    { id:'g1_make10', sub:'math', g:1, name:'凑十游戏', icon:'🔟', desc:'拖一拖，凑成10', gen:g1_make10 },
    { id:'g1_line', sub:'math', g:1, name:'青蛙跳数轴', icon:'🐸', desc:'在数轴上找数、跳一跳', gen:g1_line },
    { id:'g1_order', sub:'math', g:1, name:'排排队', icon:'🚂', desc:'把数从小到大排好', gen:g1_order },
    { id:'g3_addsub', sub:'math', g:3, name:'万以内加减法', icon:'🧮', desc:'口算与笔算，连续进位退位', gen:g3_addsub, timed:true },
    { id:'g3_mul', sub:'math', g:3, name:'多位数乘一位数', icon:'✖️', desc:'口算、笔算、中间有0', gen:g3_mul, timed:true },
    { id:'g3_time', sub:'math', g:3, name:'时、分、秒', icon:'⏰', desc:'认钟表、换算、经过时间', gen:g3_time, timed:true },
    { id:'g3_measure', sub:'math', g:3, name:'测量', icon:'📏', desc:'毫米、分米、千米、吨', gen:g3_measure, timed:true },
    { id:'g3_fraction', sub:'math', g:3, name:'分数的初步认识', icon:'🍕', desc:'几分之几、比大小、加减', gen:g3_fraction, timed:true },
    { id:'g3_times', sub:'math', g:3, name:'倍的认识', icon:'🐰', desc:'几倍、一个数的几倍', gen:g3_times, timed:true },
    { id:'g3_line', sub:'math', g:3, name:'数轴找数', icon:'📍', desc:'整百、整千在数轴上', gen:g3_line },
    { id:'c1_shengmu', sub:'chinese', g:1, name:'声母乐园', icon:'🅱️', desc:'听音选声母', gen:c1_shengmu, timed:true },
    { id:'c1_classify', sub:'chinese', g:1, name:'拼音回家', icon:'🏠', desc:'声母、韵母、整体认读分类', gen:c1_classify },
    { id:'c1_zhengti', sub:'chinese', g:1, name:'整体认读', icon:'🧩', desc:'16个整体认读音节', gen:c1_zhengti, timed:true },
    { id:'c1_tone', sub:'chinese', g:1, name:'四声小火车', icon:'🎵', desc:'一声平、二声扬…', gen:c1_tone, timed:true },
    { id:'c1_pinpic', sub:'chinese', g:1, name:'看图拼读', icon:'🖼️', desc:'看图选拼音', gen:c1_pinpic, timed:true },
    { id:'c1_char', sub:'chinese', g:1, name:'识字宝箱', icon:'📦', desc:'一年级上册生字', gen:c1_char, timed:true },
    { id:'c3_poem', sub:'chinese', g:3, name:'古诗填空', icon:'📜', desc:'三年级上册古诗', gen:c3_poem, timed:true },
    { id:'c3_poempair', sub:'chinese', g:3, name:'诗句接龙', icon:'🔗', desc:'上下句、诗与作者连线', gen:c3_poempair },
    { id:'c3_poet', sub:'chinese', g:3, name:'诗人朝代', icon:'🏮', desc:'谁写的？哪个朝代？', gen:c3_poet, timed:true },
    { id:'c3_idiom', sub:'chinese', g:3, name:'成语闯关', icon:'🐉', desc:'补全成语、理解意思', gen:c3_idiom, timed:true },
    { id:'c3_words', sub:'chinese', g:3, name:'近义词反义词', icon:'⚖️', desc:'找朋友、找对手', gen:c3_words, timed:true },
    { id:'e_listen', sub:'english', g:0, name:'听音选图', icon:'🎧', desc:'听单词，选图片', gen:e_listen, timed:true },
    { id:'e_pic', sub:'english', g:0, name:'看图选词', icon:'🖍️', desc:'看图片，选单词', gen:e_pic, timed:true },
    { id:'e_pair', sub:'english', g:0, name:'单词连连看', icon:'🧷', desc:'单词和图片配对', gen:e_pair },
    { id:'e_spell', sub:'english', g:0, name:'拼写小能手', icon:'🔤', desc:'拖字母拼单词', gen:e_spell }
  ];
  const byId = Object.fromEntries(SKILLS.map(s => [s.id, s]));
  function make(id, grade) { const s = byId[id]; const q = s.gen(grade || s.g || 1); q.skill = id; q.sub = s.sub; return q; }

  // ---------- 判分 ----------
  function grade(q, resp) {
    if (q.kind === 'choice' || q.kind === 'keypad') return String(resp).trim().replace(/^0+(?=\d)/, '') === String(q.answer);
    if (q.kind === 'numberline') return Number(resp) === q.answer;
    if (q.kind === 'drag') return Array.isArray(resp) && resp.length === q.answer.length && resp.every((x, i) => String(x) === q.answer[i]);
    return false;
  }
  const checkSort = (q, itemIdx, bucket) => q.items[itemIdx].bucket === bucket;
  const checkPair = (q, l, r) => q.map[l] === r;

  const API = { SKILLS, byId, make, grade, checkSort, checkPair, addTone, stripTone, fval, timeStr, _util:{ ri, pick, shuffle, opts } };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.GEN = API;
})(typeof self !== 'undefined' ? self : this);
