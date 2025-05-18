/* -------------------- constants & DOM refs -------------------- */
const API = 'http://localhost:5000/api/products';
const productList = document.getElementById('product-list');
const cartCount   = document.getElementById('cart-count');
const featuredBox = document.getElementById('featured-inner');
const searchInput = document.getElementById('search-input');
const categoryPills = document.getElementById('category-pills');

/* -------------------- cart in localStorage -------------------- */
let cart = JSON.parse(localStorage.getItem('cart')) || [];
const saveCart = () => {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  renderSidebar();            // <─ NEW
};
const updateCartCount = () => {
  if (cartCount) cartCount.textContent = cart.reduce((t, i) => t + i.quantity, 0);
};

function changeSidebarQty(id, delta){
  const item = cart.find(i => i.id === id);
  if(!item) return;
  const newQty = item.quantity + delta;
  if (newQty <= 0) {
    cart = cart.filter(i => i.id !== id);   // remove from cart
  } else {
    item.quantity = newQty;
  }
  saveCart();                     // re-save & re-render sidebar
}


function renderSidebar(){
  const list = document.getElementById('sidebar-items');
  const countSpan = document.getElementById('sidebar-count');
  if(!list || !countSpan) return;

  const totalQty = cart.reduce((t, i) => t + i.quantity, 0);
  countSpan.textContent = `(${totalQty})`;

  list.innerHTML = '';
  if(cart.length === 0){
    list.innerHTML = '<li class="list-group-item text-muted">Cart is empty</li>';
    return;
  }
  cart.forEach(item=>{
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex align-items-center';
    li.innerHTML = `
    <img src="${item.imageUrl}" alt="${item.name}"
         onerror="this.src='https://via.placeholder.com/40x40.png?text=No+Img'">
    <div class="flex-grow-1 ms-2">
      <div class="small fw-semibold">${item.name}</div>
      <div class="sidebar-qty mt-1">
        <button class="btn btn-outline-secondary" type="button">-</button>
        <input type="number" class="form-control text-center" value="${item.quantity}" min="1">
        <button class="btn btn-outline-secondary" type="button">+</button>
      </div>
    </div>`;


        const [minus, input, plus] = li.querySelectorAll('button, input');
    minus.onclick = () => changeSidebarQty(item.id, -1);
    plus.onclick  = () => changeSidebarQty(item.id,  1);
    input.onchange = e => {
      const n = parseInt(e.target.value, 10);
      if (!isNaN(n) && n > 0) {
        item.quantity = n;
      } else {
        cart = cart.filter(i => i.id !== item.id);   // 0 or invalid → delete
      }
      saveCart();
    };



    list.appendChild(li);
  });
}



/* -------------------- fetch helpers --------------------------- */
const getJSON = async (url) => (await fetch(url)).json();

/* -------------------- FEATURED CAROUSEL ----------------------- */
async function fetchFeatured() {
  const featured = await getJSON(`${API}?featured=true`);
  if (!featured.length) return document.querySelector('.container .carousel').remove();

  featured.forEach((p, idx) => {
    const div = document.createElement('div');
    div.className = `carousel-item ${idx === 0 ? 'active' : ''}`;
    div.innerHTML = `
      <img src="${p.imageUrl}" class="d-block w-100 carousel-img" alt="${p.name}">
      <div class="carousel-caption d-none d-md-block">
        <h5>${p.name}</h5>
        <p>${p.description}</p>
        <button class="btn btn-primary" data-id="${p.id}">Add to Cart</button>
      </div>`;
    featuredBox.appendChild(div);
  });

  // delegate add-to-cart clicks inside carousel
  featuredBox.addEventListener('click', e => {
    if (e.target.matches('[data-id]')) {
      const id = +e.target.dataset.id;
      const prod = featured.find(f => f.id === id);
      addToCart(prod);
    }
  });
}

