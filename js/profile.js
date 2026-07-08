document.addEventListener("DOMContentLoaded", () => {
  requireAuth();
  loadProfile();
  setupAvatarUpload();
  setupEditProfileForm();
  setupChangePasswordForm();
});

function handleLogout() {
  AuthAPI.logout();
  window.location.href = "../../index.html";
}

async function loadProfile() {
  try {
    const res = await AuthAPI.request("/profile");
    if (!res || res.detail) throw new Error(res?.detail || "Failed to load profile");
    const p = res;
    document.getElementById("profileName").textContent = p.full_name || "No Name";
    document.getElementById("profileEmail").textContent = p.email || "";
    document.getElementById("profilePhone").textContent = p.phone ? `${p.phone}` : "";
    const member = p.created_at ? new Date(p.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—";
    document.getElementById("profileMemberSince").textContent = member;
    document.getElementById("detailMemberSince").textContent = member;
    document.getElementById("detailUserId").textContent = p.id || "—";
    document.getElementById("infoName").textContent = p.full_name || "—";
    document.getElementById("infoEmail").textContent = p.email || "—";
    document.getElementById("infoPhone").textContent = p.phone || "—";
    document.getElementById("infoAddress").textContent = p.address || "—";
    document.getElementById("infoCity").textContent = p.city || "—";
    document.getElementById("infoCountry").textContent = p.country || "—";
    if (p.avatar_url) {
      const img = document.getElementById("profileAvatar");
      img.src = p.avatar_url;
      img.classList.remove("hidden");
      document.getElementById("avatarPlaceholder").classList.add("hidden");
    }
    loadBookings();
    loadPayments();
  } catch (e) {
    Toast.show("Failed to load profile: " + e.message, "error");
  }
}

function setupAvatarUpload() {
  const input = document.getElementById("avatarInput");
  const img = document.getElementById("profileAvatar");
  const placeholder = document.getElementById("avatarPlaceholder");
  input.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result;
      if (!dataUrl) return;
      try {
        const res = await AuthAPI.request("/profile/upload-image", { method: "POST", body: JSON.stringify({ image: dataUrl }) });
        if (res && res.avatar_url) {
          img.src = res.avatar_url;
          img.classList.remove("hidden");
          placeholder.classList.add("hidden");
          Toast.show("Avatar updated!", "success");
        } else {
          throw new Error(res?.detail || "Upload failed");
        }
      } catch (err) {
        Toast.show("Image upload failed: " + err.message, "error");
      }
    };
    reader.readAsDataURL(file);
  });
}

function openEditProfile() {
  document.getElementById("editName").value = document.getElementById("infoName").textContent === "—" ? "" : document.getElementById("infoName").textContent;
  document.getElementById("editEmail").value = document.getElementById("infoEmail").textContent === "—" ? "" : document.getElementById("infoEmail").textContent;
  document.getElementById("editPhone").value = document.getElementById("infoPhone").textContent === "—" ? "" : document.getElementById("infoPhone").textContent;
  document.getElementById("editAddress").value = document.getElementById("infoAddress").textContent === "—" ? "" : document.getElementById("infoAddress").textContent;
  document.getElementById("editCity").value = document.getElementById("infoCity").textContent === "—" ? "" : document.getElementById("infoCity").textContent;
  document.getElementById("editCountry").value = document.getElementById("infoCountry").textContent === "—" ? "" : document.getElementById("infoCountry").textContent;
  document.getElementById("editProfileModal").classList.remove("hidden");
}

function closeEditProfile() {
  document.getElementById("editProfileModal").classList.add("hidden");
}

function setupEditProfileForm() {
  document.getElementById("editProfileForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("saveProfileBtn");
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Saving...';
    const payload = {
      full_name: document.getElementById("editName").value.trim(),
      phone: document.getElementById("editPhone").value.trim(),
      address: document.getElementById("editAddress").value.trim(),
      city: document.getElementById("editCity").value.trim(),
      country: document.getElementById("editCountry").value.trim()
    };
    try {
      const res = await AuthAPI.request("/profile/update", { method: "PUT", body: JSON.stringify(payload) });
      if (res && res.message) {
        Toast.show(res.message, "success");
        closeEditProfile();
        loadProfile();
      } else {
        throw new Error(res?.detail || "Update failed");
      }
    } catch (err) {
      Toast.show("Failed to update profile: " + err.message, "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Save Changes";
    }
  });
}

function openChangePassword() {
  document.getElementById("changePasswordModal").classList.remove("hidden");
}

function closeChangePassword() {
  document.getElementById("changePasswordModal").classList.add("hidden");
  document.getElementById("changePasswordForm").reset();
}

