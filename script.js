const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
const formatMoney = (value) => `Rs. ${Number(value).toLocaleString("en-IN")}`;
const slugifyProduct = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

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
const deliveryForm = $("#deliveryForm");
const pincodeInput = $("#pincode");
const checkoutButton = $("#checkoutButton");
const checkoutModal = $("#checkoutModal");
const closeCheckout = $("#closeCheckout");
const checkoutSummary = $("#checkoutSummary");
const checkoutMessage = $("#checkoutMessage");
const loginButton = $("#loginButton");
let accountModal = $("#accountModal");
let closeAccount = $("#closeAccount");
let accountMessage = $("#accountMessage");
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
const pageDetailTitle = $("#pageDetailTitle");
const pageDetailImage = $("#pageDetailImage");
const pageDetailBadge = $("#pageDetailBadge");
const pageDetailDescription = $("#pageDetailDescription");
const pageDetailRating = $("#pageDetailRating");
const pageDetailPrice = $("#pageDetailPrice");
const pageDetailMrp = $("#pageDetailMrp");
const pageDetailDiscount = $("#pageDetailDiscount");
const pageDetailDelivery = $("#pageDetailDelivery");
const pageDetailSpecs = $("#pageDetailSpecs");
const pageDetailAddCart = $("#pageDetailAddCart");
const pageDetailThumbs = $("#pageDetailThumbs");
const detailBreadcrumbCurrent = $("#detailBreadcrumbCurrent");
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
const membershipAction = $("#membershipAction");
const adminSearch = $("#adminSearch");
const adminSearchShell = $(".admin-search");
const adminNav = $('nav[aria-label="Admin navigation"]');
const adminAuth = $("#adminAuth");
const adminDashboard = $("#adminDashboard");
const adminLoginForm = $("#adminLoginForm");
const adminAuthMessage = $("#adminAuthMessage");
const adminLogoutButton = $("#adminLogoutButton");
const adminOrdersTable = $("#adminOrdersTable");
const adminStorageNotice = $("#adminStorageNotice");
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
const productGalleryPreview = $("#productGalleryPreview");
const brandAdminForm = $("#brandAdminForm");
const brandAdminTable = $("#brandAdminTable");
const brandAdminMessage = $("#brandAdminMessage");
const clearBrandForm = $("#clearBrandForm");
const resetBrandForm = $("#resetBrandForm");
const featuredBrandList = $("#featuredBrandList");
const brandDirectoryGrid = $("#brandDirectoryGrid");
const adAdminForm = $("#adAdminForm");
const adAdminTable = $("#adAdminTable");
const adAdminMessage = $("#adAdminMessage");
const clearAdForm = $("#clearAdForm");
const resetAdForm = $("#resetAdForm");
const adSlots = $$("[data-ad-slot]");
let brandButtons = $$(".brand-row button[data-brand], .brand-filter button[data-brand]");

let activeFilter = "all";
let activeBrand = "";
let activeSlide = 0;
let latestAdminOrders = [];
let adminSessionMinutes = 30;
let adminAutoLogoutTimer = null;
const ADMIN_PRODUCTS_KEY = "dentalFactoryAdminProducts";
const ADMIN_BRANDS_KEY = "dentalFactoryAdminBrands";
const ADMIN_ADS_KEY = "dentalFactoryAdminAds";
const PRODUCTS_API = "/api/products";
const BRANDS_API = "/api/brands";
const ADS_API = "/api/ads";
const ADMIN_ADS_API = "/api/admin/ads";
const ORDERS_API = "/api/orders";
const ORDER_TRACK_API = "/api/orders/track";
const ACCOUNTS_API = "/api/accounts";
const PAYMENT_CONFIG_API = "/api/payments/config";
const RAZORPAY_ORDER_API = "/api/payments/razorpay/order";
const RAZORPAY_VERIFY_API = "/api/payments/razorpay/verify";
const ADMIN_SESSION_API = "/api/admin/session";
const ADMIN_LOGIN_API = "/api/admin/login";
const ADMIN_LOGOUT_API = "/api/admin/logout";
const CUSTOMER_ACCOUNT_KEY = "dentalFactoryCustomerAccount";
const DELIVERY_PIN_KEY = "dentalFactoryDeliveryPin";
const LAST_ORDER_KEY = "dentalFactoryLastOrder";
const CASH_ON_DELIVERY_METHOD = "Cash on delivery";
const PINE_LABS_PAYMENT_METHOD = "Card swipe on delivery (Pine Labs)";
const ONLINE_PAYMENT_METHOD = "Online payment (Razorpay)";
const FREE_SHIPPING_THRESHOLD = 2999;
const STANDARD_SHIPPING_FEE = 99;
const CASH_COD_LIMIT = 20000;
const FREIGHT_CONFIRMATION_LIMIT = 25000;
const ORDER_STATUS_FLOW = ["Request received", "Callback done", "Packed", "Shipped", "Delivered"];
const ORDER_CANCELLED_STATUS = "Cancelled";
const membershipPlans = {
  dentist: "Clinic Plus",
  student: "Student Access",
  dealer: "Dealer Desk",
};
const accountTypeLabels = {
  dentist: "Clinic or doctor name",
  dealer: "Firm name",
  student: "College name",
};
const accountTypeNames = {
  dentist: "Dentist",
  dealer: "Dealer",
  student: "Student",
};
const DEFAULT_HSN = "9018";
const DEFAULT_UNIT = "Pcs";
const DEFAULT_GST_RATE = 18;
let paymentConfig = { razorpayEnabled: false, keyId: "", currency: "INR", businessName: "Dental Factory" };
const businessInfo = {
  brand: "Dental Factory",
  legalName: "Bharti Dent India",
  gstin: "07AYHPS5357F1Z3",
  phone: "+91 7678541041, +91 9818710749",
  email: "bhartidentindia98@gmail.com",
  address: "Plot no. 95, Gali no. 4, near by Nanu Mandir, Kanjhawla Industrial Area, Kanjhawla, Delhi - 110081",
};

const defaultBrands = [
  { name: "D-Tech", description: "Dental materials, composites, cements, and restorative essentials.", featured: true },
  { name: "Waldent", description: "Clinic instruments, equipment, endodontic kits, and daily operatory supplies.", featured: true },
  { name: "NSK", description: "Precision rotary instruments and chairside equipment.", featured: true },
  { name: "Dentsply", description: "Implant, endodontic, and clinical consumable ranges.", featured: true },
  { name: "GC", description: "Restorative, impression, and glass ionomer materials.", featured: true },
  { name: "Woodpecker", description: "Endodontic motors, apex locators, scalers, and curing lights.", featured: true },
  { name: "3M ESPE", description: "Composite, restorative, and bonding materials.", featured: true },
  { name: "Orthometric", description: "Orthodontic brackets, wires, and alignment products.", featured: true },
  { name: "DentalTech", description: "Dental practice essentials and value-focused consumables.", featured: true },
];

const defaultAds = [
  {
    title: "Bulk pricing for restorative materials",
    message: "Mix composites, cements, and endodontic essentials in one order and unlock better clinic pricing.",
    cta: "Shop deals",
    link: "products.html?search=restorative",
    placement: "home-banner",
    active: true,
    priority: 1,
  },
  {
    title: "New clinic setup support",
    message: "Send your equipment list and get callback support for chairs, autoclaves, handpieces, and consumables.",
    cta: "Setup a clinic",
    link: "index.html#clinic-setup",
    placement: "home-banner",
    active: true,
    priority: 2,
  },
  {
    title: "Same day dispatch on clinic essentials",
    message: "Keep fast-moving materials ready with curated dental supplies and quick order support.",
    cta: "View products",
    link: "products.html",
    placement: "home-banner",
    active: true,
    priority: 3,
  },
];

const categoryMenuGroups = [
  { name: "Equipment", search: "equipment", items: ["Dental chairs", "Autoclaves", "RVG sensors", "Compressors", "X-ray units"] },
  { name: "Rotary instruments", search: "rotary", items: ["Airotors", "Contra angle", "Micromotor", "Burs", "Cartridges"] },
  { name: "Restoratives", search: "restorative", items: ["Composites", "Glass ionomer", "Bonding agents", "Cements", "Finishing polishers"] },
  { name: "Endodontics", search: "endo", items: ["Files", "Endomotors", "Apex locators", "Irrigation", "Obturation"] },
  { name: "Orthodontics", search: "ortho", items: ["Brackets", "Wires", "Bands", "Adhesives", "Elastomerics"] },
  { name: "Sterilization", search: "sterilization", items: ["Pouches", "Disinfectants", "Autoclave supplies", "Surface cleaners", "Instrument trays"] },
  { name: "Implants", search: "implants", items: ["Drivers", "Surgical kits", "Sutures", "Bone graft", "Impression copings"] },
];

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

function parseImageList(value) {
  if (Array.isArray(value)) {
    return value.map((image) => String(image || "").trim()).filter(Boolean);
  }
  return String(value || "")
    .split(/\r?\n|,/)
    .map((image) => image.trim())
    .filter(Boolean);
}

function uniqueImages(images) {
  return Array.from(new Set(images.map((image) => String(image || "").trim()).filter(Boolean)));
}

function isInlineImage(value) {
  return String(value || "").startsWith("data:image/");
}

function safeLocalStorageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Uploaded images are persisted by the backend; localStorage only keeps a light fallback.
  }
}

function normalizeProductImages(product) {
  const images = uniqueImages([product.image, ...parseImageList(product.images)]);
  return images.length ? images : ["assets/hero-dental-shop.png"];
}

function normalizeAdminProduct(product) {
  const name = String(product.name || "").trim();
  const specs = product.specs && typeof product.specs === "object" ? product.specs : {};
  const images = normalizeProductImages(product);
  return {
    id: String(product.id || slugifyProduct(name)).trim(),
    name,
    brand: String(product.brand || "Dental Factory").trim(),
    category: String(product.category || "Equipment").trim(),
    price: Number(product.price || 0),
    mrp: Number(product.mrp || product.price || 0),
    stock: Number(product.stock || 0),
    description: String(product.description || "Factory-direct dental product.").trim(),
    image: images[0],
    images,
    rating: String(product.rating || "4.5"),
    badge: String(product.badge || "Admin added"),
    delivery: String(product.delivery || "Dispatch estimate available after pincode.").trim(),
    hsn: String(product.hsn || DEFAULT_HSN).trim(),
    unit: String(product.unit || DEFAULT_UNIT).trim(),
    gstRate: Number(product.gstRate ?? DEFAULT_GST_RATE),
    specs,
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
  const compactProducts = products
    .map(normalizeAdminProduct)
    .filter((product) => product.name)
    .map((product) => ({
      ...product,
      image: isInlineImage(product.image) ? "assets/hero-dental-shop.png" : product.image,
      images: product.images.filter((image) => !isInlineImage(image)),
    }));
  safeLocalStorageSet(ADMIN_PRODUCTS_KEY, compactProducts);
}

function normalizeAd(ad) {
  const title = String(ad.title || "").trim();
  const placement = String(ad.placement || "home-banner").trim();
  return {
    id: String(ad.id || slugifyProduct(`${placement}-${title}`)).trim(),
    title,
    message: String(ad.message || "").trim(),
    image: String(ad.image || "").trim(),
    cta: String(ad.cta || "").trim(),
    link: String(ad.link || "").trim(),
    placement,
    active: ad.active !== false,
    priority: Number(ad.priority || 1),
  };
}

function loadAdminAds() {
  try {
    const stored = JSON.parse(localStorage.getItem(ADMIN_ADS_KEY) || "null");
    if (Array.isArray(stored)) return stored.map(normalizeAd).filter((ad) => ad.title);
  } catch {}
  return [];
}

function saveAdminAds(ads) {
  const compactAds = ads
    .map(normalizeAd)
    .filter((ad) => ad.title)
    .map((ad) => ({ ...ad, image: isInlineImage(ad.image) ? "" : ad.image }));
  safeLocalStorageSet(ADMIN_ADS_KEY, compactAds);
}

async function fetchPublicAds() {
  try {
    const ads = await apiJson(ADS_API);
    if (!Array.isArray(ads)) return null;
    return ads.map(normalizeAd).filter((ad) => ad.title);
  } catch {
    return null;
  }
}

async function fetchBackendAds() {
  try {
    const ads = await apiJson(ADMIN_ADS_API);
    if (!Array.isArray(ads)) return null;
    return ads.map(normalizeAd).filter((ad) => ad.title);
  } catch {
    return null;
  }
}

async function saveBackendAd(ad, editing = "") {
  return apiJson(ADMIN_ADS_API, {
    method: "POST",
    body: JSON.stringify({ editing, ad: normalizeAd(ad) }),
  });
}

async function deleteBackendAd(idOrTitle) {
  return apiJson(`${ADMIN_ADS_API}/${encodeURIComponent(idOrTitle)}`, {
    method: "DELETE",
  });
}

function adPlacementLabel(placement) {
  const labels = {
    "home-banner": "Home page banner",
    "products-top": "Products page top",
  };
  return labels[placement] || placement || "Home page banner";
}

function adSlideTemplate(ad) {
  const hasMedia = Boolean(ad.image);
  const hasAction = Boolean(ad.cta && ad.link);
  return `
    <div class="promo-slide ad-slide${hasMedia ? " has-media" : ""}">
      <div class="promo-copy">
        <span class="eyebrow">Ad</span>
        <h2>${escapeHtml(ad.title)}</h2>
        <p>${escapeHtml(ad.message)}</p>
        ${hasAction ? `<div class="promo-actions"><a class="primary-link" href="${escapeHtml(ad.link)}">${escapeHtml(ad.cta)}</a></div>` : ""}
      </div>
      ${hasMedia ? `<div class="promo-media"><img src="${escapeHtml(ad.image)}" alt="${escapeHtml(ad.title)} banner" /></div>` : ""}
    </div>
  `;
}

function startAdSlider(slot) {
  if (slot.adTimer) window.clearInterval(slot.adTimer);
  const slides = Array.from(slot.querySelectorAll(".promo-slide"));
  let index = 0;
  const show = (nextIndex) => {
    if (!slides.length) return;
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex === index));
  };
  show(0);
  if (slides.length > 1) {
    slot.adTimer = window.setInterval(() => show(index + 1), 5000);
  }
}