/* -------------------- CATEGORY FILTERS ------------------------ */
async function loadCategories() {
  const products = await getJSON(API);
  const cats = [...new Set(products.map(p => p.category).filter(Boolean))];

  const makePill = (name, active=false) => {
    const pill = document.createElement('button');
    pill.className = `btn btn-sm ${active ? 'btn-primary' : 'btn-outline-secondary'}`;
    pill.textContent = name;
    pill.dataset.cat = name;
    return pill;
  };

  categoryPills.appendChild(makePill('All', true));
  cats.forEach(c => categoryPills.appendChild(makePill(c)));

  categoryPills.addEventListener('click', e => {
    if (!e.target.dataset.cat) return;
    [...categoryPills.children].forEach(btn =>
      btn.classList.replace('btn-primary', 'btn-outline-secondary'));
    e.target.classList.replace('btn-outline-secondary', 'btn-primary');
    currentCategory = e.target.dataset.cat === 'All' ? null : e.target.dataset.cat;
    fetchProducts();
  });
}

let currentCategory = null;
let currentSearch   = '';

/* -------------------- PRODUCT GRID ---------------------------- */
async function fetchProducts() {
  let url = API;
  const params = new URLSearchParams();
  if (currentCategory) params.append('category', currentCategory);
  if (currentSearch)   params.append('q', currentSearch);
  if ([...params].length) url += `?${params.toString()}`;

  const products = await getJSON(url);
  displayProducts(products);
}

function displayProducts(products) {
  productList.innerHTML = '';
  if (!products.length) {
    productList.innerHTML = '<p>No products found.</p>';
    return;
  }
  products.forEach(p => productList.appendChild(createProductCard(p)));
}

function createProductCard(p) {
  const col = document.createElement('div');
  col.className = 'col-md-4';

  col.innerHTML = `
    <div class="card h-100">
      <img src="${p.imageUrl}" class="card-img-top" alt="${p.name}"
           onerror="this.src='https://via.placeholder.com/300x200.png?text=No+Image'">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${p.name}</h5>
        <p class="card-text flex-grow-1">${p.description}</p>
        <h6 class="fw-bold">$${p.price.toFixed(2)}</h6>
        <button class="btn btn-primary mt-2" data-id="${p.id}">Add to Cart</button>
      </div>
    </div>`;

  /* attach click → addToCart + toast */
  const btn = col.querySelector('button[data-id]');
  btn.addEventListener('click', () => addToCart(p));

  return col;
}

/* -------------------- CART OPERATIONS ------------------------- */
function addToCart(product) {
  const existing = cart.find(i => i.id === product.id);
  existing ? existing.quantity++ : cart.push({ ...product, quantity: 1 });
  saveCart();

  const msg = `"${product.name}" added to cart`;
  bootstrap.Toast.getOrCreateInstance(showToast(msg)).show();
}

/* Simple toast helper */
function showToast(msg) {
  let toast = document.getElementById('live-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'live-toast';
    toast.className = 'toast position-fixed bottom-0 end-0 m-3';
    toast.innerHTML = `
      <div class="toast-body"></div>`;
    document.body.appendChild(toast);
  }
  toast.querySelector('.toast-body').textContent = msg;
  return toast;
}

/* -------------------- LIVE SEARCH (debounced) ----------------- */
const debounce = (fn, ms = 300) => {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

const clearBtn = document.getElementById('clear-search');

/* show / hide clear button when typing */
searchInput?.addEventListener('input', () => {
  clearBtn.classList.toggle('d-none', searchInput.value.trim() === '');
});

searchInput?.addEventListener('input', debounce(e => {
  currentSearch = e.target.value.trim();
  fetchProducts();
}));

searchInput?.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();                      // stop the form’s reset
    currentSearch = searchInput.value.trim(); // keep typed text
    fetchProducts();                          // refresh grid with same term
  }
});

/* CLEAR BUTTON click = reset search */
clearBtn?.addEventListener('click', () => {
  searchInput.value = '';
  clearBtn.classList.add('d-none');
  currentSearch = '';
  fetchProducts();
});

/* -------------------- INIT ------------------------------ */
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  renderSidebar();
  fetchFeatured();
  loadCategories();
  fetchProducts();
});
