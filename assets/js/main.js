/* Progressive enhancements. Content and destination links are plain HTML. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const behavior = () => reducedMotion.matches ? 'instant' : 'smooth';

  const menu = $('.menu-toggle');
  const nav = $('#site-nav');
  const mobile = matchMedia('(max-width: 1000px)');
  function closeMenu(restoreFocus = false) {
    nav?.classList.remove('is-open');
    menu?.setAttribute('aria-expanded', 'false');
    if (menu) menu.textContent = 'Menu';
    if (restoreFocus) menu?.focus();
  }
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    nav.classList.toggle('is-open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.textContent = open ? 'Close' : 'Menu';
  });
  nav?.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  $('.site-header')?.addEventListener('focusout', event => {
    if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) closeMenu();
  });
  mobile.addEventListener('change', () => closeMenu());

  const progress = $('.read-progress');
  let scrollQueued = false;
  function updateProgress() {
    const height = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.transform = `scaleX(${height > 0 ? Math.min(1, Math.max(0, scrollY / height)) : 0})`;
    scrollQueued = false;
  }
  addEventListener('scroll', () => {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  addEventListener('resize', updateProgress, { passive: true });
  updateProgress();

  // One observer; fail open and keep essential content visible.
  if ('IntersectionObserver' in window && !reducedMotion.matches && matchMedia('(hover: hover)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('is-pending');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06 });
    $$('.reveal').forEach(el => {
      if (el.getBoundingClientRect().top > innerHeight) {
        el.classList.add('is-pending');
        observer.observe(el);
      }
    });
    // Never leave content hidden after a preference change or print action.
    const showAll = () => $$('.is-pending').forEach(el => el.classList.remove('is-pending'));
    reducedMotion.addEventListener('change', showAll);
    addEventListener('beforeprint', showAll);
  }

  // Search and topic filters share a URL without changing the static content.
  const filterButtons = $$('[data-filter]');
  const cards = $$('.work-grid [data-category]');
  const search = $('#work-search');
  if (filterButtons.length && search) {
    $('.filter-bar').hidden = false;
    $('.work-search').hidden = false;
    search.setAttribute('aria-keyshortcuts', '/');
    const allowed = filterButtons.map(button => button.dataset.filter);
    const initial = new URLSearchParams(location.search);
    let selected = allowed.includes(initial.get('type')) ? initial.get('type') : 'all';
    search.value = initial.get('q') || '';
    const normalize = value => value.normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f]/g, '');
    function filterProjects(updateUrl = true) {
      let count = 0;
      const tokens = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
      cards.forEach(card => {
        const content = normalize(card.dataset.search || card.textContent);
        const show = (selected === 'all' || card.dataset.category === selected) && tokens.every(token => content.includes(token));
        card.hidden = !show;
        card.classList.remove('is-pending');
        if (show) count++;
      });
      filterButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === selected)));
      $('#work-count').textContent = `${count} work profile${count === 1 ? '' : 's'}`;
      $('.work-empty').hidden = count > 0;
      $('.search-clear').hidden = !search.value;
      if (updateUrl) {
        const url = new URL(location.href);
        if (selected === 'all') url.searchParams.delete('type'); else url.searchParams.set('type', selected);
        if (search.value.trim()) url.searchParams.set('q', search.value.trim()); else url.searchParams.delete('q');
        try { history.replaceState(null, '', url); } catch { /* Local file previews retain working filters. */ }
      }
      updateProgress();
    }
    filterButtons.forEach(button => button.addEventListener('click', () => {
      selected = button.dataset.filter;
      filterProjects();
    }));
    search.addEventListener('input', () => filterProjects());
    $('.search-clear').addEventListener('click', () => {
      search.value = '';
      filterProjects();
      search.focus();
    });
    $('[data-reset-work]').addEventListener('click', () => {
      search.value = '';
      selected = 'all';
      filterProjects();
      search.focus();
    });
    addEventListener('popstate', () => {
      const params = new URLSearchParams(location.search);
      selected = allowed.includes(params.get('type')) ? params.get('type') : 'all';
      search.value = params.get('q') || '';
      filterProjects(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.target.closest('input, textarea, [contenteditable]')) {
        event.preventDefault();
        search.focus();
        search.scrollIntoView({ block: 'center', behavior: behavior() });
      }
    });
    filterProjects(false);
  }

  // Keep the project section index synchronized with the section being read.
  const sectionLinks = $$('.case-nav a');
  if (sectionLinks.length && 'IntersectionObserver' in window) {
    const sections = sectionLinks.map(link => $(link.getAttribute('href'))).filter(Boolean);
    const visible = new Set();
    const active = target => {
      sectionLinks.forEach(link => {
        if (link.getAttribute('href') === `#${target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    };
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visible.add(entry.target); else visible.delete(entry.target);
      });
      const target = sections.find(section => visible.has(section));
      if (target) active(target);
    }, { rootMargin: '-140px 0px -25% 0px', threshold: 0 });
    sections.forEach(section => observer.observe(section));
    sectionLinks.forEach(link => link.addEventListener('click', () => {
      const target = $(link.getAttribute('href'));
      if (target) active(target);
    }));
  }

  const dimensions = {
    agenda: ['Agenda setting', 'The structure of the conversation: how its purpose and topics are established.'],
    clarity: ['Decision clarity', 'The clarity of the conversation: how decisions and their meaning are expressed.'],
    warmth: ['Warmth', 'The interpersonal tone of the conversation: how participants relate to one another.']
  };
  $$('[data-dimension]').forEach(button => button.addEventListener('click', () => {
    const dimension = dimensions[button.dataset.dimension];
    $$('[data-dimension]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    $('#dimension-title').textContent = dimension[0];
    $('#dimension-description').textContent = dimension[1];
  }));

  // Original prototype photographs lead the homepage; every view retains its source.
  const handViews = $$('[data-hand-view]');
  const handImage = $('#hand-hero-image');
  const handViewer = $('.hand-hero-viewer');
  if (handViews.length && handImage && handViewer) {
    $('.hand-view-options').hidden = false;
    let photoAnimation;
    handImage.addEventListener('load', () => {
      photoAnimation?.cancel();
      if (!reducedMotion.matches) {
        photoAnimation = handImage.animate([{ opacity: .65 }, { opacity: 1 }], {
          duration: 240, easing: 'ease-out'
        });
      }
    });
    function showHandView(button) {
      handViews.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      handImage.src = button.dataset.src;
      handImage.alt = button.dataset.alt;
      handImage.width = Number(button.dataset.width);
      handImage.height = Number(button.dataset.height);
      handViewer.dataset.evidence = button.dataset.original;
      handViewer.dataset.caption = button.dataset.caption;
      handViewer.href = button.dataset.original;
      handViewer.setAttribute('aria-label', 'Enlarge the ' + button.querySelector('span').textContent.toLowerCase() + ' photograph of the bionic hand');
      $('#hand-view-caption').textContent = button.dataset.caption;
    }
    handViews.forEach((button, index) => {
      button.addEventListener('click', () => showHandView(button));
      button.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? handViews.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + handViews.length) % handViews.length;
        showHandView(handViews[next]);
        handViews[next].focus();
      });
    });
    let origin;
    let lastSwipe = 0;
    handViewer.addEventListener('pointerdown', event => { origin = { x: event.clientX, y: event.clientY }; }, { passive: true });
    handViewer.addEventListener('pointercancel', () => { origin = undefined; }, { passive: true });
    handViewer.addEventListener('pointerup', event => {
      if (!origin) return;
      const dx = event.clientX - origin.x;
      const dy = event.clientY - origin.y;
      origin = undefined;
      if (Math.abs(dx) < 65 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      const index = handViews.findIndex(button => button.getAttribute('aria-pressed') === 'true');
      showHandView(handViews[(index + (dx < 0 ? 1 : -1) + handViews.length) % handViews.length]);
      lastSwipe = Date.now();
    }, { passive: true });
    handViewer.addEventListener('click', event => {
      if (Date.now() - lastSwipe < 450) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);
  }

  // Native <dialog> provides focus containment, Escape, and focus restoration.
  const dialog = $('.evidence-dialog');
  if (dialog && typeof dialog.showModal === 'function') {
    $$('[data-evidence]').forEach(button => button.addEventListener('click', event => {
      event.preventDefault();
      const img = $('.dialog-image', dialog);
      img.src = button.dataset.evidence;
      img.alt = $('img', button)?.alt || button.dataset.caption || 'Project evidence photograph';
      $('.dialog-caption', dialog).textContent = button.dataset.caption || '';
      $('#evidence-title').textContent = button.dataset.title || 'Image viewer';
      $('.dialog-original', dialog).href = button.dataset.evidence;
      dialog.showModal();
    }));
    $('.dialog-close', dialog).addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
  } else {
    $$('[data-evidence]').forEach(button => button.addEventListener('click', () => { location.href = button.dataset.evidence; }));
  }
  $$('.gallery').forEach(gallery => {
    const track = $('.gallery-track', gallery);
    $$('[data-gallery]', gallery).forEach(button => button.addEventListener('click', () => {
      const distance = $('.gallery-item', track).getBoundingClientRect().width + 20;
      track.scrollBy({ left: distance * (button.dataset.gallery === 'next' ? 1 : -1), behavior: behavior() });
    }));
    track.addEventListener('keydown', event => {
      if (event.target !== track || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      track.scrollBy({ left: (track.clientWidth * .8) * (event.key === 'ArrowRight' ? 1 : -1), behavior: behavior() });
    });
  });

  let toastTimer;
  function toast(message) {
    const box = $('.toast');
    box.textContent = message;
    box.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => box.classList.remove('visible'), 3500);
  }
  $$('[data-copy-email]').forEach(button => {
    if (!navigator.clipboard?.writeText) return;
    button.hidden = false;
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copyEmail);
        toast('Email address copied.');
      } catch {
        toast('You can select and copy the email address beside this button.');
      }
    });
  });
})();