function renderAdsOnStorefront(ads = []) {
  if (!adSlots.length) return;
  const activeAds = ads
    .map(normalizeAd)
    .filter((ad) => ad.active && ad.title)
    .sort((a, b) => a.priority - b.priority);

  adSlots.forEach((slot) => {
    const placement = slot.dataset.adSlot || "home-banner";
    const slotAds = activeAds.filter((ad) => ad.placement === placement);
    if (!slotAds.length) {
      if (slot.adTimer) window.clearInterval(slot.adTimer);
      slot.innerHTML = "";
      slot.hidden = true;
      slot.dataset.adDynamic = "true";
      return;
    }
    if (slot.adTimer) window.clearInterval(slot.adTimer);
    slot.hidden = false;
    slot.dataset.adDynamic = "true";
    slot.innerHTML = slotAds.map(adSlideTemplate).join("");
    startAdSlider(slot);
  });
  setIcons();
}

function adRowTemplate(ad) {
  return `
    <strong>${escapeHtml(ad.title)}<small>${escapeHtml(ad.message)}</small></strong>
    <span>${escapeHtml(adPlacementLabel(ad.placement))}</span>
    <b>${ad.active ? "Active" : "Paused"}</b>
    <div class="row-actions">
      <button type="button" data-edit-ad>Edit</button>
      <button type="button" data-delete-ad>Delete</button>
    </div>
  `;
}

function applyAdRowData(row, data) {
  const ad = normalizeAd(data);
  row.dataset.id = ad.id;
  row.dataset.title = ad.title;
  row.dataset.message = ad.message;
  row.dataset.image = ad.image;
  row.dataset.cta = ad.cta;
  row.dataset.link = ad.link;
  row.dataset.placement = ad.placement;
  row.dataset.active = String(ad.active);
  row.dataset.priority = ad.priority;
  row.innerHTML = adRowTemplate(ad);
}

function renderAdminAdRows(ads) {
  if (!adAdminTable) return;
  $$("#adAdminTable .ad-admin-row:not(.ad-admin-head)").forEach((row) => row.remove());
  ads
    .map(normalizeAd)
    .filter((ad) => ad.title)
    .sort((a, b) => a.priority - b.priority)
    .forEach((ad) => {
      const row = document.createElement("div");
      row.className = "product-admin-row ad-admin-row";
      applyAdRowData(row, ad);
      adAdminTable.appendChild(row);
    });
}

function resetAdminAdForm() {
  if (!adAdminForm) return;
  adAdminForm.reset();
  adAdminForm.elements.editing.value = "";
  if (adAdminForm.elements.active) adAdminForm.elements.active.checked = true;
  if (adAdminMessage) adAdminMessage.textContent = "Ready to run a new banner ad.";
}

function syncLocalAdminAds(ads) {
  const normalizedAds = ads.map(normalizeAd).filter((ad) => ad.title);
  saveAdminAds(normalizedAds);
  renderAdminAdRows(normalizedAds);
  renderAdsOnStorefront(normalizedAds);
}

function hydrateAdminAds() {
  const ads = loadAdminAds();
  renderAdminAdRows(ads);
}

async function syncAdsFromBackend() {
  const backendAds = await fetchBackendAds();
  if (!backendAds) return;
  syncLocalAdminAds(backendAds);
}

async function syncPublicAds() {
  const publicAds = await fetchPublicAds();
  if (publicAds) renderAdsOnStorefront(publicAds);
}

function normalizeBrand(brand) {
  const name = String(brand.name || "").trim();
  return {
    id: String(brand.id || slugifyProduct(name)).trim(),
    name,
    logo: String(brand.logo || "").trim(),
    description: String(brand.description || "").trim(),
    featured: brand.featured !== false,
  };
}

function loadAdminBrands() {
  try {
    const stored = JSON.parse(localStorage.getItem(ADMIN_BRANDS_KEY) || "null");
    if (Array.isArray(stored) && stored.length) {
      return stored.map(normalizeBrand).filter((brand) => brand.name);
    }
  } catch {}
  return defaultBrands.map(normalizeBrand);
}

function saveAdminBrands(brands) {
  const compactBrands = brands
    .map(normalizeBrand)
    .filter((brand) => brand.name)
    .map((brand) => ({ ...brand, logo: isInlineImage(brand.logo) ? "" : brand.logo }));
  safeLocalStorageSet(ADMIN_BRANDS_KEY, compactBrands);
}

async function fetchBackendBrands() {
  try {
    const brands = await apiJson(BRANDS_API);
    if (!Array.isArray(brands)) return null;
    return brands.map(normalizeBrand).filter((brand) => brand.name);
  } catch {
    return null;
  }
}

async function saveBackendBrand(brand, editing = "") {
  return apiJson(BRANDS_API, {
    method: "POST",
    body: JSON.stringify({ editing, brand: normalizeBrand(brand) }),
  });
}

async function deleteBackendBrand(idOrName) {
  return apiJson(`${BRANDS_API}/${encodeURIComponent(idOrName)}`, {
    method: "DELETE",
  });
}

function refreshBrandButtons() {
  brandButtons = $$(".brand-row button[data-brand], .brand-filter button[data-brand]");
}

function brandInitials(name) {
  const words = String(name || "")
    .replace(/[^a-z0-9 ]/gi, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return (words.length > 1 ? words.slice(0, 2).map((word) => word[0]).join("") : String(name || "").slice(0, 2)).toUpperCase();
}

function catalogBrandNames() {
  const names = new Set();
  Object.values(productDetails).forEach((product) => {
    if (product.brand) names.add(product.brand);
  });
  loadAdminProducts().forEach((product) => {
    if (product.brand) names.add(product.brand);
  });
  productCards.forEach((card) => {
    if (card.dataset.brand) names.add(card.dataset.brand);
  });
  return Array.from(names);
}

function getAvailableBrands() {
  const byId = new Map();
  loadAdminBrands().map(normalizeBrand).forEach((brand) => {
    if (brand.name) byId.set(brand.id || slugifyProduct(brand.name), brand);
  });
  catalogBrandNames().forEach((name) => {
    const id = slugifyProduct(name);
    if (!id || byId.has(id)) return;
    byId.set(id, normalizeBrand({ name, description: "Brand used in the current product catalog.", featured: true }));
  });
  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function populateBrandSelect(selected = "") {
  const brandSelect = productAdminForm?.elements.brand;
  if (!brandSelect || brandSelect.tagName !== "SELECT") return;
  const brands = getAvailableBrands();
  const selectedValue = String(selected || brandSelect.value || "");
  brandSelect.innerHTML = `<option value="">Select brand</option>${brands
    .map((brand) => `<option value="${escapeHtml(brand.name)}">${escapeHtml(brand.name)}</option>`)
    .join("")}`;
  if (selectedValue && !brands.some((brand) => brand.name === selectedValue)) {
    brandSelect.insertAdjacentHTML("beforeend", `<option value="${escapeHtml(selectedValue)}">${escapeHtml(selectedValue)}</option>`);
  }
  brandSelect.value = selectedValue;
}

function brandLogoHtml(brand) {
  if (brand.logo) {
    return `<span class="brand-logo-frame"><img src="${escapeHtml(brand.logo)}" alt="${escapeHtml(brand.name)} logo" /><span class="brand-wordmark" hidden>${escapeHtml(brand.name)}</span></span>`;
  }
  return `<span class="brand-wordmark">${escapeHtml(brand.name)}</span>`;
}

function brandButtonTemplate(brand) {
  return `<button type="button" data-brand="${escapeHtml(brand.name)}">${escapeHtml(brand.name)}</button>`;
}

function featuredBrandTemplate(brand) {
  return `
    <a class="featured-brand-card" href="products.html?brand=${encodeURIComponent(brand.name)}" aria-label="Shop ${escapeHtml(brand.name)} products">
      ${brandLogoHtml(brand)}
    </a>
  `;
}

function brandDirectoryTemplate(brand) {
  return `
    <a class="brand-directory-card" href="products.html?brand=${encodeURIComponent(brand.name)}" aria-label="Shop ${escapeHtml(brand.name)} products">
      <div>${brandLogoHtml(brand)}</div>
    </a>
  `;
}

function repairBrandLogoFallbacks() {
  $$(".brand-logo-frame img").forEach((image) => {
    const showFallback = () => {
      image.hidden = true;
      if (image.nextElementSibling) image.nextElementSibling.hidden = false;
    };
    image.addEventListener("error", showFallback, { once: true });
    if (image.complete && image.naturalWidth === 0) showFallback();
  });
}

function renderBrandsOnStorefront(brands = getAvailableBrands()) {
  const visibleBrands = brands.filter((brand) => brand.name);
  const featuredBrands = visibleBrands.filter((brand) => brand.featured).slice(0, 8);

  $$(".brand-row").forEach((row) => {
    row.innerHTML = featuredBrands.map(brandButtonTemplate).join("");
  });
  $$(".brand-filter").forEach((filter) => {
    filter.innerHTML = visibleBrands.map(brandButtonTemplate).join("");
  });
  if (featuredBrandList) {
    featuredBrandList.innerHTML = featuredBrands.slice(0, 5).map(featuredBrandTemplate).join("");
  }
  if (brandDirectoryGrid) {
    brandDirectoryGrid.innerHTML = visibleBrands.map(brandDirectoryTemplate).join("");
  }
  refreshBrandButtons();
  repairBrandLogoFallbacks();
  brandButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.brand === activeBrand));
  populateBrandSelect(productAdminForm?.elements.brand?.value || "");
}

function brandRowTemplate(brand) {
  return `
    <strong>${escapeHtml(brand.name)}<small>${brand.logo ? "Logo uploaded" : "No logo uploaded"}</small></strong>
    <span class="admin-logo-cell">${brand.logo ? `<img src="${escapeHtml(brand.logo)}" alt="${escapeHtml(brand.name)} logo" />` : "No logo"}</span>
    <b>${brand.featured ? "Featured" : "Hidden"}</b>
    <div class="row-actions">
      <button type="button" data-edit-brand>Edit</button>
      <button type="button" data-delete-brand>Delete</button>
    </div>
  `;
}

function applyBrandRowData(row, data) {
  const brand = normalizeBrand(data);
  row.dataset.id = brand.id;
  row.dataset.name = brand.name;
  row.dataset.logo = brand.logo;
  row.dataset.description = brand.description;
  row.dataset.featured = String(brand.featured);
  row.innerHTML = brandRowTemplate(brand);
}

function adminBrandsFromRows() {
  if (!brandAdminTable) return [];
  return $$("#brandAdminTable .brand-admin-row:not(.brand-admin-head)").map((row) =>
    normalizeBrand({
      id: row.dataset.id,
      name: row.dataset.name,
      logo: row.dataset.logo,
      featured: row.dataset.featured !== "false",
    })
  );
}

function renderAdminBrandRows(brands) {
  if (!brandAdminTable) return;
  $$("#brandAdminTable .brand-admin-row:not(.brand-admin-head)").forEach((row) => row.remove());
  brands.forEach((brand) => {
    const row = document.createElement("div");
    row.className = "product-admin-row brand-admin-row";
    applyBrandRowData(row, brand);
    brandAdminTable.appendChild(row);
  });
}

function resetAdminBrandForm() {
  if (!brandAdminForm) return;
  brandAdminForm.reset();
  brandAdminForm.elements.editing.value = "";
  if (brandAdminForm.elements.featured) brandAdminForm.elements.featured.checked = true;
  if (brandAdminMessage) brandAdminMessage.textContent = "Ready to add a new brand.";
}

