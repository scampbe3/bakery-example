// frontend/admin.js
const tbody = document.getElementById('inv-body');
const alert = document.getElementById('alert');

/* pick the correct API host */

const API_BASE = 'https://bakery-api.master.dtqp32sf63ob.amplifyapp.com';

                                  // local dev

async function loadInventory() {
  const res   = await fetch(`${API_BASE}/api/inventory`);
  const items = await res.json();

  tbody.innerHTML = items.map(p => `
    <tr data-id="${p.id}" class="${p.quantity <= 3 ? 'table-danger' : ''}">
      <td>${p.name}</td>
      <td class="text-end">
        <input type="number"
               class="form-control form-control-sm qty-input"
               value="${p.quantity}" min="0" style="width:90px;">
      </td>
      <td class="text-end">$${p.price.toFixed(2)}</td>
    </tr>`).join('');
}

/* inline-edit handler */
tbody.addEventListener('change', async e => {
  if (!e.target.classList.contains('qty-input')) return;
  const tr  = e.target.closest('tr');
  const id  = tr.dataset.id;
  const qty = parseInt(e.target.value, 10);

  try {
    const res = await fetch(`${API_BASE}/api/inventory/${id}`, {
      method : 'PUT',
      headers: { 'Content-Type':'application/json' },
      body   : JSON.stringify({ quantity: qty })
    });
    if (!res.ok) throw new Error((await res.json()).message);

    /* refresh highlight */
    tr.classList.toggle('table-danger', qty <= 3);
  } catch (err) {
    alert.textContent = err.message;
    alert.classList.remove('d-none');
    setTimeout(() => alert.classList.add('d-none'), 3000);
  }
});

loadInventory();
