const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
const formatMoney = (value) => `Rs. ${Number(value).toLocaleString("en-IN")}`;

const productGrid = $("#productGrid");
let productCards = $$(".product-card");
const filterStatus = $("#filterStatus");
const searchInput = $("#siteSearch");
const sortSelect = $("#sortProducts");
const cartButton = $("#cartButton");
const closeCart = $("#closeCart");
const cartDrawer = $("#cartDrawer");
const cartLines = $("#cartLines");
const cartCount = $("#cartCount");
const cartTotal = $("#cartTotal");
const deliveryNote = $("#deliveryNote");
const checkoutButton = $("#checkoutButton");
const checkoutModal = $("#checkoutModal");
const closeCheckout = $("#closeCheckout");
const checkoutSummary = $("#checkoutSummary");
const checkoutMessage = $("#checkoutMessage");
const loginButton = $("#loginButton");
const accountModal = $("#accountModal");
const closeAccount = $("#closeAccount");
const accountMessage = $("#accountMessage");
const productModal = $("#productModal");
const closeProduct = $("#closeProduct");
const detailTitle = $("#detailTitle");
const detailImage = $("#detailImage");
const detailBadge = $("#detailBadge");
const detailRating = $("#detailRating");
const detailDescription = $("#detailDescription");
const detailPrice = $("#detailPrice");
const detailMrp = $("#detailMrp");
const detailDelivery = $("#detailDelivery");
const detailSpecs = $("#detailSpecs");
const detailAddCart = $("#detailAddCart");
const detailBuyNow = $("#detailBuyNow");
const cartPageLines = $("#cartPageLines");
const cartPageTotal = $("#cartPageTotal");
const cartPageEmpty = $("#cartPageEmpty");
const checkoutPageSummary = $("#checkoutPageSummary");
const checkoutPageForm = $("#checkoutPageForm");
const checkoutPageMessage = $("#checkoutPageMessage");
const accountPageForm = $("#accountPageForm");
const accountPageMessage = $("#accountPageMessage");
const trackOrderForm = $("#trackOrderForm");
const trackOrderMessage = $("#trackOrderMessage");
const trackingResult = $("#trackingResult");
const adminSearch = $("#adminSearch");
const adminSearchShell = $(".admin-search");
const adminNav = $('nav[aria-label="Admin navigation"]');
const adminAuth = $("#adminAuth");
const adminDashboard = $("#adminDashboard");
const adminLoginForm = $("#adminLoginForm");
const adminAuthMessage = $("#adminAuthMessage");
const adminLogoutButton = $("#adminLogoutButton");
const adminOrdersTable = $("#adminOrdersTable");
const refreshOrdersButton = $("#refreshOrdersButton");
const addStockButton = $("#addStockButton");
const assignCallbackButton = $("#assignCallbackButton");
const adminActionMessage = $("#adminActionMessage");
const productAdminForm = $("#productAdminForm");
const productAdminTable = $("#productAdminTable");
const productAdminMessage = $("#productAdminMessage");
const clearProductForm = $("#clearProductForm");
const resetProductForm = $("#resetProductForm");
const productImagePreview = $("#productImagePreview");
const brandButtons = $$(".brand-row button[data-brand], .brand-filter button[data-brand]");

let activeFilter = "all";
let activeBrand = "";
let activeSlide = 0;
let latestAdminOrders = [];
const ADMIN_PRODUCTS_KEY = "dentalFactoryAdminProducts";
const PRODUCTS_API = "/api/products";
const ORDERS_API = "/api/orders";
const ORDER_TRACK_API = "/api/orders/track";
const ACCOUNTS_API = "/api/accounts";
const ADMIN_SESSION_API = "/api/admin/session";
const ADMIN_LOGIN_API = "/api/admin/login";
const ADMIN_LOGOUT_API = "/api/admin/logout";
const CUSTOMER_ACCOUNT_KEY = "dentalFactoryCustomerAccount";

