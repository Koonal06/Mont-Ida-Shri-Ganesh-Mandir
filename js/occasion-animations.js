(function initializeOccasionAnimationsLibrary() {
    const helpers = window.siteOccasionAnimationHelpers;
    const runtime = window.siteOccasionAnimationRenderers;

    if (!helpers || !runtime) {
        return;
    }

    const buildCustomPrimaryLayers = (animationType) => {
        switch (animationType) {
            case "flower-petals":
                return [{
                    kind: "falling-petals",
                    palette: ["#f8c25b", "#f4ab2f", "#ffd98a", "#f6c56c"],
                    count: { light: 10, medium: 16, heavy: 22 },
                    size: [0.48, 1.02],
                    duration: [11, 18],
                    drift: [-6, 6],
                    opacity: [0.22, 0.72]
                }];
            case "glowing-diyas":
                return [{
                    kind: "diyas-strip",
                    count: { light: 4, medium: 6, heavy: 8 }
                }];
            case "sparkles":
                return [{
                    kind: "sparkle-field",
                    palette: ["rgba(255, 240, 196, 0.94)", "rgba(255, 218, 112, 0.88)", "rgba(255, 253, 242, 0.84)"],
                    count: { light: 14, medium: 22, heavy: 30 },
                    size: [0.22, 0.62],
                    top: [8, 88],
                    left: [4, 96],
                    duration: [2.2, 4.8],
                    opacity: [0.24, 0.94]
                }];
            case "confetti":
                return [{
                    kind: "confetti-fall",
                    palette: ["#f9c74f", "#f9844a", "#90be6d", "#577590"],
                    count: { light: 10, medium: 16, heavy: 24 },
                    size: [0.4, 0.82],
                    duration: [10, 16],
                    drift: [-7, 7],
                    opacity: [0.3, 0.78]
                }];
            case "snowflakes":
                return [{
                    kind: "snowfall",
                    palette: ["rgba(255, 255, 255, 0.96)", "rgba(234, 245, 255, 0.84)", "rgba(255, 248, 236, 0.74)"],
                    count: { light: 12, medium: 20, heavy: 28 },
                    size: [0.34, 0.86],
                    duration: [10, 18],
                    drift: [-6, 6],
                    opacity: [0.42, 0.9]
                }];
            default:
                return [{
                    kind: "floating-particles",
                    palette: ["rgba(255, 223, 158, 0.38)", "rgba(255, 240, 196, 0.24)", "rgba(255, 186, 92, 0.22)"],
                    count: { light: 8, medium: 12, heavy: 18 },
                    size: [0.54, 1.3],
                    duration: [13, 22],
                    drift: [-5, 5],
                    opacity: [0.12, 0.36]
                }];
        }
    };

    const buildCustomThemeLayers = (config) => {
        const settings = helpers.normalizeThemeSettings(config.theme_settings);
        const layers = [...buildCustomPrimaryLayers(config.animation_type)];

        if (settings.show_header_glow) {
            layers.push({
                kind: "header-glow",
                palette: ["rgba(255, 214, 120, 0.28)", "rgba(255, 238, 189, 0.18)"],
                count: { light: 2, medium: 3, heavy: 4 },
                size: [8, 14],
                top: [-4, 18],
                left: [10, 90],
                opacity: [0.14, 0.34],
                duration: [6, 11]
            });
        }

        if (settings.show_corner_diyas && config.animation_type !== "glowing-diyas") {
            layers.push({ kind: "corner-diyas", count: { light: 2, medium: 4, heavy: 6 } });
        }

        if (settings.show_background_aura) {
            layers.push({
                kind: "aura",
                palette: ["rgba(255, 214, 120, 0.14)", "rgba(255, 244, 215, 0.08)"],
                duration: [7, 12]
            });
        }

        if (settings.show_top_garland) {
            layers.push({
                kind: "garland",
                palette: ["#c2424d", "#f0b23d", "#ffe7ad"],
                flowerCount: { light: 10, medium: 14, heavy: 18 }
            });
        }

        if (settings.show_watermark) {
            layers.push({
                kind: "watermark",
                asset: "assets/images/ganesha-logo.svg",
                opacity: 0.045,
                width: "clamp(7rem, 16vw, 11rem)",
                top: "4.8rem",
                right: "1rem"
            });
        }

        if (settings.show_ribbons) {
            layers.push({
                kind: "ribbons",
                palette: ["#f18825", "#ffb14d", "#f2a746"],
                count: { light: 2, medium: 3, heavy: 4 },
                width: [1.2, 2],
                duration: [10, 16],
                area: "top-sides"
            });
        }

        if (settings.show_festive_lights) {
            layers.push({
                kind: "festive-lights",
                palette: ["#f94144", "#f9c74f", "#90be6d", "#577590"],
                bulbCount: { light: 10, medium: 14, heavy: 18 }
            });
        }

        return layers;
    };

    const buildThemeLayers = (config) => {
        if (config.festival_name === "custom") {
            return buildCustomThemeLayers(config);
        }

        const theme = helpers.getFestivalTheme(config.festival_name);

        if (typeof theme.buildLayers === "function") {
            return theme.buildLayers(config);
        }

        return buildCustomPrimaryLayers(theme.defaultAnimationType);
    };

    const mount = (container, value, options = {}) => {
        if (!container) {
            return null;
        }

        const rawValue = value || {};
        const validationError = helpers.validateOccasionAnimation({
            ...rawValue,
            festival_name: rawValue?.festival_name || "custom",
            animation_type: rawValue?.animation_type || helpers.getFestivalDefaultAnimationType(rawValue?.festival_name || "custom")
        });

        if (validationError) {
            return { destroy() {} };
        }

        const config = helpers.normalizeOccasionAnimation(rawValue);

        if (!options.preview && config.disable_on_mobile && runtime.isMobileViewport()) {
            return { destroy() {} };
        }

        const layers = buildThemeLayers(config).filter(Boolean);

        if (layers.length === 0) {
            return { destroy() {} };
        }

        const host = runtime.createHost(container, config, options);

        const cleanupCallbacks = [];

        layers.forEach((layer) => {
            const renderer = runtime.renderers[layer.kind];

            if (renderer) {
                const cleanup = renderer(host, layer, config, options);

                if (typeof cleanup === "function") {
                    cleanupCallbacks.push(cleanup);
                }
            }
        });

        return {
            destroy() {
                cleanupCallbacks.forEach((cleanup) => {
                    try {
                        cleanup();
                    } catch (error) {
                        console.warn("Occasion animation cleanup failed.", error);
                    }
                });
                host.remove();
            }
        };
    };

    const matchesTargetPage = (value, pageId) => {
        const selectedPages = helpers.normalizeTargetPages(value?.target_pages || []);

        if (selectedPages.includes("all")) {
            return true;
        }

        return selectedPages.includes(pageId);
    };

    window.siteOccasionAnimations = {
        animationTypes: helpers.customAnimationTypes,
        customAnimationTypes: helpers.customAnimationTypes,
        festivalThemes: helpers.festivalThemes,
        intensityLevels: helpers.intensityLevels,
        targetPages: helpers.targetPages,
        customThemeSettingDefaults: helpers.customThemeSettingDefaults,
        getPageLabel: helpers.getPageLabel,
        getAnimationLabel: helpers.getAnimationLabel,
        getFestivalLabel: helpers.getFestivalLabel,
        getFestivalDescription: helpers.getFestivalDescription,
        getFestivalEffects: helpers.getFestivalEffects,
        getFestivalTheme: helpers.getFestivalTheme,
        getFestivalDefaultAnimationType: helpers.getFestivalDefaultAnimationType,
        getIntensityLabel: helpers.getIntensityLabel,
        getCurrentDateInMauritius: helpers.getCurrentDateInMauritius,
        normalizeTargetPages: helpers.normalizeTargetPages,
        normalizeThemeSettings: helpers.normalizeThemeSettings,
        normalizeOccasionAnimation: helpers.normalizeOccasionAnimation,
        resolvePageId: helpers.resolvePageId,
        validateOccasionAnimation: helpers.validateOccasionAnimation,
        matchesTargetPage,
        mount
    };
})();
