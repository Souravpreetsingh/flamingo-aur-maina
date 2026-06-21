const API_BASE = window.__API_URL__ || "http://localhost:8000";

let allRooms = [];
let activeFilters = { roomType: new Set(), priceMin: 0, priceMax: Infinity };

function formatINR(n) {
    const s = Math.round(n).toString();
    const last3 = s.slice(-3);
    const rest = s.slice(0, -3);
    return (rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," : "") + last3;
}

async function loadRooms() {
    try {
        const res = await fetch(`${API_BASE}/rooms`);
        if (!res.ok) throw new Error("Failed to fetch rooms");
        allRooms = await res.json();
        const prices = allRooms.map(r => r.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        document.getElementById("price-min").value = minPrice;
        document.getElementById("price-max").value = maxPrice;
        document.getElementById("price-min-label").textContent = "₹" + formatINR(minPrice);
        document.getElementById("price-max-label").textContent = "₹" + formatINR(maxPrice) + "+";
        activeFilters.priceMin = minPrice;
        activeFilters.priceMax = maxPrice;
        populateRoomTypes();
        renderRooms(allRooms);
    } catch (err) {
        document.getElementById("real-grid").innerHTML =
            `<div class="col-span-full text-center py-20 text-on-surface-variant"><p>Could not load rooms. Make sure the backend is running.</p></div>`;
    } finally {
        document.getElementById("skeleton-grid").style.display = "none";
        const grid = document.getElementById("real-grid");
        grid.classList.remove("hidden");
        grid.classList.add("grid");
        setTimeout(() => grid.classList.remove("opacity-0"), 50);
    }
}

function populateRoomTypes() {
    const types = [...new Set(allRooms.map(r => r.room_type).filter(Boolean))];
    const container = document.getElementById("room-type-filters");
    container.innerHTML = types.map(t => `
        <label class="flex items-center gap-3 cursor-pointer group" data-type="${t}">
            <div class="w-5 h-5 rounded border border-outline-variant flex items-center justify-center group-hover:border-primary transition-colors checkbox-box">
            </div>
            <span class="text-body-md font-body-md text-on-surface">${t}</span>
        </label>
    `).join("");
    container.querySelectorAll("label").forEach(label => {
        label.addEventListener("click", () => {
            const type = label.dataset.type;
            const box = label.querySelector(".checkbox-box");
            if (activeFilters.roomType.has(type)) {
                activeFilters.roomType.delete(type);
                box.classList.remove("bg-primary", "border-primary", "text-on-primary");
                box.innerHTML = "";
            } else {
                activeFilters.roomType.add(type);
                box.classList.add("bg-primary", "border-primary", "text-on-primary");
                box.innerHTML = "<span class=\"material-symbols-outlined text-[14px]\">check</span>";
            }
            applyFilters();
        });
    });
}

function renderRooms(rooms) {
    const grid = document.getElementById("real-grid");
    if (!rooms.length) {
        grid.innerHTML = `<div class="col-span-full text-center py-20 text-on-surface-variant"><p>No rooms match your filters.</p></div>`;
        return;
    }
    grid.innerHTML = rooms.map(r => `
        <article class="bg-surface-container-lowest rounded-2xl shadow-[0_4px_24px_rgba(13,28,47,0.03)] hover:shadow-[0_12px_48px_rgba(13,28,47,0.08)] border border-outline-variant/10 overflow-hidden group transition-shadow duration-500 flex flex-col">
            <div class="w-full h-64 overflow-hidden relative">
                ${r.image_url ? `<img alt="${r.room_name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="${r.image_url}"/>` : ""}
            </div>
            <div class="p-6 flex flex-col flex-grow">
                <div class="flex justify-between items-start mb-2">
                    <h2 class="text-headline-md font-headline-md text-primary text-[24px]">${r.room_name}</h2>
                </div>
                <p class="text-body-md font-body-md text-on-surface-variant mb-6 line-clamp-2">${r.description || ""}</p>
                <div class="flex gap-4 mb-8 text-on-surface-variant">
                    <div class="flex items-center gap-1" title="${r.capacity} Guests">
                        <span class="material-symbols-outlined text-[20px]">${r.capacity > 2 ? "group" : "person"}</span>
                        <span class="text-label-md font-label-md">${r.capacity}</span>
                    </div>
                    ${r.room_type ? `<div class="flex items-center gap-1" title="${r.room_type}">
                        <span class="material-symbols-outlined text-[20px]">hotel</span>
                        <span class="text-label-md font-label-md">${r.room_type}</span>
                    </div>` : ""}
                </div>
                <div class="mt-auto flex justify-between items-end">
                    <div>
                        <span class="text-label-md font-label-md text-on-surface-variant block mb-1">From</span>
                        <span class="text-headline-md font-headline-md text-primary">₹${formatINR(r.price)}<span class="text-body-md font-body-md text-on-surface-variant">/night</span></span>
                    </div>
                    <button class="bg-primary text-on-primary rounded-full px-6 py-3 text-label-md font-label-md hover:scale-105 transition-transform duration-300 shadow-md shadow-primary/10"
                        onclick="window.location.href='../room-details/index.html?id=${r.id}'">
                        Book Now
                    </button>
                </div>
            </div>
        </article>
    `).join("");
}

function applyFilters() {
    let filtered = allRooms.filter(r => {
        if (r.price < activeFilters.priceMin || r.price > activeFilters.priceMax) return false;
        if (activeFilters.roomType.size && !activeFilters.roomType.has(r.room_type)) return false;
        return true;
    });
    renderRooms(filtered);
}

document.addEventListener("DOMContentLoaded", () => {
    loadRooms();
    const priceMin = document.getElementById("price-min");
    const priceMax = document.getElementById("price-max");
    priceMin.addEventListener("input", () => {
        const val = Number(priceMin.value);
        document.getElementById("price-min-label").textContent = "₹" + formatINR(val);
        activeFilters.priceMin = val;
        applyFilters();
    });
    priceMax.addEventListener("input", () => {
        const val = Number(priceMax.value);
        document.getElementById("price-max-label").textContent = "₹" + formatINR(val) + "+";
        activeFilters.priceMax = val;
        applyFilters();
    });
});
