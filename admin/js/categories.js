// Categories UI Module

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("categoriesTableBody")) {
    renderCategoriesTable();
  }
});

function renderCategoriesTable() {
  const tbody = document.getElementById("categoriesTableBody");
  const categories = getData("categories");
  tbody.innerHTML = "";

  categories.forEach((c, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><div style="width:40px;height:40px;background:#c8a24a;border-radius:4px;"></div></td>
      <td><b>${c.name}</b></td>
      <td>${c.count} Designs</td>
      <td><span class="badge ${c.status === 'Active' ? 'badge-success' : 'badge-danger'}">${c.status}</span></td>
      <td>
        <button onclick="deleteCategory(${idx})" class="btn-admin-secondary" style="padding:4px 8px; font-size:0.75rem; color:red;">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function deleteCategory(index) {
  showConfirmModal("Are you sure you want to delete this category?", () => {
    const categories = getData("categories");
    categories.splice(index, 1);
    setData("categories", categories);
    renderCategoriesTable();
    showToast("Category deleted.");
  });
}