// Hero Slider UI Module

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("heroTableBody")) {
    renderHeroTable();
  }
});

function renderHeroTable() {
  const tbody = document.getElementById("heroTableBody");
  const hero = getData("hero");
  tbody.innerHTML = "";

  hero.forEach((h, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${h.order}</td>
      <td><b>${h.title}</b></td>
      <td>${h.subtitle}</td>
      <td>${h.btnText}</td>
      <td><span class="badge badge-success">${h.status}</span></td>
      <td>
        <button onclick="deleteHero(${idx})" class="btn-admin-secondary" style="padding:4px 8px; font-size:0.75rem; color:red;">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function deleteHero(index) {
  showConfirmModal("Delete hero slide?", () => {
    const hero = getData("hero");
    hero.splice(index, 1);
    setData("hero", hero);
    renderHeroTable();
    showToast("Slide removed successfully.");
  });
}