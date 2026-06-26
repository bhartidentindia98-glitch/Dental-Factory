import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || "0.0.0.0";
const siteUrl = String(process.env.PRIMARY_SITE_URL || "https://dentalfactory.in").replace(/\/+$/, "");
const canonicalHost = new URL(siteUrl).host.toLowerCase();
const canonicalRedirectHosts = new Set(["bhartidentindia.com", "www.bhartidentindia.com", "www.dentalfactory.in"]);
const isProduction = process.env.NODE_ENV === "production";
const localAdminPassword = "DentalFactory@2026";
const adminPassword = process.env.ADMIN_PASSWORD || (isProduction ? "" : localAdminPassword);
const adminUsername = String(process.env.ADMIN_USERNAME || "admin").trim();
const localSessionSecret = "dental-factory-local-session";
const sessionSecret = process.env.SESSION_SECRET || (isProduction ? crypto.randomBytes(32).toString("hex") : localSessionSecret);
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || "";
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "";
const paymentCurrency = String(process.env.PAYMENT_CURRENCY || "INR").toUpperCase();
const googleClientId = String(process.env.GOOGLE_CLIENT_ID || "").trim();
const otpSenderName = String(process.env.OTP_SENDER_NAME || "Dental Factory").trim();
const otpSmsWebhookUrl = String(process.env.OTP_SMS_WEBHOOK_URL || process.env.OTP_SMS_URL || "").trim();
const otpSmsWebhookToken = String(process.env.OTP_SMS_WEBHOOK_TOKEN || process.env.OTP_SMS_TOKEN || "").trim();
const otpEmailWebhookUrl = String(process.env.OTP_EMAIL_WEBHOOK_URL || process.env.OTP_EMAIL_URL || "").trim();
const otpEmailWebhookToken = String(process.env.OTP_EMAIL_WEBHOOK_TOKEN || process.env.OTP_EMAIL_TOKEN || "").trim();
const otpShowDemo = process.env.OTP_SHOW_DEMO === "true" || (!isProduction && process.env.OTP_SHOW_DEMO !== "false");
const cashOnDeliveryMethod = "Cash on delivery";
const freeShippingThreshold = 2999;
const standardShippingFee = 99;
const cashCodLimit = 20000;
const freightConfirmationLimit = 25000;
const defaultHsnCode = "9018";
const defaultGstRate = 18;
const defaultUnit = "Pcs";
const defaultDataDir = path.join(rootDir, "data");
const dataDir = path.resolve(process.env.DATA_DIR || defaultDataDir);
const adminSessionMinutes = Math.min(720, Math.max(5, Number(process.env.ADMIN_SESSION_MINUTES || 30) || 30));
const productsFile = path.join(dataDir, "products.json");
const brandsFile = path.join(dataDir, "brands.json");
const adsFile = path.join(dataDir, "ads.json");
const ordersFile = path.join(dataDir, "orders.json");
const accountsFile = path.join(dataDir, "accounts.json");
const paymentAttemptsFile = path.join(dataDir, "payment-attempts.json");
const adminCookieName = "df_admin_session";
const customerCookieName = "df_customer_session";
const adminSessionMaxAgeSeconds = adminSessionMinutes * 60;
const customerSessionMaxAgeSeconds = 30 * 24 * 60 * 60;
const customerOtpMaxAgeSeconds = 10 * 60;
const maxPublicJsonBodyBytes = 256 * 1024;
const maxAdminJsonBodyBytes = 64 * 1024 * 1024;
const rateLimitStore = new Map();
const fileWriteQueues = new Map();
const orderStatuses = ["Request received", "Callback done", "Packed", "Shipped", "Delivered", "Cancelled"];
const adminAllowedIps = parseCsvEnv(process.env.ADMIN_ALLOWED_IPS);
const adminAllowedIpHashes = parseCsvEnv(process.env.ADMIN_ALLOWED_IP_HASHES).map((hash) => hash.toLowerCase());
const uploadedAssetsDir = path.join(dataDir, "uploads");
const uploadPublicPrefix = "/uploads";

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".xml", "application/xml; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".gif", "image/gif"],
  [".svg", "image/svg+xml"],
  [".ico", "image/x-icon"],
]);
const uploadImageExtensions = new Map([
  ["image/png", ".png"],
  ["image/jpeg", ".jpg"],
  ["image/jpg", ".jpg"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);
const categoryRoutes = [
  { name: "Equipment", slug: "dental-equipments", filter: "equipment", title: "Dental Equipments" },
  { name: "Rotary instruments", slug: "rotary-instruments", filter: "rotary", title: "Rotary Instruments" },
  { name: "Restoratives", slug: "restoratives", filter: "restorative", title: "Restoratives" },
  { name: "Endodontics", slug: "endodontics", filter: "endodontics", title: "Endodontics" },
  { name: "Orthodontics", slug: "orthodontics", filter: "orthodontics", title: "Orthodontics" },
  { name: "Sterilization", slug: "sterilization", filter: "sterilization", title: "Sterilization" },
  { name: "Implants", slug: "implants", filter: "implants", title: "Implants" },
];
const categoryRouteBySlug = new Map(categoryRoutes.map((category) => [category.slug, category]));
const categoryRouteByKey = new Map(
  categoryRoutes.flatMap((category) => [
    [slugify(category.name), category],
    [slugify(category.filter), category],
    [category.slug, category],
  ])
);

const publicStaticExtensions = new Set(mimeTypes.keys());
const blockedStaticDirectories = new Set([".git", "data", "node_modules", "scripts"]);
const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(self), payment=(self)",
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
  "Content-Security-Policy": [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "img-src 'self' data: https:",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self' 'unsafe-inline' https://unpkg.com https://checkout.razorpay.com https://accounts.google.com",
    "connect-src 'self' https://nominatim.openstreetmap.org https://api.razorpay.com https://accounts.google.com https://oauth2.googleapis.com",
    "frame-src https://api.razorpay.com https://checkout.razorpay.com https://accounts.google.com",
    "form-action 'self'",
  ].join("; "),
};

const defaultProducts = [
  {
    name: "Airotor Elite Handpiece",
    brand: "Waldent",
    category: "Rotary instruments",
    price: 1899,
    mrp: 2299,
    stock: 42,
    rating: "4.7",
    badge: "18% off",
    image: "assets/air-rotor.png",
    description: "Push button cartridge, clean spray, ceramic bearings.",
    delivery: "Dispatch today from Delhi warehouse",
  },
  {
    name: "Universal Composite Syringe Kit",
    brand: "3M ESPE",
    category: "Restoratives",
    price: 1249,
    mrp: 1650,
    stock: 28,
    rating: "4.8",
    badge: "Free applicators",
    image: "assets/composite-kit.png",
    description: "Microhybrid restorative shades for daily anterior and posterior work.",
    delivery: "Ships with shade guide and applicator tips",
  },
  {
    name: "Endomotor X2 With Apex Mode",
    brand: "Woodpecker",
    category: "Endodontics",
    price: 7999,
    mrp: 9450,
    stock: 18,
    rating: "4.6",
    badge: "Clinic pick",
    image: "assets/endomotor.png",
    description: "Programmable torque, auto reverse, memory presets.",
    delivery: "Priority dispatch with setup callback",
  },
  {
    name: "Class B Autoclave 18L",
    brand: "Waldent",
    category: "Sterilization",
    price: 42999,
    mrp: 49999,
    stock: 16,
    rating: "4.5",
    badge: "Installation support",
    image: "assets/autoclave.png",
    description: "Pre-vacuum cycles, printer-ready, tray set included.",
    delivery: "Delivery and installation callback included",
  },
  {
    name: "Implant Prosthetic Driver Kit",
    brand: "Dentsply",
    category: "Implants",
    price: 3499,
    mrp: 4200,
    stock: 32,
    rating: "4.4",
    badge: "New",
    image: "assets/implant-kit.png",
    description: "Hex drivers and torque adapters organized for chairside use.",
    delivery: "Ships in protective organizer case",
  },
  {
    name: "Orthodontic Bracket Starter Kit",
    brand: "Orthometric",
    category: "Orthodontics",
    price: 999,
    mrp: 1360,
    stock: 54,
    rating: "4.3",
    badge: "Value pack",
    image: "assets/bracket-kit.png",
    description: "Roth slot assortment with tubes, hooks, and labelled storage.",
    delivery: "Usually dispatched in 24 hours",
  },
  {
    name: "Alginate Impression Material Pack",
    brand: "GC",
    category: "Restoratives",
    price: 699,
    mrp: 920,
    stock: 88,
    rating: "4.2",
    badge: "Bundle",
    image: "assets/impression-kit.png",
    description: "Fast set powder, measuring scoop, and tray adhesive sample.",
    delivery: "Ships with scoop and adhesive sample",
  },
  {
    name: "Clinic Chair Unit",
    brand: "Waldent",
    category: "Equipment",
    price: 149999,
    mrp: 168000,
    stock: 6,
    rating: "4.6",
    badge: "Quote assist",
    image: "assets/clinic-chair.png",
    description: "Delivery, installation callback, and accessory checklist.",
    delivery: "Quote callback before dispatch",
  },
  {
    name: "Apex Locator Pro",
    brand: "Woodpecker",
    category: "Endodontics",
    price: 5199,
    mrp: 6250,
    stock: 22,
    rating: "4.5",
    badge: "Hot deal",
    image: "assets/endomotor.png",
    description: "Compact apex measurement unit with clear chairside display.",
    delivery: "Ships with file clip and lip hook set",
  },
  {
    name: "LED Curing Light",
    brand: "NSK",
    category: "Equipment",
    price: 2899,
    mrp: 3600,
    stock: 35,
    rating: "4.4",
    badge: "Free shield",
    image: "assets/composite-kit.png",
    description: "Fast cure modes, rechargeable body, and protective eye shield.",
    delivery: "Usually dispatched in 24 hours",
  },
  {
    name: "Disposable Dental Bibs Pack",
    brand: "GC",
    category: "Sterilization",
    price: 349,
    mrp: 520,
    stock: 120,
    rating: "4.1",
    badge: "Bulk saver",
    image: "assets/impression-kit.png",
    description: "Water-resistant patient bibs for daily operatory turnover.",
    delivery: "Ships in protective carton for clinic storage",
  },
  {
    name: "Surgical Suture Starter Set",
    brand: "Dentsply",
    category: "Implants",
    price: 1199,
    mrp: 1540,
    stock: 40,
    rating: "4.3",
    badge: "Starter set",
    image: "assets/implant-kit.png",
    description: "Assorted sterile sutures for implant and minor surgery cases.",
    delivery: "Sterile pack dispatch with invoice copy",
  },
];

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
    id: "restorative-bulk-pricing",
    title: "Bulk pricing for restorative materials",
    message: "Mix composites, cements, and endodontic essentials in one order and unlock better clinic pricing.",
    cta: "Shop deals",
    link: "products.html?search=restorative",
    placement: "home-banner",
    active: true,
    priority: 1,
  },
  {
    id: "clinic-setup-desk",
    title: "New clinic setup support",
    message: "Send your equipment list and get callback support for chairs, autoclaves, handpieces, and consumables.",
    cta: "Setup a clinic",
    link: "/#clinic-setup",
    placement: "home-banner",
    active: true,
    priority: 2,
  },
  {
    id: "same-day-dispatch",
    title: "Same day dispatch on clinic essentials",
    message: "Keep fast-moving materials ready with curated dental supplies and quick order support.",
    cta: "View products",
    link: "products.html",
    placement: "home-banner",
    active: true,
    priority: 3,
  },
];
const retiredDefaultAdIds = new Set(defaultAds.map((ad) => slugify(ad.id || `${ad.placement}-${ad.title}`)));
const retiredDefaultProductIds = new Set(defaultProducts.flatMap((product) => [product.id, product.name].map(slugify)).filter(Boolean));
const retiredDefaultProductImages = new Set(defaultProducts.map((product) => normalizeStoredImage(product.image)).filter(Boolean));
const retiredDefaultBrandIds = new Set(defaultBrands.flatMap((brand) => [brand.id, brand.name].map(slugify)).filter(Boolean));

function normalizeStoredImage(value) {
  return String(value || "").trim().replace(/^\/+/, "");
}

function isRetiredDefaultProduct(product) {
  const ids = [product.id, product.name].map(slugify).filter(Boolean);
  const images = [product.image, ...rawImageList(product.images)].map(normalizeStoredImage).filter(Boolean);
  return ids.some((id) => retiredDefaultProductIds.has(id)) && images.some((image) => retiredDefaultProductImages.has(image));
}

function isRetiredDefaultBrand(brand) {
  const id = slugify(brand.id || brand.name);
  return retiredDefaultBrandIds.has(id) && !String(brand.logo || "").trim() && !brand.updatedAt;
}

function isRetiredDefaultAd(ad) {
  const id = slugify(ad.id || `${ad.placement || "home-banner"}-${ad.title || ""}`);
  return retiredDefaultAdIds.has(id) && !ad.updatedAt;
}

