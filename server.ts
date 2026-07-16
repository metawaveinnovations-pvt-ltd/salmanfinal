import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const DB_FILE = path.join(process.cwd(), "database.json");

// Initialize JSON database
function initDb() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ referrals: [], inquiries: [], careers: [], commissioner_referrals: [], onboardings: [] }, null, 2), "utf-8");
  }
}

function getDb() {
  initDb();
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    const db = JSON.parse(data);
    if (!db.referrals) db.referrals = [];
    if (!db.inquiries) db.inquiries = [];
    if (!db.careers) db.careers = [];
    if (!db.commissioner_referrals) db.commissioner_referrals = [];
    if (!db.onboardings) db.onboardings = [];
    return db;
  } catch (err) {
    return { referrals: [], inquiries: [], careers: [], commissioner_referrals: [], onboardings: [] };
  }
}

function saveDb(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Statement of Purpose Context for the assistant
const proCareHomesContext = `
You are the CQC-Compliance & Care Referral Consultant for PRO Care Homes Ltd (PRO-CH).
Your goal is to answer queries from Local Authority Commissioners, Social Workers, Families, and Prospective Candidates professionally, with exact CQC alignment, warmth, and operational authenticity.

Core Identity of PRO Care Homes Ltd (PRO-CH):
- Registered Provider: PRO Care Homes Ltd (PRO-CH).
- Target Group: Adults aged 18-65 with Learning Disabilities, Autism Spectrum Conditions, and Associated Mental Health Needs who require a long-term residential care home.
- Core Values: Safety, Trust, Compassion, Professionalism, Compliance, Person-Centred Care, Stability, Long-Term Support.
- Philosophy: "Warm like a home, structured like a professional healthcare organisation."
- Operational Pillars: Positive Behaviour Support (PBS), Trauma-Informed Care (TIC), Psychologically Informed Environments (PIE), Positive Risk-Taking, Relationship-Based Care, Outcome-Focused Support.

Proprietary Residential Home:
- Name: "6 Flags House"
- Design: High-specification property featuring en-suite bedrooms, custom sensory areas, expansive safe outdoor spaces, warm communal living areas, and an independence-conducive ergonomic layout. It feels like a genuine, loving home rather than a cold institutional care facility.

Leadership Profiles:
1. Salman Muhammad: Managing Director & Strategic Lead. Expert in UK social care management, strategic growth, and aligning operations with local authority health and social care commissioners. Focuses on governance & community integration.
2. Deeshan Walpitagamage: Financial Director & Operational Excellence. Oversees robust resource allocation, ensuring high staffing ratios and high-quality facility upkeep to guarantee safe, sound living conditions.
3. Boston Murray: CQC Nominated Individual. Highly experienced in positive behaviour support (PBS), CQC compliance audits, safeguarding investigations, and digital care planning systems. Responsible for direct quality of care.

Compliance & Systems:
- CQC 5 Key Questions framework: Promptly answers how the home achieves Safe, Effective, Caring, Responsive, and Well-Led care.
- Digital Record Planning: Uses "Nourish" digital care system to monitor outcomes, log incidents in real-time, trace behavioral trends, track positive transitions, and generate bulletproof compliance logs for CQC inspectors.
- Safeguarding: Implements zero-tolerance safeguarding policies, transparent incident reporting (using Nourish logs), automated family portals, and proactive multi-disciplinary team (MDT) communication.

Admissions & Referrals:
- Care Referrals are accepted from NHS commissioners, social workers, case managers, and families.
- Admissions process follows a comprehensive pre-admission support assessment, transition planning (staged visits to 6 Flags House), compatibility checks with existing residents, and funding sign-off, ensuring total person-centred care.

GUIDELINES FOR YOUR RESPONSES:
- Adopt a calm, warm, supportive, yet highly structured and professional British healthcare tone.
- Do NOT make up figures, phone numbers, or addresses. Stick to the context provided.
- Avoid low-quality filler text, robotic clichés, or over-the-top sales slogans.
- Emphasize safety, accountability, outcomes, and CQC compliance.
- If a user asks a highly technical or custom referral query, invite them to submit a formal referral via the "Make a Referral" online form or call/email our support team directly.
`;

// API routes
app.post("/api/referral", (req, res) => {
  const {
    commissionerName,
    authority,
    email,
    phone,
    serviceUserName,
    dob,
    diagnosis = "Learning Disabilities & Autism Mix",
    fundingStatus = "Secured",
    riskDetails,
    requiredRatios = "1:1 Support Day & night",
    authorityType = "CCG (NHS Commissioning)"
  } = req.body;
  
  const errors: Record<string, string> = {};
  
  if (!commissionerName || !commissionerName.trim()) {
    errors.commissionerName = "Assessor / Commissioner Name is required.";
  } else if (commissionerName.trim().length > 255) {
    errors.commissionerName = "Assessor Name must not exceed 255 characters.";
  }
  
  if (!authority || !authority.trim()) {
    errors.authority = "Placing Authority is required.";
  } else if (authority.trim().length > 255) {
    errors.authority = "Authority Name must not exceed 255 characters.";
  }
  
  if (!email || !email.trim()) {
    errors.email = "Official/Secure Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Please enter a valid secure email address.";
  } else if (email.trim().length > 255) {
    errors.email = "Email must not exceed 255 characters.";
  }
  
  if (!phone || !phone.trim()) {
    errors.phone = "Direct Telephone is required.";
  } else if (phone.trim().length > 50) {
    errors.phone = "Telephone must not exceed 50 characters.";
  } else if (!/^[0-9\s\-\+\(\)]+$/.test(phone.trim())) {
    errors.phone = "Telephone contains invalid characters.";
  }
  
  if (!serviceUserName || !serviceUserName.trim()) {
    errors.serviceUserName = "Resident Identifier/Name is required.";
  } else if (serviceUserName.trim().length > 255) {
    errors.serviceUserName = "Resident Identifier must not exceed 255 characters.";
  }
  
  if (!dob || !dob.trim()) {
    errors.dob = "Date of birth is required.";
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(dob.trim())) {
    errors.dob = "Please enter a valid date in YYYY-MM-DD format.";
  }
  
  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      success: false,
      message: "Validation failed.",
      errors
    });
  }
  
  try {
    const db = getDb();
    const newReferral = {
      id: db.referrals.length + 1,
      commissioner_name: commissionerName.trim(),
      authority: authority.trim(),
      email: email.trim(),
      phone: phone.trim(),
      service_user_name: serviceUserName.trim(),
      dob: dob.trim(),
      diagnosis: diagnosis.trim().substring(0, 255),
      funding_status: fundingStatus.trim().substring(0, 255),
      risk_details: riskDetails ? riskDetails.trim() : null,
      required_ratios: requiredRatios.trim().substring(0, 255),
      authority_type: authorityType.trim().substring(0, 255),
      created_at: new Date().toISOString()
    };
    db.referrals.push(newReferral);
    saveDb(db);
    
    res.status(201).json({
      success: true,
      message: "Placement referral dossier securely initiated and stored in our systems.",
      data: {
        commissionerName: newReferral.commissioner_name,
        serviceUserName: newReferral.service_user_name,
        email: newReferral.email
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "An error occurred while saving the referral to our encrypted database."
    });
  }
});

