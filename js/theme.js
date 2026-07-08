(function () {
    var html = document.documentElement;
    function saveTheme(t) {
        try { localStorage.setItem("lx-theme", t); } catch (e) {}
    }

    function updateUI() {
        var isWinter = html.classList.contains("winter");
        document.querySelectorAll(".theme-toggle-text").forEach(function (el) {
            el.textContent = isWinter ? "❄️ Winter" : "🌿 Green";
        });
        document.querySelectorAll(".theme-toggle-icon-material").forEach(function (el) {
            el.textContent = isWinter ? "eco" : "ac_unit";
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", updateUI);
    } else {
        updateUI();
    }

    window.__toggleTheme = function () {
        html.classList.toggle("winter");
        saveTheme(html.classList.contains("winter") ? "winter" : "green");
        updateUI();
    };
})();