function parseCsvEnv(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function inlineImagePayload(value) {
  const match = String(value || "")
    .trim()
    .match(/^data:(image\/(?:png|jpe?g|webp|gif));base64,([\s\S]+)$/i);
  if (!match) return null;
  const mime = match[1].toLowerCase() === "image/jpg" ? "image/jpeg" : match[1].toLowerCase();
  const extension = uploadImageExtensions.get(mime);
  if (!extension) return null;
  const buffer = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  if (!buffer.length) return null;
  if (buffer.length > 12 * 1024 * 1024) {
    throw new Error("Uploaded image is too large. Use an image under 12 MB.");
  }
  return { buffer, extension };
}

function uploadSegment(value, fallback) {
  return (slugify(value).slice(0, 80) || fallback).replace(/^-+|-+$/g, "") || fallback;
}

async function persistInlineImage(value, scope, nameHint) {
  const source = String(value || "").trim();
  const payload = inlineImagePayload(source);
  if (!payload) return source;

  const safeScope = uploadSegment(scope, "general");
  const safeName = uploadSegment(nameHint, "image");
  const fileName = `${safeName}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}${payload.extension}`;
  const targetDir = path.join(uploadedAssetsDir, safeScope);
  await fs.mkdir(targetDir, { recursive: true });
  await fs.writeFile(path.join(targetDir, fileName), payload.buffer);
  return `${uploadPublicPrefix}/${safeScope}/${fileName}`;
}

function rawImageList(value) {
  return Array.isArray(value) ? value : String(value || "").split(/\r?\n|,/);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

async function persistProductImages(product) {
  const draft = { ...product };
  const rawImages = Array.from(new Set([draft.image, ...rawImageList(draft.images)].map((image) => String(image || "").trim()).filter(Boolean)));
  const images = [];
  for (const image of rawImages) {
    const persisted = await persistInlineImage(image, "products", draft.name || draft.id || "product");
    if (persisted) images.push(persisted);
  }
  const uniqueImages = Array.from(new Set(images.map((image) => String(image || "").trim()).filter(Boolean)));
  if (uniqueImages.length) {
    draft.image = uniqueImages[0];
    draft.images = uniqueImages;
  }
  return draft;
}

async function persistBrandImage(brand) {
  return {
    ...brand,
    logo: await persistInlineImage(brand.logo, "brands", brand.name || brand.id || "brand"),
  };
}

async function persistAdImage(ad) {
  return {
    ...ad,
    image: await persistInlineImage(ad.image, "ads", ad.title || ad.id || "ad"),
  };
}

function normalizeIp(value) {
  return String(value || "")
    .trim()
    .replace(/^::ffff:/, "")
    .replace(/^\[|\]$/g, "");
}

function clientIps(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "")
    .split(",")
    .map(normalizeIp)
    .filter(Boolean);
  const direct = normalizeIp(req.socket?.remoteAddress || "");
  return Array.from(new Set([...forwarded, direct].filter(Boolean)));
}

function ipHash(value) {
  return crypto.createHash("sha256").update(normalizeIp(value)).digest("hex");
}

function isAdminNetworkAllowed(req) {
  if (!isProduction) return true;
  if (!adminAllowedIps.length && !adminAllowedIpHashes.length) return true;
  return clientIps(req).some((ip) => adminAllowedIps.includes(ip) || adminAllowedIpHashes.includes(ipHash(ip)));
}

function createPublicId(prefix) {
  return `${prefix}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

function normalizeOrderStatus(status) {
  const value = String(status || "").trim().toLowerCase();
  return orderStatuses.find((item) => item.toLowerCase() === value) || "";
}

function storageNotice() {
  const defaultStorage = path.resolve(dataDir) === path.resolve(defaultDataDir);
  const renderDefaultStorage = isProduction && process.env.RENDER === "true" && defaultStorage;
  return {
    dataDirConfigured: Boolean(process.env.DATA_DIR),
    persistentRecommended: renderDefaultStorage,
    message: renderDefaultStorage
      ? "Orders are saved in Render's temporary filesystem. Attach a persistent disk or database before taking real orders."
      : "",
  };
}

function normalizeProduct(product) {
  const name = String(product.name || "").trim();
  const rawImages = Array.isArray(product.images) ? product.images : String(product.images || "").split(/\r?\n|,/);
  const images = Array.from(
    new Set(
      [product.image, ...rawImages]
        .map((image) => String(image || "").trim())
        .filter(Boolean)
    )
  );
  const primaryImage = images[0] || "assets/hero-dental-shop.png";
  return {
    id: slugify(product.id || name),
    name,
    brand: String(product.brand || "Dental Factory").trim(),
    category: String(product.category || "Equipment").trim(),
    price: Number(product.price || 0),
    mrp: Number(product.mrp || product.price || 0),
    stock: Number(product.stock || 0),
    rating: String(product.rating || "4.5"),
    badge: String(product.badge || "Admin added"),
    image: primaryImage,
    images: images.length ? images : [primaryImage],
    description: String(product.description || "Factory-direct dental product.").trim(),
    delivery: String(product.delivery || "Dispatch estimate available after pincode.").trim(),
    hsn: String(product.hsn || defaultHsnCode).trim(),
    unit: String(product.unit || defaultUnit).trim(),
    gstRate: Number(product.gstRate ?? defaultGstRate),
    gtin: String(product.gtin || "").trim(),
    mpn: String(product.mpn || "").trim(),
    updatedAt: product.updatedAt || new Date().toISOString(),
  };
}

function visibleStoredProducts(products) {
  return asArray(products)
    .filter((product) => !isRetiredDefaultProduct(product))
    .map(normalizeProduct)
    .filter((product) => product.name);
}

function visibleStoredBrands(brands) {
  return asArray(brands)
    .filter((brand) => !isRetiredDefaultBrand(brand))
    .map(normalizeBrand)
    .filter((brand) => brand.name);
}

function normalizeBrand(brand) {
  const name = String(brand.name || "").trim();
  return {
    id: slugify(brand.id || name),
    name,
    logo: String(brand.logo || "").trim(),
    description: String(brand.description || "").trim(),
    featured: brand.featured !== false,
    updatedAt: brand.updatedAt || new Date().toISOString(),
  };
}

function normalizeAd(ad) {
  const title = String(ad.title || "").trim();
  const placement = String(ad.placement || "home-banner").trim();
  return {
    id: slugify(ad.id || `${placement}-${title}`) || createPublicId("ad").toLowerCase(),
    title,
    message: String(ad.message || "").trim(),
    image: String(ad.image || "").trim(),
    cta: String(ad.cta || "").trim(),
    link: String(ad.link || "").trim(),
    placement,
    active: ad.active !== false,
    priority: Number(ad.priority || 1),
    updatedAt: ad.updatedAt || new Date().toISOString(),
  };
}

function mergeBrands(brands, products = []) {
  const byId = new Map();
  brands.map(normalizeBrand).forEach((brand) => {
    if (brand.name) byId.set(brand.id || slugify(brand.name), brand);
  });
  products.map(normalizeProduct).forEach((product) => {
    const id = slugify(product.brand);
    if (!id || byId.has(id)) return;
    byId.set(id, normalizeBrand({ name: product.brand, description: "Brand used in the current product catalog.", featured: true }));
  });
  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return entities[char] || char;
  });
}

function escapeXml(value) {
  return escapeHtml(value);
}

function absoluteSiteUrl(pathname = "/") {
  if (/^https?:\/\//i.test(String(pathname || ""))) return String(pathname);
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${siteUrl}${normalizedPath}`;
}

function seoDescription(value, fallback) {
  const text = String(value || fallback || "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 155 ? `${text.slice(0, 152).trim()}...` : text;
}

function preferredSeoSlug(value) {
  return slugify(value)
    .replace(/\bglass-lonomer\b/g, "glass-ionomer")
    .replace(/\blonomer\b/g, "ionomer");
}

function productSeoEntries(products) {
  const usedSlugs = new Map();
  return asArray(products)
    .map(normalizeProduct)
    .filter((product) => product.name)
    .map((product) => {
      const baseSlug = preferredSeoSlug(product.name) || preferredSeoSlug(product.id) || "product";
      const count = (usedSlugs.get(baseSlug) || 0) + 1;
      usedSlugs.set(baseSlug, count);
      const slug = count === 1 ? baseSlug : `${baseSlug}-${count}`;
      return { ...product, seoSlug: slug, seoUrl: `/products/${slug}` };
    });
}

function findProductForSeoSlug(products, slug) {
  const target = slugify(slug);
  return (
    productSeoEntries(products).find(
      (product) => product.seoSlug === target || product.id === target || slugify(product.name) === target || preferredSeoSlug(product.name) === target
    ) || null
  );
}

function productSeoUrl(product, products) {
  if (!product?.name) return "/products.html";
  const id = product.id || slugify(product.name);
  const entry = productSeoEntries(products).find((item) => item.id === id || item.name === product.name);
  return entry?.seoUrl || `/products/${slugify(product.name)}`;
}

function categoryRouteForValue(value) {
  return categoryRouteByKey.get(slugify(value));
}

function redirectPermanent(res, location) {
  res.writeHead(301, withSecurityHeaders({ Location: location, "Cache-Control": "no-store, max-age=0" }));
  res.end();
}

function requestHost(req) {
  const forwardedHost = String(req.headers["x-forwarded-host"] || "")
    .split(",")[0]
    .trim();
  return String(forwardedHost || req.headers.host || "")
    .trim()
    .replace(/:\d+$/, "")
    .toLowerCase();
}

function shouldRedirectCanonicalHost(req) {
  if (!isProduction) return false;
  const hostName = requestHost(req);
  return Boolean(hostName && hostName !== canonicalHost && canonicalRedirectHosts.has(hostName));
}

function redirectCanonicalHost(req, res, reqUrl) {
  redirectPermanent(res, `${siteUrl}${reqUrl.pathname}${reqUrl.search || ""}`);
}

function injectHeadTags(html, tags) {
  return String(html || "").replace("</head>", `${tags}\n  </head>`);
}

function replaceTitleAndMeta(html, { title, description, canonical }) {
  let nextHtml = String(html || "");
  if (title) nextHtml = nextHtml.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  if (description) {
    nextHtml = nextHtml.replace(/<meta name="description" content="[^"]*" \/>/i, `<meta name="description" content="${escapeHtml(description)}" />`);
  }
  if (canonical) {
    nextHtml = nextHtml.replace(/<link rel="canonical" href="[^"]*" \/>/i, `<link rel="canonical" href="${escapeHtml(canonical)}" />`);
  }
  return nextHtml;
}

function breadcrumbSchema(items) {
  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  })}</script>`;
}

function productSchema(product, canonical) {
  const images = Array.from(new Set(rawImageList(product.images).concat(product.image).map((image) => String(image || "").trim()).filter(Boolean)));
  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    category: product.category,
    image: images.length ? images.map((image) => absoluteSiteUrl(image)) : undefined,
    description: seoDescription(product.description, `${product.name} from Dental Factory.`),
    sku: product.id,
    mpn: product.hsn || product.id,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: String(product.price || 0),
      availability: Number(product.stock || 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "Dental Factory" },
      url: canonical,
    },
  })}</script>`;
}

