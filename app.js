(function () {
    'use strict';
    var DATA = (window.LEARNC_DATA || []).slice().sort(function (a, b) {
        return a.day - b.day;
    });
    var app = document.getElementById('app');

    /* ---------- storage (per viewer, optional) ---------- */
    var store = {
        get: function (k, d) {
            try {
                var v = localStorage.getItem(k);
                return v == null ? d : JSON.parse(v);
            } catch (e) {
                return d;
            }
        },
        set: function (k, v) {
            try {
                localStorage.setItem(k, JSON.stringify(v));
            } catch (e) {}
        }
    };
    var solved = store.get('lc-solved', {});
    function isSolved(d, k) {
        return !!solved[d + '-' + k];
    }
    function setSolved(d, k, v) {
        if (v)
            solved[d + '-' + k] = true;
        else
            delete solved[d + '-' + k];
        store.set('lc-solved', solved);
    }
    function countSolved(d) {
        var n = 0;
        for (var k = 1; k <= 4; k++)
            if (isSolved(d, k))
                n++;
        return n;
    }

    /* ---------- theme ---------- */
    var root = document.documentElement;
    function applyTheme(t) {
        if (t === 'light' || t === 'dark')
            root.setAttribute('data-theme', t);
        else
            root.removeAttribute('data-theme');
    }
    applyTheme(store.get('lc-theme', null));
    document.getElementById('themeBtn').addEventListener('click', function () {
        var cur = root.getAttribute('data-theme');
        var isDark = cur ? cur === 'dark' : (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
        var next = isDark ? 'light' : 'dark';
        applyTheme(next);
        store.set('lc-theme', next);
    });

    /* ---------- helpers ---------- */
    function esc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function plain(html) {
        var d = document.createElement('div');
        d.innerHTML = html;
        return (d.textContent || '').replace(/\s+\n/g, '\n').trim();
    }
    var reg = [];
    function reg1(text) {
        reg.push(text);
        return reg.length - 1;
    }
    function fallbackCopy(t, ok) {
        var a = document.createElement('textarea');
        a.value = t;
        a.setAttribute('readonly', '');
        a.style.position = 'fixed';
        a.style.opacity = '0';
        document.body.appendChild(a);
        a.select();
        var done = false;
        try {
            done = document.execCommand('copy');
        } catch (e) {}
        document.body.removeChild(a);
        if (done)
            ok();
    }
    function copyText(t, btn) {
        var label = btn.getAttribute('data-label') || btn.textContent;
        btn.setAttribute('data-label', label);
        function ok() {
            btn.textContent = 'Copied';
            setTimeout(function () {
                btn.textContent = label;
            }, 1400);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(t).then(ok, function () {
                fallbackCopy(t, ok);
            });
        } else
            fallbackCopy(t, ok);
    }
    var LV = {
        easy: 'Easy',
        easymed: 'Easy-Medium',
        med: 'Medium',
        hard: 'Hard'
    };
    function lvlLabel(e) {
        return LV[e.cls] || e.level;
    }

    /* ---------- code and sample blocks ---------- */
    function codeBlock(p, label) {
        var id = reg1(p.raw);
return '<div class="codeblock"><div class="cb-top"><span>' + (label || 'C') +
            '</span><button class="cbtn" type="button" data-copy="' + id +
            '">Copy code</button></div><pre><code>' + p.html + '</code></pre></div>';
    }
    function runsTable(runs) {
        var hasIn = runs.some(function (r) {
            return r.in !== null;
        });
        var rows = runs.map(function (r) {
            var left = '';
            if (hasIn) {
left = '<td><div class="inwrap"><pre>' + esc(r.in === null ? '(no input)' : r.in) +
                    '</pre>' + (r.in === null ? '' : '<button class="cbtn light" type="button" data-copy="' + reg1(r.in) + '">Copy input</button>') +
                    '</div></td>';
            }
            return '<tr>' + left + '<td><pre>' + esc(r.out) + '</pre></td></tr>';
        }).join('');
return '<div class="table-scroll"><table class="io"><tr>' + (hasIn ? '<th>Input</th>' : '') +
            '<th>' + (hasIn ? 'Output' : 'Output when run') + '</th></tr>' + rows + '</table></div>';
    }
    function parts(ps) {
        return ps.map(function (p) {
            if (p.t === 'html')
                return '<div class="prose">' + p.html + '</div>';
            if (p.t === 'try')
                return '<div class="prose"><div class="box try"><b>Try it.</b> ' + p.html + '</div></div>';
            if (p.t === 'snippet')
                return codeBlock(p, 'C');
            if (p.t === 'code')
                return codeBlock(p, 'C') + runsTable(p.runs);
            return '';
        }).join('');
    }
    function exampleTable(ex) {
        var rows = ex.map(function (s) {
return '<tr><td><div class="inwrap"><pre>' + esc(s.in) +
                '</pre><button class="cbtn light" type="button" data-copy="' + reg1(s.in) +
                '">Copy input</button></div></td><td><pre>' + esc(s.out) + '</pre></td></tr>';
        }).join('');
return '<div class="table-scroll"><table class="io"><tr><th>Input</th><th>Output</th></tr>' +
            rows + '</table></div>';
    }

    /* ---------- pages ---------- */
    function totalSolved() {
        var n = 0;
        DATA.forEach(function (d) {
            n += countSolved(d.day);
        });
        return n;
    }

    function pageHome() {
        var n = totalSolved(), tot = DATA.length * 4;
        return '<section class="hero"><p class="kicker">C programming</p>' +
            '<h1 style="margin-top:12px">Learn C by solving problems</h1>' +
'<p class="lede">Short lessons whose examples really ran, then four exercises a day from easy to hard. Write your answer in the workspace and ask Claude to go through it with you.</p></section>' +
                
            '<div class="levels">' +
'<a class="level on" href="#beginner"><span class="badge">01</span><div><h3>Beginner</h3><p>8 days, from variables to matrices. ' +
                n + ' of ' + tot + ' exercises solved.</p></div><span class="pill go">Open</span></a>' +
'<div class="level off"><span class="badge">02</span><div><h3>Intermediate</h3><p>Not available yet.</p></div><span class="pill">Later</span></div>' +
                
'<div class="level off"><span class="badge">03</span><div><h3>Advanced</h3><p>Not available yet.</p></div><span class="pill">Later</span></div>' +
                
            '</div>' +
'<div class="how"><div><b>Read</b><span>Theory in four short sections, then two worked examples with their real output.</span></div>' +
                
'<div><b>Solve</b><span>Four exercises per day. Each one comes with samples you can copy in one click.</span></div>' +
                
            '<div><b>Review</b><span>Paste your code in the workspace. Claude traces your samples and points to the bug.</span></div></div>';
    }

    function pageBeginner() {
        var cards = DATA.map(function (d) {
            var bars = d.exercises.map(function (e, i) {
return '<i class="' + e.cls + (isSolved(d.day, i + 1) ? ' done' : '') + '" title="' +
                    esc(e.title) + '"></i>';
            }).join('');
return '<a class="day-card" href="#day-' + d.day + '"><span class="n">DAY<b>' +
                String(d.day).padStart(2, '0') + '</b></span><h3>' + esc(d.sub) + '</h3>' +
'<div class="bars" aria-hidden="true">' + bars +
                    '</div><div class="meta"><span>4 exercises</span><span>' + countSolved(d.day) + '/4 solved</span></div></a>';
        }).join('');
        return '<div class="crumb"><a href="#home">Home</a><span>/</span><span>Beginner</span></div>' +
'<h1>Beginner</h1><p class="lede">Eight days, each with a lesson and four exercises. Go in order: every day uses what came before.</p>' +
                
            '<div class="days">' + cards + '</div>';
    }

    function exerciseCard(d, e, k) {
        var inp = e.input.map(function (x) {
            return '<li>' + x + '</li>';
        }).join('');
        var out = e.output.map(function (x) {
            return '<li>' + x + '</li>';
        }).join('');
        var s = isSolved(d.day, k);
return '<article class="ex' + (s ? ' solved' : '') + '" id="ex-' + k +
            '"><div class="ex-head"><span class="no">Exercise ' + k + '</span><span class="lvl ' + e.cls + '">' +
            lvlLabel(e) + '</span></div>' +
'<h3>' + e.title + '</h3><p class="uses">Uses: ' + e.use + '</p><div class="prose"><p>' +
                e.statement + '</p></div>' +
'<h4>Input</h4><div class="prose"><ul>' + inp +
                '</ul></div><h4>Output</h4><div class="prose"><ul>' + out + '</ul></div>' +
            (e.extra ? '<div class="prose"><div class="box note">' + e.extra + '</div></div>' : '') +
            '<h4>Examples</h4>' + exampleTable(e.examples) +
'<div class="actions"><a class="btn primary" href="#workspace-' + d.day + '-' + k +
                '">Solve in workspace</a>' +
'<button class="btn' + (s ? ' done' : '') + '" type="button" data-solved="' + d.day + '-' +
                k + '">' + (s ? 'Solved' : 'Mark as solved') + '</button></div></article>';
    }

    function pageDay(n) {
        var d = DATA[n - 1];
        if (!d)
            return pageBeginner();
        var goals = d.goals.map(function (g) {
            return '<li>' + g + '</li>';
        }).join('');
        var side = '<h4>Theory</h4>' + d.theory.map(function (t, i) {
            return '<button type="button" data-go="sec-t-' + i + '">' + t.title + '</button>';
        }).join('') +
            '<h4>Examples</h4>' + d.examples.map(function (t, i) {
            return '<button type="button" data-go="sec-e-' + i + '">' + t.title + '</button>';
        }).join('') +
            '<h4>Exercises</h4>' + d.exercises.map(function (t, i) {
return '<button type="button" data-go="ex-' + (i + 1) + '">' + (i + 1) + '. ' + t.title +
                '</button>';
        }).join('');
        var theory = d.theory.map(function (t, i) {
return '<section class="lesson" id="sec-t-' + i + '"><h3><span class="tag">Section ' +
                (i + 1) + '</span>' + t.title + '</h3>' + parts(t.parts) + '</section>';
        }).join('');
        var examples = d.examples.map(function (t, i) {
return '<section class="lesson" id="sec-e-' + i + '"><h3><span class="tag">Example ' +
                (i + 1) + '</span>' + t.title + '</h3>' + parts(t.parts) + '</section>';
        }).join('');
        var exs = d.exercises.map(function (e, i) {
            return exerciseCard(d, e, i + 1);
        }).join('');
var prev = n > 1 ? '<a class="btn" href="#day-' + (n - 1) + '">&larr; Day ' + (n - 1) +
            '</a>' : '<span></span>';
var next = n < DATA.length ? '<a class="btn" href="#day-' + (n + 1) + '">Day ' + (n + 1) +
            ' &rarr;</a>' : '<a class="btn" href="#beginner">All days</a>';
return '<div class="crumb"><a href="#home">Home</a><span>/</span><a href="#beginner">Beginner</a><span>/</span><span>Day ' +
            n + '</span></div>' +
            '<p class="kicker">Day ' + n + '</p><h1 style="margin-top:10px">' + esc(d.sub) + '</h1>' +
            '<div class="day-grid"><aside class="side" aria-label="On this page">' + side + '</aside><div>' +
'<div class="lesson" style="margin-top:0"><h3>By the end of today you will</h3><ul class="goals">' +
                goals + '</ul><p class="plan">' + d.plan + '</p></div>' +
'<div class="block"><p class="block-label" style="margin-top:28px">Part 1 · Theory</p>' +
                theory + '</div>' +
            '<div class="block"><p class="block-label">Part 2 · Worked examples</p>' + examples + '</div>' +
            '<div class="block"><p class="block-label">Part 3 · Exercises</p>' + exs + '</div>' +
            '<div class="pager">' + prev + next + '</div></div></div>';
    }

    /* ---------- code editor (no libraries) ---------- */
    var KW = {};
    'if else for while do switch case default break continue return goto sizeof typedef struct union enum static const extern volatile register inline'.split(' ').forEach(function (w) {
        KW[w] = 'k';
    });
    'int long short char float double void unsigned signed size_t bool FILE'.split(' ').forEach(function (w) {
        KW[w] = 'kt';
    });
    'NULL true false EOF INT_MAX INT_MIN LLONG_MAX LLONG_MIN'.split(' ').forEach(function (w) {
        KW[w] = 'mi';
    });
    var TOK = /(\/\/[^\n]*)|(\/\*[\s\S]*?(?:\*\/|$))|(#[^\n]*?)(?=\n|\/\/|\/\*|$)|("(?:\\.|[^"\\\n])*"?)|('(?:\\.|[^'\\\n])*'?)|(0[xX][0-9a-fA-F]+[uUlL]*|\d+\.?\d*(?:[eE][+-]?\d+)?[uUlLfF]*|\.\d+(?:[eE][+-]?\d+)?[fF]?)|([A-Za-z_]\w*)|([()\[\]{}])|([\s\S])/g;
    var CLS = [null, 'c1', 'c1', 'cp', 's', 's', 'mi', null, null, null];
    function tokenize(src) {
        var out = [], m, pos = 0;
        TOK.lastIndex = 0;
        while ((m = TOK.exec(src)) !== null) {
            if (m[0] === '') {
                TOK.lastIndex++;
                continue;
            }
            var type = null, g;
            for (g = 1; g <= 9; g++)
                if (m[g] !== undefined)
                    break;
            if (g <= 6)
                type = CLS[g];
            else if (g === 7) {
                type = KW[m[0]] || null;
                if (!type) {
                    var j = TOK.lastIndex;
                    while (src.charAt(j) === ' ' || src.charAt(j) === '\t')
                        j++;
                    if (src.charAt(j) === '(')
                        type = 'nf';
                }
            } else if (g === 8)
                type = 'br';
            out.push({ s: pos, t: m[0], c: type });
            pos += m[0].length;
        }
        return out;
    }
    function pairBrackets(tokens) {
        var stack = [], map = {}, open = { '(': ')', '[': ']', '{': '}' };
        tokens.forEach(function (tk, i) {
            if (tk.c !== 'br')
                return;
            if (open[tk.t])
                stack.push(i);
            else {
                var top = stack.length ? stack[stack.length - 1] : -1;
                if (top >= 0 && open[tokens[top].t] === tk.t) {
                    stack.pop();
                    map[top] = i;
                    map[i] = top;
                }
            }
        });
        return map;
    }
    var PAIRS = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };

    function createEditor(host, opts) {
host.innerHTML = '<div class="ed-gutter" aria-hidden="true"><div></div></div><div class="ed-main"><div class="ed-cur" hidden></div><pre class="ed-hl" aria-hidden="true"><code></code></pre>' +
            
            '<textarea class="ed-ta" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="C source code"></textarea></div>';
        var gut = host.querySelector('.ed-gutter div'), cur = host.querySelector('.ed-cur'), hl = host.querySelector('.ed-hl code'), ta = host.querySelector('.ed-ta');
        var tokens = [], pairs = {}, lastLines = -1, lastText = null;
        ta.value = opts.value || '';

        function lineH() {
            return parseFloat(getComputedStyle(ta).lineHeight) || 21;
        }
        function padT() {
            return parseFloat(getComputedStyle(ta).paddingTop) || 12;
        }
        function caretInfo() {
            var s = ta.selectionStart, before = ta.value.slice(0, s), ln = before.split('\n').length;
            return { line: ln, col: s - before.lastIndexOf('\n'), pos: s };
        }
        function render() {
            var v = ta.value;
            if (v !== lastText) {
                tokens = tokenize(v);
                pairs = pairBrackets(tokens);
                lastText = v;
            }
            var c = ta.selectionStart, hi = -1, hj = -1;
            if (ta.selectionStart === ta.selectionEnd) {
                for (var i = 0; i < tokens.length; i++) {
                    var tk = tokens[i];
                    if (tk.c === 'br' && (tk.s === c - 1 || tk.s === c) && pairs[i] !== undefined) {
                        hi = i;
                        hj = pairs[i];
                        if (tk.s === c - 1)
                            break;
                    }
                }
            }
            var html = '';
            for (var k = 0; k < tokens.length; k++) {
                var t = tokens[k], txt = esc(t.t);
                var cls = (t.c && t.c !== 'br') ? 'p-' + t.c : '';
                if (k === hi || k === hj)
                    cls += ' mb';
                html += cls ? '<span class="' + cls.trim() + '">' + txt + '</span>' : txt;
            }
            hl.innerHTML = html + '\n';
            var n = v.split('\n').length;
            if (n !== lastLines) {
                var g = '';
                for (var q = 1; q <= n; q++)
                    g += q + '\n';
                gut.textContent = g;
                lastLines = n;
            }
            sync();
        }
        function sync() {
            hl.style.transform = 'translate(' + (-ta.scrollLeft) + 'px,' + (-ta.scrollTop) + 'px)';
            gut.style.transform = 'translateY(' + (-ta.scrollTop) + 'px)';
            var ci = caretInfo(), lh = lineH();
            if (ta.selectionStart === ta.selectionEnd) {
                cur.hidden = false;
                cur.style.top = (padT() + (ci.line - 1) * lh - ta.scrollTop) + 'px';
                cur.style.height = lh + 'px';
            } else
                cur.hidden = true;
            if (opts.onCursor)
                opts.onCursor(ci);
        }
        function exec(text) {
            ta.focus();
            var ok = false;
            try {
                ok = document.execCommand('insertText', false, text);
            } catch (e) {
                ok = false;
            }
            if (!ok) {
                ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, 'end');
                ta.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
        function lineRange() {
            var v = ta.value, s = ta.selectionStart, en = ta.selectionEnd;
            var ls = v.lastIndexOf('\n', s - 1) + 1;
            var le = (en > s && v.charAt(en - 1) === '\n') ? en - 1 : v.indexOf('\n', en);
            if (le < 0)
                le = v.length;
            return [ls, le];
        }
        function rewriteLines(fn) {
            var r = lineRange(), block = ta.value.slice(r[0], r[1]);
            var nb = fn(block.split('\n')).join('\n');
            ta.setSelectionRange(r[0], r[1]);
            exec(nb);
            ta.setSelectionRange(r[0], r[0] + nb.length);
        }
        function indentLines(out) {
            rewriteLines(function (ls) {
                return ls.map(function (l) {
                    return out ? l.replace(/^( {1,4}|\t)/, '') : (l.length ? '    ' + l : l);
                });
            });
        }
        function toggleComment() {
            rewriteLines(function (ls) {
                var all = ls.every(function (l) {
                    return !l.trim() || /^\s*\/\//.test(l);
                });
                return ls.map(function (l) {
                    if (!l.trim())
                        return l;
                    return all ? l.replace(/^(\s*)\/\/ ?/, '$1') : l.replace(/^(\s*)/, '$1// ');
                });
            });
        }
        ta.addEventListener('keydown', function (e) {
            var v = ta.value, s = ta.selectionStart, en = ta.selectionEnd, mod = e.ctrlKey || e.metaKey, key = e.key;
            if (e.isComposing)
                return;
            if (mod && key === 'Enter') {
                e.preventDefault();
                if (opts.onSubmit)
                    opts.onSubmit();
                return;
            }
            if (mod && key === '/') {
                e.preventDefault();
                toggleComment();
                return;
            }
            if (mod || e.altKey)
                return;
            if (key === 'Tab') {
                e.preventDefault();
                if (e.shiftKey || (s !== en && v.slice(s, en).indexOf('\n') >= 0))
                    indentLines(e.shiftKey);
                else
                    exec('    ');
                return;
            }
            if (key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
var ls = v.lastIndexOf('\n', s - 1) +
                    1, line = v.slice(ls, s), indent = line.match(/^[ \t]*/)[0];
                if (/\{[ \t]*$/.test(line)) {
                    if (v.charAt(en) === '}') {
                        exec('\n' + indent + '    \n' + indent);
                        var p = s + 1 + indent.length + 4;
                        ta.setSelectionRange(p, p);
                    } else
                        exec('\n' + indent + '    ');
                } else
                    exec('\n' + indent);
                return;
            }
            if (key === 'Backspace' && s === en && s > 0 && PAIRS[v.charAt(s - 1)] && PAIRS[v.charAt(s - 1)] === v.charAt(s)) {
                e.preventDefault();
                ta.setSelectionRange(s - 1, s + 1);
                document.execCommand('delete');
                return;
            }
            if (key.length !== 1)
                return;
            if (s === en && (key === ')' || key === ']' || key === '}' || key === '"' || key === "'") && v.charAt(s) === key) {
                e.preventDefault();
                ta.setSelectionRange(s + 1, s + 1);
                return;
            }
            if (key === '}' && s === en) {
                var ls2 = v.lastIndexOf('\n', s - 1) + 1, ln2 = v.slice(ls2, s);
                if (/^[ \t]+$/.test(ln2) && /    $/.test(ln2)) {
                    e.preventDefault();
                    ta.setSelectionRange(s - 4, s);
                    exec('}');
                    return;
                }
            }
            if (PAIRS[key]) {
                var close = PAIRS[key], prev = v.charAt(s - 1), next = v.charAt(en);
                if (s !== en) {
                    e.preventDefault();
                    var sel = v.slice(s, en);
                    exec(key + sel + close);
                    ta.setSelectionRange(s + 1, s + 1 + sel.length);
                    return;
                }
                if (key === '"' || key === "'") {
                    if (/\w/.test(next) || /[\w\\]/.test(prev))
                        return;
                } else if (/\w/.test(next))
                    return;
                e.preventDefault();
                exec(key + close);
                ta.setSelectionRange(s + 1, s + 1);
            }
        });
        ta.addEventListener('input', function () {
            render();
            if (opts.onChange)
                opts.onChange(ta.value);
        });
        ta.addEventListener('scroll', sync);
        ['keyup', 'click', 'focus', 'select'].forEach(function (ev) {
            ta.addEventListener(ev, render);
        });
        var rs = window.ResizeObserver ? new ResizeObserver(sync) : null;
        if (rs)
            rs.observe(host);
        render();
        return {
            getValue: function () {
                return ta.value;
            },
            setValue: function (t) {
                ta.value = t;
                render();
                if (opts.onChange)
                    opts.onChange(t);
            },
            focus: function () {
                ta.focus();
            },
            setFont: function (px) {
                host.style.setProperty('--ed-fs', px + 'px');
                lastLines = -1;
                render();
            }
        };
    }

    /* ---------- workspace ---------- */
    var STARTER = '#include <stdio.h>\n\nint main() {\n    \n    return 0;\n}\n';
    var running = null, edit = null, pendingDraft = '';

    function problemPanel(d, k) {
        if (!d)
            return '<div class="empty-pick">Free code mode. Write any C program and ask Claude to review it.</div>';
        var e = d.exercises[k - 1];
        var inp = e.input.map(function (x) {
            return '<li>' + x + '</li>';
        }).join('');
        var out = e.output.map(function (x) {
            return '<li>' + x + '</li>';
        }).join('');
return '<div class="ex-head"><span class="no">Day ' + d.day + ' · Exercise ' + k +
            '</span><span class="lvl ' + e.cls + '">' + lvlLabel(e) + '</span></div>' +
'<h3 style="margin-top:8px">' + e.title + '</h3><div class="prose"><p>' + e.statement +
                '</p><h4 class="field-label" style="margin-top:12px">Input</h4><ul>' + inp +
                '</ul><h4 class="field-label">Output</h4><ul>' + out + '</ul>' +
(e.extra ? '<div class="box note">' + e.extra + '</div>' : '') +
                '</div><h4 class="field-label" style="margin-top:12px">Samples</h4>' + exampleTable(e.examples);
    }

    function lessonPanel(d) {
        function sec(label, list, tag) {
            return '<p class="block-label">' + label + '</p>' + list.map(function (t, i) {
                return '<section class="lesson"><h3><span class="tag">' + tag + ' ' + (i + 1) + '</span>' + t.title + '</h3>' + parts(t.parts) + '</section>';
            }).join('');
        }
        return '<p class="kicker">Day ' + d.day + ' · ' + esc(d.sub) + '</p>' + sec('Theory', d.theory, 'Section') + sec('Worked examples', d.examples, 'Example');
    }

    function pageWorkspace(dn, kn) {
        var d = DATA[dn - 1], k = kn, valid = d && k >= 1 && k <= 4;
        if (!valid) {
            d = null;
            k = 0;
        }
var opts = '<option value="free"' + (!d ? ' selected' : '') +
            '>Free code (no exercise)</option>' + DATA.map(function (x) {
return '<optgroup label="Day ' + x.day + ' · ' + esc(x.sub) + '">' +
                x.exercises.map(function (e, i) {
                var v = x.day + '-' + (i + 1);
                var sel = d && x.day === d.day && k === i + 1;
return '<option value="' + v + '"' + (sel ? ' selected' : '') + '>' +
                    (isSolved(x.day, i + 1) ? '✓ ' : '') + (i + 1) + '. ' + esc(plain(e.title)) + ' (' + lvlLabel(e) +
                    ')</option>';
            }).join('') + '</optgroup>';
        }).join('');
        var key = d ? d.day + '-' + k : 'free';
        var draft = store.get('lc-draft-' + key, STARTER);
        pendingDraft = draft;
        var s = d ? isSolved(d.day, k) : false;
return '<div class="crumb"><a href="#home">Home</a><span>/</span><span>Workspace</span></div><h1>Workspace</h1>' +
            
'<p class="lede">Write your solution, then ask Claude to review it. Claude reads the code and traces the samples by hand. It does not compile or run anything.</p>' +
                
'<div class="ws"><section class="panel" aria-label="Problem"><label class="field-label" for="wsPick">Problem</label><select id="wsPick">' +
                opts + '</select>' +
            (d ? '<div class="ws-tabs" role="tablist"><button type="button" class="on" data-tab="wsProblem">Problem</button><button type="button" data-tab="wsLesson">Lesson</button></div>' : '') +
            '<div style="margin-top:16px" id="wsProblem">' + problemPanel(d, k) + '</div>' +
            (d ? '<div style="margin-top:16px" id="wsLesson" hidden>' + lessonPanel(d) + '</div>' : '') + '</section>' +
'<section class="panel" aria-label="Code" data-key="' + key +
                '"><span class="field-label" id="wsLbl">Your code (C)</span>' +
'<div class="editor"><div class="cb-top"><span>main.c</span><span class="tb"><button class="cbtn" type="button" id="wsFsDn" aria-label="Smaller font">A−</button><button class="cbtn" type="button" id="wsFsUp" aria-label="Larger font">A+</button><button class="cbtn" type="button" id="wsCopy">Copy code</button><button class="cbtn" type="button" id="wsReset">Reset</button></span></div>' +
                
'<div class="ed" id="wsEd"></div><div class="ed-status"><span id="wsPos">Ln 1, Col 1</span><span>Tab indents · Ctrl+Enter reviews</span></div></div>' +
                

'<div class="actions"><button class="btn primary" type="button" id="wsReview">Review with Claude</button><button class="btn" type="button" id="wsStop" hidden>Stop</button>' +
                
(d ? '<button class="btn' + (s ? ' done' : '') + '" type="button" data-solved="' + d.day + '-' + k + '">' + (s ? 'Solved' : 'Mark as solved') + '</button>' : '') +
                
            '<span class="status" id="wsStatus" role="status"></span></div>' +
'<div class="result" id="wsOut" aria-live="polite"><span class="ph">The review appears here. It covers likely compile problems, a trace of each sample, and the risks Claude sees (overflow, array size, speed).</span></div>' +
                
            '<p class="notice"><b>Claude is not a compiler.</b> It can miss a bug or misread a run. To see real output, copy your code into an online C compiler, or paste it in the chat where it is compiled and tested for real.</p></section></div>';
    }

    /* markdown-lite for the review */
    function md(src) {
        var parts = src.split(/```/);
        var html = '';
        for (var i = 0; i < parts.length; i++) {
            if (i % 2 === 1) {
                var code = parts[i].replace(/^[a-zA-Z0-9+#-]*\n/, '').replace(/\n$/, '');
                html += '<pre><code>' + esc(code) + '</code></pre>';
            } else
                html += mdText(parts[i]);
        }
        return html;
    }
    function inline(t) {
        return esc(t).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
    }
    function mdText(t) {
        var lines = t.split('\n'), out = '', inList = false, para = [];
        function flushP() {
            if (para.length) {
                out += '<p>' + para.join('<br>') + '</p>';
                para = [];
            }
        }
        function endList() {
            if (inList) {
                out += '</ul>';
                inList = false;
            }
        }
        lines.forEach(function (ln) {
            var m;
            if ((m = ln.match(/^\s*#{1,4}\s+(.*)$/))) {
                flushP();
                endList();
                out += '<h5>' + inline(m[1]) + '</h5>';
            } else if ((m = ln.match(/^\s*(?:[-*]|\d+[.)])\s+(.*)$/))) {
                flushP();
                if (!inList) {
                    out += '<ul>';
                    inList = true;
                }
                out += '<li>' + inline(m[1]) + '</li>';
            } else if (/^\s*$/.test(ln)) {
                flushP();
                endList();
            } else {
                endList();
                para.push(inline(ln));
            }
        });
        flushP();
        endList();
        return out;
    }

    function buildPrompt(d, k, code, stdin) {
        var p = 'You are a patient C tutor reviewing a beginner\'s solution. Write the reply in Vietnamese; keep code, identifiers and program output as they are. You cannot compile or run code, so trace by hand, be careful, and say plainly when you are unsure.\n\n';
        if (d) {
            var e = d.exercises[k - 1];
p += 'PROBLEM: ' + plain(e.title) + '\n' + plain(e.statement) + '\nInput: ' +
                e.input.map(plain).join(' | ') + '\nOutput: ' + e.output.map(plain).join(' | ') +
                (e.extra ? '\nNote: ' + plain(e.extra) : '') + '\n\nSAMPLES (input => expected output):\n';
            e.examples.forEach(function (s, i) {
                p += '--- sample ' + (i + 1) + ' input:\n' + s.in +'\n--- expected output:\n' + s.out + '\n';
            });
        } else {
            p += 'There is no problem statement: infer what the program is meant to do from the code.\n';
        }
        if (stdin && stdin.trim())
            p += '\nEXTRA INPUT TO TRACE:\n' + stdin + '\n';
        p += '\nSTUDENT CODE:\n```c\n' + code + '\n```\n\n';
        p += 'Reply with these short sections:\n1. **Biên dịch**: errors or warnings you expect (missing semicolons, wrong scanf format, wrong types).\n2. **Chạy thử mẫu**: for each sample, the output you predict, then PASS or FAIL against the expected one. Show the key steps only.\n3. **Lỗi và rủi ro**: int overflow, array size and bounds, off-by-one, uninitialised variables, and whether the speed fits the limits in the statement.\n4. **Cách sửa**: if something is wrong, the smallest change to THEIR code with a one-line reason. Do not write a different full solution and do not reveal the intended algorithm unless the code is already close.\nBe kind and exact, under 350 words.';
        return p;
    }

    async function runReview() {
        var out = document.getElementById('wsOut'), status = document.getElementById('wsStatus');
        var btn = document.getElementById('wsReview'), stop = document.getElementById('wsStop');
        var panel = document.querySelector('[data-key]');
        var key = panel.getAttribute('data-key');
        var code = edit ? edit.getValue() : '', stdin = '';
        if (!code.trim() || code.trim() === STARTER.trim()) {
            out.className = 'result';
            out.innerHTML = '<span class="ph">Write some code first, then ask for a review.</span>';
            return;
        }
        if (code.length > 14000) {
            out.className = 'result err';
            out.textContent = 'The code is over 14,000 characters. Please shorten it or review one function at a time.';
            return;
        }
        var sample = null;
        try {
            sample = window.claude && window.claude.use ? await window.claude.use('sample') : null;
        } catch (e) {
            sample = null;
        }
        if (!sample) {
            out.className = 'result err';
            out.innerHTML = 'Reviews need this page to be open inside Claude. You can still copy your code and paste it into the chat.';
            return;
        }
        var d = null, k = 0;
        if (key !== 'free') {
            var kk = key.split('-');
            d = DATA[+kk[0] - 1];
            k = +kk[1];
        }
        var ctrl = new AbortController();
        running = ctrl;
        btn.disabled = true;
        stop.hidden = false;
        status.textContent = 'Claude is reading your code…';
        out.className = 'result';
        out.innerHTML = '<span class="ph">Thinking…</span>';
        try {
            var res = await sample(buildPrompt(d, k, code, stdin), {
                modelTier: 'complex',
                cache: false,
                signal: ctrl.signal,
                onText: function (t) {
                    out.innerHTML = md(t.text);
                }
            });
out.innerHTML = md(res.text) +
                (res.truncated ? '<p class="ph">The reply was cut short. Ask again with less code.</p>' : '');
            status.textContent = 'Done.';
        } catch (err) {
            if (ctrl.signal.aborted) {
                status.textContent = 'Stopped.';
            } else {
                var code2 = err && err.code;
                out.className = 'result err';
                out.textContent = code2 === 'rate_limited' ? 'Too many reviews in a short time. Wait a minute and try again.'
                    : code2 === 'not_granted' ? 'Review is not allowed for this page. Allow it from the page permissions and try again.'
: 'The review did not finish' +
                        (err && err.message ? ' (' + err.message + ')' : '') + '. Try again.';
                status.textContent = '';
            }
        } finally {
            btn.disabled = false;
            stop.hidden = true;
            running = null;
        }
    }

    function bindWorkspace() {
        var panel = document.querySelector('[data-key]');
        var key = panel.getAttribute('data-key');
        var fs = store.get('lc-fs', 14);
        edit = createEditor(document.getElementById('wsEd'), {
            value: pendingDraft,
            onChange: function (v) {
                store.set('lc-draft-' + key, v);
            },
            onSubmit: runReview,
            onCursor: function (c) {
                var el = document.getElementById('wsPos');
                if (el)
                    el.textContent = 'Ln ' + c.line + ', Col ' + c.col;
            }
        });
        edit.setFont(fs);
        document.getElementById('wsFsDn').addEventListener('click', function () {
            fs = Math.max(11, fs - 1);
            store.set('lc-fs', fs);
            edit.setFont(fs);
        });
        document.getElementById('wsFsUp').addEventListener('click', function () {
            fs = Math.min(22, fs + 1);
            store.set('lc-fs', fs);
            edit.setFont(fs);
        });
        document.getElementById('wsCopy').addEventListener('click', function (ev) {
            copyText(edit.getValue(), ev.currentTarget);
        });
        var armed = false;
        document.getElementById('wsReset').addEventListener('click', function (ev) {
            var b = ev.currentTarget, v = edit.getValue();
            if (v.trim() && v.trim() !== STARTER.trim() && !armed) {
                armed = true;
                b.textContent = 'Click again to clear';
                setTimeout(function () {
                    armed = false;
                    b.textContent = 'Reset';
                }, 2500);
                return;
            }
            armed = false;
            edit.setValue(STARTER);
            b.textContent = 'Reset';
        });
        document.getElementById('wsReview').addEventListener('click', runReview);
        document.getElementById('wsStop').addEventListener('click', function () {
            if (running)
                running.abort();
        });
        document.getElementById('wsPick').addEventListener('change', function (ev) {
            var v = ev.target.value;
            location.hash = v === 'free' ? '#workspace' : '#workspace-' + v;
        });
    }

    /* ---------- router ---------- */
    function setNav(name) {
        document.querySelectorAll('[data-nav]').forEach(function (a) {
            var on = (a.getAttribute('data-nav') === name) || (name === 'day' && a.getAttribute('data-nav') === 'beginner');
            if (on)
                a.setAttribute('aria-current', 'page');
            else
                a.removeAttribute('aria-current');
        });
    }
    function render() {
        if (running) {
            try {
                running.abort();
            } catch (e) {}
        }
        reg = [];
        var h = (location.hash || '#home').slice(1), p = h.split('-'), name = p[0];
        var html;
        if (name === 'beginner')
            html = pageBeginner();
        else if (name === 'day')
            html = pageDay(parseInt(p[1], 10));
        else if (name === 'workspace')
            html = pageWorkspace(parseInt(p[1], 10), parseInt(p[2], 10));
        else {
            name = 'home';
            html = pageHome();
        }
        app.innerHTML = html;
        setNav(name);
        if (name === 'workspace')
            bindWorkspace();
        window.scrollTo(0, 0);
        var t = {
            home: 'Learn C',
            beginner: 'Beginner · Learn C',
            day: 'Day ' + p[1] + ' · Learn C',
            workspace: 'Workspace · Learn C'
        };
        document.title = t[name] || 'Learn C';
    }

    document.addEventListener('click', function (ev) {
        var t = ev.target.closest('[data-copy],[data-go],[data-solved]');
        if (!t)
            return;
        if (t.hasAttribute('data-copy')) {
            copyText(reg[+t.getAttribute('data-copy')] || '', t);
            return;
        }
        if (t.hasAttribute('data-go')) {
            var el = document.getElementById(t.getAttribute('data-go'));
            if (el)
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
        if (t.hasAttribute('data-solved')) {
            var kk = t.getAttribute('data-solved').split('-'), dd = +kk[0], ee = +kk[1];
            var now = !isSolved(dd, ee);
            setSolved(dd, ee, now);
            t.textContent = now ? 'Solved' : 'Mark as solved';
            t.classList.toggle('done', now);
            var card = t.closest('.ex');
            if (card)
                card.classList.toggle('solved', now);
        }
    });
    window.addEventListener('hashchange', render);
    render();
})();
