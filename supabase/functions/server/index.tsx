// @ts-nocheck
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

// ========== AUTH / OTP ENDPOINTS ==========

// Send OTP
app.post("/make-server-effbb2fe/auth/send-otp", async (c) => {
  try {
    const { phone } = await c.req.json();
    if (!phone) return c.json({ error: "Phone number required" }, 400);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store in KV with prefix "otp:" (expires in 5 mins simulated by timestamp)
    const otpData = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000
    };
    
    await kv.set(`otp:${phone}`, otpData);
    
    console.log(`[AUTH] OTP for ${phone}: ${otp}`); // In production, send via SMS service
    
    return c.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return c.json({ error: "Failed to send OTP", details: String(error) }, 500);
  }
});

// Verify OTP
app.post("/make-server-effbb2fe/auth/verify-otp", async (c) => {
  try {
    const { phone, otp } = await c.req.json();
    if (!phone || !otp) return c.json({ error: "Phone and OTP required" }, 400);

    const storedData = await kv.get(`otp:${phone}`);
    
    if (!storedData || storedData.otp !== otp) {
      return c.json({ error: "Invalid OTP" }, 400);
    }
    
    if (Date.now() > storedData.expiresAt) {
      return c.json({ error: "OTP expired" }, 400);
    }

    // OTP Correct -> Clear it
    await kv.del(`otp:${phone}`);

    // Clean phone number (remove spaces, etc.)
    const cleanPhone = phone.replace(/\s/g, '');

    // Get Supabase Client for Users Table
    const { createClient } = await import("jsr:@supabase/supabase-js@2.49.8");
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if user exists in public.users
    let { data: user, error: userError } = await supabaseClient
      .from("users")
      .select("*")
      .eq("phone", cleanPhone)
      .maybeSingle();

    if (!user) {
      // Auto-create user
      const { data: newUser, error: createError } = await supabaseClient
        .from("users")
        .insert({ phone: cleanPhone })
        .select()
        .single();
        
      if (createError) throw createError;
      user = newUser;
      console.log(`[AUTH] New user created: ${cleanPhone}`);
    }

    // For now, return the user and a mock token
    // In a real app, generate a JWT here
    const token = `mock-token-${user.id}-${Date.now()}`;

    return c.json({ 
      success: true, 
      user: {
        id: user.id,
        phone: user.phone
      },
      token
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return c.json({ error: "Authentication failed", details: String(error) }, 500);
  }
});

// ========== MIDDLEWARE ==========

const requireSubscriptionAuth = async (c: any, next: any) => {
  const body = await c.req.json();
  const productType = (body.product_type || body.type || '').toLowerCase();
  
  // Normalize checking
  const isSubscription = productType === 'subscription';
  
  if (isSubscription) {
    // Check for token in headers
    const authHeader = c.req.header("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    
    // In this custom flow, we check if token exists and is valid-ish
    if (!token || !token.startsWith("mock-token-")) {
      return c.json({ 
        error: "Authentication required for subscription products",
        code: "AUTH_REQUIRED" 
      }, 401);
    }
  }
  
  // Restore body for the next handler since we consumed it
  c.req.bodyCache = body;
  await next();
};

// ========== PRODUCTS ENDPOINTS ==========

// Get all products
app.get("/make-server-effbb2fe/products", async (c) => {
  const { createClient } = await import("jsr:@supabase/supabase-js@2.49.8");
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const { data, error } = await supabase.from("products").select("*");
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// ========== ORDERS ENDPOINTS ==========

// Create order (with subscription auth enforcement)
app.post("/make-server-effbb2fe/orders", requireSubscriptionAuth, async (c) => {
  try {
    const { createClient } = await import("jsr:@supabase/supabase-js@2.49.8");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const body = c.req.bodyCache || await c.req.json();
    const { items, total_amount, ...details } = body;
    
    // Existing logic for order creation...
    const { data, error } = await supabase.from("orders").insert([details]).select().single();
    if (error) throw error;
    
    return c.json(data);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// ========== SUBSCRIPTIONS ENDPOINTS ==========

// Create subscription (always requires auth)
app.post("/make-server-effbb2fe/subscriptions", async (c) => {
  // Check auth for any subscription creation
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  
  if (!token || !token.startsWith("mock-token-")) {
    return c.json({ error: "Authentication required" }, 401);
  }

  try {
    const { createClient } = await import("jsr:@supabase/supabase-js@2.49.8");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const body = await c.req.json();
    const { data, error } = await supabase.from("subscriptions").insert([body]).select().single();
    if (error) throw error;
    return c.json(data);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
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