function cleanXmlText(value, maxLength = 5000) {
  const text = String(value || "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLength ? text.slice(0, maxLength).trim() : text;
}

function merchantImageUrl(product) {
  const images = Array.from(new Set(rawImageList(product.images).concat(product.image).map((image) => String(image || "").trim()).filter(Boolean)));
  const image = images.find((item) => !/^data:/i.test(item) && normalizeStoredImage(item) !== "assets/hero-dental-shop.png");
  return image ? absoluteSiteUrl(image) : "";
}

function merchantProductDescription(product) {
  const base = cleanXmlText(product.description, 4200);
  const details = [
    product.brand ? `Brand: ${product.brand}.` : "",
    product.category ? `Category: ${product.category}.` : "",
    product.hsn ? `HSN: ${product.hsn}.` : "",
    product.unit ? `Unit: ${product.unit}.` : "",
    Number(product.gstRate ?? defaultGstRate) ? `GST: ${Number(product.gstRate ?? defaultGstRate)}%.` : "",
    product.delivery ? product.delivery : "Clinic-ready dental supply with dispatch support from Dental Factory.",
  ]
    .filter(Boolean)
    .join(" ");
  return cleanXmlText(`${base || `${product.name} is available from Dental Factory for dental clinics and procurement teams.`} ${details}`, 5000);
}

function merchantXmlItem(product, products) {
  const price = Number(product.price || 0);
  const imageUrl = merchantImageUrl(product);
  if (!product.name || !price || price <= 0 || !imageUrl) return "";

  const productUrl = absoluteSiteUrl(productSeoUrl(product, products));
  const category = productCategoryRoute(product);
  const productType = category?.title || product.category || "Dental supplies";
  const description = merchantProductDescription(product);
  const hasIdentifier = Boolean(product.gtin || product.mpn);

  return `  <item>
    <g:id>${escapeXml(product.seoSlug || product.id || slugify(product.name))}</g:id>
    <title>${escapeXml(cleanXmlText(product.name, 150))}</title>
    <link>${escapeXml(productUrl)}</link>
    <description>${escapeXml(description)}</description>
    <g:title>${escapeXml(cleanXmlText(product.name, 150))}</g:title>
    <g:description>${escapeXml(description)}</g:description>
    <g:link>${escapeXml(productUrl)}</g:link>
    <g:image_link>${escapeXml(imageUrl)}</g:image_link>
    <g:availability>${Number(product.stock || 0) > 0 ? "in_stock" : "out_of_stock"}</g:availability>
    <g:price>${escapeXml(`${price.toFixed(2)} ${paymentCurrency}`)}</g:price>
    <g:condition>new</g:condition>
    <g:brand>${escapeXml(cleanXmlText(product.brand || "Dental Factory", 70))}</g:brand>
    <g:product_type>${escapeXml(cleanXmlText(productType, 750))}</g:product_type>
    ${product.gtin ? `<g:gtin>${escapeXml(cleanXmlText(product.gtin, 70))}</g:gtin>` : ""}
    ${product.mpn ? `<g:mpn>${escapeXml(cleanXmlText(product.mpn, 70))}</g:mpn>` : ""}
    ${hasIdentifier ? "" : "<g:identifier_exists>no</g:identifier_exists>"}
    <g:adult>no</g:adult>
  </item>`;
}

function formatRupees(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;
}

function productDiscountText(product) {
  const mrp = Number(product.mrp || 0);
  const price = Number(product.price || 0);
  if (!mrp || !price || mrp <= price) return "";
  return `${Math.round(((mrp - price) / mrp) * 100)}% off`;
}

function productCategoryRoute(product) {
  return categoryRouteForValue(product.category) || categoryRoutes.find((category) => productMatchesCategory(product, category)) || null;
}

function categoryTerms(category) {
  const map = {
    equipment: ["equipment", "equipments", "chair", "unit", "sensor", "camera", "compressor", "autoclave"],
    "rotary-instruments": ["rotary", "handpiece", "airotor", "airrotor", "bur", "bearing", "contra-angle"],
    restoratives: ["restorative", "restoratives", "composite", "cement", "gic", "ionomer", "lonomer", "bond", "etch", "flowable", "restoration"],
    endodontics: ["endodontic", "endodontics", "endo", "root", "canal", "file", "apex", "gutta", "obturation", "irrigation"],
    orthodontics: ["orthodontic", "orthodontics", "ortho", "bracket", "wire", "retainer", "aligner", "bonding", "elastomeric"],
    sterilization: ["sterilization", "sterilisation", "sterile", "autoclave", "pouch", "disinfect", "infection"],
    implants: ["implant", "implants", "prosthetic", "abutment", "driver", "screw", "torque"],
  };
  return Array.from(new Set([category.filter, category.slug, category.name, ...(map[category.slug] || [])].map(slugify).filter(Boolean)));
}

function productMatchesCategory(product, category) {
  const haystack = slugify(`${product.category || ""} ${product.name || ""} ${product.description || ""}`);
  return categoryTerms(category).some((term) => haystack.includes(term));
}

function categoryProducts(products, category) {
  return asArray(products).filter((product) => productMatchesCategory(product, category));
}

function productCardHtml(product, products) {
  const href = productSeoUrl(product, products);
  const discount = productDiscountText(product);
  const category = productCategoryRoute(product);
  return `
            <article class="product-card" data-product-id="${escapeHtml(product.id)}" data-name="${escapeHtml(product.name)}" data-brand="${escapeHtml(
              product.brand
            )}" data-category="${escapeHtml(`${product.category} deals best`)}" data-price="${escapeHtml(product.price)}" data-rating="${escapeHtml(
    product.rating
  )}">
              <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" />
              <div class="product-meta">
                <h3><a class="seo-title-link" href="${escapeHtml(href)}">${escapeHtml(product.name)}</a></h3>
                <div class="rating"><span aria-hidden="true">★</span> ${escapeHtml(product.rating)} <span>${escapeHtml(product.stock)} in stock</span></div>
                <div class="price-row">
                  <strong>${escapeHtml(formatRupees(product.price))}</strong>
                  ${Number(product.mrp || 0) > Number(product.price || 0) ? `<small>${escapeHtml(formatRupees(product.mrp))}</small>` : ""}
                  ${discount ? `<span>${escapeHtml(discount)}</span>` : ""}
                </div>
                <p>${escapeHtml(seoDescription(product.description, `${product.name} by ${product.brand}.`))}</p>
                <a class="detail-button" href="${escapeHtml(href)}">View details</a>
                ${category ? `<a class="seo-muted-link" href="/${escapeHtml(category.slug)}">${escapeHtml(category.title)}</a>` : ""}
              </div>
            </article>`;
}

function injectProductGrid(html, productsToShow, allProducts) {
  const cards = asArray(productsToShow)
    .slice(0, 48)
    .map((product) => productCardHtml(product, allProducts))
    .join("\n");
  return String(html || "").replace(/(<div class="product-grid(?: [^"]*)?" id="productGrid">\s*)[\s\S]*?(\s*<\/div>)/i, `$1\n${cards}\n          $2`);
}

function productSeoText(product) {
  const category = product.category || "dental supplies";
  const brand = product.brand || "Dental Factory";
  const hsn = product.hsn || defaultHsnCode;
  const unit = product.unit || defaultUnit;
  const gst = Number(product.gstRate ?? defaultGstRate);
  const stockLine = Number(product.stock || 0) > 0 ? `${product.stock} units are currently listed for ordering.` : "Stock can be confirmed before dispatch.";
  const shortDescription = product.description || `${product.name} is a clinic-ready dental product available from Dental Factory.`;
  return {
    overview: `${shortDescription} This ${category.toLowerCase()} product is listed with transparent pricing, GST billing details, and dispatch support for dental clinics, hospitals, dealers, and dental students who need dependable procurement from one place. The page includes the current selling price, MRP, available discount, brand name, stock position, HSN code, GST rate, and unit information so the buyer can review the product before adding it to cart.`,
    features: `${product.name} is supplied under the ${brand} brand and is suitable for regular clinic purchasing workflows where clear product identification matters. The listing is built for comparison with similar dental materials, instruments, equipment, or consumables in the same category. ${stockLine} Dental Factory keeps the product information crawlable and visible so customers and search engines can read the product details without depending only on scripts.`,
    benefits: `Key benefits include quick product discovery, price visibility, invoice-ready tax information, and a direct product page that can be shared with staff or purchasing teams. When the item is in stock, clinics can add it to cart and continue to checkout after customer login. If a quantity, shade, model, or compatibility detail needs confirmation, the product page still gives enough context for a purchase enquiry or support callback.`,
    specs: `Specifications: brand ${brand}; category ${category}; HSN ${hsn}; GST ${gst}%; unit ${unit}; listed selling price ${formatRupees(product.price)}${
      Number(product.mrp || 0) > Number(product.price || 0) ? `; MRP ${formatRupees(product.mrp)}` : ""
    }; delivery note ${product.delivery || "Dispatch estimate available after pincode."}.`,
    usage: `Usage information: review the product image, description, brand, price, and stock before ordering. Dental products should be selected according to the clinic requirement, applicable technique, and manufacturer instructions. For materials and clinical-use items, confirm compatibility, expiry-sensitive details, storage needs, and quantity before checkout or bulk enquiry.`,
  };
}

function productSeoDetailSection(product) {
  const text = productSeoText(product);
  return `
      <section class="section-block seo-product-content">
        <div class="section-heading">
          <div>
            <span class="eyebrow">Product details</span>
            <h2>${escapeHtml(product.name)} details, features, and specifications</h2>
          </div>
        </div>
        <div class="info-tabs">
          <article>
            <h3>Description</h3>
            <p>${escapeHtml(text.overview)}</p>
          </article>
          <article>
            <h3>Features</h3>
            <p>${escapeHtml(text.features)}</p>
          </article>
          <article>
            <h3>Benefits</h3>
            <p>${escapeHtml(text.benefits)}</p>
          </article>
          <article>
            <h3>Specifications</h3>
            <p>${escapeHtml(text.specs)}</p>
          </article>
          <article>
            <h3>Brand details</h3>
            <p>${escapeHtml(`${product.brand || "Dental Factory"} products are listed with product-specific pricing, stock, and tax details for dental procurement.`)}</p>
          </article>
          <article>
            <h3>Usage information</h3>
            <p>${escapeHtml(text.usage)}</p>
          </article>
        </div>
      </section>`;
}

function replaceProductDetailSource(html, product, products) {
  const discount = productDiscountText(product);
  const images = Array.from(new Set(rawImageList(product.images).concat(product.image).map((image) => String(image || "").trim()).filter(Boolean)));
  const thumbs = images
    .slice(0, 6)
    .map(
      (image, index) =>
        `<button class="${index === 0 ? "is-active" : ""}" type="button" aria-label="${index === 0 ? "Main product view" : `Product view ${index + 1}`}"><img src="${escapeHtml(
          image
        )}" alt="" /></button>`
    )
    .join("\n            ");
  const specs = [
    ["Brand", product.brand || "Dental Factory"],
    ["Category", product.category || "Dental product"],
    ["HSN", product.hsn || defaultHsnCode],
    ["GST", `${Number(product.gstRate ?? defaultGstRate)}%`],
    ["Unit", product.unit || defaultUnit],
    ["Stock", Number(product.stock || 0) > 0 ? `${product.stock} in stock` : "Confirm availability"],
  ]
    .map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`)
    .join("\n            ");

  let nextHtml = String(html || "")
    .replace(/(<span id="detailBreadcrumbCurrent">)[\s\S]*?(<\/span>)/i, `$1${escapeHtml(product.name)}$2`)
    .replace(/<img id="pageDetailImage" data-gallery-main [^>]*\/>/i, `<img id="pageDetailImage" data-gallery-main src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" />`)
    .replace(/<div class="thumbnail-row" id="pageDetailThumbs" aria-label="Product gallery">[\s\S]*?<\/div>\s*<\/div>/i, `<div class="thumbnail-row" id="pageDetailThumbs" aria-label="Product gallery">
            ${thumbs}
          </div>
        </div>`)
    .replace(/(<h1 id="pageDetailTitle">)[\s\S]*?(<\/h1>)/i, `$1${escapeHtml(product.name)}$2`)
    .replace(/(<p id="pageDetailDescription">)[\s\S]*?(<\/p>)/i, `$1${escapeHtml(product.description || "Factory-direct dental product.")}$2`)
    .replace(/<div class="detail-rating" id="pageDetailRating">[\s\S]*?<\/div>/i, `<div class="detail-rating" id="pageDetailRating"><i data-lucide="star"></i> ${escapeHtml(
      product.rating || "4.5"
    )} <span>${escapeHtml(Number(product.stock || 0) > 0 ? `${product.stock} in stock` : product.brand || "")}</span></div>`)
    .replace(/<div class="detail-price">[\s\S]*?<\/div>/i, `<div class="detail-price"><strong id="pageDetailPrice">${escapeHtml(formatRupees(product.price))}</strong><small id="pageDetailMrp">${
      Number(product.mrp || 0) > Number(product.price || 0) ? escapeHtml(formatRupees(product.mrp)) : ""
    }</small><span id="pageDetailDiscount">${escapeHtml(discount)}</span></div>`)
    .replace(/(<b id="pageDetailDelivery">)[\s\S]*?(<\/b>)/i, `$1${escapeHtml(product.delivery || "Dispatch estimate available after pincode.")}$2`)
    .replace(
      /<button class="add-cart detail-add-button" id="pageDetailAddCart" type="button" data-product="[^"]*" data-price="[^"]*">ADD<\/button>/i,
      `<button class="add-cart detail-add-button" id="pageDetailAddCart" type="button" data-product="${escapeHtml(product.name)}" data-price="${escapeHtml(product.price)}">ADD</button>`
    )
    .replace(/<div class="detail-specs" id="pageDetailSpecs">[\s\S]*?<\/div>\s*<\/article>/i, `<div class="detail-specs" id="pageDetailSpecs">
            ${specs}
          </div>
        </article>`)
    .replace(/<section class="section-block">\s*<div class="section-heading">[\s\S]*?<div class="info-tabs">[\s\S]*?<\/div>\s*<\/section>/i, productSeoDetailSection(product));

  const related = products
    .filter((item) => item.id !== product.id)
    .sort((a, b) => {
      const relatedCategory = productCategoryRoute(product) || { filter: product.category, slug: slugify(product.category), name: product.category };
      const sameCategory = Number(productMatchesCategory(b, relatedCategory)) - Number(productMatchesCategory(a, relatedCategory));
      return sameCategory || String(a.name).localeCompare(String(b.name));
    })
    .slice(0, 8);
  nextHtml = injectProductGrid(nextHtml, related.length ? related : products.filter((item) => item.id !== product.id), products);
  return nextHtml;
}

function categorySeoSection(category, products) {
  const shownProducts = categoryProducts(products, category);
  const productLinks = shownProducts
    .slice(0, 18)
    .map((product) => `<a href="${escapeHtml(productSeoUrl(product, products))}">${escapeHtml(product.name)}</a>`)
    .join("");
  return `
      <section class="section-block seo-category-content">
        <div class="section-heading">
          <div>
            <span class="eyebrow">Category guide</span>
            <h2>${escapeHtml(category.title)} for dental clinics</h2>
          </div>
        </div>
        <p>${escapeHtml(
          `${category.title} products at Dental Factory include clinic-ready dental materials, instruments, equipment, and consumables selected for everyday purchasing. This category page links directly to individual product pages so Google and customers can discover each item from a crawlable category route. Review brand, MRP, selling price, stock, GST details, and delivery notes before checkout.`
        )}</p>
        <div class="seo-link-list">${productLinks}</div>
      </section>`;
}

function homepageSeoLinks(products) {
  const categoryBlocks = categoryRoutes
    .map((category) => {
      const links = categoryProducts(products, category)
        .slice(0, 6)
        .map((product) => `<a href="${escapeHtml(productSeoUrl(product, products))}">${escapeHtml(product.name)}</a>`)
        .join("");
      return `<article><h3><a href="/${escapeHtml(category.slug)}">${escapeHtml(category.title)}</a></h3><div>${links}</div></article>`;
    })
    .join("");
  return `
      <section class="section-block seo-home-links" aria-label="Crawlable category and product links">
        <div class="section-heading">
          <div>
            <span class="eyebrow">Shop by dental category</span>
            <h2>Dental products, categories, and brand links</h2>
          </div>
          <a href="products.html">View all products</a>
        </div>
        <div class="seo-category-grid">${categoryBlocks}</div>
      </section>`;
}

function brandSeoLinks(brands, products) {
  const visibleBrands = visibleStoredBrands(brands);
  const brandCards = visibleBrands
    .map((brand) => {
      const matchingProducts = products.filter((product) => slugify(product.brand) === slugify(brand.name)).slice(0, 5);
      const productLinks = matchingProducts.map((product) => `<a href="${escapeHtml(productSeoUrl(product, products))}">${escapeHtml(product.name)}</a>`).join("");
      return `<article><h3><a href="products.html?brand=${encodeURIComponent(brand.name)}">${escapeHtml(brand.name)}</a></h3><div>${productLinks}</div></article>`;
    })
    .join("");
  return `
      <section class="section-block seo-brand-links" aria-label="Crawlable brand and product links">
        <div class="section-heading">
          <div>
            <span class="eyebrow">Brand links</span>
            <h2>Shop products by saved brands</h2>
          </div>
        </div>
        <div class="seo-category-grid">${brandCards}</div>
      </section>`;
}

function enhanceProductsHtml(html, products, category = null) {
  const shownProducts = category ? categoryProducts(products, category) : products;
  let nextHtml = injectProductGrid(html, shownProducts.length ? shownProducts : products, products);
  if (category) {
    nextHtml = nextHtml.replace("</main>", `${categorySeoSection(category, products)}\n    </main>`);
  }
  return nextHtml;
}

async function serveSeoStaticPage(res, requestPath) {
  const products = await readCatalogProducts();
  const fileName = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
  let html = await fs.readFile(path.join(rootDir, fileName), "utf8");
  html = stripRetiredAnnouncementHtml(html);
  if (fileName === "products.html" || fileName === "index.html") {
    html = injectProductGrid(html, products, products);
  }
  if (fileName === "index.html") {
    html = html.replace("</main>", `${homepageSeoLinks(products)}\n    </main>`);
  }
  if (fileName === "brands.html") {
    html = html.replace("</main>", `${brandSeoLinks(await readJson(brandsFile, []), products)}\n    </main>`);
  }
  res.writeHead(
    200,
    withSecurityHeaders({
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    })
  );
  res.end(html);
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function cleanText(value, maxLength = 500) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function normalizeCustomerType(value) {
  const type = String(value || "clinic").trim().toLowerCase();
  if (["clinic", "dentist", "dealer", "retail", "student"].includes(type)) return type;
  return "clinic";
}

function customerTypeLabel(type = "clinic") {
  const labels = {
    clinic: "Clinic",
    dentist: "Clinic",
    dealer: "Dealer",
    retail: "Retail",
    student: "Retail",
  };
  return labels[normalizeCustomerType(type)] || labels.clinic;
}

function normalizeLoginIdentifier(value) {
  const raw = String(value || "").trim();
  const phone = normalizePhone(raw);
  if (phone.length >= 10 && !raw.includes("@")) return phone.slice(-10);
  const email = normalizeEmail(raw);
  return email.includes("@") ? email : "";
}

function normalizeAddress(address = {}) {
  const line1 = cleanText(address.line1 || address.address || "", 600);
  return {
    id: String(address.id || createPublicId("AD")).trim(),
    label: cleanText(address.label || "Clinic address", 80),
    name: cleanText(address.name || "", 120),
    phone: normalizePhone(address.phone),
    line1,
    city: cleanText(address.city || "", 80),
    state: cleanText(address.state || "", 80),
    pincode: normalizePhone(address.pincode).slice(0, 6),
    gstin: cleanText(address.gstin || "", 18).toUpperCase(),
    isDefault: Boolean(address.isDefault),
    updatedAt: address.updatedAt || new Date().toISOString(),
  };
}

function normalizeTicket(ticket = {}) {
  return {
    id: String(ticket.id || createPublicId("TK")).trim(),
    type: cleanText(ticket.type || "Complaint", 80),
    subject: cleanText(ticket.subject || "", 160),
    message: cleanText(ticket.message || "", 1200),
    orderId: cleanText(ticket.orderId || "", 40),
    status: cleanText(ticket.status || "Open", 80),
    createdAt: ticket.createdAt || new Date().toISOString(),
    updatedAt: ticket.updatedAt || ticket.createdAt || new Date().toISOString(),
  };
}

function normalizeNotification(notification = {}) {
  return {
    id: String(notification.id || createPublicId("NT")).trim(),
    title: cleanText(notification.title || "", 120),
    message: cleanText(notification.message || "", 500),
    type: cleanText(notification.type || "Account", 80),
    createdAt: notification.createdAt || new Date().toISOString(),
    read: Boolean(notification.read),
  };
}

function normalizeAccount(account) {
  const email = normalizeEmail(account.email || (String(account.login || "").includes("@") ? account.login : ""));
  const mobile = normalizePhone(account.mobile || account.phone || (!String(account.login || "").includes("@") ? account.login : "")).slice(-10);
  const login = normalizeLoginIdentifier(account.login) || mobile || email;
  const type = normalizeCustomerType(account.type || account.customerType);
  return {
    id: String(account.id || createPublicId("AC")).trim(),
    login,
    mobile,
    email,
    name: cleanText(account.name || account.customerName || "", 140),
    clinic: cleanText(account.clinic || account.business || account.company || "", 160),
    type,
    customerType: customerTypeLabel(type),
    gstin: cleanText(account.gstin || "", 18).toUpperCase(),
    status: cleanText(account.status || "Callback pending", 80),
    passwordHash: String(account.passwordHash || ""),
    passwordUpdatedAt: account.passwordUpdatedAt || "",
    otpHash: String(account.otpHash || ""),
    otpExpiresAt: account.otpExpiresAt || "",
    otpIssuedAt: account.otpIssuedAt || "",
    verifiedAt: account.verifiedAt || "",
    logoutAllAt: account.logoutAllAt || "",
    addresses: asArray(account.addresses).map(normalizeAddress).filter((address) => address.line1),
    tickets: asArray(account.tickets).map(normalizeTicket).filter((ticket) => ticket.subject || ticket.message),
    notifications: asArray(account.notifications).map(normalizeNotification).filter((notification) => notification.title || notification.message),
    documents: asArray(account.documents).map((document) => ({
      id: String(document.id || createPublicId("DOC")).trim(),
      type: cleanText(document.type || "Document", 80),
      title: cleanText(document.title || "", 160),
      status: cleanText(document.status || "Available", 80),
      link: cleanText(document.link || "", 300),
      createdAt: document.createdAt || new Date().toISOString(),
    })).filter((document) => document.title),
    purchaseFrequency: cleanText(account.purchaseFrequency || "New customer", 80),
    pendingPayments: Number(account.pendingPayments || 0),
    serviceHistory: asArray(account.serviceHistory).map((item) => cleanText(item, 240)).filter(Boolean),
    createdAt: account.createdAt || new Date().toISOString(),
    updatedAt: account.updatedAt || account.createdAt || new Date().toISOString(),
  };
}

function safeAccount(account) {
  const normalized = normalizeAccount(account);
  const { passwordHash, otpHash, otpExpiresAt, otpIssuedAt, logoutAllAt, ...safe } = normalized;
  return {
    ...safe,
    hasPassword: Boolean(passwordHash),
  };
}

function customerLoginMatches(account, login) {
  const normalized = normalizeAccount(account);
  const key = normalizeLoginIdentifier(login);
  if (!key) return false;
  return normalized.login === key || normalized.mobile === key || normalized.email === key;
}

function findCustomerIndex(accounts, loginOrId) {
  const key = normalizeLoginIdentifier(loginOrId);
  const id = String(loginOrId || "").trim();
  return accounts.findIndex((account) => {
    const normalized = normalizeAccount(account);
    return normalized.id === id || (key && (normalized.login === key || normalized.mobile === key || normalized.email === key));
  });
}

function createOtpCode() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, "0");
}