function syncLocalAdminBrands(brands) {
  const normalizedBrands = brands.map(normalizeBrand).filter((brand) => brand.name);
  saveAdminBrands(normalizedBrands);
  renderAdminBrandRows(normalizedBrands);
  renderBrandsOnStorefront(normalizedBrands);
}

function hydrateAdminBrands() {
  const brands = loadAdminBrands();
  renderAdminBrandRows(brands);
  renderBrandsOnStorefront(brands);
}

async function syncBrandsFromBackend() {
  const backendBrands = await fetchBackendBrands();
  if (!backendBrands) return;
  syncLocalAdminBrands(backendBrands);
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
    hsn: getCatalogProduct(name).hsn || DEFAULT_HSN,
    unit: getCatalogProduct(name).unit || DEFAULT_UNIT,
    gstRate: Number(getCatalogProduct(name).gstRate ?? DEFAULT_GST_RATE),
  }));
}

function checkoutCustomerFromForm(form) {
  const formData = new FormData(form);
  return {
    name: String(formData.get("name") || "").trim(),
    clinic: String(formData.get("clinic") || "").trim(),
    gstin: String(formData.get("gstin") || "").trim().toUpperCase(),
    phone: String(formData.get("phone") || "").trim(),
    address: String(formData.get("address") || "").trim(),
    payment: String(formData.get("payment") || "").trim(),
  };
}

async function saveBackendOrder(customer) {
  const payload = checkoutPayload(customer);
  return apiJson(ORDERS_API, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

function checkoutPayload(customer) {
  const summary = getOrderSummary();
  return {
    customer,
    items: cartItemsForBackend(),
    subtotal: summary.subtotal,
    shipping: summary.shipping,
    total: summary.total,
  };
}

async function loadPaymentConfig() {
  try {
    paymentConfig = await apiJson(PAYMENT_CONFIG_API);
  } catch {
    paymentConfig = { razorpayEnabled: false, keyId: "", currency: "INR", businessName: "Dental Factory" };
  }
  updatePaymentOptions();
  return paymentConfig;
}

function updatePaymentOptions() {
  $$('select[name="payment"]').forEach((select) => {
    const codOption = Array.from(select.options).find((option) => option.value === CASH_ON_DELIVERY_METHOD || option.textContent.trim() === CASH_ON_DELIVERY_METHOD);
    if (codOption) {
      codOption.value = CASH_ON_DELIVERY_METHOD;
      codOption.disabled = !isCashCodEligible();
      codOption.textContent = isCashCodEligible() ? CASH_ON_DELIVERY_METHOD : "Cash on delivery (not available for this order)";
    }

    if (!Array.from(select.options).some((option) => option.value === PINE_LABS_PAYMENT_METHOD)) {
      const pineLabsOption = new Option(PINE_LABS_PAYMENT_METHOD, PINE_LABS_PAYMENT_METHOD);
      if (codOption?.nextSibling) select.insertBefore(pineLabsOption, codOption.nextSibling);
      else select.add(pineLabsOption, select.options[1] || null);
    }

    const onlineOption = Array.from(select.options).find((option) => option.value === ONLINE_PAYMENT_METHOD);
    if (!onlineOption) return;
    onlineOption.disabled = !paymentConfig.razorpayEnabled;
    onlineOption.textContent = paymentConfig.razorpayEnabled ? "Pay online now (Razorpay)" : "Pay online now (Razorpay - setup pending)";
    if (select.selectedOptions[0]?.disabled) {
      select.value = PINE_LABS_PAYMENT_METHOD;
    }
  });
  $$(".payment-note").forEach((note) => {
    note.textContent = paymentRuleNote();
  });
}

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener("load", resolve, { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Razorpay checkout script could not be loaded"));
    document.head.appendChild(script);
  });
}

async function createRazorpayOrder(customer) {
  return apiJson(RAZORPAY_ORDER_API, {
    method: "POST",
    body: JSON.stringify(checkoutPayload(customer)),
  });
}

async function verifyRazorpayPayment(customer, razorpayResponse) {
  return apiJson(RAZORPAY_VERIFY_API, {
    method: "POST",
    body: JSON.stringify({
      ...checkoutPayload(customer),
      razorpay: razorpayResponse,
    }),
  });
}

async function startRazorpayPayment(customer, messageNode, summaryNode, form) {
  if (!paymentConfig.razorpayEnabled) await loadPaymentConfig();
  if (!paymentConfig.razorpayEnabled) {
    throw new Error("Razorpay keys are not added yet. Add keys in Render or choose another payment method.");
  }

  if (messageNode) messageNode.textContent = "Opening secure Razorpay payment...";
  const razorpayOrder = await createRazorpayOrder(customer);
  await loadRazorpayCheckout();

  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      key: razorpayOrder.keyId || paymentConfig.keyId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency || paymentConfig.currency || "INR",
      name: paymentConfig.businessName || "Dental Factory",
      description: "Dental product order",
      image: `${window.location.origin}/assets/dental-factory-logo-mark.png?v=20260517-logo`,
      order_id: razorpayOrder.razorpayOrderId,
      prefill: {
        name: customer.name,
        contact: customer.phone,
      },
      notes: {
        address: customer.address,
      },
      theme: {
        color: "#0b7f86",
      },
      handler: async (response) => {
        try {
          if (messageNode) messageNode.textContent = "Verifying payment...";
          const order = await verifyRazorpayPayment(customer, response);
          showCheckoutSuccess(messageNode, customer, order, "Payment received.");
          cart.clear();
          renderCart();
          if (summaryNode) renderSummary(summaryNode);
          form.reset();
          resolve(order);
        } catch (error) {
          reject(error);
        }
      },
      modal: {
        ondismiss: () => reject(new Error("Payment was closed before completion.")),
      },
    });
    checkout.open();
  });
}

function rememberLastOrder(order, customer = {}) {
  try {
    localStorage.setItem(
      LAST_ORDER_KEY,
      JSON.stringify({
        id: order.id,
        phone: customer.phone || order.customer?.phone || "",
        createdAt: new Date().toISOString(),
      })
    );
  } catch {}
}