const productDetails = {
  "Airotor Elite Handpiece": {
    badge: "18% off",
    brand: "Waldent",
    price: 1899,
    mrp: 2299,
    rating: "4.7",
    image: "assets/air-rotor.png",
    alt: "Airotor Elite Handpiece",
    description: "Push button cartridge, clean spray, ceramic bearings for daily restorative procedures.",
    delivery: "Dispatch today from Delhi warehouse",
    specs: {
      Brand: "Waldent-style",
      Type: "Push button",
      Warranty: "6 months",
      Pack: "1 handpiece",
    },
  },
  "Universal Composite Syringe Kit": {
    badge: "Free applicators",
    brand: "3M ESPE",
    price: 1249,
    mrp: 1650,
    rating: "4.8",
    image: "assets/composite-kit.png",
    alt: "Universal Composite Syringe Kit",
    description: "Microhybrid restorative shades for daily anterior and posterior work.",
    delivery: "Ships with shade guide and applicator tips",
    specs: {
      Shades: "A1, A2, A3",
      Material: "Microhybrid",
      Use: "Anterior/posterior",
      Pack: "4 syringes",
    },
  },
  "Endomotor X2 With Apex Mode": {
    badge: "Clinic pick",
    brand: "Woodpecker",
    price: 7999,
    mrp: 9450,
    rating: "4.6",
    image: "assets/endomotor.png",
    alt: "Endomotor X2 With Apex Mode",
    description: "Programmable torque, auto reverse, memory presets, and apex mode for endodontic workflows.",
    delivery: "Priority dispatch with setup callback",
    specs: {
      Modes: "Auto reverse",
      Battery: "Rechargeable",
      Memory: "9 presets",
      Warranty: "1 year",
    },
  },
  "Class B Autoclave 18L": {
    badge: "Installation support",
    brand: "Waldent",
    price: 42999,
    mrp: 49999,
    rating: "4.5",
    image: "assets/autoclave.png",
    alt: "Class B Autoclave 18L",
    description: "Pre-vacuum cycles, printer-ready operation, tray set, and installation callback.",
    delivery: "Delivery and installation callback included",
    specs: {
      Capacity: "18 litres",
      Cycle: "Pre-vacuum",
      Trays: "3 included",
      Warranty: "1 year",
    },
  },
  "Implant Prosthetic Driver Kit": {
    badge: "New",
    brand: "Dentsply",
    price: 3499,
    mrp: 4200,
    rating: "4.4",
    image: "assets/implant-kit.png",
    alt: "Implant Prosthetic Driver Kit",
    description: "Hex drivers and torque adapters organized for chairside implant prosthetics.",
    delivery: "Ships in protective organizer case",
    specs: {
      Drivers: "Hex set",
      Torque: "Adapter ready",
      Material: "Stainless steel",
      Pack: "Complete kit",
    },
  },
  "Orthodontic Bracket Starter Kit": {
    badge: "Value pack",
    brand: "Orthometric",
    price: 999,
    mrp: 1360,
    rating: "4.3",
    image: "assets/bracket-kit.png",
    alt: "Orthodontic Bracket Starter Kit",
    description: "Roth slot assortment with tubes, hooks, and labelled storage.",
    delivery: "Usually dispatched in 24 hours",
    specs: {
      Slot: "Roth",
      Contents: "Brackets + tubes",
      Cases: "Upper/lower",
      Pack: "Starter kit",
    },
  },
  "Alginate Impression Material Pack": {
    badge: "Bundle",
    brand: "GC",
    price: 699,
    mrp: 920,
    rating: "4.2",
    image: "assets/impression-kit.png",
    alt: "Alginate Impression Material Pack",
    description: "Fast set powder, measuring scoop, and tray adhesive sample.",
    delivery: "Ships with scoop and adhesive sample",
    specs: {
      Setting: "Fast set",
      Flavor: "Mint",
      Use: "Primary impressions",
      Pack: "1 pouch",
    },
  },
  "Clinic Chair Unit": {
    badge: "Quote assist",
    brand: "Waldent",
    price: 149999,
    mrp: 168000,
    rating: "4.6",
    image: "assets/clinic-chair.png",
    alt: "Clinic Chair Unit",
    description: "Delivery, installation callback, and accessory checklist for new clinic setup.",
    delivery: "Quote callback before dispatch",
    specs: {
      Setup: "Single chair",
      Support: "Installation",
      Accessories: "Checklist included",
      Warranty: "1 year",
    },
  },
  "Apex Locator Pro": {
    badge: "Hot deal",
    brand: "Woodpecker",
    price: 5199,
    mrp: 6250,
    rating: "4.5",
    image: "assets/endomotor.png",
    alt: "Apex Locator Pro",
    description: "Compact apex measurement unit with clear chairside display.",
    delivery: "Ships with file clip and lip hook set",
    specs: {
      Brand: "Woodpecker",
      Display: "Color indicator",
      Mode: "Apex tracking",
      Warranty: "6 months",
    },
  },
  "LED Curing Light": {
    badge: "Free shield",
    brand: "NSK",
    price: 2899,
    mrp: 3600,
    rating: "4.4",
    image: "assets/composite-kit.png",
    alt: "LED Curing Light",
    description: "Fast cure modes, rechargeable body, and protective eye shield.",
    delivery: "Usually dispatched in 24 hours",
    specs: {
      Brand: "NSK",
      Modes: "Fast and ramp",
      Battery: "Rechargeable",
      Pack: "Light + shield",
    },
  },
  "Disposable Dental Bibs Pack": {
    badge: "Bulk saver",
    brand: "GC",
    price: 349,
    mrp: 520,
    rating: "4.1",
    image: "assets/impression-kit.png",
    alt: "Disposable Dental Bibs Pack",
    description: "Water-resistant patient bibs for daily operatory turnover.",
    delivery: "Ships in protective carton for clinic storage",
    specs: {
      Brand: "GC",
      Layers: "2 ply + film",
      Use: "Patient protection",
      Pack: "100 pieces",
    },
  },
  "Surgical Suture Starter Set": {
    badge: "Starter set",
    brand: "Dentsply",
    price: 1199,
    mrp: 1540,
    rating: "4.3",
    image: "assets/implant-kit.png",
    alt: "Surgical Suture Starter Set",
    description: "Assorted sterile sutures for implant and minor surgery cases.",
    delivery: "Sterile pack dispatch with invoice copy",
    specs: {
      Brand: "Dentsply",
      Type: "Assorted sutures",
      Use: "Surgery and implants",
      Pack: "Starter set",
    },
  },
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[char];
  });
}

function normalizeAdminProduct(product) {
  return {
    name: String(product.name || "").trim(),
    brand: String(product.brand || "Dental Factory").trim(),
    category: String(product.category || "Equipment").trim(),
    price: Number(product.price || 0),
    mrp: Number(product.mrp || product.price || 0),
    stock: Number(product.stock || 0),
    description: String(product.description || "Factory-direct dental product.").trim(),
    image: String(product.image || "assets/hero-dental-shop.png").trim(),
    rating: String(product.rating || "4.5"),
    badge: String(product.badge || "Admin added"),
    delivery: String(product.delivery || "Dispatch estimate available after pincode.").trim(),
  };
}

function loadAdminProducts() {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY) || "[]")
      .map(normalizeAdminProduct)
      .filter((product) => product.name);
  } catch {
    return [];
  }
}

function saveAdminProducts(products) {
  localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(products.map(normalizeAdminProduct).filter((product) => product.name)));
}

async function apiJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }
  if (!response.ok) {
    throw new Error(payload.error || response.statusText || "API request failed");
  }
  return payload;
}

async function fetchBackendProducts() {
  try {
    const products = await apiJson(PRODUCTS_API);
    if (!Array.isArray(products)) return null;
    return products.map(normalizeAdminProduct).filter((product) => product.name);
  } catch {
    return null;
  }
}

async function saveBackendProduct(product, editing = "") {
  return apiJson(PRODUCTS_API, {
    method: "POST",
    body: JSON.stringify({ editing, product: normalizeAdminProduct(product) }),
  });
}

async function deleteBackendProduct(name) {
  return apiJson(`${PRODUCTS_API}/${encodeURIComponent(name)}`, {
    method: "DELETE",
  });
}

function cartItemsForBackend() {
  return Array.from(cart, ([name, item]) => ({
    name,
    price: item.price,
    qty: item.qty,
  }));
}

