class Index {
    constructor() {
        this.reducedMotionQuery = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

        this.touchQuery = window.matchMedia(
            "(hover: none), (pointer: coarse)"
        );

        this.projectDesktopQuery =
            "(min-width: 981px) and (min-height: 651px)";

        this.isReducedMotion =
            this.reducedMotionQuery.matches;

        this.isTouchDevice =
            this.touchQuery.matches;

        this.isLowPowerDevice =
            (
                navigator.hardwareConcurrency &&
                navigator.hardwareConcurrency <= 4
            ) ||
            (
                navigator.deviceMemory &&
                navigator.deviceMemory <= 4
            );

        this.currentProjectIndex = -1;
        this.menuOpen = false;
        this.started = false;
        this.gsapReady = false;
        this.typedInstance = null;
        this.projectMatchMedia = null;
        this.refreshTimer = null;
        this.scrollFrame = null;

        this.init();
    }

    init() {
        this.setCurrentYear();
        this.prepareTitleWords();
        this.setupNavbar();
        this.setupSmoothNavigation();
        this.setupBackToTop();
        this.setupScrollUi();

        const start = () => {
            if (this.started) return;

            this.started = true;

            requestAnimationFrame(
                () => this.startExperience()
            );
        };

        if (
            document.readyState === "loading"
        ) {
            document.addEventListener(
                "DOMContentLoaded",
                start,
                {
                    once: true,
                }
            );
        } else {
            start();
        }
    }

    startExperience() {
        const hasGsap =
            typeof gsap !== "undefined";

        const hasScrollTrigger =
            typeof ScrollTrigger !== "undefined";

        const hasScrollTo =
            typeof ScrollToPlugin !== "undefined";

        this.setupTypedJs();

        if (
            !hasGsap ||
            !hasScrollTrigger ||
            !hasScrollTo
        ) {
            console.error(
                "GSAP ou seus plugins não foram carregados. " +
                "O portfólio seguirá sem as animações avançadas."
            );

            this.removeLoaderWithoutAnimation();
            this.setupNativeScrollSpy();

            return;
        }

        gsap.registerPlugin(
            ScrollTrigger,
            ScrollToPlugin
        );

        gsap.config({
            nullTargetWarn: false,
        });

        ScrollTrigger.config({
            ignoreMobileResize: true,
            limitCallbacks: true,
        });

        this.gsapReady = true;

        this.prepareHeroAnimationState();
        this.setupScrollProgress();
        this.setupScrollSpy();
        this.setupResizeHandling();

        if (this.isReducedMotion) {
            this.removeLoaderWithoutAnimation();
            this.showStaticState();
            this.queueScrollRefresh();

            return;
        }

        this.setupCustomCursor();
        this.setupMagneticButtons();
        this.setupAmbientAnimations();
        this.setupSectionHeaders();
        this.setupAboutAnimations();
        this.setupSkillsAnimations();
        this.setupExperienceAnimations();
        this.setupProjectResponsiveAnimations();
        this.setupContactAnimations();
        this.setupAssetRefresh();

        this.hideSkeleton(() => {
            this.playHeroIntro();
            this.queueScrollRefresh();
        });
    }

    setCurrentYear() {
        const year =
            document.getElementById(
                "current-year"
            );

        if (year) {
            year.textContent = String(
                new Date().getFullYear()
            );
        }
    }

    prepareTitleWords() {
        const title =
            document.getElementById(
                "tituloPrincipal"
            );

        if (
            !title ||
            title.dataset.split === "true"
        ) {
            return;
        }

        const words =
            title.textContent
                .trim()
                .split(/\s+/);

        const fragment =
            document.createDocumentFragment();

        words.forEach(word => {
            const wordElement =
                document.createElement("span");

            wordElement.className =
                "title-word";

            wordElement.setAttribute(
                "aria-hidden",
                "true"
            );

            Array.from(word).forEach(
                character => {
                    const letter =
                        document.createElement(
                            "span"
                        );

                    letter.className =
                        "title-letter";

                    letter.textContent =
                        character;

                    wordElement.appendChild(
                        letter
                    );
                }
            );

            fragment.appendChild(
                wordElement
            );
        });

        title.textContent = "";
        title.appendChild(fragment);
        title.dataset.split = "true";
    }

    setupTypedJs() {
        const subtitle =
            document.getElementById(
                "typed-subtitle"
            );

        if (!subtitle) return;

        if (this.isReducedMotion) {
            subtitle.textContent =
                "Especiaista Sênior em Engenharia de IA";

            return;
        }

        if (typeof Typed === "undefined") {
            subtitle.textContent =
                "Especiaista Sênior em Engenharia de IA · " +
                "Java · Python · JavaScript";

            return;
        }

        this.typedInstance = new Typed(
            "#typed-subtitle",
            {
                strings: [
                    "Especiaista Sênior em Engenharia de IA",
                    "Java · Python · JavaScript",
                    "Arquitetura limpa e sistemas escaláveis",
                    "Produtos, automações e agentes com IA",
                ],
                typeSpeed: 46,
                backSpeed: 23,
                backDelay: 1700,
                startDelay: 700,
                loop: true,
                smartBackspace: true,
                showCursor: true,
                cursorChar: "|",
            }
        );
    }

