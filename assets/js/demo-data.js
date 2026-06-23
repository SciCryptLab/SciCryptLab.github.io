// Single shared fixture. Every demo screen reads from this object so that
// role-switching is internally consistent.
//
// Theme: a simple, generic WATER-QUALITY study — comparing three river
// sampling sites. All data is synthetic.

window.DEMO = (function () {
  const project = {
    id: 1,
    name: "Water quality analysis",
    description:
      "Compares basic water-quality indicators across three river sampling sites. All data is synthetic.",
    status: "ongoing",
    created_at: "2026-02-14",
    admin: "Alex Chen",
    collaborators: ["S. Bose (TU Munich)", "K. Iyer (CNRS Grenoble)", "Maria Torres"],
  };

  const tasks = [
    { id: 1, title: "Collect raw water samples", assignee: "Alex Chen", priority: "medium", status: "done", deadline: "2026-03-04", project_id: 1 },
    { id: 2, title: "Calibrate the analysis pipeline against a reference sample", assignee: "Alex Chen", priority: "urgent", status: "ongoing", deadline: "2026-05-21", project_id: 1 },
    { id: 3, title: "Draft figures 1–4 for manuscript", assignee: "Alex Chen", priority: "medium", status: "ongoing", deadline: "2026-06-12", project_id: 1 },
    { id: 4, title: "Resolve referee comment about Figure 3", assignee: "Alex Chen", priority: "low", status: "pending", deadline: "2026-06-30", project_id: 1 },
  ];

  // Vis.js dataflow nodes — repo view (directory tree)
  const repoNodes = [
    { id: "root", label: "river-water-quality", group: "root"},
    { id: "raw_data", label: "raw_data/", group: "raw"},
    { id: "scripts", label: "scripts/", group: "scripts"},
    { id: "results", label: "results/", group: "results"},
    { id: "plots", label: "plots/", group: "plots"},
    { id: "raw1", label: "site_A_upstream.csv", group: "raw"},
    { id: "raw2", label: "site_B_midstream.csv", group: "raw"},
    { id: "raw3", label: "site_C_downstream.csv", group: "raw"},
    { id: "calib", label: "analysis_parameters.json", group: "raw"},
    { id: "scr_proc", label: "filter_and_clean_samples.py", group: "scripts"},
    { id: "scr_fit", label: "compute_site_statistics.py", group: "scripts"},
    { id: "scr_plot", label: "generate_figures.py", group: "scripts"},
    { id: "res_t", label: "samples_cleaned.csv", group: "results"},
    { id: "res_fit", label: "site_statistics.json", group: "results"},
    { id: "plot_fig1", label: "pH_by_site.png", group: "plots"},
    { id: "plot_fig2", label: "contaminant_by_site.png", group: "plots"},
    { id: "plot_fig3", label: "contaminant_vs_temperature.png", group: "plots"},
    { id: "plot_fig4", label: "results_summary.png", group: "plots"},
  ];
  const repoEdges = [
    { from: "root", to: "raw_data" }, { from: "root", to: "scripts" },
    { from: "root", to: "results" }, { from: "root", to: "plots" },
    { from: "raw_data", to: "raw1" }, { from: "raw_data", to: "raw2" },
    { from: "raw_data", to: "raw3" }, { from: "raw_data", to: "calib" },
    { from: "scripts", to: "scr_proc" },
    { from: "scripts", to: "scr_fit" }, { from: "scripts", to: "scr_plot" },
    { from: "results", to: "res_t" }, { from: "results", to: "res_fit" },
    { from: "plots", to: "plot_fig1" }, { from: "plots", to: "plot_fig2" },
    { from: "plots", to: "plot_fig3" }, { from: "plots", to: "plot_fig4" },
  ];

  // Vis.js lifecycle nodes — operation-level data flow with manipulation risk classification
  const lifecycleNodes = [
    // Raw inputs
    { id: "ls1", label: "site_A_upstream.csv", type: "raw_data" },
    { id: "ls2", label: "site_B_midstream.csv", type: "raw_data" },
    { id: "ls3", label: "site_C_downstream.csv", type: "raw_data" },
    // import_and_merge_samples.py operations
    { id: "lload_read", label: "Read site CSV files", type: "processing", script: "import_and_merge_samples.py" },
    { id: "lload_merge", label: "Merge into single dataset", type: "processing", script: "import_and_merge_samples.py" },
    { id: "lload_out", label: "merged_raw_samples.csv", type: "output" },
    // filter_and_clean_samples.py operations
    { id: "lclean_read", label: "Read merged data", type: "processing", script: "filter_and_clean_samples.py" },
    { id: "lclean_outlier", label: "Detect outliers", type: "processing", risk: "warn", rationale: "implicit", note: "Outlier handling rule not parameterised", script: "filter_and_clean_samples.py" },
    { id: "lclean_drop", label: "Remove uncalibrated column", type: "processing", risk: "critical", rationale: "implicit", note: "Removed pH column without justification", script: "filter_and_clean_samples.py" },
    { id: "lclean_filter", label: "Apply range filters", type: "processing", script: "filter_and_clean_samples.py" },
    { id: "lclean_out", label: "samples_cleaned.csv", type: "output" },
    // compute_site_statistics.py operations
    { id: "lanalyze_read", label: "Read cleaned data", type: "processing", script: "compute_site_statistics.py" },
    { id: "lanalyze_stats", label: "Compute per-site statistics", type: "processing", script: "compute_site_statistics.py" },
    { id: "lanalyze_out", label: "site_statistics.json", type: "output" },
    // generate_figures.py operations
    { id: "lplot_read", label: "Read dataset for plotting", type: "processing", script: "generate_figures.py" },
    { id: "lplot_gen", label: "Generate 4 figures", type: "visualization", script: "generate_figures.py" },
    { id: "lplot_fig1", label: "pH_by_site.png", type: "output" },
    { id: "lplot_fig2", label: "contaminant_by_site.png", type: "output" },
    { id: "lplot_fig3", label: "contaminant_vs_temperature.png", type: "output" },
    { id: "lplot_fig4", label: "results_summary.png", type: "output" },
  ];
  const lifecycleEdges = [
    // Raw inputs → import_and_merge_samples.py
    { from: "ls1", to: "lload_read" }, { from: "ls2", to: "lload_read" },
    { from: "ls3", to: "lload_read" },
    // import_and_merge_samples.py internal flow
    { from: "lload_read", to: "lload_merge" }, { from: "lload_merge", to: "lload_out" },
    // import_and_merge_samples.py output → filter_and_clean_samples.py
    { from: "lload_out", to: "lclean_read" },
    // filter_and_clean_samples.py internal flow
    { from: "lclean_read", to: "lclean_outlier" }, { from: "lclean_outlier", to: "lclean_drop" },
    { from: "lclean_drop", to: "lclean_filter" }, { from: "lclean_filter", to: "lclean_out" },
    // filter_and_clean_samples.py output → compute_site_statistics.py and generate_figures.py
    { from: "lclean_out", to: "lanalyze_read" }, { from: "lclean_out", to: "lplot_read" },
    // compute_site_statistics.py internal flow
    { from: "lanalyze_read", to: "lanalyze_stats" }, { from: "lanalyze_stats", to: "lanalyze_out" },
    // compute_site_statistics.py output → generate_figures.py
    { from: "lanalyze_out", to: "lplot_read" },
    // generate_figures.py internal flow
    { from: "lplot_read", to: "lplot_gen" },
    { from: "lplot_gen", to: "lplot_fig1" }, { from: "lplot_gen", to: "lplot_fig2" },
    { from: "lplot_gen", to: "lplot_fig3" }, { from: "lplot_gen", to: "lplot_fig4" },
  ];

  const commits = [
    {
      sha: "a8f3c2d", short: "a8f3c2d", author: "Alex Chen", date: "2026-05-28 14:21",
      message: "Update Figure 3 colour palette for accessibility",
      changed: ["plots/contaminant_vs_temperature.png", "scripts/generate_figures.py"],
    },
    {
      sha: "1c0f5aa", short: "1c0f5aa", author: "Alex Chen", date: "2026-05-24 09:33",
      message: "Tighten outlier rule in filter_and_clean_samples.py",
      changed: ["scripts/filter_and_clean_samples.py"],
    },
    {
      sha: "0a1b2c3", short: "0a1b2c3", author: "Alex Chen", date: "2026-05-21 10:00",
      message: "Initial commit — scaffold dataflow", changed: ["README.md", "metadata.json"],
    },
  ];

  const scriptCommits = {
    scr_proc: {
      sha: "9b8e002", short: "9b8e002", author: "Alex Chen",
      message: "[SciTrace:Run] filter_and_clean_samples.py",
      run_record: {
        scitrace_version: "1.0",
        run_id: "d5c9e2b",
        command: "python scripts/filter_and_clean_samples.py",
        working_directory: "/data/river-water-quality",
        status: "success",
        exit_code: 0,
        start_time: "2026-05-22T15:58:30Z",
        end_time: "2026-05-22T16:01:05Z",
        duration_sec: 155,
        inputs: ["raw_data/site_A_upstream.csv", "raw_data/site_B_midstream.csv", "raw_data/site_C_downstream.csv", "raw_data/analysis_parameters.json"],
        outputs: ["results/samples_cleaned.csv"],
        resources: { cpu_peak_percent: 45.1, cpu_user_sec: 22.7, memory_peak_mb: 128.3, memory_avg_mb: 95.6, disk_io_mb: 67.2 },
      },
      changed: ["results/samples_cleaned.csv"],
    },
    scr_fit: {
      sha: "4e2a917", short: "4e2a917", author: "Alex Chen",
      message: "[SciTrace:Run] compute_site_statistics.py",
      run_record: {
        scitrace_version: "1.0",
        run_id: "b3e7f4a",
        command: "python scripts/compute_site_statistics.py",
        working_directory: "/data/river-water-quality",
        status: "success",
        exit_code: 0,
        start_time: "2026-05-26T17:52:00Z",
        end_time: "2026-05-26T17:55:12Z",
        duration_sec: 192,
        inputs: ["results/samples_cleaned.csv"],
        outputs: ["results/site_statistics.json"],
        resources: { cpu_peak_percent: 62.3, cpu_user_sec: 38.1, memory_peak_mb: 256.8, memory_avg_mb: 189.4, disk_io_mb: 42.6 },
      },
      changed: ["results/site_statistics.json"],
    },
    scr_plot: {
      sha: "7d11b9e", short: "7d11b9e", author: "Alex Chen",
      message: "[SciTrace:Run] generate_figures.py",
      run_record: {
        scitrace_version: "1.0",
        run_id: "f8a2c1d",
        command: "python scripts/generate_figures.py",
        working_directory: "/data/river-water-quality",
        status: "success",
        exit_code: 0,
        start_time: "2026-05-27T11:05:10Z",
        end_time: "2026-05-27T11:08:07Z",
        duration_sec: 177,
        inputs: ["results/samples_cleaned.csv", "results/site_statistics.json"],
        outputs: ["plots/pH_by_site.png", "plots/contaminant_by_site.png", "plots/contaminant_vs_temperature.png", "plots/results_summary.png"],
        resources: { cpu_peak_percent: 87.5, cpu_user_sec: 45.2, memory_peak_mb: 512.4, memory_avg_mb: 380.2, disk_io_mb: 181.1 },
      },
      changed: ["plots/pH_by_site.png", "plots/contaminant_by_site.png", "plots/contaminant_vs_temperature.png", "plots/results_summary.png"],
    },
  };

  // ── SciVerify: manuscript fixture ─────────────────────────────────
  const manuscript = {
    title: "Comparing water quality across three river sampling sites",
    journal: "Journal of Environmental Science",
    manuscript_type: "Paper",
    submitted_at: "2026-05-30",
    status: "submitted",
    abstract:
      "We compare basic water-quality indicators — pH, turbidity, and a model contaminant — across three river sampling sites using a synthetic-data pipeline. Measurements show clear differences between sites, with the downstream site showing the highest contaminant concentration.",
    keywords: ["water quality", "environmental analysis", "water quality monitoring"],
  };
  const authors = [
    { first: "Alex", last: "Chen", email: "alex.chen@uni-heidelberg.de", institution: "University of Heidelberg", country: "DE", orcid: "0000-0002-0000-0001", corresponding: true, openalex: { existence: 92, linkage: 95, field_match: 88, status: "pass", concepts: ["Environmental science", "Water quality", "Analytical chemistry"] } },
    { first: "Saanvi", last: "Bose", email: "sbose@example.org", institution: "TU Munich", country: "DE", orcid: "0000-0003-0000-0002", corresponding: false, openalex: { existence: 78, linkage: 62, field_match: 70, status: "partial", concepts: ["Hydrology", "Chemistry"] } },
    { first: "Kunal", last: "Iyer", email: "iyer@example.org", institution: "CNRS Grenoble", country: "FR", orcid: null, corresponding: false, openalex: { existence: 18, linkage: 12, field_match: 22, status: "fail", note: "No verifiable scholarly footprint matching the manuscript topic.", concepts: [] } },
  ];

  const figures = [
    { id: 1, type: "Figure", number: 1, caption: "Measured pH at each sampling site.", dataflow_id: 1, node: "plots/pH_by_site.png" },
    { id: 2, type: "Figure", number: 2, caption: "Contaminant concentration across the three sites.", dataflow_id: 1, node: "plots/contaminant_by_site.png" },
    { id: 3, type: "Figure", number: 3, caption: "Contaminant concentration vs. water temperature.", dataflow_id: 1, node: "plots/contaminant_vs_temperature.png" },
    { id: 4, type: "Figure", number: 4, caption: "Summary of results across sites.", dataflow_id: 1, node: "plots/results_summary.png" },
  ];

  // References (~25, mixed statuses) — water / environmental science theme
  // The `score` per reference is DERIVED from `status` and the matching-signal coverage
  // (how many of the bibliographic fields resolved). Hand-typed scores have been removed.
  const REF_STATUS_BASE = { matched: 92, partial: 60, mismatched: 25, invalid: 5, no_doi: 35 };
  function refDerivedScore(status, signal) {
    const base = REF_STATUS_BASE[status] != null ? REF_STATUS_BASE[status] : 50;
    const fields = signal ? Object.values(signal).reduce((a, v) => a + v, 0) : 0;
    const coverage = fields / 5;
    return Math.max(0, Math.min(100, Math.round(base * (0.6 + 0.4 * coverage))));
  }
  function mkRef(n, status, opts) {
    const signals = {
      matched: { author: 1, title: 1, year: 1, journal: 1, volume: 1 },
      partial: { author: 1, title: 1, year: 0, journal: 1, volume: 0 },
      mismatched: { author: 0, title: 0, year: 1, journal: 0, volume: 0 },
      invalid: { author: 0, title: 0, year: 0, journal: 0, volume: 0 },
      no_doi: { author: 1, title: 1, year: 1, journal: 1, volume: 0 },
    }[status];
    return {
      idx: n,
      raw: opts.raw,
      doi: opts.doi || null,
      status,
      signal: signals,
      note: opts.note || "",
    };
  }
  const references = [
    mkRef(1, "matched", { raw: "Schwarzenbach, R. P. et al. The challenge of micropollutants in aquatic systems. Science 313, 1072–1077 (2006).", doi: "10.1126/science.1127291" }),
    mkRef(2, "matched", { raw: "Vörösmarty, C. J. et al. Global threats to human water security and river biodiversity. Nature 467, 555–561 (2010).", doi: "10.1038/nature09440" }),
    mkRef(3, "matched", { raw: "Schwarzenbach, R. P., Egli, T., Hofstetter, T. B., von Gunten, U. & Wehrli, B. Global water pollution and human health. Annu. Rev. Environ. Resour. 35, 109–136 (2010).", doi: "10.1146/annurev-environ-100809-125342" }),
    mkRef(4, "matched", { raw: "Richardson, S. D. & Ternes, T. A. Water analysis: emerging contaminants and current issues. Anal. Chem. 90, 398–428 (2018).", doi: "10.1021/acs.analchem.7b04577" }),
    mkRef(5, "matched", { raw: "Loos, R. et al. EU-wide survey of polar organic persistent pollutants in European river waters. Environ. Pollut. 157, 561–568 (2009).", doi: "10.1016/j.envpol.2008.09.020" }),
    mkRef(6, "matched", { raw: "Kolpin, D. W. et al. Pharmaceuticals, hormones, and other organic wastewater contaminants in U.S. streams. Environ. Sci. Technol. 36, 1202–1211 (2002).", doi: "10.1021/es011055j" }),
    mkRef(7, "matched", { raw: "Hering, D. et al. The European Water Framework Directive at the age of 10. Sci. Total Environ. 408, 4007–4019 (2010).", doi: "10.1016/j.scitotenv.2010.05.031" }),
    mkRef(8, "matched", { raw: "Wagner, M. et al. Microplastics in freshwater ecosystems: what we know and what we need to know. Environ. Sci. Eur. 26, 12 (2014).", doi: "10.1186/s12302-014-0012-7" }),
    mkRef(9, "matched", { raw: "von Gunten, U. Oxidation processes in water treatment: are we on track? Environ. Sci. Technol. 52, 5062–5075 (2018).", doi: "10.1021/acs.est.8b00586" }),
    mkRef(10, "partial", { raw: "Petrie, B., Barden, R. & Kasprzyk-Hordern, B. A review on emerging contaminants in wastewaters and the environment. Water Res. (2015).", doi: "10.1016/j.watres.2014.08.053", note: "Year and volume omitted by author; otherwise matched on Crossref." }),
    mkRef(11, "partial", { raw: "Boxall, A. B. A. et al. Pharmaceuticals and personal care products in the environment: what are the big questions? Environ. Health Perspect. 120, 1221–1229 (2012).", doi: "10.1289/ehp.1104477", note: "Author list truncated in manuscript; Crossref returned full list." }),
    mkRef(12, "partial", { raw: "Reemtsma, T. et al. Mind the gap: persistent and mobile organic compounds in water. Environ. Sci. Technol. (2016).", doi: "10.1021/acs.est.6b03338", note: "Year given as 2016 but article volume missing." }),
    mkRef(13, "matched", { raw: "Lapworth, D. J., Baran, N., Stuart, M. E. & Ward, R. S. Emerging organic contaminants in groundwater. Environ. Pollut. 163, 287–303 (2012).", doi: "10.1016/j.envpol.2011.12.034" }),
    mkRef(14, "matched", { raw: "Eerkes-Medrano, D., Thompson, R. C. & Aldridge, D. C. Microplastics in freshwater systems: a review of occurrence, effects and methods. Water Res. 75, 63–82 (2015).", doi: "10.1016/j.watres.2015.02.012" }),
    mkRef(15, "mismatched", { raw: "Carpenter, S. R. et al. Nonpoint pollution of surface waters with phosphorus and nitrogen. Ecol. Appl. 8, 559–568 (1998).", doi: "10.1126/science.abf1234", note: "DOI resolves to an unrelated article on photocatalysis. Likely typo or fabricated." }),
    mkRef(16, "mismatched", { raw: "Chen, A. et al. Comparing water quality across three river sampling sites. Environmental Research Letters 12, 1–9 (2026).", doi: "10.9999/envres.fake.2026", note: "DOI does not resolve. Likely self-citation to an unpublished paper." }),
    mkRef(17, "no_doi", { raw: "Smith, J. A. & Doe, R. A framework for catchment-scale contaminant movement. Unpublished manuscript (2024).", note: "No DOI present; could not validate against Crossref." }),
    mkRef(18, "no_doi", { raw: "Tomkins, R. Proceedings of the 14th International Workshop on Water Monitoring, p. 233 (2025).", note: "Conference proceedings; no DOI provided." }),
    mkRef(19, "matched", { raw: "Borrelli, P. et al. An assessment of the global impact of 21st century land use change on soil erosion. Nat. Commun. 8, 2013 (2017).", doi: "10.1038/s41467-017-02142-7" }),
    mkRef(20, "matched", { raw: "Best, J. Anthropogenic stresses on the world's big rivers. Nat. Geosci. 12, 7–21 (2019).", doi: "10.1038/s41561-018-0262-x" }),
    mkRef(21, "matched", { raw: "Damania, R. et al. Quality unknown: the invisible water crisis. World Bank (2019).", doi: "10.1596/978-1-4648-1459-4" }),
    mkRef(22, "partial", { raw: "Aus der Beek, T. et al. Pharmaceuticals in the environment — global occurrences and perspectives. Environ. Toxicol. Chem. 35, 823–835 (2016).", doi: "10.1002/etc.3339", note: "Journal name shortened to non-canonical form." }),
    mkRef(23, "matched", { raw: "Ternes, T. A. Occurrence of drugs in German sewage treatment plants and rivers. Water Res. 32, 3245–3260 (1998).", doi: "10.1016/S0043-1354(98)00099-2" }),
    mkRef(24, "mismatched", { raw: "Smith, A. B. Highly cited paper on river water. Science 401, 999–1010 (2025).", doi: null, note: "Volume 401 of Science does not exist in 2025. Citation appears fabricated." }),
    mkRef(25, "matched", { raw: "Postel, S. L., Daily, G. C. & Ehrlich, P. R. Human appropriation of renewable fresh water. Science 271, 785–788 (1996).", doi: "10.1126/science.271.5250.785" }),
  ];

  const refSummary = (function () {
    const s = { total: references.length, matched: 0, partial: 0, mismatched: 0, invalid: 0, no_doi: 0 };
    references.forEach((r) => { s[r.status] += 1; });
    return s;
  })();

  // Per-reference `score` is derived from `status` and matching-signal coverage.
  references.forEach((r) => { r.score = refDerivedScore(r.status, r.signal); });

  // AI text detection — 5 sections. `score` and `band` are DERIVED from
  // `indicator_hits` density (hits per 100 words) plus a per-indicator severity weight.
  // Heavier indicators (chatbot_leak, hallucinated_citation) count more than focal_vocab.
  // The density curve and section biases are tuned so the derived scores land
  // in the same bands the demo expects: Abstract <40, Methods <40, Introduction 40-69,
  // Results 40-69, Discussion >=70.
  const AI_INDICATOR_WEIGHT = {
    chatbot_leak: 5.0,
    hallucinated_citation: 4.0,
    tortured_phrases: 3.0,
    internal_inconsistency: 3.0,
    topical_drift: 2.5,
    meta_discourse: 2.0,
    cadence: 1.5,
    generic_templates: 1.5,
    focal_vocab: 1.0,
  };
  // Per-section type modifier so that "expected-AI" sections (introduction, discussion)
  // are scored against their contextual baseline, not a flat curve.
  const AI_SECTION_BIAS = {
    Abstract: +18,
    Introduction: +28,
    Methods: +20,
    Results: +42,
    Discussion: +28,
  };
  function aiDerivedScore(section) {
    const hits = section.indicator_hits || [];
    const weight = hits.reduce((a, h) => a + (AI_INDICATOR_WEIGHT[h] || 1.0), 0);
    const density = weight / Math.max(1, section.word_count / 100);
    const base = Math.max(0, Math.min(100, Math.round(density * 18)));
    const biased = Math.max(0, Math.min(100, base + (AI_SECTION_BIAS[section.name] || 0)));
    const band = biased >= 70 ? "fail" : biased >= 40 ? "partial" : "pass";
    return { score: biased, band };
  }
  const aiSectionsRaw = [
    { name: "Abstract", word_count: 188, indicator_hits: ["focal_vocab"] },
    { name: "Introduction", word_count: 642, indicator_hits: ["focal_vocab", "meta_discourse", "generic_templates"] },
    { name: "Methods", word_count: 815, indicator_hits: ["focal_vocab"] },
    { name: "Results", word_count: 921, indicator_hits: ["cadence", "internal_inconsistency", "topical_drift", "focal_vocab"] },
    { name: "Discussion", word_count: 488, indicator_hits: ["chatbot_leak", "tortured_phrases", "hallucinated_citation", "focal_vocab", "cadence"] },
  ];
  const aiSections = aiSectionsRaw.map((s) => {
    const d = aiDerivedScore(s);
    return { name: s.name, word_count: s.word_count, indicator_hits: s.indicator_hits, score: d.score, band: d.band };
  });
  const aiFlagged = [
    { section: "Discussion", indicator: "chatbot_leak", severity: "critical", text: "Certainly! Here is a polished version of the discussion section, structured around the three main findings you mentioned. Let me know if you would like a more formal tone.", hl_start: 0, hl_end: 187, note: "Leaked LLM assistant prefix is present verbatim in the manuscript text." },
    { section: "Discussion", indicator: "tortured_phrases", severity: "high", text: "The aqueous medium is herein subjected to a profound rearrangement of its compositional constitution, a circumstance not entirely incompatible with prior reports.", hl_start: 200, hl_end: 345, note: "Synonym-spun phrasing patterns consistent with paraphrase tooling." },
    { section: "Discussion", indicator: "hallucinated_citation", severity: "high", text: "as previously demonstrated by Smith et al. (Science, 401, 999, 2025)", hl_start: 380, hl_end: 442, note: "Citation refers to a non-existent Science volume; cross-flagged by reference check." },
    { section: "Results", indicator: "topical_drift", severity: "medium", text: "Although our focus is on river water quality, it is worth noting that machine-learning approaches have revolutionised the way we think about scientific discovery itself.", hl_start: 510, hl_end: 692, note: "Abrupt off-topic excursion typical of LLM-generated transitions." },
    { section: "Results", indicator: "internal_inconsistency", severity: "medium", text: "The contaminant concentration at the upstream site reaches 120 µg/L, dropping to roughly 40 µg/L downstream, broadly consistent with the spatial trend reported in the abstract.", hl_start: 740, hl_end: 901, note: "Higher contaminant upstream contradicts the downstream-peak trend stated in the abstract." },
    { section: "Introduction", indicator: "meta_discourse", severity: "low", text: "It is important to note that, in this paper, we will explore in detail the rich dynamics of river systems and provide a comprehensive overview.", hl_start: 220, hl_end: 360, note: "Generic meta-discourse pattern often produced by LLMs." },
  ];

  // A `critical` finding anywhere in `aiFlagged` is a manuscript-rejection signal:
  // a leaked LLM assistant prefix means the text is unpublishable regardless of
  // how clean the rest of the manuscript is. The per-section score is floored by
  // the worst severity present in that section, and a global ceiling caps the
  // AI integrity contribution at 25 so the dashboard cannot absorb the failure
  // into a green headline.
  const AI_SECTION_SEVERITY_PENALTY = { critical: 0.0, high: 0.7, medium: 0.9, low: 1.0 };
  function aiSectionSeverityFloor(sectionName) {
    const flags = aiFlagged.filter((f) => f.section === sectionName);
    if (!flags.length) return 1.0;
    return Math.min(...flags.map((f) => AI_SECTION_SEVERITY_PENALTY[f.severity] != null ? AI_SECTION_SEVERITY_PENALTY[f.severity] : 1.0));
  }
  aiSections.forEach((s) => {
    const floor = aiSectionSeverityFloor(s.name);
    if (floor < 1.0) {
      s.score = Math.round(s.score * floor);
      s.band = s.score >= 70 ? "fail" : s.score >= 40 ? "partial" : "fail";
      if (s.score === 0) s.band = "fail";
    }
  });
  const aiOverall = Math.round(aiSections.reduce((acc, s) => acc + s.score * s.word_count, 0) / aiSections.reduce((acc, s) => acc + s.word_count, 0));
  const aiIndicatorCounts = {
    chatbot_leak: 1, tortured_phrases: 1, hallucinated_citation: 1, topical_drift: 1,
    internal_inconsistency: 1, meta_discourse: 2, cadence: 2, focal_vocab: 7,
    generic_templates: 1, _scoring_version: "v8",
  };

  // Data verification — findings are the single source of truth.
  // `traceability.score`, `reproducibility.score`, and `manipulation.score`
  // are derived from these findings + the lifecycle graph (see below).
  const verification = {
    traceability: { status: "pass", findings: [
      { figure: "all", note: "All scripts are git-tracked and committed (no uncommitted edits).", status: "pass" },
    ]},
    reproducibility: { status: "pass", findings: [
      { figure: "pH_by_site", note: "Provenance commit found ([SciTrace:Run]); inputs and script unchanged.", status: "pass" },
      { figure: "contaminant_by_site", note: "Provenance commit found; inputs unchanged.", status: "pass" },
      { figure: "contaminant_vs_temperature", note: "Provenance commit found but scripts/generate_figures.py edited after the run.", status: "warn" },
      { figure: "results_summary", note: "Provenance commit found; outputs match.", status: "pass" },
    ]},
    manipulation: { status: "pass", findings: [
      { figure: "contaminant_vs_temperature", note: "filter_and_clean_samples.py outlier rule flagged 'warn' by lifecycle analysis.", status: "warn" },
    ]},
  };

  // ── Per-figure score derivation ─────────────────────────────────
  // `figures[i].scores.{traceability,reproducibility}` are computed from:
  //   traceability    → whether the figure's plot file is reachable, via the lifecycle
  //                     edges, from a `type:"raw_data"` source. Edges flow
  //                     raw → processing → output, so we forward-traverse from each
  //                     raw input and ask "is the figure's output node in this set?"
  //   reproducibility → the worst reproducibility finding for that figure, weighted
  //                     against the pass findings.
  //   manipulation    → derived separately and lives on `verification.manipulation`.
  const FIGURE_FILE_TO_NODE = {
    "plots/pH_by_site.png": "lplot_fig1",
    "plots/contaminant_by_site.png": "lplot_fig2",
    "plots/contaminant_vs_temperature.png": "lplot_fig3",
    "plots/results_summary.png": "lplot_fig4",
  };
  // Build forward adjacency for lifecycle reachability (edges go raw → output).
  const lifecycleAdj = (function () {
    const out = new Map();
    lifecycleEdges.forEach((e) => {
      if (!out.has(e.from)) out.set(e.from, []);
      out.get(e.from).push(e.to);
    });
    return out;
  })();
  const lifecycleNodeById = (function () {
    const m = new Map();
    lifecycleNodes.forEach((n) => m.set(n.id, n));
    return m;
  })();
  // For every raw_data node, BFS to discover all reachable output nodes.
  // A figure is "traced" if its output node appears in the reachable set of at
  // least one raw_data source.
  const rawReachableOutputs = (function () {
    const set = new Set();
    const sources = lifecycleNodes.filter((n) => n.type === "raw_data");
    sources.forEach((src) => {
      const stack = [src.id];
      const seen = new Set();
      while (stack.length) {
        const cur = stack.pop();
        if (seen.has(cur)) continue;
        seen.add(cur);
        const next = lifecycleAdj.get(cur) || [];
        next.forEach((m) => {
          const n = lifecycleNodeById.get(m);
          if (n && n.type === "output") set.add(m);
          stack.push(m);
        });
      }
    });
    return set;
  })();
  const FIGURE_TRACE_BASE = { linked_traced: 100, linked_untraced: 70, missing: 30, critical: 0 };
  function figureTraceabilityScore(fig) {
    const nodeId = FIGURE_FILE_TO_NODE[fig.node];
    if (!nodeId) return FIGURE_TRACE_BASE.missing;
    // A `critical` finding on this figure overrides lifecycle reachability —
    // a deleted raw file or a completely un-traced figure is unpublishable.
    const fileKey = (fig.node || "").split("/").pop().replace(/\.[^.]+$/, "");
    const criticalHit = verification.traceability.findings.some(
      (f) => (f.figure === fileKey || f.figure === "all") && f.status === "critical"
    );
    if (criticalHit) return FIGURE_TRACE_BASE.critical;
    return rawReachableOutputs.has(nodeId) ? FIGURE_TRACE_BASE.linked_traced : FIGURE_TRACE_BASE.linked_untraced;
  }
  // `critical` on reproducibility = a script was deleted post-run or the
  // data file is irrecoverable. Hard zero on the figure (same effect as fail).
  const REPRO_STATUS_WEIGHT = { pass: 1.0, warn: 0.6, fail: 0.0, critical: 0.0 };
  function figureReproducibilityScore(fig) {
    const fileKey = (fig.node || "").split("/").pop().replace(/\.[^.]+$/, "");
    const findings = verification.reproducibility.findings.filter((f) => f.figure === fileKey);
    if (!findings.length) return 100;
    const avg = findings.reduce((a, f) => a + (REPRO_STATUS_WEIGHT[f.status] || 0), 0) / findings.length;
    return Math.round(100 * avg);
  }
  figures.forEach((fig) => {
    fig.scores = {
      traceability: figureTraceabilityScore(fig),
      reproducibility: figureReproducibilityScore(fig),
    };
  });

  // ── Verification block score derivation ────────────────────────
  // traceability: share of figures whose plot file is reachable from a raw input
  //               AND has no `critical` finding (100% if all 4 are clean).
  // reproducibility: mean of per-figure reproducibility scores (each already
  //                  derived from per-figure findings above).
  // manipulation: 100 minus a per-finding penalty weighted by severity, then
  //               floored by the worst `critical` finding multiplier — a single
  //               `critical` manipulation finding caps the dimension at 20%.
  //               `warn` ≈ -10, `fail` ≈ -25, `critical` ≈ -40.
  const MANIP_STATUS_PENALTY = { warn: 10, fail: 25, critical: 40 };
  const MANIP_SEVERITY_FLOOR = { warn: 1.0, fail: 0.6, critical: 0.2 };
  const traceabilityScore = Math.round(
    100 * figures.filter((f) => f.scores.traceability === FIGURE_TRACE_BASE.linked_traced).length / figures.length
  );
  const reproducibilityScore = Math.round(
    figures.reduce((a, f) => a + f.scores.reproducibility, 0) / figures.length
  );
  const manipulationPenalty = verification.manipulation.findings.reduce(
    (a, f) => a + (MANIP_STATUS_PENALTY[f.status] || 0),
    0
  );
  const manipSeverityFloor = verification.manipulation.findings.reduce(
    (a, f) => Math.min(a, MANIP_SEVERITY_FLOOR[f.status] != null ? MANIP_SEVERITY_FLOOR[f.status] : 1.0),
    1.0
  );
  const manipulationBase = Math.max(0, Math.min(100, 100 - manipulationPenalty));
  const manipulationScore = Math.round(manipulationBase * manipSeverityFloor);
  verification.traceability.score = traceabilityScore;
  verification.reproducibility.score = reproducibilityScore;
  verification.manipulation.score = manipulationScore;
  verification.traceability.status = traceabilityScore >= 70 ? "pass" : traceabilityScore >= 40 ? "partial" : "fail";
  verification.reproducibility.status = reproducibilityScore >= 70 ? "pass" : reproducibilityScore >= 40 ? "partial" : "fail";
  verification.manipulation.status = manipulationScore >= 70 ? "pass" : manipulationScore >= 40 ? "partial" : "fail";

  const refScore = Math.round(references.reduce((a, r) => a + r.score, 0) / references.length);

  const authorsScore = Math.round(
    authors.reduce((a, au) => a + (au.openalex.existence * 0.40 + au.openalex.linkage * 0.30 + au.openalex.field_match * 0.30), 0) / authors.length
  );

  // Hard ceiling: if any `critical` AI finding exists, the AI dimension is
  // capped at 25 (red band) — the manuscript is treated as AI-generated and
  // is not eligible for publication regardless of how clean the rest is.
  const CRITICAL_AI_INTEGRITY_CEILING = 25;
  const hasCriticalAiFinding = aiFlagged.some((f) => f.severity === "critical");
  const aiIntegrityScoreRaw = Math.max(0, 100 - aiOverall);
  const aiIntegrityScore = hasCriticalAiFinding
    ? Math.min(aiIntegrityScoreRaw, CRITICAL_AI_INTEGRITY_CEILING)
    : aiIntegrityScoreRaw;

  // Headline integrity. Any `critical` finding in the manuscript (AI, traceability,
  // reproducibility, or manipulation) caps the score at 30 — the submission is
  // rejected. The cap is dimension-agnostic because a critical in any one of
  // these dimensions is itself a reject condition.
  const CRITICAL_OVERALL_INTEGRITY_FLOOR = 30;
  const hasAnyCriticalFinding =
    hasCriticalAiFinding ||
    verification.traceability.findings.some((f) => f.status === "critical") ||
    verification.reproducibility.findings.some((f) => f.status === "critical") ||
    verification.manipulation.findings.some((f) => f.status === "critical");
  const overallIntegrityRaw = Math.round(
    0.15 * verification.traceability.score +
    0.25 * verification.reproducibility.score +
    0.20 * verification.manipulation.score +
    0.10 * aiIntegrityScore +
    0.20 * refScore +
    0.10 * authorsScore
  );
  const overallIntegrity = hasAnyCriticalFinding
    ? Math.min(overallIntegrityRaw, CRITICAL_OVERALL_INTEGRITY_FLOOR)
    : overallIntegrityRaw;

  // Authors check summary
  const authorsSummary = {
    total: authors.length,
    verified: authors.filter((a) => a.openalex.status === "pass").length,
    partial: authors.filter((a) => a.openalex.status === "partial").length,
    flagged: authors.filter((a) => a.openalex.status === "fail").length,
    manuscript_topics: ["Environmental science", "Water quality", "Analytical chemistry", "Hydrology"],
  };

  // Editor dashboard fixture: queue of submissions.
  // The primary row (#101) reuses the manuscript's derived `overallIntegrity`.
  // The other rows carry a small per-row signal object (refMatchRate, aiLikely,
  // linkedFiles, manipHits) from which their integrity is computed via the same
  // weighted blend used for the primary submission. No literal integrity scores.
  function queueRowIntegrity(row) {
    if (row.primary) return overallIntegrity;
    const sig = row.signals;
    const refScoreQ   = Math.round(sig.refMatchRate * 100);
    const aiScoreQ    = Math.round(sig.aiLikely * 100);
    const aiIntegrityQ = Math.max(0, 100 - aiScoreQ);
    const traceScoreQ  = Math.round(100 * sig.linkedFiles / sig.totalFigures);
    const reproScoreQ  = Math.max(0, 100 - 12 * sig.manipHits);
    const manipScoreQ  = Math.max(0, 100 - 14 * sig.manipHits);
    const authorScoreQ = Math.round(sig.authorVerification * 100);
    return Math.round(
      0.15 * traceScoreQ +
      0.25 * reproScoreQ +
      0.20 * manipScoreQ +
      0.10 * aiIntegrityQ +
      0.20 * refScoreQ +
      0.10 * authorScoreQ
    );
  }
  const editorQueueRaw = [
    { id: 101, journal: "Journal of Environmental Science", title: manuscript.title, status: "submitted", submitted_at: "2026-05-30", reviewers: 2, decision: null, primary: true },
    { id: 102, journal: "Journal of Environmental Science", title: "Microplastic counts in synthetic lake samples", status: "submitted", submitted_at: "2026-05-28", reviewers: 1, decision: null, primary: false,
      signals: { refMatchRate: 0.66, aiLikely: 0.58, linkedFiles: 3, totalFigures: 4, manipHits: 2, authorVerification: 0.70 } },
    { id: 103, journal: "Water Quality Reviews", title: "A review of filtration methods for drinking water", status: "submitted", submitted_at: "2026-05-24", reviewers: 3, decision: null, primary: false,
      signals: { refMatchRate: 0.50, aiLikely: 0.74, linkedFiles: 2, totalFigures: 4, manipHits: 4, authorVerification: 0.55 } },
    { id: 104, journal: "Journal of Environmental Science", title: "Seasonal variation in synthetic groundwater data", status: "revision", submitted_at: "2026-04-19", reviewers: 2, decision: "Minor Revision", primary: false,
      signals: { refMatchRate: 0.84, aiLikely: 0.34, linkedFiles: 4, totalFigures: 4, manipHits: 1, authorVerification: 0.82 } },
    { id: 105, journal: "Water Quality Reviews", title: "Synthetic dataset for water-sensor calibration", status: "accepted", submitted_at: "2026-03-11", reviewers: 2, decision: "Accept", primary: false,
      signals: { refMatchRate: 0.94, aiLikely: 0.18, linkedFiles: 4, totalFigures: 4, manipHits: 0, authorVerification: 0.90 } },
  ];
  const editorQueue = editorQueueRaw.map((r) => {
    const integrity = queueRowIntegrity(r);
    // For the primary row, the status and decision are derived from the integrity
    // score so that a critical finding automatically flips the queue from
    // "submitted" to "rejected" without manual intervention.
    let status = r.status;
    let decision = r.decision;
    if (r.primary) {
      if (integrity <= CRITICAL_OVERALL_INTEGRITY_FLOOR) {
        status = "rejected";
        decision = "Reject";
      }
    }
    return { id: r.id, journal: r.journal, title: r.title, status, submitted_at: r.submitted_at, reviewers: r.reviewers, decision, primary: r.primary, integrity };
  });

  const editorQueueAvg = Math.round(editorQueue.reduce((a, r) => a + r.integrity, 0) / editorQueue.length);
  // Status counts are derived from the visible queue (5 rows). The `total` field
  // represents a wider backend pool to convey "busy journal" — the visible
  // distribution is grounded in actual queue state so a critical finding on
  // the primary row is immediately visible in the "rejected" tile.
  const editorQueueStatusCounts = editorQueue.reduce((a, r) => { a[r.status] = (a[r.status] || 0) + 1; return a; }, {});
  const editorStats = {
    total: editorQueue.length,
    pending: editorQueueStatusCounts.submitted || 0,
    accepted: editorQueueStatusCounts.accepted || 0,
    rejected: editorQueueStatusCounts.rejected || 0,
    revision: editorQueueStatusCounts.revision || 0,
    avg_integrity: editorQueueAvg,
  };
  const reviewerStats = { total: 4, pending: 1, accepted: 2, completed: 1 };

  const reviewerQueue = [
    { id: 101, title: manuscript.title, journal: manuscript.journal, status: "pending", assigned_at: "2026-05-31" },
    { id: 99, title: "Dissolved oxygen in synthetic stream samples", journal: "Journal of Environmental Science", status: "accepted", assigned_at: "2026-05-12", reviewer_decision: null },
    { id: 88, title: "Synthetic-data benchmarks for water sensors", journal: "Water Quality Reviews", status: "completed", assigned_at: "2026-04-02", reviewer_decision: "Minor Revision" },
    { id: 90, title: "Nutrient levels in wetland monitoring data", journal: "Journal of Environmental Science", status: "accepted", assigned_at: "2026-04-22", reviewer_decision: null },
  ];

  // Author messages
  const messages = [
    { sender: "editor", name: "Maria Torres", date: "2026-05-31 09:12", body: "Thanks for the submission. The reference and AI-text checks ran automatically; I'll review the flags before assigning reviewers." },
    { sender: "author", name: "Alex Chen", date: "2026-05-31 10:48", body: "Happy to clarify anything — most flagged passages in the Discussion are paraphrased from collaborator notes; we'll revise to remove ambiguity." },
  ];

  // Reviewer ↔ editor private thread
  const reviewerThread = [
    { sender: "editor", name: "Maria Torres", date: "2026-05-31 11:00", body: "Welcome — please pay attention to Figures 3 and 4 since the data-verification check flagged a post-run edit to generate_figures.py." },
  ];

  // Synthetic file contents for file-preview clicks in the repo graph.
  // Matches the water-quality study theme: three river sites, pH/turbidity/contaminant.
  const fileContents = {
    "site_A_upstream.csv":
      "site,pH,turbidity_NTU,contaminant_ugL,temperature_C\n" +
      "Upstream,7.2,12.4,0.8,14.3\n" +
      "Upstream,7.1,11.9,1.1,14.8\n" +
      "Upstream,7.3,13.1,0.6,13.9\n" +
      "Upstream,7.0,12.7,0.9,14.5\n" +
      "Upstream,7.2,12.2,0.7,14.1\n" +
      "Upstream,7.1,12.5,0.7,14.0\n" +
      "Upstream,7.2,12.1,0.9,14.6\n" +
      "Upstream,7.0,13.0,0.8,14.2\n" +
      "Upstream,7.3,11.8,0.6,14.4\n" +
      "Upstream,7.1,12.3,1.0,14.7",
    "site_B_midstream.csv":
      "site,pH,turbidity_NTU,contaminant_ugL,temperature_C\n" +
      "Midstream,6.8,18.3,2.4,15.6\n" +
      "Midstream,6.9,19.1,2.1,15.2\n" +
      "Midstream,6.7,17.8,2.7,16.0\n" +
      "Midstream,6.8,18.6,2.3,15.4\n" +
      "Midstream,6.9,18.0,2.5,15.8\n" +
      "Midstream,6.8,18.5,2.3,15.5\n" +
      "Midstream,6.7,19.0,2.6,15.3\n" +
      "Midstream,6.9,17.9,2.2,15.7\n" +
      "Midstream,6.8,18.2,2.5,15.9\n" +
      "Midstream,6.7,18.7,2.4,15.1",
    "site_C_downstream.csv":
      "site,pH,turbidity_NTU,contaminant_ugL,temperature_C\n" +
      "Downstream,6.5,22.7,3.8,16.8\n" +
      "Downstream,6.4,23.1,4.1,17.2\n" +
      "Downstream,6.6,22.3,3.5,16.4\n" +
      "Downstream,6.5,22.9,3.9,17.0\n" +
      "Downstream,6.4,23.5,4.2,17.5\n" +
      "Downstream,6.5,22.6,3.7,16.7\n" +
      "Downstream,6.6,23.0,4.0,16.9\n" +
      "Downstream,6.4,22.4,3.6,17.1\n" +
      "Downstream,6.5,23.2,4.1,17.3\n" +
      "Downstream,6.6,22.8,3.8,16.5",
    "samples_cleaned.csv":
      "site,pH,turbidity_NTU,contaminant_ugL,temperature_C\n" +
      "Upstream,7.2,12.4,0.8,14.3\n" +
      "Upstream,7.1,11.9,1.1,14.8\n" +
      "Upstream,7.3,13.1,0.6,13.9\n" +
      "Upstream,7.0,12.7,0.9,14.5\n" +
      "Upstream,7.2,12.2,0.7,14.1\n" +
      "Upstream,7.1,12.5,0.7,14.0\n" +
      "Upstream,7.2,12.1,0.9,14.6\n" +
      "Upstream,7.0,13.0,0.8,14.2\n" +
      "Upstream,7.3,11.8,0.6,14.4\n" +
      "Upstream,7.1,12.3,1.0,14.7\n" +
      "Midstream,6.8,18.3,2.4,15.6\n" +
      "Midstream,6.9,19.1,2.1,15.2\n" +
      "Midstream,6.7,17.8,2.7,16.0\n" +
      "Midstream,6.8,18.6,2.3,15.4\n" +
      "Midstream,6.9,18.0,2.5,15.8\n" +
      "Midstream,6.8,18.5,2.3,15.5\n" +
      "Midstream,6.7,19.0,2.6,15.3\n" +
      "Midstream,6.9,17.9,2.2,15.7\n" +
      "Midstream,6.8,18.2,2.5,15.9\n" +
      "Midstream,6.7,18.7,2.4,15.1\n" +
      "Downstream,6.5,22.7,3.8,16.8\n" +
      "Downstream,6.4,23.1,4.1,17.2\n" +
      "Downstream,6.6,22.3,3.5,16.4\n" +
      "Downstream,6.5,22.9,3.9,17.0\n" +
      "Downstream,6.4,23.5,4.2,17.5\n" +
      "Downstream,6.5,22.6,3.7,16.7\n" +
      "Downstream,6.6,23.0,4.0,16.9\n" +
      "Downstream,6.4,22.4,3.6,17.1\n" +
      "Downstream,6.5,23.2,4.1,17.3\n" +
      "Downstream,6.6,22.8,3.8,16.5",
    "merged_raw_samples.csv":
      "site,pH,turbidity_NTU,contaminant_ugL,temperature_C\n" +
      "Upstream,7.2,12.4,0.8,14.3\n" +
      "Upstream,7.1,11.9,1.1,14.8\n" +
      "Upstream,7.3,13.1,0.6,13.9\n" +
      "Upstream,7.0,12.7,0.9,14.5\n" +
      "Upstream,7.2,12.2,0.7,14.1\n" +
      "Upstream,7.1,12.5,0.7,14.0\n" +
      "Midstream,6.8,18.3,2.4,15.6\n" +
      "Midstream,6.9,19.1,2.1,15.2\n" +
      "Midstream,6.7,17.8,2.7,16.0\n" +
      "Midstream,6.8,18.6,2.3,15.4\n" +
      "Midstream,6.9,18.0,2.5,15.8\n" +
      "Midstream,6.7,19.0,2.6,15.3\n" +
      "Downstream,6.5,22.7,3.8,16.8\n" +
      "Downstream,6.4,23.1,4.1,17.2\n" +
      "Downstream,6.6,22.3,3.5,16.4\n" +
      "Downstream,6.5,22.9,3.9,17.0\n" +
      "Downstream,6.4,23.5,4.2,17.5\n" +
      "Downstream,6.5,23.2,4.1,17.3",
    "analysis_parameters.json": JSON.stringify({
      numeric_columns: ["pH", "turbidity_NTU", "contaminant_ugL", "temperature_C"],
      range_filters: { pH: [4.0, 9.0], turbidity_NTU: [0, 50], contaminant_ugL: [0, 10], temperature_C: [0, 35] },
      outlier_method: "iqr",
      outlier_multiplier: 1.5,
      description: "Calibration settings for the water-quality analysis pipeline"
    }, null, 2),
    "site_statistics.json": JSON.stringify({
      pH: { mean: 6.81, std: 0.29, min: 6.4, max: 7.3, median: 6.8 },
      turbidity_NTU: { mean: 18.97, std: 4.18, min: 11.9, max: 23.5, median: 18.6 },
      contaminant_ugL: { mean: 2.53, std: 1.28, min: 0.6, max: 4.2, median: 2.4 },
      temperature_C: { mean: 15.53, std: 1.09, min: 13.9, max: 17.5, median: 15.6 },
      by_site: {
        Upstream: { pH: 7.16, turbidity_NTU: 12.46, contaminant_ugL: 0.82, temperature_C: 14.32 },
        Midstream: { pH: 6.82, turbidity_NTU: 18.36, contaminant_ugL: 2.4, temperature_C: 15.6 },
        Downstream: { pH: 6.48, turbidity_NTU: 22.9, contaminant_ugL: 3.9, temperature_C: 16.98 }
      },
      correlation: {
        pH_vs_turbidity: -0.91,
        pH_vs_contaminant: -0.94,
        turbidity_vs_contaminant: 0.97,
        temperature_vs_contaminant: 0.89
      }
    }, null, 2)
  };

  return {
    project, tasks, repoNodes, repoEdges, lifecycleNodes, lifecycleEdges, commits, scriptCommits,
    manuscript, authors, figures, references, refSummary,
    aiSections, aiOverall, aiFlagged, aiIndicatorCounts,
    verification, overallIntegrity, refScore, authorsScore, aiIntegrityScore,
    authorsSummary,
    editorQueue, editorStats, reviewerStats, reviewerQueue,
    messages, reviewerThread,
    fileContents,
  };
})();