function checkoutCustomerFromForm(form) {
  const formData = new FormData(form);
  return {
    name: String(formData.get("name") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    address: String(formData.get("address") || "").trim(),
    payment: String(formData.get("payment") || "").trim(),
  };
}

async function saveBackendOrder(customer) {
  return apiJson(ORDERS_API, {
    method: "POST",
    body: JSON.stringify({
      customer,
      items: cartItemsForBackend(),
      total: getCartTotal(),
    }),
  });
}

function accountFromForm(form) {
  const formData = new FormData(form);
  return {
    mobile: String(formData.get("mobile") || "").replace(/\D/g, ""),
    clinic: String(formData.get("clinic") || "").trim(),
    type: String(formData.get("type") || "dentist"),
  };
}

async function saveBackendAccount(account) {
  return apiJson(ACCOUNTS_API, {
    method: "POST",
    body: JSON.stringify({ account }),
  });
}

function loadCustomerAccount() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOMER_ACCOUNT_KEY) || "null");
  } catch {
    return null;
  }
}

function saveCustomerAccount(account) {
  localStorage.setItem(CUSTOMER_ACCOUNT_KEY, JSON.stringify(account));
}

function updateAccountButtons() {
  const account = loadCustomerAccount();
  if (!account?.clinic) return;
  $$("[id='loginButton']").forEach((button) => {
    const label = button.querySelector("span");
    if (label) label.textContent = "Account";
    button.setAttribute("aria-label", `${account.clinic} account`);
  });
}

async function fetchBackendOrders() {
  return apiJson(ORDERS_API);
}

async function trackBackendOrder(query) {
  return apiJson(`${ORDER_TRACK_API}?query=${encodeURIComponent(query)}`);
}

async function getAdminSession() {
  try {
    return await apiJson(ADMIN_SESSION_API);
  } catch {
    return { authenticated: false };
  }
}

async function loginAdmin(password) {
  return apiJson(ADMIN_LOGIN_API, {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

async function logoutAdmin() {
  return apiJson(ADMIN_LOGOUT_API, { method: "POST" });
}

function getCatalogProduct(name) {
  const adminProduct = loadAdminProducts().find((product) => product.name === name);
  return adminProduct || productDetails[name] || {};
}

function refreshProductCards() {
  productCards = $$(".product-card");
}

function searchParams() {
  return new URLSearchParams(window.location.search);
}

function searchProducts(term) {
  const query = String(term || "").trim();
  if (!query) return;
  if (!productGrid) {
    window.location.href = `products.html?search=${encodeURIComponent(query)}`;
    return;
  }
  if (searchInput) searchInput.value = query;
  applyFilter(activeFilter);
  productGrid.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showCatalogResults() {
  const target = $(".catalog-results") || productGrid || $("#products");
  target?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("dentalFactoryCart") || "[]");
    return new Map(
      saved
        .filter((item) => item && item.name && Number(item.qty) > 0)
        .map((item) => [item.name, { price: Number(item.price), qty: Number(item.qty) }])
    );
  } catch {
    return new Map();
  }
}

const cart = loadCart();

function saveCart() {
  localStorage.setItem(
    "dentalFactoryCart",
    JSON.stringify(Array.from(cart, ([name, item]) => ({ name, price: item.price, qty: item.qty })))
  );
}

function setIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function filterLabel(filter) {
  const labels = {
    all: "all products",
    rotary: "rotary instruments",
    restorative: "restoratives",
    endo: "endodontics",
    equipment: "equipment",
    ortho: "orthodontics",
    sterilization: "sterilization",
    implants: "implants",
    deals: "deals and freebies",
    best: "best sellers",
    clinic: "clinic setup",
  };

  return labels[filter] || filter;
}

function getCartCount() {
  let count = 0;
  cart.forEach((item) => {
    count += item.qty;
  });
  return count;
}

function getCartTotal() {
  let total = 0;
  cart.forEach((item) => {
    total += item.price * item.qty;
  });
  return total;
}

function updateCartBadges() {
  const count = getCartCount();
  new Set([cartCount, ...$$("[data-cart-count]")].filter(Boolean)).forEach((badge) => {
    badge.textContent = count;
  });
}

function showToast(message) {
  let toast = $(".cart-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "cart-toast";
    toast.setAttribute("role", "status");
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
}

function renderCartDrawer() {
  if (!cartLines) return;
  cartLines.innerHTML = "";

  if (cart.size === 0) {
    const empty = document.createElement("p");
    empty.textContent = "Your cart is empty.";
    empty.className = "empty-cart";
    cartLines.appendChild(empty);
  }

  cart.forEach((item, name) => {
    const line = document.createElement("div");
    line.className = "cart-line";
    line.innerHTML = `
      <div>
        <strong>${name}</strong>
        <span>${formatMoney(item.price)} each</span>
      </div>
      <div class="qty" aria-label="Quantity for ${name}">
        <button type="button" data-cart-action="decrease" data-product="${name}">-</button>
        <b>${item.qty}</b>
        <button type="button" data-cart-action="increase" data-product="${name}">+</button>
      </div>
    `;
    cartLines.appendChild(line);
  });

  if (cartTotal) {
    cartTotal.textContent = formatMoney(getCartTotal());
  }
}

function renderCartPage() {
  if (!cartPageLines) return;
  cartPageLines.innerHTML = "";
  const isEmpty = cart.size === 0;
  cartPageLines.hidden = isEmpty;
  if (cartPageEmpty) cartPageEmpty.hidden = !isEmpty;

  cart.forEach((item, name) => {
    const product = getCatalogProduct(name);
    const row = document.createElement("article");
    row.className = "cart-page-line";
    row.innerHTML = `
      <img src="${product.image || "assets/hero-dental-shop.png"}" alt="${product.alt || name}" />
      <div>
        <span>${product.brand || "Dental Factory"}</span>
        <h3>${name}</h3>
        <p>${product.delivery || "Dispatch estimate available at checkout."}</p>
      </div>
      <div class="qty" aria-label="Quantity for ${name}">
        <button type="button" data-cart-action="decrease" data-product="${name}">-</button>
        <b>${item.qty}</b>
        <button type="button" data-cart-action="increase" data-product="${name}">+</button>
      </div>
      <strong>${formatMoney(item.price * item.qty)}</strong>
    `;
    cartPageLines.appendChild(row);
  });

  if (cartPageTotal) {
    cartPageTotal.textContent = formatMoney(getCartTotal());
  }
}

function renderSummary(target) {
  if (!target) return;
  target.innerHTML = "";

  if (cart.size === 0) {
    const empty = document.createElement("p");
    empty.textContent = "Your cart is empty.";
    target.appendChild(empty);
    return;
  }

  cart.forEach((item, name) => {
    const row = document.createElement("div");
    row.innerHTML = `<span>${name} x ${item.qty}</span><b>${formatMoney(item.price * item.qty)}</b>`;
    target.appendChild(row);
  });

  const total = document.createElement("strong");
  total.innerHTML = `<span>Total estimate</span><b>${formatMoney(getCartTotal())}</b>`;
  target.appendChild(total);
}

function renderCart() {
  saveCart();
  updateCartBadges();
  renderCartDrawer();
  renderCartPage();
  renderSummary(checkoutPageSummary);
}

function addToCart(name, price, options = {}) {
  const existing = cart.get(name) || { price: Number(price), qty: 0 };
  existing.price = Number(price);
  existing.qty += 1;
  cart.set(name, existing);
  renderCart();

  if (options.open !== false && cartDrawer) {
    openCart();
  } else {
    showToast(`${name} added to cart.`);
  }
}

function updateCartQuantity(name, delta) {
  const item = cart.get(name);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart.delete(name);
  }
  renderCart();
}

function openCart() {
  if (!cartDrawer) return;
  cartDrawer.classList.add("is-open");
  cartDrawer.setAttribute("aria-hidden", "false");
}

function hideCart() {
  if (!cartDrawer) return;
  cartDrawer.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

function openCheckout() {
  if (cart.size === 0) {
    if (deliveryNote) deliveryNote.textContent = "Add at least one product before checkout.";
    if (cartDrawer) openCart();
    showToast("Add at least one product before checkout.");
    return;
  }

  if (!checkoutModal) {
    window.location.href = "checkout.html";
    return;
  }

  renderSummary(checkoutSummary);
  if (checkoutMessage) checkoutMessage.textContent = "";
  checkoutModal.classList.add("is-open");
  checkoutModal.setAttribute("aria-hidden", "false");
}

function hideCheckout() {
  if (!checkoutModal) return;
  checkoutModal.classList.remove("is-open");
  checkoutModal.setAttribute("aria-hidden", "true");
}

function productFromCard(name) {
  const card = productCards.find((item) => item.dataset.name === name);
  const detail = getCatalogProduct(name);
  if (!card) return Object.keys(detail).length ? { name, ...detail } : null;

  return {
    name,
    price: Number(card.dataset.price),
    rating: card.dataset.rating,
    brand: card.dataset.brand,
    image: card.querySelector("img")?.getAttribute("src") || detail.image,
    alt: card.querySelector("img")?.getAttribute("alt") || detail.alt,
    description: card.querySelector("p")?.textContent.trim() || detail.description,
    orders: card.querySelector(".rating span")?.textContent.trim() || "Popular item",
    ...detail,
  };
}

function openProductDetails(name) {
  if (!productModal) {
    window.location.href = "product-detail.html";
    return;
  }

  const product = productFromCard(name);
  if (!product) return;

  detailTitle.textContent = name;
  detailImage.src = product.image;
  detailImage.alt = product.alt || name;
  detailBadge.textContent = product.badge || "Best seller";
  detailRating.innerHTML = `<i data-lucide="star"></i> ${product.rating || "4.5"} <span>${product.orders || product.brand || ""}</span>`;
  detailDescription.textContent = product.description || "Clinic-friendly dental supply with purchase support.";
  detailPrice.textContent = formatMoney(product.price);
  detailMrp.textContent = product.mrp ? formatMoney(product.mrp) : "";
  detailDelivery.textContent = product.delivery || "Usually dispatched in 24 hours";
  detailAddCart.dataset.product = name;
  detailAddCart.dataset.price = String(product.price);
  detailBuyNow.dataset.product = name;
  detailBuyNow.dataset.price = String(product.price);

  detailSpecs.innerHTML = "";
  Object.entries(product.specs || {}).forEach(([label, value]) => {
    const spec = document.createElement("div");
    spec.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    detailSpecs.appendChild(spec);
  });

  productModal.classList.add("is-open");
  productModal.setAttribute("aria-hidden", "false");
  setIcons();
}

function hideProductDetails() {
  if (!productModal) return;
  productModal.classList.remove("is-open");
  productModal.setAttribute("aria-hidden", "true");
}

function openAccount(event) {
  if (!accountModal) return;
  event?.preventDefault();
  if (accountMessage) accountMessage.textContent = "";
  accountModal.classList.add("is-open");
  accountModal.setAttribute("aria-hidden", "false");
}

function hideAccount() {
  if (!accountModal) return;
  accountModal.classList.remove("is-open");
  accountModal.setAttribute("aria-hidden", "true");
}

function showSlide(index) {
  const slides = $$(".promo-slide");
  if (slides.length === 0) return;
  activeSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === activeSlide);
  });
}

