(function initializeOccasionAnimationsLibrary() {
    const animationTypes = [
        { value: "flower-petals", label: "Falling Flower Petals" },
        { value: "glowing-diyas", label: "Glowing Diyas" },
        { value: "sparkles", label: "Sparkles" },
        { value: "floating-lights", label: "Floating Lights" },
        { value: "confetti", label: "Confetti" },
        { value: "snowflakes", label: "Snowflakes" }
    ];

    const intensityLevels = [
        { value: "light", label: "Light" },
        { value: "medium", label: "Medium" },
        { value: "heavy", label: "Heavy" }
    ];

    const targetPages = [
        { value: "all", label: "All Pages" },
        { value: "home", label: "Home" },
        { value: "about", label: "About" },
        { value: "events", label: "Events" },
        { value: "gallery", label: "Gallery" },
        { value: "members", label: "Members" },
        { value: "contact", label: "Contact" }
    ];

    const typeSet = new Set(animationTypes.map((item) => item.value));
    const intensitySet = new Set(intensityLevels.map((item) => item.value));
    const targetPageSet = new Set(targetPages.map((item) => item.value));

    const intensityProfiles = {
        light: {
            fallingCount: 10,
            sparkleCount: 14,
            floatingCount: 8,
            diyaCount: 4
        },
        medium: {
            fallingCount: 18,
            sparkleCount: 22,
            floatingCount: 12,
            diyaCount: 6
        },
        heavy: {
            fallingCount: 28,
            sparkleCount: 34,
            floatingCount: 18,
            diyaCount: 8
        }
    };

    const randomBetween = (min, max) => min + Math.random() * (max - min);
    const pickRandom = (items) => items[Math.floor(Math.random() * items.length)];

    const formatLabelFromSlug = (value) =>
        String(value || "")
            .split("-")
            .filter(Boolean)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

    const getPageLabel = (value) =>
        targetPages.find((item) => item.value === value)?.label || formatLabelFromSlug(value);

    const getAnimationLabel = (value) =>
        animationTypes.find((item) => item.value === value)?.label || formatLabelFromSlug(value);

    const getIntensityLabel = (value) =>
        intensityLevels.find((item) => item.value === value)?.label || formatLabelFromSlug(value);

    const normalizeTargetPages = (value) => {
        const normalizedPages = (Array.isArray(value) ? value : [value])
            .flatMap((item) => String(item || "").split(","))
            .map((item) =>
                String(item || "")
                    .trim()
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-+|-+$/g, "")
            )
            .filter((item) => targetPageSet.has(item));

        if (normalizedPages.includes("all")) {
            return ["all"];
        }

        return Array.from(new Set(normalizedPages));
    };

    const resolvePageId = (pathname = window.location.pathname) => {
        const path = String(pathname || "").toLowerCase();

        if (path === "/" || path.endsWith("/index.html")) {
            if (path.startsWith("/about/")) {
                return "about";
            }

            if (path.startsWith("/events/")) {
                return "events";
            }

            if (path.startsWith("/gallery/")) {
                return "gallery";
            }

            if (path.startsWith("/members/")) {
                return "members";
            }

            if (path.startsWith("/contact/")) {
                return "contact";
            }

            if (path.startsWith("/admin/")) {
                return "admin";
            }

            return "home";
        }

        if (path.includes("/about") || path.endsWith("about.html")) {
            return "about";
        }

        if (path.includes("/events") || path.endsWith("event.html") || path.endsWith("events.html")) {
            return "events";
        }

        if (path.includes("/gallery") || path.endsWith("gallery.html")) {
            return "gallery";
        }

        if (path.includes("/members") || path.endsWith("members.html")) {
            return "members";
        }

        if (path.includes("/contact") || path.endsWith("contact.html")) {
            return "contact";
        }

        if (path.includes("/admin")) {
            return "admin";
        }

        return "home";
    };

    const getCurrentDateInMauritius = () =>
        new Intl.DateTimeFormat("en-CA", {
            timeZone: "Indian/Mauritius",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).format(new Date());

    const validateOccasionAnimation = (value) => {
        const title = String(value?.title || "").trim();
        const animationType = String(value?.animation_type || "").trim();
        const startDate = String(value?.start_date || "").trim();
        const endDate = String(value?.end_date || "").trim();
        const targetPagesValue = normalizeTargetPages(value?.target_pages || []);
        const intensity = String(value?.intensity || "").trim();

        if (!title) {
            return "Please enter an occasion name.";
        }

        if (!typeSet.has(animationType)) {
            return "Please choose a valid animation type.";
        }

        if (!startDate || !endDate) {
            return "Please choose a valid start and end date.";
        }

        if (endDate < startDate) {
            return "The end date must be on or after the start date.";
        }

        if (targetPagesValue.length === 0) {
            return "Please choose at least one target page.";
        }

        if (!intensitySet.has(intensity)) {
            return "Please choose a valid intensity level.";
        }

        return "";
    };

    const createHost = (container, config, options = {}) => {
        const host = document.createElement("div");
        host.className = `occasion-animation-layer occasion-animation-layer--${config.animation_type} occasion-animation-layer--${config.intensity}${options.preview ? " is-preview" : ""}`;
        host.setAttribute("aria-hidden", "true");
        container.appendChild(host);
        return host;
    };

    const createParticle = (host, className, styleMap = {}) => {
        const particle = document.createElement("span");
        particle.className = className;

        Object.entries(styleMap).forEach(([key, value]) => {
            particle.style.setProperty(key, value);
        });

        host.appendChild(particle);
        return particle;
    };

    const renderFallingParticles = (host, config, options) => {
        const paletteByType = {
            "flower-petals": ["#ffb997", "#ff8fab", "#ffcf99", "#ffc971"],
            confetti: ["#f9c74f", "#f9844a", "#90be6d", "#577590", "#f94144"],
            snowflakes: ["#ffffff", "#e8f3ff", "#f4fbff"]
        };

        const profile = intensityProfiles[config.intensity] || intensityProfiles.medium;
        const count = profile.fallingCount;
        const palette = paletteByType[config.animation_type] || paletteByType["flower-petals"];

        for (let index = 0; index < count; index += 1) {
            const size = config.animation_type === "confetti"
                ? `${randomBetween(0.45, 0.85)}rem`
                : config.animation_type === "snowflakes"
                    ? `${randomBetween(0.4, 0.9)}rem`
                    : `${randomBetween(0.55, 1.1)}rem`;

            createParticle(host, `occasion-particle occasion-particle--fall occasion-particle--${config.animation_type}`, {
                "--size": size,
                "--left": `${randomBetween(0, 100)}%`,
                "--delay": `${randomBetween(-12, 0)}s`,
                "--duration": `${randomBetween(8, 16)}s`,
                "--drift": `${randomBetween(-8, 8)}rem`,
                "--spin": `${randomBetween(120, 540)}deg`,
                "--opacity": String(randomBetween(0.45, 0.95)),
                "--hue": pickRandom(palette)
            });
        }
    };

    const renderSparkles = (host, config) => {
        const count = (intensityProfiles[config.intensity] || intensityProfiles.medium).sparkleCount;

        for (let index = 0; index < count; index += 1) {
            createParticle(host, "occasion-particle occasion-particle--sparkle", {
                "--size": `${randomBetween(0.22, 0.55)}rem`,
                "--left": `${randomBetween(4, 96)}%`,
                "--top": `${randomBetween(6, 86)}%`,
                "--delay": `${randomBetween(-4, 0)}s`,
                "--duration": `${randomBetween(1.8, 4.5)}s`,
                "--opacity": String(randomBetween(0.45, 0.95))
            });
        }
    };

    const renderFloatingLights = (host, config) => {
        const count = (intensityProfiles[config.intensity] || intensityProfiles.medium).floatingCount;

        for (let index = 0; index < count; index += 1) {
            createParticle(host, "occasion-particle occasion-particle--floating-light", {
                "--size": `${randomBetween(0.8, 1.9)}rem`,
                "--left": `${randomBetween(0, 100)}%`,
                "--delay": `${randomBetween(-10, 0)}s`,
                "--duration": `${randomBetween(10, 18)}s`,
                "--drift": `${randomBetween(-5, 5)}rem`,
                "--opacity": String(randomBetween(0.18, 0.45))
            });
        }
    };

    const renderGlowingDiyas = (host, config) => {
        const count = (intensityProfiles[config.intensity] || intensityProfiles.medium).diyaCount;
        const strip = document.createElement("div");
        strip.className = "occasion-diya-strip";
        host.appendChild(strip);

        for (let index = 0; index < count; index += 1) {
            const diya = document.createElement("span");
            diya.className = "occasion-diya";
            diya.style.setProperty("--delay", `${randomBetween(-2, 0)}s`);
            diya.style.setProperty("--duration", `${randomBetween(2.2, 3.4)}s`);
            diya.style.setProperty("--offset", `${randomBetween(-0.3, 0.3)}rem`);
            strip.appendChild(diya);
        }
    };

    const renderers = {
        "flower-petals": renderFallingParticles,
        confetti: renderFallingParticles,
        snowflakes: renderFallingParticles,
        sparkles: renderSparkles,
        "floating-lights": renderFloatingLights,
        "glowing-diyas": renderGlowingDiyas
    };

    const mount = (container, value, options = {}) => {
        if (!container) {
            return null;
        }

        const config = {
            title: String(value?.title || "").trim(),
            animation_type: String(value?.animation_type || ""),
            start_date: String(value?.start_date || ""),
            end_date: String(value?.end_date || ""),
            target_pages: normalizeTargetPages(value?.target_pages || []),
            intensity: String(value?.intensity || "medium"),
            is_enabled: Boolean(value?.is_enabled ?? true)
        };

        const validationError = validateOccasionAnimation(config);

        if (validationError) {
            return {
                destroy() {}
            };
        }

        const renderer = renderers[config.animation_type];

        if (!renderer) {
            return {
                destroy() {}
            };
        }

        const host = createHost(container, config, options);
        renderer(host, config, options);

        return {
            destroy() {
                host.remove();
            }
        };
    };

    const matchesTargetPage = (value, pageId) => {
        const selectedPages = normalizeTargetPages(value?.target_pages || []);

        if (selectedPages.includes("all")) {
            return true;
        }

        return selectedPages.includes(pageId);
    };

    window.siteOccasionAnimations = {
        animationTypes,
        intensityLevels,
        targetPages,
        getPageLabel,
        getAnimationLabel,
        getIntensityLabel,
        getCurrentDateInMauritius,
        normalizeTargetPages,
        resolvePageId,
        validateOccasionAnimation,
        matchesTargetPage,
        mount
    };
})();
