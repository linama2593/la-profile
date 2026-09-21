document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
      });
    });
  }

  var sections = document.querySelectorAll("section[id]");
  var navAnchors = document.querySelectorAll(".nav-links a[href^='#']");

  if ("IntersectionObserver" in window && sections.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navAnchors.forEach(function (a) {
              a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id);
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (s) { observer.observe(s); });
  }
  /* ---- Email (kept out of the HTML to avoid scrapers) ----
     To change the address, base64-encode the new one (`echo -n "you@example.com" | base64`)
     and replace MAIL below. The link is only wired up on first interaction. */
  var MAIL = "cmV2aXNlci5naXN0c185a0BpY2xvdWQuY29t";
  document.querySelectorAll("[data-mail]").forEach(function (a) {
    function arm() { if (a.getAttribute("href") === "#contact") a.href = "mailto:" + atob(MAIL); }
    ["pointerenter", "focus", "touchstart"].forEach(function (ev) { a.addEventListener(ev, arm, { passive: true }); });
    a.addEventListener("click", function (e) {
      if (a.getAttribute("href") === "#contact") { e.preventDefault(); arm(); window.location.href = a.href; }
    });
  });

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Scroll progress bar + nav shadow ---- */
  var progress = document.querySelector(".progress");
  var nav = document.querySelector(".nav");
  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Scroll reveal ---- */
  var revealSel = ".section-title, .about p, .role-block, .skill-group, .edu-card, .research-sub, .contact p, .contact .cta-row";
  var revealEls = document.querySelectorAll(revealSel);
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el, i) {
      el.classList.add("reveal");
      // slight stagger among siblings in the same grid
      el.style.setProperty("--d", (Array.prototype.indexOf.call(el.parentNode.children, el) % 4) * 0.07 + "s");
      revealObs.observe(el);
    });
  }

  /* ---- Stat counters ---- */
  var statEls = document.querySelectorAll(".stat-num[data-count]");
  function format(el, v) {
    return (el.dataset.prefix || "") + Math.round(v) + (el.dataset.suffix || "");
  }
  if ("IntersectionObserver" in window && !reduceMotion && statEls.length) {
    var statObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target, end = parseFloat(el.dataset.count), t0 = null;
        statObs.unobserve(el);
        function tick(t) {
          if (t0 === null) t0 = t;
          var k = Math.min((t - t0) / 1200, 1);
          el.textContent = format(el, end * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(tick);
        }
        el.textContent = format(el, 0);
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    statEls.forEach(function (el) { statObs.observe(el); });
  }

  /* ---- Hero network background ---- */
  var canvas = document.querySelector(".hero-canvas");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var hero = canvas.parentNode;
    var nodes = [], w = 0, h = 0, dpr = 1, color = "156,107,37", running = false;

    function readColor() {
      var hex = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
      if (/^#[0-9a-f]{6}$/i.test(hex)) {
        color = parseInt(hex.slice(1, 3), 16) + "," + parseInt(hex.slice(3, 5), 16) + "," + parseInt(hex.slice(5, 7), 16);
      }
    }
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.clientWidth; h = hero.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.max(18, Math.min(52, Math.round(w * h / 22000)));
      nodes = [];
      for (var i = 0; i < n; i++) {
        nodes.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, r: 1.5 + Math.random() * 1.5 });
      }
      draw();
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      var maxD = 150;
      for (var i = 0; i < nodes.length; i++) {
        var a = nodes[i];
        for (var j = i + 1; j < nodes.length; j++) {
          var b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < maxD) {
            ctx.strokeStyle = "rgba(" + color + "," + (0.22 * (1 - d / maxD)) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      ctx.fillStyle = "rgba(" + color + ",0.45)";
      nodes.forEach(function (n) { ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 6.2832); ctx.fill(); });
    }
    function step() {
      if (!running) return;
      nodes.forEach(function (n) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      });
      draw();
      requestAnimationFrame(step);
    }

    readColor();
    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      var onScheme = function () { readColor(); draw(); };
      if (mq.addEventListener) mq.addEventListener("change", onScheme);
    }
    resize();
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(resize, 150); });

    if (!reduceMotion && "IntersectionObserver" in window) {
      // animate only while the hero is on screen
      new IntersectionObserver(function (entries) {
        var vis = entries[0].isIntersecting;
        if (vis && !running) { running = true; requestAnimationFrame(step); }
        else if (!vis) { running = false; }
      }).observe(hero);
    }
  }
});