function injectDetailButtons() {
  refreshProductCards();
  productCards.forEach((card) => {
    if (card.querySelector(".detail-button")) return;
    const addButton = card.querySelector(".add-cart");
    if (!addButton) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "detail-button";
    button.dataset.product = card.dataset.name;
    button.innerHTML = '<i data-lucide="info"></i> Details';
    addButton.before(button);
  });
}

function setActiveNavPill(button) {
  const nav = button?.closest(".category-nav");
  if (!nav) return;
  nav.querySelectorAll(".nav-pill").forEach((pill) => {
    pill.classList.toggle("is-active", pill === button);
  });
}

function applyFilter(filter = activeFilter) {
  refreshProductCards();
  if (productCards.length === 0) return;
  activeFilter = filter;
  const searchTerm = searchInput?.value.trim().toLowerCase() || "";
  let visibleCount = 0;

  productCards.forEach((card) => {
    const name = card.dataset.name.toLowerCase();
    const category = card.dataset.category.toLowerCase();
    const brand = (card.dataset.brand || "").toLowerCase();
    const matchesFilter = activeFilter === "all" || category.includes(activeFilter);
    const matchesBrand = !activeBrand || brand === activeBrand.toLowerCase();
    const matchesSearch = !searchTerm || name.includes(searchTerm) || category.includes(searchTerm) || brand.includes(searchTerm);
    const isVisible = matchesFilter && matchesBrand && matchesSearch;
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  $$("[data-filter]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === activeFilter);
  });

  if (filterStatus) {
    const resultText = visibleCount === 1 ? "1 product" : `${visibleCount} products`;
    const brandText = activeBrand ? ` from ${activeBrand}` : "";
    filterStatus.textContent = `Showing ${resultText} for ${filterLabel(activeFilter)}${brandText}`;
    filterStatus.classList.add("is-updated");
    window.clearTimeout(filterStatus.updateTimer);
    filterStatus.updateTimer = window.setTimeout(() => filterStatus.classList.remove("is-updated"), 1200);
  }
}

function sortProducts() {
  refreshProductCards();
  if (!sortSelect || !productGrid) return;
  const mode = sortSelect.value;
  const sorted = [...productCards].sort((a, b) => {
    if (mode === "price-low") return Number(a.dataset.price) - Number(b.dataset.price);
    if (mode === "price-high") return Number(b.dataset.price) - Number(a.dataset.price);
    if (mode === "rating") return Number(b.dataset.rating) - Number(a.dataset.rating);
    return productCards.indexOf(a) - productCards.indexOf(b);
  });

  sorted.forEach((card) => productGrid.appendChild(card));
}

function resetAdminProductForm() {
  if (!productAdminForm) return;
  productAdminForm.reset();
  productAdminForm.elements.editing.value = "";
  if (productImagePreview) productImagePreview.src = "assets/hero-dental-shop.png";
  if (productAdminMessage) productAdminMessage.textContent = "Ready to add a new product.";
}

function productRowTemplate(data) {
  return `
    <strong>${escapeHtml(data.name)}<small>${escapeHtml(data.brand)}</small></strong>
    <span>${escapeHtml(data.category)}</span>
    <span>${formatMoney(data.price)}</span>
    <b>${escapeHtml(data.stock)}</b>
    <div class="row-actions">
      <button type="button" data-edit-product>Edit</button>
      <button type="button" data-delete-product>Delete</button>
    </div>
  `;
}

function applyProductRowData(row, data) {
  const product = normalizeAdminProduct(data);
  row.dataset.name = product.name;
  row.dataset.brand = product.brand;
  row.dataset.category = product.category;
  row.dataset.price = product.price;
  row.dataset.mrp = product.mrp;
  row.dataset.stock = product.stock;
  row.dataset.description = product.description;
  row.dataset.image = product.image;
  row.innerHTML = productRowTemplate(product);
}

function adminProductsFromRows() {
  if (!productAdminTable) return [];
  return $$("#productAdminTable .product-admin-row:not(.product-admin-head)").map((row) =>
    normalizeAdminProduct({
      name: row.dataset.name,
      brand: row.dataset.brand,
      category: row.dataset.category,
      price: row.dataset.price,
      mrp: row.dataset.mrp,
      stock: row.dataset.stock,
      description: row.dataset.description,
      image: row.dataset.image,
    })
  );
}

function renderAdminProductRows(products) {
  if (!productAdminTable) return;
  $$("#productAdminTable .product-admin-row:not(.product-admin-head)").forEach((row) => row.remove());
  products.forEach((product) => {
    const row = document.createElement("div");
    row.className = "product-admin-row";
    applyProductRowData(row, product);
    productAdminTable.appendChild(row);
  });
}

function syncLocalAdminProducts(products) {
  saveAdminProducts(products);
  if (productAdminTable) {
    renderAdminProductRows(products);
  }
  renderAdminProductsOnStorefront();
  injectDetailButtons();
  setIcons();
  applyFilter(activeFilter);
  renderCart();
  renderAdminMetrics(latestAdminOrders);
}

function hydrateAdminProducts() {
  if (!productAdminTable) return;
  const savedProducts = loadAdminProducts();
  if (savedProducts.length) {
    renderAdminProductRows(savedProducts);
    return;
  }
  saveAdminProducts(adminProductsFromRows());
}

async function syncProductsFromBackend() {
  const backendProducts = await fetchBackendProducts();
  if (!backendProducts) return;
  syncLocalAdminProducts(backendProducts);
}

function productCardTemplate(product) {
  return `
    <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" />
    <div class="product-meta">
      <span class="badge">${escapeHtml(product.badge)}</span>
      <h3>${escapeHtml(product.name)}</h3>
      <p>${escapeHtml(product.description)}</p>
      <div class="rating"><i data-lucide="star"></i> ${escapeHtml(product.rating)} <span>${escapeHtml(product.stock)} in stock</span></div>
      <div class="price-row">
        <strong>${formatMoney(product.price)}</strong>
        <small>${formatMoney(product.mrp)}</small>
      </div>
      <button class="add-cart" type="button" data-product="${escapeHtml(product.name)}" data-price="${escapeHtml(product.price)}">
        <i data-lucide="shopping-bag"></i> Add
      </button>
    </div>
  `;
}

function applyProductCardData(card, product) {
  card.dataset.name = product.name;
  card.dataset.brand = product.brand;
  card.dataset.category = `${product.category.toLowerCase()} deals best`;
  card.dataset.price = product.price;
  card.dataset.rating = product.rating;
  card.innerHTML = productCardTemplate(product);
}

function renderAdminProductsOnStorefront() {
  if (!productGrid) return;
  const products = loadAdminProducts();
  if (!products.length) return;
  const productNames = new Set(products.map((product) => product.name));
  productCards.forEach((card) => {
    if (!productNames.has(card.dataset.name)) {
      card.remove();
    }
  });
  refreshProductCards();
  products.forEach((product) => {
    const existing = productCards.find((card) => card.dataset.name === product.name);
    if (existing) {
      applyProductCardData(existing, product);
      return;
    }
    const card = document.createElement("article");
    card.className = "product-card";
    applyProductCardData(card, product);
    productGrid.appendChild(card);
  });
  refreshProductCards();
}

function formatDateTime(value) {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function orderItemSummary(order) {
  const items = Array.isArray(order.items) ? order.items : [];
  if (!items.length) return "No items saved";
  return items.map((item) => `${item.name} x ${item.qty}`).join(", ");
}

function setAdminMetric(name, value) {
  $$(`[data-admin-metric="${name}"]`).forEach((node) => {
    node.textContent = value;
  });
}

function renderAdminMetrics(orders = latestAdminOrders) {
  if (!adminDashboard) return;
  const products = loadAdminProducts();
  const today = new Date().toDateString();
  const todayOrders = orders.filter((order) => new Date(order.createdAt).toDateString() === today).length;
  const callbackOrders = orders.filter((order) => !/delivered|cancelled/i.test(order.status || "")).length;
  const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const lowStock = products.filter((product) => Number(product.stock) <= 20).length;

  setAdminMetric("todayOrders", String(todayOrders));
  setAdminMetric("callbackOrders", `${callbackOrders} awaiting callback`);
  setAdminMetric("revenue", formatMoney(revenue));
  setAdminMetric("lowStock", String(lowStock));
  setAdminMetric("catalog", String(products.length));
}

function renderAdminOrders(orders = []) {
  if (!adminOrdersTable) return;
  adminOrdersTable.innerHTML = "";
  latestAdminOrders = orders;

  if (!orders.length) {
    adminOrdersTable.innerHTML = "<div><strong>No orders yet</strong><span>Checkout requests will appear here.</span><b>Waiting</b></div>";
    renderAdminMetrics(orders);
    return;
  }

  orders.forEach((order) => {
    const row = document.createElement("div");
    row.innerHTML = `
      <strong>${escapeHtml(order.id)}</strong>
      <span>${escapeHtml(order.customer?.name || "Customer")} - ${escapeHtml(orderItemSummary(order))}<small>${escapeHtml(order.customer?.phone || "")} | ${escapeHtml(formatDateTime(order.createdAt))}</small></span>
      <b>${escapeHtml(order.status || "Request received")}</b>
    `;
    adminOrdersTable.appendChild(row);
  });
  renderAdminMetrics(orders);
}

async function refreshAdminOrders() {
  if (!adminOrdersTable) return;
  adminOrdersTable.innerHTML = "<div><strong>Loading orders</strong><span>Reading backend requests...</span><b>Sync</b></div>";
  try {
    const orders = await fetchBackendOrders();
    renderAdminOrders(Array.isArray(orders) ? orders : []);
  } catch (error) {
    adminOrdersTable.innerHTML = `<div><strong>Login required</strong><span>${escapeHtml(error.message)}</span><b>Locked</b></div>`;
  }
}

function renderTrackingResult(order) {
  if (!trackingResult) return;
  const status = order.status || "Request received";
  const steps = ["Request received", "Procurement callback", "Packing in warehouse", "Out for delivery"];
  const activeIndex = Math.max(0, steps.findIndex((step) => step.toLowerCase() === status.toLowerCase()));
  trackingResult.innerHTML = `
    <div class="tracking-head">
      <span class="badge">${escapeHtml(status)}</span>
      <h2>${escapeHtml(order.id)}</h2>
      <p>${escapeHtml(orderItemSummary(order))}</p>
      <p>${escapeHtml(order.customer?.name || "Customer")} | ${escapeHtml(formatDateTime(order.createdAt))}</p>
    </div>
    <div class="status-timeline">
      ${steps
        .map((step, index) => {
          const className = index < activeIndex ? "is-done" : index === activeIndex ? "is-active" : "";
          return `<div class="${className}"><span></span><div><strong>${escapeHtml(step)}</strong><p>${index <= activeIndex ? "Completed or in progress." : "Will update after callback."}</p></div></div>`;
        })
        .join("")}
    </div>
  `;
  trackingResult.classList.add("is-highlighted");
}

function setAdminUnlocked(isUnlocked) {
  if (adminAuth) adminAuth.hidden = isUnlocked;
  if (adminDashboard) adminDashboard.hidden = !isUnlocked;
  if (adminLogoutButton) adminLogoutButton.hidden = !isUnlocked;
  if (adminSearchShell) adminSearchShell.hidden = !isUnlocked;
  if (adminNav) adminNav.hidden = !isUnlocked;
}

async function initAdminAuth() {
  if (!adminAuth && !adminDashboard) return;
  const session = await getAdminSession();
  setAdminUnlocked(Boolean(session.authenticated));
  if (session.authenticated) {
    await refreshAdminOrders();
  } else if (adminAuthMessage) {
    adminAuthMessage.textContent = "Admin password required before product and order management.";
  }
}

document.addEventListener("click", async (event) => {
  const navHashLink = event.target.closest(".category-nav .nav-pill[href^='#']");
  if (navHashLink) {
    setActiveNavPill(navHashLink);
  }

  const filterButton = event.target.closest("[data-filter]");
  if (filterButton) {
    applyFilter(filterButton.dataset.filter);
    if (filterButton.classList.contains("nav-pill")) {
      setActiveNavPill(filterButton);
    }
    if (filterButton.closest(".filter-panel") || filterButton.closest(".category-rail")) {
      window.setTimeout(showCatalogResults, 80);
    }
    const shouldScroll =
      filterButton.closest(".category-nav") ||
      filterButton.closest(".category-rail") ||
      filterButton.closest(".category-card") ||
      filterButton.closest(".deal-grid") ||
      filterButton.closest(".event-card");
    if (shouldScroll) {
      const productsSection = $("#products");
      if (productsSection) productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.location.href = "products.html";
    }
  }

  const brandButton = event.target.closest(".brand-row button[data-brand], .brand-filter button[data-brand]");
  if (brandButton) {
    activeBrand = activeBrand === brandButton.dataset.brand ? "" : brandButton.dataset.brand;
    brandButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.brand === activeBrand));
    applyFilter(activeFilter);
    $("#products")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const detailButton = event.target.closest(".detail-button");
  if (detailButton) {
    openProductDetails(detailButton.dataset.product);
  }

  const galleryButton = event.target.closest(".thumbnail-row button");
  if (galleryButton) {
    const mainImage = $("[data-gallery-main]") || $(".detail-gallery > img");
    const thumb = galleryButton.querySelector("img");
    if (mainImage && thumb) {
      mainImage.src = thumb.getAttribute("src");
      mainImage.alt = galleryButton.getAttribute("aria-label") || mainImage.alt;
      $$(".thumbnail-row button").forEach((button) => button.classList.toggle("is-active", button === galleryButton));
    }
  }

  const addButton = event.target.closest(".add-cart");
  if (addButton) {
    addToCart(addButton.dataset.product, addButton.dataset.price);
    if (addButton.id === "detailAddCart") hideProductDetails();
  }

  const quantityButton = event.target.closest("button[data-cart-action]");
  if (quantityButton) {
    updateCartQuantity(quantityButton.dataset.product, quantityButton.dataset.cartAction === "increase" ? 1 : -1);
  }

  const buyButton = event.target.closest("[data-buy-now]");
  if (buyButton) {
    addToCart(buyButton.dataset.product, buyButton.dataset.price, { open: false });
    window.location.href = "checkout.html";
  }

  const editProductButton = event.target.closest("[data-edit-product]");
  if (editProductButton && productAdminForm) {
    const row = editProductButton.closest(".product-admin-row");
    productAdminForm.elements.editing.value = row.dataset.name;
    productAdminForm.elements.name.value = row.dataset.name;
    productAdminForm.elements.brand.value = row.dataset.brand;
    productAdminForm.elements.category.value = row.dataset.category;
    productAdminForm.elements.price.value = row.dataset.price;
    productAdminForm.elements.mrp.value = row.dataset.mrp;
    productAdminForm.elements.stock.value = row.dataset.stock;
    productAdminForm.elements.description.value = row.dataset.description;
    productAdminForm.elements.image.value = row.dataset.image;
    if (productImagePreview) productImagePreview.src = row.dataset.image || "assets/hero-dental-shop.png";
    if (productAdminMessage) productAdminMessage.textContent = `Editing ${row.dataset.name}.`;
    productAdminForm.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const deleteProductButton = event.target.closest("[data-delete-product]");
  if (deleteProductButton && productAdminTable) {
    const row = deleteProductButton.closest(".product-admin-row");
    const productName = row?.dataset.name || "Product";
    deleteProductButton.disabled = true;
    if (productAdminMessage) productAdminMessage.textContent = `Deleting ${productName} from backend...`;
    try {
      await deleteBackendProduct(productName);
      syncLocalAdminProducts(loadAdminProducts().filter((product) => product.name !== productName));
      if (productAdminForm?.elements.editing.value === productName) {
        resetAdminProductForm();
      }
      if (productAdminMessage) productAdminMessage.textContent = `${productName} deleted from backend.`;
    } catch (error) {
      deleteProductButton.disabled = false;
      if (productAdminMessage) productAdminMessage.textContent = `Delete failed: ${error.message}. Start the backend server and try again.`;
    }
  }

  const enquiryButton = event.target.closest("[data-open-enquiry]");
  if (enquiryButton && adminActionMessage) {
    const row = enquiryButton.closest(".enquiry-board > div");
    const title = row?.querySelector("strong")?.textContent || "Enquiry";
    const details = row?.querySelector("span")?.textContent || "";
    adminActionMessage.textContent = `${title} opened: ${details}. Call +91 7678541041 to assign this request.`;
  }
});

$$("[data-scroll]").forEach((button) => {
  button.addEventListener("click", () => {
    setActiveNavPill(button);
    const target = $(`#${button.dataset.scroll}`);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.location.href = `index.html#${button.dataset.scroll}`;
  });
});

$$("[data-account]").forEach((button) => {
  button.addEventListener("click", openAccount);
});

if (searchInput) {
  searchInput.addEventListener("input", () => applyFilter(activeFilter));
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      searchProducts(searchInput.value);
    }
  });
}
if (sortSelect) {
  sortSelect.addEventListener("change", () => {
    sortProducts();
    applyFilter(activeFilter);
  });
}

