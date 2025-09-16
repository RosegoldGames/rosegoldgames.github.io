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

// Project Slideshow
(function initSlideshows(){
  const SLIDE_MS = 5000;

  document.querySelectorAll('.slideshow').forEach((root) => {
    const imagesAttr = root.getAttribute('data-images') || '[]';
    let images = [];
    try { images = JSON.parse(imagesAttr); } catch {}
    if (!Array.isArray(images) || images.length === 0) return;

    const slidesTrack = root.querySelector('.slides');
    const dotsEl = root.querySelector('.dots');
    const prevBtn = root.querySelector('.ss-btn.prev');
    const nextBtn = root.querySelector('.ss-btn.next');

    const extended = [images[images.length - 1], ...images, images[0]];
    slidesTrack.innerHTML = extended.map(src => (
      `<div class="slide"><img src="${src}" alt="" loading="lazy"></div>`
    )).join('');

    dotsEl.innerHTML = images.map((_, i) =>
      `<button type="button" role="tab" aria-label="Go to slide ${i+1}" data-index="${i}"></button>`
    ).join('');

    let index = 1;
    const total = images.length;
    let timerId = null;
    const slideWidth = 100;

    function setPosition(animate = true){
      slidesTrack.style.transition = animate ? "transform .35s ease" : "none";
      slidesTrack.style.transform = `translateX(-${index * slideWidth}%)`;
      dotsEl.querySelectorAll("button").forEach((b, bi) => {
        b.setAttribute("aria-current", bi === index-1 ? "true" : "false");
      });
    }

    function next(){
      index++;
      setPosition(true);
    }
    function prev(){
      index--;
      setPosition(true);
    }

    slidesTrack.addEventListener("transitionend", () => {
      if (index === 0){
        index = total;
        setPosition(false);
      } else if (index === total + 1){
        index = 1;
        setPosition(false);
      }
    });

    function goTo(i){
      index = i + 1;
      setPosition(true);
    }

    function startAuto(){
      stopAuto();
      timerId = setInterval(next, SLIDE_MS);
    }
    function stopAuto(){
      if (timerId) clearInterval(timerId);
      timerId = null;
    }

    prevBtn?.addEventListener("click", () => { prev(); });
    nextBtn?.addEventListener("click", () => { next(); });
    dotsEl.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-index]");
      if (!btn) return;
      goTo(parseInt(btn.dataset.index, 10) || 0);
    });

    // init
    setPosition(false);
  });
})();