    setupNavbar() {
        const toggle =
            document.querySelector(
                ".nav-toggle"
            );

        const links =
            document.querySelectorAll(
                ".nav-links a"
            );

        if (!toggle) return;

        toggle.addEventListener(
            "click",
            () => this.toggleMenu()
        );

        links.forEach(link => {
            link.addEventListener(
                "click",
                () => {
                    if (this.menuOpen) {
                        this.closeMenu();
                    }
                }
            );
        });

        document.addEventListener(
            "keydown",
            event => {
                if (
                    event.key === "Escape" &&
                    this.menuOpen
                ) {
                    this.closeMenu();
                    toggle.focus();
                }
            }
        );

        window.addEventListener(
            "resize",
            () => {
                if (
                    window.innerWidth > 860 &&
                    this.menuOpen
                ) {
                    this.closeMenu(true);
                }
            }
        );
    }

    toggleMenu() {
        if (this.menuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        const toggle =
            document.querySelector(
                ".nav-toggle"
            );

        const navLinks =
            document.querySelector(
                ".nav-links"
            );

        const items =
            document.querySelectorAll(
                ".nav-links li"
            );

        if (!toggle || !navLinks) return;

        this.menuOpen = true;

        document.body.classList.add(
            "menu-open"
        );

        navLinks.classList.add(
            "active"
        );

        toggle.setAttribute(
            "aria-expanded",
            "true"
        );

        toggle.setAttribute(
            "aria-label",
            "Fechar menu"
        );

        if (
            !this.gsapReady ||
            this.isReducedMotion
        ) {
            return;
        }

        gsap.killTweensOf([
            items,
            ".nav-toggle span",
        ]);

        gsap.fromTo(
            items,
            {
                x: 30,
                opacity: 0,
            },
            {
                x: 0,
                opacity: 1,
                duration: 0.42,
                stagger: 0.055,
                ease: "power3.out",
                overwrite: true,
            }
        );

        this.animateMenuIcon(true);
    }

    closeMenu(immediate = false) {
        const toggle =
            document.querySelector(
                ".nav-toggle"
            );

        const navLinks =
            document.querySelector(
                ".nav-links"
            );

        this.menuOpen = false;

        document.body.classList.remove(
            "menu-open"
        );

        navLinks?.classList.remove(
            "active"
        );

        toggle?.setAttribute(
            "aria-expanded",
            "false"
        );

        toggle?.setAttribute(
            "aria-label",
            "Abrir menu"
        );

        if (
            !this.gsapReady ||
            this.isReducedMotion
        ) {
            return;
        }

        this.animateMenuIcon(
            false,
            immediate
        );
    }

    animateMenuIcon(
        open,
        immediate = false
    ) {
        const lines =
            document.querySelectorAll(
                ".nav-toggle span"
            );

        if (lines.length < 2) return;

        const duration =
            immediate ? 0 : 0.3;

        gsap.to(lines[0], {
            y: open ? 4 : -4,
            rotation: open ? 45 : 0,
            duration,
            ease: "power3.out",
            overwrite: true,
        });

        gsap.to(lines[1], {
            y: open ? -4 : 4,
            rotation: open ? -45 : 0,
            duration,
            ease: "power3.out",
            overwrite: true,
        });
    }

    setupScrollUi() {
        const navbar =
            document.querySelector(
                ".navbar"
            );

        const backToTop =
            document.querySelector(
                ".back-to-top"
            );

        const update = () => {
            this.scrollFrame = null;

            const scrollTop =
                window.scrollY;

            navbar?.classList.toggle(
                "is-scrolled",
                scrollTop > 20
            );

            backToTop?.classList.toggle(
                "is-visible",
                scrollTop >
                    window.innerHeight * 0.72
            );
        };

        const requestUpdate = () => {
            if (this.scrollFrame) return;

            this.scrollFrame =
                requestAnimationFrame(
                    update
                );
        };

        window.addEventListener(
            "scroll",
            requestUpdate,
            {
                passive: true,
            }
        );

        update();
    }

    setupSmoothNavigation() {
        document
            .querySelectorAll(
                'a[href^="#"]'
            )
            .forEach(link => {
                link.addEventListener(
                    "click",
                    event => {
                        const selector =
                            link.getAttribute(
                                "href"
                            );

                        if (
                            !selector ||
                            selector === "#"
                        ) {
                            return;
                        }

                        const target =
                            document.querySelector(
                                selector
                            );

                        if (!target) return;

                        event.preventDefault();

                        const navbarHeight =
                            Number.parseFloat(
                                getComputedStyle(
                                    document
                                        .documentElement
                                )
                                    .getPropertyValue(
                                        "--navbar-height"
                                    )
                            ) || 72;

                        if (
                            this.gsapReady &&
                            !this.isReducedMotion
                        ) {
                            gsap.to(window, {
                                duration: 0.9,
                                scrollTo: {
                                    y: target,
                                    offsetY:
                                        navbarHeight +
                                        14,
                                },
                                ease:
                                    "power3.inOut",
                                overwrite: true,
                            });
                        } else {
                            target.scrollIntoView(
                                {
                                    behavior:
                                        this
                                            .isReducedMotion
                                            ? "auto"
                                            : "smooth",
                                }
                            );
                        }
                    }
                );
            });
    }

    setupBackToTop() {
        const button =
            document.querySelector(
                ".back-to-top"
            );

        if (!button) return;

        button.addEventListener(
            "click",
            () => {
                if (
                    this.gsapReady &&
                    !this.isReducedMotion
                ) {
                    gsap.to(window, {
                        duration: 0.9,
                        scrollTo: 0,
                        ease: "power3.inOut",
                        overwrite: true,
                    });
                } else {
                    window.scrollTo({
                        top: 0,
                        behavior:
                            this
                                .isReducedMotion
                                ? "auto"
                                : "smooth",
                    });
                }
            }
        );
    }

    setupScrollProgress() {
        gsap.to("#scroll-progress", {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
                trigger:
                    document.documentElement,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.1,
            },
        });
    }