function showCheckoutSuccess(messageNode, customer, order, prefix = "Thanks") {
  rememberLastOrder(order, customer);
  if (!messageNode) return;
  const trackUrl = `track-order.html?order=${encodeURIComponent(order.id)}`;
  messageNode.innerHTML = `${escapeHtml(prefix)} ${escapeHtml(customer.name || "")}. Order <strong>${escapeHtml(order.id)}</strong> saved. <a href="${escapeHtml(trackUrl)}">Track order</a>`;
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

function accountDisplayName(account) {
  return String(account?.clinic || account?.name || "Account").trim();
}

function accountFieldLabel(type = "dentist") {
  return accountTypeLabels[type] || accountTypeLabels.dentist;
}

function accountTypeName(type = "dentist") {
  return accountTypeNames[type] || accountTypeNames.dentist;
}

function setAccountFormType(type = "dentist") {
  $$('input[name="type"]').forEach((input) => {
    input.checked = input.value === type;
  });
  updateAccountTypeLabels();
}

function updateAccountTypeLabels() {
  [$("#accountForm"), accountPageForm].filter(Boolean).forEach((form) => {
    const checkedType = form.querySelector('input[name="type"]:checked')?.value || "dentist";
    const nameInput = form.elements.clinic;
    const label = nameInput?.closest("label");
    const labelText = accountFieldLabel(checkedType);
    const labelSpan = label?.querySelector("[data-account-name-label]");
    if (labelSpan) {
      labelSpan.textContent = labelText;
    } else if (label?.firstChild?.nodeType === Node.TEXT_NODE) {
      label.firstChild.textContent = `${labelText} `;
    }
    if (nameInput) nameInput.placeholder = labelText;
  });
}

function hydrateAccountForms(account = loadCustomerAccount()) {
  if (!account) return;
  [$("#accountForm"), accountPageForm].filter(Boolean).forEach((form) => {
    if (form.elements.mobile && account.mobile) form.elements.mobile.value = account.mobile;
    if (form.elements.clinic && account.clinic) form.elements.clinic.value = account.clinic;
  });
  setAccountFormType(account.type || "dentist");
}

function updateMembershipUi() {
  const account = loadCustomerAccount();
  const activeType = account?.type || "";
  $$(".membership-card").forEach((card) => {
    const isActive = Boolean(activeType && card.dataset.membershipType === activeType);
    card.classList.toggle("is-active", isActive);
    card.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  if (!membershipAction) return;
  if (!account?.clinic) {
    membershipAction.textContent = "Login to activate";
    membershipAction.dataset.account = "";
    return;
  }
  const planName = membershipPlans[activeType] || "Membership";
  membershipAction.textContent = `${planName} active`;
  membershipAction.removeAttribute("data-account");
}

function accountModalTemplate() {
  return `
    <form class="account-panel" id="accountForm">
      <div class="cart-head">
        <h2>Login or create account</h2>
        <button class="icon-only" id="closeAccount" type="button" aria-label="Close login" data-close-account>
          <i data-lucide="x"></i>
        </button>
      </div>
      <p class="account-note">Track orders, save clinic addresses, and access bulk pricing callbacks.</p>
      <label>
        Mobile number
        <input name="mobile" required inputmode="tel" placeholder="Account mobile number" />
      </label>
      <label>
        <span data-account-name-label>Clinic or doctor name</span>
        <input name="clinic" required placeholder="Clinic or doctor name" />
      </label>
      <div class="account-options" aria-label="Account type">
        <label><input name="type" type="radio" checked value="dentist" /> Dentist</label>
        <label><input name="type" type="radio" value="dealer" /> Dealer</label>
        <label><input name="type" type="radio" value="student" /> Student</label>
      </div>
      <button class="checkout-button" type="submit">Continue</button>
      <p class="checkout-message" id="accountMessage" role="status"></p>
    </form>
    <section class="account-panel account-profile" id="accountProfile" hidden></section>
  `;
}

function ensureAccountProfile(modal) {
  let profile = modal.querySelector("#accountProfile");
  if (!profile) {
    profile = document.createElement("section");
    profile.className = "account-panel account-profile";
    profile.id = "accountProfile";
    profile.hidden = true;
    modal.appendChild(profile);
  }
  return profile;
}

function ensureAccountModal() {
  accountModal = accountModal || $("#accountModal");
  if (!accountModal) {
    accountModal = document.createElement("aside");
    accountModal.className = "account-modal";
    accountModal.id = "accountModal";
    accountModal.setAttribute("aria-label", "Account login");
    accountModal.setAttribute("aria-hidden", "true");
    accountModal.innerHTML = accountModalTemplate();
    document.body.appendChild(accountModal);
    setIcons();
  } else {
    ensureAccountProfile(accountModal);
  }

  closeAccount = $("#closeAccount");
  accountMessage = $("#accountMessage");
  const form = accountModal.querySelector("#accountForm");

  if (form && !form.dataset.accountWired) {
    form.dataset.accountWired = "true";
    form.addEventListener("submit", (event) => submitAccountForm(event, accountMessage, true));
    form.querySelectorAll('input[name="type"]').forEach((input) => {
      input.addEventListener("change", updateAccountTypeLabels);
    });
  }

  if (!accountModal.dataset.accountWired) {
    accountModal.dataset.accountWired = "true";
    accountModal.addEventListener("click", (event) => {
      if (event.target === accountModal || event.target.closest("[data-close-account], #closeAccount")) {
        hideAccount();
        return;
      }
      if (event.target.closest("[data-edit-account]")) {
        setAccountModalMode("form");
        return;
      }
      if (event.target.closest("[data-account-logout]")) {
        localStorage.removeItem(CUSTOMER_ACCOUNT_KEY);
        updateAccountButtons();
        setAccountModalMode("form");
        if (accountMessage) accountMessage.textContent = "Logged out on this device.";
        showToast("Account logged out on this device.");
      }
    });
  }

  updateAccountTypeLabels();
  return accountModal;
}

function renderAccountProfile(account = loadCustomerAccount()) {
  const modal = ensureAccountModal();
  const profile = ensureAccountProfile(modal);
  if (!account?.clinic) {
    profile.hidden = true;
    return;
  }

  const type = account.type || "dentist";
  profile.innerHTML = `
    <div class="cart-head">
      <h2>Your profile</h2>
      <button class="icon-only" type="button" aria-label="Close profile" data-close-account>
        <i data-lucide="x"></i>
      </button>
    </div>
    <p class="account-note">Your saved Dental Factory account details.</p>
    <div class="profile-card">
      <span>${escapeHtml(accountTypeName(type))}</span>
      <strong>${escapeHtml(accountDisplayName(account))}</strong>
      <dl>
        <div><dt>Mobile</dt><dd>${escapeHtml(account.mobile || "Not added")}</dd></div>
        <div><dt>${escapeHtml(accountFieldLabel(type))}</dt><dd>${escapeHtml(account.clinic || "Not added")}</dd></div>
        <div><dt>Status</dt><dd>${escapeHtml(account.status || "Callback pending")}</dd></div>
      </dl>
    </div>
    <div class="profile-actions">
      <button class="checkout-button" type="button" data-edit-account>Edit details</button>
      <a class="outline-link" href="track-order.html">Track orders</a>
      <button class="outline-link danger-link" type="button" data-account-logout>Logout</button>
    </div>
  `;
  setIcons();
}

function setAccountModalMode(mode) {
  const modal = ensureAccountModal();
  const form = modal.querySelector("#accountForm");
  const profile = modal.querySelector("#accountProfile");
  const showProfile = mode === "profile" && Boolean(loadCustomerAccount()?.clinic);
  if (form) form.hidden = showProfile;
  if (profile) profile.hidden = !showProfile;
  if (!showProfile) hydrateAccountForms();
}

function updateAccountButtons() {
  const account = loadCustomerAccount();
  if (!account?.clinic) {
    $$("[id='loginButton']").forEach((button) => {
      const label = button.querySelector("span");
      if (label) label.textContent = "Login";
      button.setAttribute("aria-label", "Login");
      button.removeAttribute("title");
    });
    updateMembershipUi();
    return;
  }
  const name = accountDisplayName(account);
  $$("[id='loginButton']").forEach((button) => {
    const label = button.querySelector("span");
    if (label) label.textContent = name.length > 16 ? `${name.slice(0, 14)}...` : name;
    button.setAttribute("aria-label", `${name} account`);
    button.title = `${name} account`;
  });
  hydrateAccountForms(account);
  updateMembershipUi();
}

async function fetchBackendOrders() {
  return apiJson(ORDERS_API);
}

async function fetchBackendOrder(orderId) {
  return apiJson(`${ORDERS_API}/${encodeURIComponent(orderId)}`);
}

async function updateBackendOrderStatus(orderId, status) {
  return apiJson(`${ORDERS_API}/${encodeURIComponent(orderId)}/status`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });
}

async function trackBackendOrder(query) {
  return apiJson(`${ORDER_TRACK_API}?query=${encodeURIComponent(query)}`);
}

async function getAdminSession() {
  try {
    const session = await apiJson(ADMIN_SESSION_API);
    adminSessionMinutes = Number(session.sessionMinutes || adminSessionMinutes) || adminSessionMinutes;
    return session;
  } catch {
    return { authenticated: false };
  }
}

async function loginAdmin(password, username = "") {
  return apiJson(ADMIN_LOGIN_API, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

async function logoutAdmin() {
  return apiJson(ADMIN_LOGOUT_API, { method: "POST" });
}

function productFromStaticDetail(name, detail) {
  return normalizeAdminProduct({ name, ...detail });
}

function allCatalogProducts() {
  const savedProducts = loadAdminProducts();
  const staticProducts = Object.entries(productDetails).map(([name, detail]) => productFromStaticDetail(name, detail));
  const productMap = new Map();

  staticProducts.forEach((product) => productMap.set(product.id || slugifyProduct(product.name), product));
  savedProducts.forEach((product) => productMap.set(product.id || slugifyProduct(product.name), product));

  return Array.from(productMap.values()).filter((product) => product.name);
}

function getCatalogProduct(identifier) {
  const normalized = String(identifier || "").trim();
  const slug = slugifyProduct(normalized);
  return (
    allCatalogProducts().find((product) => product.name === normalized || product.id === normalized || slugifyProduct(product.name) === slug || product.id === slug) ||
    {}
  );
}

function productDetailUrl(identifier) {
  const product = getCatalogProduct(identifier);
  const key = product.id || slugifyProduct(product.name || identifier);
  return `product-detail.html?product=${encodeURIComponent(key)}`;
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

function validPincode(pin) {
  return /^[0-9]{6}$/.test(String(pin || "").trim());
}

function getSavedDeliveryPin() {
  try {
    return localStorage.getItem(DELIVERY_PIN_KEY) || "";
  } catch {
    return "";
  }
}

function updateDeliveryUi(pin = getSavedDeliveryPin()) {
  const cleanPin = String(pin || "").trim();
  if (pincodeInput) pincodeInput.value = cleanPin;
  if (deliveryForm) {
    deliveryForm.classList.toggle("has-delivery-pin", Boolean(cleanPin));
    const label = deliveryForm.querySelector("label");
    if (label) {
      label.innerHTML = cleanPin ? `Delivering to <span>${escapeHtml(cleanPin)}</span>` : "Delivering to";
    }
  }
  if (deliveryNote) {
    deliveryNote.textContent = cleanPin
      ? `Delivery to ${cleanPin}: most items arrive in 2-4 business days.`
      : "Enter pincode to check delivery estimate.";
  }
}

function setDeliveryLocationMessage(message, isError = false) {
  const messageNode = $("#deliveryLocationMessage");
  if (!messageNode) return;
  messageNode.textContent = message;
  messageNode.classList.toggle("is-error", isError);
}

function saveDeliveryPin(pin, { closeModal = true } = {}) {
  const cleanPin = String(pin || "").trim();
  if (!validPincode(cleanPin)) {
    setDeliveryLocationMessage("Enter a valid 6 digit pincode.", true);
    return false;
  }
  try {
    localStorage.setItem(DELIVERY_PIN_KEY, cleanPin);
  } catch {}
  updateDeliveryUi(cleanPin);
  setDeliveryLocationMessage(`Delivery location saved for ${cleanPin}.`);
  showToast(`Delivering to ${cleanPin}.`);
  if (closeModal) {
    window.setTimeout(closeDeliveryLocation, 350);
  }
  return true;
}

function ensureDeliveryLocationModal() {
  let modal = $("#deliveryLocationModal");
  if (modal) return modal;
  modal = document.createElement("aside");
  modal.className = "delivery-location-modal";
  modal.id = "deliveryLocationModal";
  modal.setAttribute("aria-label", "Select delivery location");
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <form class="delivery-location-panel" id="deliveryLocationForm">
      <div class="cart-head">
        <h2>Select Delivery Location</h2>
        <button class="icon-only" type="button" aria-label="Close delivery location" data-close-delivery-location>
          <i data-lucide="x"></i>
        </button>
      </div>
      <button class="current-location-button" id="useCurrentLocation" type="button">
        <span><i data-lucide="navigation"></i></span>
        <strong>Use my Current Location</strong>
        <small>Allow location permission for automatic pincode detection</small>
        <em class="location-switch" aria-hidden="true"></em>
      </button>
      <div class="location-divider"><span></span><b>or</b><span></span></div>
      <label class="delivery-pin-entry">
        <i data-lucide="map-pin"></i>
        <input id="deliveryPinInput" inputmode="numeric" maxlength="6" placeholder="Enter pincode" />
        <button type="submit">Submit</button>
      </label>
      <p class="delivery-location-message" id="deliveryLocationMessage" role="status"></p>
    </form>
  `;
  document.body.appendChild(modal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal || event.target.closest("[data-close-delivery-location]")) {
      closeDeliveryLocation();
    }
  });

  $("#deliveryLocationForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    saveDeliveryPin($("#deliveryPinInput")?.value);
  });

  $("#useCurrentLocation")?.addEventListener("click", detectCurrentLocation);
  setIcons();
  return modal;
}

function openDeliveryLocation(message = "") {
  const modal = ensureDeliveryLocationModal();
  const savedPin = pincodeInput?.value.trim() || getSavedDeliveryPin();
  const modalInput = $("#deliveryPinInput");
  if (modalInput) modalInput.value = savedPin;
  setDeliveryLocationMessage(message || (savedPin ? `Current pincode is ${savedPin}.` : "Choose current location or enter pincode."));
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  window.setTimeout(() => modalInput?.focus(), 60);
}

function closeDeliveryLocation() {
  const modal = $("#deliveryLocationModal");
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

async function reverseGeocodePincode(latitude, longitude) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&zoom=18&addressdetails=1`;
  const response = await fetch(url);
  if (!response.ok) return "";
  const data = await response.json();
  const rawPostcode = String(data?.address?.postcode || "");
  const match = rawPostcode.match(/[0-9]{6}/);
  return match ? match[0] : "";
}

function detectCurrentLocation() {
  const button = $("#useCurrentLocation");
  if (!navigator.geolocation) {
    setDeliveryLocationMessage("Current location is not available in this browser. Enter pincode manually.", true);
    return;
  }

  if (button) button.disabled = true;
  setDeliveryLocationMessage("Detecting your current location...");

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const pin = await reverseGeocodePincode(position.coords.latitude, position.coords.longitude);
        if (pin) {
          const modalInput = $("#deliveryPinInput");
          if (modalInput) modalInput.value = pin;
          saveDeliveryPin(pin);
        } else {
          setDeliveryLocationMessage("Location detected, but pincode was not found. Enter pincode manually.", true);
        }
      } catch {
        setDeliveryLocationMessage("Location detected, but pincode lookup failed. Enter pincode manually.", true);
      } finally {
        if (button) button.disabled = false;
      }
    },
    (error) => {
      const blocked = error.code === error.PERMISSION_DENIED;
      setDeliveryLocationMessage(
        blocked ? "Location permission was blocked. Enter pincode manually." : "Could not detect current location. Enter pincode manually.",
        true
      );
      if (button) button.disabled = false;
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 }
  );
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

function getCartSubtotal() {
  let subtotal = 0;
  cart.forEach((item) => {
    subtotal += item.price * item.qty;
  });
  return subtotal;
}

function getCartItemCategory(name) {
  refreshProductCards();
  const card = productCards.find((item) => item.dataset.name === name);
  if (card?.dataset.category) return card.dataset.category.toLowerCase();
  const product = getCatalogProduct(name);
  return String(product.category || product.description || "").toLowerCase();
}

function cartRequiresFreightConfirmation() {
  const subtotal = getCartSubtotal();
  if (subtotal >= FREIGHT_CONFIRMATION_LIMIT) return true;
  return Array.from(cart, ([name, item]) => {
    const category = getCartItemCategory(name);
    const lineTotal = Number(item.price || 0) * Number(item.qty || 0);
    return (
      category.includes("equipment") ||
      category.includes("clinic") ||
      lineTotal >= 10000 ||
      /autoclave|chair|compressor|x-?ray|scanner|sensor|equipment|installation/i.test(name)
    );
  }).some(Boolean);
}

function getShippingDetails() {
  const subtotal = getCartSubtotal();
  if (cart.size === 0) {
    return { charge: 0, label: "Rs. 0", note: "Add products to calculate shipping.", requiresCallback: false };
  }
  if (cartRequiresFreightConfirmation()) {
    return {
      charge: 0,
      label: "To be confirmed",
      note: "Bulky equipment, high-value, or clinic setup freight is confirmed during callback.",
      requiresCallback: true,
    };
  }
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return { charge: 0, label: "Free", note: `Free shipping above ${formatMoney(FREE_SHIPPING_THRESHOLD)}.`, requiresCallback: false };
  }
  return {
    charge: STANDARD_SHIPPING_FEE,
    label: formatMoney(STANDARD_SHIPPING_FEE),
    note: `Standard shipping applies below ${formatMoney(FREE_SHIPPING_THRESHOLD)}.`,
    requiresCallback: false,
  };
}

function getOrderSummary() {
  const subtotal = getCartSubtotal();
  const shipping = getShippingDetails();
  return {
    subtotal,
    shipping,
    total: subtotal + shipping.charge,
  };
}

function getCartTotal() {
  return getOrderSummary().total;
}

function isCashCodEligible() {
  return cart.size > 0 && getCartSubtotal() <= CASH_COD_LIMIT && !cartRequiresFreightConfirmation();
}

function paymentRuleNote() {
  const codNote = isCashCodEligible()
    ? `Cash COD is available up to ${formatMoney(CASH_COD_LIMIT)} for standard orders.`
    : `Cash COD is disabled for equipment, clinic setup, bulky freight, or orders above ${formatMoney(CASH_COD_LIMIT)}.`;
  const onlineNote = paymentConfig.razorpayEnabled
    ? "Online Razorpay payment is active."
    : "Online Razorpay payment will activate after live keys are added.";
  return `${codNote} Pine Labs card swipe, UPI on delivery, and bank transfer remain available after confirmation. ${onlineNote}`;
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

function upsertOrderRuleNote(anchor, summary = getOrderSummary()) {
  if (!anchor?.parentElement) return;
  let note = anchor.parentElement.querySelector(".shipping-rule-note");
  if (!note) {
    note = document.createElement("p");
    note.className = "shipping-rule-note";
    anchor.after(note);
  }
  note.textContent = `${summary.shipping.note} ${
    isCashCodEligible() ? "Cash COD available for this cart." : "Choose Pine Labs card swipe, UPI, bank transfer, or online payment for this cart."
  }`;
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
    const summary = getOrderSummary();
    cartTotal.textContent = formatMoney(summary.total);
    const label = cartTotal.previousElementSibling;
    if (label) label.textContent = "Total estimate";
    const anchor = cartTotal.closest(".cart-total");
    upsertOrderRuleNote(anchor, summary);
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
    const summary = getOrderSummary();
    cartPageTotal.textContent = formatMoney(summary.subtotal);
    const summaryCard = cartPageTotal.closest(".summary-card");
    if (summaryCard) {
      let shippingRow = summaryCard.querySelector(".cart-shipping-row");
      if (!shippingRow) {
        shippingRow = document.createElement("div");
        shippingRow.className = "summary-row cart-shipping-row";
        cartPageTotal.closest(".summary-row")?.after(shippingRow);
      }
      shippingRow.innerHTML = `<span>Shipping</span><strong>${summary.shipping.label}</strong>`;

      let grandRow = summaryCard.querySelector(".cart-grand-row");
      if (!grandRow) {
        grandRow = document.createElement("div");
        grandRow.className = "summary-row cart-grand-row";
        shippingRow.after(grandRow);
      }
      grandRow.innerHTML = `<span>Total estimate</span><strong>${formatMoney(summary.total)}</strong>`;
      upsertOrderRuleNote(grandRow, summary);
    }
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

  const summary = getOrderSummary();
  const subtotal = document.createElement("div");
  subtotal.className = "summary-row";
  subtotal.innerHTML = `<span>Subtotal</span><b>${formatMoney(summary.subtotal)}</b>`;
  target.appendChild(subtotal);

  const shipping = document.createElement("div");
  shipping.className = "summary-row";
  shipping.innerHTML = `<span>Shipping</span><b>${summary.shipping.label}</b>`;
  target.appendChild(shipping);

  const total = document.createElement("strong");
  total.innerHTML = `<span>Total estimate</span><b>${formatMoney(summary.total)}</b>`;
  target.appendChild(total);

  const note = document.createElement("p");
  note.className = "summary-note";
  note.textContent = `${summary.shipping.note} ${
    isCashCodEligible() ? "Cash COD is available for this cart." : "Cash COD is unavailable for this cart; Pine Labs card swipe is available after confirmation."
  }`;
  target.appendChild(note);
}

function renderCart() {
  saveCart();
  updateCartBadges();
  renderCartDrawer();
  renderCartPage();
  renderSummary(checkoutPageSummary);
  updatePaymentOptions();
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
  const card = productCards.find((item) => item.dataset.name === name || item.dataset.productId === name);
  const detail = getCatalogProduct(card?.dataset.productId || name);
  if (!card) return Object.keys(detail).length ? { name, ...detail } : null;

  return {
    name: detail.name || name,
    price: Number(card.dataset.price),
    rating: card.dataset.rating,
    brand: card.dataset.brand,
    image: card.querySelector("img")?.getAttribute("src") || detail.image,
    alt: card.querySelector("img")?.getAttribute("alt") || detail.alt,
    description: detail.description || card.querySelector("p")?.textContent.trim(),
    orders: card.querySelector(".rating span")?.textContent.trim() || "Popular item",
    ...detail,
  };
}

function openProductDetails(name) {
  window.location.href = productDetailUrl(name);
  return;

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
  event?.preventDefault();
  const modal = ensureAccountModal();
  const savedAccount = loadCustomerAccount();
  if (accountMessage) accountMessage.textContent = "";
  hydrateAccountForms(savedAccount);
  renderAccountProfile(savedAccount);
  setAccountModalMode(savedAccount?.clinic ? "profile" : "form");
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
}

function hideAccount() {
  const modal = accountModal || $("#accountModal");
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

function showSlide(index) {
  const slider = $("#homePromoSlider");
  if (!slider || slider.dataset.adDynamic === "true") return;
  const slides = Array.from(slider.querySelectorAll(".promo-slide"));
  if (slides.length === 0) return;
  activeSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === activeSlide);
  });
}

function injectDetailButtons() {
  refreshProductCards();
  productCards.forEach((card) => {
    card.querySelector(".detail-button")?.remove();
    const product = getCatalogProduct(card.dataset.productId || card.dataset.name);
    const productId = product.id || slugifyProduct(card.dataset.name);
    card.dataset.productId = productId;
    card.setAttribute("role", "link");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `Open ${card.dataset.name} details`);
  });
}

