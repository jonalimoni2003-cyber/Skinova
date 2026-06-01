import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import bcryptjs from "bcryptjs";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "database.json");

// Middleware to parse large base64 body (for camera selfie scans)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Helper function to sanitize user string inputs against XSS and injection
function sanitizeString(str: string): string {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
}

// Ensure database file exists and setup seeds
function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], scans: [] }, null, 2));
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const db = JSON.parse(raw);
    if (!db.users) db.users = [];
    if (!db.scans) db.scans = [];
    
    // Remove any legacy admin or pro flags for guest and old admin accounts
    db.users = db.users.map((u: any) => {
      if (u.email === "admin@skinova.com") {
        u.isAdmin = false;
      }
      if (u.email === "guest@skinova.com") {
        u.isAdmin = false;
        u.isPro = false;
      }
      return u;
    });

    const hasAdmin = db.users.some((u: any) => u.email === "joonbeee@skinova.admin.com");
    if (!hasAdmin) {
      const adminPasswordHashed = bcryptjs.hashSync("adminaccess", 10);
      db.users.push({
        userId: "user_admin",
        email: "joonbeee@skinova.admin.com",
        name: "Skinova Lead Administrator",
        password: adminPasswordHashed,
        isPro: true,
        isAdmin: true,
        createdAt: new Date().toISOString()
      });
    } else {
      // Ensure existing admin user has the correct password and admin status
      const admin = db.users.find((u: any) => u.email === "joonbeee@skinova.admin.com");
      if (admin) {
        admin.password = bcryptjs.hashSync("adminaccess", 10);
        admin.isAdmin = true;
        admin.isPro = true;
      }
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error("Failed to seed admin user:", err);
  }
}
initDB();

// Read storage
function getStorage() {
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    return { users: [], scans: [] };
  }
}

// Write storage
function saveStorage(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Lazy Initialize Gemini API client securely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// ======================== AUTHENTICATION API ========================

// Secure sign up
app.post("/api/auth/signup", (req, res) => {
  try {
    const rawEmail = req.body.email;
    const rawPassword = req.body.password;
    const rawName = req.body.name;

    // 1. Data Sanitization
    const email = sanitizeString(rawEmail).toLowerCase();
    const name = sanitizeString(rawName);
    const password = rawPassword; // Password should not be modified with html entities before hashing, but validated

    // 2. Strict Input Validation (Backend checks)
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }
    if (!password || password.length < 5) {
      return res.status(400).json({ error: "Password must be at least 5 characters long." });
    }
    if (!name) {
      return res.status(400).json({ error: "Please enter your name." });
    }

    const db = getStorage();
    const existing = db.users.find((u: any) => u.email === email);
    if (existing) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }

    // 3. Secure Password Encryption
    const hashedPassword = bcryptjs.hashSync(password, 10);

    const newUser = {
      userId: "user_" + Date.now().toString(36),
      email,
      name,
      password: hashedPassword,
      isPro: false,
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    saveStorage(db);

    // Provide a mocked secure session token
    const token = "sess_" + Buffer.from(`${newUser.userId}:${Date.now()}`).toString("base64");

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        email: newUser.email,
        name: newUser.name,
        isPro: newUser.isPro,
        isAdmin: false,
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: "Signup error: " + error.message });
  }
});

// Secure Log in
app.post("/api/auth/login", (req, res) => {
  try {
    const rawEmail = req.body.email;
    const rawPassword = req.body.password;

    const email = sanitizeString(rawEmail).toLowerCase();
    const password = rawPassword;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const db = getStorage();
    const user = db.users.find((u: any) => u.email === email);
    if (!user) {
      return res.status(400).json({ error: "No account found with this email." });
    }

    // Hash comparison
    const isMatched = bcryptjs.compareSync(password, user.password);
    if (!isMatched) {
      return res.status(400).json({ error: "Incorrect password. Please try again." });
    }

    const token = "sess_" + Buffer.from(`${user.userId}:${Date.now()}`).toString("base64");

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        email: user.email,
        name: user.name,
        isPro: user.isPro,
        isAdmin: !!user.isAdmin,
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: "Login error: " + error.message });
  }
});

