(() => {
  'use strict';
  const API_ROOT =
    (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
      ? 'http://127.0.0.1:5001'
      : location.origin;
  const API = `${API_ROOT}/api`;
  const esc = (v='') => String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const imageMap = {
    'wallace-dev':'images/optimized/projects/wallace-dev-768.webp',
    'remote-income-match':'images/optimized/projects/remote-income-match-768.webp',
    'expense-tracker':'images/optimized/projects/expense-tracker-768.webp',
    'hospital-management':'images/optimized/projects/hospital-management-768.webp',
    'mobile-app':'images/optimized/projects/mobile-app-768.webp',
    'database-system':'images/optimized/projects/database-system-768.webp'
  };
  const statusClass = status => /live/i.test(status) ? 'status-live' : /development/i.test(status) ? 'status-development' : 'status-designed';
  const statusKey = status => /live/i.test(status) ? 'live' : /development/i.test(status) ? 'building' : 'designed';
  const assetUrl = value => value?.startsWith('/uploads/') ? `${API_ROOT}${value}` : value;
  const projectCard = p => {
    const image = assetUrl(p.imageUrl) || imageMap[p.slug] || '';
    const tech = Array.isArray(p.technologies) ? p.technologies : [];
    const extra = [
      p.githubUrl ? `<a class="button button-secondary button-small" href="${esc(p.githubUrl)}" target="_blank" rel="noopener">GitHub</a>` : '',
      p.liveUrl ? `<a class="button button-secondary button-small" href="${esc(p.liveUrl)}" target="_blank" rel="noopener">Live demo</a>` : ''
    ].join('');
    return `<article class="project-card" data-project-card data-status="${statusKey(p.status)}"><div class="project-media">${image ? `<img src="${esc(image)}" alt="${esc(p.name)} project preview" loading="lazy" decoding="async">` : ''}<span class="status ${statusClass(p.status)}">${esc(p.status)}</span></div><div class="project-body"><p class="micro">Portfolio project</p><h2>${esc(p.name)}</h2><p>${esc(p.text)}</p>${tech.length ? `<div class="tags">${tech.map(t=>`<span>${esc(t)}</span>`).join('')}</div>` : ''}<div class="card-actions"><a class="button button-primary button-small" href="${esc(p.path)}">View Project <svg><use href="#i-arrow"/></svg></a>${extra}</div></div></article>`;
  };

  async function load() {
    try {
      const r = await fetch(`${API}/site-content`, { cache:'no-store' });
      if (!r.ok) throw new Error('Backend unavailable');
      const { profile:p, projects=[] } = await r.json();

      document.querySelectorAll('[data-dynamic-name]').forEach(el=>el.textContent=p.name);
      document.querySelectorAll('[data-dynamic-role]').forEach(el=>el.textContent=p.role);
      document.querySelectorAll('[data-dynamic-location]').forEach(el=>el.textContent=p.location);
      document.querySelectorAll('[data-dynamic-email-link]').forEach(el=>el.href=`mailto:${p.email}`);
      document.querySelectorAll('[data-dynamic-email-text]').forEach(el=>el.textContent=p.email);
      document.querySelectorAll('[data-dynamic-github]').forEach(el=>el.href=p.githubProfile);
      document.querySelectorAll('[data-dynamic-linkedin]').forEach(el=>el.href=p.linkedin);

      const heroFocus=document.querySelector('[data-dynamic-hero-focus]');
      if(heroFocus) heroFocus.innerHTML=(p.heroFocus||[]).map(x=>`<span>${esc(x)}</span>`).join('');
      const aboutH=document.querySelector('[data-dynamic-about-headline]'); if(aboutH) aboutH.textContent=p.aboutHeadline;
      const aboutT=document.querySelector('[data-dynamic-about-text]'); if(aboutT) aboutT.textContent=p.aboutText;
      const typing=document.querySelector('[data-typing]'); if(typing && p.currentlyDeveloping?.length) typing.dataset.items=p.currentlyDeveloping.join('|');

      const skills=document.querySelector('[data-dynamic-skill-groups]');
      if(skills) skills.innerHTML=(p.skillGroups||[]).map(g=>`<article class="tech-group"><h3>${esc(g.title)}</h3><div class="tags">${(g.items||[]).map(i=>`<span>${esc(i)}</span>`).join('')}</div></article>`).join('');
      const learning=document.querySelector('[data-dynamic-learning]');
      if(learning) learning.innerHTML=(p.learningGroups||[]).map(g=>`<article><span class="learning-state ${esc(String(g.state).toLowerCase())}">${esc(g.state)}</span><h3>${esc(g.title)}</h3><div class="tags">${(g.items||[]).map(i=>`<span>${esc(i)}</span>`).join('')}</div></article>`).join('');
      const avail=document.querySelector('[data-dynamic-availability]');
      if(avail) avail.innerHTML=(p.availability||[]).map(i=>`<span>${esc(i)}</span>`).join('');
      const langs=document.querySelector('[data-dynamic-languages]'); if(langs) langs.innerHTML=`<strong>Languages:</strong> ${(p.languages||[]).map(esc).join(' • ')} <small>(no proficiency levels claimed)</small>`;

      const featured=document.querySelector('[data-dynamic-featured-projects]');
      if(featured) { const picks=projects.filter(x=>x.featured); featured.innerHTML=(picks.length ? picks : projects).slice(0,3).map(projectCard).join(''); }
      const all=document.querySelector('[data-project-list]');
      if(all){ all.innerHTML=projects.map(projectCard).join(''); document.dispatchEvent(new CustomEvent('dynamic-projects-ready')); }
      const count=document.querySelector('[data-project-count]'); if(count && all) count.textContent=String(projects.length);
    } catch (e) {
      console.warn('Dynamic portfolio content could not be loaded; static fallback remains visible.', e);
    }
  }
  load();
})();