function setActiveNavPill(button) {
  const nav = button?.closest(".category-nav");
  if (!nav) return;
  nav.querySelectorAll(".nav-pill").forEach((pill) => {
    pill.classList.toggle("is-active", pill === button);
  });
}

function categoryMenuLink(term) {
  return `products.html?search=${encodeURIComponent(term)}`;
}

function categoryMenuTemplate() {
  const first = categoryMenuGroups[0]?.name || "";
  return `
    <div class="category-mega-panel" hidden>
      <label class="category-menu-search">
        <i data-lucide="search"></i>
        <input type="search" placeholder="Search Category" autocomplete="off" />
      </label>
      <div class="category-menu-body">
        <div class="category-menu-list">
          ${categoryMenuGroups
            .map(
              (group) => `
                <button class="${group.name === first ? "is-active" : ""}" type="button" data-category-tab="${escapeHtml(group.name)}">
                  ${escapeHtml(group.name)}
                </button>
              `
            )
            .join("")}
        </div>
        <div class="category-menu-content">
          ${categoryMenuGroups
            .map(
              (group) => `
                <section ${group.name === first ? "" : "hidden"} data-category-panel="${escapeHtml(group.name)}">
                  <h3>${escapeHtml(group.name)}</h3>
                  <div>
                    ${group.items.map((item) => `<a href="${categoryMenuLink(item)}">${escapeHtml(item)}</a>`).join("")}
                  </div>
                  <a class="category-menu-view-all" href="${categoryMenuLink(group.search)}">View all ${escapeHtml(group.name)}</a>
                </section>
              `
            )
            .join("")}
        </div>
      </div>
      <a class="category-menu-directory" href="products.html">View all products</a>
    </div>
  `;
}

function closeCategoryMenus() {
  $$(".category-mega-panel").forEach((panel) => {
    panel.hidden = true;
  });
  $$("[data-category-menu]").forEach((button) => {
    button.classList.remove("is-active");
    button.setAttribute("aria-expanded", "false");
  });
}

function openCategoryMenu(button) {
  const header = button.closest(".site-header");
  const panel = header?.querySelector(".category-mega-panel");
  if (!panel) return;
  const willOpen = panel.hidden;
  closeCategoryMenus();
  panel.hidden = !willOpen;
  button.classList.toggle("is-active", willOpen);
  button.setAttribute("aria-expanded", String(willOpen));
}

function ensureCategoryMenus() {
  $$(".site-header").forEach((header) => {
    const nav = header.querySelector(".category-nav");
    const trigger = Array.from(nav?.querySelectorAll(".nav-pill") || []).find((pill) => pill.textContent.trim().toLowerCase() === "category");
    if (!nav || !trigger || header.querySelector(".category-mega-panel")) return;
    trigger.classList.remove("is-active");
    trigger.removeAttribute("data-scroll");
    trigger.removeAttribute("data-hover-scroll");
    trigger.setAttribute("data-category-menu", "");
    trigger.setAttribute("aria-expanded", "false");
    nav.insertAdjacentHTML("afterend", categoryMenuTemplate());
    const panel = header.querySelector(".category-mega-panel");
    panel?.querySelectorAll("[data-category-tab]").forEach((tab) => {
      tab.addEventListener("click", () => {
        const selected = tab.dataset.categoryTab;
        panel.querySelectorAll("[data-category-tab]").forEach((item) => item.classList.toggle("is-active", item === tab));
        panel.querySelectorAll("[data-category-panel]").forEach((section) => {
          section.hidden = section.dataset.categoryPanel !== selected;
        });
      });
    });
    panel?.querySelector(".category-menu-search input")?.addEventListener("input", (event) => {
      const term = event.currentTarget.value.trim().toLowerCase();
      panel.querySelectorAll(".category-menu-content a:not(.category-menu-view-all)").forEach((link) => {
        link.hidden = Boolean(term) && !link.textContent.toLowerCase().includes(term);
      });
    });
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
  ["name", "brand", "price", "mrp", "stock", "hsn", "unit", "gstRate", "description", "image", "images"].forEach((fieldName) => {
    if (productAdminForm.elements[fieldName]) productAdminForm.elements[fieldName].value = "";
  });
  populateBrandSelect("");
  if (productImagePreview) productImagePreview.src = "assets/hero-dental-shop.png";
  renderProductGalleryPreview([]);
  if (productAdminMessage) productAdminMessage.textContent = "Ready to add a new product.";
}

function productRowTemplate(data) {
  return `
    <strong>${escapeHtml(data.name)}<small>${escapeHtml(data.brand)} | HSN ${escapeHtml(data.hsn)} | GST ${escapeHtml(data.gstRate)}%</small></strong>
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
  row.dataset.id = product.id;
  row.dataset.name = product.name;
  row.dataset.brand = product.brand;
  row.dataset.category = product.category;
  row.dataset.price = product.price;
  row.dataset.mrp = product.mrp;
  row.dataset.stock = product.stock;
  row.dataset.description = product.description;
  row.dataset.image = product.image;
  row.dataset.images = product.images.join("\n");
  row.dataset.hsn = product.hsn;
  row.dataset.unit = product.unit;
  row.dataset.gstRate = product.gstRate;
  row.innerHTML = productRowTemplate(product);
}

function adminProductsFromRows() {
  if (!productAdminTable) return [];
  return $$("#productAdminTable .product-admin-row:not(.product-admin-head)").map((row) =>
    normalizeAdminProduct({
      name: row.dataset.name,
      id: row.dataset.id,
      brand: row.dataset.brand,
      category: row.dataset.category,
      price: row.dataset.price,
      mrp: row.dataset.mrp,
      stock: row.dataset.stock,
      description: row.dataset.description,
      image: row.dataset.image,
      images: row.dataset.images,
      hsn: row.dataset.hsn,
      unit: row.dataset.unit,
      gstRate: row.dataset.gstRate,
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
  renderBrandsOnStorefront();
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
  const discount = productDiscount(product);
  return `
    <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" />
    <div class="product-meta">
      <h3>${escapeHtml(product.name)}</h3>
      <div class="rating"><i data-lucide="star"></i> ${escapeHtml(product.rating)} <span>${escapeHtml(product.stock)} in stock</span></div>
      <div class="price-row">
        <strong>${formatMoney(product.price)}</strong>
        ${Number(product.mrp || 0) > Number(product.price || 0) ? `<small>${formatMoney(product.mrp)}</small>` : ""}
        ${discount ? `<span>${escapeHtml(discount)}</span>` : ""}
      </div>
      <button class="add-cart" type="button" data-product="${escapeHtml(product.name)}" data-price="${escapeHtml(product.price)}">
        <i data-lucide="shopping-bag"></i> Add
      </button>
    </div>
  `;
}

function applyProductCardData(card, product) {
  card.dataset.productId = product.id || slugifyProduct(product.name);
  card.dataset.name = product.name;
  card.dataset.brand = product.brand;
  card.dataset.category = `${product.category.toLowerCase()} deals best`;
  card.dataset.price = product.price;
  card.dataset.rating = product.rating;
  card.setAttribute("role", "link");
  card.setAttribute("tabindex", "0");
  card.setAttribute("aria-label", `Open ${product.name} details`);
  card.innerHTML = productCardTemplate(product);
}

function renderAdminProductsOnStorefront() {
  if (!productGrid) return;
  const products = loadAdminProducts();
  const hasManagedCatalog = localStorage.getItem(ADMIN_PRODUCTS_KEY) !== null;
  if (!products.length && !hasManagedCatalog) return;
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

function productDiscount(product) {
  const mrp = Number(product.mrp || 0);
  const price = Number(product.price || 0);
  if (!mrp || !price || mrp <= price) return "";
  return `${Math.round(((mrp - price) / mrp) * 100)}% off`;
}

function defaultProductSpecs(product) {
  return {
    Brand: product.brand || "Dental Factory",
    Category: product.category || "Dental product",
    HSN: product.hsn || DEFAULT_HSN,
    GST: `${Number(product.gstRate ?? DEFAULT_GST_RATE)}%`,
  };
}

function renderPageDetailThumbs(product) {
  if (!pageDetailThumbs) return;
  const images = normalizeProductImages(product);
  pageDetailThumbs.innerHTML = images
    .map(
      (image, index) =>
        `<button class="${index === 0 ? "is-active" : ""}" type="button" aria-label="${index === 0 ? "Main product view" : `Product view ${index + 1}`}"><img src="${escapeHtml(
          image
        )}" alt="" /></button>`
    )
    .join("");
}

function renderProductGalleryPreview(images) {
  if (!productGalleryPreview) return;
  const galleryImages = uniqueImages(images);
  productGalleryPreview.innerHTML = galleryImages
    .map((image) => `<img src="${escapeHtml(image)}" alt="Product gallery image preview" />`)
    .join("");
}

function currentAdminFormImages() {
  if (!productAdminForm) return [];
  return normalizeProductImages({
    image: productAdminForm.elements.image?.value || "",
    images: productAdminForm.elements.images?.value || "",
  }).filter((image) => image !== "assets/hero-dental-shop.png");
}