if (cartButton) {
  cartButton.addEventListener("click", (event) => {
    if (!cartDrawer) return;
    event.preventDefault();
    openCart();
  });
}

if (closeCart) closeCart.addEventListener("click", hideCart);
if (checkoutButton) checkoutButton.addEventListener("click", openCheckout);
if (closeCheckout) closeCheckout.addEventListener("click", hideCheckout);
if (loginButton) loginButton.addEventListener("click", openAccount);
if (closeAccount) closeAccount.addEventListener("click", hideAccount);
if (closeProduct) closeProduct.addEventListener("click", hideProductDetails);

if (cartDrawer) {
  cartDrawer.addEventListener("click", (event) => {
    if (event.target === cartDrawer) hideCart();
  });
}

if (checkoutModal) {
  checkoutModal.addEventListener("click", (event) => {
    if (event.target === checkoutModal) hideCheckout();
  });
}

if (productModal) {
  productModal.addEventListener("click", (event) => {
    if (event.target === productModal) hideProductDetails();
  });
}

if (accountModal) {
  accountModal.addEventListener("click", (event) => {
    if (event.target === accountModal) hideAccount();
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  hideCart();
  hideCheckout();
  hideProductDetails();
  hideAccount();
});

if (detailBuyNow) {
  detailBuyNow.addEventListener("click", () => {
    addToCart(detailBuyNow.dataset.product, detailBuyNow.dataset.price, { open: false });
    hideCart();
    hideProductDetails();
    openCheckout();
  });
}

$("#prevSlide")?.addEventListener("click", () => showSlide(activeSlide - 1));
$("#nextSlide")?.addEventListener("click", () => showSlide(activeSlide + 1));
if ($$(".promo-slide").length > 1) {
  setInterval(() => showSlide(activeSlide + 1), 7000);
}

$("#deliveryForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const pin = $("#pincode")?.value.trim() || "";
  if (!/^[0-9]{6}$/.test(pin)) {
    if (deliveryNote) deliveryNote.textContent = "Enter a valid 6 digit pincode.";
    openCart();
    return;
  }
  if (deliveryNote) deliveryNote.textContent = `Delivery to ${pin}: most items arrive in 2-4 business days.`;
  showToast(`Delivery estimate saved for ${pin}.`);
});

