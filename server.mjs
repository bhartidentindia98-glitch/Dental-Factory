import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || "0.0.0.0";
const isProduction = process.env.NODE_ENV === "production";
const localAdminPassword = "DentalFactory@2026";
const adminPassword = process.env.ADMIN_PASSWORD || (isProduction ? "" : localAdminPassword);
const sessionSecret = process.env.SESSION_SECRET || "dental-factory-local-session";
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || "";
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "";
const paymentCurrency = String(process.env.PAYMENT_CURRENCY || "INR").toUpperCase();
const cashOnDeliveryMethod = "Cash on delivery";
const freeShippingThreshold = 2999;
const standardShippingFee = 99;
const cashCodLimit = 20000;
const freightConfirmationLimit = 25000;
const dataDir = path.resolve(process.env.DATA_DIR || path.join(rootDir, "data"));
const productsFile = path.join(dataDir, "products.json");
const ordersFile = path.join(dataDir, "orders.json");
const accountsFile = path.join(dataDir, "accounts.json");
const paymentAttemptsFile = path.join(dataDir, "payment-attempts.json");
const adminCookieName = "df_admin_session";

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".xml", "application/xml; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".ico", "image/x-icon"],
]);

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

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeProduct(product) {
  const name = String(product.name || "").trim();
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
    image: String(product.image || "assets/hero-dental-shop.png").trim(),
    description: String(product.description || "Factory-direct dental product.").trim(),
    delivery: String(product.delivery || "Dispatch estimate available after pincode.").trim(),
    updatedAt: product.updatedAt || new Date().toISOString(),
  };
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizeAccount(account) {
  const mobile = normalizePhone(account.mobile);
  return {
    id: account.id || `AC-${String(Date.now()).slice(-6)}`,
    mobile,
    clinic: String(account.clinic || "").trim(),
    type: String(account.type || "dentist").trim(),
    status: String(account.status || "Callback pending"),
    createdAt: account.createdAt || new Date().toISOString(),
  };
}

function normalizeOrderItem(item) {
  return {
    name: String(item?.name || "").trim(),
    price: Math.max(0, Number(item?.price || 0)),
    qty: Math.max(1, Number.parseInt(item?.qty || 1, 10) || 1),
  };
}

