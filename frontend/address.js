// frontend/address.js
const form  = document.getElementById('addr-form');
const error = document.getElementById('addr-error');

/* choose the correct API host */

const API_BASE = 'https://bakery-api.master.dtqp32sf63ob.amplifyapp.com';

                                         // local dev

form.addEventListener('submit', async e => {
  e.preventDefault();
  error.classList.add('d-none');

  const fd   = new FormData(form);
  const addr = Object.fromEntries(fd.entries());

  try {
    /* 1 ▸ validate ZIP ↔ city/state on the backend */
    const res = await fetch(`${API_BASE}/api/validate-address`, {
      method : 'POST',
      headers: { 'Content-Type':'application/json' },
      body   : JSON.stringify(addr)
    });
    if (!res.ok) throw new Error((await res.json()).message);
    const verifiedAddr = await res.json();

    /* 2 ▸ send cart + verified address to create Stripe session */
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    const pay  = await fetch(`${API_BASE}/create-checkout-session`, {
      method : 'POST',
      headers: { 'Content-Type':'application/json' },
      body   : JSON.stringify({ cart, address: verifiedAddr })
    }).then(r => r.json());

    if (!pay.url) throw new Error('Checkout session failed');
    window.location.href = pay.url;

  } catch (err) {
    error.textContent = err.message || 'Address validation failed';
    error.classList.remove('d-none');
  }
});
