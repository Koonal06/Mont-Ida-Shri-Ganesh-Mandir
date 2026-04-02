(function initializeOccasionAnimationHelpers() {
    const themeRegistry = window.siteOccasionThemeRegistry || {};
    const festivalThemeOrder = [
        "ganesh-chaturthi",
        "sankashti",
        "durga-pooja-navratri",
        "hanuman-jayanti",
        "maharashtra-day",
        "mauritius-independence-day",
        "christmas",
        "custom"
    ];
    const customAnimationTypes = [
        { value: "flower-petals", label: "Flower Petals" },
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
    const customThemeSettingDefaults = {
        show_header_glow: false,
        show_corner_diyas: false,
        show_background_aura: false,
        show_top_garland: false,
        show_watermark: false,
        show_ribbons: false,
        show_festive_lights: false
    };
    const targetPageSet = new Set(targetPages.map((item) => item.value));
    const festivalThemeSet = new Set(festivalThemeOrder);
    const customAnimationTypeSet = new Set(customAnimationTypes.map((item) => item.value));
    const intensitySet = new Set(intensityLevels.map((item) => item.value));

    const formatLabelFromSlug = (value) =>
        String(value || "")
            .split("-")
            .filter(Boolean)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

    const getPageLabel = (value) =>
        targetPages.find((item) => item.value === value)?.label || formatLabelFromSlug(value);

    const getAnimationLabel = (value) =>
        customAnimationTypes.find((item) => item.value === value)?.label || formatLabelFromSlug(value);

    const getIntensityLabel = (value) =>
        intensityLevels.find((item) => item.value === value)?.label || formatLabelFromSlug(value);

    const getRawFestivalTheme = (value) => {
        if (value === "custom") {
            return {
                value: "custom",
                label: "Custom Theme",
                defaultTitle: "Custom Temple Animation",
                defaultAnimationType: "floating-lights",
                description: "Build a lighter custom blend with one base motion and optional sacred accents.",
                effects: [
                    "Choose a base motion style",
                    "Add optional aura or glow",
                    "Add diyas, garland, or watermark",
                    "Keep the experience elegant"
                ],
                buildLayers: null
            };
        }

        const registeredTheme = themeRegistry[value] || {};

        return {
            value,
            label: registeredTheme.label || formatLabelFromSlug(value),
            defaultTitle: registeredTheme.defaultTitle || formatLabelFromSlug(value),
            defaultAnimationType: customAnimationTypeSet.has(registeredTheme.defaultAnimationType)
                ? registeredTheme.defaultAnimationType
                : "floating-lights",
            description: String(registeredTheme.description || "").trim(),
            effects: Array.isArray(registeredTheme.effects) ? registeredTheme.effects : [],
            buildLayers: typeof registeredTheme.buildLayers === "function"
                ? registeredTheme.buildLayers
                : null
        };
    };

    const festivalThemes = festivalThemeOrder.map((value) => {
        const theme = getRawFestivalTheme(value);

        return {
            value: theme.value,
            label: theme.label,
            description: theme.description
        };
    });

    const getFestivalTheme = (value) => getRawFestivalTheme(String(value || "").trim().toLowerCase());
    const getFestivalLabel = (value) => getFestivalTheme(value).label || formatLabelFromSlug(value);
    const getFestivalDescription = (value) => getFestivalTheme(value).description || "";
    const getFestivalEffects = (value) => getFestivalTheme(value).effects || [];
    const getFestivalDefaultAnimationType = (value) => getFestivalTheme(value).defaultAnimationType || "floating-lights";

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

    const normalizeThemeSettings = (value) => {
        const normalized = { ...customThemeSettingDefaults };
        const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};

        Object.keys(customThemeSettingDefaults).forEach((key) => {
            normalized[key] = Boolean(source[key]);
        });

        return normalized;
    };

    const normalizeOccasionAnimation = (value, options = {}) => {
        const rawFestivalName = String(value?.festival_name || "").trim().toLowerCase();
        const festivalName = festivalThemeSet.has(rawFestivalName)
            ? rawFestivalName
            : (options.fallbackFestivalName || "custom");
        const rawAnimationType = String(value?.animation_type || "").trim().toLowerCase();

        return {
            id: String(value?.id || "").trim(),
            title: String(value?.title || "").trim(),
            festival_name: festivalName,
            animation_type: customAnimationTypeSet.has(rawAnimationType)
                ? rawAnimationType
                : getFestivalDefaultAnimationType(festivalName),
            start_date: String(value?.start_date || "").trim(),
            end_date: String(value?.end_date || "").trim(),
            target_pages: normalizeTargetPages(value?.target_pages || ["all"]),
            intensity: intensitySet.has(String(value?.intensity || "").trim())
                ? String(value.intensity).trim()
                : "medium",
            is_enabled: Boolean(value?.is_enabled ?? true),
            disable_on_mobile: Boolean(value?.disable_on_mobile ?? false),
            theme_settings: normalizeThemeSettings(value?.theme_settings || {})
        };
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
        const festivalName = String(value?.festival_name || "").trim().toLowerCase();
        const animationType = String(value?.animation_type || "").trim().toLowerCase();
        const startDate = String(value?.start_date || "").trim();
        const endDate = String(value?.end_date || "").trim();
        const targetPagesValue = normalizeTargetPages(value?.target_pages || []);
        const intensity = String(value?.intensity || "").trim();

        if (!title) {
            return "Please enter an occasion name.";
        }

        if (!festivalThemeSet.has(festivalName)) {
            return "Please choose a festival theme.";
        }

        if (festivalName === "custom" && !customAnimationTypeSet.has(animationType)) {
            return "Please choose a valid custom motion style.";
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

    window.siteOccasionAnimationHelpers = {
        customAnimationTypes,
        intensityLevels,
        targetPages,
        festivalThemes,
        festivalThemeSet,
        customAnimationTypeSet,
        intensitySet,
        customThemeSettingDefaults,
        getPageLabel,
        getAnimationLabel,
        getFestivalLabel,
        getFestivalDescription,
        getFestivalEffects,
        getFestivalTheme,
        getFestivalDefaultAnimationType,
        getIntensityLabel,
        getCurrentDateInMauritius,
        normalizeTargetPages,
        normalizeThemeSettings,
        normalizeOccasionAnimation,
        resolvePageId,
        validateOccasionAnimation
    };
})();