    setupScrollSpy() {
        gsap.utils
            .toArray(
                "main section[id]"
            )
            .forEach(section => {
                ScrollTrigger.create({
                    trigger: section,
                    start: "top 52%",
                    end: "bottom 52%",
                    onEnter: () =>
                        this.setActiveLink(
                            section.id
                        ),
                    onEnterBack: () =>
                        this.setActiveLink(
                            section.id
                        ),
                });
            });
    }

    setupNativeScrollSpy() {
        const sections =
            document.querySelectorAll(
                "main section[id]"
            );

        const observer =
            new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        if (
                            entry.isIntersecting
                        ) {
                            this.setActiveLink(
                                entry.target.id
                            );
                        }
                    });
                },
                {
                    rootMargin:
                        "-45% 0px -45% 0px",
                }
            );

        sections.forEach(
            section =>
                observer.observe(section)
        );
    }

    setActiveLink(id) {
        document
            .querySelectorAll(
                ".nav-links a"
            )
            .forEach(link => {
                const isActive =
                    link.getAttribute(
                        "href"
                    ) === `#${id}`;

                link.classList.toggle(
                    "active",
                    isActive
                );

                if (isActive) {
                    link.setAttribute(
                        "aria-current",
                        "page"
                    );
                } else {
                    link.removeAttribute(
                        "aria-current"
                    );
                }
            });
    }

    prepareHeroAnimationState() {
        gsap.set(
            ".title-letter",
            {
                yPercent: 115,
                opacity: 0,
                rotationX: -72,
                transformOrigin:
                    "50% 100%",
            }
        );

        gsap.set(
            "[data-hero-item]",
            {
                y: 24,
                opacity: 0,
            }
        );

        gsap.set(
            ".scroll-indicator",
            {
                y: 16,
                opacity: 0,
            }
        );

        gsap.set(
            ".nav-logo, " +
            ".nav-links li, " +
            ".nav-toggle",
            {
                y: -22,
                opacity: 0,
            }
        );
    }

    hideSkeleton(onReveal) {
        const loader =
            document.getElementById(
                "loading-screen"
            );

        if (!loader) {
            document.body.classList.remove(
                "is-loading"
            );

            onReveal?.();

            return;
        }

        const timeline =
            gsap.timeline({
                onComplete: () => {
                    loader.remove();

                    document.body
                        .classList
                        .remove(
                            "is-loading"
                        );
                },
            });

        timeline
            .to(".skeleton", {
                opacity: 0,
                y: -6,
                duration: 0.2,
                stagger: {
                    each: 0.004,
                    from: "random",
                },
                ease: "power2.in",
            })
            .add(
                () => onReveal?.(),
                "-=0.02"
            )
            .to(
                loader,
                {
                    clipPath:
                        "inset(0 0 100% 0)",
                    duration: 0.68,
                    ease: "expo.inOut",
                },
                "-=0.04"
            );
    }

    removeLoaderWithoutAnimation() {
        document
            .getElementById(
                "loading-screen"
            )
            ?.remove();

        document.body.classList.remove(
            "is-loading"
        );
    }

    playHeroIntro() {
        const timeline =
            gsap.timeline({
                defaults: {
                    ease: "expo.out",
                },
            });

        timeline
            .to(
                ".nav-logo, " +
                ".nav-links li, " +
                ".nav-toggle",
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.68,
                    stagger: 0.045,
                }
            )
            .to(
                ".hero-status",
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.5,
                },
                "-=0.4"
            )
            .to(
                ".hero-kicker",
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.5,
                },
                "-=0.38"
            )
            .to(
                ".title-letter",
                {
                    yPercent: 0,
                    opacity: 1,
                    rotationX: 0,
                    duration: 0.9,
                    stagger: 0.018,
                },
                "-=0.28"
            )
            .to(
                "#subTitulo",
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.58,
                },
                "-=0.5"
            )
            .to(
                ".hero-description",
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                },
                "-=0.46"
            )
            .to(
                ".hero-actions",
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.55,
                },
                "-=0.44"
            )
            .to(
                ".hero-metrics",
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.65,
                },
                "-=0.4"
            )
            .from(
                ".metric-card",
                {
                    y: 12,
                    opacity: 0,
                    duration: 0.38,
                    stagger: 0.07,
                },
                "-=0.5"
            )
            .to(
                ".scroll-indicator",
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.45,
                },
                "-=0.35"
            )
            .add(
                () =>
                    this.animateCounters(),
                "-=0.55"
            );
    }

    animateCounters() {
        document
            .querySelectorAll(
                "[data-counter]"
            )
            .forEach(element => {
                const target = Number(
                    element.dataset.counter ||
                    0
                );

                const suffix =
                    element.dataset
                        .counterSuffix || "";

                const state = {
                    value: 0,
                };

                gsap.to(state, {
                    value: target,
                    duration: 1.25,
                    ease: "power2.out",
                    overwrite: true,
                    onUpdate: () => {
                        element.textContent =
                            `${Math.round(
                                state.value
                            )}${suffix}`;
                    },
                });
            });
    }

    setupCustomCursor() {
        if (
            this.isTouchDevice ||
            this.isLowPowerDevice ||
            window.innerWidth <= 980
        ) {
            return;
        }

        const dot =
            document.querySelector(
                ".cursor-dot"
            );

        const outline =
            document.querySelector(
                ".cursor-outline"
            );

        if (!dot || !outline) return;

        gsap.set(
            [dot, outline],
            {
                xPercent: -50,
                yPercent: -50,
            }
        );

        const dotX =
            gsap.quickTo(
                dot,
                "x",
                {
                    duration: 0.08,
                    ease: "power3",
                }
            );

        const dotY =
            gsap.quickTo(
                dot,
                "y",
                {
                    duration: 0.08,
                    ease: "power3",
                }
            );

        const outlineX =
            gsap.quickTo(
                outline,
                "x",
                {
                    duration: 0.28,
                    ease: "power3",
                }
            );

        const outlineY =
            gsap.quickTo(
                outline,
                "y",
                {
                    duration: 0.28,
                    ease: "power3",
                }
            );

        let cursorVisible = false;

        window.addEventListener(
            "pointermove",
            event => {
                dotX(event.clientX);
                dotY(event.clientY);
                outlineX(event.clientX);
                outlineY(event.clientY);

                if (!cursorVisible) {
                    cursorVisible = true;

                    gsap.to(
                        [dot, outline],
                        {
                            opacity: 1,
                            duration: 0.18,
                            overwrite: true,
                        }
                    );
                }
            }
        );

        document
            .querySelectorAll(
                "a, button, " +
                ".skill-item, " +
                ".skill-group, " +
                ".project-card"
            )
            .forEach(element => {
                element.addEventListener(
                    "mouseenter",
                    () => {
                        document.body
                            .classList
                            .add(
                                "cursor-hover"
                            );

                        gsap.to(
                            outline,
                            {
                                scale: 1.55,
                                duration: 0.22,
                                ease:
                                    "power3.out",
                                overwrite: true,
                            }
                        );

                        gsap.to(
                            dot,
                            {
                                scale: 0.45,
                                duration: 0.18,
                                overwrite: true,
                            }
                        );
                    }
                );

                element.addEventListener(
                    "mouseleave",
                    () => {
                        document.body
                            .classList
                            .remove(
                                "cursor-hover"
                            );

                        gsap.to(
                            outline,
                            {
                                scale: 1,
                                duration: 0.22,
                                ease:
                                    "power3.out",
                                overwrite: true,
                            }
                        );

                        gsap.to(
                            dot,
                            {
                                scale: 1,
                                duration: 0.18,
                                overwrite: true,
                            }
                        );
                    }
                );
            });

        document.addEventListener(
            "mouseleave",
            () => {
                cursorVisible = false;

                gsap.to(
                    [dot, outline],
                    {
                        opacity: 0,
                        duration: 0.18,
                        overwrite: true,
                    }
                );
            }
        );
    }

    setupMagneticButtons() {
        if (
            this.isTouchDevice ||
            this.isLowPowerDevice
        ) {
            return;
        }

        document
            .querySelectorAll(
                ".magnetic-button"
            )
            .forEach(button => {
                const content =
                    button.querySelectorAll(
                        "span, i"
                    );

                const buttonX =
                    gsap.quickTo(
                        button,
                        "x",
                        {
                            duration: 0.28,
                            ease:
                                "power3.out",
                        }
                    );

                const buttonY =
                    gsap.quickTo(
                        button,
                        "y",
                        {
                            duration: 0.28,
                            ease:
                                "power3.out",
                        }
                    );

                const contentX =
                    gsap.quickTo(
                        content,
                        "x",
                        {
                            duration: 0.28,
                            ease:
                                "power3.out",
                        }
                    );

                const contentY =
                    gsap.quickTo(
                        content,
                        "y",
                        {
                            duration: 0.28,
                            ease:
                                "power3.out",
                        }
                    );

                button.addEventListener(
                    "pointermove",
                    event => {
                        const bounds =
                            button
                                .getBoundingClientRect();

                        const x =
                            event.clientX -
                            bounds.left -
                            bounds.width / 2;

                        const y =
                            event.clientY -
                            bounds.top -
                            bounds.height / 2;

                        buttonX(x * 0.16);
                        buttonY(y * 0.18);
                        contentX(x * 0.055);
                        contentY(y * 0.07);
                    }
                );

                button.addEventListener(
                    "pointerleave",
                    () => {
                        buttonX(0);
                        buttonY(0);
                        contentX(0);
                        contentY(0);
                    }
                );
            });
    }

    setupAmbientAnimations() {
        gsap.to(".status-dot", {
            scale: 1.3,
            opacity: 0.66,
            duration: 1.1,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
        });

        gsap.to(
            ".scroll-indicator i",
            {
                y: 6,
                duration: 0.85,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
            }
        );

        if (!this.isLowPowerDevice) {
            gsap.to(
                ".hero-orb-one",
                {
                    x: 42,
                    y: 28,
                    scale: 1.12,
                    duration: 7,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                }
            );

            gsap.to(
                ".hero-orb-two",
                {
                    x: -50,
                    y: -24,
                    scale: 0.9,
                    duration: 9,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                }
            );

            gsap.to(
                ".hero-orb-three",
                {
                    x: 30,
                    y: -38,
                    rotation: 55,
                    duration: 6,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                }
            );

            gsap.to(
                ".hero-grid",
                {
                    x: 34,
                    y: 34,
                    duration: 12,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                }
            );
        }

        gsap.to(
            ".hero-background",
            {
                yPercent: 9,
                scale: 1.04,
                ease: "none",
                scrollTrigger: {
                    trigger:
                        ".site-header",
                    start: "top top",
                    end: "bottom top",
                    scrub: 0.6,
                },
            }
        );

        gsap.to(
            ".header-content",
            {
                y: 72,
                opacity: 0.2,
                ease: "none",
                scrollTrigger: {
                    trigger:
                        ".site-header",
                    start: "32% top",
                    end: "bottom top",
                    scrub: 0.55,
                },
            }
        );
    }

    setupSectionHeaders() {
        document
            .querySelectorAll(
                ".section-header"
            )
            .forEach(header => {
                const eyebrow =
                    header.querySelector(
                        ".section-eyebrow"
                    );

                const title =
                    header.querySelector(
                        ".section-title"
                    );

                const description =
                    header.querySelector(
                        ".section-description"
                    );

                if (!title) return;

                gsap.set(title, {
                    "--line-scale": 0,
                });

                gsap.timeline({
                    scrollTrigger: {
                        trigger: header,
                        start: "top 84%",
                        once: true,
                    },
                })
                    .from(eyebrow, {
                        y: 16,
                        opacity: 0,
                        duration: 0.42,
                        ease:
                            "power3.out",
                    })
                    .from(
                        title,
                        {
                            y: 34,
                            opacity: 0,
                            duration: 0.68,
                            ease:
                                "expo.out",
                        },
                        "-=0.22"
                    )
                    .to(
                        title,
                        {
                            "--line-scale": 1,
                            duration: 0.55,
                            ease:
                                "power3.out",
                        },
                        "-=0.38"
                    )
                    .from(
                        description,
                        {
                            y: 18,
                            opacity: 0,
                            duration: 0.48,
                            ease:
                                "power3.out",
                        },
                        "-=0.4"
                    );
            });
    }

    setupAboutAnimations() {
        const layout =
            document.querySelector(
                ".about-layout"
            );

        if (!layout) return;

        const timeline =
            gsap.timeline({
                scrollTrigger: {
                    trigger: layout,
                    start: "top 79%",
                    once: true,
                },
            });

        timeline
            .from(
                ".profile-frame",
                {
                    x: -48,
                    opacity: 0,
                    rotationY: -8,
                    duration: 0.86,
                    ease: "expo.out",
                }
            )
            .from(
                ".profile-mini-card",
                {
                    y: 20,
                    opacity: 0,
                    duration: 0.55,
                    ease: "power3.out",
                },
                "-=0.48"
            )
            .from(
                ".about-lead",
                {
                    x: 42,
                    opacity: 0,
                    duration: 0.72,
                    ease: "expo.out",
                },
                "-=0.65"
            )
            .from(
                ".about-text",
                {
                    x: 24,
                    opacity: 0,
                    duration: 0.5,
                    stagger: 0.09,
                    ease: "power3.out",
                },
                "-=0.45"
            )
            .from(
                ".about-values span",
                {
                    y: 12,
                    opacity: 0,
                    scale: 0.94,
                    duration: 0.38,
                    stagger: 0.05,
                    ease:
                        "back.out(1.5)",
                },
                "-=0.35"
            );

        const desktopContext =
            gsap.matchMedia();

        desktopContext.add(
            "(min-width: 981px)",
            () => {
                gsap.to(
                    ".profile-frame",
                    {
                        y: -24,
                        ease: "none",
                        scrollTrigger: {
                            trigger:
                                ".about-me",
                            start:
                                "top bottom",
                            end:
                                "bottom top",
                            scrub: 0.8,
                        },
                    }
                );

                if (
                    !this.isTouchDevice &&
                    !this.isLowPowerDevice
                ) {
                    return this.attachTilt(
                        document.querySelector(
                            ".profile-frame"
                        ),
                        4,
                        5
                    );
                }

                return undefined;
            }
        );
    }

    setupSkillsAnimations() {
        ScrollTrigger.batch(
            ".skill-group",
            {
                start: "top 84%",
                once: true,
                interval: 0.12,
                batchMax: 3,
                onEnter: groups => {
                    gsap.fromTo(
                        groups,
                        {
                            y: 48,
                            opacity: 0,
                            scale: 0.97,
                        },
                        {
                            y: 0,
                            opacity: 1,
                            scale: 1,
                            duration: 0.7,
                            stagger: 0.08,
                            ease:
                                "expo.out",
                            overwrite: true,
                        }
                    );

                    groups.forEach(
                        group => {
                            gsap.fromTo(
                                group.querySelectorAll(
                                    ".skill-item"
                                ),
                                {
                                    y: 10,
                                    opacity: 0,
                                    scale: 0.94,
                                },
                                {
                                    y: 0,
                                    opacity: 1,
                                    scale: 1,
                                    duration: 0.32,
                                    stagger: 0.025,
                                    ease:
                                        "back.out(1.4)",
                                    delay: 0.18,
                                    overwrite: true,
                                }
                            );
                        }
                    );
                },
            }
        );

        if (
            this.isTouchDevice ||
            this.isLowPowerDevice
        ) {
            return;
        }

        const desktopContext =
            gsap.matchMedia();

        desktopContext.add(
            "(min-width: 981px)",
            () => {
                const cleanups = [];

                document
                    .querySelectorAll(
                        ".skill-group"
                    )
                    .forEach(group => {
                        cleanups.push(
                            this.attachTilt(
                                group,
                                2.4,
                                3
                            )
                        );
                    });

                return () =>
                    cleanups.forEach(
                        cleanup =>
                            cleanup?.()
                    );
            }
        );
    }

    attachTilt(
        element,
        rotateXAmount,
        rotateYAmount
    ) {
        if (!element) return undefined;

        const rotateX =
            gsap.quickTo(
                element,
                "rotationX",
                {
                    duration: 0.32,
                    ease: "power3.out",
                }
            );

        const rotateY =
            gsap.quickTo(
                element,
                "rotationY",
                {
                    duration: 0.32,
                    ease: "power3.out",
                }
            );

        gsap.set(element, {
            transformPerspective: 900,
            transformOrigin: "center",
        });

        const handleMove = event => {
            const bounds =
                element.getBoundingClientRect();

            const normalizedX =
                (
                    event.clientX -
                    bounds.left
                ) /
                bounds.width -
                0.5;

            const normalizedY =
                (
                    event.clientY -
                    bounds.top
                ) /
                bounds.height -
                0.5;

            rotateY(
                normalizedX *
                rotateYAmount
            );

            rotateX(
                normalizedY *
                -rotateXAmount
            );
        };

        const handleLeave = () => {
            rotateX(0);
            rotateY(0);
        };

        element.addEventListener(
            "pointermove",
            handleMove
        );

        element.addEventListener(
            "pointerleave",
            handleLeave
        );

        return () => {
            element.removeEventListener(
                "pointermove",
                handleMove
            );

            element.removeEventListener(
                "pointerleave",
                handleLeave
            );

            gsap.set(element, {
                clearProps:
                    "rotationX," +
                    "rotationY," +
                    "transformPerspective",
            });
        };
    }

    setupExperienceAnimations() {
        gsap.to(
            ".timeline-progress",
            {
                scaleY: 1,
                ease: "none",
                scrollTrigger: {
                    trigger:
                        ".experience-layout",
                    start: "top 74%",
                    end: "bottom 56%",
                    scrub: 0.45,
                },
            }
        );

        gsap.timeline({
            scrollTrigger: {
                trigger:
                    ".experience-card",
                start: "top 82%",
                once: true,
            },
        })
            .from(
                ".experience-marker",
                {
                    scale: 0,
                    opacity: 0,
                    duration: 0.5,
                    ease:
                        "back.out(1.8)",
                }
            )
            .from(
                ".experience-card",
                {
                    x: 48,
                    opacity: 0,
                    duration: 0.75,
                    ease: "expo.out",
                },
                "-=0.34"
            )
            .from(
                ".experience-highlights li",
                {
                    x: 18,
                    opacity: 0,
                    duration: 0.4,
                    stagger: 0.07,
                    ease:
                        "power3.out",
                },
                "-=0.35"
            );
    }

    setupProjectResponsiveAnimations() {
        this.projectMatchMedia =
            gsap.matchMedia();

        this.projectMatchMedia.add(
            this.projectDesktopQuery,
            () =>
                this.setupDesktopProjects()
        );

        this.projectMatchMedia.add(
            "(max-width: 980px), " +
            "(max-height: 650px)",
            () =>
                this.setupMobileProjects()
        );
    }

    setupDesktopProjects() {
        const cards =
            gsap.utils.toArray(
                ".project-card"
            );

        const images =
            gsap.utils.toArray(
                ".project-img"
            );

        if (
            !cards.length ||
            !images.length
        ) {
            return undefined;
        }

        this.currentProjectIndex = 0;

        cards.forEach(
            (card, index) => {
                card.classList.toggle(
                    "is-active",
                    index === 0
                );
            }
        );

        gsap.set(images, {
            autoAlpha: 0,
            scale: 1.025,
            zIndex: 0,
        });

        gsap.set(images[0], {
            autoAlpha: 1,
            scale: 1,
            zIndex: 2,
        });

        const triggers = [];

        ScrollTrigger.batch(
            cards,
            {
                start: "top 84%",
                once: true,
                interval: 0.1,
                batchMax: 3,
                onEnter: batch => {
                    gsap.fromTo(
                        batch,
                        {
                            x: -38,
                            opacity: 0,
                        },
                        {
                            x: 0,
                            opacity: 1,
                            duration: 0.62,
                            stagger: 0.07,
                            ease:
                                "expo.out",
                            overwrite: true,
                        }
                    );
                },
            }
        );

        cards.forEach(
            (card, index) => {
                triggers.push(
                    ScrollTrigger.create({
                        trigger: card,
                        start: "top 57%",
                        end: "bottom 43%",
                        onToggle: self => {
                            if (
                                self.isActive
                            ) {
                                this.activateProject(
                                    index
                                );
                            }
                        },
                    })
                );
            }
        );

        gsap.fromTo(
            ".project-visual",
            {
                x: 52,
                opacity: 0,
                scale: 0.975,
            },
            {
                x: 0,
                opacity: 1,
                scale: 1,
                duration: 0.82,
                ease: "expo.out",
                scrollTrigger: {
                    trigger:
                        ".projects-container",
                    start: "top 80%",
                    once: true,
                },
            }
        );

        return () => {
            triggers.forEach(
                trigger =>
                    trigger.kill()
            );

            gsap.killTweensOf(
                images
            );

            gsap.set(images, {
                clearProps:
                    "opacity," +
                    "visibility," +
                    "transform," +
                    "zIndex",
            });

            gsap.set(cards, {
                clearProps:
                    "opacity,transform",
            });

            cards.forEach(
                card =>
                    card.classList.remove(
                        "is-active"
                    )
            );

            images.forEach(
                image =>
                    image.classList.remove(
                        "active"
                    )
            );

            images[0]?.classList.add(
                "active"
            );

            this.currentProjectIndex =
                -1;
        };
    }

    setupMobileProjects() {
        const cards =
            gsap.utils.toArray(
                ".project-card"
            );

        cards.forEach(
            card =>
                card.classList.remove(
                    "is-active"
                )
        );

        ScrollTrigger.batch(
            cards,
            {
                start: "top 86%",
                once: true,
                interval: 0.12,
                batchMax: 2,
                onEnter: batch => {
                    gsap.fromTo(
                        batch,
                        {
                            y: 44,
                            opacity: 0,
                        },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 0.62,
                            stagger: 0.08,
                            ease:
                                "expo.out",
                            overwrite: true,
                        }
                    );

                    batch.forEach(
                        card => {
                            const image =
                                card.querySelector(
                                    ".project-mobile-image img"
                                );

                            if (!image) return;

                            gsap.fromTo(
                                image,
                                {
                                    scale: 1.05,
                                },
                                {
                                    scale: 1,
                                    duration: 0.75,
                                    ease:
                                        "power3.out",
                                    overwrite: true,
                                }
                            );
                        }
                    );
                },
            }
        );

        return () => {
            gsap.set(cards, {
                clearProps:
                    "opacity,transform",
            });

            gsap.set(
                ".project-mobile-image img",
                {
                    clearProps:
                        "transform",
                }
            );
        };
    }

    activateProject(index) {
        if (
            index ===
            this.currentProjectIndex
        ) {
            return;
        }

        const cards =
            document.querySelectorAll(
                ".project-card"
            );

        const images =
            document.querySelectorAll(
                ".project-img"
            );

        const counter =
            document.querySelector(
                ".project-current-index"
            );

        const previousImage =
            images[
                this.currentProjectIndex
            ];

        const nextImage =
            images[index];

        if (!nextImage) return;

        cards.forEach(
            (card, cardIndex) => {
                card.classList.toggle(
                    "is-active",
                    cardIndex === index
                );
            }
        );

        gsap.killTweensOf(images);
        gsap.killTweensOf(counter);

        gsap.set(nextImage, {
            zIndex: 2,
        });

        if (previousImage) {
            gsap.set(
                previousImage,
                {
                    zIndex: 1,
                }
            );

            gsap.to(
                previousImage,
                {
                    autoAlpha: 0,
                    scale: 0.99,
                    duration: 0.26,
                    ease: "power2.out",
                    overwrite: true,
                }
            );
        }

        gsap.fromTo(
            nextImage,
            {
                autoAlpha: 0,
                scale: 1.025,
            },
            {
                autoAlpha: 1,
                scale: 1,
                duration: 0.42,
                ease: "power3.out",
                overwrite: true,
            }
        );

        if (counter) {
            gsap.to(counter, {
                y: -7,
                opacity: 0,
                duration: 0.12,
                overwrite: true,
                onComplete: () => {
                    counter.textContent =
                        `${String(
                            index + 1
                        ).padStart(
                            2,
                            "0"
                        )} / ` +
                        `${String(
                            images.length
                        ).padStart(
                            2,
                            "0"
                        )}`;

                    gsap.fromTo(
                        counter,
                        {
                            y: 7,
                            opacity: 0,
                        },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 0.22,
                            ease:
                                "power3.out",
                        }
                    );
                },
            });
        }

        this.currentProjectIndex =
            index;
    }

    setupContactAnimations() {
        gsap.timeline({
            scrollTrigger: {
                trigger:
                    ".contact-content",
                start: "top 82%",
                once: true,
            },
        })
            .from(
                ".contact-content",
                {
                    y: 50,
                    opacity: 0,
                    scale: 0.975,
                    duration: 0.82,
                    ease: "expo.out",
                }
            )
            .from(
                ".contact-content " +
                ".section-eyebrow, " +
                ".contact-content " +
                ".section-title, " +
                ".contact-content > p",
                {
                    y: 18,
                    opacity: 0,
                    duration: 0.44,
                    stagger: 0.06,
                    ease:
                        "power3.out",
                },
                "-=0.52"
            )
            .from(
                ".contact-actions a",
                {
                    y: 14,
                    opacity: 0,
                    scale: 0.96,
                    duration: 0.4,
                    stagger: 0.06,
                    ease:
                        "back.out(1.4)",
                },
                "-=0.28"
            )
            .from(
                ".contact-links a",
                {
                    y: 12,
                    opacity: 0,
                    duration: 0.34,
                    stagger: 0.05,
                    ease:
                        "power3.out",
                },
                "-=0.22"
            );

        if (!this.isLowPowerDevice) {
            gsap.to(
                ".contact-orb",
                {
                    scale: 1.18,
                    rotation: 35,
                    duration: 7,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                }
            );
        }
    }

    setupAssetRefresh() {
        if (document.fonts?.ready) {
            document.fonts.ready.then(
                () =>
                    this.queueScrollRefresh()
            );
        }

        document
            .querySelectorAll("img")
            .forEach(image => {
                if (image.complete) return;

                image.addEventListener(
                    "load",
                    () =>
                        this.queueScrollRefresh(),
                    {
                        once: true,
                    }
                );
            });
    }

    setupResizeHandling() {
        let previousWidth =
            window.innerWidth;

        let previousHeight =
            window.innerHeight;

        const handleResize = () => {
            const widthDifference =
                Math.abs(
                    window.innerWidth -
                    previousWidth
                );

            const heightDifference =
                Math.abs(
                    window.innerHeight -
                    previousHeight
                );

            previousWidth =
                window.innerWidth;

            previousHeight =
                window.innerHeight;

            if (
                widthDifference > 30 ||
                heightDifference > 120
            ) {
                this.queueScrollRefresh(
                    180
                );
            }
        };

        window.addEventListener(
            "resize",
            handleResize,
            {
                passive: true,
            }
        );

        window.addEventListener(
            "orientationchange",
            () => {
                this.closeMenu(true);

                this.queueScrollRefresh(
                    260
                );
            }
        );
    }

    queueScrollRefresh(
        delay = 90
    ) {
        if (!this.gsapReady) return;

        window.clearTimeout(
            this.refreshTimer
        );

        this.refreshTimer =
            window.setTimeout(
                () => {
                    ScrollTrigger.refresh();
                },
                delay
            );
    }

    showStaticState() {
        gsap.set(
            [
                ".title-letter",
                "[data-hero-item]",
                ".scroll-indicator",
                ".nav-logo",
                ".nav-links li",
                ".nav-toggle",
                ".section-header",
                ".profile-frame",
                ".profile-mini-card",
                ".about-content",
                ".skill-group",
                ".experience-card",
                ".experience-marker",
                ".project-card",
                ".project-visual",
                ".contact-content",
            ],
            {
                clearProps: "all",
            }
        );

        gsap.set(
            ".timeline-progress",
            {
                scaleY: 1,
            }
        );

        gsap.set(
            ".section-title",
            {
                "--line-scale": 1,
            }
        );

        gsap.set(
            ".project-img",
            {
                autoAlpha: 0,
            }
        );

        gsap.set(
            ".project-img:first-child",
            {
                autoAlpha: 1,
            }
        );

        this.animateCounters();
    }
}

new Index();