// Guest / Demo Sign in
app.post("/api/auth/guest", (req, res) => {
  try {
    const db = getStorage();
    
    // Auto-wipe guest scans on sign in to guarantee fresh session
    db.scans = db.scans.filter((s: any) => s.email !== "guest@skinova.com");
    saveStorage(db);

    let guestUser = db.users.find((u: any) => u.email === "guest@skinova.com");
    if (!guestUser) {
      guestUser = {
        userId: "user_guest",
        email: "guest@skinova.com",
        name: "Guest Explorer",
        password: bcryptjs.hashSync("guest_demo_password_123", 10),
        isPro: false, // Guest is strictly on free level, limited to 5 trials
        isAdmin: false, // Guest is NOT admin
        createdAt: new Date().toISOString(),
      };
      db.users.push(guestUser);
      saveStorage(db);
    } else {
      let changed = false;
      if (guestUser.isAdmin) {
        guestUser.isAdmin = false;
        changed = true;
      }
      if (guestUser.isPro) {
        guestUser.isPro = false;
        changed = true;
      }
      if (changed) {
        saveStorage(db);
      }
    }

    const token = "sess_guest_" + Buffer.from(`guest:${Date.now()}`).toString("base64");

    res.status(200).json({
      message: "Guest login successful",
      token,
      user: {
        email: guestUser.email,
        name: guestUser.name,
        isPro: false,
        isAdmin: false,
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: "Guest login error: " + error.message });
  }
});

// Endpoint to force erase guest scans on browser refresh / session start
app.post("/api/auth/guest/reset", (req, res) => {
  try {
    const db = getStorage();
    db.scans = db.scans.filter((s: any) => s.email !== "guest@skinova.com");
    saveStorage(db);
    res.status(200).json({ status: "success", message: "Guest history wiped." });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to reset guest history: " + err.message });
  }
});

// Subscribe to Pro
app.post("/api/user/upgrade", (req, res) => {
  try {
    const email = sanitizeString(req.body.email).toLowerCase();
    if (!email) {
      return res.status(400).json({ error: "User email required" });
    }

    const db = getStorage();
    const userIndex = db.users.findIndex((u: any) => u.email === email);
    if (userIndex === -1) {
      return res.status(400).json({ error: "User not found" });
    }

    db.users[userIndex].isPro = true;
    saveStorage(db);

    res.status(200).json({
      message: "Upgraded successfully!",
      user: {
        email: db.users[userIndex].email,
        name: db.users[userIndex].name,
        isPro: true,
        isAdmin: !!db.users[userIndex].isAdmin,
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: "Upgrade error: " + error.message });
  }
});

// Helper to robustly scan, clean and parse Gemini JSON outputs containing potential markdown ticks
function cleanAndParseJSON(text: string): any {
  let cleanText = text.trim();
  // Strip ```json and ``` ticks if they surround the json string
  if (cleanText.startsWith("```")) {
    const firstNewline = cleanText.indexOf("\n");
    if (firstNewline !== -1) {
      cleanText = cleanText.substring(firstNewline + 1);
    }
    if (cleanText.endsWith("```")) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    cleanText = cleanText.trim();
  }
  return JSON.parse(cleanText);
}

// ======================== SKIN ANALYZER (AI SCANNER) ========================

// Endpoint to run AI analysis with image upload
app.post("/api/skin/scan", async (req, res) => {
  try {
    const { email, image } = req.body; // Image is base64 or URL
    const userEmail = sanitizeString(email).toLowerCase();

    if (!image) {
      return res.status(400).json({ error: "Please snap or upload an image to scan!" });
    }

    const db = getStorage();
    const user = db.users.find((u: any) => u.email === userEmail);
    const isPro = user ? user.isPro : false;

    // Check trials limit for guest (max 5)
    if (userEmail === "guest@skinova.com") {
      const guestScansCount = db.scans.filter((s: any) => s.email === "guest@skinova.com").length;
      if (guestScansCount >= 5) {
        return res.status(403).json({ 
          error: "Demo Limit Reached: The Guest Explorer session is strictly limited to 5 free trial scans. Please register a personal account or upgrade to Pro for unlimited diagnostic access." 
        });
      }
    }

    let scanResult: any = null;
    const ai = getGeminiClient();

    // Prepare Base64 Image
    let base64Data = "";
    let isWebUrl = false;
    if (typeof image === "string" && image.startsWith("http")) {
      isWebUrl = true;
      try {
        const resp = await fetch(image);
        if (resp.ok) {
          const arrayBuf = await resp.arrayBuffer();
          base64Data = Buffer.from(arrayBuf).toString("base64");
        }
      } catch (fetchErr) {
        console.error("Failed to fetch mock face image url:", fetchErr);
      }
    } else if (typeof image === "string") {
      base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    }

    if (ai && base64Data) {
      try {
        const imagePart = {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Data,
          },
        };

        const promptText = `
          You are an expert dermatological AI cosmetic scanner called Skinova.
          Analyze the attached skin image. Provide an objective, highly detailed assessment.
          Respond strictly in valid JSON matching this schema:
          {
            "scores": {
              "acne": number (0-100 score, higher is better/healthier),
              "pores": number (0-100 score, higher is better),
              "pigmentation": number (0-100 score, higher is better/clearer),
              "wrinkles": number (0-100 score, higher is better/smoother),
              "texture": number (0-100 score, higher is better),
              "dryness": number (0-100 score, higher is better/hydrated),
              "darkCircles": number (0-100 score, higher is better/brightest)
            },
            "skinType": string (e.g. "Dry Sensitive", "Combination Oily", "Normal", "Acne-prone"),
            "skinAge": number (estimated skin age),
            "summary": string (detailed human-like skincare diagnosis summary),
            "ingredients": array of strings (targeted recommendations e.g. ["Niacinamide", "AHA", "Salicylic Acid", "Ceramides"]),
            "morningRoutine": array of objects with keys "step" (string) and "desc" (string),
            "nightRoutine": array of objects with keys "step" (string) and "desc" (string)
          }
          Ensure compliance with clinical dermatology terminology, and be constructive. Limit summary to 3-4 sentences.
        `;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: [imagePart, { text: promptText }],
          config: {
            responseMimeType: "application/json",
            temperature: 0.2
          }
        });

        if (response.text) {
          scanResult = cleanAndParseJSON(response.text);
        }
      } catch (geminiError: any) {
        console.error("Gemini Scan Error, falling back to simulated engine:", geminiError);
      }
    }

    // Fallback/Simulated Skincare AI if Gemini client not configured or errors
    if (!scanResult) {
      const isDry = typeof image === "string" && (image.includes("photo-1544005313-94ddf0286df2") || image.toLowerCase().includes("dry"));
      const isAcne = typeof image === "string" && (image.includes("photo-1506794778202-cad84cf45f1d") || image.toLowerCase().includes("acne"));

      if (isDry) {
        scanResult = {
          scores: {
            acne: 88,
            pores: 79,
            pigmentation: 81,
            wrinkles: 62,
            texture: 71,
            dryness: 43,
            darkCircles: 74
          },
          skinType: "Dry Sensitive",
          skinAge: 28,
          summary: "The scanner detected persistent superficial flaking and localized dehydration lines, particularly in the peri-orbital and cheek zones. Your lipid skin barrier has diminished moisture retention capabilities. Recommend avoiding foaming surfactants.",
          ingredients: ["Hyaluronic Acid", "Ceramides NP/AP", "Squalane", "Glycerin"],
          morningRoutine: [
            { step: "Cleanse", desc: "Rinse with lukewarm water only to preserve natural sebum." },
            { step: "Hydrate", desc: "Pat in a generous layer of ceramides and beta-glucan essence." },
            { step: "Nourish", desc: "Apply a skin barrier recovery cream with squalane." },
            { step: "Protect", desc: "Mineral sunscreen SPF 50+ to protect sensitive areas." }
          ],
          nightRoutine: [
            { step: "Cleanse", desc: "Non-foaming milk cleanser." },
            { step: "Repair", desc: "Apply 3 drops of pure squalane oil mixed with barrier cream." },
            { step: "Seal", desc: "Restorative lipid balm to prevent trans-epidermal water loss." }
          ]
        };
      } else if (isAcne) {
        scanResult = {
          scores: {
            acne: 45,
            pores: 52,
            pigmentation: 68,
            wrinkles: 89,
            texture: 58,
            dryness: 76,
            darkCircles: 82
          },
          skinType: "Acne-prone Oily",
          skinAge: 22,
          summary: "Our AI scanner identified active pustules and clogged comedones with dilated pore clusters across the T-zone. Excess sebum production is provoking localized micro-inflammation. Balanced exfoliation is advised.",
          ingredients: ["Salicylic Acid (BHA)", "Niacinamide", "Centella Calming Extract", "Zinc PCA"],
          morningRoutine: [
            { step: "Cleanse", desc: "Salicylic acid cleanser to clear deep follicular debris." },
            { step: "Regulate", desc: "Niacinamide 10% serum to refine pores and limit oiliness." },
            { step: "Moisturize", desc: "Ultra-lightweight oil-free water-gel hydrator." },
            { step: "Shield", desc: "Non-comedogenic physical sunscreen SPF 50." }
          ],
          nightRoutine: [
            { step: "Double Cleanse", desc: "Mild oil cleanser followed by gel cleanser." },
            { step: "Exfoliate", desc: "2% Salicylic Acid liquid exfoliant (BHA)." },
            { step: "Soothe", desc: "Centella Asiatica calming serum or gel." }
          ]
        };
      } else {
        const baseScore = Math.floor(Math.random() * 12) + 78; // 78 - 90 range
        scanResult = {
          scores: {
            acne: baseScore + Math.floor(Math.random() * 4),
            pores: baseScore - Math.floor(Math.random() * 5),
            pigmentation: baseScore + Math.floor(Math.random() * 3),
            wrinkles: baseScore + Math.floor(Math.random() * 4),
            texture: baseScore + Math.floor(Math.random() * 5),
            dryness: baseScore + Math.floor(Math.random() * 2),
            darkCircles: baseScore - Math.floor(Math.random() * 6)
          },
          skinType: "Balanced Profile (Normal)",
          skinAge: 25,
          summary: "Your skin shows great general equilibrium! Pores are clear, hydration levels appear healthy, and acne activity is negligible. Maintain skin barrier support and dynamic antioxidant defense.",
          ingredients: ["Vitamin C", "Hyaluronic Acid", "Niacinamide", "Green Tea Extract"],
          morningRoutine: [
            { step: "Cleanse", desc: "Gentle balancing water-soluble cleanser." },
            { step: "Brighten", desc: "Apply 10% Vitamin C + Ferulic Acid serum." },
            { step: "Hydrate", desc: "Light moisturizer with sodium hyaluronate." },
            { step: "Sun Protection", desc: "Broad-spectrum SPF 30+ daily wear sunscreen." }
          ],
          nightRoutine: [
            { step: "Cleanse", desc: "Wash with a gentle standard facial cleanser." },
            { step: "Rejuvenate", desc: "Apply lightweight peptide formulation." },
            { step: "Repair", desc: "Barrier support cream with niacinamide." }
          ]
        };
      }
    }

    // Save scan to history database to empower Progress Charts!
    const scanEntry = {
      scanId: "scan_" + Date.now().toString(36),
      email: userEmail || "anonymous",
      timestamp: new Date().toISOString(),
      skinType: scanResult.skinType,
      skinAge: scanResult.skinAge,
      summary: scanResult.summary,
      scores: scanResult.scores,
      ingredients: scanResult.ingredients,
      morningRoutine: scanResult.morningRoutine,
      nightRoutine: scanResult.nightRoutine,
    };

    db.scans.push(scanEntry);
    saveStorage(db);

    res.status(200).json({
      message: "Scan computed successfully",
      scan: scanEntry
    });
  } catch (error: any) {
    res.status(500).json({ error: "Scanning process crashed: " + error.message });
  }
});

