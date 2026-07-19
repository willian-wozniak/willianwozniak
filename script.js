class Portfolio {
    constructor() {
        this.reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        this.desktopQuery = window.matchMedia("(min-width: 980px)");
        this.isReducedMotion = this.reducedMotionQuery.matches;
        this.menuOpen = false;
        this.scrollFrame = null;
        this.timelineFrame = null;
        this.lastActiveSection = "";

        this.init();
    }

    init() {
        this.setCurrentYear();
        this.setupNavigation();
        this.setupScrollUi();
        this.setupScrollSpy();
        this.setupTimelineProgress();
        this.setupHeroAnimation();
    }

    setCurrentYear() {
        const year = document.getElementById("current-year");

        if (year) {
            year.textContent = String(new Date().getFullYear());
        }
    }

    setupNavigation() {
        const toggle = document.querySelector(".nav-toggle");
        const navLinks = document.querySelector(".nav-links");

        toggle?.addEventListener("click", () => {
            this.toggleMenu();
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && this.menuOpen) {
                this.closeMenu();
                toggle?.focus();
            }
        });

        document.addEventListener("pointerdown", event => {
            if (!this.menuOpen || !toggle || !navLinks) {
                return;
            }

            if (!toggle.contains(event.target) && !navLinks.contains(event.target)) {
                this.closeMenu();
            }
        });

        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener("click", event => {
                const selector = link.getAttribute("href");

                if (!selector || selector === "#") {
                    return;
                }

                const target = document.querySelector(selector);

                if (!target) {
                    return;
                }

                event.preventDefault();
                this.closeMenu();
                this.scrollToTarget(target);
            });
        });

        window.addEventListener("resize", () => {
            if (this.desktopQuery.matches && this.menuOpen) {
                this.closeMenu();
            }
        }, { passive: true });
    }

    toggleMenu() {
        if (this.menuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        const toggle = document.querySelector(".nav-toggle");
        const navLinks = document.querySelector(".nav-links");

        if (!toggle || !navLinks) {
            return;
        }

        this.menuOpen = true;
        document.body.classList.add("menu-open");
        navLinks.classList.add("active");
        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "Fechar menu");
    }

    closeMenu() {
        const toggle = document.querySelector(".nav-toggle");
        const navLinks = document.querySelector(".nav-links");

        this.menuOpen = false;
        document.body.classList.remove("menu-open");
        navLinks?.classList.remove("active");
        toggle?.setAttribute("aria-expanded", "false");
        toggle?.setAttribute("aria-label", "Abrir menu");
    }

    scrollToTarget(target) {
        const navbar = document.querySelector(".navbar");
        const navbarHeight = navbar?.getBoundingClientRect().height || 64;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 12;

        window.scrollTo({
            top: targetTop,
            behavior: this.isReducedMotion ? "auto" : "smooth",
        });
    }

    setupScrollUi() {
        const navbar = document.querySelector(".navbar");
        const progress = document.getElementById("scroll-progress");

        const update = () => {
            this.scrollFrame = null;

            const scrollTop = window.scrollY;
            const availableHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progressValue = availableHeight > 0 ? Math.min(Math.max(scrollTop / availableHeight, 0), 1) : 0;

            navbar?.classList.toggle("is-scrolled", scrollTop > 18);

            if (progress) {
                progress.style.transform = `scaleX(${progressValue})`;
            }
        };

        const requestUpdate = () => {
            if (this.scrollFrame) {
                return;
            }

            this.scrollFrame = requestAnimationFrame(update);
        };

        window.addEventListener("scroll", requestUpdate, { passive: true });
        window.addEventListener("resize", requestUpdate, { passive: true });
        update();
    }

    setupScrollSpy() {
        const sections = document.querySelectorAll("main section[id]");

        if (!sections.length) {
            return;
        }

        const observer = new IntersectionObserver(entries => {
            const visibleEntry = entries
                .filter(entry => entry.isIntersecting)
                .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

            if (!visibleEntry || visibleEntry.target.id === this.lastActiveSection) {
                return;
            }

            this.lastActiveSection = visibleEntry.target.id;
            this.setActiveLink(visibleEntry.target.id);
        }, {
            rootMargin: "-38% 0px -48% 0px",
            threshold: [0.05, 0.2, 0.45],
        });

        sections.forEach(section => observer.observe(section));
    }

    setActiveLink(id) {
        document.querySelectorAll(".nav-links a").forEach(link => {
            const isActive = link.getAttribute("href") === `#${id}`;
            link.classList.toggle("active", isActive);

            if (isActive) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    setupTimelineProgress() {
        const layout = document.querySelector(".experience-layout");

        if (!layout) {
            return;
        }

        const update = () => {
            this.timelineFrame = null;

            const bounds = layout.getBoundingClientRect();
            const viewportReference = window.innerHeight * 0.72;
            const totalDistance = Math.max(bounds.height + window.innerHeight * 0.18, 1);
            const travelledDistance = viewportReference - bounds.top;
            const value = Math.min(Math.max(travelledDistance / totalDistance, 0), 1);

            layout.style.setProperty("--timeline-progress", String(value));
        };

        const requestUpdate = () => {
            if (this.timelineFrame) {
                return;
            }

            this.timelineFrame = requestAnimationFrame(update);
        };

        window.addEventListener("scroll", requestUpdate, { passive: true });
        window.addEventListener("resize", requestUpdate, { passive: true });
        update();
    }

    setupHeroAnimation() {
        const html = document.documentElement;
        const elements = document.querySelectorAll(".hero-animate");
        const motionEnabled = html.classList.contains("motion-enabled");
        const hasGsap = typeof gsap !== "undefined";

        if (!motionEnabled || !hasGsap || this.isReducedMotion || !elements.length) {
            html.classList.remove("motion-enabled");
            elements.forEach(element => {
                element.style.removeProperty("opacity");
                element.style.removeProperty("transform");
            });
            return;
        }

        gsap.to(elements, {
            opacity: 1,
            y: 0,
            duration: 0.72,
            stagger: 0.075,
            ease: "expo.out",
            clearProps: "opacity,transform",
            onComplete: () => {
                html.classList.remove("motion-enabled");
            },
        });
    }
}

new Portfolio();
