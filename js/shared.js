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
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('bg-surface/80');
                nav.classList.remove('bg-surface/15');
            } else {
                nav.classList.add('bg-surface/15');
                nav.classList.remove('bg-surface/80');
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

        document.querySelector('.divide-x')?.parentElement && observer.observe(document.querySelector('.divide-x').parentElement);
    }
});
