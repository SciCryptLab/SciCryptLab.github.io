// Form interception, fake "Re-run" spinners, role-aware redirects.

(function () {
  function show(msg) { if (window.demoOverlay) window.demoOverlay.show(msg); }
  function hide() { if (window.demoOverlay) window.demoOverlay.hide(); }

  document.addEventListener("submit", function (e) {
    const form = e.target;
    const target = form.getAttribute("data-demo-redirect");
    if (target == null) return;
    e.preventDefault();
    show(form.getAttribute("data-demo-msg") || "Submitting…");
    setTimeout(function () {
      window.location.href = target;
    }, 700);
  });

  document.addEventListener("click", function (e) {
    const a = e.target && e.target.closest && e.target.closest("[data-demo-redirect]");
    if (a && a.tagName === "A") {
      e.preventDefault();
      show(a.getAttribute("data-demo-msg") || "Loading…");
      setTimeout(function () { window.location.href = a.getAttribute("data-demo-redirect"); }, 500);
      return;
    }
    const btn = e.target && e.target.closest && e.target.closest("[data-demo-rerun]");
    if (btn) {
      e.preventDefault();
      const orig = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Re-running…';
      setTimeout(function () {
        btn.innerHTML = '<i class="fas fa-check me-1"></i>Re-run complete';
        setTimeout(function () {
          btn.disabled = false;
          btn.innerHTML = orig;
          // Briefly flash the card containing this button
          const card = btn.closest(".card");
          if (card) {
            card.classList.add("fade-in");
            setTimeout(function () { card.classList.remove("fade-in"); }, 400);
          }
        }, 800);
      }, 900);
    }
  });

  // Role login shortcuts on Portal login page
  window.demoLoginAs = function (role) {
    sessionStorage.setItem("demoRole", role);
    const dest = window.demoChrome.demoUrl("portal/dashboard.html");
    show("Signing in as " + role + "…");
    setTimeout(function () { window.location.href = dest; }, 600);
  };

  // Open-app helpers from Portal dashboard
  window.demoOpen = function (app) {
    const role = sessionStorage.getItem("demoRole") || "editor";
    let dest;
    if (app === "scitrace") {
      dest = window.demoChrome.demoUrl("scitrace/dashboard.html");
    } else if (app === "sciverify") {
      if (role === "editor") dest = window.demoChrome.demoUrl("sciverify/editor/dashboard.html");
      else if (role === "reviewer") dest = window.demoChrome.demoUrl("sciverify/reviewer/dashboard.html");
      else dest = window.demoChrome.demoUrl("sciverify/author/submissions.html");
    }
    show("Opening " + app + "…");
    setTimeout(function () { window.location.href = dest; }, 500);
  };
})();
