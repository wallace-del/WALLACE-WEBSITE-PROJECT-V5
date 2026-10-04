(() => {
  'use strict';
  function init() {
    const buttons=[...document.querySelectorAll('[data-filter]')];
    if(!buttons.length) return;
    buttons.forEach(button => {
      button.onclick=()=>{
        const cards=[...document.querySelectorAll('[data-project-card]')];
        const filter=button.dataset.filter;
        buttons.forEach(b=>{b.classList.toggle('active',b===button); b.setAttribute('aria-pressed',String(b===button));});
        let visible=0;
        cards.forEach(card=>{ const show=filter==='all'||card.dataset.status===filter; card.hidden=!show; if(show) visible++; });
        const count=document.querySelector('[data-project-count]'); if(count) count.textContent=String(visible);
      };
    });
  }
  init();
  document.addEventListener('dynamic-projects-ready', init);
})();