function hashCustomerOtp(login, otp) {
  return crypto.createHmac("sha256", sessionSecret).update(`${normalizeLoginIdentifier(login)}:${String(otp || "").trim()}`).digest("base64url");
}

function hashCustomerPassword(password) {
  const salt = crypto.randomBytes(16).toString("base64url");
  const hash = crypto.pbkdf2Sync(String(password || ""), salt, 100000, 32, "sha256").toString("base64url");
  return `pbkdf2:${salt}:${hash}`;
}

function maskLogin(value) {
  const login = normalizeLoginIdentifier(value);
  if (login.includes("@")) {
    const [name, domain] = login.split("@");
    return `${name.slice(0, 2)}***@${domain}`;
  }
  return login.length >= 4 ? `${"*".repeat(Math.max(0, login.length - 4))}${login.slice(-4)}` : "";
}

function templateText(template, values = {}) {
  return String(template || "").replace(/\{\{(otp|login|brand|minutes)\}\}/gi, (_, key) => String(values[key.toLowerCase()] ?? ""));
}

async function postOtpWebhook(url, token, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`OTP gateway failed (${response.status})${text ? `: ${text.slice(0, 160)}` : ""}`);
  }
}

async function deliverCustomerOtp(login, otp) {
  const isEmail = String(login || "").includes("@");
  const minutes = Math.ceil(customerOtpMaxAgeSeconds / 60);
  const message = templateText(process.env.OTP_MESSAGE_TEMPLATE || "{{otp}} is your Dental Factory login OTP. It is valid for {{minutes}} minutes.", {
    otp,
    login: maskLogin(login),
    brand: otpSenderName,
    minutes,
  });
  const channel = isEmail ? "email" : "sms";
  const webhookUrl = isEmail ? otpEmailWebhookUrl : otpSmsWebhookUrl;
  const token = isEmail ? otpEmailWebhookToken : otpSmsWebhookToken;

  if (!webhookUrl) {
    return { channel, delivered: false, configured: false };
  }

  await postOtpWebhook(webhookUrl, token, {
    channel,
    to: login,
    otp,
    message,
    brand: otpSenderName,
    expiresInSeconds: customerOtpMaxAgeSeconds,
  });
  return { channel, delivered: true, configured: true };
}

async function verifyGoogleCredential(credential) {
  if (!googleClientId) throw new Error("Google login is not configured.");
  const tokenUrl = new URL("https://oauth2.googleapis.com/tokeninfo");
  tokenUrl.searchParams.set("id_token", credential);
  const response = await fetch(tokenUrl);
  if (!response.ok) throw new Error("Google login verification failed.");
  const profile = await response.json();
  if (profile.aud !== googleClientId) throw new Error("Google login audience mismatch.");
  if (String(profile.email_verified) !== "true") throw new Error("Google email is not verified.");
  if (!profile.email || !profile.sub) throw new Error("Google account details are incomplete.");
  return {
    googleSub: String(profile.sub),
    email: normalizeEmail(profile.email),
    name: cleanText(profile.name || "", 140),
    picture: cleanText(profile.picture || "", 500),
  };
}

function normalizeOrderItem(item) {
  return {
    name: String(item?.name || "").trim(),
    price: Math.max(0, Number(item?.price || 0)),
    qty: Math.max(1, Number.parseInt(item?.qty || 1, 10) || 1),
    hsn: String(item?.hsn || defaultHsnCode).trim(),
    unit: String(item?.unit || defaultUnit).trim(),
    gstRate: Number(item?.gstRate ?? defaultGstRate),
  };
}

function normalizeOrderCustomer(customer) {
  return {
    name: String(customer?.name || "").trim(),
    clinic: String(customer?.clinic || customer?.business || "").trim(),
    gstin: String(customer?.gstin || "").trim().toUpperCase(),
    phone: String(customer?.phone || "").trim(),
    address: String(customer?.address || "").trim(),
    payment: String(customer?.payment || "Cash on delivery").trim(),
  };
}

function normalizePayment(payment) {
  return {
    method: String(payment?.method || "").trim(),
    status: String(payment?.status || "").trim(),
    provider: String(payment?.provider || "").trim(),
    razorpayOrderId: String(payment?.razorpayOrderId || "").trim(),
    razorpayPaymentId: String(payment?.razorpayPaymentId || "").trim(),
    amount: Number(payment?.amount || 0),
    currency: String(payment?.currency || paymentCurrency).trim(),
  };
}

function normalizeShipping(shipping) {
  return {
    charge: Number(shipping?.charge || 0),
    label: String(shipping?.label || "").trim(),
    note: String(shipping?.note || "").trim(),
    requiresCallback: Boolean(shipping?.requiresCallback),
  };
}

function safeOrder(order) {
  return {
    id: order.id,
    customer: normalizeOrderCustomer(order.customer),
    items: Array.isArray(order.items) ? order.items.map(normalizeOrderItem).filter((item) => item.name) : [],
    subtotal: Number(order.subtotal || order.total || 0),
    shipping: normalizeShipping(order.shipping),
    total: Number(order.total || 0),
    status: String(order.status || "Request received"),
    payment: normalizePayment(order.payment || { method: order.customer?.payment || "Cash on delivery", status: "Pending" }),
    createdAt: order.createdAt,
    statusUpdatedAt: order.statusUpdatedAt || order.createdAt,
  };
}

function maskPhone(value) {
  const phone = normalizePhone(value);
  if (phone.length < 4) return "";
  return `${"*".repeat(Math.max(0, phone.length - 4))}${phone.slice(-4)}`;
}

function publicOrder(order) {
  const safe = safeOrder(order);
  return {
    ...safe,
    customer: {
      name: safe.customer.name,
      phone: maskPhone(safe.customer.phone),
      address: "",
      payment: safe.customer.payment,
    },
  };
}

function customerOwnsOrder(account, order) {
  const safe = safeOrder(order);
  const phone = normalizePhone(safe.customer.phone);
  const accountPhone = normalizePhone(account.mobile);
  const accountEmail = normalizeEmail(account.email);
  const orderEmail = normalizeEmail(safe.customer.email);
  return (
    (accountPhone.length >= 10 && phone.endsWith(accountPhone.slice(-10))) ||
    (accountEmail && orderEmail && accountEmail === orderEmail)
  );
}

function customerDocumentsForOrders(orders) {
  return orders.flatMap((order) => [
    {
      id: `invoice-${order.id}`,
      type: "Invoice",
      title: `Invoice for ${order.id}`,
      status: order.payment?.status === "Paid" || order.status === "Delivered" ? "Ready to download" : "Available after billing",
      link: `track-order.html?order=${encodeURIComponent(order.id)}`,
      createdAt: order.createdAt,
    },
    {
      id: `quotation-${order.id}`,
      type: "Quotation",
      title: `Quotation / order summary ${order.id}`,
      status: "Ready",
      link: `track-order.html?order=${encodeURIComponent(order.id)}`,
      createdAt: order.createdAt,
    },
    {
      id: `warranty-${order.id}`,
      type: "Warranty card",
      title: `Warranty card request ${order.id}`,
      status: /delivered|shipped/i.test(order.status || "") ? "Request from support" : "Pending dispatch",
      link: "contact.html",
      createdAt: order.createdAt,
    },
  ]);
}

function customerNotificationsForOrders(orders) {
  return orders.slice(0, 8).map((order) =>
    normalizeNotification({
      id: `order-${order.id}`,
      type: "Order status",
      title: `${order.id} - ${order.status || "Request received"}`,
      message: `${orderItemSummaryServer(order)} | ${order.payment?.status || "Payment pending"}`,
      createdAt: order.statusUpdatedAt || order.createdAt,
    })
  );
}

function orderItemSummaryServer(order) {
  const items = Array.isArray(order.items) ? order.items.map(normalizeOrderItem).filter((item) => item.name) : [];
  if (!items.length) return "Order items pending";
  const first = items[0];
  return items.length === 1 ? `${first.name} x ${first.qty}` : `${first.name} + ${items.length - 1} more items`;
}

