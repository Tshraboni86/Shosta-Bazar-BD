const OFFER_API_URL = 'http://localhost:5000/api/offers';

document.addEventListener('DOMContentLoaded', () => {
  loadOffers();

  // Explicitly target Offer Form submission
  const offerForm = document.getElementById('addOfferForm');
  if (offerForm) {
    offerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation(); // Stops products.js or api.js from firing product alerts

      const title = document.getElementById('offerTitle')?.value.trim();
      const discount = document.getElementById('offerDiscount')?.value.trim();
      const startDate = document.getElementById('offerStartDate')?.value;
      const endDate = document.getElementById('offerEndDate')?.value;
      const category = document.getElementById('offerCategory')?.value || 'All Categories';

      if (!title || !discount || !startDate || !endDate) {
        alert('Please fill out all offer details.');
        return;
      }

      try {
        const response = await fetch(OFFER_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            discount,
            startDate,
            endDate,
            category,
            status: 'ACTIVE'
          })
        });

        if (response.ok) {
          alert('✅ Offer saved successfully!');
          document.getElementById('addOfferModal').style.display = 'none';
          offerForm.reset();
          loadOffers();
        } else {
          const errData = await response.json();
          alert(`❌ Error: ${errData.error || 'Failed to save offer.'}`);
        }
      } catch (err) {
        console.error('Error saving offer:', err);
        alert('❌ Server offline. Run "node server.js".');
      }
    });
  }
});

// Modal toggle delegates
document.addEventListener('click', (e) => {
  const addBtn = e.target.closest('#addOfferBtn') || (e.target.innerText && e.target.innerText.includes('ADD OFFER'));
  const modal = document.getElementById('addOfferModal');
  const closeBtn = e.target.closest('#closeOfferModalBtn');

  if (addBtn && modal) {
    e.preventDefault();
    modal.style.display = 'flex';
  }

  if ((closeBtn || e.target === modal) && modal) {
    modal.style.display = 'none';
    document.getElementById('addOfferForm')?.reset();
  }
});

// Fetch & Display Offers
async function loadOffers() {
  const tableBody = document.getElementById('offersTableBody');
  if (!tableBody) return;

  try {
    const res = await fetch(OFFER_API_URL);
    const offers = await res.json();

    if (!Array.isArray(offers) || offers.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px;">No promotional offers found. Click "+ ADD OFFER" to create one.</td></tr>';
      return;
    }

    tableBody.innerHTML = offers.map(item => `
      <tr>
        <td style="font-weight:600;">${item.title}</td>
        <td>${item.discount}</td>
        <td>${item.startDate}</td>
        <td>${item.endDate}</td>
        <td>${item.category || 'All Categories'}</td>
        <td><span style="background:#d4edda; color:#155724; padding:3px 8px; border-radius:4px; font-weight:bold; font-size:0.85rem;">${item.status || 'ACTIVE'}</span></td>
        <td>
          <button onclick="deleteOffer('${item._id}')" style="color:#dc3545; background:none; border:none; cursor:pointer; font-weight:500;">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error loading offers:', err);
  }
}

// Delete Offer Handler
async function deleteOffer(id) {
  if (!confirm('Are you sure you want to delete this offer?')) return;

  try {
    const res = await fetch(`${OFFER_API_URL}/${id}`, { method: 'DELETE' });
    if (res.ok) loadOffers();
  } catch (err) {
    console.error('Delete error:', err);
  }
}