// Fetch user scan history
app.get("/api/skin/history", (req, res) => {
  try {
    const email = sanitizeString(req.query.email as string).toLowerCase();
    if (!email) {
      return res.status(400).json({ error: "Email is required to fetch details." });
    }

    const db = getStorage();
    const userScans = db.scans
      .filter((s: any) => s.email === email)
      .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    res.status(200).json({ scans: userScans });
  } catch (error: any) {
    res.status(500).json({ error: "History retrieval failed: " + error.message });
  }
});

// ======================== ADMIN VERIFICATION & SERVICES ========================

function checkAdmin(req: any, res: any, next: any) {
  try {
    const adminEmail = sanitizeString(req.headers["x-admin-email"] as string).toLowerCase();
    if (!adminEmail) {
      return res.status(401).json({ error: "Unauthorized access: admin identity email is required in header x-admin-email." });
    }
    if (adminEmail !== "joonbeee@skinova.admin.com") {
      return res.status(403).json({ error: "Access denied: identity mismatch. Only joonbeee@skinova.admin.com is authorized." });
    }
    const db = getStorage();
    const user = db.users.find((u: any) => u.email === adminEmail);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: "Access denied: you are not registered as an administrator with email: " + adminEmail });
    }
    next();
  } catch (err: any) {
    res.status(500).json({ error: "Admin verification failed: " + err.message });
  }
}