async function customerDashboardPayload(account) {
  const normalized = normalizeAccount(account);
  const orders = asArray(await readJson(ordersFile, []))
    .map(safeOrder)
    .filter((order) => customerOwnsOrder(normalized, order));
  const paidTotal = orders
    .filter((order) => /paid/i.test(order.payment?.status || ""))
    .reduce((sum, order) => sum + Number(order.total || 0), 0);
  const pendingPayments = orders
    .filter((order) => !/paid/i.test(order.payment?.status || "") && !/cancelled/i.test(order.status || ""))
    .reduce((sum, order) => sum + Number(order.total || 0), 0);
  return {
    account: {
      ...safeAccount(normalized),
      purchaseFrequency: orders.length ? `${orders.length} order${orders.length === 1 ? "" : "s"}` : normalized.purchaseFrequency,
      pendingPayments,
    },
    orders,
    documents: [...customerDocumentsForOrders(orders), ...asArray(normalized.documents || [])],
    notifications: [...customerNotificationsForOrders(orders), ...normalized.notifications].slice(0, 12),
    adminData: {
      customerType: customerTypeLabel(normalized.type),
      purchaseFrequency: orders.length ? `${orders.length} orders` : "No completed orders yet",
      pendingPayments,
      paidTotal,
      serviceHistory: normalized.serviceHistory,
    },
  };
}

function parseCookies(req) {
  return Object.fromEntries(
    String(req.headers.cookie || "")
      .split(";")
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const index = cookie.indexOf("=");
        return index >= 0 ? [cookie.slice(0, index), decodeURIComponent(cookie.slice(index + 1))] : [cookie, ""];
      })
  );
}

function sign(value) {
  return crypto.createHmac("sha256", sessionSecret).update(value).digest("base64url");
}

function timingSafeStringEqual(actual, expected) {
  const actualHash = crypto.createHash("sha256").update(String(actual || "")).digest();
  const expectedHash = crypto.createHash("sha256").update(String(expected || "")).digest();
  return crypto.timingSafeEqual(actualHash, expectedHash);
}

