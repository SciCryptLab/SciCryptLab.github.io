// Injects the SciCrypt in-app chrome (sidebar + topbar) into demo pages.
// Each demo page declares:
//   <body class="theme-glass" data-app="portal|scitrace|sciverify" data-active="overview">
//     <div id="chrome-sidebar"></div>
//     <main class="main-content">
//       <div id="chrome-topbar"></div>
//       ...page content...
//     </main>
// chrome.js builds the sidebar/topbar from data attributes and the current role
// stored in sessionStorage.

(function () {
  // Dynamically load shared theme.js — apply theme as soon as it loads
  var _themeReady = false;
  (function () {
    var path = window.location.pathname;
    var segments = path.split("/").filter(Boolean);
    var demoIdx = segments.indexOf("demo");
    var depth = demoIdx < 0 ? 0 : segments.length - 1 - demoIdx;
    var s = document.createElement("script");
    s.src = "../".repeat(depth) + "assets/js/theme.js";
    s.onload = function () {
      _themeReady = true;
      if (window.scicryptTheme) window.scicryptTheme.init();
    };
    document.head.appendChild(s);
  })();

  function getRole() {
    return sessionStorage.getItem("demoRole") || "editor";
  }
  function setRole(r) {
    sessionStorage.setItem("demoRole", r);
  }
  function getRoleMeta() {
    const role = getRole();
    return {
      author: { name: "Alex Chen", initial: "A", label: "Researcher", username: "alex-chen" },
      editor: { name: "Maria Torres", initial: "M", label: "Editor", username: "maria-torres" },
      reviewer: { name: "James Park", initial: "J", label: "Reviewer", username: "james-park" },
    }[role];
  }

  // ── Path helpers ───────────────────────────────────────────────────
  function depthToRoot() {
    // Returns the relative path from the current page's directory up to the
    // `site/` root. Number of `../` = number of directory levels between the
    // file's parent and `site/`. We compute it as (segments_after_demo) since
    // `demo/` is a direct child of `site/`.
    const path = window.location.pathname;
    const segments = path.split("/").filter(Boolean); // ["site","demo","<app>",…,"page.html"]
    const demoIdx = segments.indexOf("demo");
    if (demoIdx < 0) return "../";
    // segments.length - 1 is the file; (length - 1) - demoIdx is the depth of
    // the file's directory below `demo/`. Add 1 to also go above `demo/` into `site/`.
    const depth = segments.length - 1 - demoIdx;
    return "../".repeat(depth);
  }

  function assetUrl(rel) {
    return depthToRoot() + "assets/" + rel;
  }
  function demoUrl(rel) {
    return depthToRoot() + "demo/" + rel;
  }
  function rootUrl(rel) {
    return depthToRoot() + rel;
  }

  // ── Sidebar definitions per app + role ─────────────────────────────
  const role = getRole();

  const portalNav = [
    { key: "overview", icon: "fa-th-large", label: "Overview", href: demoUrl("portal/dashboard.html") },
    { key: "profile", icon: "fa-user-cog", label: "Profile", href: demoUrl("portal/profile.html") },
    { key: "settings", icon: "fa-cog", label: "Settings", href: demoUrl("portal/settings.html") },
  ];

  const scitraceAuthorNav = [
    { key: "dashboard", icon: "fa-th-large", label: "Dashboard", href: demoUrl("scitrace/dashboard.html") },
    { key: "projects", icon: "fa-folder", label: "Projects", href: demoUrl("scitrace/projects-list.html") },
    { key: "dataflows", icon: "fa-project-diagram", label: "Dataflows", href: demoUrl("scitrace/dataflow-list.html") },
    { key: "tasks", icon: "fa-tasks", label: "Tasks", href: demoUrl("scitrace/tasks.html") },
  ];

  const sciverifyAuthorNav = [
    { key: "submissions", icon: "fa-file-alt", label: "My Submissions", href: demoUrl("sciverify/author/submissions.html") },
  ];

  const sciverifyEditorNav = [
    { key: "dashboard", icon: "fa-th-large", label: "Editor Dashboard", href: demoUrl("sciverify/editor/dashboard.html") },
  ];

  const sciverifyReviewerNav = [
    { key: "dashboard", icon: "fa-th-large", label: "Reviewer Dashboard", href: demoUrl("sciverify/reviewer/dashboard.html") },
  ];

  function navFor(app, role) {
    if (app === "portal") return portalNav;
    if (app === "scitrace") return scitraceAuthorNav;
    if (app === "sciverify") {
      if (role === "editor") return sciverifyEditorNav;
      if (role === "reviewer") return sciverifyReviewerNav;
      return sciverifyAuthorNav;
    }
    return [];
  }

  // ── Build sidebar HTML ─────────────────────────────────────────────
  function buildSidebar() {
    const body = document.body;
    const app = body.dataset.app || "portal";
    const active = body.dataset.active || "";
    const role = getRole();
    const nav = navFor(app, role);

    // Brand label depends on app
    const brandMap = {
      portal: ["Sci", "Crypt"],
      scitrace: ["Sci", "Trace"],
      sciverify: ["Sci", "Verify"],
    };
    const [b1, b2] = brandMap[app] || brandMap.portal;

    // Logo image depends on app
    const logoMap = {
      portal: "img/scicrypt-mark.png",
      scitrace: "img/scitrace-logo.png",
      sciverify: "img/sciverify-logo.png",
    };
    const logoImg = logoMap[app] || logoMap.portal;

    let appNav = "";
    nav.forEach((item) => {
      const cls = active === item.key ? "nav-link active" : "nav-link";
      appNav += `
        <li class="nav-item">
          <a class="${cls}" href="${item.href}">
            <i class="fas ${item.icon}"></i> ${item.label}
          </a>
        </li>`;
    });

    // Cross-app shortcuts (matches portal/templates/base.html structure)
    const showSciTraceLink = role === "author";
    const crossLinks = `
      <hr class="my-3 sidebar-divider">
      <p class="text-uppercase fw-semibold mb-2 sidebar-section-label">Applications</p>
      <ul class="nav flex-column">
        <li class="nav-item">
          <a class="nav-link" href="${demoUrl("portal/dashboard.html")}">
            <i class="fas fa-home"></i> SciCrypt
          </a>
        </li>
        ${showSciTraceLink ? `
        <li class="nav-item">
          <a class="nav-link" href="${demoUrl("scitrace/dashboard.html")}">
            <i class="fas fa-share-alt"></i> SciTrace
          </a>
        </li>` : ""}
        <li class="nav-item">
          <a class="nav-link" href="${demoUrl(role === "editor" ? "sciverify/editor/dashboard.html" : role === "reviewer" ? "sciverify/reviewer/dashboard.html" : "sciverify/author/submissions.html")}">
            <i class="fas fa-check-circle"></i> SciVerify
          </a>
        </li>
      </ul>`;

    const html = `
      <div class="px-4 pt-4 pb-4 h-100 d-flex flex-column">
        <div class="mb-4">
          <a class="navbar-brand" href="${demoUrl("portal/dashboard.html")}">
            <div class="logo-icon">
              <img src="${assetUrl(logoImg)}" alt="SciCrypt">
            </div>
            <span class="brand-wordmark"><span class="brand-text">${b1}</span><span class="brand-dot">${b2}</span></span>
          </a>
        </div>
        <ul class="nav flex-column">
          ${appNav}
        </ul>
        ${crossLinks}
        <div class="mt-auto">
          <hr class="my-3 sidebar-divider">
          <ul class="nav flex-column">
            <li class="nav-item">
              <button class="nav-link theme-toggle-btn" onclick="(function(){var t=localStorage.getItem('theme')||'dark';var n=t==='dark'?'light':'dark';localStorage.setItem('theme',n);document.body.classList.toggle('theme-light',n==='light');document.documentElement.classList.toggle('theme-light',n==='light');setTimeout(function(){if(window.scicryptTheme){window.scicryptTheme.init();window.scicryptTheme.apply(n);}},30);})()" title="Switch theme" style="background:none;border:none;width:100%;text-align:left;cursor:pointer;">
                <i class="fas fa-moon"></i> <span>Toggle theme</span>
              </button>
            </li>
          </ul>
          <hr class="my-3 sidebar-divider">
          <ul class="nav flex-column">
            <li class="nav-item">
              <a class="nav-link" href="${rootUrl("index.html")}">
                <i class="fas fa-arrow-left"></i> Back to main site
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="${demoUrl("portal/login.html")}" onclick="sessionStorage.removeItem('demoRole');">
                <i class="fas fa-sign-out-alt"></i> Logout
              </a>
            </li>
          </ul>
        </div>
      </div>`;

    const sidebar = document.getElementById("chrome-sidebar");
    if (sidebar) {
      sidebar.className = "sidebar";
      sidebar.innerHTML = html;
    }

    if (!document.querySelector(".sidebar-backdrop")) {
      const backdrop = document.createElement("div");
      backdrop.className = "sidebar-backdrop";
      document.body.appendChild(backdrop);
    }
  }

  // ── Mobile sidebar toggle setup ────────────────────────────────────
  function setupMobileSidebar() {
    const toggle = document.getElementById("sidebar-toggle-btn");
    const backdrop = document.querySelector(".sidebar-backdrop");
    const sidebar = document.getElementById("chrome-sidebar");

    if (toggle) {
      toggle.addEventListener("click", function () {
        document.body.classList.toggle("sidebar-open");
      });
    }

    if (backdrop) {
      backdrop.addEventListener("click", function () {
        document.body.classList.remove("sidebar-open");
      });
    }

    if (sidebar) {
      sidebar.addEventListener("click", function (e) {
        if (e.target.closest("a.nav-link")) {
          document.body.classList.remove("sidebar-open");
        }
      });
    }
  }

  // ── Build topbar HTML ──────────────────────────────────────────────
  function buildTopbar() {
    const meta = getRoleMeta();
    const html = `
      <nav class="navbar navbar-expand-lg navbar-light top-navbar mb-4">
        <div class="container-fluid">
          <div class="d-flex align-items-center">
            <button class="sidebar-toggle" id="sidebar-toggle-btn" type="button" title="Menu">
              <i class="fas fa-bars"></i>
            </button>
            <button class="btn btn-outline-secondary btn-sm me-2" type="button" onclick="window.history.back()" title="Back">
              <i class="fas fa-arrow-left"></i>
            </button>
            <button class="btn btn-outline-secondary btn-sm me-3" type="button" onclick="window.history.forward()" title="Forward">
              <i class="fas fa-arrow-right"></i>
            </button>
            <div class="search-box">
              <input type="text" class="form-control border-0 bg-transparent" placeholder="Search..." style="width: 280px;" disabled>
            </div>
          </div>
          <div class="d-flex align-items-center">
            <div class="notification-bell me-3" title="Notifications">
              <i class="fas fa-bell fa-lg text-muted"></i>
              <span class="notification-badge">3</span>
            </div>
            <div class="user-profile">
              <div class="user-avatar me-2">${meta.initial}</div>
              <div class="d-flex flex-column">
                <span class="fw-bold" style="font-size: 0.95rem;">${meta.name}</span>
                <small class="text-muted">${meta.label}</small>
              </div>
            </div>
          </div>
        </div>
      </nav>`;
    const topbar = document.getElementById("chrome-topbar");
    if (topbar) topbar.innerHTML = html;
  }

  // ── Demo ribbon and overlay ────────────────────────────────────────
  function buildDemoRibbon() {
    if (document.querySelector(".demo-ribbon")) return;
    const r = document.createElement("div");
    r.className = "demo-ribbon";
    r.textContent = "Demo — no real data";
    document.body.appendChild(r);
  }

  function buildOverlay() {
    if (document.getElementById("demo-overlay")) return;
    const o = document.createElement("div");
    o.id = "demo-overlay";
    o.innerHTML = `
      <div class="overlay-box">
        <div class="spinner-border mb-3" role="status"></div>
        <div id="demo-overlay-msg" style="font-weight:600;">Working…</div>
      </div>`;
    document.body.appendChild(o);
  }

  window.demoOverlay = {
    show: function (msg) {
      buildOverlay();
      document.getElementById("demo-overlay-msg").textContent = msg || "Working…";
      document.getElementById("demo-overlay").classList.add("active");
    },
    hide: function () {
      const o = document.getElementById("demo-overlay");
      if (o) o.classList.remove("active");
    },
  };

  // Expose role helpers globally
  window.demoChrome = { getRole, setRole, getRoleMeta, depthToRoot, assetUrl, demoUrl, rootUrl };

  // Boot
  document.addEventListener("DOMContentLoaded", function () {
    buildSidebar();
    buildTopbar();
    setupMobileSidebar();
    buildDemoRibbon();
    buildOverlay();
    // Apply saved theme after sidebar is built.
    // Second pass: retry until theme.js is available to catch JS-generated content
    // (e.g. demo-data.js renders) that may have been created after theme.js init.
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
      // theme.js hasn't loaded yet — apply body class now, retry swap later
      var saved = localStorage.getItem("theme") || "dark";
      document.body.classList.toggle("theme-light", saved === "light");
      document.documentElement.classList.toggle("theme-light", saved === "light");
      retrySwap(10, 60);
    }
  });
})();