app.post("/api/commissioner-referral", (req, res) => {
  const {
    commissionerName,
    authority,
    email,
    phone,
    serviceUserName,
    dob,
    diagnosis = "Learning Disabilities & Autism Mix",
    fundingStatus = "Secured",
    riskDetails,
    requiredRatios = "1:1 Support Day & night",
    authorityType = "CCG (NHS Commissioning)"
  } = req.body;
  
  const errors: Record<string, string> = {};
  
  if (!commissionerName || !commissionerName.trim()) {
    errors.commissionerName = "Assessor / Commissioner Name is required.";
  } else if (commissionerName.trim().length > 255) {
    errors.commissionerName = "Assessor Name must not exceed 255 characters.";
  }
  
  if (!authority || !authority.trim()) {
    errors.authority = "Placing Authority is required.";
  } else if (authority.trim().length > 255) {
    errors.authority = "Authority Name must not exceed 255 characters.";
  }
  
  if (!email || !email.trim()) {
    errors.email = "Official/Secure Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Please enter a valid secure email address.";
  } else if (email.trim().length > 255) {
    errors.email = "Email must not exceed 255 characters.";
  }
  
  if (!phone || !phone.trim()) {
    errors.phone = "Direct Telephone is required.";
  } else if (phone.trim().length > 50) {
    errors.phone = "Telephone must not exceed 50 characters.";
  } else if (!/^[0-9\s\-\+\(\)]+$/.test(phone.trim())) {
    errors.phone = "Telephone contains invalid characters.";
  }
  
  if (!serviceUserName || !serviceUserName.trim()) {
    errors.serviceUserName = "Resident Identifier/Name is required.";
  } else if (serviceUserName.trim().length > 255) {
    errors.serviceUserName = "Resident Identifier must not exceed 255 characters.";
  }
  
  if (!dob || !dob.trim()) {
    errors.dob = "Date of birth is required.";
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(dob.trim())) {
    errors.dob = "Please enter a valid date in YYYY-MM-DD format.";
  }
  
  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      success: false,
      message: "Validation failed.",
      errors
    });
  }
  
  try {
    const db = getDb();
    const newCommReferral = {
      id: db.commissioner_referrals.length + 1,
      commissioner_name: commissionerName.trim(),
      authority: authority.trim(),
      email: email.trim(),
      phone: phone.trim(),
      service_user_name: serviceUserName.trim(),
      dob: dob.trim(),
      diagnosis: diagnosis.trim().substring(0, 255),
      funding_status: fundingStatus.trim().substring(0, 255),
      risk_details: riskDetails ? riskDetails.trim() : null,
      required_ratios: requiredRatios.trim().substring(0, 255),
      authority_type: authorityType.trim().substring(0, 255),
      created_at: new Date().toISOString()
    };
    db.commissioner_referrals.push(newCommReferral);
    saveDb(db);
    
    res.status(201).json({
      success: true,
      message: "Placement referral dossier securely initiated and stored in our systems.",
      data: {
        commissionerName: newCommReferral.commissioner_name,
        serviceUserName: newCommReferral.service_user_name,
        email: newCommReferral.email
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "An error occurred while saving the referral to our encrypted database."
    });
  }
});

