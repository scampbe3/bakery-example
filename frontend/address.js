const form  = document.getElementById('addr-form');
const error = document.getElementById('addr-error');

form.addEventListener('submit', async e => {
  e.preventDefault();
  error.classList.add('d-none');

  const fd   = new FormData(form);
  const addr = Object.fromEntries(fd.entries());

  try {
    // validate via backend
    const res  = await fetch('/api/validate-address', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addr)
    });
    if (!res.ok) throw new Error((await res.json()).message);

    // back-end may return cleaned / verified components
    const verifiedAddr = await res.json();

// include the current cart so backend can create the Stripe session
const cart = JSON.parse(localStorage.getItem('cart') || '[]');

const pay = await fetch('/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ cart, address: verifiedAddr })
}).then(r => r.json());

if (!pay.url) throw new Error('Checkout session failed');
window.location.href = pay.url;



  } catch (err) {
    error.textContent = err.message || 'Address validation failed';
    error.classList.remove('d-none');
  }
});

