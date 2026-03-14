import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-effbb2fe/health", (c) => {
  return c.json({ status: "ok" });
});

// ========== PRODUCTS ENDPOINTS ==========

// Get all products
app.get("/make-server-effbb2fe/products", async (c) => {
  try {
    const products = await kv.getByPrefix("product:");
    return c.json({ products });
  } catch (error) {
    console.log("Error fetching products:", error);
    return c.json({ error: "Failed to fetch products", details: String(error) }, 500);
  }
});

// Add product
app.post("/make-server-effbb2fe/products", async (c) => {
  try {
    const product = await c.req.json();
    const id = product.id || `product:${Date.now()}`;
    await kv.set(id, product);
    return c.json({ success: true, product: { ...product, id } });
  } catch (error) {
    console.log("Error adding product:", error);
    return c.json({ error: "Failed to add product", details: String(error) }, 500);
  }
});

// Update product
app.put("/make-server-effbb2fe/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const product = await c.req.json();
    await kv.set(id, product);
    return c.json({ success: true, product });
  } catch (error) {
    console.log("Error updating product:", error);
    return c.json({ error: "Failed to update product", details: String(error) }, 500);
  }
});

// Delete product
app.delete("/make-server-effbb2fe/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting product:", error);
    return c.json({ error: "Failed to delete product", details: String(error) }, 500);
  }
});

// ========== RENTAL TOOLS ENDPOINTS ==========

// Get all rental tools
app.get("/make-server-effbb2fe/rentals", async (c) => {
  try {
    const rentals = await kv.getByPrefix("rental:");
    return c.json({ rentals });
  } catch (error) {
    console.log("Error fetching rentals:", error);
    return c.json({ error: "Failed to fetch rentals", details: String(error) }, 500);
  }
});

// Add rental tool
app.post("/make-server-effbb2fe/rentals", async (c) => {
  try {
    const rental = await c.req.json();
    const id = rental.id || `rental:${Date.now()}`;
    await kv.set(id, rental);
    return c.json({ success: true, rental: { ...rental, id } });
  } catch (error) {
    console.log("Error adding rental:", error);
    return c.json({ error: "Failed to add rental", details: String(error) }, 500);
  }
});

// Update rental tool
app.put("/make-server-effbb2fe/rentals/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const rental = await c.req.json();
    await kv.set(id, rental);
    return c.json({ success: true, rental });
  } catch (error) {
    console.log("Error updating rental:", error);
    return c.json({ error: "Failed to update rental", details: String(error) }, 500);
  }
});

// Delete rental tool
app.delete("/make-server-effbb2fe/rentals/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting rental:", error);
    return c.json({ error: "Failed to delete rental", details: String(error) }, 500);
  }
});

// ========== ENQUIRIES ENDPOINTS ==========

// Save enquiry
app.post("/make-server-effbb2fe/enquiries", async (c) => {
  try {
    const enquiry = await c.req.json();
    const id = `enquiry:${Date.now()}`;
    const enquiryData = { ...enquiry, id, date: new Date().toISOString() };
    await kv.set(id, enquiryData);
    return c.json({ success: true, enquiry: enquiryData });
  } catch (error) {
    console.log("Error saving enquiry:", error);
    return c.json({ error: "Failed to save enquiry", details: String(error) }, 500);
  }
});

// Get all enquiries
app.get("/make-server-effbb2fe/enquiries", async (c) => {
  try {
    const enquiries = await kv.getByPrefix("enquiry:");
    return c.json({ enquiries });
  } catch (error) {
    console.log("Error fetching enquiries:", error);
    return c.json({ error: "Failed to fetch enquiries", details: String(error) }, 500);
  }
});

Deno.serve(app.fetch);