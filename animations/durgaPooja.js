(function registerDurgaPoojaTheme() {
    const registry = window.siteOccasionThemeRegistry = window.siteOccasionThemeRegistry || {};

    registry["durga-pooja-navratri"] = {
        value: "durga-pooja-navratri",
        label: "Durga Pooja / Navratri",
        defaultTitle: "Durga Pooja & Navratri Blessings",
        defaultAnimationType: "sparkles",
        description: "Red and gold spiritual radiance with a soft pulsing aura and a restrained phool mala keeps the celebration powerful yet clean.",
        effects: [
            "Red and gold glowing particles",
            "Soft aura pulse",
            "Top floral garland",
            "Strong spiritual tone"
        ],
        buildLayers() {
            return [
                {
                    kind: "aura",
                    palette: ["rgba(171, 37, 58, 0.18)", "rgba(255, 201, 94, 0.14)", "rgba(255, 236, 200, 0.08)"],
                    duration: [9, 15]
                },
                {
                    kind: "sparkle-field",
                    palette: ["rgba(255, 214, 102, 0.94)", "rgba(196, 37, 75, 0.92)", "rgba(255, 241, 211, 0.82)"],
                    count: { light: 14, medium: 20, heavy: 28 },
                    size: [0.22, 0.64],
                    top: [8, 82],
                    left: [4, 96],
                    duration: [2.4, 4.8],
                    opacity: [0.22, 0.92]
                },
                {
                    kind: "garland",
                    palette: ["#ae1f4e", "#d73b45", "#f1b02d", "#ffe3a3"],
                    flowerCount: { light: 10, medium: 14, heavy: 18 }
                }
            ];
        }
    };
})();
