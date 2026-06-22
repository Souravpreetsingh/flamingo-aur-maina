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
        document.querySelectorAll(".theme-toggle-icon").forEach(el => {
            el.textContent = theme === "dark" ? "light_mode" : "dark_mode";
        });
    }

    function toggle() {
        apply(html.classList.contains("dark") ? "light" : "dark");
    }

    apply(getPreferred());
    window.__toggleTheme = toggle;
})();
