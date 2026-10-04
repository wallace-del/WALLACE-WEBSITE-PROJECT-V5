(() => {

  const API_ROOT =
    (window.location.hostname === 'localhost' ||
     window.location.hostname === '127.0.0.1')
      ? 'http://127.0.0.1:5001'
      : window.location.origin;

  const API = `${API_ROOT}/api`;

  const $ = (id) => document.getElementById(id);

  const state = { projects: [] };

  const api = async (path, options = {}) => {
    const response = await fetch(`${API}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    let data = {};
    try { data = await response.json(); } catch {}
    if (!response.ok) {
      const error = new Error(data.error || `Request failed (${response.status})`);
      error.status = response.status;
      throw error;
    }
    return data;
  };

  const setStatus = (el, text = '', type = '') => {
    el.textContent = text;
    el.className = `status ${type}`.trim();
  };

  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  async function boot() {
    try {
      const { admin } = await api('/auth/me');
      showDashboard(admin);
      await refreshAll();
    } catch {
      showLogin();
    }
  }

  function showLogin() {
    $('loginView').classList.remove('hidden');
    $('dashboardView').classList.add('hidden');
  }

  function showDashboard(admin) {
    $('loginView').classList.add('hidden');
    $('dashboardView').classList.remove('hidden');
    $('adminIdentity').textContent = admin.email;
  }

  async function refreshSummary() {
    const data = await api('/admin/summary');
    $('messageCount').textContent = data.counts.messages;
    $('unreadCount').textContent = data.counts.unread;
    $('projectCount').textContent = data.counts.projects;
  }

  async function loadMessages() {
    setStatus($('messagesStatus'), 'Loading…');
    try {
      const data = await api('/admin/messages?limit=100');
      const list = $('messagesList');
      if (!data.items.length) list.innerHTML = '<div class="empty">No contact messages yet.</div>';
      else list.innerHTML = data.items.map(m => `
        <article class="message-card ${m.readAt ? '' : 'unread'}" data-message-id="${m.id}">
          <div class="message-meta"><span>#${m.id}</span><span>${escapeHtml(new Date(m.createdAt).toLocaleString())}</span><span>${m.readAt ? 'Read' : 'Unread'}</span></div>
          <h3>${escapeHtml(m.subject)}</h3>
          <div class="message-meta"><strong>${escapeHtml(m.name)}</strong><a href="mailto:${encodeURIComponent(m.email)}">${escapeHtml(m.email)}</a></div>
          <p>${escapeHtml(m.message)}</p>
          <div class="row-actions">
            ${m.readAt ? '' : `<button type="button" data-action="read" data-id="${m.id}">Mark read</button>`}
            <a class="secondary action-link" href="mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent(`Re: ${m.subject}`)}">Reply by email</a>
            <button type="button" class="danger" data-action="delete-message" data-id="${m.id}">Delete</button>
          </div>
        </article>`).join('');
      setStatus($('messagesStatus'), `${data.total} message${data.total === 1 ? '' : 's'}.`);
    } catch (e) { setStatus($('messagesStatus'), e.message, 'error'); }
  }

  async function loadProjects() {
    setStatus($('projectsStatus'), 'Loading…');
    try {
      const data = await api('/admin/projects');
      state.projects = data.items;
      renderProjects();
      setStatus($('projectsStatus'), `${data.items.length} project${data.items.length === 1 ? '' : 's'} loaded.`);
    } catch (e) { setStatus($('projectsStatus'), e.message, 'error'); }
  }

  function renderProjects() {
    const list = $('projectsList');
    if (!state.projects.length) {
      list.innerHTML = '<div class="empty">No projects yet. Create the first one.</div>';
      return;
    }
    list.innerHTML = state.projects.map(p => `
      <article class="project-card" data-project-id="${p.id}">
        <div class="project-meta"><span>${escapeHtml(p.status)}</span><span>Order ${p.sortOrder}</span>${p.featured ? '<span>Featured</span>' : ''}</div>
        <h3>${escapeHtml(p.name)}</h3>
        <p class="muted">/${escapeHtml(p.slug)}</p>
        ${(p.technologies || []).length ? `<p class="muted">${(p.technologies || []).map(escapeHtml).join(' • ')}</p>` : ''}
        <div class="row-actions">
          <button type="button" data-action="edit-project" data-id="${p.id}">Edit</button>
          <button type="button" class="danger" data-action="delete-project" data-id="${p.id}">Delete</button>
        </div>
      </article>`).join('');
  }

  function openProjectEditor(project = null) {
    $('projectForm').classList.remove('hidden');
    $('editorTitle').textContent = project ? 'Edit project' : 'New project';
    $('projectId').value = project?.id || '';
    $('projectName').value = project?.name || '';
    $('projectSlug').value = project?.slug || '';
    $('projectStatus').value = project?.status || '';
    $('projectPath').value = project?.path || '';
    $('projectImageUrl').value = project?.imageUrl || '';
    $('projectTechnologies').value = (project?.technologies || []).join('\n');
    $('projectGithubUrl').value = project?.githubUrl || '';
    $('projectLiveUrl').value = project?.liveUrl || '';
    $('projectFeatured').checked = Boolean(project?.featured);
    $('projectSortOrder').value = project?.sortOrder ?? 0;
    $('projectText').value = project?.text || '';
    updateProjectPreview();
    setStatus($('uploadStatus'));
    document.querySelectorAll('.project-card').forEach(card => card.classList.toggle('selected', Number(card.dataset.projectId) === project?.id));
  }

  function closeProjectEditor() {
    $('projectForm').reset();
    $('projectId').value = '';
    $('projectImagePreview').classList.add('hidden');
    $('projectImagePreview').removeAttribute('src');
    setStatus($('uploadStatus'));
    $('projectForm').classList.add('hidden');
    document.querySelectorAll('.project-card').forEach(card => card.classList.remove('selected'));
  }

  const lines = v => String(v || '').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  const groupsToText = groups => (groups || []).map(g => `${g.title}: ${(g.items || []).join(', ')}`).join('\n');
  const learningToText = groups => (groups || []).map(g => `${g.state} | ${g.title} | ${(g.items || []).join(', ')}`).join('\n');
  const parseGroups = text => lines(text).map(line => { const i=line.indexOf(':'); return i<0 ? {title:line,items:[]} : {title:line.slice(0,i).trim(),items:line.slice(i+1).split(',').map(x=>x.trim()).filter(Boolean)}; });
  const parseLearning = text => lines(text).map(line => { const [state='',title='',items=''] = line.split('|').map(x=>x.trim()); return {state,title,items:items.split(',').map(x=>x.trim()).filter(Boolean)}; }).filter(g=>g.state&&g.title);

  async function loadProfile() {
    try {
      const data=await api('/admin/profile'); const p=data.item; if(!p) return;
      $('profileName').value=p.name||''; $('profileRole').value=p.role||''; $('profileLocation').value=p.location||''; $('profileUniversity').value=p.university||''; $('profileStudyPeriod').value=p.studyPeriod||''; $('profileEmail').value=p.email||''; $('profileGithub').value=p.githubProfile||''; $('profileGithubRepo').value=p.githubRepo||''; $('profileLinkedin').value=p.linkedin||''; $('profileAboutHeadline').value=p.aboutHeadline||''; $('profileAboutText').value=p.aboutText||'';
      $('profileHeroFocus').value=(p.heroFocus||[]).join('\n'); $('profileDeveloping').value=(p.currentlyDeveloping||[]).join('\n'); $('profileSkillGroups').value=groupsToText(p.skillGroups); $('profileLearningGroups').value=learningToText(p.learningGroups); $('profileAvailability').value=(p.availability||[]).join('\n'); $('profileLanguages').value=(p.languages||[]).join('\n');
      setStatus($('profileStatus'),'Public content loaded.');
    } catch(e){ setStatus($('profileStatus'),e.message,'error'); }
  }

  function projectAssetUrl(value='') {
    if (!value) return '';
    return value.startsWith('/uploads/') ? `${API_ROOT}${value}` : value;
  }

  function updateProjectPreview() {
    const value = $('projectImageUrl').value.trim();
    const preview = $('projectImagePreview');
    if (!value) { preview.classList.add('hidden'); preview.removeAttribute('src'); return; }
    preview.src = projectAssetUrl(value);
    preview.classList.remove('hidden');
  }

  async function uploadProjectImage() {
    const file = $('projectImageFile').files?.[0];
    if (!file) return setStatus($('uploadStatus'), 'Choose an image first.', 'error');
    if (file.size > 5 * 1024 * 1024) return setStatus($('uploadStatus'), 'Image must be 5 MB or smaller.', 'error');
    const body = new FormData(); body.append('image', file);
    setStatus($('uploadStatus'), 'Uploading…');
    try {
      const response = await fetch(`${API}/admin/uploads/project-image`, { method:'POST', credentials:'include', body });
      const data = await response.json().catch(()=>({}));
      if (!response.ok) throw new Error(data.error || `Upload failed (${response.status})`);
      $('projectImageUrl').value = data.imageUrl;
      updateProjectPreview();
      setStatus($('uploadStatus'), 'Image uploaded. Save the project to attach it.', 'success');
    } catch(e) { setStatus($('uploadStatus'), e.message, 'error'); }
  }

  async function refreshAll() {
    await Promise.all([refreshSummary(), loadMessages(), loadProjects(), loadProfile()]);
  }

  $('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    setStatus($('loginStatus'), 'Signing in…');
    try {
      const data = await api('/auth/login', { method:'POST', body:JSON.stringify({ email:$('loginEmail').value.trim(), password:$('loginPassword').value }) });
      $('loginPassword').value = '';
      showDashboard(data.admin);
      setStatus($('loginStatus'));
      await refreshAll();
    } catch (e) { setStatus($('loginStatus'), e.message, 'error'); }
  });

  $('logoutBtn').addEventListener('click', async () => {
    try { await api('/auth/logout', { method:'POST', body:'{}' }); } catch {}
    showLogin();
  });

  $('refreshBtn').addEventListener('click', refreshAll);
  $('newProjectBtn').addEventListener('click', () => openProjectEditor());
  $('cancelProjectBtn').addEventListener('click', closeProjectEditor);
  $('uploadProjectImageBtn').addEventListener('click', uploadProjectImage);
  $('projectImageUrl').addEventListener('input', updateProjectPreview);

  document.querySelector('.tabs').addEventListener('click', (event) => {
    const button = event.target.closest('[data-tab]');
    if (!button) return;
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === button));
    $('messagesPanel').classList.toggle('hidden', button.dataset.tab !== 'messages');
    $('projectsPanel').classList.toggle('hidden', button.dataset.tab !== 'projects');
    $('profilePanel').classList.toggle('hidden', button.dataset.tab !== 'profile');
  });

  $('messagesList').addEventListener('click', async (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const id = Number(button.dataset.id);
    try {
      if (button.dataset.action === 'read') await api(`/admin/messages/${id}/read`, { method:'PATCH', body:'{}' });
      if (button.dataset.action === 'delete-message') {
        if (!confirm('Delete this message permanently?')) return;
        await api(`/admin/messages/${id}`, { method:'DELETE' });
      }
      await Promise.all([refreshSummary(), loadMessages()]);
    } catch (e) { setStatus($('messagesStatus'), e.message, 'error'); }
  });

  $('projectsList').addEventListener('click', async (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const id = Number(button.dataset.id);
    const project = state.projects.find(p => p.id === id);
    if (button.dataset.action === 'edit-project') openProjectEditor(project);
    if (button.dataset.action === 'delete-project') {
      if (!confirm(`Delete ${project?.name || 'this project'}?`)) return;
      try {
        await api(`/admin/projects/${id}`, { method:'DELETE' });
        closeProjectEditor();
        await Promise.all([refreshSummary(), loadProjects()]);
      } catch (e) { setStatus($('projectsStatus'), e.message, 'error'); }
    }
  });

  $('projectForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const id = Number($('projectId').value) || null;
    const payload = {
      name:$('projectName').value.trim(),
      slug:$('projectSlug').value.trim().toLowerCase(),
      status:$('projectStatus').value.trim(),
      path:$('projectPath').value.trim(),
      imageUrl:$('projectImageUrl').value.trim(),
      technologies:lines($('projectTechnologies').value),
      githubUrl:$('projectGithubUrl').value.trim(),
      liveUrl:$('projectLiveUrl').value.trim(),
      featured:$('projectFeatured').checked,
      sortOrder:Number($('projectSortOrder').value),
      text:$('projectText').value.trim()
    };
    setStatus($('projectsStatus'), 'Saving…');
    try {
      await api(id ? `/admin/projects/${id}` : '/admin/projects', { method:id ? 'PUT' : 'POST', body:JSON.stringify(payload) });
      closeProjectEditor();
      await Promise.all([refreshSummary(), loadProjects()]);
      setStatus($('projectsStatus'), 'Project saved.', 'success');
    } catch (e) { setStatus($('projectsStatus'), e.message, 'error'); }
  });


  $('profileForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload={
      name:$('profileName').value.trim(), role:$('profileRole').value.trim(), location:$('profileLocation').value.trim(), university:$('profileUniversity').value.trim(), studyPeriod:$('profileStudyPeriod').value.trim(), email:$('profileEmail').value.trim(), githubProfile:$('profileGithub').value.trim(), githubRepo:$('profileGithubRepo').value.trim(), linkedin:$('profileLinkedin').value.trim(), aboutHeadline:$('profileAboutHeadline').value.trim(), aboutText:$('profileAboutText').value.trim(),
      heroFocus:lines($('profileHeroFocus').value), currentlyDeveloping:lines($('profileDeveloping').value), skillGroups:parseGroups($('profileSkillGroups').value), learningGroups:parseLearning($('profileLearningGroups').value), availability:lines($('profileAvailability').value), languages:lines($('profileLanguages').value)
    };
    setStatus($('profileStatus'),'Saving…');
    try { await api('/admin/profile',{method:'PUT',body:JSON.stringify(payload)}); setStatus($('profileStatus'),'Public portfolio content saved. Refresh the public site to see it.','success'); }
    catch(e){ setStatus($('profileStatus'),e.message,'error'); }
  });

  boot();
})();