function normalizeOrderCustomer(customer) {
  return {
    name: String(customer?.name || "").trim(),
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

function createAdminToken() {
  const payload = Buffer.from(
    JSON.stringify({
      role: "admin",
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function verifyAdminToken(token) {
  if (!token || !token.includes(".")) return false;
  const [payload, signature] = token.split(".");
  if (signature !== sign(payload)) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return parsed.role === "admin" && Number(parsed.exp) > Date.now();
  } catch {
    return false;
  }
}

function adminCookie(token) {
  return `${adminCookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${isProduction ? "; Secure" : ""}`;
}

function clearAdminCookie() {
  return `${adminCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isProduction ? "; Secure" : ""}`;
}

function isAdmin(req) {
  return verifyAdminToken(parseCookies(req)[adminCookieName]);
}

function requireAdmin(req, res) {
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
  try {
    await fs.access(productsFile);
  } catch {
    await writeJson(productsFile, defaultProducts.map(normalizeProduct));
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

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

async function checkoutPayloadFromBody(body) {
  const customer = normalizeOrderCustomer(body.customer || {});
  const submittedItems = Array.isArray(body.items) ? body.items.map(normalizeOrderItem).filter((item) => item.name) : [];
  const catalog = (await readJson(productsFile, [])).map(normalizeProduct);
  const productsByName = new Map(catalog.map((product) => [product.name.toLowerCase(), product]));
  const items = submittedItems.map((item) => {
    const catalogProduct = productsByName.get(item.name.toLowerCase());
    return {
      ...item,
      price: catalogProduct?.price || item.price,
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
  const receipt = `DF-${Date.now()}`.slice(0, 40);
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

function sendJson(res, status, payload, headers = {}) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", ...headers });
  res.end(JSON.stringify(payload));
}

function sendText(res, status, text) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}

async function readRequestJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 8 * 1024 * 1024) {
      throw new Error("Request body too large");
    }
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
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
      id: `DF-${String(Date.now()).slice(-6)}`,
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
    sendJson(res, 200, { authenticated: Boolean(adminPassword) && isAdmin(req), adminConfigured: Boolean(adminPassword) });
    return;
  }

  if (reqUrl.pathname === "/api/admin/login" && req.method === "POST") {
    if (!adminPassword) {
      sendJson(res, 503, { error: "Admin password is not configured. Set ADMIN_PASSWORD in Render Environment first." });
      return;
    }
    const body = await readRequestJson(req);
    if (String(body.password || "") !== adminPassword) {
      sendJson(res, 401, { error: "Wrong admin password" });
      return;
    }
    sendJson(res, 200, { authenticated: true }, { "Set-Cookie": adminCookie(createAdminToken()) });
    return;
  }

  if (reqUrl.pathname === "/api/admin/logout" && req.method === "POST") {
    sendJson(res, 200, { authenticated: false }, { "Set-Cookie": clearAdminCookie() });
    return;
  }

  if (reqUrl.pathname === "/api/products" && req.method === "GET") {
    const products = await readJson(productsFile, []);
    sendJson(res, 200, products.map(normalizeProduct));
    return;
  }

  if (reqUrl.pathname === "/api/products" && req.method === "POST") {
    if (!requireAdmin(req, res)) return;
    const body = await readRequestJson(req);
    const product = normalizeProduct(body.product || body);
    if (!product.name) {
      sendJson(res, 400, { error: "Product name is required" });
      return;
    }

    const products = (await readJson(productsFile, [])).map(normalizeProduct);
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
    const products = (await readJson(productsFile, [])).map(normalizeProduct);
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

  if (reqUrl.pathname === "/api/orders" && req.method === "POST") {
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
      id: `DF-${String(Date.now()).slice(-6)}`,
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
    const orders = await readJson(ordersFile, []);
    const order = orders.find((item) => {
      const sameId = String(item.id || "").toLowerCase() === query.toLowerCase();
      const samePhone = queryPhone && normalizePhone(item.customer?.phone).endsWith(queryPhone);
      return sameId || samePhone;
    });
    if (!order) {
      sendJson(res, 404, { error: "Order not found" });
      return;
    }
    sendJson(res, 200, safeOrder(order));
    return;
  }

  if (reqUrl.pathname === "/api/accounts" && req.method === "POST") {
    const body = await readRequestJson(req);
    const account = normalizeAccount(body.account || body);
    if (account.mobile.length < 10 || !account.clinic) {
      sendJson(res, 400, { error: "Mobile number and clinic name are required" });
      return;
    }
    const accounts = (await readJson(accountsFile, [])).map(normalizeAccount);
    const index = accounts.findIndex((item) => item.mobile === account.mobile);
    if (index >= 0) {
      accounts[index] = { ...accounts[index], ...account, id: accounts[index].id, createdAt: accounts[index].createdAt };
    } else {
      accounts.unshift(account);
    }
    await writeJson(accountsFile, accounts);
    sendJson(res, index >= 0 ? 200 : 201, account);
    return;
  }

  if (reqUrl.pathname === "/api/accounts" && req.method === "GET") {
    if (!requireAdmin(req, res)) return;
    sendJson(res, 200, await readJson(accountsFile, []));
    return;
  }

  sendJson(res, 404, { error: "API route not found" });
}

async function handleStatic(req, res, reqUrl) {
  const requestPath = decodeURIComponent(reqUrl.pathname === "/" ? "/index.html" : reqUrl.pathname);
  const filePath = path.normalize(path.join(rootDir, requestPath));

  if (!filePath.startsWith(path.normalize(rootDir))) {
    sendText(res, 403, "Forbidden");
    return;
  }

  try {
    const data = await fs.readFile(filePath);
    res.writeHead(200, { "Content-Type": mimeTypes.get(path.extname(filePath)) || "application/octet-stream" });
    res.end(data);
  } catch {
    sendText(res, 404, "Not found");
  }
}

await ensureDataFiles();

const server = http.createServer(async (req, res) => {
  try {
    const reqUrl = new URL(req.url || "/", `http://127.0.0.1:${port}`);
    if (reqUrl.pathname.startsWith("/api/")) {
      await handleApi(req, res, reqUrl);
      return;
    }
    await handleStatic(req, res, reqUrl);
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Server error" });
  }
});

server.listen(port, host, () => {
  console.log(`Dental Factory is running at http://127.0.0.1:${port}/`);
});
