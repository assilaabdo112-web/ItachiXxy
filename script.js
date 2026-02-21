(function() {
    'use strict';

    var rand = function(a, b) { return a + Math.random() * (b - a); };

    /* ═══════════════════════════════════════
       1. CUSTOM CURSOR  — rAF only, no CSS transitions on transform
    ═══════════════════════════════════════ */
    var dot = document.getElementById('cursor-dot');
    var ring = document.getElementById('cursor-ring');
    var mX = -300,
        mY = -300;
    var rX = -300,
        rY = -300;

    window.addEventListener('mousemove', function(e) { mX = e.clientX;
        mY = e.clientY; });
    document.addEventListener('mouseleave', function() { mX = -300;
        mY = -300; });
    document.addEventListener('mousedown', function() { document.body.classList.add('clicking'); });
    document.addEventListener('mouseup', function() { document.body.classList.remove('clicking'); });

    // حجم المؤشر يكبر على العناصر القابلة للنقر
    document.querySelectorAll('a, button, .color-btn, img').forEach(function(el) {
        el.addEventListener('mouseenter', function() { document.body.classList.add('hovering'); });
        el.addEventListener('mouseleave', function() { document.body.classList.remove('hovering'); });
    });

    (function cursorLoop() {
        dot.style.transform = 'translate(' + (mX - 5) + 'px,' + (mY - 5) + 'px)';
        rX += (mX - rX) * 0.13;
        rY += (mY - rY) * 0.13;
        ring.style.transform = 'translate(' + (rX - 17) + 'px,' + (rY - 17) + 'px)';
        requestAnimationFrame(cursorLoop);
    }());


    /* ═══════════════════════════════════════
       2. CURSOR SPARK TRAIL  — canvas
    ═══════════════════════════════════════ */
    var canvas = document.getElementById('spark-canvas');
    var ctx = canvas.getContext('2d');
    var sparks = [];
    var lastSX = -999,
        lastSY = -999;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    window.addEventListener('mousemove', function(e) {
        var dx = e.clientX - lastSX,
            dy = e.clientY - lastSY;
        if (Math.sqrt(dx * dx + dy * dy) < 12) return;
        lastSX = e.clientX;
        lastSY = e.clientY;
        var color = getComputedStyle(document.documentElement).getPropertyValue('--neon').trim();
        for (var i = 0; i < 3; i++) {
            sparks.push({
                x: e.clientX,
                y: e.clientY,
                vx: rand(-1.5, 1.5),
                vy: rand(-2, -0.2),
                life: 1,
                decay: rand(0.025, 0.06),
                size: rand(1.5, 4),
                color: color
            });
        }
    });

    (function sparkLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = sparks.length - 1; i >= 0; i--) {
            var s = sparks[i];
            s.x += s.vx;
            s.y += s.vy;
            s.vy += 0.05;
            s.life -= s.decay;
            if (s.life <= 0) { sparks.splice(i, 1); continue; }
            ctx.save();
            ctx.globalAlpha = s.life * 0.8;
            ctx.fillStyle = s.color;
            ctx.shadowColor = s.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        requestAnimationFrame(sparkLoop);
    }());


    /* ═══════════════════════════════════════
       3. PARTICLES  — رAF per particle
    ═══════════════════════════════════════ */
    var pc = document.getElementById('particles');

    function makeParticle() {
        var el = document.createElement('div');
        el.className = 'particle';
        var size = rand(1.5, 5);
        el.style.width = size + 'px';
        el.style.height = size + 'px';
        el.style.opacity = '0';
        pc.appendChild(el);

        var x = rand(0, window.innerWidth);
        var y = window.innerHeight + 8;
        var speed = rand(30, 85);
        var driftX = rand(-18, 18);
        var life = rand(7000, 15000);
        var born = null;

        (function pframe(ts) {
            if (!born) born = ts;
            var progress = (ts - born) / life;
            if (progress >= 1) {
                if (el.parentNode) pc.removeChild(el);
                setTimeout(makeParticle, rand(0, 1200));
                return;
            }
            var a = progress < .1 ? progress / .1 * .65 : progress > .82 ? (1 - progress) / .18 * .65 : .65;
            x += driftX / 60;
            y -= speed / 60;
            el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
            el.style.opacity = a;
            requestAnimationFrame(pframe);
        }());
    }
    for (var i = 0; i < 55; i++) setTimeout(makeParticle, rand(0, 6000));


    /* ═══════════════════════════════════════
       4. CARD 3D TILT on mouse move
    ═══════════════════════════════════════ */
    var card = document.getElementById('profileCard');
    var cardRect;
    var tiltX = 0,
        tiltY = 0,
        tX = 0,
        tY = 0;
    var cardHidden = false;

    function updateCardRect() { cardRect = card.getBoundingClientRect(); }
    window.addEventListener('resize', updateCardRect);
    setTimeout(updateCardRect, 300);
    setTimeout(updateCardRect, 3000); // after intro ends

    window.addEventListener('mousemove', function(e) {
        if (!cardRect || cardHidden) return;
        var cx = cardRect.left + cardRect.width / 2;
        var cy = cardRect.top + cardRect.height / 2;
        tiltX = -((e.clientY - cy) / (window.innerHeight / 2)) * 7;
        tiltY = ((e.clientX - cx) / (window.innerWidth / 2)) * 7;
    });
    document.addEventListener('mouseleave', function() { tiltX = 0;
        tiltY = 0; });

    (function tiltLoop() {
        tX += (tiltX - tX) * 0.07;
        tY += (tiltY - tY) * 0.07;
        if (!cardHidden) {
            card.style.transform = 'perspective(900px) rotateX(' + tX + 'deg) rotateY(' + tY + 'deg)';
        }
        requestAnimationFrame(tiltLoop);
    }());


    /* ═══════════════════════════════════════
       5. COLOR PICKER
    ═══════════════════════════════════════ */
    document.querySelectorAll('.color-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.color-btn').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            var color = btn.dataset.color;
            var rgb = btn.dataset.rgb;
            document.documentElement.style.setProperty('--neon', color);
            document.documentElement.style.setProperty('--neon-rgb', rgb);
            // تحديث الجسيمات الحالية
            document.querySelectorAll('.particle').forEach(function(p) {
                p.style.background = color;
                p.style.boxShadow = '0 0 5px ' + color;
            });
            // تحديث المؤشر
            dot.style.background = color;
            dot.style.boxShadow = '0 0 16px ' + color + ',0 0 30px ' + color;
            ring.style.borderColor = 'rgba(' + rgb + ',.55)';
        });
    });


    /* ═══════════════════════════════════════
       6. VIDEO CONTROLS
    ═══════════════════════════════════════ */
    var video = document.getElementById('bg-video');
    var playBtn = document.getElementById('play-sound');
    var muteBtn = document.getElementById('toggle-sound');
    var hideBtn = document.getElementById('toggle-profile');

    if (playBtn) {
        playBtn.addEventListener('click', function() {
            video.muted = false;
            video.play()
                .then(function() { playBtn.textContent = '✅ الصوت يعمل'; })
                .catch(function() { playBtn.textContent = '⚠ مرفوض من المتصفح'; });
        });
    }

    if (muteBtn) {
        muteBtn.addEventListener('click', function() {
            video.muted = !video.muted;
            muteBtn.textContent = video.muted ? '🔇 مكتوم' : '🔊 يعمل';
            if (!video.muted) video.play().catch(function() {});
        });
    }

    if (hideBtn) {
        hideBtn.addEventListener('click', function() {
            cardHidden = !cardHidden;
            card.classList.toggle('hidden', cardHidden);
            hideBtn.textContent = cardHidden ? '👁️ إظهار البروفايل' : '👁️ إخفاء البروفايل';
            if (cardHidden) { tX = 0;
                tY = 0;
                card.style.transform = ''; }
            updateCardRect();
        });
    }


    /* ═══════════════════════════════════════
       7. RIPPLE on social links
    ═══════════════════════════════════════ */
    document.querySelectorAll('.social-links a').forEach(function(a) {
        a.addEventListener('click', function(e) {
            var r = document.createElement('div');
            r.className = 'ripple';
            var rect = a.getBoundingClientRect();
            r.style.left = (e.clientX - rect.left - 4) + 'px';
            r.style.top = (e.clientY - rect.top - 4) + 'px';
            a.appendChild(r);
            setTimeout(function() { if (r.parentNode) r.parentNode.removeChild(r); }, 600);
        });
    });


    /* ═══════════════════════════════════════
       8. TYPING BIO
    ═══════════════════════════════════════ */
    var bioLines = [
        'Content Creator & Streamer',
        'SparkZx — Always Live',
        'Creating the future',
        'One frame at a time'
    ];
    var bioEl = document.getElementById('bio-text');
    var bLine = 0,
        bChar = 0,
        bDeleting = false,
        bWait = 0;

    function typeBio() {
        var line = bioLines[bLine];
        if (bWait > 0) { bWait--;
            setTimeout(typeBio, 50); return; }
        if (!bDeleting) {
            bChar++;
            bioEl.textContent = line.slice(0, bChar);
            if (bChar >= line.length) { bDeleting = true;
                bWait = 40;
                setTimeout(typeBio, 50); } else setTimeout(typeBio, rand(55, 110));
        } else {
            bChar--;
            bioEl.textContent = line.slice(0, bChar);
            if (bChar <= 0) { bDeleting = false;
                bLine = (bLine + 1) % bioLines.length;
                bWait = 10;
                setTimeout(typeBio, 50); } else setTimeout(typeBio, 28);
        }
    }
    setTimeout(typeBio, 3300); // بعد انتهاء الإنترو


    /* ═══════════════════════════════════════
       9. COUNT-UP STATS
    ═══════════════════════════════════════ */
    function countUp(el, target) {
        var h2 = el.querySelector('h2');
        if (target === 0) { h2.textContent = '0'; return; }
        var count = 0;
        var step = Math.max(1, Math.ceil(target / 80));
        var iv = setInterval(function() {
            count = Math.min(count + step, target);
            h2.textContent = target >= 10000 ?
                (count / 1000).toFixed(count < 1000 ? 0 : 1) + 'K' :
                count;
            if (count >= target) clearInterval(iv);
        }, 18);
    }

    var statsEl = document.querySelector('.stats');
    var statsStarted = false;

    function triggerStats() {
        if (statsStarted) return;
        statsStarted = true;
        document.querySelectorAll('.stat').forEach(function(s, i) {
            setTimeout(function() {
                s.classList.add('show');
                countUp(s, parseInt(s.dataset.target, 10) || 0);
            }, i * 300);
        });
    }

    if ('IntersectionObserver' in window) {
        var obs = new IntersectionObserver(function(entries) {
            if (entries[0].isIntersecting) { triggerStats();
                obs.disconnect(); }
        }, { threshold: 0.2 });
        obs.observe(statsEl);
    }
    // Fallback: إذا كانت الإحصائيات مرئية مباشرة بدون تمرير
    window.addEventListener('load', function() {
        setTimeout(function() {
            var r = statsEl.getBoundingClientRect();
            if (r.top < window.innerHeight) triggerStats();
        }, 1100);
    });


    /* ═══════════════════════════════════════
       10. LIVE CLOCK
    ═══════════════════════════════════════ */
    var clockTime = document.getElementById('clock-time');
    var clockDate = document.getElementById('clock-date');
    var days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    function updateClock() {
        var d = new Date();
        var h = String(d.getHours()).padStart(2, '0');
        var m = String(d.getMinutes()).padStart(2, '0');
        var s = String(d.getSeconds()).padStart(2, '0');
        clockTime.textContent = h + ':' + m + ':' + s;
        clockDate.textContent = days[d.getDay()] + ' ' + String(d.getDate()).padStart(2, '0') + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
    }
    setInterval(updateClock, 1000);
    updateClock();


    /* ═══════════════════════════════════════
       11. FPS COUNTER
    ═══════════════════════════════════════ */
    var fpsEl = document.getElementById('fps-display');
    var fpsLast = performance.now();
    var fpsCount = 0;

    (function fpsLoop(ts) {
        fpsCount++;
        if (ts - fpsLast >= 1000) {
            fpsEl.textContent = 'FPS  ' + fpsCount;
            fpsCount = 0;
            fpsLast = ts;
        }
        requestAnimationFrame(fpsLoop);
    }(performance.now()));

}());