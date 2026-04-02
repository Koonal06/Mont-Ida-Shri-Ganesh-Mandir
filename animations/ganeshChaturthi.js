(function registerGaneshChaturthiTheme() {
    const registry = window.siteOccasionThemeRegistry = window.siteOccasionThemeRegistry || {};

    registry["ganesh-chaturthi"] = {
        value: "ganesh-chaturthi",
        label: "Ganesh Chaturthi",
        defaultTitle: "Ganesh Chaturthi Blessings",
        defaultAnimationType: "flower-petals",
        description: "Soft marigold petals drift across the page while warm golden light, gentle diya flickers, and a faint Ganesha watermark keep the atmosphere calm and divine.",
        effects: [
            "Marigold petal fall",
            "Warm header glow",
            "Subtle diya flicker",
            "Low-opacity Ganesha watermark"
        ],
        buildLayers() {
            return [
                {
                    kind: "falling-petals",
                    palette: ["#f7b733", "#f0a024", "#ffd56f", "#f8c16d"],
                    count: { light: 8, medium: 12, heavy: 17 },
                    size: [0.46, 0.94],
                    duration: [15, 24],
                    drift: [-4.8, 4.8],
                    opacity: [0.18, 0.58]
                },
                {
                    kind: "header-glow",
                    palette: ["rgba(255, 211, 107, 0.28)", "rgba(255, 184, 92, 0.2)", "rgba(255, 238, 181, 0.16)"],
                    count: { light: 2, medium: 3, heavy: 4 },
                    size: [7, 13],
                    top: [-6, 18],
                    left: [10, 90],
                    opacity: [0.12, 0.3],
                    duration: [8, 14]
                },
                {
                    kind: "corner-diyas",
                    count: { light: 2, medium: 2, heavy: 4 },
                    palette: {
                        flameCore: "#fff0b2",
                        flameMid: "#ffc55a",
                        flameEdge: "#ff8b39",
                        baseTop: "#b55c28",
                        baseBottom: "#7a3116",
                        halo: "rgba(255, 205, 110, 0.2)"
                    }
                },
                {
                    kind: "watermark",
                    asset: "assets/images/ganesha-logo.svg",
                    opacity: 0.04,
                    width: "clamp(6.5rem, 14vw, 10rem)",
                    top: "5rem",
                    right: "1.3rem",
                    filter: "grayscale(0.18) sepia(0.36) brightness(1.02)"
                }
            ];
        }
    };
})();
