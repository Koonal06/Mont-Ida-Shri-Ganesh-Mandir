(function registerMauritiusIndependenceTheme() {
    const registry = window.siteOccasionThemeRegistry = window.siteOccasionThemeRegistry || {};

    registry["mauritius-independence-day"] = {
        value: "mauritius-independence-day",
        label: "Mauritius Independence Day",
        defaultTitle: "Mauritius Independence Day Celebration",
        defaultAnimationType: "confetti",
        description: "National colors flow through clean ribbons, a subtle flag wave, and light celebratory confetti that feels festive without distracting from the page.",
        effects: [
            "National-color ribbons",
            "Subtle flag wave",
            "Light confetti",
            "Clean celebratory motion"
        ],
        buildLayers() {
            return [
                {
                    kind: "ribbons",
                    palette: ["#df2f33", "#243f94", "#f0c53a", "#2c9b57"],
                    count: { light: 3, medium: 4, heavy: 5 },
                    width: [1.2, 1.95],
                    duration: [10, 16],
                    area: "top-sides"
                },
                {
                    kind: "flag",
                    palette: ["#df2f33", "#243f94", "#f0c53a", "#2c9b57"],
                    stripes: true,
                    poleColor: "rgba(78, 78, 78, 0.5)",
                    top: "4.2rem",
                    right: "1rem",
                    width: "clamp(5.25rem, 11vw, 8rem)",
                    height: "clamp(4rem, 8vw, 5.8rem)"
                },
                {
                    kind: "confetti-fall",
                    palette: ["#df2f33", "#243f94", "#f0c53a", "#2c9b57"],
                    count: { light: 8, medium: 12, heavy: 16 },
                    size: [0.4, 0.78],
                    duration: [10, 16],
                    drift: [-7, 7],
                    opacity: [0.32, 0.78]
                }
            ];
        }
    };
})();
