// Shared renderers for the SciVerify check evidence (References / AI Detection / Authors).
// Used by both the editor's Check Tool result page and the formal Submission Review page
// so the two views render byte-identical evidence from the same fixture.

(function () {
  const refColor = { matched: '#34d399', partial: '#fbbf24', mismatched: '#fb923c', invalid: '#f87171', no_doi: 'rgba(255,255,255,0.5)' };
  const refBg = { matched: 'rgba(5,150,105,0.06)', partial: 'rgba(217,119,6,0.08)', mismatched: 'rgba(248,113,113,0.08)', invalid: 'rgba(220,38,38,0.10)', no_doi: 'rgba(255,255,255,0.03)' };
  const bandColor = (s) => s >= 70 ? '#34d399' : s >= 40 ? '#fbbf24' : '#f87171';

  const indicatorLabel = (k) => ({
    chatbot_leak: 'Chatbot Reply Leak',
    tortured_phrases: 'Tortured Phrase',
    hallucinated_citation: 'Hallucinated Citation Marker',
    topical_drift: 'Introduction-Methods Drift',
    internal_inconsistency: 'Internal Inconsistency',
    meta_discourse: 'Meta-Discourse Overuse',
    cadence: 'AI Cadence Pattern',
    focal_vocab: 'AI-Favoured Vocabulary',
    generic_templates: 'Generic Template Phrase',
  }[k] || k.replace(/_/g, ' '));

  function renderReferences(target, opts) {
    const d = window.DEMO;
    const rs = d.refSummary;
    const showMethodology = (opts && opts.methodology !== false);
    target.innerHTML = `
      <div class="row g-2 mb-3">
        <div class="col"><div class="p-2 text-center" style="border:1px solid rgba(255,255,255,0.1);border-radius:8px;"><div class="small text-muted">Total</div><div class="h5 mb-0">${rs.total}</div></div></div>
        <div class="col"><div class="p-2 text-center" style="border:1px solid rgba(5,150,105,0.3);border-radius:8px;background:rgba(5,150,105,0.05);"><div class="small" style="color:#34d399;">Matched</div><div class="h5 mb-0" style="color:#34d399;">${rs.matched}</div></div></div>
        <div class="col"><div class="p-2 text-center" style="border:1px solid rgba(217,119,6,0.3);border-radius:8px;background:rgba(217,119,6,0.05);"><div class="small" style="color:#fbbf24;">Partial</div><div class="h5 mb-0" style="color:#fbbf24;">${rs.partial}</div></div></div>
        <div class="col"><div class="p-2 text-center" style="border:1px solid rgba(249,115,22,0.3);border-radius:8px;background:rgba(249,115,22,0.05);"><div class="small" style="color:#fb923c;">Mismatched</div><div class="h5 mb-0" style="color:#fb923c;">${rs.mismatched}</div></div></div>
        <div class="col"><div class="p-2 text-center" style="border:1px solid rgba(220,38,38,0.3);border-radius:8px;background:rgba(220,38,38,0.05);"><div class="small" style="color:#f87171;">Invalid</div><div class="h5 mb-0" style="color:#f87171;">${rs.invalid}</div></div></div>
        <div class="col"><div class="p-2 text-center" style="border:1px solid rgba(255,255,255,0.1);border-radius:8px;"><div class="small text-muted">No DOI</div><div class="h5 mb-0 text-muted">${rs.no_doi}</div></div></div>
      </div>

      ${showMethodology ? `
      <details class="mb-3" style="background:rgba(0,0,0,0.18);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px 14px;">
        <summary style="cursor:pointer;font-size:0.85rem;color:rgba(255,255,255,0.85);"><i class="fas fa-flask me-2 text-info"></i><strong>How references are reviewed</strong> <span class="text-muted ms-2" style="font-size:0.75rem;">click to expand the 5-signal rubric</span></summary>
        <div class="mt-3" style="font-size:0.78rem;line-height:1.5;color:rgba(255,255,255,0.75);">
          <div class="small fw-bold text-uppercase text-secondary mb-2" style="letter-spacing:0.05em;font-size:0.65rem;">Pipeline</div>
          <div class="d-flex flex-wrap" style="gap:6px;margin-bottom:14px;font-size:0.72rem;">
            <span style="background:rgba(255,255,255,0.06);padding:4px 8px;border-radius:4px;"><strong>1.</strong> Extract main-article text</span>
            <span style="color:rgba(255,255,255,0.4);">→</span>
            <span style="background:rgba(255,255,255,0.06);padding:4px 8px;border-radius:4px;"><strong>2.</strong> Locate <em>References</em> section</span>
            <span style="color:rgba(255,255,255,0.4);">→</span>
            <span style="background:rgba(255,255,255,0.06);padding:4px 8px;border-radius:4px;"><strong>3.</strong> Split into entries</span>
            <span style="color:rgba(255,255,255,0.4);">→</span>
            <span style="background:rgba(255,255,255,0.06);padding:4px 8px;border-radius:4px;"><strong>4.</strong> Extract DOI</span>
            <span style="color:rgba(255,255,255,0.4);">→</span>
            <span style="background:rgba(255,255,255,0.06);padding:4px 8px;border-radius:4px;"><strong>5.</strong> Crossref lookup &amp; 5-signal score</span>
          </div>
          <div class="small fw-bold text-uppercase text-secondary mb-2" style="letter-spacing:0.05em;font-size:0.65rem;">Classification bands</div>
          <div style="font-size:0.72rem;line-height:1.7;">
            <span class="metric-badge success">matched</span> total ≥ 70 &nbsp;·&nbsp;
            <span class="metric-badge warn">partial</span> 40 – 69 &nbsp;·&nbsp;
            <span class="metric-badge fail">mismatched</span> &lt; 40 &nbsp;·&nbsp;
            <span class="metric-badge fail">invalid</span> DOI did not resolve &nbsp;·&nbsp;
            <span class="metric-badge">no_doi</span> no DOI in chunk
          </div>
        </div>
      </details>` : ''}

      <div class="small text-muted mb-2"><i class="fas fa-info-circle me-1"></i>Each reference is shown below with its raw chunk, the Crossref payload, and the signal-by-signal scoring breakdown.</div>
      ${d.references.map((f) => renderRefRow(f)).join('')}
    `;
  }

  function renderRefRow(f) {
    const sc = refColor[f.status];
    const bg = refBg[f.status];
    const sigOrder = ['author', 'title', 'year', 'journal', 'volume'];
    const sigMax = { author: 30, title: 30, year: 20, journal: 10, volume: 10 };
    const sigLabel = { author: 'Author', title: 'Title', year: 'Year', journal: 'Journal', volume: 'Volume / Issue' };
    const statusLabel = f.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    let signalRows = '';
    if (f.status !== 'no_doi') {
      signalRows = sigOrder.map((s) => {
        const raw = f.signal[s];
        const earned = raw === 1 ? sigMax[s] : raw === 0 ? 0 : Math.round(sigMax[s] * (raw || 0));
        const ok = earned >= sigMax[s] * 0.7;
        const part = earned > 0 && !ok;
        const emoji = ok ? '✓' : part ? '~' : '✗';
        const c = ok ? '#34d399' : part ? '#fbbf24' : '#f87171';
        return `<tr style="border-top:1px solid rgba(255,255,255,0.04);">
          <td style="padding:4px 6px;color:rgba(255,255,255,0.75);">${sigLabel[s]}</td>
          <td style="padding:4px 6px;text-align:center;color:${c};font-family:var(--bs-font-monospace);"><strong>${earned}</strong><span class="text-muted"> / ${sigMax[s]}</span></td>
          <td style="padding:4px 6px;text-align:center;color:${c};">${emoji}</td>
          <td style="padding:4px 6px;color:rgba(255,255,255,0.6);">${ok ? 'Matched Crossref payload' : part ? 'Partial match' : 'No match in chunk'}</td>
        </tr>`;
      }).join('');
    }
    return `<div class="mb-3" style="padding:10px 14px;border-radius:8px;background:${bg};border-left:4px solid ${sc};">
      <div class="d-flex justify-content-between align-items-start mb-2" style="gap:8px;">
        <div>
          <strong>#${f.idx}</strong>
          <span class="badge ms-1" style="background:rgba(0,0,0,0.25);color:${sc};border:1px solid ${sc};font-size:0.65rem;">${statusLabel}</span>
        </div>
        ${f.status !== 'no_doi' ? `<div class="text-end small"><span class="text-muted">Score</span> <strong style="color:${sc};">${f.score}<span class="text-muted">/100</span></strong></div>` : ''}
      </div>
      <div class="row g-2">
        <div class="col-md-6">
          <div class="small fw-bold text-uppercase text-secondary mb-1" style="letter-spacing:0.05em;font-size:0.65rem;">From the manuscript</div>
          <div class="font-monospace" style="font-size:0.75rem;line-height:1.5;background:rgba(0,0,0,0.18);padding:6px 8px;border-radius:4px;word-break:break-word;">${f.raw}</div>
          <div class="mt-1" style="font-size:0.72rem;">
            ${f.doi ? `<span class="text-muted">DOI:</span> <code style="color:${sc};">${f.doi}</code>` : `<span class="text-muted"><i class="fas fa-question-circle me-1"></i>No DOI extracted — cannot verify against Crossref</span>`}
          </div>
          ${f.note ? `<div class="mt-1" style="font-size:0.72rem;color:rgba(255,255,255,0.55);"><i class="fas fa-info-circle me-1"></i>${f.note}</div>` : ''}
        </div>
        <div class="col-md-6">
          <div class="small fw-bold text-uppercase text-secondary mb-1" style="letter-spacing:0.05em;font-size:0.65rem;">From Crossref</div>
          ${f.status === 'invalid' ? `<div class="text-muted small" style="background:rgba(0,0,0,0.10);padding:6px 8px;border-radius:4px;">DOI did not resolve.</div>` :
            f.status === 'no_doi' ? `<div class="text-muted small" style="background:rgba(0,0,0,0.10);padding:6px 8px;border-radius:4px;">No DOI available.</div>` :
            `<div style="font-size:0.75rem;line-height:1.7;background:rgba(0,0,0,0.18);padding:6px 8px;border-radius:4px;">
                <div><span class="text-muted">Author:</span> Crossref-matched first author</div>
                <div><span class="text-muted">Year:</span> ${(f.raw.match(/\((\d{4})\)/) || [, '—'])[1]}</div>
                <div><span class="text-muted">Journal:</span> from Crossref</div>
              </div>`}
        </div>
      </div>
      ${signalRows ? `<div class="mt-2">
        <div class="small fw-bold text-uppercase text-secondary mb-1" style="letter-spacing:0.05em;font-size:0.65rem;">Signal-by-signal scoring</div>
        <table class="table table-sm mb-0" style="font-size:0.72rem;background:transparent;">
          <thead><tr style="color:rgba(255,255,255,0.5);">
            <th style="width:18%;padding:4px 6px;border:none;">Signal</th>
            <th style="width:14%;padding:4px 6px;border:none;text-align:center;">Earned</th>
            <th style="width:8%;padding:4px 6px;border:none;text-align:center;">Status</th>
            <th style="padding:4px 6px;border:none;">Why</th>
          </tr></thead>
          <tbody>${signalRows}
            <tr style="border-top:1px solid rgba(255,255,255,0.10);">
              <td style="padding:4px 6px;color:rgba(255,255,255,0.85);"><strong>Total</strong></td>
              <td style="padding:4px 6px;text-align:center;color:${sc};font-family:var(--bs-font-monospace);"><strong>${f.score}</strong><span class="text-muted"> / 100</span></td>
              <td colspan="2" style="padding:4px 6px;color:rgba(255,255,255,0.55);">Band: matched ≥ 70 · partial 40–69 · mismatched &lt; 40</td>
            </tr>
          </tbody>
        </table>
      </div>` : ''}
    </div>`;
  }

  function renderAiDetection(target, opts) {
    const d = window.DEMO;
    const aiColor = d.aiOverall >= 70 ? '#34d399' : d.aiOverall >= 40 ? '#fbbf24' : '#f87171';   // 0–39 = AI (red), 40–69 = mixed, 70–100 = human (green)
    const showMethodology = (opts && opts.methodology !== false);
    const sevColor = { critical: '#dc2626', high: '#ef4444', medium: '#f97316', low: '#fbbf24' };
    const sevBg = { critical: 'rgba(220,38,38,0.12)', high: 'rgba(239,68,68,0.10)', medium: 'rgba(249,115,22,0.08)', low: 'rgba(251,191,36,0.06)' };

    const bySection = {};
    d.aiFlagged.forEach((f) => { (bySection[f.section] = bySection[f.section] || []).push(f); });

    target.innerHTML = `
      ${showMethodology ? `
      <details class="mb-3" style="background:rgba(0,0,0,0.18);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px 14px;">
        <summary style="cursor:pointer;font-size:0.85rem;color:rgba(255,255,255,0.85);"><i class="fas fa-flask me-2 text-info"></i><strong>How AI-written text is detected</strong> <span class="text-muted ms-2" style="font-size:0.75rem;">click to expand the 15-indicator rubric</span></summary>
        <div class="mt-3" style="font-size:0.78rem;line-height:1.5;color:rgba(255,255,255,0.75);">
          <p>SciVerify scans the Main Article section-by-section for <strong>15 distinct fingerprints</strong> of LLM authorship — from blatant pasted-in chatbot replies to subtle vocabulary and cadence drifts. Critical-tier hits force the section <em>and</em> overall into the 0–39 fail band.</p>
          <div class="small fw-bold text-uppercase text-secondary mb-2" style="letter-spacing:0.05em;font-size:0.65rem;">Score bands</div>
          <div style="font-size:0.72rem;line-height:1.7;">
            <span class="metric-badge fail">likely AI</span> 0 – 39 &nbsp;·&nbsp;
            <span class="metric-badge warn">mixed</span> 40 – 69 &nbsp;·&nbsp;
            <span class="metric-badge success">likely human</span> 70 – 100
          </div>
        </div>
      </details>` : ''}

      <div class="card shadow-sm mb-3">
        <div class="card-body">
          <div class="d-flex align-items-center mb-3">
            <div class="flex-shrink-0 me-4 text-center">
              <div style="width:100px;height:100px;border-radius:50%;border:3px solid ${aiColor};display:flex;align-items:center;justify-content:center;">
                <div><div style="font-size:1.8rem;font-weight:700;color:${aiColor};">${d.aiOverall}%</div><small class="text-muted">AI-WRITTEN</small></div>
              </div>
            </div>
            <div class="flex-grow-1">
              <div class="small text-muted mb-1">Score semantics</div>
              <div style="font-size:0.85rem;line-height:1.5;">
                <span style="color:#f87171;">0–39 likely AI</span> ·
                <span style="color:#fbbf24;">40–69 mixed / partial</span> ·
                <span style="color:#34d399;">70–100 likely human</span>
              </div>
              <div class="small text-muted mt-2" style="line-height:1.45;font-size:0.78rem;"><i class="fas fa-info-circle me-1"></i>Overall is the <strong>word-weighted mean</strong> across sections.</div>
              <div class="mt-2"><span class="badge" style="background:rgba(220,38,38,0.25);color:#f87171;border:1px solid #dc2626;"><i class="fas fa-exclamation-circle me-1"></i>Critical pattern detected — leftover chatbot text in Discussion.</span></div>
            </div>
          </div>
        </div>
      </div>

      <div class="card shadow-sm mb-3">
        <div class="card-header"><h6 class="mb-0"><i class="fas fa-list-ul me-2 text-secondary"></i>Per-section breakdown</h6></div>
        <div class="card-body">
          <div class="row g-2">
            ${d.aiSections.map((sec) => {
              const c = sec.band === 'fail' ? '#f87171' : sec.band === 'partial' ? '#fbbf24' : '#34d399';
              const hits = sec.indicator_hits.map((k) => `<span class="badge me-1 mb-1" style="background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.7);font-weight:normal;">${indicatorLabel(k)}</span>`).join('');
              return `<div class="col-md-4 col-sm-6">
                <div class="p-2 h-100" style="border:1px solid rgba(255,255,255,0.1);border-radius:8px;">
                  <div class="small text-muted d-flex justify-content-between align-items-center">
                    <span>${sec.name}</span>
                    ${sec.band !== 'pass' ? `<span class="badge" style="background:${c};color:#0b0f19;font-size:0.6rem;"><i class="fas fa-flag me-1"></i>flagged</span>` : ''}
                  </div>
                  <div class="h5 mb-1" style="color:${c};">${sec.score}%</div>
                  <div class="small text-white-50" style="font-size:0.72rem;">${sec.word_count} words</div>
                  ${hits ? `<div class="mt-1" style="font-size:0.7rem;line-height:1.4;">${hits}</div>` : ''}
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>

      <div class="card shadow-sm mb-3">
        <div class="card-header"><h6 class="mb-0"><i class="fas fa-flag me-2 text-warning"></i>Flagged passages (${d.aiFlagged.length})</h6></div>
        <div class="card-body">
          ${Object.entries(bySection).map(([section, flags]) => `
            <div class="mb-3">
              <div class="small fw-bold text-uppercase text-secondary mb-2" style="letter-spacing:0.05em;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:4px;">
                <i class="fas fa-bookmark me-1" style="font-size:0.7rem;"></i>${section}
                <span class="ms-2 text-white-50" style="font-weight:normal;text-transform:none;letter-spacing:0;">(${flags.length} flag${flags.length === 1 ? '' : 's'})</span>
              </div>
              ${flags.map((flag) => {
                const c = sevColor[flag.severity];
                const bg = sevBg[flag.severity];
                const t = flag.text;
                const hi = flag.hl_start >= 0 && flag.hl_end > flag.hl_start
                  ? `${t.slice(0, flag.hl_start)}<mark style="background:${c};color:#0b0f19;padding:0 2px;border-radius:2px;font-weight:600;">${t.slice(flag.hl_start, flag.hl_end)}</mark>${t.slice(flag.hl_end)}`
                  : t;
                return `<div class="small mb-2" style="padding:8px 12px;border-radius:6px;background:${bg};border-left:3px solid ${c};">
                  <div class="d-flex justify-content-between align-items-start" style="gap:8px;">
                    <div>
                      <span class="badge" style="background:rgba(0,0,0,0.25);color:${c};border:1px solid ${c};font-size:0.65rem;">${indicatorLabel(flag.indicator)}</span>
                      <span class="badge ms-1" style="background:rgba(0,0,0,0.15);color:rgba(255,255,255,0.7);font-size:0.6rem;">${flag.severity}</span>
                    </div>
                  </div>
                  <div class="mt-1 font-monospace" style="font-size:0.78rem;color:rgba(255,255,255,0.8);line-height:1.5;word-break:break-word;">${hi}</div>
                  ${flag.note ? `<div class="mt-1" style="font-size:0.72rem;color:rgba(255,255,255,0.55);"><i class="fas fa-info-circle me-1"></i>${flag.note}</div>` : ''}
                </div>`;
              }).join('')}
            </div>`).join('')}
        </div>
      </div>
    `;
  }

  function renderAuthors(target, opts) {
    const d = window.DEMO;
    const a = d.authorsSummary;
    const showMethodology = (opts && opts.methodology !== false);
    const auStatusColor = { pass: '#34d399', partial: '#fbbf24', fail: '#f87171' };
    const auStatusBg = { pass: 'rgba(5,150,105,0.06)', partial: 'rgba(217,119,6,0.08)', fail: 'rgba(248,113,113,0.08)' };

    target.innerHTML = `
      <div class="row g-2 mb-3">
        <div class="col"><div class="p-2 text-center" style="border:1px solid rgba(255,255,255,0.1);border-radius:8px;"><div class="small text-muted">Total</div><div class="h5 mb-0">${a.total}</div></div></div>
        <div class="col"><div class="p-2 text-center" style="border:1px solid rgba(5,150,105,0.3);border-radius:8px;background:rgba(5,150,105,0.05);"><div class="small" style="color:#34d399;">Verified</div><div class="h5 mb-0" style="color:#34d399;">${a.verified}</div></div></div>
        <div class="col"><div class="p-2 text-center" style="border:1px solid rgba(217,119,6,0.3);border-radius:8px;background:rgba(217,119,6,0.05);"><div class="small" style="color:#fbbf24;">Partial</div><div class="h5 mb-0" style="color:#fbbf24;">${a.partial}</div></div></div>
        <div class="col"><div class="p-2 text-center" style="border:1px solid rgba(220,38,38,0.3);border-radius:8px;background:rgba(220,38,38,0.05);"><div class="small" style="color:#f87171;">Flagged</div><div class="h5 mb-0" style="color:#f87171;">${a.flagged}</div></div></div>
      </div>

      ${showMethodology ? `
      <details class="mb-3" style="background:rgba(0,0,0,0.18);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px 14px;">
        <summary style="cursor:pointer;font-size:0.85rem;color:rgba(255,255,255,0.85);"><i class="fas fa-flask me-2 text-info"></i><strong>How authors are checked</strong> <span class="text-muted ms-2" style="font-size:0.75rem;">click to expand the 3-signal rubric</span></summary>
        <div class="mt-3" style="font-size:0.78rem;line-height:1.5;color:rgba(255,255,255,0.75);">
          <div class="small fw-bold text-uppercase text-secondary mb-2" style="letter-spacing:0.05em;font-size:0.65rem;">Pipeline</div>
          <div class="d-flex flex-wrap" style="gap:6px;margin-bottom:14px;font-size:0.72rem;">
            <span style="background:rgba(255,255,255,0.06);padding:4px 8px;border-radius:4px;"><strong>1.</strong> Extract author block</span>
            <span style="color:rgba(255,255,255,0.4);">→</span>
            <span style="background:rgba(255,255,255,0.06);padding:4px 8px;border-radius:4px;"><strong>2.</strong> Pull ORCID iDs &amp; affiliations</span>
            <span style="color:rgba(255,255,255,0.4);">→</span>
            <span style="background:rgba(255,255,255,0.06);padding:4px 8px;border-radius:4px;"><strong>3.</strong> Split names</span>
            <span style="color:rgba(255,255,255,0.4);">→</span>
            <span style="background:rgba(255,255,255,0.06);padding:4px 8px;border-radius:4px;"><strong>4.</strong> Look up each author on OpenAlex</span>
            <span style="color:rgba(255,255,255,0.4);">→</span>
            <span style="background:rgba(255,255,255,0.06);padding:4px 8px;border-radius:4px;"><strong>5.</strong> Score: <em>existence</em> (40) · <em>linkage</em> (30) · <em>field</em> (30)</span>
          </div>
          <div class="small fw-bold text-uppercase text-secondary mb-2" style="letter-spacing:0.05em;font-size:0.65rem;">Classification bands</div>
          <div style="font-size:0.72rem;line-height:1.7;">
            <span class="metric-badge success">pass</span> ≥ 70 &nbsp;·&nbsp;
            <span class="metric-badge warn">partial</span> 40 – 69 &nbsp;·&nbsp;
            <span class="metric-badge fail">fail</span> &lt; 40
          </div>
        </div>
      </details>` : ''}

      <div class="mb-3 small text-muted">
        <i class="fas fa-info-circle me-1"></i>Inferred manuscript topics:
        ${a.manuscript_topics.map((t) => `<span class="badge me-1" style="background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.7);font-weight:normal;">${t}</span>`).join('')}
      </div>

      ${d.authors.map((au, i) => {
        const st = au.openalex.status;
        const sc = auStatusColor[st];
        const bg = auStatusBg[st];
        const sigs = [['Existence', au.openalex.existence, 40], ['Linkage', au.openalex.linkage, 30], ['Field-match', au.openalex.field_match, 30]];
        return `<div class="mb-3" style="padding:10px 14px;border-radius:8px;background:${bg};border-left:4px solid ${sc};">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <strong>#${i + 1} — ${au.first} ${au.last}</strong>
              <span class="badge ms-1" style="background:rgba(0,0,0,0.25);color:${sc};border:1px solid ${sc};font-size:0.65rem;">${st.toUpperCase()}</span>
              ${au.corresponding ? `<span class="badge ms-1" style="background:rgba(37,99,235,0.2);color:#93c5fd;border:1px solid rgba(37,99,235,0.35);font-size:0.6rem;">Corresponding</span>` : ''}
            </div>
            <div class="text-end small"><span class="text-muted">Affiliation</span><div>${au.institution} (${au.country})</div></div>
          </div>
          <div class="row g-2 mb-2">
            <div class="col-md-6">
              <div class="small fw-bold text-uppercase text-secondary mb-1" style="letter-spacing:0.05em;font-size:0.65rem;">From the manuscript</div>
              <div style="font-size:0.78rem;background:rgba(0,0,0,0.18);padding:6px 8px;border-radius:4px;">
                <div><span class="text-muted">Email:</span> ${au.email}</div>
                <div><span class="text-muted">ORCID:</span> ${au.orcid ? `<code style="color:${sc};">${au.orcid}</code>` : '<em>not provided</em>'}</div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="small fw-bold text-uppercase text-secondary mb-1" style="letter-spacing:0.05em;font-size:0.65rem;">From OpenAlex</div>
              <div style="font-size:0.78rem;background:rgba(0,0,0,0.18);padding:6px 8px;border-radius:4px;">
                ${au.openalex.concepts.length > 0 ? `<div><span class="text-muted">Top concepts:</span> ${au.openalex.concepts.join(', ')}</div>` : '<div class="text-muted"><em>No matching profile returned.</em></div>'}
                ${au.openalex.note ? `<div class="mt-1" style="color:rgba(255,255,255,0.55);font-size:0.72rem;">${au.openalex.note}</div>` : ''}
              </div>
            </div>
          </div>
          <div class="small fw-bold text-uppercase text-secondary mb-1" style="letter-spacing:0.05em;font-size:0.65rem;">Signal-by-signal</div>
          <table class="table table-sm mb-0" style="font-size:0.72rem;background:transparent;">
            <tbody>
              ${sigs.map(([label, val, mx]) => {
                const c = val >= 70 ? '#34d399' : val >= 40 ? '#fbbf24' : '#f87171';
                const emoji = val >= 70 ? '✓' : val >= 40 ? '~' : '✗';
                return `<tr style="border-top:1px solid rgba(255,255,255,0.04);">
                  <td style="padding:4px 6px;color:rgba(255,255,255,0.75);width:18%;">${label}</td>
                  <td style="padding:4px 6px;text-align:center;color:${c};font-family:var(--bs-font-monospace);width:14%;"><strong>${Math.round(val * mx / 100)}</strong><span class="text-muted"> / ${mx}</span></td>
                  <td style="padding:4px 6px;text-align:center;color:${c};width:8%;">${emoji}</td>
                  <td style="padding:4px 6px;color:rgba(255,255,255,0.6);">${val >= 70 ? 'OpenAlex profile matches strongly.' : val >= 40 ? 'Partial signal — some evidence found.' : 'No evidence found.'}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>`;
      }).join('')}
    `;
  }

  window.SciVerifyChecks = { renderReferences, renderAiDetection, renderAuthors };
})();
