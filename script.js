// Mobile menu — mirrors old site's behavior (toggle 'active' on nav ul)
const menuToggle = document.querySelector('.menu-toggle');
const navList = document.getElementById('nav-list');
const navLinks = document.querySelectorAll('#nav-list li a');

if (menuToggle && navList){
  menuToggle.addEventListener('click', () => {
    const nowActive = navList.classList.toggle('active');
    // Update ARIA
    menuToggle.setAttribute('aria-expanded', String(nowActive));
  });
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navList.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Header shadow & scroll progress
const headerEl = document.querySelector('[data-header]');
const progressBar = document.querySelector('[data-progress]');

function onScroll(){
  const y = window.scrollY || document.documentElement.scrollTop;
  if (headerEl){
    headerEl.style.boxShadow = y > 8 ? 'var(--shadow)' : 'none';
  }
  if (progressBar){
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollHeight > 0 ? (y / scrollHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }
}
window.addEventListener('scroll', onScroll, {passive:true});
onScroll();
