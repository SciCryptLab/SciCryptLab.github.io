// Marketing-site behaviour:
//  1. Reveal-on-scroll (.reveal → .in-view) via IntersectionObserver.
//  2. Nav dropdowns / mega-menu (hover on desktop, click/keyboard/touch toggle).
//  3. Mobile hamburger.
//  4. Animated mockups: play once when scrolled into view (.anim-play), count-up
//     numbers, the filling integrity ring, the "checks running" sequence, and the
//     cycling hero app-window panel.
// Without JS, content + mockups are fully visible in their final state.

(function () {
  document.documentElement.classList.add("js-ready");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Dynamically load shared theme.js ─────────────────────────────
  (function () {
    var s = document.createElement("script");
    s.src = "assets/js/theme.js";
    s.onload = function () {
      if (window.scicryptTheme) window.scicryptTheme.init();
    };
    document.head.appendChild(s);
  })();

  // ── 1. Reveal-on-scroll ───────────────────────────────────────────
  if (!("IntersectionObserver" in window)) {
    document.documentElement.classList.remove("js-ready");
  } else {
    var revealIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            revealIO.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -80px 0px", threshold: 0.08 }
    );
    document.addEventListener("DOMContentLoaded", function () {
      document.querySelectorAll(".reveal").forEach(function (el) { revealIO.observe(el); });
    });
  }

  // ── helpers ────────────────────────────────────────────────────────
  var currentRunId = 0;
  function countUp(el, target, suffix, tracker) {
    suffix = suffix || "";
    if (reduceMotion) { el.textContent = target + suffix; el.style.color = target >= 70 ? "#34d399" : target >= 40 ? "#fbbf24" : "#f87171"; return; }
    if (tracker && tracker.raf) cancelAnimationFrame(tracker.raf);
    var dur = 900, start = null, from = 0;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(from + (target - from) * eased);
      el.textContent = val + suffix;
      el.style.color = val >= 70 ? "#34d399" : val >= 40 ? "#fbbf24" : "#f87171";
      if (p < 1) { if (tracker) tracker.raf = requestAnimationFrame(step); else requestAnimationFrame(step); }
    }
    if (tracker) tracker.raf = requestAnimationFrame(step); else requestAnimationFrame(step);
  }

  // ── 3. animated mockups: trigger when scrolled into view ───────────
  function playMock(el) {
    var scPane = el.closest(".sc-pane");
    if (scPane && !scPane.classList.contains("active")) return;
    el.classList.add("anim-play");

    // count-up numbers (data-count="87" optional data-suffix)
    el.querySelectorAll("[data-count]").forEach(function (n) {
      countUp(n, parseInt(n.getAttribute("data-count"), 10), n.getAttribute("data-suffix") || "");
    });

    // integrity ring: set --score to its target so the @property tween runs
    if (el.classList.contains("mock-score-ring")) {
      var score = el.getAttribute("data-score") || "87";
      if (reduceMotion) { el.style.setProperty("--score", score + "%"); }
      else { requestAnimationFrame(function () { el.style.setProperty("--score", score + "%"); }); }
    }
    el.querySelectorAll(".mock-score-ring").forEach(function (ring) {
      var s = ring.getAttribute("data-score") || "87";
      requestAnimationFrame(function () { ring.style.setProperty("--score", s + "%"); });
    });

    // checks-running sequence
    if (el.classList.contains("mock-checks") || el.querySelector(".mock-checks")) {
      var box = el.classList.contains("mock-checks") ? el : el.querySelector(".mock-checks");
      runChecks(box);
    }
  }

  function runChecks(box, runId, tracker) {
    var rows = Array.prototype.slice.call(box.querySelectorAll(".mc-row"));
    if (reduceMotion) {
      rows.forEach(function (r) { r.classList.add("done"); });
      box.classList.add("scored");
      var v = box.querySelector(".mc-aggregate .val");
      if (v && v.hasAttribute("data-count")) v.textContent = v.getAttribute("data-count");
      var tagline = box.parentElement.querySelector(".mock-tagline");
      if (tagline) tagline.style.opacity = "1";
      return;
    }
    var i = 0;
    function tick() {
      if (runId !== undefined && runId !== currentRunId) return;
      if (i >= rows.length) {
        box.classList.add("scored");
        var val = box.querySelector(".mc-aggregate .val");
        if (val && val.hasAttribute("data-count")) countUp(val, parseInt(val.getAttribute("data-count"), 10), "", tracker);
        var tagline = box.parentElement.querySelector(".mock-tagline");
        if (tagline) {
          setTimeout(function () {
            if (runId !== undefined && runId !== currentRunId) return;
            tagline.style.transition = "opacity 0.3s ease";
            tagline.style.opacity = "1";
          }, 1500);
        }
        return;
      }
      rows[i].classList.add("done");
      i++;
      setTimeout(tick, 650);
    }
    setTimeout(tick, 500);
  }

  // ── 4. hero app-window: cycle panes on a timer, pause on hover ──────
  function initAppWindow(win) {
    var panes = Array.prototype.slice.call(win.querySelectorAll(".aw-pane"));
    var segs = Array.prototype.slice.call(win.querySelectorAll(".aw-progress .seg"));
    var allTabs = Array.prototype.slice.call(win.querySelectorAll(".aw-tab"));
    if (!panes.length) return;
    var idx = 0, hoverPaused = false, loopTimer = null, safetyTimer = null, clickResumeTimer = null;
    var countUpTracker = { raf: 0 };
    function isPaused() { return hoverPaused || clickResumeTimer !== null; }
    function clearAllTimers() {
      if (loopTimer) { clearTimeout(loopTimer); loopTimer = null; }
      if (safetyTimer) { clearTimeout(safetyTimer); safetyTimer = null; }
      if (clickResumeTimer) { clearTimeout(clickResumeTimer); clickResumeTimer = null; }
    }
    function show(n) {
      idx = n;
      currentRunId++;
      clearAllTimers();
      if (countUpTracker.raf) { cancelAnimationFrame(countUpTracker.raf); countUpTracker.raf = 0; }
      panes.forEach(function (p, k) {
        p.classList.toggle("active", k === n);
        // Stop auto-run on inactive panes
        var repoGraph = p.querySelector(".repo-graph[data-auto-run]");
        if (repoGraph && k !== n) {
          if (!repoGraph._autoRunInit) initRepoGraphAutoRun(repoGraph);
          repoGraph._autoRunStop();
          repoGraph._onCycleComplete = null;
        }
        if (k !== n) return;
        // Start auto-run for SciTrace pane
        if (repoGraph) {
          if (!repoGraph._autoRunInit) initRepoGraphAutoRun(repoGraph);
          repoGraph._autoRunStart();
          // Event-driven advancement: auto-run signals when a cycle completes
          repoGraph._onCycleComplete = function () {
            if (isPaused()) return;
            clearAllTimers();
            advance();
            scheduleNext();
          };
        }
        // Restart check animation (SciVerify)
        var checks = p.querySelector(".mock-checks");
        if (checks) {
          var rows = Array.prototype.slice.call(checks.querySelectorAll(".mc-row"));
          rows.forEach(function (r) { r.classList.remove("done"); });
          checks.classList.remove("scored");
          var val = checks.querySelector(".mc-aggregate .val");
          if (val) val.textContent = "0";
          var tagline = p.querySelector(".mock-tagline");
          if (tagline) tagline.style.opacity = "0";
          runChecks(checks, currentRunId, countUpTracker);
        }
      });
      segs.forEach(function (s, k) { s.classList.toggle("on", k === n); });
      allTabs.forEach(function (t, k) { t.classList.toggle("on", k % 2 === n); });
    }
    function advance() { idx = (idx + 1) % panes.length; show(idx); }
    show(0);

    // Click tabs to switch panes
    allTabs.forEach(function (tab, k) {
      tab.style.cursor = "pointer";
      tab.addEventListener("click", function () {
        clearAllTimers();
        hoverPaused = false;
        show(k % 2);
        clickResumeTimer = setTimeout(function () {
          clickResumeTimer = null;
          if (!hoverPaused) scheduleNext();
        }, 10000);
      });
    });

    if (reduceMotion || panes.length < 2) return;
    function scheduleNext() {
      if (isPaused()) return;
      if (idx === 0) {
        // SciTrace: event-driven (auto-run signals completion). Safety fallback in case auto-run never finishes.
        safetyTimer = setTimeout(function () {
          if (!isPaused()) { advance(); scheduleNext(); }
        }, 18000);
      } else {
        // SciVerify: fixed timer
        loopTimer = setTimeout(function () {
          if (!isPaused()) { advance(); scheduleNext(); }
        }, 5500);
      }
    }
    win.addEventListener("mouseenter", function () { hoverPaused = true; });
    win.addEventListener("mouseleave", function () {
      hoverPaused = false;
      if (isPaused()) return;
      clearAllTimers();
      loopTimer = setTimeout(function () {
        if (!isPaused()) { advance(); scheduleNext(); }
      }, 2500);
    });
    scheduleNext();
  }

  // ── SciTrace carousel: cycle mockup panes with tabs + auto-rotate ──
  function initScitraceCarousel() {
    var carousels = document.querySelectorAll(".scitrace-carousel");
    carousels.forEach(function (car) {
      var panes = Array.prototype.slice.call(car.querySelectorAll(".sc-pane"));
      var tabs = Array.prototype.slice.call(car.querySelectorAll(".sc-tab"));
      var dots = Array.prototype.slice.call(car.querySelectorAll(".sc-dot"));
      if (!panes.length) return;
      var idx = 0, paused = false, loopTimer = null, resumeTimer = null;
      var checksRunId = 0, checksTracker = { raf: 0 };

      function show(n) {
        idx = n;
        checksRunId++;
        var curRunId = checksRunId;
        if (checksTracker.raf) { cancelAnimationFrame(checksTracker.raf); checksTracker.raf = 0; }
        panes.forEach(function (p, k) { p.classList.toggle("active", k === n); });
        tabs.forEach(function (t, k) { t.classList.toggle("active", k === n); });
        dots.forEach(function (d, k) { d.classList.toggle("active", k === n); });
        var pane = panes[n];
        if (pane) {
          var inbox = pane.querySelector(".mock-inbox");
          if (inbox) {
            inbox.classList.remove("anim-play");
            requestAnimationFrame(function () {
              requestAnimationFrame(function () { inbox.classList.add("anim-play"); });
            });
          }
          var checks = pane.querySelector(".mock-checks");
          if (checks) {
            var rows = Array.prototype.slice.call(checks.querySelectorAll(".mc-row"));
            rows.forEach(function (r) { r.classList.remove("done"); });
            checks.classList.remove("scored");
            var val = checks.querySelector(".mc-aggregate .val");
            if (val) val.textContent = "0";
            runChecks(checks, curRunId, checksTracker);
          }
        }
      }

      function scheduleNext() {
        if (loopTimer) clearTimeout(loopTimer);
        loopTimer = setTimeout(function () {
          if (!paused) { show((idx + 1) % panes.length); scheduleNext(); }
        }, 5000);
      }

      car.addEventListener("mouseenter", function () {
        paused = true;
        if (resumeTimer) { clearTimeout(resumeTimer); resumeTimer = null; }
      });
      car.addEventListener("mouseleave", function () {
        paused = false;
        scheduleNext();
      });

      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          var n = parseInt(tab.getAttribute("data-pane"), 10);
          if (isNaN(n)) return;
          if (loopTimer) { clearTimeout(loopTimer); loopTimer = null; }
          if (resumeTimer) { clearTimeout(resumeTimer); resumeTimer = null; }
          paused = true;
          show(n);
          resumeTimer = setTimeout(function () {
            if (paused) { paused = false; scheduleNext(); }
          }, 10000);
        });
      });

      show(0);
      scheduleNext();
    });
  }

  // ── interactive repo graph (click a script to run / rerun) ─────────
  function rgResultLine(d) {
    return '<div class="rg-result">✓ exit 0 · created ' + d.created + ' · new commit ' + d.commit + ' [SciTrace:Run]</div>';
  }
  function rgRerunBtn() {
    return '<div class="rg-rerun"><button type="button">↻ Rerun</button></div>';
  }
  function rgWireRerun(panel, d) {
    var b = panel.querySelector(".rg-rerun button");
    if (b) b.addEventListener("click", function () { rgRunScript(panel, d, true); });
  }
  function rgRunScript(panel, d, isRerun, opts) {
    opts = opts || {};
    panel.removeAttribute("hidden");
    var runId = (panel._runId = (panel._runId || 0) + 1);
    var head = '<div class="rg-cmd">$ ' + d.cmd + "</div>";
    var lines = d.lines.map(function (l) { return '<div class="rg-line">' + l + "</div>"; }).join("");
    if (isRerun) {
      panel.innerHTML = head + lines + '<div class="rg-result">↻ Re-executed — outputs identical, no new commit.</div>' + rgRerunBtn();
      rgWireRerun(panel, d); if (opts.onDone) opts.onDone(); return;
    }
    if (reduceMotion) {
      panel.innerHTML = head + lines + rgResultLine(d) + (opts.auto ? "" : rgRerunBtn());
      if (!opts.auto) rgWireRerun(panel, d);
      if (opts.onDone) opts.onDone();
      return;
    }
    panel.innerHTML = head;
    var i = 0;
    (function next() {
      if (panel._runId !== runId) return;
      if (i < d.lines.length) {
        panel.insertAdjacentHTML("beforeend", '<div class="rg-line">' + d.lines[i] + "</div>");
        i++; setTimeout(next, opts.delay || 430);
      } else {
        if (panel._runId !== runId) return;
        panel.insertAdjacentHTML("beforeend", rgResultLine(d) + (opts.auto ? "" : rgRerunBtn()));
        if (!opts.auto) rgWireRerun(panel, d);
        if (opts.onDone) opts.onDone();
      }
    })();
  }
  function rgShowInfo(panel, name, type) {
    panel.removeAttribute("hidden");
    panel._runId = (panel._runId || 0) + 1;
    panel.innerHTML = '<div class="rg-info"><i class="fas fa-info-circle me-1"></i><strong>' + name + "</strong> — " + type +
      ". In SciTrace you could preview or restore it. Tip: click a script (▶) to run it.</div>";
  }
  function initRepoGraph() {
    document.querySelectorAll(".repo-graph").forEach(function (rg) {
      var panel = rg.querySelector(".rg-panel");
      if (!panel) return;
      rg.querySelectorAll(".rg-node[data-run]").forEach(function (node) {
        node.addEventListener("click", function () {
          var d; try { d = JSON.parse(node.getAttribute("data-run")); } catch (e) { return; }
          rgRunScript(panel, d, false);
        });
      });
      rg.querySelectorAll(".rg-node:not([data-run])").forEach(function (node) {
        node.addEventListener("click", function () {
          rgShowInfo(panel, node.getAttribute("data-name") || node.textContent.trim(), node.getAttribute("data-type") || "file");
        });
      });
    });
  }

  // ── auto-run: cycle through script nodes automatically ──────────────
  function initRepoGraphAutoRun(rg) {
    if (rg._autoRunInit) return;
    rg._autoRunInit = true;

    var panel = rg.querySelector(".rg-panel");
    if (!panel) return;
    var canvas = rg.querySelector(".rg-canvas");
    var edgesSvg = canvas && canvas.querySelector(".rg-edges");
    var scriptNodes = Array.prototype.slice.call(rg.querySelectorAll(".rg-node[data-run]"));
    if (!scriptNodes.length) return;

    rg._autoRunId = 0;
    rg._autoRunIdx = 0;
    rg._autoRunTimer = null;
    rg._dynamicNodes = [];

    var outputDefs = {
      "results/samples_cleaned.csv": { cls: "results", style: "left:85%;top:64%;", edge: 'M 99 64 C 108 64, 125 64, 136 64', name: "samples_cleaned.csv", type: "results" },
      "plots/PCA.png":               { cls: "plots",   style: "left:15%;top:82%;",  edge: 'M 54 64 C 46 68, 32 74, 24 82',   name: "PCA.png",              type: "plots" }
    };

    function clearTimer() {
      if (rg._autoRunTimer) { clearTimeout(rg._autoRunTimer); rg._autoRunTimer = null; }
    }

    function clearDynamicNodes() {
      rg._dynamicNodes.forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); });
      rg._dynamicNodes = [];
    }

    function createOutputNode(def) {
      if (!canvas) return;
      var node = document.createElement("div");
      node.className = "rg-node " + def.cls;
      node.style.cssText = def.style;
      node.setAttribute("data-name", def.name);
      node.setAttribute("data-type", def.type);
      node.textContent = def.name;
      node.classList.add("rg-created");
      // Fade in
      node.style.opacity = "0";
      node.style.transition = "opacity 0.35s ease";
      canvas.appendChild(node);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { node.style.opacity = "1"; });
      });
      // Click handler
      node.addEventListener("click", function () {
        rgShowInfo(panel, def.name, def.type);
      });
      rg._dynamicNodes.push(node);
      // Add edge
      if (edgesSvg && def.edge) {
        var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
        p.setAttribute("d", def.edge);
        p.classList.add("rg-edge-created");
        p.style.opacity = "0";
        p.style.transition = "opacity 0.35s ease";
        edgesSvg.appendChild(p);
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { p.style.opacity = "1"; });
        });
        rg._dynamicNodes.push(p);
      }
    }

    function runNext() {
      var runId = rg._autoRunId;
      clearTimer();

      if (rg._autoRunPausedUntil && Date.now() < rg._autoRunPausedUntil) {
        panel._runId = (panel._runId || 0) + 1;
        panel.innerHTML = '<div class="rg-info"><i class="fas fa-pause me-1"></i><strong>Paused</strong> — resuming soon…</div>';
        rg._autoRunTimer = setTimeout(runNext, 500);
        return;
      }
      if (runId !== rg._autoRunId) return;

      var idx = rg._autoRunIdx || 0;
      if (idx >= scriptNodes.length) {
        panel._runId = (panel._runId || 0) + 1;
        if (!panel.hasAttribute("data-hide-cycle-complete")) {
          panel.innerHTML = '<div class="rg-info"><i class="fas fa-sync-alt me-1"></i><strong>Cycle complete</strong> — restarting…</div>';
        }
        clearDynamicNodes();
        rg._autoRunIdx = 0;
        if (rg._onCycleComplete) rg._onCycleComplete();
        rg._autoRunTimer = setTimeout(runNext, 2200);
        return;
      }

      var d;
      try { d = JSON.parse(scriptNodes[idx].getAttribute("data-run")); } catch (e) { return; }

      scriptNodes.forEach(function (n) { n.classList.remove("rg-auto-running"); });
      scriptNodes[idx].classList.add("rg-auto-running");

      rgRunScript(panel, d, false, {
        auto: true,
        delay: 280,
        onDone: function () {
          if (runId !== rg._autoRunId) return;
          // Create output node if defined
          if (d.created && outputDefs[d.created]) {
            createOutputNode(outputDefs[d.created]);
          }
          rg._autoRunIdx = idx + 1;
          rg._autoRunTimer = setTimeout(runNext, 2200);
        }
      });
    }

    rg._autoRunStart = function () {
      rg._autoRunId++;
      rg._autoRunIdx = 0;
      clearTimer();
      scriptNodes.forEach(function (n) { n.classList.remove("rg-auto-running"); });
      clearDynamicNodes();
      var runId = rg._autoRunId;
      rg._autoRunTimer = setTimeout(function () {
        if (runId === rg._autoRunId) runNext();
      }, 500);
    };

    rg._autoRunStop = function () {
      rg._autoRunId++;
      clearTimer();
      scriptNodes.forEach(function (n) { n.classList.remove("rg-auto-running"); });
      clearDynamicNodes();
      if (panel) { panel._runId = (panel._runId || 0) + 1; panel.innerHTML = '<div class="rg-info"><i class="fas fa-info-circle me-1"></i><strong>Auto-run ready</strong> — scripts will execute in sequence.</div>'; }
    };

    rg.addEventListener("click", function (e) {
      var node = e.target.closest(".rg-node, .rg-panel");
      if (node) {
        rg._autoRunPausedUntil = Date.now() + 10000;
        rg._autoRunId++;
        clearTimer();
        rg._autoRunIdx = 0;
        scriptNodes.forEach(function (n) { n.classList.remove("rg-auto-running"); });
        clearDynamicNodes();
        var runId = rg._autoRunId;
        rg._autoRunTimer = setTimeout(function () {
          if (runId === rg._autoRunId) runNext();
        }, 10500);
      }
    });
  }

  // ── 2. nav: dropdowns, mega-menu, hamburger ────────────────────────
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".marketing-nav .nav-links");
    if (toggle && links) {
      toggle.addEventListener("click", function () {
        var open = links.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var dds = Array.prototype.slice.call(document.querySelectorAll(".nav-item-dd"));
    dds.forEach(function (dd) {
      var trigger = dd.querySelector(".nav-dd-trigger");
      if (!trigger) return;
      trigger.addEventListener("click", function (e) {
        e.preventDefault();
        var open = !dd.classList.contains("open");
        dds.forEach(function (o) { if (o !== dd) { o.classList.remove("open"); var t = o.querySelector(".nav-dd-trigger"); if (t) t.setAttribute("aria-expanded", "false"); } });
        dd.classList.toggle("open", open);
        trigger.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });

    document.addEventListener("click", function (e) {
      if (!e.target.closest(".nav-item-dd")) {
        dds.forEach(function (o) { o.classList.remove("open"); var t = o.querySelector(".nav-dd-trigger"); if (t) t.setAttribute("aria-expanded", "false"); });
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        dds.forEach(function (o) { o.classList.remove("open"); var t = o.querySelector(".nav-dd-trigger"); if (t) t.setAttribute("aria-expanded", "false"); });
      }
    });
  }

  // ── shared nav + footer (injected so every page stays in sync) ─────
  var SCITRACE_FEATURES = [
    ["feature-data-versioning.html", "fa-code-branch", "Native data versioning"],
    ["feature-dataflow-editor.html", "fa-project-diagram", "Dataflow editor"],
    ["feature-provenance-commits.html", "fa-history", "Provenance run records"],
    ["feature-hardware-security.html", "fa-fingerprint", "Hardware security"],
    ["feature-projects-tasks.html", "fa-tasks", "Projects & tasks"],
  ];
  var SCIVERIFY_FEATURES = [
    ["feature-traceability-reproducibility.html", "fa-code-branch", "Traceability & Reproducibility"],
    ["feature-ai-text-detection.html", "fa-robot", "AI-text detection"],
    ["feature-reference-validation.html", "fa-link", "Reference validation"],
    ["feature-author-verification.html", "fa-user-check", "Author verification"],
    ["feature-manipulation-detection.html", "fa-magic", "Manipulation detection"],
  ];
  var USE_CASES = [
    ["for-researchers.html", "fa-flask", "Researchers"],
    ["for-editors.html", "fa-user-tie", "Editors"],
    ["for-reviewers.html", "fa-glasses", "Reviewers"],
    ["for-publishers.html", "fa-building", "Publishers & institutions"],
  ];
  function mmItems(list) {
    return list.map(function (f) {
      return '<a class="mm-item" href="' + f[0] + '"><i class="fas ' + f[1] + '"></i>' +
        '<span class="mm-t">' + f[2] + '</span></a>';
    }).join("");
  }
  function buildChrome() {
    if (document.querySelector(".marketing-nav")) return; // page already has a hard-coded nav
    var active = document.body.getAttribute("data-nav") || "";
    var nav =
      '<nav class="marketing-nav"><div class="container">' +
        '<a class="brand-wm" href="index.html"><span class="brand-text">Sci</span><span class="brand-dot">Crypt</span></a>' +
        '<button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false"><i class="fas fa-bars"></i></button>' +
        '<div class="nav-links">' +
          '<div class="nav-item-dd">' +
            '<button class="nav-dd-trigger' + (active === "features" ? " active" : "") + '" aria-haspopup="true" aria-expanded="false">Features <i class="fas fa-chevron-down caret"></i></button>' +
            '<div class="nav-dropdown nav-megamenu">' +
              '<div class="mm-col"><a class="mm-head" href="features-scitrace.html">SciTrace</a>' + mmItems(SCITRACE_FEATURES) + '</div>' +
              '<div class="mm-col"><a class="mm-head" href="features-sciverify.html">SciVerify</a>' + mmItems(SCIVERIFY_FEATURES) + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="nav-item-dd">' +
            '<button class="nav-dd-trigger' + (active === "usecases" ? " active" : "") + '" aria-haspopup="true" aria-expanded="false">Use cases <i class="fas fa-chevron-down caret"></i></button>' +
            '<div class="nav-dropdown">' + mmItems(USE_CASES) + '</div>' +
          '</div>' +
          '<a href="about.html"' + (active === "about" ? ' class="active"' : "") + '>About</a>' +
          '<a href="demo/index.html" class="demo-cta">Try the demo →</a>' +
          '<button class="theme-toggle-btn" onclick="(function(){var t=localStorage.getItem(\'theme\')||\'dark\';var n=t===\'dark\'?\'light\':\'dark\';localStorage.setItem(\'theme\',n);document.body.classList.toggle(\'theme-light\',n===\'light\');document.documentElement.classList.toggle(\'theme-light\',n===\'light\');setTimeout(function(){if(window.scicryptTheme){window.scicryptTheme.init();window.scicryptTheme.apply(n);}},30);})()" title="Switch theme" style="background:none;border:1px solid rgba(255,255,255,0.15);color:inherit;cursor:pointer;padding:0.45rem 0.65rem;border-radius:0.5rem;font-size:0.95rem;"><i class="fas fa-moon"></i></button>' +
        '</div>' +
      '</div></nav>';

    var footer =
      '<footer class="footer"><div class="container">' +
        '<div>© 2026 SciCrypt — Research-integrity tools for the scholarly record.</div>' +
        '<div>' +
          '<a href="features-scitrace.html">SciTrace</a>' +
          '<a href="features-sciverify.html">SciVerify</a>' +
          '<a href="about.html">About</a>' +
          '<a href="demo/index.html">Demo</a>' +
        '</div>' +
      '</div></footer>';

    document.body.insertAdjacentHTML("afterbegin", nav);
    // Footer: replace an existing one if present, else append.
    var existing = document.querySelector("footer.footer");
    if (existing) existing.outerHTML = footer;
    else {
      var firstScript = document.body.querySelector("script");
      if (firstScript) firstScript.insertAdjacentHTML("beforebegin", footer);
      else document.body.insertAdjacentHTML("beforeend", footer);
    }
  }

  // Inject theme toggle into an already-existing hardcoded marketing nav
  function injectThemeToggle() {
    var container = document.querySelector(".marketing-nav .container");
    if (!container || container.querySelector(".theme-toggle-btn")) return;
    var btn = document.createElement("button");
    btn.className = "theme-toggle-btn";
    btn.title = "Switch theme";
    btn.setAttribute("onclick", "(function(){var t=localStorage.getItem('theme')||'dark';var n=t==='dark'?'light':'dark';localStorage.setItem('theme',n);document.body.classList.toggle('theme-light',n==='light');document.documentElement.classList.toggle('theme-light',n==='light');setTimeout(function(){if(window.scicryptTheme){window.scicryptTheme.init();window.scicryptTheme.apply(n);}},30);})()");
    btn.style.cssText = "background:none;border:1px solid rgba(255,255,255,0.15);color:inherit;cursor:pointer;padding:0.45rem 0.65rem;border-radius:0.5rem;font-size:0.95rem;";
    btn.innerHTML = '<i class="fas fa-moon"></i>';
    var navLinks = container.querySelector(".nav-links");
    if (navLinks) navLinks.appendChild(btn);
    else container.appendChild(btn);
  }

  // ── boot ───────────────────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", function () {
    buildChrome();
    injectThemeToggle();
    initNav();
    initRepoGraph();
    initScitraceCarousel();
    // Ensure theme is applied (in case theme.js hasn't loaded yet)
    function retrySwap(n, delay) {
      if (window.scicryptTheme) {
        window.scicryptTheme.apply(localStorage.getItem("theme") || "dark");
      } else if (n > 0) {
        setTimeout(function () { retrySwap(n - 1, delay); }, delay);
      }
    }
    if (window.scicryptTheme) {
      window.scicryptTheme.init();
      setTimeout(function () { window.scicryptTheme.apply(localStorage.getItem("theme") || "dark"); }, 0);
    } else {
      var saved = localStorage.getItem("theme") || "dark";
      document.body.classList.toggle("theme-light", saved === "light");
      document.documentElement.classList.toggle("theme-light", saved === "light");
      retrySwap(10, 60);
    }
    document.querySelectorAll(".app-window").forEach(initAppWindow);

    var mocks = document.querySelectorAll(".mock-lineage, .mock-inbox, .mock-score-ring, .mock-checks, .score-formula, [data-anim-mock]");
    if ("IntersectionObserver" in window) {
      var mockIO = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { playMock(e.target); mockIO.unobserve(e.target); }
          });
        },
        { rootMargin: "0px 0px -60px 0px", threshold: 0.25 }
      );
      mocks.forEach(function (m) { mockIO.observe(m); });
    } else {
      mocks.forEach(playMock);
    }
  });
})();