$("#suggestForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const product = new FormData(event.currentTarget).get("product");
  $("#suggestMessage").textContent = `${product} has been added to your request list.`;
  event.currentTarget.reset();
});

$(".setup-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  applyFilter("clinic");
  $("#products")?.scrollIntoView({ behavior: "smooth", block: "start" });
});

async function submitCheckoutForm(event, messageNode, summaryNode) {
  event.preventDefault();
  if (cart.size === 0) {
    if (messageNode) messageNode.textContent = "Add at least one product before placing an order.";
    return;
  }

  const form = event.currentTarget;
  const submitButton = form.querySelector("button[type='submit']");
  const customer = checkoutCustomerFromForm(form);
  submitButton.disabled = true;
  if (messageNode) messageNode.textContent = "Saving order request to backend...";

  try {
    const order = await saveBackendOrder(customer);
    if (messageNode) messageNode.textContent = `Thanks ${customer.name}. Order ${order.id} saved for callback.`;
    cart.clear();
    renderCart();
    if (summaryNode) renderSummary(summaryNode);
    form.reset();
  } catch (error) {
    if (messageNode) messageNode.textContent = `Order save failed: ${error.message}. Start the backend server and try again.`;
  } finally {
    submitButton.disabled = false;
  }
}

$("#checkoutForm")?.addEventListener("submit", (event) => submitCheckoutForm(event, checkoutMessage, checkoutSummary));

