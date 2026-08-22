// Image Versioning and History Script

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("imageHistoryContainer")) {
    renderImageHistory();
  }
});

function renderImageHistory() {
  const container = document.getElementById("imageHistoryContainer");
  const historyData = getData("imageHistory");
  container.innerHTML = "";

  historyData.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>Product: ${item.productName}</h3>
      <div style="margin: 16px 0;">
        <p style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--admin-gold-600);"><b>Current Image</b></p>
        <div style="width: 80px; height: 80px; background: #320e17; border-radius: 4px; margin-top: 6px; display:flex; align-items:center; justify-content:center; color:white; font-size:0.7rem;">${item.current}</div>
      </div>
      <p style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: #666;"><b>Previous Versions</b></p>
      <div style="display: flex; gap: 16px; margin-top: 10px; flex-wrap: wrap;">
        ${item.history.map(h => `
          <div style="border:1px solid var(--admin-border); padding:8px; border-radius:4px; text-align:center;">
            <div style="width: 60px; height: 60px; background: #6d2032; border-radius: 4px; margin-bottom: 4px;"></div>
            <p style="font-size:0.7rem;">${h.file}</p>
            <p style="font-size:0.65rem; color:#888;">${h.date}</p>
            <button onclick="restoreImage('${item.productName}', '${h.file}')" class="btn-admin-secondary" style="padding:2px 6px; font-size:0.65rem; margin-top:4px;">Restore</button>
          </div>
        `).join('')}
      </div>
    `;
    container.appendChild(card);
  });
}

function restoreImage(pName, file) {
  showConfirmModal(`Restore "${file}" as current image for ${pName}?`, () => {
    showToast(`Image updated to ${file}`);
  });
}