function updateAdminImagePreview() {
  if (!productAdminForm) return;
  const images = currentAdminFormImages();
  const primaryImage = images[0] || productAdminForm.elements.image?.value.trim() || "assets/hero-dental-shop.png";
  if (productImagePreview) productImagePreview.src = primaryImage;
  renderProductGalleryPreview(images);
}

function renderProductDetailPage() {
  if (!pageDetailTitle) return;
  const identifier = searchParams().get("product") || searchParams().get("id") || searchParams().get("name") || pageDetailTitle.textContent;
  const product = getCatalogProduct(identifier);
  if (!product.name) return;

  document.title = `${product.name} | Dental Factory`;
  if (detailBreadcrumbCurrent) detailBreadcrumbCurrent.textContent = product.name;
  if (pageDetailTitle) pageDetailTitle.textContent = product.name;
  if (pageDetailImage) {
    pageDetailImage.src = product.image;
    pageDetailImage.alt = product.name;
  }
  if (pageDetailBadge) pageDetailBadge.hidden = true;
  if (pageDetailDescription) pageDetailDescription.textContent = product.description || "Factory-direct dental product.";
  if (pageDetailRating) {
    pageDetailRating.innerHTML = `<i data-lucide="star"></i> ${escapeHtml(product.rating || "4.5")} <span>${escapeHtml(
      product.stock ? `${product.stock} in stock` : product.brand || ""
    )}</span>`;
  }
  if (pageDetailPrice) pageDetailPrice.textContent = formatMoney(product.price);
  if (pageDetailMrp) pageDetailMrp.textContent = Number(product.mrp || 0) > Number(product.price || 0) ? formatMoney(product.mrp) : "";
  if (pageDetailDiscount) pageDetailDiscount.textContent = productDiscount(product);
  if (pageDetailDelivery) pageDetailDelivery.textContent = product.delivery || "Dispatch estimate available after pincode.";
  if (pageDetailAddCart) {
    pageDetailAddCart.dataset.product = product.name;
    pageDetailAddCart.dataset.price = String(product.price);
  }
  if (pageDetailSpecs) {
    const specs = Object.keys(product.specs || {}).length ? product.specs : defaultProductSpecs(product);
    pageDetailSpecs.innerHTML = Object.entries(specs)
      .map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`)
      .join("");
  }
  renderPageDetailThumbs(product);
  setIcons();
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

function normalOrderStatus(status) {
  const value = String(status || "Request received").trim().toLowerCase();
  return ORDER_STATUS_FLOW.find((item) => item.toLowerCase() === value) || (value.includes("cancel") ? ORDER_CANCELLED_STATUS : "Request received");
}

function nextOrderStatus(status) {
  const current = normalOrderStatus(status);
  const index = ORDER_STATUS_FLOW.indexOf(current);
  return ORDER_STATUS_FLOW[Math.min(index + 1, ORDER_STATUS_FLOW.length - 1)] || ORDER_STATUS_FLOW[1];
}

function orderPrimaryAction(status) {
  const next = nextOrderStatus(status);
  if (next === "Callback done") return "Mark callback";
  if (next === "Packed") return "Mark packed";
  if (next === "Shipped") return "Mark shipped";
  if (next === "Delivered") return "Mark delivered";
  return "Delivered";
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
    row.dataset.orderId = order.id || "";
    row.dataset.status = order.status || "Request received";
    const isClosed = /delivered|cancelled/i.test(order.status || "");
    const nextStatus = nextOrderStatus(order.status);
    const paymentLabel = order.payment?.status ? `${order.payment.status} via ${order.payment.method || order.customer?.payment || "payment"}` : order.customer?.payment || "Payment pending";
    row.innerHTML = `
      <strong>${escapeHtml(order.id)}</strong>
      <span>${escapeHtml(order.customer?.name || "Customer")} - ${escapeHtml(orderItemSummary(order))}<small>${escapeHtml(order.customer?.phone || "")} | ${escapeHtml(formatDateTime(order.createdAt))} | ${escapeHtml(paymentLabel)} | ${escapeHtml(formatMoney(order.total || 0))}</small><small>${escapeHtml(order.customer?.address || "Address not saved")}</small></span>
      <b>${escapeHtml(order.status || "Request received")}</b>
      <div class="order-actions">
        <button type="button" data-order-status="${escapeHtml(nextStatus)}" ${isClosed ? "disabled" : ""}>${escapeHtml(orderPrimaryAction(order.status))}</button>
        <button type="button" data-order-status="${escapeHtml(ORDER_CANCELLED_STATUS)}" ${isClosed ? "disabled" : ""}>Cancel</button>
        <button type="button" data-generate-invoice>Generate invoice</button>
        <a href="tel:${escapeHtml(order.customer?.phone || "")}">Call</a>
      </div>
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

function invoiceNumber(order) {
  const date = new Date(order.createdAt || Date.now());
  const stamp = date.toISOString().slice(0, 10).replace(/-/g, "");
  return `DF/${stamp}/${String(order.id || "ORDER").replace(/^DF-?/i, "")}`;
}

function invoiceLine(item, index) {
  const qty = Math.max(1, Number(item.qty || 1));
  const rate = Math.max(0, Number(item.price || 0));
  const gstRate = Math.max(0, Number(item.gstRate ?? DEFAULT_GST_RATE));
  const gross = rate * qty;
  const taxable = gstRate ? gross / (1 + gstRate / 100) : gross;
  const gstAmount = gross - taxable;
  return {
    serial: index + 1,
    description: item.name || "Dental product",
    hsn: item.hsn || DEFAULT_HSN,
    qty,
    unit: item.unit || DEFAULT_UNIT,
    unitPrice: taxable / qty,
    gstRate,
    gstAmount,
    amount: gross,
  };
}

function invoiceRows(order) {
  const rows = (Array.isArray(order.items) ? order.items : []).map(invoiceLine);
  const shippingCharge = Number(order.shipping?.charge || 0);
  if (shippingCharge > 0) {
    rows.push({
      serial: rows.length + 1,
      description: "Shipping and handling",
      hsn: "9968",
      qty: 1,
      unit: "Service",
      unitPrice: shippingCharge,
      gstRate: 0,
      gstAmount: 0,
      amount: shippingCharge,
    });
  }
  return rows;
}

function rupees(value) {
  return formatMoney(Number(value || 0));
}

function invoiceHtml(order) {
  const rows = invoiceRows(order);
  const taxableTotal = rows.reduce((sum, row) => sum + row.unitPrice * row.qty, 0);
  const gstTotal = rows.reduce((sum, row) => sum + row.gstAmount, 0);
  const grandTotal = Number(order.total || rows.reduce((sum, row) => sum + row.amount, 0));
  const customer = order.customer || {};
  const customerName = customer.clinic || customer.name || "Customer";
  const invoiceDate = formatDateTime(order.createdAt || new Date().toISOString());
  const rowHtml = rows
    .map(
      (row) => `
        <tr>
          <td contenteditable="true">${escapeHtml(row.serial)}</td>
          <td contenteditable="true">${escapeHtml(row.description)}</td>
          <td contenteditable="true">${escapeHtml(row.hsn)}</td>
          <td contenteditable="true">${escapeHtml(row.qty)}</td>
          <td contenteditable="true">${escapeHtml(row.unit)}</td>
          <td contenteditable="true">${escapeHtml(rupees(row.unitPrice))}</td>
          <td contenteditable="true">${escapeHtml(row.gstRate)}%<br><small>${escapeHtml(rupees(row.gstAmount))}</small></td>
          <td contenteditable="true">${escapeHtml(rupees(row.amount))}</td>
        </tr>`
    )
    .join("");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Invoice ${escapeHtml(invoiceNumber(order))}</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; background: #eef5f5; color: #0d1d26; font-family: Arial, sans-serif; }
      .toolbar { position: sticky; top: 0; display: flex; gap: 10px; justify-content: flex-end; padding: 14px 24px; background: #0f8b8d; }
      .toolbar button { min-height: 38px; padding: 0 16px; border: 0; border-radius: 4px; font-weight: 700; cursor: pointer; }
      .invoice { width: min(960px, calc(100% - 28px)); margin: 24px auto; padding: 32px; background: white; border: 1px solid #d6e2e3; }
      .top { display: grid; grid-template-columns: 1.4fr 0.8fr; gap: 24px; border-bottom: 3px solid #0f8b8d; padding-bottom: 18px; }
      h1 { margin: 0 0 8px; font-size: 30px; letter-spacing: 0; }
      h2 { margin: 0 0 8px; font-size: 16px; }
      p { margin: 3px 0; line-height: 1.35; }
      .muted { color: #60727b; }
      .block-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin: 22px 0; }
      .box { border: 1px solid #d6e2e3; padding: 14px; min-height: 132px; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      th, td { border: 1px solid #d6e2e3; padding: 10px; text-align: left; vertical-align: top; }
      th { background: #e7f4f4; font-size: 12px; text-transform: uppercase; }
      td:nth-child(1), td:nth-child(4), td:nth-child(5), td:nth-child(6), td:nth-child(7), td:nth-child(8) { text-align: right; }
      td[contenteditable="true"], .editable { outline: 1px dashed transparent; }
      td[contenteditable="true"]:focus, .editable:focus { outline-color: #0f8b8d; background: #f3fbfb; }
      .totals { width: min(420px, 100%); margin-left: auto; margin-top: 18px; border: 1px solid #d6e2e3; }
      .totals div { display: flex; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid #d6e2e3; }
      .totals div:last-child { border-bottom: 0; font-size: 18px; font-weight: 800; background: #e7f4f4; }
      .note { margin-top: 24px; padding: 12px; border: 1px solid #ecd49d; background: #fff7dc; font-size: 13px; }
      @media print { body { background: white; } .toolbar { display: none; } .invoice { width: 100%; margin: 0; border: 0; } }
    </style>
  </head>
  <body>
    <div class="toolbar"><button onclick="window.print()">Print / Save PDF</button></div>
    <main class="invoice">
      <section class="top">
        <div>
          <h1>${escapeHtml(businessInfo.brand)}</h1>
          <p><strong>${escapeHtml(businessInfo.legalName)}</strong></p>
          <p>${escapeHtml(businessInfo.address)}</p>
          <p>Mobile: ${escapeHtml(businessInfo.phone)}</p>
          <p>Email: ${escapeHtml(businessInfo.email)}</p>
          <p>GSTIN: ${escapeHtml(businessInfo.gstin)}</p>
        </div>
        <div>
          <h2>Order Invoice</h2>
          <p><strong>Invoice No:</strong> <span class="editable" contenteditable="true">${escapeHtml(invoiceNumber(order))}</span></p>
          <p><strong>Invoice Date:</strong> ${escapeHtml(invoiceDate)}</p>
          <p><strong>Order ID:</strong> ${escapeHtml(order.id || "")}</p>
          <p><strong>Status:</strong> ${escapeHtml(order.status || "Request received")}</p>
          <p><strong>Payment:</strong> ${escapeHtml(order.payment?.method || customer.payment || "")}</p>
        </div>
      </section>

      <section class="block-grid">
        <div class="box">
          <h2>Bill To</h2>
          <p class="editable" contenteditable="true"><strong>${escapeHtml(customerName)}</strong></p>
          <p class="editable" contenteditable="true">${escapeHtml(customer.name || "")}</p>
          <p class="editable" contenteditable="true">${escapeHtml(customer.address || "")}</p>
          <p>Phone: <span class="editable" contenteditable="true">${escapeHtml(customer.phone || "")}</span></p>
          <p>GSTIN: <span class="editable" contenteditable="true">${escapeHtml(customer.gstin || "Add if available")}</span></p>
        </div>
        <div class="box">
          <h2>Ship To</h2>
          <p class="editable" contenteditable="true"><strong>${escapeHtml(customerName)}</strong></p>
          <p class="editable" contenteditable="true">${escapeHtml(customer.address || "")}</p>
          <p>Phone: <span class="editable" contenteditable="true">${escapeHtml(customer.phone || "")}</span></p>
        </div>
      </section>

      <table>
        <thead>
          <tr>
            <th>Serial No.</th>
            <th>Description of Goods</th>
            <th>HSN</th>
            <th>Qty</th>
            <th>Unit</th>
            <th>Unit Price</th>
            <th>GST</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>${rowHtml}</tbody>
      </table>

      <section class="totals">
        <div><span>Taxable value</span><strong>${escapeHtml(rupees(taxableTotal))}</strong></div>
        <div><span>GST amount</span><strong>${escapeHtml(rupees(gstTotal))}</strong></div>
        <div><span>Grand total</span><strong>${escapeHtml(rupees(grandTotal))}</strong></div>
      </section>

      <p class="note">This is an auto-generated website order invoice/order summary for processing. Final statutory GST tax invoice can be issued from Bharti Dent India records. HSN/GST fields are editable before printing if a product needs correction.</p>
    </main>
  </body>
</html>`;
}

function openInvoiceWindow(order, popup = window.open("", "_blank", "width=1100,height=820")) {
  if (!popup) {
    if (adminActionMessage) adminActionMessage.textContent = "Popup blocked. Allow popups for this site, then click Generate invoice again.";
    return;
  }
  popup.document.open();
  popup.document.write(invoiceHtml(order));
  popup.document.close();
}

function renderTrackingResult(order) {
  if (!trackingResult) return;
  const status = order.status || "Request received";
  const steps = ORDER_STATUS_FLOW;
  const activeIndex = Math.max(0, steps.findIndex((step) => step.toLowerCase() === normalOrderStatus(status).toLowerCase()));
  trackingResult.innerHTML = `
    <div class="tracking-head">
      <span class="badge">${escapeHtml(status)}</span>
      <h2>${escapeHtml(order.id)}</h2>
      <p>${escapeHtml(orderItemSummary(order))}</p>
      <p>${escapeHtml(order.payment?.status || "Payment pending")} | ${escapeHtml(order.payment?.method || order.customer?.payment || "Payment method pending")}</p>
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
  if (isUnlocked) scheduleAdminAutoLogout();
  else clearAdminAutoLogout();
}

function renderAdminStorageNotice(session = {}) {
  if (!adminStorageNotice) return;
  const warning = session.storage?.message || "";
  adminStorageNotice.hidden = !warning;
  adminStorageNotice.textContent = warning;
}

function clearAdminAutoLogout() {
  if (adminAutoLogoutTimer) window.clearTimeout(adminAutoLogoutTimer);
  adminAutoLogoutTimer = null;
}

function scheduleAdminAutoLogout() {
  clearAdminAutoLogout();
  if (!adminDashboard || adminDashboard.hidden) return;
  adminAutoLogoutTimer = window.setTimeout(async () => {
    try {
      await logoutAdmin();
    } catch {}
    setAdminUnlocked(false);
    if (adminAuthMessage) {
      adminAuthMessage.textContent = `Logged out automatically after ${adminSessionMinutes} minutes for security.`;
    }
  }, Math.max(5, adminSessionMinutes) * 60 * 1000);
}

async function initAdminAuth() {
  if (!adminAuth && !adminDashboard) return;
  try {
    await logoutAdmin();
  } catch {}
  const session = await getAdminSession();
  renderAdminStorageNotice(session);
  setAdminUnlocked(false);
  if (adminAuthMessage) {
    adminAuthMessage.textContent = "Admin ID and password required before product and order management.";
  }
}

document.addEventListener("click", async (event) => {
  const categoryMenuButton = event.target.closest("[data-category-menu]");
  if (categoryMenuButton) {
    event.preventDefault();
    openCategoryMenu(categoryMenuButton);
    return;
  }

  if (!event.target.closest(".category-mega-panel")) {
    closeCategoryMenus();
  }

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

  const clickedProductCard = event.target.closest(".product-card");
  if (clickedProductCard && !event.target.closest("button, a, input, select, textarea, label")) {
    window.location.href = productDetailUrl(clickedProductCard.dataset.productId || clickedProductCard.dataset.name);
    return;
  }

  const membershipCard = event.target.closest(".membership-card[data-membership-type]");
  if (membershipCard) {
    const selectedType = membershipCard.dataset.membershipType || "dentist";
    const account = loadCustomerAccount();
    if (!account?.clinic) {
      setAccountFormType(selectedType);
      openAccount(event);
      if (accountMessage) accountMessage.textContent = `${membershipPlans[selectedType]} selected. Continue with mobile to activate.`;
    } else {
      const updatedAccount = { ...account, type: selectedType };
      saveCustomerAccount(updatedAccount);
      updateAccountButtons();
      try {
        await saveBackendAccount(updatedAccount);
      } catch {}
      showToast(`${membershipPlans[selectedType]} activated for ${accountDisplayName(updatedAccount)}.`);
    }
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
    populateBrandSelect(row.dataset.brand);
    productAdminForm.elements.category.value = row.dataset.category;
    productAdminForm.elements.price.value = row.dataset.price;
    productAdminForm.elements.mrp.value = row.dataset.mrp;
    productAdminForm.elements.stock.value = row.dataset.stock;
    productAdminForm.elements.hsn.value = row.dataset.hsn || DEFAULT_HSN;
    productAdminForm.elements.unit.value = row.dataset.unit || DEFAULT_UNIT;
    productAdminForm.elements.gstRate.value = row.dataset.gstRate || DEFAULT_GST_RATE;
    productAdminForm.elements.description.value = row.dataset.description;
    productAdminForm.elements.image.value = row.dataset.image;
    if (productAdminForm.elements.images) productAdminForm.elements.images.value = row.dataset.images || row.dataset.image || "";
    updateAdminImagePreview();
    if (productAdminMessage) productAdminMessage.textContent = `Editing ${row.dataset.name}.`;
    productAdminForm.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const deleteProductButton = event.target.closest("[data-delete-product]");
  if (deleteProductButton && productAdminTable) {
    const row = deleteProductButton.closest(".product-admin-row");
    const productName = row?.dataset.name || "Product";
    const productId = row?.dataset.id || slugifyProduct(productName);
    deleteProductButton.disabled = true;
    if (productAdminMessage) productAdminMessage.textContent = `Deleting ${productName} from backend...`;
    try {
      await deleteBackendProduct(productId || productName);
      syncLocalAdminProducts(loadAdminProducts().filter((product) => product.name !== productName && product.id !== productId));
      if (productAdminForm?.elements.editing.value === productName) {
        resetAdminProductForm();
      }
      if (productAdminMessage) productAdminMessage.textContent = `${productName} deleted from backend.`;
    } catch (error) {
      deleteProductButton.disabled = false;
      if (productAdminMessage) productAdminMessage.textContent = `Delete failed: ${error.message}. Start the backend server and try again.`;
    }
  }

  const editAdButton = event.target.closest("[data-edit-ad]");
  if (editAdButton && adAdminForm) {
    const row = editAdButton.closest(".ad-admin-row");
    adAdminForm.elements.editing.value = row.dataset.title;
    adAdminForm.elements.title.value = row.dataset.title;
    adAdminForm.elements.message.value = row.dataset.message;
    if (adAdminForm.elements.image) adAdminForm.elements.image.value = row.dataset.image || "";
    adAdminForm.elements.cta.value = row.dataset.cta || "";
    adAdminForm.elements.link.value = row.dataset.link || "";
    adAdminForm.elements.placement.value = row.dataset.placement || "home-banner";
    adAdminForm.elements.priority.value = row.dataset.priority || "";
    if (adAdminForm.elements.active) adAdminForm.elements.active.checked = row.dataset.active !== "false";
    if (adAdminMessage) adAdminMessage.textContent = `Editing ${row.dataset.title}.`;
    adAdminForm.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const deleteAdButton = event.target.closest("[data-delete-ad]");
  if (deleteAdButton && adAdminTable) {
    const row = deleteAdButton.closest(".ad-admin-row");
    const adTitle = row?.dataset.title || "Ad";
    const adId = row?.dataset.id || slugifyProduct(adTitle);
    deleteAdButton.disabled = true;
    if (adAdminMessage) adAdminMessage.textContent = `Deleting ${adTitle} from backend...`;
    try {
      await deleteBackendAd(adId || adTitle);
      syncLocalAdminAds(loadAdminAds().filter((ad) => ad.title !== adTitle && ad.id !== adId));
      if (adAdminForm?.elements.editing.value === adTitle) resetAdminAdForm();
      if (adAdminMessage) adAdminMessage.textContent = `${adTitle} deleted.`;
    } catch (error) {
      deleteAdButton.disabled = false;
      if (adAdminMessage) adAdminMessage.textContent = `Ad delete failed: ${error.message}`;
    }
  }

  const editBrandButton = event.target.closest("[data-edit-brand]");
  if (editBrandButton && brandAdminForm) {
    const row = editBrandButton.closest(".brand-admin-row");
    brandAdminForm.elements.editing.value = row.dataset.name;
    brandAdminForm.elements.name.value = row.dataset.name;
    brandAdminForm.elements.logo.value = row.dataset.logo || "";
    if (brandAdminForm.elements.featured) brandAdminForm.elements.featured.checked = row.dataset.featured !== "false";
    if (brandAdminMessage) brandAdminMessage.textContent = `Editing ${row.dataset.name}.`;
    brandAdminForm.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const deleteBrandButton = event.target.closest("[data-delete-brand]");
  if (deleteBrandButton && brandAdminTable) {
    const row = deleteBrandButton.closest(".brand-admin-row");
    const brandName = row?.dataset.name || "Brand";
    const brandId = row?.dataset.id || slugifyProduct(brandName);
    deleteBrandButton.disabled = true;
    if (brandAdminMessage) brandAdminMessage.textContent = `Deleting ${brandName} from backend...`;
    try {
      await deleteBackendBrand(brandId || brandName);
      syncLocalAdminBrands(loadAdminBrands().filter((brand) => brand.name !== brandName && brand.id !== brandId));
      if (brandAdminForm?.elements.editing.value === brandName) resetAdminBrandForm();
      if (brandAdminMessage) brandAdminMessage.textContent = `${brandName} deleted from backend.`;
    } catch (error) {
      deleteBrandButton.disabled = false;
      if (brandAdminMessage) brandAdminMessage.textContent = `Brand delete failed: ${error.message}`;
    }
  }

  const orderStatusButton = event.target.closest("[data-order-status]");
  if (orderStatusButton && adminOrdersTable) {
    const row = orderStatusButton.closest("[data-order-id]");
    const orderId = row?.dataset.orderId || "";
    const status = orderStatusButton.dataset.orderStatus || "";
    orderStatusButton.disabled = true;
    if (adminActionMessage) adminActionMessage.textContent = `Updating ${orderId} to ${status}...`;
    try {
      const updatedOrder = await updateBackendOrderStatus(orderId, status);
      latestAdminOrders = latestAdminOrders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order));
      renderAdminOrders(latestAdminOrders);
      if (adminActionMessage) adminActionMessage.textContent = `${updatedOrder.id} is now ${updatedOrder.status}.`;
    } catch (error) {
      orderStatusButton.disabled = false;
      if (adminActionMessage) adminActionMessage.textContent = `Order update failed: ${error.message}`;
    }
  }

  const invoiceButton = event.target.closest("[data-generate-invoice]");
  if (invoiceButton && adminOrdersTable) {
    const row = invoiceButton.closest("[data-order-id]");
    const orderId = row?.dataset.orderId || "";
    const popup = window.open("", "_blank", "width=1100,height=820");
    if (!popup) {
      if (adminActionMessage) adminActionMessage.textContent = "Popup blocked. Allow popups for this site, then click Generate invoice again.";
      return;
    }
    popup.document.open();
    popup.document.write("<!doctype html><title>Generating invoice</title><p style='font-family:Arial;padding:24px'>Generating invoice...</p>");
    popup.document.close();
    invoiceButton.disabled = true;
    if (adminActionMessage) adminActionMessage.textContent = `Generating invoice for ${orderId}...`;
    try {
      const order = await fetchBackendOrder(orderId);
      openInvoiceWindow(order, popup);
      if (adminActionMessage) adminActionMessage.textContent = `Invoice window opened for ${order.id}.`;
    } catch (error) {
      popup.close();
      if (adminActionMessage) adminActionMessage.textContent = `Invoice failed: ${error.message}`;
    } finally {
      invoiceButton.disabled = false;
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
  button.addEventListener("click", (event) => {
    if (loadCustomerAccount()?.clinic && button.id === "membershipAction") {
      event.preventDefault();
      $("#membership")?.scrollIntoView({ behavior: "smooth", block: "start" });
      showToast(`${membershipAction?.textContent || "Membership"} is active.`);
      return;
    }
    openAccount(event);
  });
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
$$("[id='loginButton']").forEach((button) => button.addEventListener("click", openAccount));
if (accountModal) ensureAccountModal();
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

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  hideCart();
  hideCheckout();
  hideProductDetails();
  hideAccount();
  closeDeliveryLocation();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest?.(".product-card");
  if (!card || event.target.closest("button, a, input, select, textarea, label")) return;
  event.preventDefault();
  window.location.href = productDetailUrl(card.dataset.productId || card.dataset.name);
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
if ($("#homePromoSlider")?.querySelectorAll(".promo-slide").length > 1) {
  setInterval(() => showSlide(activeSlide + 1), 7000);
}

deliveryForm?.addEventListener("click", (event) => {
  if (event.target.closest("button[type='submit']")) return;
  event.preventDefault();
  openDeliveryLocation();
});

pincodeInput?.addEventListener("focus", () => {
  openDeliveryLocation();
});

deliveryForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const pin = pincodeInput?.value.trim() || "";
  if (!validPincode(pin)) {
    if (deliveryNote) deliveryNote.textContent = "Enter a valid 6 digit pincode.";
    openDeliveryLocation("Enter a valid 6 digit pincode.");
    return;
  }
  saveDeliveryPin(pin, { closeModal: false });
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
  const phoneDigits = customer.phone.replace(/\D/g, "");

  if (!customer.name || phoneDigits.length !== 10 || !customer.address) {
    if (messageNode) messageNode.textContent = "Enter name, 10 digit mobile number, and delivery address.";
    return;
  }

  if (customer.payment === CASH_ON_DELIVERY_METHOD && !isCashCodEligible()) {
    if (messageNode) messageNode.textContent = `Cash COD is available only for standard orders up to ${formatMoney(CASH_COD_LIMIT)}. Choose Pine Labs card swipe, UPI, bank transfer, or online payment.`;
    updatePaymentOptions();
    return;
  }

  submitButton.disabled = true;
  const isOnlinePayment = customer.payment === ONLINE_PAYMENT_METHOD;
  if (messageNode) messageNode.textContent = isOnlinePayment ? "Preparing online payment..." : "Saving order request to backend...";

  try {
    if (isOnlinePayment) {
      await startRazorpayPayment(customer, messageNode, summaryNode, form);
    } else {
      const order = await saveBackendOrder(customer);
      showCheckoutSuccess(messageNode, customer, order);
      cart.clear();
      renderCart();
      if (summaryNode) renderSummary(summaryNode);
      form.reset();
    }
  } catch (error) {
    if (messageNode) messageNode.textContent = `Checkout failed: ${error.message}`;
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

  const localAccount = {
    ...loadCustomerAccount(),
    ...account,
    status: loadCustomerAccount()?.status || "Callback pending",
    updatedAt: new Date().toISOString(),
  };
  saveCustomerAccount(localAccount);
  updateAccountButtons();
  renderAccountProfile(localAccount);

  submitButton.disabled = true;
  if (messageNode) messageNode.textContent = "Saving account request...";
  try {
    const savedAccount = await saveBackendAccount(account);
    saveCustomerAccount(savedAccount);
    updateAccountButtons();
    renderAccountProfile(savedAccount);
    if (messageNode) messageNode.textContent = `${savedAccount.clinic} account request saved. We will verify by phone.`;
    form.reset();
    if (closeAfterSave) window.setTimeout(hideAccount, 900);
  } catch (error) {
    if (messageNode) messageNode.textContent = `Details saved on this device. Backend sync failed: ${error.message}`;
  } finally {
    submitButton.disabled = false;
  }
}

const initialAccountForm = $("#accountForm");
if (initialAccountForm && !initialAccountForm.dataset.accountWired) {
  initialAccountForm.dataset.accountWired = "true";
  initialAccountForm.addEventListener("submit", (event) => submitAccountForm(event, accountMessage, true));
}

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

function autoTrackInitialOrder() {
  if (!trackOrderForm) return;
  let order = searchParams().get("order") || "";
  if (!order) {
    try {
      const saved = JSON.parse(localStorage.getItem(LAST_ORDER_KEY) || "null");
      order = saved?.id || "";
    } catch {}
  }
  if (!order) return;
  trackOrderForm.elements.order.value = order;
  trackOrderForm.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
}

adminSearch?.addEventListener("input", () => {
  const term = adminSearch.value.trim().toLowerCase();
  $$(".admin-table > div, .stock-list > div, .enquiry-board > div, .product-admin-row:not(.product-admin-head), .brand-admin-row:not(.brand-admin-head), .ad-admin-row:not(.ad-admin-head)").forEach((row) => {
    row.hidden = term && !row.textContent.toLowerCase().includes(term);
  });
});

adminLoginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const submitButton = form.querySelector("button[type='submit']");
  submitButton.disabled = true;
  if (adminAuthMessage) adminAuthMessage.textContent = "Checking admin ID and password...";
  try {
    await loginAdmin(password, username);
    const session = await getAdminSession();
    renderAdminStorageNotice(session);
    form.reset();
    setAdminUnlocked(true);
    if (adminAuthMessage) adminAuthMessage.textContent = "";
    await syncAdsFromBackend();
    await syncBrandsFromBackend();
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

["click", "keydown", "touchstart"].forEach((eventName) => {
  document.addEventListener(eventName, () => {
    if (adminDashboard && !adminDashboard.hidden) scheduleAdminAutoLogout();
  });
});

addStockButton?.addEventListener("click", () => {
  $("#products-admin")?.scrollIntoView({ behavior: "smooth", block: "start" });
  if (productAdminMessage) productAdminMessage.textContent = "Edit a product stock quantity, then press Save product.";
  productAdminForm?.elements.stock?.focus();
});

assignCallbackButton?.addEventListener("click", () => {
  if (adminActionMessage) adminActionMessage.textContent = "Callback queue ready. Open an enquiry below, then call or WhatsApp the customer.";
  $("#enquiries")?.scrollIntoView({ behavior: "smooth", block: "start" });
});

function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result || "")));
    reader.readAsDataURL(file);
  });
}

function loadImageForResize(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image), { once: true });
    image.addEventListener("error", reject, { once: true });
    image.src = src;
  });
}

async function readImageFile(file, options = {}) {
  const dataUrl = await fileToDataUrl(file);
  if (!String(file.type || "").startsWith("image/") || file.type === "image/gif") return dataUrl;

  const maxDimension = Number(options.maxDimension || 1400);
  const maxBytes = Number(options.maxBytes || 900 * 1024);
  const quality = Number(options.quality || 0.86);
  try {
    if (file.size <= maxBytes) return dataUrl;
    const image = await loadImageForResize(dataUrl);
    const largestSide = Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height);
    const scale = largestSide > maxDimension ? maxDimension / largestSide : 1;
    const width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
    const height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return dataUrl;
    context.drawImage(image, 0, 0, width, height);
    const outputType = options.preserveTransparency && file.type === "image/png" ? "image/png" : "image/jpeg";
    return canvas.toDataURL(outputType, outputType === "image/jpeg" ? quality : undefined);
  } catch {
    return dataUrl;
  }
}

adAdminForm?.elements.imageUpload?.addEventListener("change", async (event) => {
  const file = event.currentTarget.files?.[0];
  if (!file || !adAdminForm?.elements.image) return;
  adAdminForm.elements.image.value = await readImageFile(file, { maxDimension: 1800, maxBytes: 1400 * 1024, quality: 0.86 });
  if (adAdminMessage) adAdminMessage.textContent = `${file.name} banner photo loaded. Save ad to publish it.`;
});

adAdminForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const data = {
    title: String(formData.get("title") || "").trim(),
    message: String(formData.get("message") || "").trim(),
    image: String(formData.get("image") || "").trim(),
    cta: String(formData.get("cta") || "").trim(),
    link: String(formData.get("link") || "").trim(),
    placement: String(formData.get("placement") || "home-banner"),
    active: Boolean(formData.get("active")),
    priority: Number(formData.get("priority") || 1),
  };
  const editing = String(formData.get("editing") || "");
  const submitButton = event.currentTarget.querySelector("button[type='submit']");
  submitButton.disabled = true;
  if (adAdminMessage) adAdminMessage.textContent = `Saving ${data.title} ad...`;

  try {
    const savedAd = normalizeAd(await saveBackendAd(data, editing));
    const ads = loadAdminAds();
    const existingIndex = ads.findIndex((ad) => ad.title === editing || ad.title === savedAd.title || ad.id === savedAd.id);
    if (existingIndex >= 0) {
      ads[existingIndex] = savedAd;
    } else {
      ads.push(savedAd);
    }
    syncLocalAdminAds(ads);
    resetAdminAdForm();
    if (adAdminMessage) adAdminMessage.textContent = `${savedAd.title} ad is ${savedAd.active ? "running" : "paused"}.`;
  } catch (error) {
    if (adAdminMessage) adAdminMessage.textContent = `Ad save failed: ${error.message}`;
  } finally {
    submitButton.disabled = false;
  }
});

clearAdForm?.addEventListener("click", resetAdminAdForm);
resetAdForm?.addEventListener("click", resetAdminAdForm);

brandAdminForm?.elements.logoUpload?.addEventListener("change", async (event) => {
  const file = event.currentTarget.files?.[0];
  if (!file || !brandAdminForm?.elements.logo) return;
  brandAdminForm.elements.logo.value = await readImageFile(file, { maxDimension: 900, maxBytes: 650 * 1024, preserveTransparency: true });
  if (brandAdminMessage) brandAdminMessage.textContent = `${file.name} brand logo loaded. Save brand to publish it.`;
});

brandAdminForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const data = {
    name: String(formData.get("name") || "").trim(),
    logo: String(formData.get("logo") || "").trim(),
    featured: Boolean(formData.get("featured")),
  };
  const editing = String(formData.get("editing") || "");
  const submitButton = event.currentTarget.querySelector("button[type='submit']");
  submitButton.disabled = true;
  if (brandAdminMessage) brandAdminMessage.textContent = `Saving ${data.name} to backend...`;

  try {
    const savedBrand = normalizeBrand(await saveBackendBrand(data, editing));
    const brands = loadAdminBrands();
    const existingIndex = brands.findIndex((brand) => brand.name === editing || brand.name === savedBrand.name || brand.id === savedBrand.id);
    if (existingIndex >= 0) {
      brands[existingIndex] = savedBrand;
    } else {
      brands.push(savedBrand);
    }
    syncLocalAdminBrands(brands);
    resetAdminBrandForm();
    if (brandAdminMessage) brandAdminMessage.textContent = `${savedBrand.name} saved. It is now available in product Brand select.`;
  } catch (error) {
    if (brandAdminMessage) brandAdminMessage.textContent = `Brand save failed: ${error.message}`;
  } finally {
    submitButton.disabled = false;
  }
});

clearBrandForm?.addEventListener("click", resetAdminBrandForm);
resetBrandForm?.addEventListener("click", resetAdminBrandForm);

productAdminForm?.elements.image?.addEventListener("input", () => {
  updateAdminImagePreview();
});

productAdminForm?.elements.images?.addEventListener("input", () => {
  updateAdminImagePreview();
});

productAdminForm?.elements.imageUpload?.addEventListener("change", (event) => {
  const files = Array.from(event.currentTarget.files || []);
  if (!files.length) return;
  Promise.all(
    files.map((file) => readImageFile(file, { maxDimension: 1400, maxBytes: 900 * 1024, quality: 0.86 }))
  ).then((uploadedImages) => {
    const images = uniqueImages([...currentAdminFormImages(), ...uploadedImages]);
    productAdminForm.elements.image.value = images[0] || "";
    if (productAdminForm.elements.images) productAdminForm.elements.images.value = images.join("\n");
    updateAdminImagePreview();
    if (productAdminMessage) productAdminMessage.textContent = `${files.length} image${files.length === 1 ? "" : "s"} loaded for this product.`;
  });
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
    hsn: String(formData.get("hsn") || DEFAULT_HSN).trim(),
    unit: String(formData.get("unit") || DEFAULT_UNIT).trim(),
    gstRate: Number(formData.get("gstRate") || DEFAULT_GST_RATE),
    description: formData.get("description").trim(),
    image: formData.get("image").trim() || parseImageList(formData.get("images"))[0] || "assets/hero-dental-shop.png",
    images: uniqueImages([formData.get("image").trim(), ...parseImageList(formData.get("images"))]),
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
    resetAdminProductForm();
    if (productAdminMessage) productAdminMessage.textContent = `${savedProduct.name} saved to backend.`;
  } catch (error) {
    if (productAdminMessage) productAdminMessage.textContent = `Product save failed: ${error.message}. Start the backend server and try again.`;
  } finally {
    submitButton.disabled = false;
  }
});

clearProductForm?.addEventListener("click", resetAdminProductForm);
resetProductForm?.addEventListener("click", resetAdminProductForm);

$$(".membership-card[data-membership-type]").forEach((card) => {
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      card.click();
    }
  });
});

$$('input[name="type"]').forEach((input) => input.addEventListener("change", updateAccountTypeLabels));
updateAccountTypeLabels();
hydrateAdminAds();
hydrateAdminBrands();
hydrateAdminProducts();
resetAdminAdForm();
resetAdminBrandForm();
resetAdminProductForm();
renderAdsOnStorefront();
renderBrandsOnStorefront();
renderAdminProductsOnStorefront();
injectDetailButtons();
renderProductDetailPage();
ensureCategoryMenus();
setIcons();
updateDeliveryUi();
renderCart();
updateAccountButtons();
updateMembershipUi();
loadPaymentConfig();
const initialSearch = searchParams().get("search");
if (initialSearch && searchInput) searchInput.value = initialSearch;
const initialBrand = searchParams().get("brand");
if (initialBrand) activeBrand = initialBrand;
applyFilter("all");
syncPublicAds();
syncBrandsFromBackend().then(() => {
  if (initialBrand) activeBrand = initialBrand;
  renderBrandsOnStorefront();
  applyFilter(activeFilter);
});
syncProductsFromBackend().then(() => {
  renderProductDetailPage();
  renderAdminMetrics(latestAdminOrders);
});
initAdminAuth();
autoTrackInitialOrder();
