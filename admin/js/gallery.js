// Gallery Management Script

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("galleryGrid")) {
    renderGallery();
  }
});

function renderGallery() {
  const grid = document.getElementById("galleryGrid");
  const gallery = getData("gallery");
  grid.innerHTML = "";

  gallery.forEach((g, idx) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div style="height:120px; background:#511824; border-radius:4px; margin-bottom:10px;"></div>
      <p style="font-size:0.75rem; text-overflow:ellipsis; overflow:hidden;">${g.url}</p>
      <div style="margin-top:10px; display:flex; justify-content:space-between; align-items:center;">
        <span class="badge badge-success">${g.status}</span>
        <button onclick="deleteGallery(${idx})" class="btn-admin-secondary" style="padding:2px 6px; color:red; font-size:0.7rem;">Delete</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function deleteGallery(index) {
  showConfirmModal("Delete gallery item?", () => {
    const gallery = getData("gallery");
    gallery.splice(index, 1);
    setData("gallery", gallery);
    renderGallery();
    showToast("Gallery item removed.");
  });
}