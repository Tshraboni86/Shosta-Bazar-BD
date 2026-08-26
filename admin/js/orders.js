const API_BASE = window.API_BASE || 'http://localhost:5000/api';
const ORDERS_API_URL = `${API_BASE}/orders`;
let currentOrderId = null;

// ==========================================
// LOAD ORDERS
// ==========================================
async function loadOrders() {
  const tableBody = document.getElementById('ordersTableBody');
  if (!tableBody) return;

  try {
    tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px;">Loading orders...</td></tr>';

    const res = await fetch(ORDERS_API_URL, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const orders = await res.json();

    if (!Array.isArray(orders) || orders.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px; color:#888;">No orders found.</td></tr>';
      updateStats([]);
      return;
    }

    // Update statistics
    updateStats(orders);

    tableBody.innerHTML = orders.map(order => `
      <tr class="order-row">
        <td><strong>${order.orderId}</strong></td>
        <td>${order.customerName}</td>
        <td>${order.customerPhone}</td>
        <td>${order.items.length} items</td>
        <td>৳${order.total.toLocaleString()}</td>
        <td><span class="status-badge ${order.status.toLowerCase()}">${order.status}</span></td>
        <td>${new Date(order.createdAt).toLocaleDateString()}</td>
        <td style="display:flex; gap:4px; flex-wrap:wrap;">
          <button onclick="viewOrder('${order._id}')" style="color:#007bff; background:none; border:none; cursor:pointer; font-size:12px;">View</button>
          <select onchange="updateOrderStatus('${order._id}', this.value)" class="status-select">
            <option value="PENDING" ${order.status === 'PENDING' ? 'selected' : ''}>Pending</option>
            <option value="CONFIRMED" ${order.status === 'CONFIRMED' ? 'selected' : ''}>Confirmed</option>
            <option value="PROCESSING" ${order.status === 'PROCESSING' ? 'selected' : ''}>Processing</option>
            <option value="SHIPPED" ${order.status === 'SHIPPED' ? 'selected' : ''}>Shipped</option>
            <option value="DELIVERED" ${order.status === 'DELIVERED' ? 'selected' : ''}>Delivered</option>
            <option value="CANCELLED" ${order.status === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
          </select>
          <button onclick="deleteOrder('${order._id}')" style="color:#dc3545; background:none; border:none; cursor:pointer; font-size:12px;">Delete</button>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    console.error('Error loading orders:', err);
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding:20px; color:#dc3545;">
          ⚠️ Failed to load orders. Make sure server is running.
          <br>
          <button onclick="loadOrders()" style="margin-top:10px; padding:6px 16px; background:#511824; color:white; border:none; border-radius:4px; cursor:pointer;">Retry</button>
        </td>
      </tr>
    `;
  }
}

// ==========================================
// UPDATE STATISTICS
// ==========================================
function updateStats(orders) {
  const stats = {
    PENDING: 0,
    CONFIRMED: 0,
    PROCESSING: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0
  };
  
  orders.forEach(order => {
    if (stats[order.status] !== undefined) {
      stats[order.status]++;
    }
  });
  
  document.getElementById('pendingCount').textContent = stats.PENDING;
  document.getElementById('confirmedCount').textContent = stats.CONFIRMED + stats.PROCESSING;
  document.getElementById('shippedCount').textContent = stats.SHIPPED;
  document.getElementById('deliveredCount').textContent = stats.DELIVERED;
  document.getElementById('cancelledCount').textContent = stats.CANCELLED;
}

// ==========================================
// VIEW ORDER DETAILS
// ==========================================
async function viewOrder(id) {
  try {
    const res = await fetch(`${ORDERS_API_URL}/${id}`);
    if (!res.ok) throw new Error('Order not found');
    
    const order = await res.json();
    
    document.getElementById('detailOrderId').textContent = `Order: ${order.orderId}`;
    
    const content = document.getElementById('orderDetailContent');
    content.innerHTML = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
        <div><strong>Customer:</strong> ${order.customerName}</div>
        <div><strong>Phone:</strong> ${order.customerPhone}</div>
        <div><strong>Email:</strong> ${order.customerEmail || 'N/A'}</div>
        <div><strong>Address:</strong> ${order.customerAddress}</div>
        <div><strong>Status:</strong> <span class="status-badge ${order.status.toLowerCase()}">${order.status}</span></div>
        <div><strong>Payment:</strong> ${order.paymentMethod}</div>
        <div><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</div>
        <div><strong>WhatsApp Sent:</strong> ${order.whatsappSent ? '✅ Yes' : '❌ No'}</div>
      </div>
      <div><strong>Order Items:</strong></div>
      <table style="width:100%; border-collapse:collapse; margin-top:8px;">
        <thead>
          <tr style="background:#e9ecef;">
            <th style="padding:8px; text-align:left;">Product</th>
            <th style="padding:8px; text-align:left;">Price</th>
            <th style="padding:8px; text-align:left;">Qty</th>
            <th style="padding:8px; text-align:left;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr>
              <td style="padding:8px; border-bottom:1px solid #eee;">${item.name}</td>
              <td style="padding:8px; border-bottom:1px solid #eee;">৳${item.price}</td>
              <td style="padding:8px; border-bottom:1px solid #eee;">${item.quantity}</td>
              <td style="padding:8px; border-bottom:1px solid #eee;">৳${(item.price * item.quantity).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding:8px; text-align:right;"><strong>Subtotal:</strong></td>
            <td style="padding:8px;">৳${order.subtotal.toLocaleString()}</td>
          </tr>
          <tr>
            <td colspan="3" style="padding:8px; text-align:right;"><strong>Delivery:</strong></td>
            <td style="padding:8px;">৳${order.deliveryCharge.toLocaleString()}</td>
          </tr>
          <tr style="font-weight:700; background:#f8f9fa;">
            <td colspan="3" style="padding:8px; text-align:right;"><strong>Total:</strong></td>
            <td style="padding:8px; color:#320e17;">৳${order.total.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
      ${order.notes ? `<div style="margin-top:12px;"><strong>Notes:</strong> ${order.notes}</div>` : ''}
    `;
    
    document.getElementById('orderDetailModal').style.display = 'flex';
    
  } catch (err) {
    console.error('Error loading order details:', err);
    alert('❌ Failed to load order details.');
  }
}

// ==========================================
// CLOSE ORDER DETAIL
// ==========================================
function closeOrderDetail() {
  document.getElementById('orderDetailModal').style.display = 'none';
}

// ==========================================
// UPDATE ORDER STATUS
// ==========================================
async function updateOrderStatus(id, status) {
  try {
    const response = await fetch(`${ORDERS_API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    
    if (response.ok) {
      alert(`✅ Order status updated to ${status}!`);
      loadOrders();
    } else {
      const err = await response.json();
      alert(`❌ Error: ${err.error || 'Failed to update status'}`);
    }
  } catch (err) {
    console.error('Error updating status:', err);
    alert('❌ Failed to update status.');
  }
}

// ==========================================
// DELETE ORDER
// ==========================================
async function deleteOrder(id) {
  if (!confirm('Are you sure you want to delete this order?')) return;
  
  try {
    const response = await fetch(`${ORDERS_API_URL}/${id}`, { method: 'DELETE' });
    if (response.ok) {
      alert('✅ Order deleted successfully!');
      loadOrders();
    } else {
      const err = await response.json();
      alert(`❌ Error: ${err.error || 'Failed to delete order'}`);
    }
  } catch (err) {
    console.error('Error deleting order:', err);
    alert('❌ Failed to delete order.');
  }
}

// ==========================================
// INITIALIZE
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
  loadOrders();
  
  // Close modal when clicking outside
  const modal = document.getElementById('orderDetailModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeOrderDetail();
      }
    });
  }
});

// ==========================================
// GLOBAL FUNCTIONS
// ==========================================
window.loadOrders = loadOrders;
window.viewOrder = viewOrder;
window.closeOrderDetail = closeOrderDetail;
window.updateOrderStatus = updateOrderStatus;
window.deleteOrder = deleteOrder;