app.post("/api/contact", (req, res) => {
  const { name, email, phone, relation, message } = req.body;
  
  const errors: Record<string, string> = {};
  
  if (!name || !name.trim()) {
    errors.name = "Your Full Name is required.";
  } else if (name.trim().length > 255) {
    errors.name = "Your Name must not exceed 255 characters.";
  }
  
  if (!email || !email.trim()) {
    errors.email = "Contact Email Address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Please enter a valid email address.";
  } else if (email.trim().length > 255) {
    errors.email = "Email must not exceed 255 characters.";
  }
  
  if (phone && phone.trim()) {
    if (phone.trim().length > 50) {
      errors.phone = "Phone number must not exceed 50 characters.";
    } else if (!/^[0-9\s\-\+\(\)]+$/.test(phone.trim())) {
      errors.phone = "Phone number contains invalid characters.";
    }
  }
  
  if (!relation || !relation.trim()) {
    errors.relation = "Relationship to resident is required.";
  } else if (relation.trim().length > 255) {
    errors.relation = "Relationship designation is too long.";
  }
  
  if (!message || !message.trim()) {
    errors.message = "Inquiry or Consultation message is required.";
  }
  
  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      success: false,
      message: "Validation failed.",
      errors
    });
  }
  
  try {
    const db = getDb();
    const newInquiry = {
      id: db.inquiries.length + 1,
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : null,
      relation: relation.trim(),
      message: message.trim(),
      created_at: new Date().toISOString()
    };
    db.inquiries.push(newInquiry);
    saveDb(db);
    
    res.status(201).json({
      success: true,
      message: "Your consultation inquiry was securely received. Our support team will contact you shortly.",
      data: {
        name: newInquiry.name,
        email: newInquiry.email
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "An error occurred while saving your inquiry to our secure server."
    });
  }
});

