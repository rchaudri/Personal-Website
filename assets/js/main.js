
// Reveal on view
document.querySelectorAll('.reveal').forEach(el=>{
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('is-visible'); io.unobserve(e.target);} });
  },{threshold:.12});
  io.observe(el);
});
