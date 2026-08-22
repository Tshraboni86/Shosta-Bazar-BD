// Products Page Management Script

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("productsTableBody")) {
    renderProductsTable();
  }

  // Image Upload Preview Setup (FileReader API)
  const imageInput = document.getElementById("productImageInput");
  if (imageInput) {
    imageInput.addEventListener("change", function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          const previewImg = document.getElementById("imagePreview");
          const infoContainer = document.getElementById("imageFileInfo");
          if (previewImg) previewImg.src = evt.target.result;
          if (infoContainer) {
            infoContainer.innerHTML = `File: <b>${file.name}</b> (${Math.round(file.size / 1024)} KB)`;
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }
});

function renderProductsTable() {
  const tbody = document.getElementById("productsTableBody");
  const products = getData("products");
  tbody.innerHTML = "";

  products.forEach((p, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><div style="width:40px;height:40px;background:#320e17;border-radius:4px;"></div></td>
      <td><b>${p.name}</b></td>
      <td>${p.category}</td>
      <td>৳ ${p.price.toLocaleString()}</td>
      <td>${p.oldPrice ? `৳ ${p.oldPrice.toLocaleString()}` : '-'}</td>
      <td>${p.tag ? `<span class="badge badge-info">${p.tag}</span>` : '-'}</td>
      <td><span class="badge ${p.status === 'Active' ? 'badge-success' : 'badge-danger'}">${p.status}</span></td>
      <td>${p.date}</td>
      <td>
        <a href="edit-product.html?id=${p.id}" class="btn-admin-secondary" style="padding:4px 8px; font-size:0.75rem;">Edit</a>
        <button onclick="deleteProduct(${idx})" class="btn-admin-secondary" style="padding:4px 8px; font-size:0.75rem; color:red;">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function deleteProduct(index) {
  showConfirmModal("Are you sure you want to delete this product?", () => {
    const products = getData("products");
    products.splice(index, 1);
    setData("products", products);
    renderProductsTable();
    showToast("Product deleted successfully.");
  });
}