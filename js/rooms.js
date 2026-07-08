const API_BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") ? "http://localhost:8000" : "/api";

const FALLBACK_ROOMS = [
    {id: 1, room_name: "Flamingo 1", description: "Spacious duplex room for 4 persons with mountain views, private balcony, and modern amenities.", price: 6000, capacity: 4, image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c", room_type: "Duplex"},
    {id: 2, room_name: "Flamingo 2", description: "King attic room for 4 persons with warm wooden interiors and panoramic valley views.", price: 5000, capacity: 4, image_url: "https://images.unsplash.com/photo-1611892440504-42a792e24d32", room_type: "King Attic"},
    {id: 3, room_name: "Flamingo 3", description: "Duplex room for 4 persons set in a serene apple orchard with stunning mountain views.", price: 6000, capacity: 4, image_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7", room_type: "Duplex"},
    {id: 4, room_name: "Maina 1", description: "Cozy private room for 2 persons with warm wooden interiors and mountain charm.", price: 2500, capacity: 2, image_url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2", room_type: "Private Room"},
    {id: 5, room_name: "Maina 2", description: "Budget-friendly private room for 2 persons with essential comforts and mountain access.", price: 2000, capacity: 2, image_url: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9", room_type: "Private Room"},
    {id: 6, room_name: "Maina 3", description: "Charming private room for 2 persons with orchard views and warm hospitality.", price: 2500, capacity: 2, image_url: "https://images.unsplash.com/photo-1598928506311-c55ez637a11a", room_type: "Private Room"},
];

let allRooms = [];
let activeFilters = { roomType: new Set() };

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
        const data = await res.json();
        if (data && data.length > 0 && data[0].room_name && data[0].room_name.startsWith('Flamingo')) {
            allRooms = data;
        } else {
            allRooms = FALLBACK_ROOMS;
        }
    } catch (err) {
        allRooms = FALLBACK_ROOMS;
    } finally {
        populateRoomTypes();
        renderRooms(allRooms);
        document.getElementById("room-count").textContent = allRooms.length + " rooms available";
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
        if (activeFilters.roomType.size && !activeFilters.roomType.has(r.room_type)) return false;
        return true;
    });
    renderRooms(filtered);
}

function setupAmenityFilters() {
    const container = document.getElementById("amenity-filters");
    if (!container) return;
    container.querySelectorAll("label").forEach(label => {
        label.addEventListener("click", () => {
            const amenity = label.dataset.amenity;
            const box = label.querySelector(".amenity-box");
            if (activeFilters.amenities && activeFilters.amenities.has(amenity)) {
                activeFilters.amenities.delete(amenity);
                box.classList.remove("bg-primary", "border-primary", "text-on-primary");
                box.innerHTML = "";
            } else {
                if (!activeFilters.amenities) activeFilters.amenities = new Set();
                activeFilters.amenities.add(amenity);
                box.classList.add("bg-primary", "border-primary", "text-on-primary");
                box.innerHTML = "<span class=\"material-symbols-outlined text-[14px]\">check</span>";
            }
            applyFilters();
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadRooms();
    setupAmenityFilters();
});
