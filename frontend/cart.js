// Elements
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const checkoutButton = document.getElementById('checkout-button');

const API_BASE = location.hostname.includes('amplifyapp.com')
  ? 'https://master.dtpqt32sf63ob.amplifyapp.com/'
  : '';
                                         // local dev



// Initialize cart from localStorage or as an empty array
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Function to save cart to localStorage
const saveCart = () => {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
};

// Function to update cart count in the navbar
const updateCartCount = () => {
  cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
};

// Function to calculate total price
const calculateTotal = () => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = total.toFixed(2);
};

// Function to remove item from cart
const removeFromCart = (productId) => {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  renderCartItems();
};

// Function to update item quantity
const updateQuantity = (productId, newQuantity) => {
  const product = cart.find(item => item.id === productId);
  if (product) {
    product.quantity = newQuantity;
    if (product.quantity <= 0) {
      removeFromCart(productId);
    } else {
      saveCart();
      renderCartItems();
    }
  }
};

// Function to create cart item row
const createCartItemRow = (item) => {
  const row = document.createElement('div');
  row.className = 'row align-items-center mb-3';


  // Product Image
  const imgCol = document.createElement('div');
  imgCol.className = 'col-md-2';
  const img = document.createElement('img');
  img.src = item.imageUrl;
  img.alt = item.name;
  img.className = 'img-fluid';
  img.onerror = () => {
    img.src = 'https://via.placeholder.com/150x100.png?text=No+Image';
  };
  imgCol.appendChild(img);

  // Product Name
  const nameCol = document.createElement('div');
  nameCol.className = 'col-md-3';
  const name = document.createElement('h5');
  name.textContent = item.name;
  nameCol.appendChild(name);

  // Quantity Controls
  const qtyCol = document.createElement('div');
  qtyCol.className = 'col-md-3';
  const qtyGroup = document.createElement('div');
  qtyGroup.className = 'input-group';

  const minusBtn = document.createElement('button');
  minusBtn.className = 'btn btn-outline-secondary';
  minusBtn.textContent = '-';
  minusBtn.onclick = () => updateQuantity(item.id, item.quantity - 1);

  const qtyInput = document.createElement('input');
  qtyInput.type = 'number';
  qtyInput.className = 'form-control text-center';
  qtyInput.value = item.quantity;
  qtyInput.min = '1';
  qtyInput.onchange = (e) => {
    const newQty = parseInt(e.target.value);
    if (isNaN(newQty) || newQty < 1) {
      updateQuantity(item.id, 1);
    } else {
      updateQuantity(item.id, newQty);
    }
  };

  const plusBtn = document.createElement('button');
  plusBtn.className = 'btn btn-outline-secondary';
  plusBtn.textContent = '+';
  plusBtn.onclick = () => updateQuantity(item.id, item.quantity + 1);

  qtyGroup.appendChild(minusBtn);
  qtyGroup.appendChild(qtyInput);
  qtyGroup.appendChild(plusBtn);
  qtyCol.appendChild(qtyGroup);

  // Price
  const priceCol = document.createElement('div');
  priceCol.className = 'col-md-2';
  const price = document.createElement('p');
  price.className = 'mb-0';
  price.textContent = `$${(item.price * item.quantity).toFixed(2)}`;
  priceCol.appendChild(price);

  // Remove Button
  const removeCol = document.createElement('div');
  removeCol.className = 'col-md-2';
  const removeBtn = document.createElement('button');
  removeBtn.className = 'btn btn-danger';
  removeBtn.textContent = 'Remove';
  removeBtn.onclick = () => removeFromCart(item.id);
  removeCol.appendChild(removeBtn);

  // Assemble the row
  row.appendChild(imgCol);
  row.appendChild(nameCol);
  row.appendChild(qtyCol);
  row.appendChild(priceCol);
  row.appendChild(removeCol);

  return row;
};

// Function to render cart items
const renderCartItems = () => {
  cartItemsContainer.innerHTML = '';
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
    cartTotal.textContent = '0.00';
    return;
  }
  cart.forEach(item => {
    const cartItemRow = createCartItemRow(item);
    cartItemsContainer.appendChild(cartItemRow);
  });
  calculateTotal();
};

// Function to handle checkout
const handleCheckout = async () => {
  if (cart.length === 0) {
    alert('Your cart is empty.');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cart }),
    });

    const data = await response.json();

    if (data.url) {
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } else {
      alert('Unable to initiate checkout. Please try again.');
    }
  } catch (error) {
    console.error('Error initiating checkout:', error);
    alert('An error occurred during checkout. Please try again.');
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  renderCartItems();

  checkoutButton.addEventListener('click', handleCheckout);
});
