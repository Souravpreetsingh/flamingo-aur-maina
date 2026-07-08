(function() {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var heroFam = document.getElementById('fam-hero-heading');
  if (!heroFam) return;

  var container = heroFam.parentElement;
  var particleContainer = document.createElement('div');
  particleContainer.className = 'fam-particle-container';
  container.insertBefore(particleContainer, heroFam.nextSibling);

  var birdContainer = document.createElement('div');
  birdContainer.className = 'fam-particle-container';
  birdContainer.style.zIndex = '2';
  container.insertBefore(birdContainer, heroFam.nextSibling);

  var iceContainer = document.createElement('div');
  iceContainer.className = 'fam-particle-container';
  iceContainer.style.zIndex = '1';
  container.insertBefore(iceContainer, heroFam.nextSibling);

  var glowParticleContainer = document.createElement('div');
  glowParticleContainer.className = 'fam-particle-container';
  glowParticleContainer.style.zIndex = '1';
  container.insertBefore(glowParticleContainer, heroFam.nextSibling);

  var PAGE_VISIBLE = true;
  document.addEventListener('visibilitychange', function() {
    PAGE_VISIBLE = !document.hidden;
    if (PAGE_VISIBLE) {
      heroFam.style.animationPlayState = 'running';
    } else {
      heroFam.style.animationPlayState = 'paused';
    }
  });

  function isWinter() {
    return document.documentElement.classList.contains('winter');
  }

  function rng(min, max) { return Math.random() * (max - min) + min; }

  // === Floating ===
  var floatTimeline = gsap.timeline({ repeat: -1, yoyo: true, ease: 'power1.inOut' });
  floatTimeline.to(heroFam, { y: -3, duration: 2.2 });
  floatTimeline.to(heroFam, { y: 0, duration: 2.2 });

  // === Initial reveal ===
  gsap.fromTo(heroFam,
    { opacity: 0, scale: 0.92 },
    { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' }
  );

  // === Particles ===
  var leaves = [];
  var snowflakes = [];
  var iceCrystals = [];
  var glowParticles = [];

  function createLeaves(count) {
    for (var i = 0; i < count; i++) {
      var el = document.createElement('div');
      el.className = 'fam-particle fam-leaf';
      var x = rng(0, 100);
      var y = rng(-20, 120);
      var size = rng(6, 16);
      var dur = rng(10, 18);
      var delay = rng(0, 15);
      el.style.cssText = 'left:' + x + '%;top:' + y + '%;width:' + size + 'px;height:' + (size * rng(0.7, 1.3)) + 'px;' +
        'animation:fam-leaf-drift ' + dur + 's ease-in-out ' + delay + 's infinite;opacity:' + rng(0.15, 0.4) + ';';
      particleContainer.appendChild(el);
      leaves.push(el);
    }
  }

  function createSnowflakes(count) {
    for (var i = 0; i < count; i++) {
      var el = document.createElement('div');
      el.className = 'fam-particle fam-snowflake';
      var x = rng(0, 100);
      var dur = rng(12, 22);
      var delay = rng(0, 20);
      el.style.cssText = 'left:' + x + '%;top:-10px;animation:fam-snow-fall ' + dur + 's linear ' + delay + 's infinite;opacity:' + rng(0.3, 0.7) + ';';
      particleContainer.appendChild(el);
      snowflakes.push(el);
    }
  }

  function createIceCrystals(count) {
    for (var i = 0; i < count; i++) {
      var el = document.createElement('div');
      el.className = 'fam-ice-crystal';
      var x = rng(0, 100);
      var y = rng(0, 100);
      var size = rng(6, 14);
      var dur = rng(4, 8);
      var delay = rng(0, 10);
      el.style.cssText = 'left:' + x + '%;top:' + y + '%;width:' + size + 'px;height:' + size + 'px;' +
        'animation:fam-sparkle ' + dur + 's ease-in-out ' + delay + 's infinite;';
      iceContainer.appendChild(el);
      iceCrystals.push(el);
    }
  }

  function createGlowParticles(count) {
    for (var i = 0; i < count; i++) {
      var el = document.createElement('div');
      el.className = 'fam-glow-particle';
      var x = rng(5, 95);
      var y = rng(5, 95);
      var size = rng(3, 7);
      var dur = rng(5, 10);
      var delay = rng(0, 8);
      el.style.cssText = 'left:' + x + '%;top:' + y + '%;width:' + size + 'px;height:' + size + 'px;' +
        'background:' + (isWinter() ? 'rgba(255,255,255,0.3)' : 'rgba(5,150,105,0.2)') + ';' +
        'box-shadow:0 0 ' + (size * 2) + 'px ' + (isWinter() ? 'rgba(255,255,255,0.15)' : 'rgba(5,150,105,0.15)') + ';' +
        'animation:fam-glow-drift ' + dur + 's ease-in-out ' + delay + 's infinite;';
      glowParticleContainer.appendChild(el);
      glowParticles.push(el);
    }
  }

  // === Birds ===
  var birds = [];

  function spawnBird() {
    if (!PAGE_VISIBLE) return;
    var winter = isWinter();
    var el = document.createElement('div');
    el.className = 'fam-bird' + (Math.random() > 0.5 ? ' fam-bird-big' : '');
    var startX = Math.random() > 0.5 ? -80 : container.offsetWidth + 80;
    var startY = rng(-20, container.offsetHeight * 0.5);
    var flyToX = startX > 0 ? -80 : container.offsetWidth + 80;
    var flyToY = rng(-10, container.offsetHeight * 0.4);
    var dur = winter ? rng(12, 20) : rng(6, 12);
    var size = Math.random() > 0.5 ? 60 : 80;

    var isFlamingo = Math.random() > 0.5;
    el.innerHTML = isFlamingo
      ? '<svg viewBox="0 0 80 50" fill="none"><path d="M10 35 Q30 10 50 25 Q40 30 30 38 Q22 42 15 38 Q10 42 5 38 Z" fill="' + (winter ? 'rgba(255,255,255,0.4)' : 'rgba(236,72,153,0.35)') + '"/><path d="M50 25 Q60 15 75 20 Q65 22 55 28 Z" fill="' + (winter ? 'rgba(255,255,255,0.3)' : 'rgba(244,114,182,0.3)') + '"/><circle cx="62" cy="18" r="2" fill="' + (winter ? 'rgba(255,255,255,0.5)' : 'rgba(236,72,153,0.5)') + '"/><path d="M52 28 Q56 32 58 30" stroke="' + (winter ? 'rgba(255,255,255,0.3)' : 'rgba(236,72,153,0.3)') + '" stroke-width="1" fill="none"/></svg>'
      : '<svg viewBox="0 0 60 40" fill="none"><path d="M8 28 Q22 8 38 20 Q30 24 24 30 Q18 33 12 30 Q8 34 4 30 Z" fill="' + (winter ? 'rgba(255,255,255,0.35)' : 'rgba(59,130,246,0.35)') + '"/><path d="M38 20 Q46 12 56 16 Q48 18 42 22 Z" fill="' + (winter ? 'rgba(255,255,255,0.25)' : 'rgba(96,165,250,0.25)') + '"/><circle cx="46" cy="14" r="1.5" fill="' + (winter ? 'rgba(255,255,255,0.5)' : 'rgba(59,130,246,0.5)') + '"/></svg>';

    el.style.cssText = 'position:absolute;left:' + startX + 'px;top:' + startY + 'px;opacity:0;z-index:2;';
    birdContainer.appendChild(el);
    birds.push(el);

    gsap.fromTo(el, { opacity: 0, scale: 0.6 },
      { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out',
        onComplete: function() {
          gsap.to(el, { x: flyToX - startX, y: flyToY - startY, duration: dur, ease: 'power1.inOut',
            onComplete: function() {
              gsap.to(el, { opacity: 0, duration: 0.6, onComplete: function() {
                if (el.parentNode) el.parentNode.removeChild(el);
                var idx = birds.indexOf(el);
                if (idx > -1) birds.splice(idx, 1);
              }});
            }
          });
        }
      }
    );
  }

  var birdInterval;

  function scheduleBirds() {
    if (birdInterval) clearInterval(birdInterval);
    birdInterval = setInterval(spawnBird, isWinter() ? rng(18000, 25000) : rng(12000, 18000));
    gsap.delayedCall(rng(2, 5), spawnBird);
  }

  // === Tilt ===
  var isMobile = window.matchMedia('(max-width: 768px)').matches;

  function handleTilt(e) {
    if (isMobile || !PAGE_VISIBLE) return;
    var rect = container.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var dx = (e.clientX - cx) / (rect.width / 2);
    var dy = (e.clientY - cy) / (rect.height / 2);
    var rx = -dy * 5;
    var ry = dx * 5;
    gsap.to(heroFam, { rotationX: rx, rotationY: ry, duration: 1.2, ease: 'power2.out', overwrite: 'auto' });
  }

  function resetTilt() {
    if (isMobile) return;
    gsap.to(heroFam, { rotationX: 0, rotationY: 0, duration: 0.8, ease: 'power2.out' });
  }

  if (!isMobile) {
    container.addEventListener('mousemove', handleTilt);
    container.addEventListener('mouseleave', resetTilt);
    container.addEventListener('mouseenter', function() {
      gsap.to(heroFam, { filter: 'brightness(1.08)', duration: 0.4 });
    });
    container.addEventListener('mouseleave', function() {
      gsap.to(heroFam, { filter: 'brightness(1)', duration: 0.4 });
    });
  }

  // === Mobile ripple ===
  if (isMobile) {
    container.addEventListener('click', function(e) {
      var ripple = document.createElement('div');
      ripple.style.cssText = 'position:absolute;left:50%;top:50%;width:20px;height:20px;border-radius:50%;' +
        'background:' + (isWinter() ? 'rgba(255,255,255,0.15)' : 'rgba(5,150,105,0.15)') + ';' +
        'transform:translate(-50%,-50%) scale(0);pointer-events:none;z-index:3;';
      container.appendChild(ripple);
      gsap.to(ripple, { scale: 15, opacity: 0, duration: 0.8, ease: 'power2.out',
        onComplete: function() { if (ripple.parentNode) ripple.parentNode.removeChild(ripple); }
      });
    });
  }

  // === Theme switching ===
  var mo = new MutationObserver(function() {
    updateTheme();
  });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  function updateTheme() {
    var winter = isWinter();

    heroFam.style.transition = 'background 1s ease, -webkit-background-clip 1s ease';

    // Leaves visibility
    for (var i = 0; i < leaves.length; i++) {
      leaves[i].style.opacity = winter ? '0' : leaves[i].dataset.baseOpacity || '0.3';
      leaves[i].style.transition = 'opacity 1s ease';
    }

    // Snowflakes visibility
    for (var j = 0; j < snowflakes.length; j++) {
      snowflakes[j].style.opacity = winter ? (snowflakes[j].dataset.baseOpacity || '0.5') : '0';
      snowflakes[j].style.transition = 'opacity 1s ease';
    }

    // Ice crystals
    for (var k = 0; k < iceCrystals.length; k++) {
      iceCrystals[k].style.opacity = winter ? '1' : '0';
      iceCrystals[k].style.transition = 'opacity 1.2s ease';
    }

    // Glow particles
    var glowColor = winter ? 'rgba(255,255,255,0.3)' : 'rgba(5,150,105,0.2)';
    var glowShadow = winter ? 'rgba(255,255,255,0.15)' : 'rgba(5,150,105,0.15)';
    for (var l = 0; l < glowParticles.length; l++) {
      var gp = glowParticles[l];
      gp.style.background = glowColor;
      gp.style.boxShadow = '0 0 ' + (parseInt(gp.offsetWidth) * 2 || 10) + 'px ' + glowShadow;
      gp.style.transition = 'background 1s ease, box-shadow 1s ease';
    }
  }

  // === Init particle systems ===
  function initParticles() {
    var winter = isWinter();
    if (winter) {
      createSnowflakes(35);
      createIceCrystals(12);
    } else {
      createLeaves(20);
    }
    createGlowParticles(15);
  }

  initParticles();

  // Store base opacity for leaves
  leaves.forEach(function(el) {
    el.dataset.baseOpacity = el.style.opacity || '0.3';
  });
  snowflakes.forEach(function(el) {
    el.dataset.baseOpacity = el.style.opacity || '0.5';
  });

  // Run initial theme to set correct particle vis
  setTimeout(updateTheme, 100);

  // === Bird schedule ===
  scheduleBirds();

  // === Cleanup ===
  window.addEventListener('beforeunload', function() {
    if (birdInterval) clearInterval(birdInterval);
    mo.disconnect();
  });

})();
