(function () {
    const KEY = "lx-theme";
    const html = document.documentElement;

    function getPreferred() {
        return localStorage.getItem(KEY) || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    }

    function apply(theme) {
        html.classList.remove("light", "dark");
        html.classList.add(theme);
        localStorage.setItem(KEY, theme);
        const isDark = theme === "dark";
        document.querySelectorAll(".theme-toggle-icon").forEach(el => {
            el.textContent = isDark ? "light_mode" : "dark_mode";
        });
        document.querySelectorAll(".theme-toggle-text").forEach(el => {
            el.textContent = isDark ? "Light Mode" : "Dark Mode";
        });
    }

    function toggle() {
        apply(html.classList.contains("dark") ? "light" : "dark");
    }

    apply(getPreferred());
    window.__toggleTheme = toggle;
})();
