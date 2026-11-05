(function () {
    'use strict';
    function sg(k, d) {
        try {
            return localStorage.getItem(k) || d
        } catch (e) {
            return d
        }
    }
    function ss(k, v) {
        try {
            localStorage.setItem(k, v)
        } catch (e) {}
    }
    function tidy(src) {
        var d = 0, out = [];
        src.split('\n').forEach(function (l) {
            var t = l.trim();
            if (!t) {
                out.push('');
                return
            }
            if (t[0] === '#') {
                out.push(t);
                return
            }
            var c = t.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\/\/.*$/g, '');
            var ind = Math.max(0, d - (c[0] === '}' ? 1 : 0));
            out.push('    '.repeat(ind) + t);
            d += (c.match(/\{/g) || []).length - (c.match(/\}/g) || []).length;
            if (d < 0)
                d = 0
        });
        return out.join('\n').replace(/\n{3,}/g, '\n\n').replace(/\s+$/, '') + '\n'
    }
    function setVal(ta, v) {
        ta.focus();
        ta.select();
        if (!document.execCommand('insertText', false, v)) {
            ta.value = v;
            ta.dispatchEvent(new Event('input', { bubbles: true }))
        }
    }
    function drag(el, move, cls) {
        el.addEventListener('pointerdown', function (e) {
            e.preventDefault();
            el.setPointerCapture(e.pointerId);
            el.classList.add('drag');
            document.body.classList.add('dragging');
            function mv(ev) {
                move(ev)
            }
            function up() {
                el.classList.remove('drag');
                document.body.classList.remove('dragging');
                el.removeEventListener('pointermove', mv);
                el.removeEventListener('pointerup', up);
                el.removeEventListener('pointercancel', up)
            }
            el.addEventListener('pointermove', mv);
            el.addEventListener('pointerup', up);
            el.addEventListener('pointercancel', up)
        })
    }
    function enhance(ws) {
        if (ws.dataset.x)
            return;
        ws.dataset.x = 1;
        var panels = ws.querySelectorAll(':scope>.panel');
        if (panels.length < 2)
            return;
        var lw = sg('lc-split', '');
        if (lw)
            ws.style.setProperty('--lw', lw);
        var sp = document.createElement('div');
        sp.className = 'splitv';
        sp.setAttribute('role', 'separator');
        sp.setAttribute('aria-label', 'Kéo để đổi độ rộng');
        ws.insertBefore(sp, panels[1]);
        drag(sp, function (e) {
            var r = ws.getBoundingClientRect(), w = Math.min(Math.max(e.clientX - r.left - 7, 260), r.width - 380);
            var v = w + 'px';
            ws.style.setProperty('--lw', v);
            ss('lc-split', v)
        });
        sp.addEventListener('dblclick', function () {
            ws.style.removeProperty('--lw');
            ss('lc-split', '')
        });
        var ed = ws.querySelector('.ed');
        if (ed) {
            var h = sg('lc-edh', '');
            if (h)
                ed.style.height = h + 'px';
            var rz = document.createElement('div');
            rz.className = 'ed-rz';
            rz.setAttribute('role', 'separator');
            rz.setAttribute('aria-label', 'Kéo để đổi chiều cao editor');
            ed.parentNode.insertBefore(rz, ed.nextSibling);
            drag(rz, function (e) {
                var r = ed.getBoundingClientRect(), hh = Math.min(Math.max(e.clientY - r.top, 200), Math.round(window.innerHeight * 1.2));
                ed.style.height = hh + 'px';
                ss('lc-edh', hh);
                window.dispatchEvent(new Event('resize'))
            });
        }
        var tb = ws.querySelector('.cb-top .tb'), ta = ws.querySelector('.ed-ta');
        if (tb && ta) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'cbtn';
            b.textContent = 'Tidy';
            b.title = 'Căn lại thụt lề theo dấu { }';
            b.onclick = function () {
                setVal(ta, tidy(ta.value))
            };
            tb.insertBefore(b, tb.firstChild);
        }
    }
    function scan() {
        document.querySelectorAll('.ws').forEach(enhance)
    }
    new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
    scan();
})();