function setupChangePasswordForm() {
  document.getElementById("changePasswordForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const newPwd = document.getElementById("newPwd").value;
    const confirmPwd = document.getElementById("confirmPwd").value;
    if (newPwd !== confirmPwd) {
      Toast.show("Passwords do not match", "error");
      return;
    }
    if (newPwd.length < 4) {
      Toast.show("New password must be at least 4 characters", "error");
      return;
    }
    const btn = document.getElementById("changePwdBtn");
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Updating...';
    try {
      const res = await AuthAPI.request("/change-password", { method: "PUT", body: JSON.stringify({ current_password: document.getElementById("currentPwd").value, new_password: newPwd }) });
      if (res && res.message) {
        Toast.show(res.message, "success");
        closeChangePassword();
      } else {
        throw new Error(res?.detail || "Password change failed");
      }
    } catch (err) {
      Toast.show(err.message, "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Update Password";
    }
  });
}

let currentBookingTab = "upcoming";

function switchBookingTab(tab, el) {
  currentBookingTab = tab;
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active-tab"));
  if (el) el.classList.add("active-tab");
  renderBookings(window._allBookings || []);
}

async function loadBookings() {
  try {
    const res = await AuthAPI.request("/bookings");
    const bookings = Array.isArray(res) ? res : (res && Array.isArray(res.bookings) ? res.bookings : []);
    window._allBookings = bookings;
    renderBookings(bookings);
  } catch (e) {
    document.getElementById("bookingsContainer").innerHTML = '<p class="text-on-surface-variant text-center py-8">Failed to load bookings</p>';
  }
}

function renderBookings(bookings) {
  const container = document.getElementById("bookingsContainer");
  const today = new Date();
  let filtered;
  if (currentBookingTab === "upcoming") {
    filtered = bookings.filter(b => b.status !== "cancelled" && new Date(b.check_in || b.checkin_date) >= today);
  } else if (currentBookingTab === "history") {
    filtered = bookings.filter(b => b.status !== "cancelled" && new Date(b.check_in || b.checkin_date) < today);
  } else {
    filtered = bookings.filter(b => b.status === "cancelled");
  }
  if (!filtered.length) {
    container.innerHTML = `<div class="text-center py-12 text-on-surface-variant"><span class="material-symbols-outlined text-[48px] block mx-auto mb-2">${currentBookingTab === "cancelled" ? "cancel" : "event_busy"}</span><p>No ${currentBookingTab} bookings</p></div>`;
    return;
  }
  let html = '<div class="space-y-4">';
  filtered.forEach(b => {
    const checkin = b.check_in || b.checkin_date || "—";
    const checkout = b.check_out || b.checkout_date || "—";
    const room = b.room_name || b.room_type || "Room";
    const status = b.status || "confirmed";
    const statusColor = status === "cancelled" ? "text-error" : status === "confirmed" ? "text-green-600" : "text-secondary";
    const nights = b.nights || 0;
    const total = b.total_price || b.total_amount || 0;
    html += `<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-surface-container-high rounded-xl gap-2 hover:scale-[1.01] transition-transform">
      <div class="flex-1">
        <p class="text-body-md font-semibold">${room}</p>
        <p class="text-label-md text-on-surface-variant">${checkin} → ${checkout} ${nights ? `· ${nights} night${nights > 1 ? "s" : ""}` : ""}</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-label-md font-semibold">$${total}</span>
        <span class="text-label-sm font-label-sm ${statusColor} capitalize">${status}</span>
      </div>
    </div>`;
  });
  html += '</div>';
  container.innerHTML = html;
}

async function loadPayments() {
  try {
    const res = await AuthAPI.request("/bookings");
    const bookings = Array.isArray(res) ? res : (res && Array.isArray(res.bookings) ? res.bookings : []);
    const container = document.getElementById("paymentsContainer");
    const payments = bookings.filter(b => b.total_price || b.total_amount);
    if (!payments.length) {
      container.innerHTML = '<div class="text-center py-12 text-on-surface-variant"><span class="material-symbols-outlined text-[48px] block mx-auto mb-2">payments</span><p>No payments yet</p></div>';
      return;
    }
    let html = '<div class="space-y-3">';
    payments.forEach(b => {
      const date = b.check_in || b.checkin_date || "—";
      const room = b.room_name || b.room_type || "Room";
      const total = b.total_price || b.total_amount || 0;
      html += `<div class="flex justify-between items-center p-3 bg-surface-container-high rounded-xl">
        <div><p class="text-body-md">${room}</p><p class="text-label-md text-on-surface-variant">${date}</p></div>
        <span class="text-body-md font-semibold text-green-600">+$${total}</span>
      </div>`;
    });
    html += '</div>';
    container.innerHTML = html;
  } catch (e) {
    document.getElementById("paymentsContainer").innerHTML = '<p class="text-on-surface-variant text-center py-8">Failed to load payments</p>';
  }
}
