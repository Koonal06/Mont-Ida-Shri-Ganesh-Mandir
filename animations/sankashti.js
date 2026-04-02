(function registerSankashtiTheme() {
    const registry = window.siteOccasionThemeRegistry = window.siteOccasionThemeRegistry || {};

    registry.sankashti = {
        value: "sankashti",
        label: "Sankashti",
        defaultTitle: "Sankashti Prarthana",
        defaultAnimationType: "flower-petals",
        description: "A calm Sankashti overlay with light marigold petals, warm golden glow, subtle diyas, and a faint Ganesha presence keeps the page devotional and uncluttered.",
        effects: [
            "Soft marigold petal fall",
            "Warm golden glow",
            "Soft corner diyas",
            "Gentle Ganesha watermark"
        ],
        buildLayers() {
            return [
                {
                    kind: "falling-petals",
                    palette: ["#f1a329", "#d34c33", "#ffd36d", "#f4b767"],
                    count: { light: 5, medium: 8, heavy: 12 },
                    size: [0.42, 0.82],
                    duration: [18, 28],
                    drift: [-3.2, 3.2],
                    opacity: [0.14, 0.42]
                },
                {
                    kind: "header-glow",
                    palette: ["rgba(255, 215, 133, 0.24)", "rgba(255, 192, 104, 0.18)", "rgba(255, 241, 214, 0.12)"],
                    count: { light: 2, medium: 2, heavy: 3 },
                    size: [6.5, 11.5],
                    top: [-5, 18],
                    left: [12, 88],
                    opacity: [0.08, 0.22],
                    duration: [10, 16]
                },
                {
                    kind: "corner-diyas",
                    count: { light: 2, medium: 2, heavy: 4 },
                    palette: {
                        flameCore: "#fff1c0",
                        flameMid: "#ffca6b",
                        flameEdge: "#f18c3c",
                        baseTop: "#9a5127",
                        baseBottom: "#6b2b17",
                        halo: "rgba(255, 211, 137, 0.18)"
                    }
                },
                {
                    kind: "watermark",
                    asset: "assets/images/ganesha-logo.svg",
                    opacity: 0.028,
                    width: "clamp(5.6rem, 12vw, 7.8rem)",
                    bottom: "1rem",
                    right: "0.9rem",
                    top: "auto",
                    filter: "grayscale(0.24) sepia(0.32) brightness(0.98)"
                }
            ];
        }
    };
})();
