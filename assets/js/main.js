
// Reveal on view
document.querySelectorAll('.reveal').forEach(el=>{
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('is-visible'); io.unobserve(e.target);} });
  },{threshold:.12});
  io.observe(el);
});
// Parallax
window.addEventListener('scroll', ()=>{
  const y = Math.min(40, window.scrollY * 0.05);
  document.querySelectorAll('.hero').forEach(h=>h.style.setProperty('--parallax', y+'px'));
});
