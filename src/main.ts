import { api, auth } from '@appdeploy/client';

'use strict';

    const STORAGE_KEY = 'ai-business-portfolio.v0.1';
    const statusLabels = { planned: 'Planned', building: 'Building', validating: 'Validating', launched: 'Launched', paused: 'Paused', blocked: 'Blocked', archived: 'Archived' };
    const viewLabels = { overview: 'Overview', ventures: 'Businesses & products', build: 'Build board', integrations: 'Integrations', capabilities: 'Shared capabilities', activity: 'Evidence & activity' };
    const seed = {
      ventures: [
        { id: 'abp-core', name: 'AI Business Portfolio', kind: 'Portfolio platform', outcome: 'Build the reusable operating system for developing and managing multiple AI-enabled businesses.', status: 'building', owner: 'Portfolio team', regions: 'Global', next: 'Complete portfolio records and establish server-backed persistence.', repo: 'https://github.com/Loofy147/AI-Business-Portfolio', deployment: '', updatedAt: '2026-10-27T10:00:00.000Z', evidence: 'Repository created; initial implementation being established.' },
        { id: 'flowfoundry', name: 'FlowFoundry AI', kind: 'AI operations studio', outcome: 'Design and deliver reusable automation and customer-operations workflows with approval gates and execution evidence.', status: 'building', owner: 'Portfolio team', regions: 'Global', next: 'Bind repository source, validate authenticated workflows, and connect the first tested execution adapter.', repo: '', deployment: 'https://flowfoundry-ai-fu5ut1.v2.appdeploy.ai/', updatedAt: '2026-10-27T10:00:00.000Z', evidence: 'AppDeploy reports ready; read-only TinyFish smoke test observed the sign-in screen. Authenticated workflow tests remain open.' },
        { id: 'business-automation', name: 'AI Workflow Automation Services', kind: 'Productized service', outcome: 'Deliver controlled business-process automation with repeatable onboarding, deployment, monitoring, and maintenance.', status: 'planned', owner: 'Portfolio team', regions: 'Global; configure per deployment', next: 'Define first reusable service package and its execution adapter contract.', repo: '', deployment: '', updatedAt: '2026-10-27T10:00:00.000Z', evidence: 'Planned service line; implementation not yet started.' },
        { id: 'commerce-ops', name: 'Commerce Operations Toolkit', kind: 'Product / reusable module', outcome: 'Automate catalog, customer communication, order handoffs, and operational reporting for connected commerce systems.', status: 'planned', owner: 'Portfolio team', regions: 'Global; provider availability varies', next: 'Build a sandbox connector with restricted scopes and fixture-based tests.', repo: '', deployment: '', updatedAt: '2026-10-27T10:00:00.000Z', evidence: 'Planned capability; external provider is not connected.' },
        { id: 'content-ops', name: 'Content Operations Studio', kind: 'Productized service', outcome: 'Coordinate content drafting, localization, review, publishing, and measurable delivery outcomes.', status: 'planned', owner: 'Portfolio team', regions: 'Global', next: 'Design the approval and publishing state model.', repo: '', deployment: '', updatedAt: '2026-10-27T10:00:00.000Z', evidence: 'Planned service line; no customer work is represented.' },
        { id: 'customer-ops', name: 'AI Customer Operations', kind: 'Product / managed service', outcome: 'Deliver knowledge-grounded support and routing with explicit escalation and human decision boundaries.', status: 'planned', owner: 'Portfolio team', regions: 'Global; language and data controls per deployment', next: 'Create a synthetic support dataset and define answer-quality and escalation tests.', repo: '', deployment: '', updatedAt: '2026-10-27T10:00:00.000Z', evidence: 'Planned service line; no live customer data or channels connected.' },
        { id: 'data-systems', name: 'Business Intelligence Systems', kind: 'Productized service', outcome: 'Build observable dashboards and traceable reporting from authorized business data sources.', status: 'planned', owner: 'Portfolio team', regions: 'Global; data residency needs per customer', next: 'Define standard event and KPI schemas with data-quality checks.', repo: '', deployment: '', updatedAt: '2026-10-27T10:00:00.000Z', evidence: 'Planned service line; data sources not connected.' }
      ],
      tasks: [
        { id: 'task-repo-spec', title: 'Establish product specification and evidence policy', details: 'Define repository source of truth, lifecycle states, and the boundary between planned, implemented, tested, and deployed.', ventureId: 'abp-core', status: 'done', priority: 'P0', owner: 'Portfolio team', acceptance: 'Specification and evidence lifecycle are documented in the repository.' },
        { id: 'task-build-ui', title: 'Build interactive portfolio console', details: 'Create and edit ventures, filter records, update task status, maintain integration notes, and export portable JSON.', ventureId: 'abp-core', status: 'building', priority: 'P0', owner: 'Portfolio team', acceptance: 'Core flows work in-browser; input validation and local persistence are explicit.' },
        { id: 'task-ci', title: 'Add repeatable repository validation', details: 'Validate required files, HTML structure invariants, and the JSON parsing and test metadata policy in CI.', ventureId: 'abp-core', status: 'planned', priority: 'P0', owner: 'Portfolio team', acceptance: 'The validation command passes locally and in GitHub Actions.' },
        { id: 'task-storage', title: 'Replace browser-only data with durable account-scoped storage', details: 'Choose the shared server/database boundary, identity model, authorization rules, migration strategy, and backup/restore checks.', ventureId: 'abp-core', status: 'planned', priority: 'P0', owner: 'Portfolio team', acceptance: 'Two test identities cannot read or modify each other’s records; data survives a new browser/session.' },
        { id: 'task-execution', title: 'Implement safe workflow execution contract', details: 'Define job lifecycle, stable request IDs, idempotency receipts, bounded retries, cancellation, checkpoints, and failure recovery.', ventureId: 'flowfoundry', status: 'planned', priority: 'P0', owner: 'Portfolio team', acceptance: 'Duplicate requests do not duplicate effects; unknown outcomes are reconciled from receipts.' },
        { id: 'task-adapter', title: 'Build and test the first n8n adapter', details: 'Use a controlled test workflow, scoped credentials, webhook authentication, validated payloads, and sanitized run output.', ventureId: 'flowfoundry', status: 'planned', priority: 'P0', owner: 'Portfolio team', acceptance: 'An authorized test run succeeds; unauthorized, malformed, duplicate, and failed runs are safely handled.' },
        { id: 'task-costs', title: 'Instrument usage, latency, and costs', details: 'Track each workflow, provider/model usage, successful task cost, retries, escalations, and budget thresholds.', ventureId: 'flowfoundry', status: 'planned', priority: 'P1', owner: 'Portfolio team', acceptance: 'Metrics reconcile against provider usage records for a controlled test window.' },
        { id: 'task-release', title: 'Create release and rollback procedure', details: 'Document staging-to-production promotion, versioned configuration, migration safety, health checks, and rollback validation.', ventureId: 'abp-core', status: 'planned', priority: 'P1', owner: 'Portfolio team', acceptance: 'A rehearsal restores the previous release and passes smoke tests.' }
      ],
      integrations: [
        { id: 'n8n', name: 'n8n', role: 'Workflow orchestration', category: 'Automation', url: 'https://n8n.io/integrations/', status: 'candidate', evidence: 'Official integration directory located. No workflow connection or execution test has been performed.', region: 'Check hosting and data processing per deployment.' },
        { id: 'openai', name: 'OpenAI API', role: 'Model and AI capabilities', category: 'AI', url: 'https://platform.openai.com/docs', status: 'candidate', evidence: 'Official developer documentation link. API credentials, chosen model, data configuration, limits, and tests are not set here.', region: 'Availability and data terms vary by product and use.' },
        { id: 'base44', name: 'Base44', role: 'AI application prototyping', category: 'App building', url: 'https://base44.com/developers', status: 'candidate', evidence: 'Official developer page. Portability, authorization, and integration constraints require per-product review.', region: 'Confirm current service availability and terms.' },
        { id: 'supabase', name: 'Supabase', role: 'Database and application services', category: 'Data', url: 'https://supabase.com/docs', status: 'candidate', evidence: 'Official documentation link only. No project or database is connected to this browser prototype.', region: 'Choose a supported region that fits the service and customer requirements.' },
        { id: 'shopify', name: 'Shopify', role: 'Commerce API', category: 'Commerce', url: 'https://shopify.dev/docs/api', status: 'candidate', evidence: 'Official API documentation link only. No shop or app permission is configured.', region: 'Store availability and payment services vary by country.' },
        { id: 'resend', name: 'Resend', role: 'Transactional email', category: 'Communication', url: 'https://resend.com/docs', status: 'candidate', evidence: 'Official documentation link only. No domain, credential, delivery test, or webhook is configured.', region: 'Deliverability and applicable messaging requirements depend on sender and recipients.' },
        { id: 'google-workspace', name: 'Google Workspace APIs', role: 'Email, files, and calendars', category: 'Productivity', url: 'https://developers.google.com/workspace', status: 'candidate', evidence: 'Official developer docs only. No OAuth consent, scopes, app credentials, or API test is configured.', region: 'Verify consent, data access, and service availability for each deployment.' },
        { id: 'github-actions', name: 'GitHub Actions', role: 'Continuous integration', category: 'Engineering', url: 'https://docs.github.com/en/actions', status: 'candidate', evidence: 'Official documentation link. Repository workflow will be added and results recorded separately.', region: 'Repository and runner controls must be reviewed.' }
      ],
      capabilities: [
        { id: 'cap-identity', name: 'Identity and authorization', purpose: 'Account/tenant boundaries, roles, operator permissions, credential scopes.', state: 'specification', reuse: 'All products and integrations', priority: 'P0' },
        { id: 'cap-workflow', name: 'Workflow runtime', purpose: 'Jobs, state transitions, stable request IDs, idempotency, retries, cancellation, recovery.', state: 'specification', reuse: 'Automation and every provider adapter', priority: 'P0' },
        { id: 'cap-connectors', name: 'Connector and plugin adapters', purpose: 'Typed inputs/outputs, credential scopes, rate limits, retries, redaction, health checks.', state: 'registry started', reuse: 'All business service lines', priority: 'P0' },
        { id: 'cap-telemetry', name: 'Observability and cost ledger', purpose: 'Correlated events, task success, latency, token/API usage, provider costs, alerts.', state: 'planned', reuse: 'All products', priority: 'P0' },
        { id: 'cap-approvals', name: 'Human approvals and policy gates', purpose: 'Review before consequential actions, authorization decisions, approvals with traces.', state: 'prototype concepts', reuse: 'Customer messaging, writes, commerce, releases', priority: 'P0' },
        { id: 'cap-data', name: 'Shared data and audit', purpose: 'Versioned schemas, scoped persistence, tamper-aware audit, retention and export.', state: 'planned', reuse: 'All products', priority: 'P0' },
        { id: 'cap-release', name: 'Deployment and recovery', purpose: 'Staging, checks, release promotion, rollback, backup/restore, incident runbooks.', state: 'planned', reuse: 'All products', priority: 'P1' },
        { id: 'cap-eval', name: 'Quality evaluation', purpose: 'Golden test cases, regression checks, human review, outcome and cost thresholds.', state: 'planned', reuse: 'AI tasks, workflow runs, customer-facing outputs', priority: 'P1' }
      ],
      activity: [
        { id: 'evt-init', action: 'repository initialized', details: 'The AI Business Portfolio repository is the source of truth. Initial product workspace and evidence policy are being established.', time: '2026-10-27T10:00:00.000Z', state: 'FACT' },
        { id: 'evt-flowfoundry', action: 'related deployment recorded', details: 'FlowFoundry AppDeploy URL recorded as a reference; current deployment and authenticated workflow behavior must be rechecked independently.', time: '2026-10-27T10:00:00.000Z', state: 'USER_REPORTED' }
      ]
    };

    let state = loadState();
    let currentView = 'overview';
    let currentSearch = '';
    let currentStatusFilter = 'all';
    let currentModal = null;
    let authUser = null;
    let authStatus = 'checking';
    let authError = '';
    let syncState = 'idle';
    let syncReady = false;
    let syncTimer = null;
    let syncInFlight = false;
    let syncAgain = false;
    const LEGACY_IMPORTED_KEY = STORAGE_KEY + '.legacy-imported';
    const userCacheKey = userId => STORAGE_KEY + '.user.' + String(userId || '').replace(/[^A-Za-z0-9_-]/g, '_');

    function loadState(storageKey = STORAGE_KEY) {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return structuredClone(seed);
        const saved = JSON.parse(raw);
        return {
          ventures: Array.isArray(saved.ventures) ? saved.ventures : structuredClone(seed.ventures),
          tasks: Array.isArray(saved.tasks) ? saved.tasks : structuredClone(seed.tasks),
          integrations: Array.isArray(saved.integrations) ? saved.integrations : structuredClone(seed.integrations),
          capabilities: Array.isArray(saved.capabilities) ? saved.capabilities : structuredClone(seed.capabilities),
          activity: Array.isArray(saved.activity) ? saved.activity : structuredClone(seed.activity)
        };
      } catch (e) {
        return structuredClone(seed);
      }
    }

    function persist() {
      try {
        const storageKey = authUser ? userCacheKey(authUser.userId) : STORAGE_KEY;
        localStorage.setItem(storageKey, JSON.stringify(state));
        if (authUser && syncReady) scheduleRemoteSync();
        return true;
      } catch (e) {
        toast('Browser storage is unavailable or full. Export the portfolio JSON before closing this tab.');
        return false;
      }
    }

    function snapshotForServer(source = state) {
      return { ventures: source.ventures, tasks: source.tasks, integrations: source.integrations, capabilities: source.capabilities, activity: source.activity };
    }

    function normalizeRemoteState(raw) {
      const value = raw && typeof raw === 'object' ? raw : {};
      return {
        ventures: Array.isArray(value.ventures) ? value.ventures : [],
        tasks: Array.isArray(value.tasks) ? value.tasks : [],
        integrations: Array.isArray(value.integrations) ? value.integrations : [],
        capabilities: Array.isArray(value.capabilities) ? value.capabilities : [],
        activity: Array.isArray(value.activity) ? value.activity : []
      };
    }

    function bootstrapPayloadFor(user) {
      try {
        const cached = localStorage.getItem(userCacheKey(user.userId));
        if (cached) return normalizeRemoteState(JSON.parse(cached));
      } catch (e) {
        console.warn('Account-local cache could not be read; default seed will be used.');
      }
      if (localStorage.getItem(LEGACY_IMPORTED_KEY) === '1') return structuredClone(seed);
      return loadState(STORAGE_KEY);
    }

    function errorText(err, fallback) {
      return err?.response?.data?.error || err?.response?.data?.message || err?.message || fallback;
    }

    function updateChrome() {
      const control = document.getElementById('auth-control');
      const indicator = document.getElementById('sync-status');
      if (control) {
        control.textContent = authUser ? 'Sign out' : (authStatus === 'loading' ? 'Opening…' : 'Sign in');
        control.disabled = authStatus === 'checking' || authStatus === 'loading';
        control.title = authUser ? 'Sign out of this account' : 'Sign in to load your private portfolio';
      }
      if (!indicator) return;
      let label = 'Sign-in required';
      let color = 'amber';
      if (authStatus === 'checking') label = 'Checking session…';
      else if (authStatus === 'loading') label = 'Loading private workspace…';
      else if (authStatus === 'error') { label = 'Workspace error'; color = 'red'; }
      else if (authStatus === 'ready') {
        if (syncState === 'syncing') label = 'Saving…';
        else if (syncState === 'error' || syncState === 'conflict') { label = syncState === 'conflict' ? 'Sync conflict' : 'Sync needs attention'; color = 'red'; }
        else { label = 'Account synced'; color = 'green'; }
      }
      indicator.innerHTML = '<span class="dot ' + (color === 'red' ? '' : color) + '"></span> ' + esc(label);
      indicator.classList.toggle('sync-warning', color === 'red');
    }

    function renderAuthGate() {
      const busy = authStatus === 'checking' || authStatus === 'loading';
      const heading = authStatus === 'checking' ? 'Checking your session.'
        : authStatus === 'loading' ? 'Loading your workspace.'
        : authStatus === 'error' ? 'Workspace needs attention.'
        : 'Your portfolio, synced to your account.';
      const message = authStatus === 'checking' ? 'Checking whether you already have an active session.'
        : authStatus === 'loading' ? 'Retrieving your private records and safely initializing the workspace when necessary.'
        : authStatus === 'error' ? (authError || 'The workspace could not be loaded. Retry the request; no successful sync is assumed.')
        : 'Sign in to use account-scoped persistent records. Your business register, build tasks, integration evidence, and activity will be stored on the server under your authenticated account.';
      const action = authUser
        ? '<button class="btn btn-primary" data-action="retry-workspace"' + (busy ? ' disabled' : '') + '>Retry workspace load →</button>'
        : '<button class="btn btn-primary" data-action="sign-in"' + (busy ? ' disabled' : '') + '>Sign in securely →</button>';
      return '<section class="auth-gate"><div class="auth-gate-mark">◈</div><div class="eyebrow"><span class="dot green"></span> PRIVATE WORKSPACE / GLOBAL SCOPE</div><h2>' + esc(heading) + '</h2><p>' + esc(message) + '</p>' +
        (authError && authStatus !== 'error' ? '<div class="auth-error">' + esc(authError) + '</div>' : '') +
        '<div class="auth-benefits"><div><strong>Account-scoped data</strong><span>Each signed-in account receives a separate server-side data namespace.</span></div><div><strong>Durable records</strong><span>Changes sync to the backend instead of relying on this browser alone.</span></div><div><strong>External actions stay off</strong><span>Provider execution remains disabled until its adapter is configured and tested.</span></div></div>' +
        action + '<p class="field-hint">On first sign-in, an empty account workspace can be initialized from this browser’s legacy portfolio. After initialization, the server copy is authoritative. Do not store secrets in portfolio notes.</p></section>';
    }

    function scheduleRemoteSync() {
      if (!authUser || !syncReady) return;
      if (syncTimer) clearTimeout(syncTimer);
      syncTimer = setTimeout(() => { syncTimer = null; void syncWorkspaceNow(); }, 450);
    }

    async function syncWorkspaceNow(showToast = false) {
      if (!authUser || !syncReady) return false;
      if (syncInFlight) { syncAgain = true; return false; }
      syncInFlight = true;
      syncState = 'syncing';
      updateChrome();
      const payload = snapshotForServer(structuredClone(state));
      try {
        const syncResponse = await api.put('/api/workspace', payload);
        const versions = syncResponse.data?.versions || {};
        for (const collection of ['ventures', 'tasks', 'integrations', 'capabilities', 'activity']) {
          const versionMap = versions[collection] || {};
          for (const item of state[collection]) {
            if (versionMap[item.id]) item._version = versionMap[item.id];
          }
        }
        localStorage.setItem(userCacheKey(authUser.userId), JSON.stringify(state));
        syncState = 'synced';
        authError = '';
        if (showToast) toast('Portfolio changes saved to your account.');
        return true;
      } catch (err) {
        syncState = err?.response?.status === 409 ? 'conflict' : 'error';
        try {
          localStorage.setItem(userCacheKey(authUser.userId) + '.conflict', JSON.stringify(state));
        } catch (cacheError) {
          console.warn('Conflict snapshot could not be retained locally.');
        }
        authError = errorText(err, 'Could not synchronize portfolio records.');
        toast('Sync failed: ' + authError + '. Local changes are retained in this browser; retry before signing out.');
        return false;
      } finally {
        syncInFlight = false;
        updateChrome();
        if (syncAgain) {
          syncAgain = false;
          scheduleRemoteSync();
        }
      }
    }

    async function loadAccountWorkspace(user) {
      authUser = user;
      authStatus = 'loading';
      authError = '';
      syncReady = false;
      syncState = 'idle';
      render();
      try {
        let response = await api.get('/api/workspace');
        let workspace = response.data || {};
        if (workspace.bootstrapStatus !== 'complete') {
          const payload = bootstrapPayloadFor(user);
          try {
            await api.post('/api/workspace/bootstrap', payload);
          } catch (bootstrapError) {
            const check = await api.get('/api/workspace');
            if ((check.data || {}).bootstrapStatus !== 'complete') throw bootstrapError;
            workspace = check.data;
          }
          if (workspace.bootstrapStatus !== 'complete') {
            response = await api.get('/api/workspace');
            workspace = response.data || {};
          }
        }
        if (workspace.bootstrapStatus !== 'complete') {
          throw new Error('Workspace initialization did not reach the complete state. Retry to resume safely.');
        }
        state = normalizeRemoteState(workspace.state);
        localStorage.setItem(LEGACY_IMPORTED_KEY, '1');
        localStorage.setItem(userCacheKey(user.userId), JSON.stringify(state));
        authStatus = 'ready';
        syncReady = true;
        syncState = 'synced';
        currentView = 'overview';
        currentSearch = '';
        render();
        if (Array.isArray(workspace.truncated) && workspace.truncated.length) {
          toast('Some collections exceed the current page limit: ' + workspace.truncated.join(', ') + '. Pagination is required before expanding these records.');
        } else {
          toast('Private workspace loaded from the server.');
        }
      } catch (err) {
        authStatus = 'error';
        authError = errorText(err, 'Could not load the account workspace.');
        syncReady = false;
        render();
      }
    }

    async function startSignIn() {
      authError = '';
      authStatus = 'loading';
      render();
      try {
        const result = await auth.signIn({ scope: 'openid email profile offline_access' });
        await loadAccountWorkspace(result.user);
      } catch (err) {
        authUser = null;
        authStatus = 'signed_out';
        authError = errorText(err, 'Sign-in did not complete. Allow the popup and retry.');
        render();
      }
    }

    async function startSignOut() {
      if (syncReady) {
        if (syncTimer) { clearTimeout(syncTimer); syncTimer = null; }
        const saved = await syncWorkspaceNow(true);
        if (!saved) return;
      }
      await auth.signOut();
      authUser = null;
      authStatus = 'signed_out';
      authError = '';
      syncReady = false;
      syncState = 'idle';
      state = structuredClone(seed);
      currentView = 'overview';
      render();
    }

    async function bootAuth() {
      render();
      try {
        const user = await auth.getUser();
        if (user) await loadAccountWorkspace(user);
        else {
          authStatus = 'signed_out';
          render();
        }
      } catch (err) {
        authStatus = 'signed_out';
        authError = errorText(err, 'Could not check the sign-in session.');
        render();
      }
    }

    async function refreshWorkspace() {
      if (authUser) {
        if (syncState === 'conflict') {
          toast('A newer server version exists. Your unsynced local snapshot was retained for recovery; reloading will show the server version.');
          await loadAccountWorkspace(authUser);
          return;
        }
        if (syncState === 'error') {
          const saved = await syncWorkspaceNow(true);
          if (!saved) return;
        }
        await loadAccountWorkspace(authUser);
      } else {
        state = loadState(STORAGE_KEY);
        render();
      }
    }

    function esc(value) {
      return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
    }

    function id(prefix) {
      return prefix + '-' + (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));
    }

    function fmtDate(value) {
      if (!value || Number.isNaN(new Date(value).getTime())) return 'Unknown';
      return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
    }

    function statusBadge(status) {
      const key = statusLabels[status] ? status : 'planned';
      return '<span class="badge status-' + key + '"><span class="dot"></span>' + esc(statusLabels[key]) + '</span>';
    }

    function ventureName(ventureId) {
      const item = state.ventures.find(x => x.id === ventureId);
      return item ? item.name : 'Portfolio-wide';
    }

    function addActivity(action, details, evidenceState = 'USER_REPORTED') {
      state.activity.unshift({ id: id('evt'), action, details, time: new Date().toISOString(), state: evidenceState });
      state.activity = state.activity.slice(0, 100);
      persist();
    }

    function toast(message) {
      const root = document.getElementById('toast-root');
      root.innerHTML = '<div class="toast" role="status">' + esc(message) + '</div>';
      clearTimeout(toast.timer);
      toast.timer = setTimeout(() => { root.innerHTML = ''; }, 3600);
    }

    function changeView(view) {
      if (authStatus !== 'ready' || !viewLabels[view]) return;
      currentView = view;
      currentSearch = '';
      document.querySelectorAll('#nav button').forEach(button => {
        button.classList.toggle('active', button.dataset.view === view);
        button.setAttribute('aria-current', button.dataset.view === view ? 'page' : 'false');
      });
      document.getElementById('breadcrumb').textContent = viewLabels[view];
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('scrim').hidden = true;
      render();
      document.getElementById('page').focus({ preventScroll: true });
    }

    function render() {
      const page = document.getElementById('page');
      updateChrome();
      if (authStatus !== 'ready') {
        page.innerHTML = renderAuthGate();
        bindViewEvents();
        return;
      }
      if (currentView === 'overview') page.innerHTML = renderOverview();
      if (currentView === 'ventures') page.innerHTML = renderVentures();
      if (currentView === 'build') page.innerHTML = renderBuild();
      if (currentView === 'integrations') page.innerHTML = renderIntegrations();
      if (currentView === 'capabilities') page.innerHTML = renderCapabilities();
      if (currentView === 'activity') page.innerHTML = renderActivity();
      document.getElementById('integration-nav-count').textContent = state.integrations.filter(x => x.status !== 'verified').length;
      bindViewEvents();
    }

    function pageHeader(eyebrow, title, subtitle, action = '') {
      return '<div class="page-head"><div><div class="eyebrow"><span class="dot green"></span>' + esc(eyebrow) + '</div><h1>' + title + '</h1><p>' + esc(subtitle) + '</p></div>' + action + '</div>';
    }

    function renderOverview() {
      const building = state.ventures.filter(x => x.status === 'building').length;
      const validating = state.ventures.filter(x => x.status === 'validating').length;
      const launched = state.ventures.filter(x => x.status === 'launched').length;
      const openTasks = state.tasks.filter(x => x.status !== 'done').length;
      const verified = state.integrations.filter(x => x.status === 'verified').length;
      const activeVentures = state.ventures.filter(x => x.status !== 'paused');
      const recent = [...state.ventures].sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0,5);
      return pageHeader('Portfolio command', 'Build more. <span>Reuse what works.</span>', 'One operating workspace for building multiple businesses, products, and reusable systems across regions.', '<button class="btn btn-primary" data-action="new-venture">＋ New business / product</button>') +
        '<section class="stats" aria-label="Portfolio summary">' +
          stat('Businesses & products', state.ventures.length, 'registered records', '◈', 'Portfolio records are not revenue claims.') +
          stat('In build', building, validating + ' validating', '▦', 'Lifecycle state recorded per product.') +
          stat('Open build tasks', openTasks, state.tasks.filter(x=>x.status==='done').length + ' marked done', '◷', 'Task state is local to this browser.') +
          stat('Verified integrations', verified, state.integrations.length + ' candidates tracked', '⛓', 'No connector is verified by this prototype.') +
        '</section>' +
        '<div class="grid-2"><section class="panel"><div class="panel-head"><div><h2>Portfolio activity</h2><p>Actual implementation status, not opportunity scoring</p></div><button class="text-btn" data-view="ventures">All records →</button></div>' +
          (recent.length ? '<div class="table-wrap"><table><thead><tr><th>Business / product</th><th>State</th><th>Updated</th></tr></thead><tbody>' + recent.map(x=>'<tr><td><div class="venture-cell"><div class="venture-icon">' + esc(x.name.slice(0,1).toUpperCase()) + '</div><div><strong>' + esc(x.name) + '</strong><small>' + esc(x.kind) + '</small></div></div></td><td>' + statusBadge(x.status) + '</td><td class="quiet">' + fmtDate(x.updatedAt) + '</td></tr>').join('') + '</tbody></table></div>' : emptyBlock('No records yet','Add a business or product to start the portfolio.','new-venture')) +
        '</section><div class="side-stack"><section class="panel"><div class="panel-head"><div><h2>Build integrity</h2><p>Current system boundaries</p></div><span style="color:var(--accent)">◇</span></div><div class="control-list">' +
          controlRow('Portfolio records','Editable in this browser; shared storage not configured.','◈','pending') +
          controlRow('Source of truth','GitHub repository is intended as the versioned specification and code record.','⌘','ok') +
          controlRow('External execution','No provider is called by this prototype.','⛓','pending') +
          controlRow('Authorization','Client-side status is not a server permission boundary.','▣','pending') +
        '</div></section><section class="panel"><div class="panel-head"><div><h2>Next engineering steps</h2><p>Highest-priority unfinished work</p></div><button class="text-btn" data-view="build">Open board →</button></div><div class="control-list">' +
          state.tasks.filter(x=>x.status!=='done').slice(0,3).map(t=>'<div class="control"><span class="control-icon">▦</span><div><strong>' + esc(t.title) + '</strong><p>' + esc(t.details) + '</p></div><span class="pending">' + esc(t.priority) + '</span></div>').join('') +
        '</div></section></div></div>' +
        '<div class="callout"><div class="callout-icon">✧</div><div class="callout-content"><strong>Build the shared layer once; keep each business independently operable.</strong><p>Identity, workflows, connectors, approvals, telemetry, testing, and releases should become reusable capabilities—not one-off glue code.</p></div><button class="btn btn-secondary" data-view="capabilities">Shared capabilities →</button></div>' +
        '<div class="banner"><span>ⓘ</span><div><strong>Prototype boundary</strong><p>This version stores records in browser localStorage. Use it to operate the UI and shape the data model, not as multi-device persistence or a production system of record. Export your data regularly while working locally.</p></div></div>';
    }

    function stat(title, value, sub, icon, foot) {
      return '<div class="stat"><div class="stat-head"><span>' + esc(title) + '</span><span class="stat-icon">' + esc(icon) + '</span></div><div class="stat-value">' + esc(value) + '<small>' + esc(sub) + '</small></div><div class="stat-foot">' + esc(foot) + '</div></div>';
    }

    function controlRow(title, text, icon, stateClass) {
      return '<div class="control"><span class="control-icon">' + esc(icon) + '</span><div><strong>' + esc(title) + '</strong><p>' + esc(text) + '</p></div><span class="' + (stateClass === 'ok' ? 'ok' : 'pending') + '">' + (stateClass === 'ok' ? '✓' : '•') + '</span></div>';
    }

    function renderVentures() {
      const list = filterVentures();
      return pageHeader('Business register','Businesses & <span>products.</span>','Treat each business as an independently deployable unit with explicit status, deliverable, next step, and implementation evidence.','<button class="btn btn-primary" data-action="new-venture">＋ New business / product</button>') +
        '<div class="toolbar"><label class="search"><span>⌕</span><input id="venture-search" type="search" value="' + esc(currentSearch) + '" placeholder="Search names, outcomes, regions…" aria-label="Search businesses and products"></label><select id="venture-status-filter" class="select" aria-label="Filter by lifecycle state"><option value="all">All states</option>' + Object.keys(statusLabels).map(x=>'<option value="'+x+'" '+(currentStatusFilter===x?'selected':'')+'>'+statusLabels[x]+'</option>').join('') + '</select><span class="result-count">' + list.length + ' of ' + state.ventures.length + ' records</span></div>' +
        (list.length ? '<div class="venture-grid">' + list.map(ventureCard).join('') + '</div>' : emptyBlock('No matching records','Change the filter or add a new business/product.','new-venture'));
    }

    function filterVentures() {
      const term = currentSearch.trim().toLowerCase();
      return state.ventures.filter(x => (currentStatusFilter === 'all' || x.status === currentStatusFilter) && (!term || [x.name,x.kind,x.outcome,x.regions,x.next,x.owner].some(v=>String(v||'').toLowerCase().includes(term))));
    }

    function ventureCard(x) {
      const taskCount = state.tasks.filter(t=>t.ventureId===x.id).length;
      const doneCount = state.tasks.filter(t=>t.ventureId===x.id && t.status==='done').length;
      const links = (x.repo ? '<a href="'+esc(x.repo)+'" target="_blank" rel="noreferrer" class="btn btn-quiet btn-sm">Source ↗</a>' : '') + (x.deployment ? '<a href="'+esc(x.deployment)+'" target="_blank" rel="noreferrer" class="btn btn-quiet btn-sm">Deployment ↗</a>' : '');
      return '<article class="venture-card"><div class="venture-card-top"><div class="venture-icon">'+esc(x.name.slice(0,1).toUpperCase())+'</div><div class="venture-title"><h3>'+esc(x.name)+'</h3><small>'+esc(x.kind)+'</small></div>'+statusBadge(x.status)+'</div><p>'+esc(x.outcome)+'</p><div class="venture-meta"><div><span class="meta-label">Regions</span><span class="meta-value">'+esc(x.regions||'Not specified')+'</span></div><div><span class="meta-label">Build tasks</span><span class="meta-value">'+doneCount+' / '+taskCount+' complete</span></div><div><span class="meta-label">Owner</span><span class="meta-value">'+esc(x.owner||'Unassigned')+'</span></div><div><span class="meta-label">Last changed</span><span class="meta-value">'+fmtDate(x.updatedAt)+'</span></div></div><div class="next-step"><strong>NEXT IMPLEMENTATION STEP</strong><span>'+esc(x.next||'Not specified')+'</span></div><div class="card-actions">'+links+'<button class="btn btn-secondary btn-sm" data-action="edit-venture" data-id="'+esc(x.id)+'">Edit record</button><button class="btn btn-secondary btn-sm" data-action="venture-status" data-id="'+esc(x.id)+'">Change state</button>'+(x.status!=='archived'?'<button class="btn btn-quiet btn-sm" data-action="archive-venture" data-id="'+esc(x.id)+'">Archive</button>':'')+'</div></article>';
    }

    function renderBuild() {
      const open = state.tasks.filter(x=>x.status!=='done').length;
      const done = state.tasks.filter(x=>x.status==='done').length;
      const percent = state.tasks.length ? Math.round(done/state.tasks.length*100) : 0;
      const tasks = state.tasks;
      return pageHeader('Implementation control','Build board. <span>Ship evidence.</span>','Prioritize implementation, integration testing, reliability controls, and repeatable delivery. Completion is recorded locally and must be confirmed by external evidence.','<button class="btn btn-primary" data-action="new-task">＋ Add build task</button>') +
        '<div class="build-layout"><section class="panel"><div class="panel-head"><div><h2>Implementation backlog</h2><p>Change a task status as work progresses</p></div><span class="result-count">'+open+' open</span></div><div class="task-list">'+(tasks.length?tasks.map(taskRow).join(''):emptyBlock('No tasks yet','Add the first implementation task.','new-task'))+'</div></section><div class="side-stack"><section class="panel"><div class="panel-head"><div><h2>Build progress</h2><p>Derived from current local task states</p></div></div><div class="build-summary"><div class="progress-row"><strong>'+percent+'%</strong><span>'+done+' done · '+open+' open</span></div><div class="progress-track"><div class="progress-fill" style="width:'+percent+'%"></div></div>'+[
          ['1','Make data durable','Move from browser storage to authenticated persistent storage.'],
          ['2','Implement execution','Build one real adapter with request IDs and recovery.'],
          ['3','Prove isolation','Test role/tenant boundaries and unauthorized calls.'],
          ['4','Measure the system','Track success, latency, failures, usage, and per-task cost.'],
          ['5','Release safely','Run staging checks, backup/restore, and rollback rehearsal.']
        ].map(m=>'<div class="milestone"><span>'+m[0]+'</span><div><strong>'+m[1]+'</strong><p>'+m[2]+'</p></div></div>').join('')+'</div></section><section class="panel"><div class="panel-head"><div><h2>Readiness gates</h2><p>Do not claim production-ready until met</p></div></div><div class="control-list">'+controlRow('Authorization tests','At least two identities and explicit denied paths.','▣','pending')+controlRow('Failure and recovery','Retry, timeout, duplicate request, and unknown outcome cases.','↻','pending')+controlRow('Cost limits','Per-provider quotas, budgets, and cancellation.','＄','pending')+controlRow('Release evidence','CI result, deployment status, smoke test, rollback path.','✓','pending')+'</div></section></div></div>';
    }

    function taskRow(t) {
      const checked = t.status==='done'?'checked':'';
      const taskStatus = t.status==='done'?'done':t.status==='building'?'building':'planned';
      return '<div class="task '+(t.status==='done'?'done':'')+'"><input type="checkbox" data-task-toggle="'+esc(t.id)+'" '+checked+' aria-label="Mark '+esc(t.title)+' as done"><div><strong>'+esc(t.title)+'</strong><small>'+esc(t.details)+'<br>Business: '+esc(ventureName(t.ventureId))+' · Owner: '+esc(t.owner||'Unassigned')+'</small><small>Acceptance: '+esc(t.acceptance||'Not defined')+'</small></div><div class="action-row"><span class="priority '+(t.priority==='P0'?'p0':t.priority==='P1'?'p1':'')+'">'+esc(t.priority)+'</span><select class="select" style="min-height:27px;padding:0 5px" data-task-status="'+esc(t.id)+'" aria-label="Task status">'+['planned','building','done'].map(s=>'<option value="'+s+'" '+(t.status===s?'selected':'')+'>'+({planned:'Planned',building:'Building',done:'Done'}[s])+'</option>').join('')+'</select><button class="icon-btn" style="width:27px;height:27px" data-action="edit-task" data-id="'+esc(t.id)+'" title="Edit task" aria-label="Edit task">✎</button></div></div>';
    }

    function renderIntegrations() {
      const list = state.integrations.filter(x=>!currentSearch || [x.name,x.role,x.category,x.evidence,x.region].some(v=>String(v||'').toLowerCase().includes(currentSearch.toLowerCase())));
      const candidates = state.integrations.filter(x=>x.status==='candidate').length;
      const configured = state.integrations.filter(x=>x.status==='configured').length;
      const tested = state.integrations.filter(x=>x.status==='tested').length;
      const verified = state.integrations.filter(x=>x.status==='verified').length;
      return pageHeader('Provider and connector registry','Integrations. <span>Prove each one.</span>','Track official docs, credentials, supported operations, limitations, and reproducible test evidence. Nothing is marked connected by default.','<button class="btn btn-primary" data-action="new-integration">＋ Add integration</button>')+
        '<div class="registry-stats"><div><span>Candidate</span><strong>'+candidates+'</strong></div><div><span>Configured (operator-recorded)</span><strong>'+configured+'</strong></div><div><span>Tested (evidence recorded)</span><strong>'+tested+'</strong></div><div><span>Verified (evidence recorded)</span><strong>'+verified+'</strong></div></div>'+
        '<div class="banner" style="margin-top:0;margin-bottom:15px"><span>ⓘ</span><div><strong>What “verified” means here</strong><p>The UI records your evidence statement; it does not run provider tests or independently authenticate claims. Link a reproducible test result, CI run, or official reference. Never store API keys, tokens, or sensitive customer data in these notes.</p></div></div>'+
        '<div class="toolbar"><label class="search"><span>⌕</span><input id="integration-search" type="search" value="'+esc(currentSearch)+'" placeholder="Search providers, categories, evidence…" aria-label="Search integrations"></label><span class="result-count">'+list.length+' tracked</span></div>'+
        (list.length?'<div class="integration-grid">'+list.map(integrationCard).join('')+'</div>':emptyBlock('No matching integrations','Search a different term or add a provider.','new-integration'));
    }

    function integrationCard(x) {
      const labels={candidate:'Candidate',configured:'Configured',tested:'Tested',verified:'Verified · evidence'};
      const classes={candidate:'status-planned',configured:'status-building',tested:'status-validating',verified:'status-launched'};
      return '<article class="integration-card"><div class="integration-top"><div class="integration-icon">⛓</div><span class="badge '+(classes[x.status]||classes.candidate)+'"><span class="dot"></span>'+esc(labels[x.status]||'Candidate')+'</span></div><h3>'+esc(x.name)+'</h3><span class="integration-role">'+esc(x.role)+' · '+esc(x.category)+'</span><p>'+esc(x.evidence)+'</p><div class="integration-bottom"><span class="tiny-label">'+esc(x.region||'Region not assessed')+'</span><a href="'+esc(x.url)+'" target="_blank" rel="noreferrer">Official link ↗</a></div><div class="card-actions"><button class="btn btn-secondary btn-sm" data-action="edit-integration" data-id="'+esc(x.id)+'">Record evidence</button></div></article>';
    }

    function renderCapabilities() {
      return pageHeader('Reusable engineering assets','Shared <span>capabilities.</span>','Each capability should have an owner, a contract, tests, operational telemetry, and a clear consumer list before being reused across businesses.','<button class="btn btn-primary" data-action="new-capability">＋ Add capability</button>')+
        '<div class="venture-grid">'+state.capabilities.map(c=>'<article class="venture-card"><div class="venture-card-top"><div class="venture-icon">✧</div><div class="venture-title"><h3>'+esc(c.name)+'</h3><small>Priority '+esc(c.priority)+'</small></div><span class="badge status-planned"><span class="dot"></span>'+esc(c.state)+'</span></div><p>'+esc(c.purpose)+'</p><div class="venture-meta"><div><span class="meta-label">Reuse across</span><span class="meta-value">'+esc(c.reuse)+'</span></div><div><span class="meta-label">Maturity</span><span class="meta-value">Not production-validated</span></div></div><div class="card-actions"><button class="btn btn-secondary btn-sm" data-action="edit-capability" data-id="'+esc(c.id)+'">Edit capability</button></div></article>').join('')+'</div>'+
        '<div class="banner"><span>ⓘ</span><div><strong>Reusable does not mean universally suitable</strong><p>Each consumer must inherit security boundaries, but choose its own configuration, provider permissions, data retention, regional settings, and acceptance criteria.</p></div></div>';
    }

    function renderActivity() {
      return pageHeader('Change history and evidence','Evidence & <span>activity.</span>','This is a local, operator-editable record of notable changes—not a tamper-proof security audit log. Production audit events must be written server-side.','<button class="btn btn-secondary" data-action="export">⇩ Export records</button>')+
        '<div class="panel"><div class="panel-head"><div><h2>Recent events</h2><p>Newest first · locally stored in this browser</p></div><span class="evidence-state">LOCAL RECORDS</span></div><div class="activity-list">'+(state.activity.length?state.activity.map(e=>'<div class="activity-item"><div class="activity-icon">◷</div><div class="activity-body"><div class="activity-top"><strong>'+esc(e.action)+'</strong><time>'+fmtDate(e.time)+'</time></div><p>'+esc(e.details)+'</p><span class="tiny-label">Claim state: '+esc(e.state||'USER_REPORTED')+'</span></div></div>').join(''):emptyBlock('No activity','Changes will appear here.',''))+'</div></div>'+
        '<div class="banner"><span>ⓘ</span><div><strong>Evidence policy</strong><p>Store claims, source, timestamp, scope, and verification method together. Keep credentials and customer secrets out of the record. Do not upgrade the claim status merely because the same statement is repeated.</p></div></div>';
    }

    function emptyBlock(title, text, action) {
      return '<div class="empty"><div class="big">＋</div><h3>'+esc(title)+'</h3><p>'+esc(text)+'</p>'+(action?'<button class="btn btn-primary" data-action="'+esc(action)+'">Create record</button>':'')+'</div>';
    }

    function bindViewEvents() {
      document.querySelectorAll('[data-view]').forEach(element => {
        element.onclick = () => changeView(element.dataset.view);
      });
      document.querySelectorAll('[data-action]').forEach(element => {
        element.onclick = () => handleAction(element.dataset.action, element.dataset.id || '');
      });
      const search = document.getElementById('venture-search') || document.getElementById('integration-search');
      if (search) search.oninput = event => {
        currentSearch = event.target.value;
        const start = event.target.selectionStart;
        const end = event.target.selectionEnd;
        render();
        const next = document.getElementById('venture-search') || document.getElementById('integration-search');
        if (next) { next.focus(); next.setSelectionRange(start,end); }
      };
      const statusFilter = document.getElementById('venture-status-filter');
      if (statusFilter) statusFilter.onchange = event => { currentStatusFilter = event.target.value; render(); };
      document.querySelectorAll('[data-task-toggle]').forEach(input => {
        input.onchange = () => {
          const task = state.tasks.find(t=>t.id===input.dataset.taskToggle);
          if (!task) return;
          task.status = input.checked ? 'done' : 'planned';
          addActivity('build task status changed', task.title + ' marked ' + task.status + '. Changes are local and require independent completion evidence.', 'USER_REPORTED');
          render(); toast('Task status updated locally.');
        };
      });
      document.querySelectorAll('[data-task-status]').forEach(select => {
        select.onchange = () => {
          const task = state.tasks.find(t=>t.id===select.dataset.taskStatus);
          if (!task) return;
          task.status = select.value;
          addActivity('build task status changed', task.title + ' marked ' + task.status + '. Changes are local and require independent completion evidence.', 'USER_REPORTED');
          render();
        };
      });
    }

    function handleAction(action, recordId) {
      if (action === 'new-venture') return openVentureForm();
      if (action === 'edit-venture') return openVentureForm(state.ventures.find(x=>x.id===recordId));
      if (action === 'venture-status') return openStatusForm(state.ventures.find(x=>x.id===recordId));
      if (action === 'archive-venture') return openArchiveForm(state.ventures.find(x=>x.id===recordId));
      if (action === 'new-task') return openTaskForm();
      if (action === 'edit-task') return openTaskForm(state.tasks.find(x=>x.id===recordId));
      if (action === 'new-integration') return openIntegrationForm();
      if (action === 'edit-integration') return openIntegrationForm(state.integrations.find(x=>x.id===recordId));
      if (action === 'new-capability') return openCapabilityForm();
      if (action === 'edit-capability') return openCapabilityForm(state.capabilities.find(x=>x.id===recordId));
      if (action === 'export') return exportState();
      if (action === 'sign-in') return void startSignIn();
      if (action === 'retry-workspace') return void loadAccountWorkspace(authUser);
    }

    function showModal(title, subtitle, fields, submitLabel, onSubmit, warning = '') {
      const root = document.getElementById('modal-root');
      root.innerHTML = '<div class="modal-backdrop" id="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-head"><div><div class="eyebrow"><span class="dot green"></span>PORTFOLIO RECORD</div><h2 id="modal-title">'+esc(title)+'</h2><p>'+esc(subtitle)+'</p></div><button class="icon-btn" type="button" id="modal-close" aria-label="Close dialog">✕</button></div><form class="modal-form" id="modal-form" novalidate>'+fields+(warning?'<div class="banner" style="margin-top:0"><span>ⓘ</span><div><strong>Evidence boundary</strong><p>'+esc(warning)+'</p></div></div>':'')+'<div class="form-message" id="form-message" role="alert"></div><div class="form-actions"><button type="button" class="btn btn-quiet" id="modal-cancel">Cancel</button><button type="submit" class="btn btn-primary">'+esc(submitLabel)+'</button></div></form></section></div>';
      root.querySelector('#modal-close').onclick = closeModal;
      root.querySelector('#modal-cancel').onclick = closeModal;
      root.querySelector('#modal-backdrop').onclick = event => { if (event.target.id === 'modal-backdrop') closeModal(); };
      root.querySelector('#modal-form').onsubmit = event => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = Object.fromEntries(new FormData(form).entries());
        form.querySelectorAll('input[type=checkbox][name]').forEach(c => data[c.name] = c.checked);
        try {
          const result = onSubmit(data);
          if (result === false) return;
          closeModal();
          persist();
          render();
        } catch (err) {
          const message = root.querySelector('#form-message');
          message.textContent = err.message || 'Please review the entered values.';
          message.classList.add('show');
        }
      };
      currentModal = root.querySelector('#modal-form');
      const first = root.querySelector('input:not([type=checkbox]),textarea,select');
      if (first) first.focus();
      document.onkeydown = event => { if (event.key === 'Escape') closeModal(); };
    }

    function closeModal() {
      document.getElementById('modal-root').innerHTML = '';
      currentModal = null;
      document.onkeydown = null;
    }

    function field(label, name, value, type='text', required=false, hint='') {
      const safeValue = esc(value || '');
      const req = required ? ' required maxlength="500"' : ' maxlength="1000"';
      if (type === 'textarea') return '<label class="field">'+esc(label)+(required?' *':'')+'<textarea name="'+esc(name)+'"'+req+' placeholder="Enter '+esc(label.toLowerCase())+'">'+safeValue+'</textarea>'+(hint?'<span class="field-hint">'+esc(hint)+'</span>':'')+'</label>';
      if (type === 'select') return '<label class="field">'+esc(label)+(required?' *':'')+'<select name="'+esc(name)+'"'+(required?' required':'')+'>'+value.map(option=>'<option value="'+esc(option.value)+'" '+(option.value===option.selected?'selected':'')+'>'+esc(option.label)+'</option>').join('')+'</select></label>';
      const inputType = type === 'url' ? 'url' : 'text';
      return '<label class="field">'+esc(label)+(required?' *':'')+'<input type="'+inputType+'" name="'+esc(name)+'" value="'+safeValue+'"'+req+' placeholder="'+esc(hint)+'">'+(type==='url'?'<span class="field-hint">Optional. Do not place access tokens or secrets in URLs.</span>':'')+'</label>';
    }

    function selectOptions(values, selected) {
      return values.map(value=>({ value, label: value.charAt(0).toUpperCase()+value.slice(1).replace(/_/g,' '), selected }));
    }

    function openVentureForm(item) {
      const v = item || { name:'',kind:'Product / service',outcome:'',status:'planned',owner:'Portfolio team',regions:'Global',next:'',repo:'',deployment:'',evidence:'' };
      const editing = Boolean(item);
      const html = field('Business / product name','name',v.name,'text',true,'')+
        field('Type','kind',v.kind,'text',true,'')+
        field('Purpose and intended outcome','outcome',v.outcome,'textarea',true,'State the product outcome, not a market thesis.')+
        '<div class="form-row">'+field('Lifecycle state','status',selectOptions(Object.keys(statusLabels),v.status),'select',true)+field('Owner','owner',v.owner,'text',false,'')+'</div>'+
        field('Regions served','regions',v.regions,'text',false,'Global or selected regions; configure specifics per service.')+
        field('Next implementation step','next',v.next,'textarea',false,'What will be built or verified next?')+
        '<div class="form-row">'+field('Source repository URL','repo',v.repo,'url',false,'https://github.com/owner/repo')+field('Deployment URL','deployment',v.deployment,'url',false,'https://…')+'</div>'+
        field('Evidence and current limitations','evidence',v.evidence,'textarea',false,'What is confirmed? What remains unknown?');
      showModal(editing?'Edit business / product':'Add business / product','Each record tracks what is being built, current evidence, and the next concrete implementation step.',html,editing?'Save changes':'Create record',data=>{
        if (!data.name.trim() || !data.kind.trim() || !data.outcome.trim()) throw new Error('Name, type, and intended outcome are required.');
        const record = { ...v, name:data.name.trim(), kind:data.kind.trim(), outcome:data.outcome.trim(), status:data.status, owner:data.owner.trim()||'Unassigned', regions:data.regions.trim()||'Global', next:data.next.trim(), repo:validUrl(data.repo), deployment:validUrl(data.deployment), evidence:data.evidence.trim(), updatedAt:new Date().toISOString() };
        if (editing) Object.assign(item,record); else state.ventures.unshift({id:id('venture'),...record});
        addActivity(editing?'business / product updated':'business / product created',record.name+' record saved. Status: '+statusLabels[record.status]+'. '+(record.evidence||'No evidence note provided.'),'USER_REPORTED');
        toast(editing?'Record updated locally.':'Business/product added locally.');
      },'Lifecycle status reflects recorded state only. Deployment links are references; the UI does not verify that a URL is live.');
    }

    function openArchiveForm(item) {
      if (!item || item.status === 'archived') return;
      const html = field('Type ARCHIVE to confirm','confirmation','','text',true,'Type ARCHIVE');
      showModal(
        'Archive business / product',
        'Archive this record without deleting its history or associated build tasks.',
        html,
        'Archive record',
        data => {
          if (data.confirmation.trim() !== 'ARCHIVE') {
            throw new Error('Type ARCHIVE exactly to confirm this action.');
          }
          const previous = item.status;
          item.status = 'archived';
          item.updatedAt = new Date().toISOString();
          item.evidence = (item.evidence ? item.evidence + ' ' : '') +
            'Archived on ' + item.updatedAt + ' by a local operator; previous state: ' + previous + '.';
          addActivity(
            'business / product archived',
            item.name + ' archived from ' + statusLabels[previous] + '. The record and related tasks were retained.',
            'USER_REPORTED'
          );
          toast('Business/product archived. Record and tasks retained.');
        },
        'This is a reversible local state change, not permanent deletion. Use Change state to restore the record. State changes are not server-enforced in this prototype.'
      );
    }

    function openStatusForm(item) {
      if (!item) return;
      const html = field('Lifecycle state','status',selectOptions(Object.keys(statusLabels),item.status),'select',true)+field('Evidence for the state change','evidence',item.evidence,'textarea',true,'Describe the observable result, test artifact, commit, or deployment check.');
      showModal('Record implementation state','A state label is not verification. Explain the evidence and the scope it covers.',html,'Save state',data=>{
        if (!data.evidence.trim()) throw new Error('Enter the evidence or explicit reason this state remains unverified.');
        const previous=item.status;
        item.status=data.status;
        item.evidence=data.evidence.trim();
        item.updatedAt=new Date().toISOString();
        addActivity('business / product state changed',item.name+' changed from '+statusLabels[previous]+' to '+statusLabels[item.status]+'. Evidence note: '+item.evidence,'USER_REPORTED');
        toast('State change recorded. Independent verification may still be required.');
      },'This form records an operator statement only. It does not run tests or independently verify a deployment.');
    }

    function openTaskForm(task) {
      const t = task || {title:'',details:'',ventureId:state.ventures[0]?.id||'',status:'planned',priority:'P1',owner:'Portfolio team',acceptance:''};
      const editing = Boolean(task);
      const ventureOptions = state.ventures.map(v=>({value:v.id,label:v.name,selected:v.id===t.ventureId}));
      const html = field('Task title','title',t.title,'text',true,'')+
        field('Implementation details','details',t.details,'textarea',true,'')+
        field('Business / product','ventureId',[{value:'',label:'Portfolio-wide',selected:!t.ventureId},...ventureOptions],'select',false)+
        '<div class="form-row">'+field('Priority','priority',selectOptions(['P0','P1','P2'],t.priority),'select',true)+field('Task state','status',selectOptions(['planned','building','done'],t.status),'select',true)+'</div>'+
        field('Owner','owner',t.owner,'text',false,'')+
        field('Acceptance criteria','acceptance',t.acceptance,'textarea',true,'Specify observable, repeatable completion criteria.');
      showModal(editing?'Edit build task':'Add build task','Tasks should have a concrete output and testable acceptance criteria.',html,editing?'Save task':'Add task',data=>{
        if (!data.title.trim() || !data.details.trim() || !data.acceptance.trim()) throw new Error('Task title, details, and acceptance criteria are required.');
        const record={...t,title:data.title.trim(),details:data.details.trim(),ventureId:data.ventureId||'',status:data.status,priority:data.priority,owner:data.owner.trim()||'Unassigned',acceptance:data.acceptance.trim()};
        if (editing) Object.assign(task,record); else state.tasks.push({id:id('task'),...record});
        addActivity(editing?'build task updated':'build task created',record.title+' saved with state '+record.status+'. Acceptance: '+record.acceptance,'USER_REPORTED');
        toast('Build task saved locally.');
      });
    }

    function openIntegrationForm(item) {
      const x=item||{name:'',role:'',category:'Automation',url:'',status:'candidate',evidence:'',region:''};
      const editing=Boolean(item);
      const html=field('Provider / integration name','name',x.name,'text',true,'')+
        field('Role in the system','role',x.role,'text',true,'')+
        '<div class="form-row">'+field('Category','category',x.category,'text',true,'')+field('Official documentation URL','url',x.url,'url',true,'https://…')+'</div>'+
        field('Evidence state','status',selectOptions(['candidate','configured','tested','verified'],x.status),'select',true)+
        field('Evidence note / artifact','evidence',x.evidence,'textarea',true,'State what was actually done and link a test result, official contract, or CI run where possible.')+
        field('Regional / operational constraints','region',x.region,'textarea',false,'Availability, data processing, quotas, language, support, and other relevant constraints.');
      showModal(editing?'Update integration evidence':'Register integration candidate','Record capabilities and test state without representing untested connections as live.',html,editing?'Save evidence':'Add integration',data=>{
        if(!data.name.trim()||!data.role.trim()||!data.url.trim()||!data.evidence.trim()) throw new Error('Name, role, documentation URL, and evidence note are required.');
        const newUrl=validUrl(data.url);
        if(!newUrl) throw new Error('Enter a valid HTTPS documentation URL.');
        if(data.status==='verified' && !/(https:\/\/|commit|test|ci|run id|sha256|verified by)/i.test(data.evidence)) throw new Error('For Verified, include a test artifact, commit, CI/run reference, hash, or explicit verification record.');
        const record={...x,name:data.name.trim(),role:data.role.trim(),category:data.category.trim(),url:newUrl,status:data.status,evidence:data.evidence.trim(),region:data.region.trim()};
        if(editing) Object.assign(item,record); else state.integrations.push({id:id('integration'),...record});
        addActivity('integration registry updated',record.name+' recorded as '+record.status+'. Evidence: '+record.evidence,'USER_REPORTED');
        toast('Integration evidence record saved. The provider was not called by this UI.');
      },'Evidence text is operator-entered. “Verified” is an asserted record until corroborated by the referenced test, CI run, or provider response.');
    }

    function openCapabilityForm(item) {
      const c=item||{name:'',purpose:'',state:'specification',reuse:'',priority:'P1'};
      const editing=Boolean(item);
      const html=field('Capability name','name',c.name,'text',true,'')+
        field('Purpose and contract','purpose',c.purpose,'textarea',true,'')+
        field('Reusable consumers','reuse',c.reuse,'textarea',true,'')+
        '<div class="form-row">'+field('Maturity state','state',''+c.state,'text',true,'planned, specification, prototype, tested, production')+field('Priority','priority',selectOptions(['P0','P1','P2'],c.priority),'select',true)+'</div>';
      showModal(editing?'Edit shared capability':'Add shared capability','Define reusable components separately from the businesses that consume them.',html,editing?'Save capability':'Add capability',data=>{
        if(!data.name.trim()||!data.purpose.trim()||!data.reuse.trim()) throw new Error('Name, purpose, and reusable consumers are required.');
        const record={...c,name:data.name.trim(),purpose:data.purpose.trim(),state:data.state.trim(),reuse:data.reuse.trim(),priority:data.priority};
        if(editing) Object.assign(item,record); else state.capabilities.push({id:id('cap'),...record});
        addActivity(editing?'shared capability updated':'shared capability created',record.name+' capability record updated. Maturity remains an operator record.','USER_REPORTED');
        toast('Shared capability saved locally.');
      });
    }

    function validUrl(value) {
      const text=String(value||'').trim();
      if (!text) return '';
      try {
        const url=new URL(text);
        return url.protocol==='https:'?url.href:'';
      } catch (e) { return ''; }
    }

    function exportState() {
      const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),schemaVersion:'0.1.0',scope:'local browser workspace; records are not independently verified',...state},null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob);
      const anchor=document.createElement('a');
      anchor.href=url; anchor.download='ai-business-portfolio-export.json'; anchor.click();
      URL.revokeObjectURL(url);
      toast('Export requested. Store the file securely; it may contain operational notes.');
      addActivity('portfolio exported','A JSON export was generated from the current browser state.','USER_REPORTED');
    }

    document.getElementById('nav').addEventListener('click',event=>{
      const button=event.target.closest('button[data-view]');
      if(button) changeView(button.dataset.view);
    });
    document.getElementById('menu-btn').addEventListener('click',()=>{
      document.getElementById('sidebar').classList.add('open');
      document.getElementById('scrim').hidden=false;
    });
    document.getElementById('scrim').addEventListener('click',()=>{
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('scrim').hidden=true;
    });
    document.getElementById('refresh-btn').addEventListener('click', () => { void refreshWorkspace(); });
    document.getElementById('auth-control').addEventListener('click', () => {
      if (authUser) void startSignOut();
      else void startSignIn();
    });
    document.getElementById('export-btn').addEventListener('click', exportState);
    void bootAuth();