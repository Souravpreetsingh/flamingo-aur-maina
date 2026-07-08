function openDrawer() {
    const drawer = document.getElementById('mobileDrawer');
    const overlay = document.getElementById('drawerOverlay');
    if (drawer && overlay) {
        drawer.classList.add('open');
        overlay.classList.add('open');
        document.body.classList.add('drawer-open');
    }
}
function closeDrawer() {
    const drawer = document.getElementById('mobileDrawer');
    const overlay = document.getElementById('drawerOverlay');
    if (drawer && overlay) {
        drawer.classList.remove('open');
        overlay.classList.remove('open');
        document.body.classList.remove('drawer-open');
    }
}
document.addEventListener('click', function(e) {
    if (e.target.closest('[data-drawer-open]')) { openDrawer(); }
});
document.addEventListener('DOMContentLoaded', () => {
    // ScrollReveal Logic
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length) {
        const revealOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        };
        const revealOnScroll = new IntersectionObserver(function(entries, observer) {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            });
        }, revealOptions);
        revealElements.forEach(el => revealOnScroll.observe(el));
    }

    // Nav Scroll Effect
    const nav = document.querySelector('nav');
    if (nav) {
        if (window.scrollY > 50) {
            nav.classList.add('bg-surface/80');
            nav.classList.remove('bg-surface/15');
        } else {
            nav.classList.add('bg-surface/15');
            nav.classList.remove('bg-surface/80');
        }
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    if (window.scrollY > 50) {
                        nav.classList.add('bg-surface/80');
                        nav.classList.remove('bg-surface/15');
                    } else {
                        nav.classList.add('bg-surface/15');
                        nav.classList.remove('bg-surface/80');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // Counter animation for stats
    const counters = document.querySelectorAll('.stat-number');
    if (counters.length) {
        const speed = 200;
        const animateCounters = () => {
            counters.forEach(counter => {
                const updateCount = () => {
                    const target = +counter.getAttribute('data-target');
                    const count = +counter.innerText;
                    const inc = target / speed;
                    if (count < target) {
                        counter.innerText = Math.ceil(count + inc);
                        setTimeout(updateCount, 10);
                    } else {
                        let suffix = '';
                        if (counter.getAttribute('data-target') == '10') suffix = 'k+';
                        else if (counter.getAttribute('data-target') == '150') suffix = '+';
                        counter.innerText = target + suffix;
                    }
                };
                updateCount();
            });
        };

        const observerOptions = { root: null, rootMargin: '0px', threshold: 0.5 };
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        var divideXEl = document.querySelector('.divide-x');
        if (divideXEl) { observer.observe(divideXEl.parentElement); }
    }

    // === Premium Animation Enhancements ===

    // Nav entrance animation
    var navEl = document.querySelector('nav');
    if (navEl) {
        requestAnimationFrame(function() {
            navEl.classList.add('nav-enter');
        });
    }

    // Image fade-in on load
    document.querySelectorAll('img').forEach(function(img) {
        if (img.closest('.img-hover-zoom') || img.closest('[class*="icon"]') || img.closest('.snowflake')) return;
        if (img.complete && img.naturalWidth > 0) {
            img.classList.add('img-fade', 'loaded');
        } else {
            img.classList.add('img-fade');
            img.addEventListener('load', function() { this.classList.add('loaded'); });
            img.addEventListener('error', function() { this.classList.add('loaded'); });
        }
    });

    // Button active press feedback
    document.querySelectorAll('button, a[role="button"], [class*="rounded-full"][class*="py-"]:not(a):not(button)').forEach(function(el) {
        el.classList.add('btn-press');
    });

    // Card hover lift
    document.querySelectorAll('.glass-card, .glass-panel, [class*="bg-surface-container-lowest"][class*="rounded-2xl"][class*="shadow"]').forEach(function(el) {
        if (el.closest('nav') || el.closest('.mobile-drawer') || el.closest('footer')) return;
        if (el.className.indexOf('hover:translate') !== -1) return;
        if (el.querySelector('input, select, textarea')) return; // skip form panels to avoid input blur
        el.classList.add('hover-lift');
    });

    // === Advanced Animation Enhancements ===

    // Hero content staggered reveal
    var heroSection = document.querySelector('section.relative.min-h-screen');
    if (heroSection) {
        var heroContent = heroSection.querySelector('.relative.z-10');
        if (heroContent && !heroContent.classList.contains('hero-stagger')) {
            heroContent.classList.add('hero-stagger');
        }
    }

    // Hero parallax on scroll
    (function() {
        var hero = document.querySelector('section.relative.min-h-screen');
        if (!hero) return;
        var bgLayer = hero.querySelector('.absolute.inset-0.z-0 > div:first-child');
        if (!bgLayer) return;
        bgLayer.classList.add('hero-parallax');
        var tickingP = false;
        window.addEventListener('scroll', function() {
            if (!tickingP) {
                requestAnimationFrame(function() {
                    var rect = hero.getBoundingClientRect();
                    var scrolled = Math.max(0, -rect.top);
                    var maxScroll = window.innerHeight;
                    var factor = Math.min(scrolled / maxScroll, 1);
                    bgLayer.style.transform = 'scale(1.05) translateY(' + (factor * 35) + 'px)';
                    tickingP = false;
                });
                tickingP = true;
            }
        }, { passive: true });
    })();

    // Card 3D tilt effect on mouse move
    document.querySelectorAll('.hover-lift').forEach(function(card) {
        card.addEventListener('mousemove', function(e) {
            var rect = card.getBoundingClientRect();
            var rx = ((e.clientY - rect.top - rect.height / 2) / rect.height * -4).toFixed(1);
            var ry = ((e.clientX - rect.left - rect.width / 2) / rect.width * 4).toFixed(1);
            card.style.setProperty('--tilt-x', rx + 'deg');
            card.style.setProperty('--tilt-y', ry + 'deg');
        });
        card.addEventListener('mouseleave', function() {
            card.style.setProperty('--tilt-x', '0deg');
            card.style.setProperty('--tilt-y', '0deg');
        });
    });

    // Button ripple effect on click
    document.querySelectorAll('.btn-press').forEach(function(btn) {
        btn.classList.add('has-ripple');
        btn.addEventListener('click', function(e) {
            var existing = btn.querySelector('.ripple-el');
            if (existing) existing.remove();
            var rect = btn.getBoundingClientRect();
            var size = Math.max(rect.width, rect.height);
            var cx = e.clientX;
            if (!cx && e.touches && e.touches[0]) { cx = e.touches[0].clientX; }
            if (!cx) { cx = rect.left + rect.width / 2; }
            var cy = e.clientY;
            if (!cy && e.touches && e.touches[0]) { cy = e.touches[0].clientY; }
            if (!cy) { cy = rect.top + rect.height / 2; }
            var x = cx - rect.left - size / 2;
            var y = cy - rect.top - size / 2;
            var ripple = document.createElement('span');
            ripple.className = 'ripple-el';
            ripple.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + size + 'px;height:' + size + 'px;';
            btn.appendChild(ripple);
            setTimeout(function() { if (ripple.parentNode) ripple.remove(); }, 600);
        });
    });

    // Button glow for primary buttons
    document.querySelectorAll('[class*="bg-primary"][class*="rounded-full"]').forEach(function(btn) {
        if (btn.closest('nav') || btn.closest('.mobile-drawer')) return;
        btn.classList.add('btn-glow');
    });

    // Nav link underline animation
    document.querySelectorAll('nav a[href]:not([class*="flex items-center justify-center w-9"]):not([class*="rounded-full"])').forEach(function(link) {
        if (link.className.indexOf('border-b') !== -1) return;
        link.classList.add('nav-link-line');
    });

    // === Additional Animations ===

    // Scroll progress bar
    (function() {
        var bar = document.createElement('div');
        bar.className = 'scroll-progress';
        document.body.appendChild(bar);
        var tickingS = false;
        window.addEventListener('scroll', function() {
            if (!tickingS) {
                requestAnimationFrame(function() {
                    var scrollTop = window.scrollY;
                    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
                    var progress = docHeight > 0 ? scrollTop / docHeight : 0;
                    bar.style.transform = 'scaleX(' + progress + ')';
                    tickingS = false;
                });
                tickingS = true;
            }
        }, { passive: true });
    })();

    // Mobile drawer item stagger
    document.querySelectorAll('.mobile-drawer > a, .mobile-drawer > div:last-child > a').forEach(function(el, i) {
        el.classList.add('drawer-item');
        el.style.setProperty('--drawer-i', i);
    });

    // Footer link smooth underline
    document.querySelectorAll('footer a[href]:not([class*="rounded-full"])').forEach(function(link) {
        if (link.className.indexOf('hover:underline') !== -1) {
            link.classList.add('footer-link');
            link.classList.remove('hover:underline');
        }
    });

    // Link arrow slide on hover
    document.querySelectorAll('a:not([class*="rounded-full"]) .material-symbols-outlined').forEach(function(icon) {
        if (icon.textContent.trim() === 'arrow_forward' || icon.textContent.trim() === 'arrow_back') {
            var parent = icon.closest('a');
            if (parent && !parent.closest('nav') && !parent.closest('.mobile-drawer') && !parent.closest('footer')) {
                parent.classList.add('link-arrow');
            }
        }
    });

    // Premium shimmer for loading skeletons
    document.querySelectorAll('.animate-pulse').forEach(function(el) {
        el.classList.remove('animate-pulse');
        el.classList.add('shimmer');
    });

    // Reveal direction variants — alternate left/right/scale for .reveal child grids
    document.querySelectorAll('.grid > .reveal').forEach(function(el, i) {
        var variants = ['reveal-left', 'reveal-right', 'reveal-scale', 'reveal'];
        if (i > 0 && !el.classList.contains('delay-100') && !el.classList.contains('delay-200') && !el.classList.contains('delay-300')) {
            el.classList.remove('reveal');
            el.classList.add(variants[i % variants.length]);
        }
    });

    // Section reveal for non-.reveal sections with children
    document.querySelectorAll('section[id]:not(:first-of-type) > .max-w-container-max, section[id]:not(:first-of-type) > .w-full.max-w-5xl').forEach(function(el) {
        if (!el.classList.contains('reveal') && !el.closest('.mobile-drawer')) {
            el.classList.add('reveal');
        }
    });

    // === Extra Premium Class Wires ===

    // Price emphasis on price spans inside cards
    document.querySelectorAll('[class*="text-headline-md"][class*="text-primary"]').forEach(function(el) {
        if (el.textContent.match(/[₹$€£]|\/night/) && !el.closest('nav') && !el.closest('footer')) {
            el.classList.add('price-emphasis');
        }
    });

    // Stat number pop on reveal — observe stat numbers
    document.querySelectorAll('.stat-number').forEach(function(el) {
        el.classList.add('counter-emphasis');
        var statObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    statObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        statObserver.observe(el);
    });

    // Social icon hover lift
    document.querySelectorAll('footer a[class*="rounded-full"], [class*="social"] a[class*="rounded-full"]').forEach(function(el) {
        el.classList.add('social-lift');
    });

    // Amenity tag hover scale
    document.querySelectorAll('[class*="rounded-full"]:not(a):not(button)[class*="px-3"][class*="py-1"], [class*="rounded-full"]:not(a):not(button)[class*="px-2"][class*="py-0"]').forEach(function(el) {
        if (el.closest('nav') || el.closest('.mobile-drawer') || el.closest('footer')) return;
        el.classList.add('tag-hover');
    });

    // === Extracted Pattern Wires ===

    // Sidebar nav slide on hover (admin/dashboard)
    document.querySelectorAll('[class*="hover:translate-x-1"]').forEach(function(el) {
        el.classList.add('hover-slide-x');
    });

    // Deep shadow hover for room cards that have hover:shadow-xl or similar
    document.querySelectorAll('[class*="hover:shadow-["]').forEach(function(el) {
        el.classList.add('hover-shadow-deep');
    });

    // Table row hover for all tbody tr elements
    document.querySelectorAll('tbody tr').forEach(function(el) {
        el.classList.add('hover-bg-subtle');
    });

    // Tooltip reveal inside groups (chart bars in admin)
    document.querySelectorAll('.group [class*="opacity-0"][class*="group-hover:opacity-"]').forEach(function(el) {
        el.classList.add('tooltip-reveal');
    });

    // === Particle Overlay System ===
    (function() {
        var overlay = document.createElement('div');
        overlay.className = 'particle-overlay';
        document.body.appendChild(overlay);

        var currentTheme = null;

        function generateParticles(theme) {
            if (theme === currentTheme) return;
            currentTheme = theme;
            overlay.innerHTML = '';

            var isWinter = theme === 'winter';
            var count = isWinter ? 25 : 20;
            var keyframes = isWinter ? ['snowFall1', 'snowFall2'] : ['leafFall1', 'leafFall2', 'leafFall3'];
            var baseClass = isWinter ? 'particle-snow' : 'particle-leaf';
            var isDesktop = window.innerWidth >= 1024;

            function rand(min, max) { return (min + Math.random() * (max - min)).toFixed(1); }

            for (var i = 0; i < count; i++) {
                var el = document.createElement('div');
                var kf = keyframes[i % keyframes.length];

                var x = (Math.random() * 100).toFixed(1) + '%';
                var delay = (Math.random() * 0.5).toFixed(1) + 's';

                var size, rawSize, duration, opacity, sizeClass;

                if (isWinter) {
                    rawSize = 8 + Math.random() * 10;
                    size = rawSize.toFixed(1) + 'px';
                    if (rawSize < 12) {
                        duration = isDesktop ? rand(38, 52) : rand(55, 80);
                        sizeClass = 'ps-small';
                    } else if (rawSize < 15) {
                        duration = isDesktop ? rand(30, 40) : rand(45, 70);
                        sizeClass = 'ps-medium';
                    } else {
                        duration = isDesktop ? rand(24, 32) : rand(35, 60);
                        sizeClass = 'ps-large';
                    }
                    opacity = (0.35 + Math.random() * 0.55).toFixed(2);
                } else {
                    rawSize = 12 + Math.random() * 10;
                    size = rawSize.toFixed(1) + 'px';
                    if (rawSize < 16) {
                        duration = isDesktop ? rand(30, 40) : rand(55, 80);
                        sizeClass = 'ps-small';
                    } else if (rawSize < 20) {
                        duration = isDesktop ? rand(24, 32) : rand(45, 70);
                        sizeClass = 'ps-medium';
                    } else {
                        duration = isDesktop ? rand(18, 26) : rand(35, 60);
                        sizeClass = 'ps-large';
                    }
                    opacity = (0.5 + Math.random() * 0.4).toFixed(2);
                }

                el.className = 'particle ' + baseClass + ' ' + sizeClass + ' anim-' + kf;
                el.textContent = isWinter ? '\u2744' : '\uD83C\uDF3F';
                el.style.animation = kf + ' ' + duration + 's ' + delay + ' linear infinite';
                el.style.setProperty('--particle-size', size);
                el.style.setProperty('--particle-x', x);
                el.style.opacity = opacity;

                overlay.appendChild(el);
            }
        }

        generateParticles(
            document.documentElement.classList.contains('winter') ? 'winter' : 'green'
        );

        var themeObserver = new MutationObserver(function() {
            generateParticles(
                document.documentElement.classList.contains('winter') ? 'winter' : 'green'
            );
        });
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        var origToggle = window.__toggleTheme;
        if (typeof origToggle === 'function') {
            window.__toggleTheme = function() {
                origToggle();
                var currentTheme = document.documentElement.classList.contains('winter') ? 'winter' : 'green';
                generateParticles(currentTheme);
            };
        }
    })();

    // === Seasonal Image Switching ===
    (function() {
        var winterImages = {
            'hero': 'images/winter-hero.jpg',
            'garden': 'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=1600&q=80',
            'wellness-main': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80',
            'wellness-overlay': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80',
            'gallery-main': 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1600&q=80',
            'gallery-2': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80',
            'gallery-3': 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1600&q=80',
            'gallery-4': 'https://images.unsplash.com/photo-1582582622105-ed1b5ecde48b?w=1600&q=80',
            'booking': 'https://images.unsplash.com/photo-1582719508461-905c1a81d3a1?w=1600&q=80',
            'payment': 'https://images.unsplash.com/photo-1582719508461-905c1a81d3a1?w=1600&q=80',
            'about-hero': 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1600&q=80',
            'about-vision': 'https://images.unsplash.com/photo-1582582622105-ed1b5ecde48b?w=1600&q=80',
            'contact-map': 'https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=1600&q=80',
            'auth-bg': 'https://images.unsplash.com/photo-1478265409131-1f941d3c386e?w=1600&q=80'
        };

        function preload(src) {
            return new Promise(function(resolve) {
                var img = new Image();
                img.onload = resolve;
                img.onerror = resolve;
                img.src = src;
            });
        }

        function getBgUrl(el) {
            var bg = el.style.backgroundImage;
            if (bg && bg.indexOf('url(') === 0) {
                return bg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
            }
            return '';
        }

        function setSrc(el, src) {
            if (el.tagName === 'IMG') {
                el.src = src;
            } else {
                el.style.backgroundImage = 'url(' + src + ')';
            }
        }

        function fadeTo(el, src, instant) {
            if (instant) {
                setSrc(el, src);
                el.style.transition = '';
                return;
            }

            el.style.transition = 'opacity 0.35s ease';
            el.style.opacity = '0';

            setTimeout(function() {
                setSrc(el, src);
                requestAnimationFrame(function() {
                    el.style.opacity = '1';
                    setTimeout(function() {
                        el.style.transition = '';
                    }, 350);
                });
            }, 350);
        }

        function getTheme() {
            return document.documentElement.classList.contains('winter') ? 'winter' : 'green';
        }

        function swapAll(instant) {
            var theme = getTheme();
            var isWinter = theme === 'winter';

            document.querySelectorAll('[data-theme-img]').forEach(function(el) {
                var key = el.getAttribute('data-theme-img');
                var winterUrl = winterImages[key];
                if (!winterUrl) return;

                if (isWinter) {
                    if (!el.hasAttribute('data-green-src')) {
                        var src = el.tagName === 'IMG' ? el.src : getBgUrl(el);
                        el.setAttribute('data-green-src', src);
                    }
                    if (instant) {
                        setSrc(el, winterUrl);
                    } else {
                        preload(winterUrl).then(function() {
                            fadeTo(el, winterUrl, false);
                        });
                    }
                } else {
                    var greenSrc = el.getAttribute('data-green-src');
                    if (greenSrc) {
                        preload(greenSrc).then(function() {
                            fadeTo(el, greenSrc, false);
                        });
                    }
                }
            });
        }

        var ready = function() {
            if (getTheme() === 'winter') {
                // Preload all winter images first, then swap instantly
                var keys = Object.keys(winterImages);
                var promises = keys.map(function(k) { return preload(winterImages[k]); });
                Promise.all(promises).then(function() {
                    swapAll(true);
                });
            }

            var obs = new MutationObserver(function() {
                swapAll(false);
            });
            obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', ready);
        } else {
            ready();
        }
    })();
});