// Fetch complete system database
app.get("/api/admin/db", checkAdmin, (req, res) => {
  try {
    const db = getStorage();
    res.status(200).json(db);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load database: " + error.message });
  }
});

// Update database data
app.post("/api/admin/db", checkAdmin, (req, res) => {
  try {
    const { users, scans } = req.body;
    const db = getStorage();
    
    if (users && Array.isArray(users)) {
      db.users = users;
    }
    if (scans && Array.isArray(scans)) {
      db.scans = scans;
    }
    
    saveStorage(db);
    res.status(200).json({ message: "Database successfully updated", db });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update database: " + error.message });
  }
});

// Reset database
app.post("/api/admin/db/reset", checkAdmin, (req, res) => {
  try {
    const db = { users: [], scans: [] as any[] };
    const adminPasswordHashed = bcryptjs.hashSync("adminaccess", 10);
    db.users.push({
      userId: "user_admin",
      email: "joonbeee@skinova.admin.com",
      name: "Skinova Lead Administrator",
      password: adminPasswordHashed,
      isPro: true,
      isAdmin: true,
      createdAt: new Date().toISOString()
    } as any);
    db.users.push({
      userId: "user_guest",
      email: "guest@skinova.com",
      name: "Guest Explorer",
      password: bcryptjs.hashSync("guest_demo_password_123", 10),
      isPro: true,
      createdAt: new Date().toISOString()
    } as any);
    
    saveStorage(db);
    res.status(200).json({ message: "Database successfully reset to defaults", db });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to reset database: " + error.message });
  }
});