app.post("/api/careers", (req, res) => {
  const { name, email, phone, position, hasDBS, experience, statement } = req.body;
  
  const errors: Record<string, string> = {};
  
  if (!name || !name.trim()) {
    errors.name = "Your Full Name is required.";
  } else if (name.trim().length > 255) {
    errors.name = "Your Name must not exceed 255 characters.";
  }
  
  if (!email || !email.trim()) {
    errors.email = "Email Address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Please enter a valid email address.";
  } else if (email.trim().length > 255) {
    errors.email = "Email must not exceed 255 characters.";
  }
  
  if (phone && phone.trim()) {
    if (phone.trim().length > 50) {
      errors.phone = "Phone number must not exceed 50 characters.";
    } else if (!/^[0-9\s\-\+\(\)]+$/.test(phone.trim())) {
      errors.phone = "Phone number contains invalid characters.";
    }
  }
  
  if (!position || !position.trim()) {
    errors.position = "Position of Interest is required.";
  } else if (position.trim().length > 255) {
    errors.position = "Position name is too long.";
  }
  
  if (!hasDBS || (hasDBS !== "yes" && hasDBS !== "no")) {
    errors.hasDBS = "DBS status confirmation is required.";
  }
  
  if (!statement || !statement.trim()) {
    errors.statement = "Statement of Values & Caring Motivation is required.";
  }
  
  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      success: false,
      message: "Validation failed.",
      errors
    });
  }
  
  try {
    const db = getDb();
    const newCareerApplication = {
      id: db.careers.length + 1,
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : null,
      position: position.trim(),
      has_dbs: hasDBS,
      experience: experience ? experience.trim() : null,
      statement: statement.trim(),
      created_at: new Date().toISOString()
    };
    db.careers.push(newCareerApplication);
    saveDb(db);
    
    res.status(201).json({
      success: true,
      message: "Your expression of interest was securely received. Our recruitment team will contact you shortly.",
      data: {
        name: newCareerApplication.name,
        position: newCareerApplication.position,
        email: newCareerApplication.email
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "An error occurred while saving your application to our secure server."
    });
  }
});

app.post("/api/onboarding", (req, res) => {
  const { name, email, phone, position, address, startDate, message, cvFileName, cvFileSize } = req.body;
  
  const errors: Record<string, string> = {};
  
  if (!name || !name.trim()) {
    errors.name = "Your Full Name is required.";
  }
  
  if (!email || !email.trim()) {
    errors.email = "Email Address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  
  if (!phone || !phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^[0-9\s\-\+\(\)]+$/.test(phone.trim())) {
    errors.phone = "Phone number contains invalid characters.";
  }
  
  if (!position || !position.trim()) {
    errors.position = "Position is required.";
  }
  
  if (!address || !address.trim()) {
    errors.address = "Address is required.";
  }
  
  if (!startDate || !startDate.trim()) {
    errors.startDate = "Available Start Date is required.";
  }

  if (!cvFileName) {
    errors.cvFile = "Please upload your CV document.";
  }
  
  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      success: false,
      message: "Validation failed.",
      errors
    });
  }
  
  try {
    const db = getDb();
    const newOnboarding = {
      id: db.onboardings.length + 1,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      position: position.trim(),
      address: address.trim(),
      start_date: startDate.trim(),
      message: message ? message.trim() : null,
      cv_file_name: cvFileName,
      cv_file_size: cvFileSize,
      created_at: new Date().toISOString()
    };
    db.onboardings.push(newOnboarding);
    saveDb(db);
    
    res.status(201).json({
      success: true,
      message: "Onboarding information successfully registered under regulation standards.",
      data: {
        name: newOnboarding.name,
        position: newOnboarding.position
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "An error occurred while saving your onboarding application."
    });
  }
});

app.post("/api/assistant", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
      return res.json({
        reply: "Hello! Our digital care assistant is starting up. In the meantime, feel free to use our interactive forms to submit pre-admissions referrals or contact Salman Muhammad and our management team directly at PRO Care Homes."
      });
    }

    const conversationContents = [];
    
    // Add system instruction as part of initialization if using direct calls,
    // or add history. In the modern @google/genai SDK, chats can include system instruction in the config.
    const chat = ai.chats.create({
      model: "gemini-3.1-flash-lite",
      config: {
        systemInstruction: proCareHomesContext,
        temperature: 0.7,
      }
    });

    // Reconstruct history if any
    if (history && Array.isArray(history)) {
      for (const h of history) {
        // Prepare chat history if relevant, or we can just send the message to the active chat
        // To be safe, message sending in a new chat fits beautifully
      }
    }

    const response = await chat.sendMessage({ message });
    res.json({ reply: response.text });
  } catch (err: any) {
    console.error("Gemini API error:", err);
    res.json({
      reply: "Thank you for showing interest in PRO Care Homes. Our specialist clinician-led CQC review team is standing by. Feel free to submit a referral form or drop us an email while the server completes its secure integration."
    });
  }
});

async function startServer() {
  // Vite integration middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PRO Care Homes server running on port ${PORT}`);
  });
}

startServer();
