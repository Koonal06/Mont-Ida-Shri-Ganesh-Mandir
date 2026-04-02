(function initializeOccasionAnimationRenderers() {
    const randomBetween = (min, max) => min + Math.random() * (max - min);
    const pickRandom = (items) => items[Math.floor(Math.random() * items.length)];
    const isMobileViewport = () => Boolean(window.matchMedia?.("(max-width: 820px)").matches);

    const resolveIntensitySetting = (value, intensity) => {
        if (Array.isArray(value)) {
            return value;
        }

        if (value && typeof value === "object") {
            return value[intensity] ?? value.medium ?? Object.values(value)[0];
        }

        return value;
    };

    const getCountWithDeviceFactor = (value, intensity) => {
        const rawCount = Number(resolveIntensitySetting(value, intensity) || 0);
        const deviceFactor = isMobileViewport() ? 0.68 : 1;
        return Math.max(1, Math.round(rawCount * deviceFactor));
    };

    const isNestedPagePath = (pathname = window.location.pathname) =>
        /\/[^/]+\/(?:$|index\.html$|login\.html$)/i.test(String(pathname || ""));

    const getSiteAssetUrl = (relativePath) => {
        const normalizedPath = String(relativePath || "").trim().replace(/^\/+/, "");

        if (!normalizedPath) {
            return "";
        }

        if (/^(https?:)?\/\//i.test(normalizedPath)) {
            return normalizedPath;
        }

        const prefix = isNestedPagePath(window.location.pathname) ? "../" : "";
        return new URL(`${prefix}${normalizedPath}`, window.location.href).toString();
    };

    const createHost = (container, config, options = {}) => {
        const host = document.createElement("div");
        const themeClass = String(config.festival_name || "custom").replace(/[^a-z0-9-]+/g, "-");
        host.className = `occasion-animation-layer occasion-animation-layer--${themeClass} occasion-animation-layer--${config.intensity}${options.preview ? " is-preview" : ""}`;
        host.setAttribute("aria-hidden", "true");
        container.appendChild(host);
        return host;
    };

    const createEffectWrapper = (host, className) => {
        const layer = document.createElement("div");
        layer.className = className;
        host.appendChild(layer);
        return layer;
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

    const renderFallingField = (host, effect, config, variantClass) => {
        const layer = createEffectWrapper(host, `occasion-effect occasion-effect--${variantClass}`);
        const count = getCountWithDeviceFactor(effect.count, config.intensity);
        const sizeRange = Array.isArray(effect.size) ? effect.size : [0.45, 1];
        const durationRange = Array.isArray(effect.duration) ? effect.duration : [10, 18];
        const driftRange = Array.isArray(effect.drift) ? effect.drift : [-6, 6];
        const opacityRange = Array.isArray(effect.opacity) ? effect.opacity : [0.24, 0.78];
        const palette = Array.isArray(effect.palette) && effect.palette.length > 0
            ? effect.palette
            : ["rgba(255, 218, 150, 0.72)"];

        for (let index = 0; index < count; index += 1) {
            createParticle(layer, `occasion-particle occasion-particle--fall occasion-particle--${variantClass}`, {
                "--size": `${randomBetween(sizeRange[0], sizeRange[1])}rem`,
                "--left": `${randomBetween(0, 100)}%`,
                "--delay": `${randomBetween(-12, 0)}s`,
                "--duration": `${randomBetween(durationRange[0], durationRange[1])}s`,
                "--drift": `${randomBetween(driftRange[0], driftRange[1])}rem`,
                "--spin": `${randomBetween(120, 540)}deg`,
                "--opacity": String(randomBetween(opacityRange[0], opacityRange[1])),
                "--color": pickRandom(palette)
            });
        }
    };

    const renderFloatingParticles = (host, effect, config) => {
        const layer = createEffectWrapper(host, "occasion-effect occasion-effect--floating-particles");
        const count = getCountWithDeviceFactor(effect.count, config.intensity);
        const sizeRange = Array.isArray(effect.size) ? effect.size : [0.5, 1.35];
        const durationRange = Array.isArray(effect.duration) ? effect.duration : [12, 22];
        const driftRange = Array.isArray(effect.drift) ? effect.drift : [-5, 5];
        const opacityRange = Array.isArray(effect.opacity) ? effect.opacity : [0.14, 0.42];
        const palette = Array.isArray(effect.palette) && effect.palette.length > 0
            ? effect.palette
            : ["rgba(255, 223, 158, 0.32)"];

        for (let index = 0; index < count; index += 1) {
            createParticle(layer, "occasion-particle occasion-particle--floating-light", {
                "--size": `${randomBetween(sizeRange[0], sizeRange[1])}rem`,
                "--left": `${randomBetween(0, 100)}%`,
                "--delay": `${randomBetween(-10, 0)}s`,
                "--duration": `${randomBetween(durationRange[0], durationRange[1])}s`,
                "--drift": `${randomBetween(driftRange[0], driftRange[1])}rem`,
                "--opacity": String(randomBetween(opacityRange[0], opacityRange[1])),
                "--color": pickRandom(palette)
            });
        }
    };

    const renderSparkleField = (host, effect, config) => {
        const layer = createEffectWrapper(host, "occasion-effect occasion-effect--sparkle-field");
        const count = getCountWithDeviceFactor(effect.count, config.intensity);
        const sizeRange = Array.isArray(effect.size) ? effect.size : [0.2, 0.6];
        const durationRange = Array.isArray(effect.duration) ? effect.duration : [2, 5];
        const opacityRange = Array.isArray(effect.opacity) ? effect.opacity : [0.24, 0.92];
        const topRange = Array.isArray(effect.top) ? effect.top : [8, 88];
        const leftRange = Array.isArray(effect.left) ? effect.left : [4, 96];
        const palette = Array.isArray(effect.palette) && effect.palette.length > 0
            ? effect.palette
            : ["rgba(255, 236, 181, 0.88)"];

        for (let index = 0; index < count; index += 1) {
            createParticle(layer, "occasion-particle occasion-particle--sparkle", {
                "--size": `${randomBetween(sizeRange[0], sizeRange[1])}rem`,
                "--left": `${randomBetween(leftRange[0], leftRange[1])}%`,
                "--top": `${randomBetween(topRange[0], topRange[1])}%`,
                "--delay": `${randomBetween(-4, 0)}s`,
                "--duration": `${randomBetween(durationRange[0], durationRange[1])}s`,
                "--opacity": String(randomBetween(opacityRange[0], opacityRange[1])),
                "--color": pickRandom(palette)
            });
        }
    };

    const renderHeaderGlow = (host, effect, config) => {
        const layer = createEffectWrapper(host, "occasion-effect occasion-effect--header-glow");
        const count = getCountWithDeviceFactor(effect.count, config.intensity);
        const sizeRange = Array.isArray(effect.size) ? effect.size : [8, 16];
        const topRange = Array.isArray(effect.top) ? effect.top : [-6, 20];
        const leftRange = Array.isArray(effect.left) ? effect.left : [6, 94];
        const durationRange = Array.isArray(effect.duration) ? effect.duration : [6, 12];
        const opacityRange = Array.isArray(effect.opacity) ? effect.opacity : [0.16, 0.42];
        const palette = Array.isArray(effect.palette) && effect.palette.length > 0
            ? effect.palette
            : ["rgba(255, 214, 120, 0.34)"];

        for (let index = 0; index < count; index += 1) {
            const orb = document.createElement("span");
            orb.className = "occasion-glow-orb";
            orb.style.setProperty("--size", `${randomBetween(sizeRange[0], sizeRange[1])}rem`);
            orb.style.setProperty("--top", `${randomBetween(topRange[0], topRange[1])}%`);
            orb.style.setProperty("--left", `${randomBetween(leftRange[0], leftRange[1])}%`);
            orb.style.setProperty("--duration", `${randomBetween(durationRange[0], durationRange[1])}s`);
            orb.style.setProperty("--opacity", String(randomBetween(opacityRange[0], opacityRange[1])));
            orb.style.setProperty("--glow-color", pickRandom(palette));
            layer.appendChild(orb);
        }
    };

    const renderAura = (host, effect) => {
        const layer = createEffectWrapper(host, "occasion-effect occasion-effect--aura");
        const palette = Array.isArray(effect.palette) && effect.palette.length > 0
            ? effect.palette
            : ["rgba(255, 214, 120, 0.16)", "rgba(255, 244, 215, 0.1)"];
        const durationRange = Array.isArray(effect.duration) ? effect.duration : [7, 12];

        [
            { top: "8%", left: "6%", size: "26rem" },
            { top: "32%", left: "58%", size: "22rem" },
            { top: "56%", left: "18%", size: "20rem" }
        ].forEach((preset, index) => {
            const aura = document.createElement("span");
            aura.className = "occasion-aura-band";
            aura.style.setProperty("--top", preset.top);
            aura.style.setProperty("--left", preset.left);
            aura.style.setProperty("--size", preset.size);
            aura.style.setProperty("--duration", `${randomBetween(durationRange[0], durationRange[1])}s`);
            aura.style.setProperty("--delay", `${-index * 2.2}s`);
            aura.style.setProperty("--aura-color", palette[index % palette.length]);
            layer.appendChild(aura);
        });
    };

    const renderDiyas = (host, effect, config, placement = "corners") => {
        const layer = createEffectWrapper(host, `occasion-effect occasion-effect--diyas occasion-effect--diyas-${placement}`);
        const palette = effect.palette || {};
        const count = Math.max(placement === "strip" ? 3 : 2, getCountWithDeviceFactor(effect.count || { light: 2, medium: 4, heavy: 6 }, config.intensity));

        const applyPalette = (diya) => {
            diya.style.setProperty("--delay", `${randomBetween(-2, 0)}s`);
            diya.style.setProperty("--duration", `${randomBetween(2.2, 3.4)}s`);
            diya.style.setProperty("--offset", `${randomBetween(-0.24, 0.24)}rem`);
            diya.style.setProperty("--flame-core", palette.flameCore || "#fff1c0");
            diya.style.setProperty("--flame-mid", palette.flameMid || "#ffc55a");
            diya.style.setProperty("--flame-edge", palette.flameEdge || "#ff8b39");
            diya.style.setProperty("--base-top", palette.baseTop || "#b65a2b");
            diya.style.setProperty("--base-bottom", palette.baseBottom || "#7c3217");
            diya.style.setProperty("--halo", palette.halo || "rgba(255, 201, 110, 0.24)");
        };

        if (placement === "corners") {
            ["left", "right"].forEach((side) => {
                const cluster = document.createElement("div");
                cluster.className = `occasion-diya-cluster occasion-diya-cluster--${side}`;
                layer.appendChild(cluster);

                for (let index = 0; index < Math.ceil(count / 2); index += 1) {
                    const diya = document.createElement("span");
                    diya.className = "occasion-diya";
                    applyPalette(diya);
                    cluster.appendChild(diya);
                }
            });
            return;
        }

        const strip = document.createElement("div");
        strip.className = "occasion-diya-strip";
        layer.appendChild(strip);

        for (let index = 0; index < count; index += 1) {
            const diya = document.createElement("span");
            diya.className = "occasion-diya";
            applyPalette(diya);
            strip.appendChild(diya);
        }
    };

    const renderWatermark = (host, effect) => {
        const layer = createEffectWrapper(host, "occasion-effect occasion-effect--watermark");
        const watermark = document.createElement("img");
        watermark.className = "occasion-watermark";
        watermark.src = getSiteAssetUrl(effect.asset || "assets/images/ganesha-logo.svg");
        watermark.alt = "";
        watermark.loading = "lazy";
        watermark.decoding = "async";
        watermark.style.setProperty("--opacity", String(effect.opacity ?? 0.05));
        watermark.style.setProperty("--width", effect.width || "clamp(8rem, 18vw, 13rem)");
        watermark.style.setProperty("--top", effect.top || "4.5rem");
        watermark.style.setProperty("--right", effect.right || "1rem");
        watermark.style.setProperty("--left", effect.left || "auto");
        watermark.style.setProperty("--bottom", effect.bottom || "auto");
        watermark.style.setProperty("--watermark-filter", effect.filter || "grayscale(0.08) sepia(0.1)");
        watermark.style.setProperty("--watermark-blend", effect.blendMode || "multiply");
        layer.appendChild(watermark);
    };

    const getFlagEmblemMarkup = (value) => {
        if (value === "hanuman") {
            return "<svg viewBox=\"0 0 120 120\" role=\"presentation\" focusable=\"false\" aria-hidden=\"true\"><g fill=\"currentColor\"><circle cx=\"58\" cy=\"25\" r=\"9\"></circle><path d=\"M48 38c-10 5-17 15-19 27l8 2c2-8 7-15 13-18l6 15-9 27h12l6-16 6 16h12l-10-28 6-15c7 4 11 10 13 18l8-2c-2-12-9-22-19-27l-6 13h-11l-6-12z\"></path><path d=\"M84 38c15 4 24 14 24 29 0 10-4 17-12 21\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"8\" stroke-linecap=\"round\"></path><circle cx=\"96\" cy=\"95\" r=\"7\"></circle><rect x=\"90\" y=\"72\" width=\"8\" height=\"20\" rx=\"3\"></rect><path d=\"M25 70l-10 28h8l-4 12h12l9-27z\"></path></g></svg>";
        }

        return "";
    };

    const renderGarland = (host, effect, config) => {
        const layer = createEffectWrapper(host, "occasion-effect occasion-effect--garland");
        const garland = document.createElement("div");
        garland.className = "occasion-garland";
        layer.appendChild(garland);
        garland.innerHTML = "<span class=\"occasion-garland-rope\"></span>";
        const palette = Array.isArray(effect.palette) && effect.palette.length > 0 ? effect.palette : ["#ab2c4f", "#f0b23d", "#ffe7ad"];
        const flowerCount = getCountWithDeviceFactor(effect.flowerCount || { light: 10, medium: 14, heavy: 18 }, config.intensity);

        for (let index = 0; index < flowerCount; index += 1) {
            const flower = document.createElement("span");
            flower.className = "occasion-garland-flower";
            flower.style.setProperty("--left", `${(index / Math.max(1, flowerCount - 1)) * 100}%`);
            flower.style.setProperty("--drop", `${randomBetween(0.8, 2.1)}rem`);
            flower.style.setProperty("--delay", `${randomBetween(-3, 0)}s`);
            flower.style.setProperty("--flower-color", palette[index % palette.length]);
            garland.appendChild(flower);
        }
    };

    const renderFlag = (host, effect, config, options = {}) => {
        const layer = createEffectWrapper(host, "occasion-effect occasion-effect--flag");
        const flag = document.createElement("div");
        flag.className = "occasion-flag";
        flag.style.setProperty("--top", effect.top || "4rem");
        flag.style.setProperty("--left", effect.left || "auto");
        flag.style.setProperty("--right", effect.right || "1rem");
        flag.style.setProperty("--width", effect.width || "clamp(4.8rem, 10vw, 7.6rem)");
        flag.style.setProperty("--height", effect.height || "clamp(3.4rem, 7vw, 5rem)");
        flag.style.setProperty("--navbar-clearance", "0px");
        flag.style.setProperty("--pole-top-extend", effect.poleTopExtend || "0rem");
        flag.style.setProperty("--pole-bottom-extend", effect.poleBottomExtend || "0rem");
        flag.innerHTML = "<span class=\"occasion-flag-pole\"></span><span class=\"occasion-flag-fabric\"></span>";
        flag.querySelector(".occasion-flag-pole")?.style.setProperty("--pole-color", effect.poleColor || "rgba(100, 70, 42, 0.55)");
        const fabric = flag.querySelector(".occasion-flag-fabric");
        if (fabric) {
            fabric.style.background = effect.stripes
                ? `linear-gradient(180deg, ${effect.palette[0]} 0 25%, ${effect.palette[1]} 25% 50%, ${effect.palette[2]} 50% 75%, ${effect.palette[3]} 75% 100%)`
                : `linear-gradient(135deg, ${effect.palette[0]}, ${effect.palette[1] || effect.palette[0]})`;

            if (effect.emblem || effect.emblemAsset) {
                const emblem = document.createElement("span");
                emblem.className = "occasion-flag-emblem";
                emblem.style.setProperty("--emblem-color", effect.emblemColor || "rgba(112, 40, 10, 0.42)");
                emblem.style.setProperty("--emblem-opacity", String(effect.emblemOpacity ?? 0.38));
                emblem.style.setProperty("--emblem-inset", effect.emblemInset || "0.35rem 0.55rem 0.45rem 0.8rem");
                emblem.style.setProperty("--emblem-scale", String(effect.emblemScale ?? 1));

                if (effect.emblemAsset) {
                    const emblemImage = document.createElement("img");
                    emblemImage.className = "occasion-flag-emblem-image";
                    emblemImage.src = getSiteAssetUrl(effect.emblemAsset);
                    emblemImage.alt = "";
                    emblemImage.decoding = "async";
                    emblemImage.style.setProperty("--emblem-filter", effect.emblemFilter || "none");
                    emblemImage.style.setProperty("--emblem-blend", effect.emblemBlendMode || "multiply");
                    emblem.appendChild(emblemImage);
                } else {
                    emblem.innerHTML = getFlagEmblemMarkup(effect.emblem);
                }

                fabric.appendChild(emblem);
            }
        }
        layer.appendChild(flag);

        if (!effect.anchorBelowNavbar || options.preview) {
            return undefined;
        }

        const navbar = document.querySelector(".navbar");

        if (!navbar) {
            return undefined;
        }

        const updateNavbarClearance = () => {
            flag.style.setProperty("--navbar-clearance", `${navbar.getBoundingClientRect().height}px`);
        };

        updateNavbarClearance();
        window.addEventListener("resize", updateNavbarClearance);

        let observer = null;
        if (typeof ResizeObserver !== "undefined") {
            observer = new ResizeObserver(updateNavbarClearance);
            observer.observe(navbar);
        }

        return () => {
            observer?.disconnect();
            window.removeEventListener("resize", updateNavbarClearance);
        };
    };

    const renderRibbons = (host, effect, config) => {
        const layer = createEffectWrapper(host, "occasion-effect occasion-effect--ribbons");
        const count = getCountWithDeviceFactor(effect.count || { light: 2, medium: 3, heavy: 4 }, config.intensity);
        const palette = Array.isArray(effect.palette) && effect.palette.length > 0 ? effect.palette : ["#f18825"];
        const widthRange = Array.isArray(effect.width) ? effect.width : [1.2, 2];
        const durationRange = Array.isArray(effect.duration) ? effect.duration : [10, 16];

        for (let index = 0; index < count; index += 1) {
            const ribbon = document.createElement("span");
            ribbon.className = "occasion-ribbon";
            ribbon.style.setProperty("--color", palette[index % palette.length]);
            ribbon.style.setProperty("--width", `${randomBetween(widthRange[0], widthRange[1])}rem`);
            ribbon.style.setProperty("--duration", `${randomBetween(durationRange[0], durationRange[1])}s`);
            ribbon.style.setProperty("--delay", `${randomBetween(-6, 0)}s`);
            ribbon.style.setProperty("--top", `${effect.area === "sides" ? randomBetween(14, 74) : randomBetween(-4, 24)}%`);
            ribbon.style.setProperty("--left", `${index % 2 === 0 ? randomBetween(-2, 14) : randomBetween(82, 98)}%`);
            ribbon.style.setProperty("--rotate", `${index % 2 === 0 ? randomBetween(-18, -6) : randomBetween(6, 18)}deg`);
            layer.appendChild(ribbon);
        }
    };

    const renderFestiveLights = (host, effect, config) => {
        const layer = createEffectWrapper(host, "occasion-effect occasion-effect--festive-lights");
        const lights = document.createElement("div");
        lights.className = "occasion-festive-lights";
        lights.innerHTML = "<span class=\"occasion-festive-wire\"></span>";
        layer.appendChild(lights);
        const bulbCount = getCountWithDeviceFactor(effect.bulbCount || { light: 10, medium: 14, heavy: 18 }, config.intensity);
        const palette = Array.isArray(effect.palette) && effect.palette.length > 0 ? effect.palette : ["#f94144", "#f9c74f", "#90be6d", "#577590"];

        for (let index = 0; index < bulbCount; index += 1) {
            const bulb = document.createElement("span");
            bulb.className = "occasion-light-bulb";
            bulb.style.setProperty("--left", `${(index / Math.max(1, bulbCount - 1)) * 100}%`);
            bulb.style.setProperty("--color", palette[index % palette.length]);
            bulb.style.setProperty("--delay", `${randomBetween(-4, 0)}s`);
            lights.appendChild(bulb);
        }
    };

    const renderSantaFlyover = (host, effect) => {
        const layer = createEffectWrapper(host, "occasion-effect occasion-effect--santa-flyover");
        const flight = document.createElement("div");
        flight.className = "occasion-sleigh-flight";
        flight.style.setProperty("--top", effect.top || "2.5rem");
        const durationRange = Array.isArray(effect.duration) ? effect.duration : [18, 24];
        flight.style.setProperty("--duration", `${randomBetween(durationRange[0], durationRange[1])}s`);
        flight.style.setProperty("--delay", `${randomBetween(-12, 0)}s`);
        flight.innerHTML = "<svg viewBox=\"0 0 240 80\" role=\"presentation\" focusable=\"false\" aria-hidden=\"true\"><g fill=\"none\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 52c4-8 8-12 14-12s11 4 16 12\" /><path d=\"M30 52h22\" /><path d=\"M56 44c4-8 8-12 14-12s11 4 16 12\" /><path d=\"M66 44h24\" /><path d=\"M98 40h36\" /><path d=\"M134 40c12 0 22 6 30 16\" /><path d=\"M154 56h34\" /><path d=\"M168 56c8 10 18 14 34 14\" /><path d=\"M160 56c7 18 21 20 37 20\" /><circle cx=\"182\" cy=\"34\" r=\"4\" fill=\"currentColor\" stroke=\"none\" /><path d=\"M154 30c5-7 11-10 18-10\" /><path d=\"M154 30l-9-6\" /></g></svg>";
        layer.appendChild(flight);
    };

    window.siteOccasionAnimationRenderers = {
        createHost,
        isMobileViewport,
        renderers: {
            "falling-petals": (host, effect, config) => renderFallingField(host, effect, config, "petals"),
            "confetti-fall": (host, effect, config) => renderFallingField(host, effect, config, "confetti"),
            snowfall: (host, effect, config) => renderFallingField(host, effect, config, "snowflakes"),
            "floating-particles": renderFloatingParticles,
            "sparkle-field": renderSparkleField,
            "header-glow": renderHeaderGlow,
            aura: renderAura,
            "corner-diyas": (host, effect, config) => renderDiyas(host, effect, config, "corners"),
            "diyas-strip": (host, effect, config) => renderDiyas(host, effect, config, "strip"),
            watermark: renderWatermark,
            garland: renderGarland,
            flag: renderFlag,
            ribbons: renderRibbons,
            "festive-lights": renderFestiveLights,
            "santa-flyover": renderSantaFlyover
        }
    };
})();