// Create new user directly (Admin)
app.post("/api/admin/user", checkAdmin, (req, res) => {
  try {
    const { name, email, password, isPro, isAdmin } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required." });
    }
    const cleanEmail = sanitizeString(email).toLowerCase();
    const cleanName = sanitizeString(name);
    
    const db = getStorage();
    if (db.users.some((u: any) => u.email === cleanEmail)) {
      return res.status(400).json({ error: "A user with this email email already exists." });
    }
    
    const newUser = {
      userId: "user_" + Date.now().toString(36),
      email: cleanEmail,
      name: cleanName,
      password: bcryptjs.hashSync(password, 10),
      isPro: !!isPro,
      isAdmin: !!isAdmin,
      createdAt: new Date().toISOString()
    };
    
    db.users.push(newUser);
    saveStorage(db);
    res.status(250).json({ message: "User successfully created", db });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to create user: " + err.message });
  }
});

// Create new scan directly (Admin)
app.post("/api/admin/scan", checkAdmin, (req, res) => {
  try {
    const { email, skinType, skinAge, summary, scores, ingredients, morningRoutine, nightRoutine } = req.body;
    if (!email) {
      return res.status(400).json({ error: "User email is required to associate scan." });
    }
    const cleanEmail = sanitizeString(email).toLowerCase();
    const db = getStorage();
    
    const calculatedScores = {
      acne: parseInt(scores?.acne) || 80,
      pores: parseInt(scores?.pores) || 80,
      pigmentation: parseInt(scores?.pigmentation) || 80,
      wrinkles: parseInt(scores?.wrinkles) || 80,
      texture: parseInt(scores?.texture) || 80,
      dryness: parseInt(scores?.dryness) || 80,
      darkCircles: parseInt(scores?.darkCircles) || 80,
    };
    
    const cleanIngredients = Array.isArray(ingredients) 
      ? ingredients 
      : (ingredients || "").split(",").map((s: string) => s.trim()).filter(Boolean);
      
    const cleanMorning = Array.isArray(morningRoutine) ? morningRoutine : [];
    const cleanNight = Array.isArray(nightRoutine) ? nightRoutine : [];

    const newScan = {
      scanId: "scan_" + Date.now().toString(36),
      email: cleanEmail,
      timestamp: new Date().toISOString(),
      skinType: sanitizeString(skinType || "Normal"),
      skinAge: parseInt(skinAge) || 25,
      summary: sanitizeString(summary || "No description provided by administrator."),
      scores: calculatedScores,
      ingredients: cleanIngredients,
      morningRoutine: cleanMorning,
      nightRoutine: cleanNight,
    };
    
    db.scans.push(newScan);
    saveStorage(db);
    res.status(250).json({ message: "Diagnostic scan successfully logged", db });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to create scan: " + err.message });
  }
});

// ======================== FULL STACK BUILD SYSTEM SETUP ========================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Skinova System] Ready and shining on http://localhost:${PORT}`);
  });
}

startServer();
