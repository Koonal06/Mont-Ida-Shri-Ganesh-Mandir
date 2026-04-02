(function registerHanumanJayantiTheme() {
    const registry = window.siteOccasionThemeRegistry = window.siteOccasionThemeRegistry || {};

    registry["hanuman-jayanti"] = {
        value: "hanuman-jayanti",
        label: "Hanuman Jayanti",
        defaultTitle: "Hanuman Jayanti Utsav",
        defaultAnimationType: "floating-lights",
        description: "A respectful Hanuman Jayanti overlay with saffron glow, a soft energy pulse, and a waving bhagwa flag carrying a subtle Hanuman silhouette.",
        effects: [
            "Saffron glowing particles",
            "Bhagwa flag with Hanuman silhouette",
            "Soft energy pulse",
            "Bold but respectful motion"
        ],
        buildLayers() {
            return [
                {
                    kind: "aura",
                    palette: ["rgba(255, 145, 43, 0.17)", "rgba(255, 199, 120, 0.13)", "rgba(255, 241, 224, 0.08)"],
                    duration: [8, 13]
                },
                {
                    kind: "floating-particles",
                    palette: ["rgba(255, 154, 54, 0.42)", "rgba(255, 189, 92, 0.32)", "rgba(255, 233, 193, 0.22)"],
                    count: { light: 7, medium: 10, heavy: 14 },
                    size: [0.55, 1.35],
                    duration: [14, 22],
                    drift: [-4.5, 4.5],
                    opacity: [0.1, 0.34]
                },
                {
                    kind: "flag",
                    palette: ["#ee7d23", "#ef9839"],
                    poleColor: "rgba(116, 66, 35, 0.55)",
                    top: "0.3rem",
                    right: "0.8rem",
                    width: "clamp(4.9rem, 10vw, 7.7rem)",
                    height: "clamp(3.6rem, 8vw, 5.6rem)",
                    anchorBelowNavbar: true,
                    poleTopExtend: "1rem",
                    poleBottomExtend: "0.1rem",
                    emblemAsset: "assets/images/hanuman-flag-emblem.svg",
                    emblemOpacity: 0.76,
                    emblemInset: "0.02rem 0.02rem 0.08rem 0.08rem",
                    emblemScale: 1.12,
                    emblemFilter: "brightness(1.34) contrast(1.28) saturate(1.08) drop-shadow(0 0 0.18rem rgba(255, 247, 222, 0.88)) drop-shadow(0 0 0.42rem rgba(255, 236, 188, 0.56))",
                    emblemBlendMode: "normal"
                }
            ];
        }
    };
})();