checkoutPageForm?.addEventListener("submit", (event) => submitCheckoutForm(event, checkoutPageMessage, checkoutPageSummary));

async function submitAccountForm(event, messageNode, closeAfterSave = false) {
  event.preventDefault();
  const form = event.currentTarget;
  const submitButton = form.querySelector("button[type='submit']");
  const account = accountFromForm(form);

  if (account.mobile.length !== 10) {
    if (messageNode) messageNode.textContent = "Enter a valid 10 digit mobile number.";
    return;
  }

  submitButton.disabled = true;
  if (messageNode) messageNode.textContent = "Saving account request...";
  try {
    const savedAccount = await saveBackendAccount(account);
    saveCustomerAccount(savedAccount);
    updateAccountButtons();
    if (messageNode) messageNode.textContent = `${savedAccount.clinic} account request saved. We will verify by phone.`;
    form.reset();
    if (closeAfterSave) window.setTimeout(hideAccount, 900);
  } catch (error) {
    if (messageNode) messageNode.textContent = `Account save failed: ${error.message}`;
  } finally {
    submitButton.disabled = false;
  }
}

$("#accountForm")?.addEventListener("submit", (event) => submitAccountForm(event, accountMessage, true));

accountPageForm?.addEventListener("submit", (event) => submitAccountForm(event, accountPageMessage));

trackOrderForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const order = String(new FormData(event.currentTarget).get("order") || "").trim();
  const submitButton = event.currentTarget.querySelector("button[type='submit']");
  submitButton.disabled = true;
  if (trackOrderMessage) trackOrderMessage.textContent = "Searching backend order records...";
  try {
    const foundOrder = await trackBackendOrder(order);
    renderTrackingResult(foundOrder);
    if (trackOrderMessage) trackOrderMessage.textContent = `Order ${foundOrder.id} found.`;
  } catch (error) {
    if (trackOrderMessage) trackOrderMessage.textContent = `${error.message}. Check order ID or mobile number.`;
  } finally {
    submitButton.disabled = false;
  }
});

adminSearch?.addEventListener("input", () => {
  const term = adminSearch.value.trim().toLowerCase();
  $$(".admin-table > div, .stock-list > div, .enquiry-board > div, .product-admin-row:not(.product-admin-head)").forEach((row) => {
    row.hidden = term && !row.textContent.toLowerCase().includes(term);
  });
});

adminLoginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const password = String(formData.get("password") || "");
  const submitButton = form.querySelector("button[type='submit']");
  submitButton.disabled = true;
  if (adminAuthMessage) adminAuthMessage.textContent = "Checking admin password...";
  try {
    await loginAdmin(password);
    form.reset();
    setAdminUnlocked(true);
    if (adminAuthMessage) adminAuthMessage.textContent = "";
    await syncProductsFromBackend();
    await refreshAdminOrders();
  } catch (error) {
    if (adminAuthMessage) adminAuthMessage.textContent = error.message;
  } finally {
    submitButton.disabled = false;
  }
});

adminLogoutButton?.addEventListener("click", async () => {
  await logoutAdmin();
  setAdminUnlocked(false);
  if (adminAuthMessage) adminAuthMessage.textContent = "Logged out. Enter password to manage admin.";
});

refreshOrdersButton?.addEventListener("click", refreshAdminOrders);

addStockButton?.addEventListener("click", () => {
  $("#products-admin")?.scrollIntoView({ behavior: "smooth", block: "start" });
  if (productAdminMessage) productAdminMessage.textContent = "Edit a product stock quantity, then press Save product.";
  productAdminForm?.elements.stock?.focus();
});

assignCallbackButton?.addEventListener("click", () => {
  if (adminActionMessage) adminActionMessage.textContent = "Callback queue ready. Open an enquiry below, then call or WhatsApp the customer.";
  $("#enquiries")?.scrollIntoView({ behavior: "smooth", block: "start" });
});

productAdminForm?.elements.image?.addEventListener("input", () => {
  if (productImagePreview) {
    productImagePreview.src = productAdminForm.elements.image.value.trim() || "assets/hero-dental-shop.png";
  }
});

productAdminForm?.elements.imageUpload?.addEventListener("change", (event) => {
  const file = event.currentTarget.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const imageSource = String(reader.result || "");
    productAdminForm.elements.image.value = imageSource;
    if (productImagePreview) productImagePreview.src = imageSource;
    if (productAdminMessage) productAdminMessage.textContent = `${file.name} loaded as a preview image.`;
  });
  reader.readAsDataURL(file);
});

productAdminForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const data = {
    name: formData.get("name").trim(),
    brand: formData.get("brand").trim(),
    category: formData.get("category"),
    price: Number(formData.get("price")),
    mrp: Number(formData.get("mrp")),
    stock: Number(formData.get("stock")),
    description: formData.get("description").trim(),
    image: formData.get("image").trim() || "assets/hero-dental-shop.png",
  };
  const editing = String(formData.get("editing") || "");
  const submitButton = event.currentTarget.querySelector("button[type='submit']");
  submitButton.disabled = true;
  if (productAdminMessage) productAdminMessage.textContent = `Saving ${data.name} to backend...`;

  try {
    const savedProduct = normalizeAdminProduct(await saveBackendProduct(data, editing));
    const products = loadAdminProducts();
    const existingIndex = products.findIndex((product) => product.name === editing || product.name === savedProduct.name);
    if (existingIndex >= 0) {
      products[existingIndex] = savedProduct;
    } else {
      products.push(savedProduct);
    }
    syncLocalAdminProducts(products);
    productAdminForm.elements.editing.value = savedProduct.name;
    if (productAdminMessage) productAdminMessage.textContent = `${savedProduct.name} saved to backend.`;
  } catch (error) {
    if (productAdminMessage) productAdminMessage.textContent = `Product save failed: ${error.message}. Start the backend server and try again.`;
  } finally {
    submitButton.disabled = false;
  }
});

clearProductForm?.addEventListener("click", resetAdminProductForm);
resetProductForm?.addEventListener("click", resetAdminProductForm);

hydrateAdminProducts();
renderAdminProductsOnStorefront();
injectDetailButtons();
setIcons();
renderCart();
updateAccountButtons();
const initialSearch = searchParams().get("search");
if (initialSearch && searchInput) searchInput.value = initialSearch;
applyFilter("all");
syncProductsFromBackend().then(() => renderAdminMetrics(latestAdminOrders));
initAdminAuth();