function createAdminToken() {
  const payload = Buffer.from(
    JSON.stringify({
      role: "admin",
      exp: Date.now() + adminSessionMaxAgeSeconds * 1000,
    })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function verifyAdminToken(token) {
  if (!token || !token.includes(".")) return false;
  const [payload, signature] = token.split(".");
  if (!timingSafeStringEqual(signature, sign(payload))) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return parsed.role === "admin" && Number(parsed.exp) > Date.now();
  } catch {
    return false;
  }
}

function createCustomerToken(account) {
  const issuedAt = Date.now();
  const payload = Buffer.from(
    JSON.stringify({
      role: "customer",
      accountId: normalizeAccount(account).id,
      iat: issuedAt,
      exp: issuedAt + customerSessionMaxAgeSeconds * 1000,
    })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function verifyCustomerToken(token) {
  if (!token || !token.includes(".")) return null;
  const [payload, signature] = token.split(".");
  if (!timingSafeStringEqual(signature, sign(payload))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (parsed.role !== "customer" || Number(parsed.exp) <= Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

function adminCookie(token) {
  return `${adminCookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${adminSessionMaxAgeSeconds}${isProduction ? "; Secure" : ""}`;
}

function clearAdminCookie() {
  return `${adminCookieName}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${isProduction ? "; Secure" : ""}`;
}

function customerCookie(token) {
  return `${customerCookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${customerSessionMaxAgeSeconds}${isProduction ? "; Secure" : ""}`;
}

function clearCustomerCookie() {
  return `${customerCookieName}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${isProduction ? "; Secure" : ""}`;
}

function isAdmin(req) {
  return verifyAdminToken(parseCookies(req)[adminCookieName]);
}

async function getCustomerFromRequest(req) {
  const payload = verifyCustomerToken(parseCookies(req)[customerCookieName]);
  if (!payload?.accountId) return null;
  const accounts = asArray(await readJson(accountsFile, [])).map(normalizeAccount);
  const account = accounts.find((item) => item.id === payload.accountId);
  if (!account) return null;
  if (account.logoutAllAt && Date.parse(account.logoutAllAt) > Number(payload.iat || 0)) return null;
  return account;
}

async function requireCustomer(req, res) {
  const account = await getCustomerFromRequest(req);
  if (account) return account;
  sendJson(res, 401, { error: "Customer login required" }, { "Set-Cookie": clearCustomerCookie() });
  return null;
}

function requireAdmin(req, res) {
  if (!isAdminNetworkAllowed(req)) {
    sendJson(res, 404, { error: "Not found" });
    return false;
  }
  if (!adminPassword) {
    sendJson(res, 503, { error: "Admin password is not configured. Set ADMIN_PASSWORD in Render Environment first." });
    return false;
  }
  if (isAdmin(req)) return true;
  sendJson(res, 401, { error: "Admin login required" });
  return false;
}

async function ensureDataFiles() {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(uploadedAssetsDir, { recursive: true });
  try {
    await fs.access(productsFile);
  } catch {
    await writeJson(productsFile, []);
  }
  try {
    await fs.access(brandsFile);
  } catch {
    await writeJson(brandsFile, []);
  }
  try {
    await fs.access(adsFile);
  } catch {
    await writeJson(adsFile, []);
  }
  try {
    await fs.access(ordersFile);
  } catch {
    await writeJson(ordersFile, []);
  }
  try {
    await fs.access(accountsFile);
  } catch {
    await writeJson(accountsFile, []);
  }
  try {
    await fs.access(paymentAttemptsFile);
  } catch {
    await writeJson(paymentAttemptsFile, []);
  }
}

async function migrateInlineUploads() {
  const products = asArray(await readJson(productsFile, []));
  if (products.some((product) => [product.image, ...rawImageList(product.images)].some((image) => inlineImagePayload(image)))) {
    const migratedProducts = [];
    for (const product of products) {
      migratedProducts.push(normalizeProduct(await persistProductImages(product)));
    }
    await writeJson(productsFile, migratedProducts);
  }

  const brands = asArray(await readJson(brandsFile, []));
  if (brands.some((brand) => inlineImagePayload(brand.logo))) {
    const migratedBrands = [];
    for (const brand of brands) {
      migratedBrands.push(normalizeBrand(await persistBrandImage(brand)));
    }
    await writeJson(brandsFile, migratedBrands);
  }

  const ads = asArray(await readJson(adsFile, []));
  if (ads.some((ad) => inlineImagePayload(ad.image))) {
    const migratedAds = [];
    for (const ad of ads) {
      migratedAds.push(normalizeAd(await persistAdImage(ad)));
    }
    await writeJson(adsFile, migratedAds);
  }
}

async function pruneRetiredSeedData() {
  const products = asArray(await readJson(productsFile, []));
  const visibleProducts = products.filter((product) => !isRetiredDefaultProduct(product));
  if (visibleProducts.length !== products.length) {
    await writeJson(productsFile, visibleProducts);
  }

  const brands = asArray(await readJson(brandsFile, []));
  const visibleBrands = brands.filter((brand) => !isRetiredDefaultBrand(brand));
  if (visibleBrands.length !== brands.length) {
    await writeJson(brandsFile, visibleBrands);
  }

  const ads = asArray(await readJson(adsFile, []));
  const visibleAds = ads.filter((ad) => !isRetiredDefaultAd(ad));
  if (visibleAds.length !== ads.length) {
    await writeJson(adsFile, visibleAds);
  }
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

async function writeJson(filePath, data) {
  const previousWrite = fileWriteQueues.get(filePath) || Promise.resolve();
  const writeTask = previousWrite.catch(() => {}).then(async () => {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tempPath, `${JSON.stringify(data, null, 2)}\n`);
    await fs.rename(tempPath, filePath);
  });
  fileWriteQueues.set(filePath, writeTask);
  try {
    await writeTask;
  } finally {
    if (fileWriteQueues.get(filePath) === writeTask) {
      fileWriteQueues.delete(filePath);
    }
  }
}

async function checkoutPayloadFromBody(body) {
  const customer = normalizeOrderCustomer(body.customer || {});
  const submittedItems = Array.isArray(body.items) ? body.items.map(normalizeOrderItem).filter((item) => item.name) : [];
  const catalog = visibleStoredProducts(await readJson(productsFile, []));
  const productsByName = new Map(catalog.map((product) => [product.name.toLowerCase(), product]));
  const items = submittedItems.map((item) => {
    const catalogProduct = productsByName.get(item.name.toLowerCase());
    return {
      ...item,
      price: catalogProduct?.price || item.price,
      hsn: catalogProduct?.hsn || item.hsn || defaultHsnCode,
      unit: catalogProduct?.unit || item.unit || defaultUnit,
      gstRate: Number(catalogProduct?.gstRate ?? item.gstRate ?? defaultGstRate),
      category: String(catalogProduct?.category || "").toLowerCase(),
    };
  });
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const requiresFreightConfirmation =
    subtotal >= freightConfirmationLimit ||
    items.some((item) => {
      const lineTotal = item.price * item.qty;
      return (
        item.category.includes("equipment") ||
        item.category.includes("clinic") ||
        lineTotal >= 10000 ||
        /autoclave|chair|compressor|x-?ray|scanner|sensor|equipment|installation/i.test(item.name)
      );
    });
  const shipping = requiresFreightConfirmation
    ? {
        charge: 0,
        label: "To be confirmed",
        note: "Bulky equipment, high-value, or clinic setup freight is confirmed during callback.",
        requiresCallback: true,
      }
    : subtotal >= freeShippingThreshold
      ? {
          charge: 0,
          label: "Free",
          note: `Free shipping above Rs. ${freeShippingThreshold.toLocaleString("en-IN")}.`,
          requiresCallback: false,
        }
      : {
          charge: standardShippingFee,
          label: `Rs. ${standardShippingFee.toLocaleString("en-IN")}`,
          note: `Standard shipping applies below Rs. ${freeShippingThreshold.toLocaleString("en-IN")}.`,
          requiresCallback: false,
        };
  const total = subtotal + shipping.charge;
  return { customer, items: items.map(({ category, ...item }) => item), subtotal, shipping, total, requiresFreightConfirmation };
}

function checkoutValidationError({ customer, items, subtotal, total, requiresFreightConfirmation }) {
  if (!customer.name || normalizePhone(customer.phone).length < 10 || !customer.address) {
    return "Customer name, 10 digit phone number, and address are required";
  }
  if (!items.length || total <= 0) {
    return "Add at least one product before placing an order";
  }
  if (customer.payment === cashOnDeliveryMethod && (requiresFreightConfirmation || subtotal > cashCodLimit)) {
    return `Cash on delivery is available only for standard orders up to Rs. ${cashCodLimit.toLocaleString("en-IN")}`;
  }
  return "";
}

function razorpayConfigured() {
  return Boolean(razorpayKeyId && razorpayKeySecret);
}

function amountToSubunits(amount) {
  return Math.round(Number(amount || 0) * 100);
}

function razorpayAuthHeader() {
  return `Basic ${Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64")}`;
}

async function createRazorpayOrder(payload) {
  const receipt = createPublicId("DF").slice(0, 40);
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: razorpayAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountToSubunits(payload.total),
      currency: paymentCurrency,
      receipt,
      notes: {
        customer_name: payload.customer.name,
        customer_phone: normalizePhone(payload.customer.phone),
        source: "Dental Factory website",
      },
    }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error?.description || result.error?.reason || "Razorpay order could not be created");
  }
  return result;
}

function verifyRazorpaySignature({ razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature }) {
  if (!orderId || !paymentId || !signature) return false;
  const expected = crypto.createHmac("sha256", razorpayKeySecret).update(`${orderId}|${paymentId}`).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

function withSecurityHeaders(headers = {}) {
  return { ...securityHeaders, ...headers };
}

function sendJson(res, status, payload, headers = {}) {
  res.writeHead(status, withSecurityHeaders({ "Content-Type": "application/json; charset=utf-8", ...headers }));
  res.end(JSON.stringify(payload));
}

function sendText(res, status, text) {
  res.writeHead(status, withSecurityHeaders({ "Content-Type": "text/plain; charset=utf-8" }));
  res.end(text);
}

function stripRetiredAnnouncementHtml(html) {
  return String(html || "").replace(/\r?\n\s*<div class="announcement">[\s\S]*?<\/div>\s*\r?\n/g, "\n");
}

async function readRequestJson(req, maxBytes = maxPublicJsonBodyBytes) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) {
      throw new Error("Request body too large");
    }
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function clientIp(req) {
  return String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "local")
    .split(",")[0]
    .trim();
}

function checkRateLimit(req, res, scope, limit, windowMs) {
  const now = Date.now();
  const key = `${scope}:${clientIp(req)}`;
  const entry = rateLimitStore.get(key);
  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count += 1;
  if (entry.count > limit) {
    const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    sendJson(res, 429, { error: "Too many attempts. Please try again later." }, { "Retry-After": String(retryAfter) });
    return false;
  }
  return true;
}

async function handleApi(req, res, reqUrl) {
  if (reqUrl.pathname === "/api/health") {
    sendJson(res, 200, { ok: true, name: "Dental Factory API" });
    return;
  }

  if (reqUrl.pathname === "/api/payments/config" && req.method === "GET") {
    sendJson(res, 200, {
      razorpayEnabled: razorpayConfigured(),
      keyId: razorpayConfigured() ? razorpayKeyId : "",
      currency: paymentCurrency,
      businessName: "Dental Factory",
    });
    return;
  }

  if (reqUrl.pathname === "/api/payments/razorpay/order" && req.method === "POST") {
    if (!checkRateLimit(req, res, "payment-order", 20, 10 * 60 * 1000)) return;
    const currentAccount = await requireCustomer(req, res);
    if (!currentAccount) return;
    if (!razorpayConfigured()) {
      sendJson(res, 503, { error: "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Render Environment." });
      return;
    }

    const body = await readRequestJson(req);
    const payload = await checkoutPayloadFromBody(body);
    const error = checkoutValidationError(payload);
    if (error) {
      sendJson(res, 400, { error });
      return;
    }

    const razorpayOrder = await createRazorpayOrder(payload);
    const attempts = await readJson(paymentAttemptsFile, []);
    attempts.unshift({
      razorpayOrderId: razorpayOrder.id,
      receipt: razorpayOrder.receipt,
      customer: payload.customer,
      items: payload.items,
      subtotal: payload.subtotal,
      shipping: payload.shipping,
      total: payload.total,
      requiresFreightConfirmation: payload.requiresFreightConfirmation,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency || paymentCurrency,
      status: "created",
      createdAt: new Date().toISOString(),
    });
    await writeJson(paymentAttemptsFile, attempts.slice(0, 200));
    sendJson(res, 201, {
      keyId: razorpayKeyId,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency || paymentCurrency,
      receipt: razorpayOrder.receipt,
      subtotal: payload.subtotal,
      shipping: payload.shipping,
      total: payload.total,
      customer: payload.customer,
      items: payload.items,
    });
    return;
  }

  if (reqUrl.pathname === "/api/payments/razorpay/verify" && req.method === "POST") {
    if (!checkRateLimit(req, res, "payment-verify", 30, 10 * 60 * 1000)) return;
    const currentAccount = await requireCustomer(req, res);
    if (!currentAccount) return;
    if (!razorpayConfigured()) {
      sendJson(res, 503, { error: "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Render Environment." });
      return;
    }

    const body = await readRequestJson(req);
    const razorpay = body.razorpay || body;
    const attempts = await readJson(paymentAttemptsFile, []);
    const attemptIndex = attempts.findIndex((attempt) => attempt.razorpayOrderId === razorpay.razorpay_order_id);
    const attempt = attempts[attemptIndex];
    if (!attempt) {
      sendJson(res, 400, { error: "Payment attempt was not found. Please start checkout again." });
      return;
    }

    const payload = {
      customer: normalizeOrderCustomer(attempt.customer),
      items: Array.isArray(attempt.items) ? attempt.items.map(normalizeOrderItem).filter((item) => item.name) : [],
      subtotal: Number(attempt.subtotal || attempt.total || 0),
      shipping: normalizeShipping(attempt.shipping),
      total: Number(attempt.total || 0),
      requiresFreightConfirmation: Boolean(attempt.requiresFreightConfirmation || attempt.shipping?.requiresCallback),
    };
    const error = checkoutValidationError(payload);
    if (error) {
      sendJson(res, 400, { error });
      return;
    }

    if (!verifyRazorpaySignature(razorpay)) {
      sendJson(res, 400, { error: "Payment verification failed. Please contact support before retrying." });
      return;
    }

    const orders = await readJson(ordersFile, []);
    const existingOrder = orders.find((order) => order.payment?.razorpayPaymentId === razorpay.razorpay_payment_id);
    if (existingOrder) {
      sendJson(res, 200, safeOrder(existingOrder));
      return;
    }

    const order = {
      id: createPublicId("DF"),
      customer: { ...payload.customer, payment: "Online payment (Razorpay)" },
      items: payload.items,
      subtotal: payload.subtotal,
      shipping: payload.shipping,
      total: payload.total,
      status: "Paid - callback pending",
      payment: {
        method: "Online payment (Razorpay)",
        status: "Paid",
        provider: "Razorpay",
        razorpayOrderId: razorpay.razorpay_order_id,
        razorpayPaymentId: razorpay.razorpay_payment_id,
        amount: payload.total,
        currency: paymentCurrency,
      },
      createdAt: new Date().toISOString(),
    };
    orders.unshift(order);
    await writeJson(ordersFile, orders);
    if (attemptIndex >= 0) {
      attempts[attemptIndex] = {
        ...attempt,
        status: "paid",
        razorpayPaymentId: razorpay.razorpay_payment_id,
        paidAt: order.createdAt,
        dentalFactoryOrderId: order.id,
      };
      await writeJson(paymentAttemptsFile, attempts.slice(0, 200));
    }
    sendJson(res, 201, safeOrder(order));
    return;
  }

  if (reqUrl.pathname === "/api/admin/session" && req.method === "GET") {
    if (!isAdminNetworkAllowed(req)) {
      sendJson(res, 404, { error: "Not found" });
      return;
    }
    sendJson(res, 200, {
      authenticated: Boolean(adminPassword) && isAdmin(req),
      adminConfigured: Boolean(adminPassword),
      sessionMinutes: adminSessionMinutes,
      storage: storageNotice(),
    });
    return;
  }

  if (reqUrl.pathname === "/api/admin/login" && req.method === "POST") {
    if (!isAdminNetworkAllowed(req)) {
      sendJson(res, 404, { error: "Not found" });
      return;
    }
    if (!checkRateLimit(req, res, "admin-login", 8, 15 * 60 * 1000)) return;
    if (!adminPassword) {
      sendJson(res, 503, { error: "Admin password is not configured. Set ADMIN_PASSWORD in Render Environment first." });
      return;
    }
    const body = await readRequestJson(req, 16 * 1024);
    const submittedUsername = String(body.username || "").trim();
    if (!timingSafeStringEqual(submittedUsername, adminUsername)) {
      sendJson(res, 401, { error: "Wrong admin ID or password" }, { "Set-Cookie": clearAdminCookie() });
      return;
    }
    if (!timingSafeStringEqual(body.password || "", adminPassword)) {
      sendJson(res, 401, { error: "Wrong admin ID or password" }, { "Set-Cookie": clearAdminCookie() });
      return;
    }
    sendJson(res, 200, { authenticated: true }, { "Set-Cookie": adminCookie(createAdminToken()) });
    return;
  }

  if (reqUrl.pathname === "/api/admin/logout" && req.method === "POST") {
    if (!isAdminNetworkAllowed(req)) {
      sendJson(res, 404, { error: "Not found" });
      return;
    }
    sendJson(res, 200, { authenticated: false }, { "Set-Cookie": clearAdminCookie() });
    return;
  }

  if (reqUrl.pathname === "/api/brands" && req.method === "GET") {
    const brands = visibleStoredBrands(await readJson(brandsFile, []))
      .sort((a, b) => a.name.localeCompare(b.name));
    sendJson(res, 200, brands);
    return;
  }

  if (reqUrl.pathname === "/api/brands" && req.method === "POST") {
    if (!requireAdmin(req, res)) return;
    const body = await readRequestJson(req, maxAdminJsonBodyBytes);
    const brand = normalizeBrand(await persistBrandImage(body.brand || body));
    if (!brand.name) {
      sendJson(res, 400, { error: "Brand name is required" });
      return;
    }
    const brands = visibleStoredBrands(await readJson(brandsFile, []));
    const editing = String(body.editing || brand.id || brand.name);
    const editingSlug = slugify(editing);
    const index = brands.findIndex((item) => item.id === editingSlug || item.name.toLowerCase() === editing.toLowerCase());
    brand.updatedAt = new Date().toISOString();
    if (index >= 0) {
      brands[index] = brand;
    } else {
      brands.push(brand);
    }
    await writeJson(brandsFile, brands);
    sendJson(res, index >= 0 ? 200 : 201, brand);
    return;
  }

  if (reqUrl.pathname.startsWith("/api/brands/") && req.method === "DELETE") {
    if (!requireAdmin(req, res)) return;
    const idOrName = decodeURIComponent(reqUrl.pathname.replace("/api/brands/", ""));
    const id = slugify(idOrName);
    const products = visibleStoredProducts(await readJson(productsFile, []));
    const brandInUse = products.some((product) => slugify(product.brand) === id || product.brand.toLowerCase() === idOrName.toLowerCase());
    if (brandInUse) {
      sendJson(res, 409, { error: "This brand is used by products. Change or delete those products before deleting the brand." });
      return;
    }
    const brands = visibleStoredBrands(await readJson(brandsFile, []));
    const nextBrands = brands.filter((brand) => brand.id !== id && brand.name !== idOrName);
    await writeJson(brandsFile, nextBrands);
    sendJson(res, 200, { deleted: brands.length - nextBrands.length, id: idOrName });
    return;
  }

  if (reqUrl.pathname === "/api/ads" && req.method === "GET") {
    const ads = (await readJson(adsFile, [])).filter((ad) => !isRetiredDefaultAd(ad)).map(normalizeAd);
    const publicAds = ads
      .filter((ad) => ad.active && ad.title)
      .sort((a, b) => a.priority - b.priority)
      .map(({ updatedAt, ...ad }) => ad);
    sendJson(res, 200, publicAds);
    return;
  }

  if (reqUrl.pathname === "/api/admin/ads" && req.method === "GET") {
    if (!requireAdmin(req, res)) return;
    const ads = (await readJson(adsFile, [])).filter((ad) => !isRetiredDefaultAd(ad)).map(normalizeAd).filter((ad) => ad.title);
    sendJson(res, 200, ads.sort((a, b) => a.priority - b.priority));
    return;
  }

  if (reqUrl.pathname === "/api/admin/ads" && req.method === "POST") {
    if (!requireAdmin(req, res)) return;
    const body = await readRequestJson(req, maxAdminJsonBodyBytes);
    const ad = normalizeAd(await persistAdImage(body.ad || body));
    if (!ad.title) {
      sendJson(res, 400, { error: "Ad title is required" });
      return;
    }
    const ads = (await readJson(adsFile, [])).filter((item) => !isRetiredDefaultAd(item)).map(normalizeAd).filter((item) => item.title);
    const editing = String(body.editing || ad.id || ad.title);
    const editingSlug = slugify(editing);
    const index = ads.findIndex((item) => item.id === editingSlug || item.title.toLowerCase() === editing.toLowerCase());
    ad.updatedAt = new Date().toISOString();
    if (index >= 0) {
      ads[index] = ad;
    } else {
      ads.push(ad);
    }
    await writeJson(adsFile, ads);
    sendJson(res, index >= 0 ? 200 : 201, ad);
    return;
  }

  if (reqUrl.pathname.startsWith("/api/admin/ads/") && req.method === "DELETE") {
    if (!requireAdmin(req, res)) return;
    const idOrTitle = decodeURIComponent(reqUrl.pathname.replace("/api/admin/ads/", ""));
    const id = slugify(idOrTitle);
    const ads = (await readJson(adsFile, [])).filter((ad) => !isRetiredDefaultAd(ad)).map(normalizeAd).filter((ad) => ad.title);
    const nextAds = ads.filter((ad) => ad.id !== id && ad.title !== idOrTitle);
    await writeJson(adsFile, nextAds);
    sendJson(res, 200, { deleted: ads.length - nextAds.length, id: idOrTitle });
    return;
  }

  if (reqUrl.pathname === "/api/products" && req.method === "GET") {
    const products = visibleStoredProducts(await readJson(productsFile, []));
    sendJson(res, 200, products);
    return;
  }

  if (reqUrl.pathname === "/api/products" && req.method === "POST") {
    if (!requireAdmin(req, res)) return;
    const body = await readRequestJson(req, maxAdminJsonBodyBytes);
    const product = normalizeProduct(await persistProductImages(body.product || body));
    if (!product.name) {
      sendJson(res, 400, { error: "Product name is required" });
      return;
    }

    const products = visibleStoredProducts(await readJson(productsFile, []));
    const editing = String(body.editing || product.id || product.name);
    const editingSlug = slugify(editing);
    const index = products.findIndex((item) => item.id === editingSlug || item.name === editing);
    product.updatedAt = new Date().toISOString();

    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }

    await writeJson(productsFile, products);
    sendJson(res, index >= 0 ? 200 : 201, product);
    return;
  }

  if (reqUrl.pathname.startsWith("/api/products/") && req.method === "DELETE") {
    if (!requireAdmin(req, res)) return;
    const idOrName = decodeURIComponent(reqUrl.pathname.replace("/api/products/", ""));
    const id = slugify(idOrName);
    const products = visibleStoredProducts(await readJson(productsFile, []));
    const nextProducts = products.filter((product) => product.id !== id && product.name !== idOrName);
    await writeJson(productsFile, nextProducts);
    sendJson(res, 200, { deleted: products.length - nextProducts.length, id: idOrName });
    return;
  }

  if (reqUrl.pathname === "/api/orders" && req.method === "GET") {
    if (!requireAdmin(req, res)) return;
    const orders = await readJson(ordersFile, []);
    sendJson(res, 200, orders.map(safeOrder));
    return;
  }

  const orderStatusMatch = reqUrl.pathname.match(/^\/api\/orders\/([^/]+)\/status$/);
  if (orderStatusMatch && req.method === "POST") {
    if (!requireAdmin(req, res)) return;
    const orderId = decodeURIComponent(orderStatusMatch[1]);
    const body = await readRequestJson(req, 16 * 1024);
    const nextStatus = normalizeOrderStatus(body.status);
    if (!nextStatus) {
      sendJson(res, 400, { error: "Choose a valid order status" });
      return;
    }

    const orders = await readJson(ordersFile, []);
    const index = orders.findIndex((order) => String(order.id || "").toLowerCase() === orderId.toLowerCase());
    if (index < 0) {
      sendJson(res, 404, { error: "Order not found" });
      return;
    }

    orders[index] = {
      ...orders[index],
      status: nextStatus,
      statusUpdatedAt: new Date().toISOString(),
    };
    await writeJson(ordersFile, orders);
    sendJson(res, 200, safeOrder(orders[index]));
    return;
  }

  if (reqUrl.pathname === "/api/orders" && req.method === "POST") {
    if (!checkRateLimit(req, res, "checkout-order", 30, 10 * 60 * 1000)) return;
    const currentAccount = await requireCustomer(req, res);
    if (!currentAccount) return;
    const body = await readRequestJson(req);
    const orders = await readJson(ordersFile, []);
    const payload = await checkoutPayloadFromBody(body);
    const { customer, items, subtotal, shipping, total } = payload;
    const error = checkoutValidationError(payload);

    if (error) {
      sendJson(res, 400, { error });
      return;
    }

    const order = {
      id: createPublicId("DF"),
      customer,
      items,
      subtotal,
      shipping,
      total,
      status: "Request received",
      payment: {
        method: customer.payment,
        status: "Pending",
        amount: total,
        currency: paymentCurrency,
      },
      createdAt: new Date().toISOString(),
    };
    orders.unshift(order);
    await writeJson(ordersFile, orders);
    sendJson(res, 201, order);
    return;
  }

  if (reqUrl.pathname === "/api/orders/track" && req.method === "GET") {
    const query = String(reqUrl.searchParams.get("query") || "").trim();
    if (!query) {
      sendJson(res, 400, { error: "Order ID or mobile number is required" });
      return;
    }
    const queryPhone = normalizePhone(query);
    const looksLikeOrderId = /^DF-[A-Z0-9-]{4,24}$/i.test(query);
    if (!looksLikeOrderId && queryPhone.length < 10) {
      sendJson(res, 400, { error: "Enter the full order ID or 10 digit mobile number" });
      return;
    }
    const orders = await readJson(ordersFile, []);
    const order = orders.find((item) => {
      const sameId = String(item.id || "").toLowerCase() === query.toLowerCase();
      const samePhone = queryPhone.length >= 10 && normalizePhone(item.customer?.phone).endsWith(queryPhone.slice(-10));
      return sameId || samePhone;
    });
    if (!order) {
      sendJson(res, 404, { error: "Order not found" });
      return;
    }
    sendJson(res, 200, publicOrder(order));
    return;
  }

  const orderDetailMatch = reqUrl.pathname.match(/^\/api\/orders\/([^/]+)$/);
  if (orderDetailMatch && req.method === "GET") {
    if (!requireAdmin(req, res)) return;
    const orderId = decodeURIComponent(orderDetailMatch[1]);
    const orders = await readJson(ordersFile, []);
    const order = orders.find((item) => String(item.id || "").toLowerCase() === orderId.toLowerCase());
    if (!order) {
      sendJson(res, 404, { error: "Order not found" });
      return;
    }
    sendJson(res, 200, safeOrder(order));
    return;
  }

  if (reqUrl.pathname === "/api/customer/otp/start" && req.method === "POST") {
    if (!checkRateLimit(req, res, "customer-otp-start", 12, 15 * 60 * 1000)) return;
    const body = await readRequestJson(req, 32 * 1024);
    const login = normalizeLoginIdentifier(body.login || body.mobile || body.email || body.phone);
    if (!login) {
      sendJson(res, 400, { error: "Enter a valid 10 digit mobile number or email address" });
      return;
    }

    const now = new Date().toISOString();
    const otp = createOtpCode();
    const accounts = asArray(await readJson(accountsFile, [])).map(normalizeAccount);
    const index = findCustomerIndex(accounts, login);
    const base = index >= 0 ? accounts[index] : normalizeAccount({ login });
    const password = String(body.password || "").trim();
    const updated = normalizeAccount({
      ...base,
      login: base.login || login,
      mobile: login.includes("@") ? base.mobile : login,
      email: login.includes("@") ? login : base.email,
      name: body.name || base.name,
      clinic: body.clinic || base.clinic,
      type: body.type || body.customerType || base.type,
      gstin: body.gstin || base.gstin,
      status: base.verifiedAt ? "Verified" : "OTP pending",
      passwordHash: password.length >= 6 ? hashCustomerPassword(password) : base.passwordHash,
      passwordUpdatedAt: password.length >= 6 ? now : base.passwordUpdatedAt,
      otpHash: hashCustomerOtp(login, otp),
      otpIssuedAt: now,
      otpExpiresAt: new Date(Date.now() + customerOtpMaxAgeSeconds * 1000).toISOString(),
      updatedAt: now,
      notifications: [
        normalizeNotification({
          type: "Security",
          title: "OTP requested",
          message: `Login OTP requested for ${maskLogin(login)}.`,
          createdAt: now,
        }),
        ...base.notifications,
      ].slice(0, 20),
    });

    if (index >= 0) accounts[index] = updated;
    else accounts.unshift(updated);
    let delivery;
    try {
      delivery = await deliverCustomerOtp(login, otp);
    } catch (error) {
      sendJson(res, 502, { error: error.message || "OTP delivery failed. Please try again." });
      return;
    }
    if (!delivery.configured && !otpShowDemo) {
      sendJson(res, 503, { error: "OTP service is not configured. Add SMS/email gateway settings in Render first." });
      return;
    }
    await writeJson(accountsFile, accounts);
    sendJson(res, index >= 0 ? 200 : 201, {
      account: safeAccount(updated),
      otpSentTo: maskLogin(login),
      otpExpiresInSeconds: customerOtpMaxAgeSeconds,
      demoOtp: otpShowDemo ? otp : "",
      delivered: delivery.delivered,
      channel: delivery.channel,
      message: delivery.delivered ? "OTP sent." : "OTP generated for testing.",
    });
    return;
  }

  if (reqUrl.pathname === "/api/customer/google" && req.method === "POST") {
    if (!checkRateLimit(req, res, "customer-google-login", 20, 15 * 60 * 1000)) return;
    if (!googleClientId) {
      sendJson(res, 503, { error: "Google login is not configured. Add GOOGLE_CLIENT_ID in Render Environment first." });
      return;
    }
    const body = await readRequestJson(req, 32 * 1024);
    const credential = String(body.credential || "").trim();
    if (!credential) {
      sendJson(res, 400, { error: "Google credential missing." });
      return;
    }

    let profile;
    try {
      profile = await verifyGoogleCredential(credential);
    } catch (error) {
      sendJson(res, 401, { error: error.message || "Google login failed." });
      return;
    }

    const now = new Date().toISOString();
    const accounts = asArray(await readJson(accountsFile, [])).map(normalizeAccount);
    const index = findCustomerIndex(accounts, profile.email);
    const base = index >= 0 ? accounts[index] : normalizeAccount({ login: profile.email, email: profile.email });
    const updated = normalizeAccount({
      ...base,
      login: profile.email,
      email: profile.email,
      name: profile.name || base.name,
      clinic: base.clinic,
      type: base.type || "clinic",
      status: "Verified",
      verifiedAt: now,
      updatedAt: now,
      notifications: [
        normalizeNotification({
          type: "Security",
          title: "Google login verified",
          message: `Google sign-in completed for ${maskLogin(profile.email)}.`,
          createdAt: now,
        }),
        ...base.notifications,
      ].slice(0, 20),
    });
    if (index >= 0) accounts[index] = updated;
    else accounts.unshift(updated);
    await writeJson(accountsFile, accounts);
    sendJson(res, index >= 0 ? 200 : 201, await customerDashboardPayload(updated), { "Set-Cookie": customerCookie(createCustomerToken(updated)) });
    return;
  }

  if (reqUrl.pathname === "/api/customer/auth/config" && req.method === "GET") {
    sendJson(res, 200, {
      googleEnabled: Boolean(googleClientId),
      googleClientId,
      otpSmsConfigured: Boolean(otpSmsWebhookUrl),
      otpEmailConfigured: Boolean(otpEmailWebhookUrl),
      demoOtpEnabled: otpShowDemo,
    });
    return;
  }

  if (reqUrl.pathname === "/api/customer/otp/verify" && req.method === "POST") {
    if (!checkRateLimit(req, res, "customer-otp-verify", 20, 15 * 60 * 1000)) return;
    const body = await readRequestJson(req, 16 * 1024);
    const login = normalizeLoginIdentifier(body.login || body.mobile || body.email || body.phone);
    const otp = String(body.otp || "").replace(/\D/g, "");
    if (!login || otp.length !== 6) {
      sendJson(res, 400, { error: "Enter the 6 digit OTP" });
      return;
    }

    const accounts = asArray(await readJson(accountsFile, [])).map(normalizeAccount);
    const index = findCustomerIndex(accounts, login);
    const account = index >= 0 ? accounts[index] : null;
    if (!account || !account.otpHash || !account.otpExpiresAt || Date.parse(account.otpExpiresAt) < Date.now()) {
      sendJson(res, 400, { error: "OTP expired. Request a fresh OTP." });
      return;
    }
    if (!timingSafeStringEqual(account.otpHash, hashCustomerOtp(login, otp))) {
      sendJson(res, 401, { error: "Wrong OTP" });
      return;
    }

    const now = new Date().toISOString();
    const updated = normalizeAccount({
      ...account,
      status: "Verified",
      verifiedAt: now,
      otpHash: "",
      otpExpiresAt: "",
      otpIssuedAt: "",
      updatedAt: now,
      notifications: [
        normalizeNotification({
          type: "Security",
          title: "Login verified",
          message: "Customer account login verified by OTP.",
          createdAt: now,
        }),
        ...account.notifications,
      ].slice(0, 20),
    });
    accounts[index] = updated;
    await writeJson(accountsFile, accounts);
    sendJson(res, 200, await customerDashboardPayload(updated), { "Set-Cookie": customerCookie(createCustomerToken(updated)) });
    return;
  }

  if (reqUrl.pathname === "/api/customer/me" && req.method === "GET") {
    const account = await requireCustomer(req, res);
    if (!account) return;
    sendJson(res, 200, await customerDashboardPayload(account));
    return;
  }

  if (reqUrl.pathname === "/api/customer/profile" && req.method === "POST") {
    const currentAccount = await requireCustomer(req, res);
    if (!currentAccount) return;
    const body = await readRequestJson(req, 32 * 1024);
    const accounts = asArray(await readJson(accountsFile, [])).map(normalizeAccount);
    const index = accounts.findIndex((account) => account.id === currentAccount.id);
    if (index < 0) {
      sendJson(res, 404, { error: "Customer account not found" }, { "Set-Cookie": clearCustomerCookie() });
      return;
    }
    const nextName = cleanText(body.name ?? accounts[index].name, 140);
    const nextClinic = cleanText(body.clinic ?? body.business ?? body.company ?? accounts[index].clinic, 160);
    const nextMobile = normalizePhone(body.mobile ?? body.phone ?? accounts[index].mobile).slice(-10);
    const nextEmail = normalizeEmail(body.email ?? accounts[index].email);
    if (!nextName) {
      sendJson(res, 400, { error: "Full name is required." });
      return;
    }
    if (!nextClinic) {
      sendJson(res, 400, { error: "Business name is required." });
      return;
    }
    if (nextMobile.length !== 10) {
      sendJson(res, 400, { error: "Enter a valid 10 digit mobile number." });
      return;
    }
    if (nextEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      sendJson(res, 400, { error: "Enter a valid email address." });
      return;
    }
    const next = normalizeAccount({
      ...accounts[index],
      name: nextName,
      clinic: nextClinic,
      email: nextEmail,
      mobile: nextMobile,
      gstin: body.gstin ?? accounts[index].gstin,
      type: body.type ?? body.customerType ?? accounts[index].type,
      updatedAt: new Date().toISOString(),
    });
    accounts[index] = next;
    await writeJson(accountsFile, accounts);
    sendJson(res, 200, await customerDashboardPayload(next));
    return;
  }

  if (reqUrl.pathname === "/api/customer/password" && req.method === "POST") {
    const currentAccount = await requireCustomer(req, res);
    if (!currentAccount) return;
    const body = await readRequestJson(req, 16 * 1024);
    const password = String(body.password || "");
    if (password.length < 6) {
      sendJson(res, 400, { error: "Password must be at least 6 characters" });
      return;
    }
    const accounts = asArray(await readJson(accountsFile, [])).map(normalizeAccount);
    const index = accounts.findIndex((account) => account.id === currentAccount.id);
    if (index < 0) {
      sendJson(res, 404, { error: "Customer account not found" }, { "Set-Cookie": clearCustomerCookie() });
      return;
    }
    accounts[index] = normalizeAccount({
      ...accounts[index],
      passwordHash: hashCustomerPassword(password),
      passwordUpdatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await writeJson(accountsFile, accounts);
    sendJson(res, 200, { account: safeAccount(accounts[index]), message: "Password option updated." });
    return;
  }

  if (reqUrl.pathname === "/api/customer/addresses" && req.method === "POST") {
    const currentAccount = await requireCustomer(req, res);
    if (!currentAccount) return;
    const body = await readRequestJson(req, 32 * 1024);
    const address = normalizeAddress(body.address || body);
    if (!address.line1) {
      sendJson(res, 400, { error: "Address is required" });
      return;
    }
    const accounts = asArray(await readJson(accountsFile, [])).map(normalizeAccount);
    const index = accounts.findIndex((account) => account.id === currentAccount.id);
    if (index < 0) {
      sendJson(res, 404, { error: "Customer account not found" }, { "Set-Cookie": clearCustomerCookie() });
      return;
    }
    const addresses = accounts[index].addresses.filter((item) => item.id !== address.id);
    if (address.isDefault || !addresses.length) {
      addresses.forEach((item) => {
        item.isDefault = false;
      });
      address.isDefault = true;
    }
    accounts[index] = normalizeAccount({
      ...accounts[index],
      addresses: [address, ...addresses].slice(0, 12),
      updatedAt: new Date().toISOString(),
    });
    await writeJson(accountsFile, accounts);
    sendJson(res, 200, await customerDashboardPayload(accounts[index]));
    return;
  }

  const customerAddressDeleteMatch = reqUrl.pathname.match(/^\/api\/customer\/addresses\/([^/]+)$/);
  if (customerAddressDeleteMatch && req.method === "DELETE") {
    const currentAccount = await requireCustomer(req, res);
    if (!currentAccount) return;
    const addressId = decodeURIComponent(customerAddressDeleteMatch[1]);
    const accounts = asArray(await readJson(accountsFile, [])).map(normalizeAccount);
    const index = accounts.findIndex((account) => account.id === currentAccount.id);
    if (index < 0) {
      sendJson(res, 404, { error: "Customer account not found" }, { "Set-Cookie": clearCustomerCookie() });
      return;
    }
    accounts[index] = normalizeAccount({
      ...accounts[index],
      addresses: accounts[index].addresses.filter((address) => address.id !== addressId),
      updatedAt: new Date().toISOString(),
    });
    await writeJson(accountsFile, accounts);
    sendJson(res, 200, await customerDashboardPayload(accounts[index]));
    return;
  }

  if (reqUrl.pathname === "/api/customer/tickets" && req.method === "POST") {
    const currentAccount = await requireCustomer(req, res);
    if (!currentAccount) return;
    const body = await readRequestJson(req, 32 * 1024);
    const ticket = normalizeTicket(body.ticket || body);
    if (!ticket.subject && !ticket.message) {
      sendJson(res, 400, { error: "Ticket subject or message is required" });
      return;
    }
    const accounts = asArray(await readJson(accountsFile, [])).map(normalizeAccount);
    const index = accounts.findIndex((account) => account.id === currentAccount.id);
    if (index < 0) {
      sendJson(res, 404, { error: "Customer account not found" }, { "Set-Cookie": clearCustomerCookie() });
      return;
    }
    accounts[index] = normalizeAccount({
      ...accounts[index],
      tickets: [ticket, ...accounts[index].tickets].slice(0, 30),
      notifications: [
        normalizeNotification({
          type: "Support",
          title: `${ticket.type} ticket raised`,
          message: ticket.subject || ticket.message,
          createdAt: ticket.createdAt,
        }),
        ...accounts[index].notifications,
      ].slice(0, 20),
      updatedAt: new Date().toISOString(),
    });
    await writeJson(accountsFile, accounts);
    sendJson(res, 201, await customerDashboardPayload(accounts[index]));
    return;
  }

  if (reqUrl.pathname === "/api/customer/logout" && req.method === "POST") {
    sendJson(res, 200, { authenticated: false }, { "Set-Cookie": clearCustomerCookie() });
    return;
  }

  if (reqUrl.pathname === "/api/customer/logout-all" && req.method === "POST") {
    const currentAccount = await requireCustomer(req, res);
    if (!currentAccount) return;
    const accounts = asArray(await readJson(accountsFile, [])).map(normalizeAccount);
    const index = accounts.findIndex((account) => account.id === currentAccount.id);
    if (index >= 0) {
      accounts[index] = normalizeAccount({
        ...accounts[index],
        logoutAllAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      await writeJson(accountsFile, accounts);
    }
    sendJson(res, 200, { authenticated: false }, { "Set-Cookie": clearCustomerCookie() });
    return;
  }

  if (reqUrl.pathname === "/api/accounts" && req.method === "POST") {
    if (!checkRateLimit(req, res, "account-request", 30, 10 * 60 * 1000)) return;
    const body = await readRequestJson(req);
    const account = normalizeAccount(body.account || body);
    if (account.mobile.length < 10 || !account.clinic) {
      sendJson(res, 400, { error: "Mobile number and clinic name are required" });
      return;
    }
    const accounts = (await readJson(accountsFile, [])).map(normalizeAccount);
    const index = findCustomerIndex(accounts, account.login || account.mobile);
    if (index >= 0) {
      accounts[index] = normalizeAccount({
        ...accounts[index],
        ...account,
        id: accounts[index].id,
        createdAt: accounts[index].createdAt,
        passwordHash: accounts[index].passwordHash,
        passwordUpdatedAt: accounts[index].passwordUpdatedAt,
        otpHash: accounts[index].otpHash,
        otpExpiresAt: accounts[index].otpExpiresAt,
        otpIssuedAt: accounts[index].otpIssuedAt,
        verifiedAt: accounts[index].verifiedAt,
      });
    } else {
      accounts.unshift(account);
    }
    await writeJson(accountsFile, accounts);
    sendJson(res, index >= 0 ? 200 : 201, safeAccount(index >= 0 ? accounts[index] : account));
    return;
  }

  if (reqUrl.pathname === "/api/accounts" && req.method === "GET") {
    if (!requireAdmin(req, res)) return;
    sendJson(res, 200, asArray(await readJson(accountsFile, [])).map(safeAccount));
    return;
  }

  sendJson(res, 404, { error: "API route not found" });
}

async function serveUploadedAsset(res, requestPath) {
  const relativeUploadPath = requestPath.slice(uploadPublicPrefix.length).replace(/^\/+/, "");
  const filePath = path.normalize(path.join(uploadedAssetsDir, relativeUploadPath));
  const relativePath = path.relative(uploadedAssetsDir, filePath);
  const extension = path.extname(filePath).toLowerCase();

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath) || !uploadImageExtensions.has(mimeTypes.get(extension))) {
    sendText(res, 404, "Not found");
    return;
  }

  try {
    const data = await fs.readFile(filePath);
    res.writeHead(
      200,
      withSecurityHeaders({
        "Content-Type": mimeTypes.get(extension) || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      })
    );
    res.end(data);
  } catch {
    sendText(res, 404, "Not found");
  }
}

async function readCatalogProducts() {
  return visibleStoredProducts(await readJson(productsFile, []));
}

async function handleLegacyRedirects(res, reqUrl) {
  const requestPath = reqUrl.pathname;
  if (requestPath === "/index.html") {
    redirectPermanent(res, absoluteSiteUrl("/"));
    return true;
  }

  if (requestPath === "/product-detail.html") {
    const identifier = reqUrl.searchParams.get("product") || reqUrl.searchParams.get("id") || reqUrl.searchParams.get("name");
    if (identifier) {
      const products = await readCatalogProducts();
      const product =
        findProductForSeoSlug(products, identifier) ||
        products.find((item) => String(item.name).toLowerCase() === String(identifier).toLowerCase()) ||
        null;
      redirectPermanent(res, absoluteSiteUrl(product ? productSeoUrl(product, products) : `/products/${slugify(identifier)}`));
      return true;
    }
  }

  if (requestPath === "/product.php") {
    const legacyId = String(reqUrl.searchParams.get("id") || "").trim();
    const products = await readCatalogProducts();
    const product =
      products.find((item) => item.id === slugify(legacyId) || String(item.id) === legacyId) ||
      (Number.isInteger(Number(legacyId)) ? products[Number(legacyId) - 1] : null);
    redirectPermanent(res, absoluteSiteUrl(product ? productSeoUrl(product, products) : "/products.html"));
    return true;
  }

  if (requestPath === "/products.html" && reqUrl.searchParams.has("category")) {
    const category = categoryRouteForValue(reqUrl.searchParams.get("category"));
    if (category) {
      redirectPermanent(res, absoluteSiteUrl(`/${category.slug}`));
      return true;
    }
  }
  return false;
}

async function serveProductSeoPage(res, slug) {
  const products = await readCatalogProducts();
  const product = findProductForSeoSlug(products, slug);
  if (!product) {
    sendText(res, 404, "Product not found");
    return;
  }

  const canonicalPath = productSeoUrl(product, products);
  const canonicalSlug = canonicalPath.replace(/^\/products\//, "");
  if (String(slug || "") !== canonicalSlug) {
    redirectPermanent(res, absoluteSiteUrl(canonicalPath));
    return;
  }

  const canonical = absoluteSiteUrl(canonicalPath);
  const description = seoDescription(product.description, `${product.name} by ${product.brand || "Dental Factory"} with clinic-ready pricing and dispatch support.`);
  let html = await fs.readFile(path.join(rootDir, "product-detail.html"), "utf8");
  html = stripRetiredAnnouncementHtml(html);
  html = replaceTitleAndMeta(html, {
    title: `${product.name} - Dental Factory`,
    description,
    canonical,
  });
  html = replaceProductDetailSource(html, product, products);
  html = injectHeadTags(
    html,
    `    <base href="/" />
    ${breadcrumbSchema([
      { name: "Home", url: absoluteSiteUrl("/") },
      { name: "Products", url: absoluteSiteUrl("/products.html") },
      { name: product.name, url: canonical },
    ])}
    ${productSchema(product, canonical)}`
  );
  res.writeHead(
    200,
    withSecurityHeaders({
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    })
  );
  res.end(html);
}

async function serveCategorySeoPage(res, category) {
  const products = await readCatalogProducts();
  const canonical = absoluteSiteUrl(`/${category.slug}`);
  const description = `Shop ${category.title.toLowerCase()} at Dental Factory with clinic-ready products, GST billing, and dispatch support.`;
  let html = await fs.readFile(path.join(rootDir, "products.html"), "utf8");
  html = stripRetiredAnnouncementHtml(html);
  html = enhanceProductsHtml(html, products, category);
  html = replaceTitleAndMeta(html, {
    title: `${category.title} - Dental Factory`,
    description,
    canonical,
  });
  html = injectHeadTags(
    html,
    `    <base href="/" />
    ${breadcrumbSchema([
      { name: "Home", url: absoluteSiteUrl("/") },
      { name: "Products", url: absoluteSiteUrl("/products.html") },
      { name: category.title, url: canonical },
    ])}`
  );
  res.writeHead(
    200,
    withSecurityHeaders({
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    })
  );
  res.end(html);
}

async function serveGoogleMerchantFeed(res) {
  const products = await readCatalogProducts();
  const productEntries = productSeoEntries(products);
  const items = productEntries.map((product) => merchantXmlItem(product, products)).filter(Boolean);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>Dental Factory Products</title>
  <link>${escapeXml(absoluteSiteUrl("/"))}</link>
  <description>Live Dental Factory product feed for Google Merchant Center.</description>
${items.join("\n")}
</channel>
</rss>
`;
  res.writeHead(
    200,
    withSecurityHeaders({
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    })
  );
  res.end(xml);
}

async function serveSitemap(res) {
  const products = await readCatalogProducts();
  const today = new Date().toISOString().slice(0, 10);
  const productEntries = productSeoEntries(products);
  const urls = [
    { loc: absoluteSiteUrl("/"), priority: "1.0", changefreq: "daily" },
    { loc: absoluteSiteUrl("/products.html"), priority: "0.9", changefreq: "daily" },
    { loc: absoluteSiteUrl("/brands.html"), priority: "0.8", changefreq: "weekly" },
    ...categoryRoutes.map((category) => ({ loc: absoluteSiteUrl(`/${category.slug}`), priority: "0.8", changefreq: "weekly" })),
    ...productEntries.map((product) => ({
      loc: absoluteSiteUrl(product.seoUrl),
      priority: "0.7",
      changefreq: "weekly",
      lastmod: product.updatedAt ? String(product.updatedAt).slice(0, 10) : today,
    })),
    { loc: absoluteSiteUrl("/contact.html"), priority: "0.6", changefreq: "monthly" },
    { loc: absoluteSiteUrl("/shipping-policy.html"), priority: "0.5", changefreq: "monthly" },
    { loc: absoluteSiteUrl("/returns-refunds.html"), priority: "0.5", changefreq: "monthly" },
    { loc: absoluteSiteUrl("/privacy-policy.html"), priority: "0.4", changefreq: "yearly" },
    { loc: absoluteSiteUrl("/terms.html"), priority: "0.4", changefreq: "yearly" },
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${escapeXml(url.lastmod || today)}</lastmod>
    <changefreq>${escapeXml(url.changefreq)}</changefreq>
    <priority>${escapeXml(url.priority)}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;
  res.writeHead(
    200,
    withSecurityHeaders({
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    })
  );
  res.end(xml);
}

async function handleStatic(req, res, reqUrl) {
  const requestPath = decodeURIComponent(reqUrl.pathname === "/" ? "/index.html" : reqUrl.pathname);
  if (reqUrl.pathname === "/sitemap.xml") {
    await serveSitemap(res);
    return;
  }
  if (reqUrl.pathname === "/google-merchant-feed.xml") {
    await serveGoogleMerchantFeed(res);
    return;
  }
  if (await handleLegacyRedirects(res, reqUrl)) return;
  if (requestPath.startsWith(`${uploadPublicPrefix}/`)) {
    await serveUploadedAsset(res, requestPath);
    return;
  }
  if (["/index.html", "/products.html", "/brands.html"].includes(requestPath)) {
    await serveSeoStaticPage(res, requestPath);
    return;
  }
  const productRouteMatch = requestPath.match(/^\/products\/([^/]+)\/?$/);
  if (productRouteMatch) {
    if (requestPath.endsWith("/") && requestPath.length > 1) {
      redirectPermanent(res, absoluteSiteUrl(requestPath.replace(/\/+$/, "")));
      return;
    }
    await serveProductSeoPage(res, productRouteMatch[1]);
    return;
  }
  const categoryRoute = categoryRouteBySlug.get(requestPath.replace(/^\/+|\/+$/g, ""));
  if (categoryRoute) {
    await serveCategorySeoPage(res, categoryRoute);
    return;
  }

  const filePath = path.normalize(path.join(rootDir, requestPath));
  const relativePath = path.relative(rootDir, filePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  const pathSegments = relativePath.split(path.sep);
  const extension = path.extname(filePath).toLowerCase();
  if (!publicStaticExtensions.has(extension) || pathSegments.some((segment) => blockedStaticDirectories.has(segment) || segment.startsWith("."))) {
    sendText(res, 404, "Not found");
    return;
  }
  if (relativePath.toLowerCase() === "admin.html" && !isAdminNetworkAllowed(req)) {
    sendText(res, 404, "Not found");
    return;
  }

  try {
    let data = await fs.readFile(filePath);
    const headers = {
      "Content-Type": mimeTypes.get(extension) || "application/octet-stream",
      "Cache-Control": [".html", ".css", ".js"].includes(extension) ? "no-store, max-age=0" : "public, max-age=3600",
    };
    if (extension === ".html") {
      data = Buffer.from(stripRetiredAnnouncementHtml(data.toString("utf8")));
    }
    res.writeHead(200, withSecurityHeaders(headers));
    res.end(data);
  } catch {
    sendText(res, 404, "Not found");
  }
}

await ensureDataFiles();
await migrateInlineUploads();
await pruneRetiredSeedData();

const server = http.createServer(async (req, res) => {
  try {
    if (!["GET", "POST", "DELETE", "HEAD"].includes(req.method || "")) {
      sendJson(res, 405, { error: "Method not allowed" }, { Allow: "GET, POST, DELETE, HEAD" });
      return;
    }

    const reqUrl = new URL(req.url || "/", `http://127.0.0.1:${port}`);
    if (shouldRedirectCanonicalHost(req)) {
      redirectCanonicalHost(req, res, reqUrl);
      return;
    }
    if (reqUrl.pathname.startsWith("/api/")) {
      if (!checkRateLimit(req, res, "api-global", 300, 60 * 1000)) return;
      await handleApi(req, res, reqUrl);
      return;
    }
    await handleStatic(req, res, reqUrl);
  } catch (error) {
    console.error(error);
    const message = error.message || "Server error";
    const status = message === "Request body too large" ? 413 : error instanceof SyntaxError ? 400 : 500;
    sendJson(res, status, { error: status === 500 && isProduction ? "Server error" : message });
  }
});

server.on("clientError", (error, socket) => {
  console.error(error);
  if (socket.writable) {
    socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
  }
});

process.on("unhandledRejection", (error) => {
  console.error(error);
});

server.listen(port, host, () => {
  console.log(`Dental Factory is running at http://127.0.0.1:${port}/`);
});
