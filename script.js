// ============================================================
// Setup
// ============================================================
lucide.createIcons();

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reducedMotion) {
    document.documentElement.classList.add('no-motion');
}

// ============================================================
// Nav: sliding indicator + scroll spy
// ============================================================
const navIndicator = document.getElementById('nav-indicator');
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('main section[id]');

function moveIndicator(target) {
    if (!target || !navIndicator) return;
    const rect = target.getBoundingClientRect();
    const parentRect = target.parentElement.getBoundingClientRect();
    navIndicator.style.width = `${rect.width}px`;
    navIndicator.style.left = `${rect.left - parentRect.left}px`;
}

function currentSectionId() {
    let current = '';
    sections.forEach((section) => {
        if (window.pageYOffset >= section.offsetTop - 200) {
            current = section.getAttribute('id');
        }
    });
    return current;
}

function syncActiveNav() {
    const current = currentSectionId();
    navItems.forEach((item) => {
        item.classList.toggle('active', item.getAttribute('href') === `#${current}`);
        if (item.getAttribute('href') === `#${current}`) moveIndicator(item);
    });
}

window.addEventListener('load', () => {
    if (navItems.length) moveIndicator(navItems[0]);
    syncActiveNav();
});
window.addEventListener('scroll', syncActiveNav, { passive: true });
window.addEventListener('resize', syncActiveNav);

navItems.forEach((item) => {
    item.addEventListener('mouseenter', (e) => moveIndicator(e.currentTarget));
    item.addEventListener('mouseleave', syncActiveNav);
});

// ============================================================
// Mobile hamburger menu
// ============================================================
const navToggle = document.getElementById('nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');

function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    mobileMenu.hidden = true;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.innerHTML = '<i data-lucide="menu" class="w-6 h-6" aria-hidden="true"></i>';
    lucide.createIcons();
}

function openMobileMenu() {
    mobileMenu.hidden = false;
    requestAnimationFrame(() => mobileMenu.classList.add('open'));
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.innerHTML = '<i data-lucide="x" class="w-6 h-6" aria-hidden="true"></i>';
    lucide.createIcons();
}

if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
        isOpen ? closeMobileMenu() : openMobileMenu();
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !navToggle.contains(e.target)) {
            closeMobileMenu();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMobileMenu();
    });
}

// ============================================================
// Typewriter hero line
// ============================================================
const typewriterEl = document.getElementById('typewriter');
const roles = [
    'Lead DevOps Engineer',
    'Cloud & Platform Engineering',
    'Site Reliability Engineering',
    'AIOps & Agentic Automation'
];

function runTypewriter() {
    if (!typewriterEl) return;

    if (reducedMotion) {
        typewriterEl.textContent = roles[0];
        return;
    }

    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
        const current = roles[roleIndex];

        if (!deleting) {
            charIndex++;
            typewriterEl.textContent = current.slice(0, charIndex);
            if (charIndex === current.length) {
                deleting = true;
                setTimeout(tick, 1600);
                return;
            }
        } else {
            charIndex--;
            typewriterEl.textContent = current.slice(0, charIndex);
            if (charIndex === 0) {
                deleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
            }
        }
        setTimeout(tick, deleting ? 35 : 65);
    }

    tick();
}
runTypewriter();

// ============================================================
// Vanta.GLOBE persistent full-page background (guarded)
// ============================================================
const fallbackBg = document.querySelector('.hero-fallback-bg');
let vantaEffect = null;

function initVanta() {
    if (vantaEffect || reducedMotion || window.innerWidth < 768) {
        if (fallbackBg) fallbackBg.classList.add('show');
        return;
    }
    if (typeof VANTA === 'undefined') {
        if (fallbackBg) fallbackBg.classList.add('show');
        return;
    }
    vantaEffect = VANTA.GLOBE({
        el: '#vanta-bg',
        mouseControls: true,
        touchControls: false,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0x3fb950,
        color2: 0x56d4dd,
        size: 1.1,
        backgroundColor: 0x0d1117
    });
}

function destroyVanta() {
    if (vantaEffect) {
        vantaEffect.destroy();
        vantaEffect = null;
    }
}

// Persistent background: init immediately (not gated on hero visibility)
// since it now spans the whole page and should never disappear on scroll.
initVanta();

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        destroyVanta();
    } else {
        initVanta();
    }
});

// Tie the background to scroll position: as the page scrolls down/up,
// the globe drifts and rotates proportionally (reverses on scroll-up).
if (!reducedMotion && typeof gsap !== 'undefined' && window.innerWidth >= 768) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.to('#vanta-bg', {
        yPercent: -10,
        xPercent: 4,
        rotate: 8,
        ease: 'none',
        scrollTrigger: {
            trigger: document.documentElement,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6
        }
    });
}

// ============================================================
// vanilla-tilt on cards (hover-capable devices only)
// ============================================================
if (!reducedMotion && window.matchMedia('(hover: hover)').matches && typeof VanillaTilt !== 'undefined') {
    const tiltTargets = document.querySelectorAll('.skill-panel, .project-panel, .cred-badge');
    VanillaTilt.init(Array.from(tiltTargets), {
        max: 6,
        speed: 400,
        glare: true,
        'max-glare': 0.12,
        scale: 1.02
    });
}

// ============================================================
// GSAP: scroll reveals, stat counters, timeline scrub
// ============================================================
if (!reducedMotion && typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('.reveal').forEach((el, i) => {
        gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            delay: (i % 4) * 0.06,
            scrollTrigger: {
                trigger: el,
                start: 'top 88%',
                toggleActions: 'play none none none'
            }
        });
    });

    gsap.utils.toArray('.stat-number').forEach((el) => {
        const target = parseInt(el.dataset.count, 10) || 0;
        const suffix = el.dataset.suffix || '';
        const counter = { val: 0 };
        gsap.to(counter, {
            val: target,
            duration: 1.6,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 90%',
                toggleActions: 'play none none none'
            },
            onUpdate: () => {
                el.textContent = Math.round(counter.val) + suffix;
            }
        });
    });

    const timelineFill = document.querySelector('.timeline-line-fill');
    if (timelineFill) {
        gsap.to(timelineFill, {
            height: '100%',
            ease: 'none',
            scrollTrigger: {
                trigger: '.timeline',
                start: 'top 70%',
                end: 'bottom 80%',
                scrub: 0.6
            }
        });
    }
} else {
    // Reduced motion: show everything immediately
    document.querySelectorAll('.stat-number').forEach((el) => {
        const target = parseInt(el.dataset.count, 10) || 0;
        const suffix = el.dataset.suffix || '';
        el.textContent = target + suffix;
    });
    const timelineFill = document.querySelector('.timeline-line-fill');
    if (timelineFill) timelineFill.style.height = '100%';
}

// ============================================================
// Footer year
// ============================================================
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
