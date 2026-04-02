(function registerChristmasTheme() {
    const registry = window.siteOccasionThemeRegistry = window.siteOccasionThemeRegistry || {};

    registry.christmas = {
        value: "christmas",
        label: "Christmas",
        defaultTitle: "Christmas Blessings",
        defaultAnimationType: "snowflakes",
        description: "A smooth festive overlay with soft snow, glowing lights, and an occasional Santa flyover keeps Christmas magical without becoming too busy.",
        effects: [
            "Falling snowflakes",
            "Santa and reindeer flyover",
            "Soft festive lights",
            "Smooth magical atmosphere"
        ],
        buildLayers() {
            return [
                {
                    kind: "snowfall",
                    palette: ["rgba(255, 255, 255, 0.96)", "rgba(234, 245, 255, 0.82)", "rgba(255, 250, 243, 0.74)"],
                    count: { light: 10, medium: 16, heavy: 22 },
                    size: [0.36, 0.9],
                    duration: [10, 18],
                    drift: [-6, 6],
                    opacity: [0.42, 0.9]
                },
                {
                    kind: "festive-lights",
                    palette: ["#f94144", "#f9c74f", "#90be6d", "#577590", "#f5f0ff"],
                    bulbCount: { light: 8, medium: 12, heavy: 16 }
                },
                {
                    kind: "santa-flyover",
                    top: "2.75rem",
                    duration: [20, 28]
                }
            ];
        }
    };
})();
