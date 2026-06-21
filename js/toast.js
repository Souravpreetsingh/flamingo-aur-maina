function showToast(message, type = "success", duration = 4000) {
    const existing = document.querySelector(".lx-toast-container");
    if (!existing) {
        const container = document.createElement("div");
        container.className = "lx-toast-container";
        container.style.cssText = "position:fixed;top:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:12px;max-width:400px;width:100%;pointer-events:none";
        document.body.appendChild(container);
    }

    const container = document.querySelector(".lx-toast-container");

    const icons = {
        success: "check_circle",
        error: "error",
        info: "info",
        warning: "warning",
    };

    const colors = {
        success: "bg-green-50 border-green-300 text-green-800",
        error: "bg-red-50 border-red-300 text-red-800",
        info: "bg-blue-50 border-blue-300 text-blue-800",
        warning: "bg-yellow-50 border-yellow-300 text-yellow-800",
    };

    const iconBg = {
        success: "bg-green-100 text-green-600",
        error: "bg-red-100 text-red-600",
        info: "bg-blue-100 text-blue-600",
        warning: "bg-yellow-100 text-yellow-600",
    };

    const toast = document.createElement("div");
    toast.className = `lx-toast flex items-start gap-3 p-4 rounded-xl border shadow-lg ${colors[type] || colors.info}`;
    toast.style.cssText = "pointer-events:auto;animation:lxToastIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards;backdrop-filter:blur(8px)";
    toast.innerHTML = `
        <span class="material-symbols-outlined text-[22px] p-1.5 rounded-full shrink-0 ${iconBg[type] || iconBg.info}">${icons[type] || icons.info}</span>
        <p class="text-sm font-body-md flex-1 pt-0.5">${message}</p>
        <button class="lx-toast-close shrink-0 p-0.5 rounded-full hover:bg-black/5 transition-colors" style="background:none;border:none;cursor:pointer">
            <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
    `;

    toast.querySelector(".lx-toast-close").addEventListener("click", () => dismissToast(toast));
    container.appendChild(toast);

    if (duration > 0) {
        setTimeout(() => dismissToast(toast), duration);
    }

    return toast;
}

function dismissToast(toast) {
    if (toast.dataset.dismissing) return;
    toast.dataset.dismissing = "true";
    toast.style.animation = "lxToastOut 0.3s ease-in forwards";
    setTimeout(() => toast.remove(), 300);
}

const toastStyles = document.createElement("style");
toastStyles.textContent = `
    @keyframes lxToastIn {
        from { opacity: 0; transform: translateX(100%) scale(0.9); }
        to { opacity: 1; transform: translateX(0) scale(1); }
    }
    @keyframes lxToastOut {
        from { opacity: 1; transform: translateX(0) scale(1); }
        to { opacity: 0; transform: translateX(100%) scale(0.9); }
    }
`;
document.head.appendChild(toastStyles);
