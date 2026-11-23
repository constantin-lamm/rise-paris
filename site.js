(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var body = document.body;

  // Sortie rapide : remplace la page (le bouton « retour » ne ramène pas ici)
  var exitBtn = document.getElementById('exit-btn');
  if (exitBtn) exitBtn.onclick = function(){
    try { body.style.display = 'none'; } catch(e){}
    window.location.replace('https://www.google.fr/search?q=m%C3%A9t%C3%A9o');
  };

  // Numéros d'urgence
  var sosBtn = document.getElementById('sos-btn'), sosPanel = document.getElementById('sos-panel');
  if (sosBtn && sosPanel) {
    sosBtn.onclick = function(){
      var open = sosPanel.classList.toggle('open');
      sosBtn.setAttribute('aria-expanded', open);
    };
  }

  // Menu : sous-menu « J'ai besoin d'aide » et menu plein écran sur mobile
  var tog = document.querySelector('.menu-toggle'), sub = document.querySelector('.has-sub'), subBtn = document.querySelector('.menu-btn');
  function closeMenu(){ body.classList.remove('menu-open'); if (tog){ tog.setAttribute('aria-expanded', false); tog.setAttribute('aria-label', 'Ouvrir le menu'); } }
  if (tog) tog.onclick = function(){
    var hb = document.querySelector('header').getBoundingClientRect().bottom;
    document.documentElement.style.setProperty('--nav-top', Math.max(0, Math.round(hb)) + 'px');
    var o = body.classList.toggle('menu-open');
    tog.setAttribute('aria-expanded', o);
    tog.setAttribute('aria-label', o ? 'Fermer le menu' : 'Ouvrir le menu');
  };
  if (sub && subBtn) {
    subBtn.onclick = function(e){
      e.stopPropagation();
      var o = sub.classList.toggle('open');
      subBtn.setAttribute('aria-expanded', o);
    };
    document.addEventListener('click', function(e){
      if (!sub.contains(e.target)) { sub.classList.remove('open'); subBtn.setAttribute('aria-expanded', false); }
    });
  }
  document.querySelectorAll('#nav a').forEach(function(a){ a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function(e){
    if (e.key !== 'Escape') return;
    closeMenu();
    if (sub) { sub.classList.remove('open'); subBtn.setAttribute('aria-expanded', false); }
    if (sosPanel && sosPanel.classList.contains('open')) { sosPanel.classList.remove('open'); sosBtn.setAttribute('aria-expanded', false); }
  });

  // En-tête qui se resserre + barre de progression de lecture
  var header = document.querySelector('header'), bar = document.querySelector('.progress'), ticking = false;
  function onScroll(){
    var y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
    if (header) header.classList.toggle('scrolled', y > 60);
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function(){ if (!ticking){ ticking = true; requestAnimationFrame(onScroll); } }, {passive:true});
  onScroll();

  // Copier l'adresse e-mail
  document.querySelectorAll('[data-copy]').forEach(function(b){
    b.addEventListener('click', function(){
      var txt = b.getAttribute('data-copy'), label = b.innerHTML;
      try { navigator.clipboard.writeText(txt).then(function(){ b.textContent = 'Adresse copiée ✓'; setTimeout(function(){ b.innerHTML = label; }, 2000); }); } catch(e){}
    });
  });

  // Partager RISE (partage natif sur mobile, sinon copie du lien)
  document.querySelectorAll('[data-share]').forEach(function(b){
    b.addEventListener('click', function(){
      var data = { title: 'RISE Paris', text: "RISE ouvre début 2027 à Paris un centre de santé pour les 3-25 ans victimes de violences sexuelles. Soutenez-le :", url: location.origin + location.pathname.replace(/[^/]*$/, '') };
      var label = b.innerHTML;
      if (navigator.share) { navigator.share(data).catch(function(){}); }
      else { try { navigator.clipboard.writeText(data.url).then(function(){ b.textContent = 'Lien copié ✓'; setTimeout(function(){ b.innerHTML = label; }, 2200); }, function(){}); } catch(e){} }
    });
  });

  // Compteurs animés
  function countUp(el){
    var target = parseFloat(el.getAttribute('data-count')), pre = el.getAttribute('data-prefix') || '', suf = el.getAttribute('data-suffix') || '';
    if (reduce || !target) return;
    var start = null, dur = 1600;
    function fmt(n){ return pre + Math.round(n).toLocaleString('fr-FR') + suf; }
    function step(t){
      if (!start) start = t;
      var p = Math.min(1, (t - start) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(target);
    }
    el.textContent = fmt(0);
    requestAnimationFrame(step);
  }

  // Décalages pour les apparitions en cascade
  document.querySelectorAll('.reveal').forEach(function(el){
    var sibs = Array.prototype.filter.call(el.parentNode.children, function(c){ return c.classList && c.classList.contains('reveal'); });
    el.style.setProperty('--d', Math.max(0, sibs.indexOf(el)));
  });
  document.querySelectorAll('.feelings').forEach(function(f){
    Array.prototype.forEach.call(f.children, function(c, i){ c.style.setProperty('--k', i); });
  });

  var sel = '.reveal, .timeline, .mark, [data-count]';
  var watched = document.querySelectorAll(sel);
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (!en.isIntersecting) return;
        var t = en.target;
        if (t.hasAttribute('data-count')) {
          var delay = parseInt(t.getAttribute('data-count-delay') || '150', 10);
          setTimeout(function(){ countUp(t); }, delay);
        } else {
          t.classList.add('in');
        }
        io.unobserve(t);
      });
    }, {threshold:.15});
    watched.forEach(function(el){ io.observe(el); });
  } else {
    watched.forEach(function(el){ el.classList.add('in'); });
  }
})();
