// ── State ──────────────────────────────────────────────────────────────
let TOKEN        = localStorage.getItem('admin_token');
let CURRENT_USER = null;

// ── Helpers ────────────────────────────────────────────────────────────
async function api(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (TOKEN) opts.headers['Authorization'] = `Bearer ${TOKEN}`;
  if (body)  opts.body = JSON.stringify(body);

  const res = await fetch(`/api${path}`, opts);
  if (res.status === 401) { logout(); return null; }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    toast(`Error: ${err.error || res.statusText}`, 'error');
    return null;
  }
  return res.json();
}

function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  document.getElementById('toasts').appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function esc(str, attr = false) {
  const s = String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return attr ? s.replace(/"/g, '&quot;') : s;
}

function showTab(name) {
  document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
  const panel = document.getElementById(`tab-${name}`);
  if (panel) panel.style.display = 'block';
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.nav-btn[data-tab="${name}"]`)?.classList.add('active');
  ({ dashboard: loadDashboard, competencies: loadCompetencies, resources: loadResources,
     learners: loadLearners, goals: loadGoals, audit: loadAudit })[name]?.();
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('modal-content').innerHTML = '';
}

// ── Auth ───────────────────────────────────────────────────────────────
async function login() {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-error');
  errEl.textContent = '';

  const data = await api('POST', '/auth/login', { email, password });
  if (!data) { errEl.textContent = 'Invalid credentials'; return; }

  TOKEN = data.token;
  CURRENT_USER = data.user;
  localStorage.setItem('admin_token', TOKEN);
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-app').style.display    = 'flex';
  document.getElementById('admin-user-name').textContent = `${CURRENT_USER.name} (${CURRENT_USER.role})`;
  showTab('dashboard');
}

function logout() {
  TOKEN = null; CURRENT_USER = null;
  localStorage.removeItem('admin_token');
  document.getElementById('admin-app').style.display    = 'none';
  document.getElementById('login-screen').style.display = 'flex';
}

// ── Dashboard ──────────────────────────────────────────────────────────
async function loadDashboard() {
  const [stats, goals] = await Promise.all([
    api('GET', '/stats'),
    api('GET', '/admin/goals'),
  ]);
  if (!stats) return;

  document.getElementById('dashboard-stats').innerHTML = `
    <div class="stat-cards">
      <div class="stat-card"><b>${stats.totalCompetencies}</b><span>Competencies</span></div>
      <div class="stat-card"><b>${stats.totalResources}</b><span>Resources</span></div>
      <div class="stat-card"><b>${stats.totalLearners}</b><span>Learners</span></div>
      <div class="stat-card"><b>${goals?.length ?? 0}</b><span>Goals</span></div>
      <div class="stat-card"><b>${stats.activePaths}</b><span>Active Paths</span></div>
      <div class="stat-card"><b>${stats.totalMasteries}</b><span>Mastered Skills</span></div>
    </div>`;

  document.getElementById('dashboard-top-gaps').innerHTML = `
    <div class="dash-section">
      <h3>Top Competency Gaps</h3>
      <ol>${(stats.gapFrequency || []).map(c =>
        `<li>${esc(c.name)} <span class="muted">(${c.learnerCount} learners)</span></li>`
      ).join('') || '<li class="muted">No data</li>'}</ol>
    </div>`;

  document.getElementById('dashboard-top-resources').innerHTML = `
    <div class="dash-section" style="flex:1">
      <h3>Top Resources Used</h3>
      <ol>${(stats.topResources || []).map(r =>
        `<li>${esc(r.name)} <span class="muted">(${r.usageCount}×)</span></li>`
      ).join('') || '<li class="muted">No data</li>'}</ol>
    </div>
    <div class="dash-section" style="flex:1">
      <h3>Learner Readiness</h3>
      ${(stats.readinessBuckets || []).map(b => `
        <div class="bucket-row">
          <span>${esc(b.bucket)}</span>
          <span class="badge badge-active">${b.learnerCount}</span>
        </div>`).join('')}
    </div>`;
}

// ── Competencies ───────────────────────────────────────────────────────
async function loadCompetencies() {
  const params = new URLSearchParams();
  const q      = document.getElementById('comp-search')?.value;
  const domain = document.getElementById('comp-filter-domain')?.value;
  const status = document.getElementById('comp-filter-status')?.value;
  if (q)      params.set('q', q);
  if (domain) params.set('domain', domain);
  if (status) params.set('status', status);

  const data = await api('GET', `/admin/competencies?${params}`);
  if (!data) return;

  document.getElementById('comp-tbody').innerHTML = data.map(c => `
    <tr>
      <td>${esc(c.name)}</td>
      <td>${(c.domain || '').replace('_', ' ')}</td>
      <td>${c.bloom_level}</td>
      <td>${c.eqf_level}</td>
      <td><span class="badge badge-${c.status}">${c.status}</span></td>
      <td>${c.prereq_count}</td>
      <td>${c.resource_count}</td>
      <td>
        <button onclick="openCompForm(${c.id})">Edit</button>
        <button onclick="managePrereqs(${c.id},${JSON.stringify(c.name)})">Prereqs</button>
        <button onclick="archiveComp(${c.id})">Archive</button>
      </td>
    </tr>`).join('') || '<tr><td colspan="8" class="muted">No results</td></tr>';
}

async function openCompForm(id) {
  let c = { domain: 'data_science', bloom_level: 2, eqf_level: 4, status: 'active' };
  if (id) { const f = await api('GET', `/admin/competencies/${id}`); if (!f) return; c = f; }

  document.getElementById('modal-content').innerHTML = `
    <h3>${id ? 'Edit' : 'New'} Competency</h3>
    <label>Name<input id="f-name" value="${esc(c.name || '', true)}"></label>
    <label>Description<textarea id="f-desc">${esc(c.description || '')}</textarea></label>
    <label>Domain
      <select id="f-domain">
        <option value="data_science" ${c.domain === 'data_science' ? 'selected' : ''}>Data Science</option>
        <option value="web_dev"      ${c.domain === 'web_dev'      ? 'selected' : ''}>Web Dev</option>
      </select>
    </label>
    <label>Bloom Level (1–6)<input type="number" id="f-bloom" min="1" max="6" value="${c.bloom_level}"></label>
    <label>EQF Level (1–8)<input type="number"   id="f-eqf"   min="1" max="8" value="${c.eqf_level}"></label>
    <label>Status
      <select id="f-status">
        <option value="active"   ${c.status === 'active'   ? 'selected' : ''}>Active</option>
        <option value="archived" ${c.status === 'archived' ? 'selected' : ''}>Archived</option>
      </select>
    </label>
    <div class="modal-actions">
      <button onclick="saveComp(${id || 'null'})">Save</button>
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
    </div>`;
  document.getElementById('modal').style.display = 'flex';
}

async function saveComp(id) {
  const body = {
    name:        document.getElementById('f-name').value.trim(),
    description: document.getElementById('f-desc').value.trim() || null,
    domain:      document.getElementById('f-domain').value,
    bloom_level: Number(document.getElementById('f-bloom').value),
    eqf_level:   Number(document.getElementById('f-eqf').value),
    status:      document.getElementById('f-status').value,
  };
  if (!body.name) return toast('Name is required', 'error');
  const ok = id ? await api('PATCH', `/admin/competencies/${id}`, body)
                : await api('POST',  '/admin/competencies', body);
  if (ok) { closeModal(); loadCompetencies(); }
}

async function archiveComp(id) {
  if (!confirm('Archive this competency?')) return;
  const ok = await api('DELETE', `/admin/competencies/${id}`);
  if (ok) loadCompetencies();
}

async function managePrereqs(id, name) {
  const [prereqs, all] = await Promise.all([
    api('GET', `/admin/competencies/${id}/prerequisites`),
    api('GET', '/admin/competencies?status=active'),
  ]);
  if (!prereqs || !all) return;
  const prereqIds = new Set(prereqs.map(p => p.id));

  document.getElementById('modal-content').innerHTML = `
    <h3>Prerequisites — ${esc(name)}</h3>
    <ul style="margin-bottom:16px">${prereqs.length
      ? prereqs.map(p => `<li style="margin-bottom:6px">${esc(p.name)}
          <span class="muted">EQF ${p.eqf_level}</span>
          <button onclick="removePrereq(${id},${p.id},${JSON.stringify(name)})">✕</button></li>`).join('')
      : '<li class="muted">None</li>'}</ul>
    <label>Add prerequisite
      <select id="prereq-select">
        <option value="">— select —</option>
        ${all.filter(c => c.id !== id && !prereqIds.has(c.id))
            .map(c => `<option value="${c.id}">${esc(c.name, true)} (EQF ${c.eqf_level})</option>`)
            .join('')}
      </select>
    </label>
    <div class="modal-actions">
      <button onclick="addPrereq(${id},${JSON.stringify(name)})">Add</button>
      <button class="btn-secondary" onclick="closeModal()">Close</button>
    </div>`;
  document.getElementById('modal').style.display = 'flex';
}

async function addPrereq(compId, name) {
  const prereqId = document.getElementById('prereq-select').value;
  if (!prereqId) return toast('Select a prerequisite first', 'error');
  const ok = await api('POST', `/admin/competencies/${compId}/prerequisites`, { prerequisite_id: Number(prereqId) });
  if (ok) managePrereqs(compId, name);
}

async function removePrereq(compId, prereqId, name) {
  const ok = await api('DELETE', `/admin/competencies/${compId}/prerequisites/${prereqId}`);
  if (ok) managePrereqs(compId, name);
}

// ── Resources ──────────────────────────────────────────────────────────
async function loadResources() {
  const params = new URLSearchParams();
  const q      = document.getElementById('res-search')?.value;
  const status = document.getElementById('res-filter-status')?.value;
  if (q)      params.set('q', q);
  if (status) params.set('status', status);

  const data = await api('GET', `/admin/resources?${params}`);
  if (!data) return;

  document.getElementById('res-tbody').innerHTML = data.map(r => `
    <tr>
      <td>${esc(r.name)}</td>
      <td>${r.type}</td>
      <td>${r.difficulty}/5</td>
      <td>${r.duration_hours}h</td>
      <td><span class="badge badge-${r.status}">${r.status}</span></td>
      <td class="muted">${esc(r.competency_names || '—')}</td>
      <td>
        <button onclick="openResForm(${r.id})">Edit</button>
        <button onclick="approveResource(${r.id})">Approve</button>
        <button onclick="archiveResource(${r.id})">Archive</button>
      </td>
    </tr>`).join('') || '<tr><td colspan="7" class="muted">No results</td></tr>';
}

async function openResForm(id) {
  let r = { type: 'video', difficulty: 2, duration_hours: 2, language: 'en',
            status: 'draft', suitable_styles: '["visual"]' };
  if (id) { const f = await api('GET', `/admin/resources/${id}`); if (!f) return; r = f; }

  let styles = [];
  try { styles = JSON.parse(r.suitable_styles || '[]'); } catch {}

  document.getElementById('modal-content').innerHTML = `
    <h3>${id ? 'Edit' : 'New'} Resource</h3>
    <label>Name<input id="r-name" value="${esc(r.name || '', true)}"></label>
    <label>Description<textarea id="r-desc">${esc(r.description || '')}</textarea></label>
    <label>Type
      <select id="r-type">
        ${['video','article','exercise','project'].map(t =>
          `<option value="${t}" ${r.type === t ? 'selected' : ''}>${t}</option>`).join('')}
      </select>
    </label>
    <label>URL<input id="r-url" value="${esc(r.url || '', true)}" placeholder="https://…"></label>
    <label>Difficulty (1–5)<input type="number" id="r-diff"  min="1" max="5"  value="${r.difficulty}"></label>
    <label>Duration (hours)<input type="number" id="r-hours" min="0.5" step="0.5" value="${r.duration_hours}"></label>
    <label>Language<input id="r-lang" value="${esc(r.language || 'en', true)}"></label>
    <label>Status
      <select id="r-status">
        <option value="draft"    ${r.status === 'draft'    ? 'selected' : ''}>Draft</option>
        <option value="approved" ${r.status === 'approved' ? 'selected' : ''}>Approved</option>
        <option value="archived" ${r.status === 'archived' ? 'selected' : ''}>Archived</option>
      </select>
    </label>
    <fieldset style="border:1px solid #ddd;border-radius:4px;padding:10px;margin-bottom:12px">
      <legend style="padding:0 6px;font-weight:600">Suitable Styles</legend>
      <div style="display:flex;gap:16px;flex-wrap:wrap">
        ${['visual','auditory','reading','kinesthetic'].map(s => `
          <label style="font-weight:normal;display:flex;align-items:center;gap:4px">
            <input type="checkbox" name="r-style" value="${s}" ${styles.includes(s) ? 'checked' : ''}> ${s}
          </label>`).join('')}
      </div>
    </fieldset>
    <div class="modal-actions">
      <button onclick="saveRes(${id || 'null'})">Save</button>
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
    </div>`;
  document.getElementById('modal').style.display = 'flex';
}

async function saveRes(id) {
  const selectedStyles = [...document.querySelectorAll('input[name=r-style]:checked')].map(c => c.value);
  if (!selectedStyles.length) return toast('Select at least one learning style', 'error');
  const body = {
    name:           document.getElementById('r-name').value.trim(),
    description:    document.getElementById('r-desc').value.trim() || null,
    type:           document.getElementById('r-type').value,
    url:            document.getElementById('r-url').value.trim() || null,
    difficulty:     Number(document.getElementById('r-diff').value),
    duration_hours: Number(document.getElementById('r-hours').value),
    language:       document.getElementById('r-lang').value.trim() || 'en',
    status:         document.getElementById('r-status').value,
    suitable_styles: selectedStyles,
  };
  if (!body.name) return toast('Name is required', 'error');
  const ok = id ? await api('PATCH', `/admin/resources/${id}`, body)
                : await api('POST',  '/admin/resources', body);
  if (ok) { closeModal(); loadResources(); }
}

async function approveResource(id) {
  const ok = await api('PATCH', `/admin/resources/${id}`, { status: 'approved' });
  if (ok) loadResources();
}

async function archiveResource(id) {
  if (!confirm('Archive this resource?')) return;
  const ok = await api('DELETE', `/admin/resources/${id}`);
  if (ok) loadResources();
}

// ── Learners ───────────────────────────────────────────────────────────
async function loadLearners() {
  const data = await api('GET', '/admin/learners');
  if (!data) return;

  document.getElementById('learner-tbody').innerHTML = data.map(l => `
    <tr>
      <td>${esc(l.name)}</td>
      <td>${l.learning_style}</td>
      <td>${l.available_hours_week}h</td>
      <td>${(l.performance_score * 100).toFixed(0)}%</td>
      <td>${l.mastered_count}</td>
      <td>${l.goal_count}</td>
      <td>
        <button onclick="openLearnerForm(${l.id})">Edit</button>
        <button onclick="manageMastery(${l.id},${JSON.stringify(l.name)})">Mastery</button>
      </td>
    </tr>`).join('') || '<tr><td colspan="7" class="muted">No learners</td></tr>';
}

function editLearner(id) { openLearnerForm(id); }

async function openLearnerForm(id) {
  let l = { learning_style: 'visual', available_hours_week: 10,
            performance_score: 0.5, domain: 'data_science' };
  if (id) {
    const all = await api('GET', '/admin/learners');
    const found = all?.find(x => x.id === id);
    if (found) l = found;
  }

  document.getElementById('modal-content').innerHTML = `
    <h3>${id ? 'Edit' : 'New'} Learner</h3>
    <label>Name<input id="l-name" value="${esc(l.name || '', true)}"></label>
    <label>Learning Style
      <select id="l-style">
        ${['visual','auditory','reading','kinesthetic'].map(s =>
          `<option value="${s}" ${l.learning_style === s ? 'selected' : ''}>${s}</option>`).join('')}
      </select>
    </label>
    <label>Domain
      <select id="l-domain">
        <option value="data_science" ${l.domain === 'data_science' ? 'selected' : ''}>Data Science</option>
        <option value="web_dev"      ${l.domain === 'web_dev'      ? 'selected' : ''}>Web Dev</option>
      </select>
    </label>
    <label>Available Hours/Week<input type="number" id="l-hours" min="1" max="40" value="${l.available_hours_week}"></label>
    <label>Performance Score (0–1)<input type="number" id="l-score" min="0" max="1" step="0.05" value="${l.performance_score}"></label>
    <div class="modal-actions">
      <button onclick="saveLearner(${id || 'null'})">Save</button>
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
    </div>`;
  document.getElementById('modal').style.display = 'flex';
}

async function saveLearner(id) {
  const body = {
    name:                 document.getElementById('l-name').value.trim(),
    learning_style:       document.getElementById('l-style').value,
    domain:               document.getElementById('l-domain').value,
    available_hours_week: Number(document.getElementById('l-hours').value),
    performance_score:    Number(document.getElementById('l-score').value),
  };
  if (!body.name) return toast('Name is required', 'error');
  const ok = id ? await api('PATCH', `/admin/learners/${id}`, body)
                : await api('POST',  '/admin/learners', body);
  if (ok) { closeModal(); loadLearners(); }
}

async function manageMastery(learnerId, name) {
  const [mastery, allComps] = await Promise.all([
    api('GET', `/admin/learners/${learnerId}/mastery`),
    api('GET', '/admin/competencies?status=active'),
  ]);
  if (!mastery || !allComps) return;
  const masteredIds = new Set(mastery.map(m => m.id));

  document.getElementById('modal-content').innerHTML = `
    <h3>Mastery — ${esc(name)}</h3>
    <p style="margin-bottom:12px;color:#666">Check competencies the learner has mastered:</p>
    <div id="mastery-list" style="max-height:360px;overflow-y:auto">
      ${allComps.map(c => `
        <label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-weight:normal">
          <input type="checkbox" value="${c.id}" ${masteredIds.has(c.id) ? 'checked' : ''}>
          ${esc(c.name)} <span class="muted">EQF ${c.eqf_level} · ${(c.domain || '').replace('_',' ')}</span>
        </label>`).join('')}
    </div>
    <div class="modal-actions">
      <button onclick="saveMastery(${learnerId})">Save</button>
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
    </div>`;
  document.getElementById('modal').style.display = 'flex';
}

async function saveMastery(learnerId) {
  const competency_ids = [...document.querySelectorAll('#mastery-list input:checked')]
    .map(cb => Number(cb.value));
  const ok = await api('PATCH', `/admin/learners/${learnerId}/mastery`, { competency_ids });
  if (ok) { closeModal(); loadLearners(); }
}

// ── Goals ──────────────────────────────────────────────────────────────
async function loadGoals() {
  const data = await api('GET', '/admin/goals');
  if (!data) return;

  document.getElementById('goal-tbody').innerHTML = data.map(g => `
    <tr>
      <td>${esc(g.learner_name)}</td>
      <td>${esc(g.competency_name)}</td>
      <td>${g.eqf_level}</td>
      <td>${g.path_status
            ? `<span class="badge badge-${g.path_status}">${g.path_status}</span>`
            : '<span class="muted">—</span>'}</td>
      <td>${g.completed_steps || 0} / ${g.total_steps || 0}</td>
      <td>
        <button onclick="regeneratePath(${g.id})">Clear Path</button>
        <button onclick="deleteGoal(${g.id})">Delete</button>
      </td>
    </tr>`).join('') || '<tr><td colspan="6" class="muted">No goals</td></tr>';
}

async function openGoalForm() {
  const [learners, comps] = await Promise.all([
    api('GET', '/admin/learners'),
    api('GET', '/admin/competencies?status=active'),
  ]);
  if (!learners || !comps) return;

  document.getElementById('modal-content').innerHTML = `
    <h3>Assign Learning Goal</h3>
    <label>Learner
      <select id="g-learner">
        <option value="">— select learner —</option>
        ${learners.map(l => `<option value="${l.id}">${esc(l.name, true)}</option>`).join('')}
      </select>
    </label>
    <label>Target Competency
      <select id="g-comp">
        <option value="">— select competency —</option>
        ${comps.map(c => `<option value="${c.id}">${esc(c.name, true)} (EQF ${c.eqf_level})</option>`).join('')}
      </select>
    </label>
    <div class="modal-actions">
      <button onclick="saveGoal()">Assign</button>
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
    </div>`;
  document.getElementById('modal').style.display = 'flex';
}

async function saveGoal() {
  const learner_id    = Number(document.getElementById('g-learner').value);
  const competency_id = Number(document.getElementById('g-comp').value);
  if (!learner_id || !competency_id) return toast('Select both a learner and a competency', 'error');
  const ok = await api('POST', '/admin/goals', { learner_id, competency_id });
  if (ok) { closeModal(); loadGoals(); }
}

async function regeneratePath(goalId) {
  if (!confirm('Clear this learning path? The learner view will regenerate it on next load.')) return;
  const res = await api('POST', `/admin/goals/${goalId}/regenerate`);
  if (res) { toast(res.message, 'info'); loadGoals(); }
}

async function deleteGoal(goalId) {
  if (!confirm('Delete this goal and all associated path data? This cannot be undone.')) return;
  const ok = await api('DELETE', `/admin/goals/${goalId}`);
  if (ok) loadGoals();
}

// ── Audit Log ──────────────────────────────────────────────────────────
async function loadAudit() {
  const data = await api('GET', '/admin/goals/audit?limit=200');
  if (!data) return;

  document.getElementById('audit-tbody').innerHTML = data.map(a => `
    <tr>
      <td class="muted" style="white-space:nowrap">${a.created_at}</td>
      <td>${esc(a.user_name || '—')}</td>
      <td><code>${a.action}</code></td>
      <td>${a.entity_type}</td>
      <td>${a.entity_id || '—'}</td>
    </tr>`).join('') || '<tr><td colspan="5" class="muted">No records</td></tr>';
}

// ── Init ───────────────────────────────────────────────────────────────
(async function init() {
  ['login-email', 'login-password'].forEach(id =>
    document.getElementById(id)?.addEventListener('keydown', e => { if (e.key === 'Enter') login(); })
  );
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  document.getElementById('modal')?.addEventListener('click', e => {
    if (e.target.id === 'modal') closeModal();
  });

  if (TOKEN) {
    const me = await api('GET', '/auth/me');
    if (me) {
      CURRENT_USER = me.user;
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('admin-app').style.display    = 'flex';
      document.getElementById('admin-user-name').textContent = `${CURRENT_USER.name} (${CURRENT_USER.role})`;
      showTab('dashboard');
      return;
    }
  }
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('admin-app').style.display    = 'none';
})();
