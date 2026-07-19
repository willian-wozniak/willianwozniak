class Portfolio {
    constructor() {
        this.reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        this.desktopQuery = window.matchMedia("(min-width: 980px)");
        this.isReducedMotion = this.reducedMotionQuery.matches;
        this.menuOpen = false;
        this.scrollFrame = null;
        this.timelineFrame = null;
        this.graphFrame = null;
        this.graphResizeObserver = null;
        this.lastActiveSection = "";

        this.init();
    }

    init() {
        this.setCurrentYear();
        this.setupNodePorts();
        this.setupNavigation();
        this.setupScrollUi();
        this.setupScrollSpy();
        this.setupTimelineProgress();
        this.setupPageGraph();
        this.setupHeroAnimation();
    }

    setCurrentYear() {
        const year = document.getElementById("current-year");

        if (year) {
            year.textContent = String(new Date().getFullYear());
        }
    }

    setupNodePorts() {
        const nodeElements = document.querySelectorAll(
            ".ai-card, .project-card, .skill-group, .experience-card, .profile-frame, .contact-content"
        );

        nodeElements.forEach(element => {
            if (element.querySelector(":scope > .node-port")) {
                return;
            }

            const port = document.createElement("span");
            port.className = "node-port";
            port.setAttribute("aria-hidden", "true");
            element.appendChild(port);
        });
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
            const progressValue = availableHeight > 0
                ? Math.min(Math.max(scrollTop / availableHeight, 0), 1)
                : 0;

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

        document.querySelectorAll("main section[id]").forEach(section => {
            section.classList.toggle("is-graph-active", section.id === id);
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

    setupPageGraph() {
        const main = document.querySelector(".site-main");
        const svg = document.getElementById("page-graph-svg");
        const basePath = svg?.querySelector("[data-graph-path-base]");
        const accentPath = svg?.querySelector("[data-graph-path-accent]");
        const dotsGroup = svg?.querySelector("[data-graph-dots]");
        const sectionNodes = Array.from(document.querySelectorAll("[data-graph-section] .section-graph-node"));

        if (!main || !svg || !basePath || !accentPath || !dotsGroup || !sectionNodes.length) {
            return;
        }

        const draw = () => {
            this.graphFrame = null;

            const mainBounds = main.getBoundingClientRect();
            const width = Math.max(main.clientWidth, 1);
            const height = Math.max(main.scrollHeight, 1);

            svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
            svg.setAttribute("width", String(width));
            svg.setAttribute("height", String(height));

            const points = [{
                x: width / 2,
                y: 0,
                terminal: true,
            }];

            sectionNodes.forEach(node => {
                const bounds = node.getBoundingClientRect();

                points.push({
                    x: bounds.left - mainBounds.left + bounds.width / 2,
                    y: bounds.top - mainBounds.top + bounds.height / 2,
                    terminal: false,
                });
            });

            points.push({
                x: width / 2,
                y: height,
                terminal: true,
            });

            const pathData = this.buildGraphPath(points);
            basePath.setAttribute("d", pathData);
            accentPath.setAttribute("d", pathData);
            this.renderGraphDots(dotsGroup, points);
        };

        const requestDraw = () => {
            if (this.graphFrame) {
                return;
            }

            this.graphFrame = requestAnimationFrame(draw);
        };

        window.addEventListener("resize", requestDraw, { passive: true });
        window.addEventListener("orientationchange", requestDraw, { passive: true });

        if (document.fonts?.ready) {
            document.fonts.ready.then(requestDraw);
        }

        document.querySelectorAll("img").forEach(image => {
            if (!image.complete) {
                image.addEventListener("load", requestDraw, { once: true });
            }
        });

        if (typeof ResizeObserver !== "undefined") {
            this.graphResizeObserver = new ResizeObserver(requestDraw);
            this.graphResizeObserver.observe(main);
            document.querySelectorAll("[data-graph-section]").forEach(section => {
                this.graphResizeObserver.observe(section);
            });
        }

        draw();
    }

    buildGraphPath(points) {
        if (!points.length) {
            return "";
        }

        let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

        for (let index = 1; index < points.length; index += 1) {
            const current = points[index - 1];
            const next = points[index];
            const middleY = current.y + (next.y - current.y) / 2;

            path += ` C ${current.x.toFixed(2)} ${middleY.toFixed(2)}, `;
            path += `${next.x.toFixed(2)} ${middleY.toFixed(2)}, `;
            path += `${next.x.toFixed(2)} ${next.y.toFixed(2)}`;
        }

        return path;
    }

    renderGraphDots(group, points) {
        const svgNamespace = "http://www.w3.org/2000/svg";
        const fragment = document.createDocumentFragment();

        group.replaceChildren();

        points.forEach(point => {
            const circle = document.createElementNS(svgNamespace, "circle");
            circle.setAttribute("cx", point.x.toFixed(2));
            circle.setAttribute("cy", point.y.toFixed(2));
            circle.setAttribute("r", point.terminal ? "3.5" : "2.25");
            circle.setAttribute(
                "class",
                point.terminal ? "graph-svg-dot graph-svg-dot-terminal" : "graph-svg-dot"
            );
            fragment.appendChild(circle);
        });

        group.appendChild(fragment);
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
            stagger: 0.065,
            ease: "expo.out",
            clearProps: "opacity,transform",
            onComplete: () => {
                html.classList.remove("motion-enabled");
            },
        });
    }
}

new Portfolio();
