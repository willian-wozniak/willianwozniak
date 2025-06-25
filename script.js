class Index {
    constructor() {
        this.init();
    }

    init() {
        window.addEventListener('load', () => {
            if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof ScrollToPlugin === 'undefined') {
                console.error("GSAP ou seus plugins não carregaram a tempo!");
                return;
            }

            gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

            this.animateTitle();
            this.splitTextManually();
            this.setupScrollSpy();
            this.setupCustomCursor();
            this.setupTypedJs();
            this.setupNavbar();
            this.setupScrollAnimations();
            this.setupHoverAnimations();
            this.setupScrollProgressBar();
            this.setupParallaxProfile();
            this.playIntroAnimation();
            this.setupStickyFooter();
            this.setupTransitionImagesProjects();
        });
    }

    animateTitle() {
        gsap.from("#tituloPrincipal", {
            duration: 1,
            opacity: 0,
            scale: 0.8,
            ease: "back.out(1.7)",
        });
    }

    splitTextManually() {
        const title = document.getElementById('tituloPrincipal');
        if (title && title.dataset.splitting !== undefined) {
            const text = title.textContent;
            title.textContent = '';
            text.split('').forEach(char => {
                const span = document.createElement('span');
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.style.display = 'inline-block';
                title.appendChild(span);
            });
        }
    }

    setupCustomCursor() {
        const cursorDot = document.querySelector('.cursor-dot');
        const cursorOutline = document.querySelector('.cursor-outline');
        const interactiveElements = document.querySelectorAll('a, button, .skill-item, .project-card, .project-card-vertical, .social-link, .footer-social a');

        if (!cursorDot || !cursorOutline) return;

        gsap.set([cursorDot, cursorOutline], { xPercent: -50, yPercent: -50 });

        window.addEventListener('mousemove', e => {
            const { clientX, clientY } = e;

            gsap.to(cursorDot, { duration: 0.1, x: clientX, y: clientY, opacity: 1 });
            gsap.to(cursorOutline, { duration: 0.5, x: clientX, y: clientY, opacity: 1, ease: 'power2.out' });
        });

        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });

        document.addEventListener('mouseleave', () => gsap.to([cursorDot, cursorOutline], { opacity: 0, duration: 0.3 }));
        document.addEventListener('mouseenter', () => gsap.to([cursorDot, cursorOutline], { opacity: 1, duration: 0.3 }));
    }

    setupTypedJs() {
        if (typeof Typed !== 'undefined') {
            new Typed('#typed-subtitle', {
                strings: [
                    'Engenheiro de Software',
                    'Especialista em Java e Golang',
                    'Criador de Soluções Web Escaláveis',
                    'Defensor da Arquitetura Limpa',
                    'Desenvolvedor de Sistemas ERP',
                    'Apaixonado por Código de Qualidade'
                ],
                typeSpeed: 60, backSpeed: 30, backDelay: 1500, startDelay: 500,
                loop: true, smartBackspace: true, showCursor: true, cursorChar: '|',
            });
        } else {
            document.getElementById('typed-subtitle').textContent = "Desenvolvedor e Engenheiro de Software";
        }
    }

    setupNavbar() {
        const navToggle = document.querySelector('.nav-toggle');
        const navLinks = document.querySelector('.nav-links');
        const navLinkItems = document.querySelectorAll('.nav-links li a');

        let menuOpen = false;

        const tlMenu = gsap.timeline({ paused: true, reversed: true });
        tlMenu.to(navLinks, { right: 0, duration: 0.5, ease: "power2.out" })
            .from(navLinkItems, { opacity: 1, y: 20, stagger: 0.1, duration: 0.4 }, "-=0.3");

        navToggle.addEventListener('click', () => {
            menuOpen = !menuOpen;
            navToggle.querySelector('i').classList.toggle('fa-bars');
            navToggle.querySelector('i').classList.toggle('fa-xmark');
            menuOpen ? tlMenu.play() : tlMenu.reverse();
        });

        navLinkItems.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                gsap.to(window, { duration: 1.2, scrollTo: targetId, ease: "power3.inOut" });
                if (menuOpen) {
                    tlMenu.reverse();
                    menuOpen = false;
                    navToggle.querySelector('i').classList.add('fa-bars');
                    navToggle.querySelector('i').classList.remove('fa-xmark');
                }
            });
        });
    }

    playIntroAnimation() {
        const tl = gsap.timeline({ defaults: { ease: "expo.out", duration: 1.2 } });

        tl.from('.nav-logo', { y: -80, opacity: 0, duration: 0.8 })
            .from('.nav-links li', { y: -80, opacity: 0, stagger: 0.08 }, "-=0.5");

        gsap.from("#subTitulo", {
            clipPath: "inset(0 100% 0 0)",
            duration: 1,
            ease: "power2.out"
        });


        gsap.to("#ctaBotao", { scale: 1.05, repeat: -1, yoyo: true, ease: "power1.inOut", duration: 1.5 });
    }

    setupScrollAnimations() {
        gsap.utils.toArray('.about-text').forEach(paragraph => {
            gsap.from(paragraph, {
                opacity: 0,
                x: -30,
                duration: 1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: paragraph,
                    start: 'top 85%',
                    end: 'bottom 10%',
                    toggleActions: 'play reverse play reverse',
                    markers: false
                }
            });
        });

        gsap.utils.toArray('.skill-item').forEach(skill => {
            gsap.from(skill, {
                y: 50,
                opacity: 0,
                duration: 0.8,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: skill,
                    start: 'top 90%',
                    end: 'bottom 10%',
                    toggleActions: 'play reverse play reverse',
                    markers: false,
                }
            });
        });

        gsap.utils.toArray('.project-card').forEach(card => {
            gsap.from(card, {
                opacity: 0,
                y: 30,
                duration: 0.8,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 60%',
                    end: 'bottom 40%',
                    toggleActions: 'play reverse play reverse',
                    markers: false, 
                }
            });
        });

    }


    setupHoverAnimations() {
        document.querySelectorAll('.social-link, .footer-social a').forEach(link => {
            link.addEventListener('mouseenter', () => gsap.to(link, { y: -5, scale: 1.1, duration: 0.15, ease: 'power1.out' }));
            link.addEventListener('mouseleave', () => gsap.to(link, { y: 0, scale: 1, duration: 0.15, ease: 'power1.out' }));
        });
    }

    setupScrollProgressBar() {
        window.addEventListener('scroll', () => {
            const scroll = window.scrollY;
            const height = document.body.scrollHeight - window.innerHeight;
            const progress = (scroll / height) * 100;
            gsap.to('#scroll-progress', { width: `${progress}%`, duration: 0.3, ease: "power1.out" });
        });
    }

    setupParallaxProfile() {
        const profilePic = document.querySelector('.profile-pic');
        if (!profilePic) return;

        window.addEventListener('mousemove', e => {
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX / innerWidth - 0.5) * 20;
            const y = (e.clientY / innerHeight - 0.5) * 20;
            gsap.to(profilePic, { x, y, duration: 0.5, ease: "power2.out" });
        });
    }

    setupScrollSpy() {
        gsap.utils.toArray('section').forEach(section => {
            ScrollTrigger.create({
                trigger: section,
                start: 'top 60%',
                end: 'bottom 40%',
                onEnter: () => this.setActiveLink(section.id),
                onEnterBack: () => this.setActiveLink(section.id),
            });
        });
    }

    setActiveLink(id) {
        const navLinks = document.querySelectorAll('.nav-links li a');
        navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    setupStickyFooter() {
        const footer = document.querySelector('footer');
        if (!footer) return;

        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const docHeight = document.body.scrollHeight;

            if (scrollTop + windowHeight >= docHeight / 2) {
                footer.classList.add('footer-visible');
            } else {
                footer.classList.remove('footer-visible');
            }
        });
    }

    setupTransitionImagesProjects() {
        const cards = document.querySelectorAll('.project-card');
        const images = document.querySelectorAll('.project-img');

        const visibleCards = new Set();

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const index = entry.target.dataset.index;

                if (entry.isIntersecting) {
                    visibleCards.add(index);
                } else {
                    visibleCards.delete(index);
                }

                if (visibleCards.size > 0) {
                    const currentIndex = [...visibleCards][0];

                    images.forEach(img => img.classList.remove('active'));
                    const targetImg = document.querySelector(`.project-img[data-id="${currentIndex}"]`);
                    if (targetImg) {
                        targetImg.classList.add('active');
                    }
                } else {
                    images.forEach(img => img.classList.remove('active'));
                }
            });
        }, {
            threshold: 0.8
        });

        cards.forEach(card => observer.observe(card));
    }





}

new Index();
