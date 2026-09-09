import type { Section } from "./types";

export type IndustryId =
  | "renovation"
  | "roofing"
  | "siding"
  | "landscaping"
  | "restaurant"
  | "retail"
  | "other";

export const DEFAULT_INDUSTRY: IndustryId = "renovation";

export const INDUSTRIES: readonly { id: IndustryId; label: string }[] = [
  { id: "renovation", label: "Renovation / Remodeling" },
  { id: "roofing", label: "Roofing" },
  { id: "siding", label: "Siding" },
  { id: "landscaping", label: "Landscaping" },
  { id: "restaurant", label: "Restaurant / Food Service" },
  { id: "retail", label: "Retail / Store" },
  { id: "other", label: "Other Small Business" },
] as const;

export function industryLabel(id: string): string {
  return INDUSTRIES.find((i) => i.id === id)?.label || "Business";
}

/** The three real module/blueprint taxonomies. Roofing/siding/landscaping share
 * the same operational shape as renovation, so they share the "fieldTrades" group. */
export type IndustryGroup = "fieldTrades" | "restaurant" | "retail" | "other";

export function industryGroup(id: string): IndustryGroup {
  if (id === "restaurant") return "restaurant";
  if (id === "retail") return "retail";
  if (id === "other") return "other";
  return "fieldTrades";
}

// ---------------------------------------------------------------------------
// Field trades: renovation, roofing, siding, landscaping share the same
// operational shape (lead -> estimate -> contract -> schedule crew ->
// materials -> job site -> invoice -> closeout). Only the vocabulary that
// genuinely differs by trade is parameterized; everything else below is
// shared across all four because it already applies equally to any of them.
// ---------------------------------------------------------------------------

type FieldTradeConfig = {
  id: IndustryId;
  tradeNoun: string; // "renovation company", "roofing company", ...
  businessTypeOptions: readonly string[];
  servicesOptions: readonly string[];
  growthServicesOptions: readonly string[];
  extraMaterialProblem: string; // one trade-specific addition to the materials-problem list
  toolExamples: string; // example software names for the "which tools" question
};

const whoInvolved = [
  "Owner",
  "Office/admin",
  "Estimator/sales",
  "Project manager",
  "Crew/field employees",
  "Subcontractors",
  "Bookkeeper/accountant",
  "Designer",
] as const;

const whereWork = [
  "Residential",
  "Light commercial",
  "Both",
  "New construction",
  "Renovations/additions",
  "Exterior improvements",
] as const;

const dailyMorning = [
  "Check schedule",
  "Review job notes",
  "Load trucks",
  "Pick up materials",
  "Confirm crews",
  "Call customers",
  "Check weather",
  "Review subcontractors",
  "Handle emergencies",
  "Other",
] as const;

const dailyDuring = [
  "Travel between jobs",
  "Install/build",
  "Answer customer questions",
  "Buy missing materials",
  "Document progress",
  "Take photos",
  "Update schedule",
  "Handle change requests",
  "Coordinate subs",
  "Collect payments",
] as const;

const dailyEnd = [
  "Clean up",
  "Take progress photos",
  "Update customer",
  "Update job notes",
  "Record hours",
  "Record materials used",
  "Secure site",
  "Plan next day",
  "Submit receipts",
] as const;

const leadSources = [
  "Website form",
  "Phone",
  "Text",
  "Facebook/Instagram",
  "Google",
  "Referral",
  "Repeat customer",
  "Home show",
  "Email",
  "Other",
] as const;

const leadFollowUp = [
  "Call back",
  "Text back",
  "Site visit",
  "Measure",
  "Take photos",
  "Create estimate",
  "Send proposal",
  "Follow up",
  "Schedule consultation",
  "Collect deposit",
] as const;

const leadTracking = [
  "Notebook",
  "Spreadsheet",
  "Email",
  "Text messages",
  "Accounting software",
  "CRM",
  "Project software",
  "Multiple places",
  "Memory/head",
] as const;

const projectSteps = [
  "Contract",
  "Deposit",
  "Create project folder",
  "Create schedule",
  "Order materials",
  "Assign crew",
  "Notify customer",
  "Permits",
  "Subcontractor scheduling",
  "Job kickoff",
] as const;

const projectTracking = [
  "Paper",
  "Text messages",
  "Photos",
  "Spreadsheet",
  "Calendar",
  "Project-management app",
  "Accounting software",
  "Memory",
  "Multiple places",
] as const;

const projectUpdateTriggers = [
  "Daily",
  "Milestones",
  "Customer request",
  "Problem/change",
  "Material delivery",
  "Inspection",
  "Weekly",
] as const;

const siteNeeds = [
  "Address",
  "Scope of work",
  "Plans/drawings",
  "Material list",
  "Special instructions",
  "Customer notes",
  "Photos",
  "Permit information",
  "Contact information",
] as const;

const siteCapture = [
  "Photos",
  "Hours",
  "Materials used",
  "Measurements",
  "Issues",
  "Change orders",
  "Customer requests",
  "Inspection notes",
  "Completion status",
] as const;

const siteReporting = [
  "Text",
  "Phone call",
  "Email",
  "App",
  "Paper",
  "Shared photos",
  "End-of-day report",
  "They usually aren't",
] as const;

const materialsPlanning = [
  "Takeoff",
  "Estimate list",
  "Spreadsheet",
  "Handwritten list",
  "Software",
  "Supplier quote",
  "Experience",
] as const;

const materialsPurchasers = [
  "Owner",
  "Office",
  "Project manager",
  "Crew member",
  "Customer",
  "Multiple people",
] as const;

const materialsProblemsBase = [
  "Missing material",
  "Wrong material",
  "Over-ordering",
  "Under-ordering",
  "Lost receipts",
  "No stock visibility",
  "Unused leftovers",
  "Emergency store runs",
  "Delivery problems",
] as const;

const vendorRecording = [
  "Accounting software",
  "Receipts",
  "Spreadsheet",
  "Email",
  "Vendor portal",
  "Text messages",
  "Not consistently",
] as const;

const vendorHelp = [
  "Preferred vendor list",
  "Price comparison",
  "Purchase orders",
  "Material approvals",
  "Delivery tracking",
  "Job allocation",
  "Receipt capture",
  "Vendor history",
] as const;

const scheduleMethod = [
  "Paper calendar",
  "Phone calendar",
  "Google Calendar",
  "Text messages",
  "Spreadsheet",
  "Project app",
  "Whiteboard",
  "Memory",
] as const;

const scheduleDifficulty = [
  "Weather",
  "Material delays",
  "Customer changes",
  "Sub availability",
  "Crew availability",
  "Permits",
  "Too many jobs",
  "Travel time",
  "Emergencies",
] as const;

const scheduleShouldShow = [
  "Crew",
  "Job",
  "Address",
  "Scope",
  "Materials ready",
  "Customer contact",
  "Start date",
  "Due date",
  "Weather",
  "Subcontractors",
] as const;

const estimateMethod = [
  "Spreadsheet",
  "Accounting software",
  "Estimating software",
  "Templates",
  "Handwritten",
  "Project software",
  "Other",
] as const;

const costTracking = [
  "Not tracked",
  "Spreadsheet",
  "Accounting software",
  "Project software",
  "Receipts manually",
  "Estimated after completion",
  "Multiple places",
] as const;

const financialGaps = [
  "True job profit",
  "Labor cost",
  "Material cost",
  "Subcontractor cost",
  "Change-order profit",
  "Outstanding invoices",
  "Cash flow",
  "Estimated vs actual",
] as const;

function buildFieldTradeSections(cfg: FieldTradeConfig): Section[] {
  return [
    {
      id: "business",
      title: "Business Profile",
      desc: `Tell me how the ${cfg.tradeNoun} is structured and how work gets done.`,
      qs: [
        { id: "business_0", type: "single", q: "What best describes the business?", hint: "", opts: cfg.businessTypeOptions },
        { id: "business_1", type: "multi", q: "Who is involved in day-to-day operations?", hint: "Select everyone who touches a job.", opts: whoInvolved },
        { id: "business_2", type: "multi", q: "Where is work primarily performed?", hint: "", opts: whereWork },
        { id: "business_3", type: "text", q: "How many years has the business been operating?", hint: "", opts: [] },
        { id: "business_4", type: "text", q: "How many people work in the business today (crew + office)?", hint: "", opts: [] },
        { id: "business_5", type: "text", q: "What area/region do you primarily serve?", hint: "City, county, or radius is fine.", opts: [] },
      ],
    },
    {
      id: "services",
      title: "Services",
      desc: "Help me understand what the business sells and which work drives revenue.",
      qs: [
        { id: "services_0", type: "multi", q: "Which services are offered?", hint: "", opts: cfg.servicesOptions },
        { id: "services_1", type: "multi", q: "Which services are most important to grow?", hint: "", opts: cfg.growthServicesOptions },
      ],
    },
    {
      id: "daily",
      title: "Day-to-Day Operations",
      desc: "Walk me through a normal workday from morning through closeout.",
      qs: [
        { id: "daily_0", type: "multi", q: "What happens every morning?", hint: "", opts: dailyMorning },
        { id: "daily_1", type: "multi", q: "What happens during the workday?", hint: "", opts: dailyDuring },
        { id: "daily_2", type: "multi", q: "What happens at the end of the day?", hint: "", opts: dailyEnd },
      ],
    },
    {
      id: "sales",
      title: "Leads & Sales",
      desc: "Help me understand how a new lead becomes a signed customer.",
      qs: [
        { id: "sales_0", type: "multi", q: "How do leads arrive?", hint: "", opts: leadSources },
        { id: "sales_1", type: "multi", q: "What happens after a lead arrives?", hint: "", opts: leadFollowUp },
        { id: "sales_2", type: "multi", q: "Where are leads and estimates tracked?", hint: "", opts: leadTracking },
      ],
    },
    {
      id: "projects",
      title: "Project Lifecycle",
      desc: "Walk me through the full job from signed agreement to completion.",
      qs: [
        { id: "projects_0", type: "multi", q: "Which steps normally happen after a customer signs?", hint: "", opts: projectSteps },
        { id: "projects_1", type: "multi", q: "How is project progress tracked?", hint: "", opts: projectTracking },
        { id: "projects_2", type: "multi", q: "What usually triggers a project update?", hint: "", opts: projectUpdateTriggers },
      ],
    },
    {
      id: "site",
      title: "Job Site",
      desc: "Help me understand what your field staff need and what information comes back.",
      qs: [
        { id: "site_0", type: "multi", q: "What do crews need before arriving?", hint: "", opts: siteNeeds },
        { id: "site_1", type: "multi", q: "What gets captured from the job site?", hint: "", opts: siteCapture },
        { id: "site_2", type: "multi", q: "How are job-site updates sent back?", hint: "", opts: siteReporting },
      ],
    },
    {
      id: "materials",
      title: "Materials & Inventory",
      desc: "Help me find where money and time are lost in materials.",
      qs: [
        { id: "materials_0", type: "multi", q: "How are materials planned?", hint: "", opts: materialsPlanning },
        { id: "materials_1", type: "multi", q: "How are materials purchased?", hint: "", opts: materialsPurchasers },
        { id: "materials_2", type: "multi", q: "What inventory/material problems occur?", hint: "", opts: [...materialsProblemsBase, cfg.extraMaterialProblem] },
      ],
    },
    {
      id: "vendors",
      title: "Vendors & Purchasing",
      desc: "Help me understand supplier relationships, pricing and your purchasing workflow.",
      qs: [
        { id: "vendors_0", type: "multi", q: "Where are purchases recorded?", hint: "", opts: vendorRecording },
        { id: "vendors_1", type: "multi", q: "What would help most?", hint: "", opts: vendorHelp },
      ],
    },
    {
      id: "people",
      title: "People & Scheduling",
      desc: "Help me map employees, subs and scheduling dependencies.",
      qs: [
        { id: "people_0", type: "multi", q: "How are people scheduled?", hint: "", opts: scheduleMethod },
        { id: "people_1", type: "multi", q: "What makes scheduling difficult?", hint: "", opts: scheduleDifficulty },
        { id: "people_2", type: "multi", q: "What should scheduling show?", hint: "", opts: scheduleShouldShow },
      ],
    },
    {
      id: "money",
      title: "Money & Job Costing",
      desc: "Help me understand estimating, invoicing and profitability.",
      qs: [
        { id: "money_0", type: "multi", q: "How are estimates created?", hint: "", opts: estimateMethod },
        { id: "money_1", type: "multi", q: "How are job costs tracked?", hint: "", opts: costTracking },
        { id: "money_2", type: "multi", q: "What financial visibility is missing?", hint: "", opts: financialGaps },
        {
          id: "money_3",
          type: "text",
          q: "Which specific software/tools do you use today, if any?",
          hint: `For example: ${cfg.toolExamples}.`,
          opts: [],
        },
      ],
    },
  ];
}

const renovationSections = buildFieldTradeSections({
  id: "renovation",
  tradeNoun: "renovation company",
  businessTypeOptions: [
    "Solo owner/operator",
    "Small contractor team",
    "General contractor with subs",
    "Remodeling/renovation company",
    "Design-build company",
    "Other",
  ],
  servicesOptions: [
    "Decks", "Porches", "Patios", "Pergolas", "Fences", "Siding", "Roofing",
    "Windows/doors", "Kitchen remodels", "Bathroom remodels", "Basements",
    "Additions", "General repairs", "Other",
  ],
  growthServicesOptions: [
    "Decks/outdoor living", "Whole-home renovations", "Kitchens", "Bathrooms",
    "Additions", "Repairs/maintenance", "Other",
  ],
  extraMaterialProblem: "Framing/structural surprises",
  toolExamples: "Buildertrend, JobNimbus, CoConstruct, QuickBooks",
});

const roofingSections = buildFieldTradeSections({
  id: "roofing",
  tradeNoun: "roofing company",
  businessTypeOptions: [
    "Solo owner/operator",
    "Small roofing crew",
    "Roofing contractor with subs",
    "Full-service roofing company",
    "Roofing + exteriors company",
    "Other",
  ],
  servicesOptions: [
    "Asphalt shingle roofing", "Metal roofing", "Flat/low-slope roofing",
    "Tile roofing", "Roof repairs", "Roof inspections", "Gutter installation",
    "Storm/insurance restoration", "Skylights", "Ventilation", "Other",
  ],
  growthServicesOptions: [
    "Full roof replacements", "Storm/insurance restoration", "Metal roofing",
    "Gutter systems", "Repairs/maintenance", "Commercial roofing", "Other",
  ],
  extraMaterialProblem: "Weather-related delays/damage",
  toolExamples: "AccuLynx, JobNimbus, EagleView, QuickBooks",
});

const sidingSections = buildFieldTradeSections({
  id: "siding",
  tradeNoun: "siding company",
  businessTypeOptions: [
    "Solo owner/operator",
    "Small siding crew",
    "Siding contractor with subs",
    "Full-service siding company",
    "Siding + exteriors company",
    "Other",
  ],
  servicesOptions: [
    "Vinyl siding", "Fiber cement siding", "Wood siding", "Metal siding",
    "Siding repairs", "Trim and soffit", "Insulated siding", "Storm restoration",
    "House wrap/moisture barrier", "Other",
  ],
  growthServicesOptions: [
    "Full siding replacements", "Fiber cement siding", "Storm restoration",
    "Repairs/maintenance", "Insulated siding", "Commercial siding", "Other",
  ],
  extraMaterialProblem: "Color/batch matching issues",
  toolExamples: "JobNimbus, CoConstruct, QuickBooks",
});

const landscapingSections = buildFieldTradeSections({
  id: "landscaping",
  tradeNoun: "landscaping company",
  businessTypeOptions: [
    "Solo owner/operator",
    "Small landscaping crew",
    "Landscaping company with subs",
    "Full-service landscape/lawn company",
    "Design-build landscape company",
    "Other",
  ],
  servicesOptions: [
    "Lawn mowing/maintenance", "Landscape design", "Hardscaping/patios",
    "Irrigation", "Tree/shrub care", "Mulching/planting", "Lighting",
    "Snow removal", "Fertilization/weed control", "Drainage", "Other",
  ],
  growthServicesOptions: [
    "Hardscaping/patios", "Landscape design", "Irrigation", "Recurring lawn maintenance",
    "Snow removal", "Tree/shrub care", "Other",
  ],
  extraMaterialProblem: "Seasonal plant/material availability",
  toolExamples: "Jobber, LMN, Aspire, QuickBooks",
});

// ---------------------------------------------------------------------------
// Restaurant / Food Service — genuinely different operational shape.
// ---------------------------------------------------------------------------

const restaurantSections: Section[] = [
  {
    id: "business",
    title: "Business Profile",
    desc: "Tell me how the restaurant is structured and how service runs.",
    qs: [
      { id: "business_0", type: "single", q: "What best describes the business?", hint: "", opts: [
        "Quick-service/fast casual", "Casual dining", "Fine dining", "Food truck/mobile",
        "Cafe/bakery", "Bar/pub", "Catering company", "Other",
      ]},
      { id: "business_1", type: "multi", q: "Who is involved in day-to-day operations?", hint: "", opts: [
        "Owner", "General manager", "Chef/kitchen manager", "Line cooks/kitchen staff",
        "Servers", "Host/hostess", "Bartender", "Delivery drivers", "Bookkeeper/accountant",
      ]},
      { id: "business_2", type: "multi", q: "How do guests experience the business?", hint: "", opts: [
        "Dine-in", "Takeout", "Delivery (own drivers)", "Delivery (DoorDash/UberEats/Grubhub)",
        "Drive-thru", "Catering", "Online ordering",
      ]},
      { id: "business_3", type: "text", q: "How many years has the business been operating?", hint: "", opts: [] },
      { id: "business_4", type: "text", q: "How many people work in the business today (all shifts)?", hint: "", opts: [] },
      { id: "business_5", type: "text", q: "What area do you primarily serve?", hint: "Neighborhood, city, or delivery radius.", opts: [] },
    ],
  },
  {
    id: "offerings",
    title: "Menu & Offerings",
    desc: "Help me understand what the restaurant sells and what drives revenue.",
    qs: [
      { id: "offerings_0", type: "multi", q: "How would you describe the menu?", hint: "", opts: [
        "American", "Italian", "Mexican/Latin", "Asian", "Mediterranean", "Pizza",
        "BBQ", "Seafood", "Bakery/desserts", "Bar food", "Coffee/cafe", "Other",
      ]},
      { id: "offerings_1", type: "multi", q: "Which parts of the menu/business are most important to grow?", hint: "", opts: [
        "Dine-in", "Takeout", "Delivery", "Catering", "Bar/beverage sales", "Private events", "Other",
      ]},
    ],
  },
  {
    id: "daily",
    title: "Day-to-Day Operations",
    desc: "Walk me through a normal day from open through close.",
    qs: [
      { id: "daily_0", type: "multi", q: "What happens before opening?", hint: "", opts: [
        "Prep food", "Check inventory", "Staff briefing", "Review reservations",
        "Check deliveries", "Set up dining room", "Other",
      ]},
      { id: "daily_1", type: "multi", q: "What happens during service?", hint: "", opts: [
        "Seat guests", "Take orders", "Manage kitchen tickets", "Manage table turnover",
        "Handle complaints", "Run food/drinks", "Answer phone orders", "Manage online orders",
      ]},
      { id: "daily_2", type: "multi", q: "What happens at close?", hint: "", opts: [
        "Clean/close stations", "Cash/tip reconciliation", "Inventory count",
        "Next-day prep list", "Restock", "Schedule check for next day",
      ]},
    ],
  },
  {
    id: "sales",
    title: "Reservations & Orders",
    desc: "Help me understand how a guest becomes an order or reservation.",
    qs: [
      { id: "sales_0", type: "multi", q: "How do reservations/orders arrive?", hint: "", opts: [
        "Phone", "Walk-in", "OpenTable/Resy", "Website", "Own app",
        "DoorDash/UberEats/Grubhub", "Catering inquiry form", "Other",
      ]},
      { id: "sales_1", type: "multi", q: "What happens after a reservation/order comes in?", hint: "", opts: [
        "Confirm", "Seat", "Take order", "Send to kitchen", "Deliver/serve",
        "Follow up for catering/events", "Collect payment",
      ]},
      { id: "sales_2", type: "multi", q: "Where are reservations and orders tracked?", hint: "", opts: [
        "POS system", "Reservation platform", "Paper", "Spreadsheet",
        "Third-party delivery app", "Memory",
      ]},
    ],
  },
  {
    id: "lifecycle",
    title: "Guest & Order Lifecycle",
    desc: "Walk me through the full guest experience from arrival to payment.",
    qs: [
      { id: "lifecycle_0", type: "multi", q: "Which steps normally happen for a guest?", hint: "", opts: [
        "Greet/seat", "Take order", "Kitchen prep", "Course timing", "Check-in",
        "Payment", "Feedback/review request",
      ]},
      { id: "lifecycle_1", type: "multi", q: "How is order status tracked?", hint: "", opts: [
        "Kitchen display system", "Paper tickets", "POS screen", "Verbal/expo",
        "Third-party app dashboard",
      ]},
      { id: "lifecycle_2", type: "multi", q: "What usually triggers an update mid-service?", hint: "", opts: [
        "Course ready", "Delay", "Special request", "Allergy/substitution",
        "Large party/event", "Complaint",
      ]},
    ],
  },
  {
    id: "kitchen",
    title: "Kitchen & Floor Operations",
    desc: "Help me understand what kitchen and floor staff need and what information comes back.",
    qs: [
      { id: "kitchen_0", type: "multi", q: "What does kitchen staff need before/during service?", hint: "", opts: [
        "Recipes/prep lists", "Allergy info", "86'd items", "Order tickets",
        "Inventory levels", "Special requests",
      ]},
      { id: "kitchen_1", type: "multi", q: "What gets captured from kitchen/floor operations?", hint: "", opts: [
        "Food waste", "Prep times", "Temperature logs", "Special requests",
        "Complaints", "86'd items",
      ]},
      { id: "kitchen_2", type: "multi", q: "How does information flow between kitchen and front-of-house?", hint: "", opts: [
        "Verbal", "POS/kitchen display", "Expo runner", "Paper tickets", "Group chat",
      ]},
    ],
  },
  {
    id: "inventory",
    title: "Food & Beverage Inventory",
    desc: "Help me find where money and time are lost in inventory.",
    qs: [
      { id: "inventory_0", type: "multi", q: "How is inventory planned?", hint: "", opts: [
        "Par levels", "Vendor order guides", "Spreadsheet", "POS integration", "Experience",
      ]},
      { id: "inventory_1", type: "multi", q: "Who orders inventory?", hint: "", opts: [
        "Owner", "GM", "Chef/kitchen manager", "Multiple people",
      ]},
      { id: "inventory_2", type: "multi", q: "What inventory problems occur?", hint: "", opts: [
        "Spoilage/waste", "Stockouts", "Over-ordering", "Price fluctuation",
        "Theft/shrinkage", "Missed deliveries", "No visibility into usage",
      ]},
    ],
  },
  {
    id: "vendors",
    title: "Vendors & Purchasing",
    desc: "Help me understand supplier relationships, pricing and purchasing workflow.",
    qs: [
      { id: "vendors_0", type: "multi", q: "Where are purchases recorded?", hint: "", opts: [
        "Accounting software", "Invoices/receipts", "Spreadsheet", "Vendor portal",
        "Not consistently",
      ]},
      { id: "vendors_1", type: "multi", q: "What would help most?", hint: "", opts: [
        "Vendor price comparison", "Delivery tracking", "Invoice matching",
        "Purchase orders", "Vendor history",
      ]},
    ],
  },
  {
    id: "people",
    title: "Staff Scheduling",
    desc: "Help me understand staffing and scheduling dependencies.",
    qs: [
      { id: "people_0", type: "multi", q: "How is staff scheduled?", hint: "", opts: [
        "Paper", "Scheduling app (7shifts, HotSchedules, etc.)", "Spreadsheet",
        "Group chat", "Memory",
      ]},
      { id: "people_1", type: "multi", q: "What makes scheduling difficult?", hint: "", opts: [
        "Call-offs", "Shift swaps", "Seasonal demand", "Labor cost control",
        "Compliance/breaks", "Part-time availability",
      ]},
      { id: "people_2", type: "multi", q: "What should scheduling show?", hint: "", opts: [
        "Shift", "Role", "Section/station", "Tips", "Availability", "Labor cost vs. sales",
      ]},
    ],
  },
  {
    id: "money",
    title: "Money & Menu Costing",
    desc: "Help me understand menu pricing, sales tracking and profitability.",
    qs: [
      { id: "money_0", type: "multi", q: "How is the menu priced/costed?", hint: "", opts: [
        "Recipe costing software", "Spreadsheet", "Guesswork", "POS reports", "Not done",
      ]},
      { id: "money_1", type: "multi", q: "How are sales tracked?", hint: "", opts: [
        "POS reports", "Manual", "Accounting software", "Third-party delivery dashboards",
      ]},
      { id: "money_2", type: "multi", q: "What financial visibility is missing?", hint: "", opts: [
        "True dish-level profitability", "Labor cost %", "Food cost %", "Waste cost",
        "Tip reporting", "Delivery-app fees impact",
      ]},
      { id: "money_3", type: "text", q: "Which specific software/tools do you use today, if any?", hint: "For example: Toast, Square, Clover, QuickBooks.", opts: [] },
    ],
  },
];

// ---------------------------------------------------------------------------
// Retail / Store — genuinely different operational shape.
// ---------------------------------------------------------------------------

const retailSections: Section[] = [
  {
    id: "business",
    title: "Business Profile",
    desc: "Tell me how the store is structured and how it runs.",
    qs: [
      { id: "business_0", type: "single", q: "What best describes the business?", hint: "", opts: [
        "Apparel/boutique", "General retail", "Specialty retail", "Grocery/convenience",
        "Hardware/home goods", "Electronics", "Online + physical store", "Other",
      ]},
      { id: "business_1", type: "multi", q: "Who is involved in day-to-day operations?", hint: "", opts: [
        "Owner", "Store manager", "Sales associates", "Buyer/merchandiser",
        "Warehouse/stock staff", "Bookkeeper/accountant",
      ]},
      { id: "business_2", type: "multi", q: "How do customers shop with you?", hint: "", opts: [
        "In-store", "Online store", "Marketplace (Amazon/Etsy/eBay)", "Social media shop",
        "Local delivery", "Curbside/in-store pickup",
      ]},
      { id: "business_3", type: "text", q: "How many years has the business been operating?", hint: "", opts: [] },
      { id: "business_4", type: "text", q: "How many people work in the business today?", hint: "", opts: [] },
      { id: "business_5", type: "text", q: "What area do you primarily serve?", hint: "Local, regional, or nationwide (if you ship).", opts: [] },
    ],
  },
  {
    id: "offerings",
    title: "Products & Offerings",
    desc: "Help me understand what the store sells and what drives revenue.",
    qs: [
      { id: "offerings_0", type: "multi", q: "Which product categories do you carry?", hint: "", opts: [
        "Apparel", "Home goods", "Electronics", "Food/grocery", "Gifts/specialty",
        "Beauty/personal care", "Hardware/tools", "Other",
      ]},
      { id: "offerings_1", type: "multi", q: "Which categories are most important to grow?", hint: "", opts: [
        "In-store sales", "Online sales", "Wholesale/B2B", "Subscription/repeat customers", "Other",
      ]},
    ],
  },
  {
    id: "daily",
    title: "Day-to-Day Operations",
    desc: "Walk me through a normal day from open through close.",
    qs: [
      { id: "daily_0", type: "multi", q: "What happens before opening?", hint: "", opts: [
        "Open register", "Check stock", "Review overnight online orders", "Restock shelves",
        "Check deliveries",
      ]},
      { id: "daily_1", type: "multi", q: "What happens during the day?", hint: "", opts: [
        "Help customers", "Ring sales", "Restock", "Answer online inquiries",
        "Process returns/exchanges", "Fulfill online orders",
      ]},
      { id: "daily_2", type: "multi", q: "What happens at close?", hint: "", opts: [
        "Close/reconcile register", "Restock", "Clean", "Review sales",
        "Plan next-day/reorder", "Ship pending online orders",
      ]},
    ],
  },
  {
    id: "sales",
    title: "Customers & Sales",
    desc: "Help me understand how customers find you and buy from you.",
    qs: [
      { id: "sales_0", type: "multi", q: "How do customers find you?", hint: "", opts: [
        "Walk-in", "Website", "Instagram/Facebook", "Google", "Marketplace",
        "Referral", "Repeat customer", "Other",
      ]},
      { id: "sales_1", type: "multi", q: "What happens after a customer inquiry or online order?", hint: "", opts: [
        "Respond", "Fulfill/pack", "Ship", "In-store pickup", "Follow up", "Process payment",
      ]},
      { id: "sales_2", type: "multi", q: "Where are sales and customers tracked?", hint: "", opts: [
        "POS system", "E-commerce platform", "Spreadsheet", "Memory", "Multiple places",
      ]},
    ],
  },
  {
    id: "lifecycle",
    title: "Order & Fulfillment Lifecycle",
    desc: "Walk me through the full order from sale to delivery or return.",
    qs: [
      { id: "lifecycle_0", type: "multi", q: "Which steps normally happen after a sale?", hint: "", opts: [
        "Payment", "Receipt", "Bag/package", "Ship", "In-store pickup",
        "Returns/exchanges",
      ]},
      { id: "lifecycle_1", type: "multi", q: "How is order status tracked?", hint: "", opts: [
        "POS system", "Shipping platform", "Spreadsheet", "Memory",
      ]},
      { id: "lifecycle_2", type: "multi", q: "What usually triggers an update?", hint: "", opts: [
        "Order shipped", "Item backordered", "Item restocked", "Return requested",
        "Customer inquiry",
      ]},
    ],
  },
  {
    id: "floor",
    title: "Store & Fulfillment Operations",
    desc: "Help me understand what staff need and what information comes back.",
    qs: [
      { id: "floor_0", type: "multi", q: "What do staff need to know day-to-day?", hint: "", opts: [
        "Product info", "Pricing", "Current promotions", "Stock levels", "Return policy",
      ]},
      { id: "floor_1", type: "multi", q: "What gets captured from the floor/fulfillment?", hint: "", opts: [
        "Sales", "Returns", "Customer feedback", "Damaged goods", "Stock counts",
      ]},
      { id: "floor_2", type: "multi", q: "How does information flow between staff?", hint: "", opts: [
        "POS system", "Verbal", "Group chat", "Paper",
      ]},
    ],
  },
  {
    id: "inventory",
    title: "Inventory & Merchandise",
    desc: "Help me find where money and time are lost in inventory.",
    qs: [
      { id: "inventory_0", type: "multi", q: "How is inventory planned/ordered?", hint: "", opts: [
        "POS reorder points", "Spreadsheet", "Vendor reps", "Buyer/merchandiser", "Experience",
      ]},
      { id: "inventory_1", type: "multi", q: "Who purchases inventory?", hint: "", opts: [
        "Owner", "Buyer/merchandiser", "Store manager", "Multiple people",
      ]},
      { id: "inventory_2", type: "multi", q: "What inventory problems occur?", hint: "", opts: [
        "Stockouts", "Overstock", "Shrinkage/theft", "Slow-moving inventory",
        "Missed seasonal timing", "Supplier delays", "No visibility across locations",
      ]},
    ],
  },
  {
    id: "vendors",
    title: "Vendors & Purchasing",
    desc: "Help me understand supplier relationships, pricing and purchasing workflow.",
    qs: [
      { id: "vendors_0", type: "multi", q: "Where are purchases recorded?", hint: "", opts: [
        "Accounting software", "Receipts", "Spreadsheet", "Vendor portal", "Not consistently",
      ]},
      { id: "vendors_1", type: "multi", q: "What would help most?", hint: "", opts: [
        "Vendor catalog", "Price comparison", "Purchase orders", "Reorder alerts", "Vendor history",
      ]},
    ],
  },
  {
    id: "people",
    title: "Staff Scheduling",
    desc: "Help me understand staffing and scheduling dependencies.",
    qs: [
      { id: "people_0", type: "multi", q: "How is staff scheduled?", hint: "", opts: [
        "Paper", "Scheduling app", "Spreadsheet", "Group chat", "Memory",
      ]},
      { id: "people_1", type: "multi", q: "What makes scheduling difficult?", hint: "", opts: [
        "Seasonal peaks", "Part-time availability", "Call-offs", "Weekend coverage",
      ]},
      { id: "people_2", type: "multi", q: "What should scheduling show?", hint: "", opts: [
        "Shift", "Role", "Register assignment", "Availability",
      ]},
    ],
  },
  {
    id: "money",
    title: "Money & Margins",
    desc: "Help me understand pricing, sales tracking and profitability.",
    qs: [
      { id: "money_0", type: "multi", q: "How are pricing and margins tracked?", hint: "", opts: [
        "POS reports", "Spreadsheet", "Accounting software", "Not tracked",
      ]},
      { id: "money_1", type: "multi", q: "How are sales tracked?", hint: "", opts: [
        "POS reports", "E-commerce dashboard", "Manual", "Accounting software",
      ]},
      { id: "money_2", type: "multi", q: "What financial visibility is missing?", hint: "", opts: [
        "Product-level profit margin", "Best/worst sellers", "Inventory carrying cost",
        "Online vs. in-store performance", "True cost of returns",
      ]},
      { id: "money_3", type: "text", q: "Which specific software/tools do you use today, if any?", hint: "For example: Shopify, Square, Lightspeed, QuickBooks.", opts: [] },
    ],
  },
];

// ---------------------------------------------------------------------------
// Other small business — lighter generic module for anything that doesn't
// fit a named category above.
// ---------------------------------------------------------------------------

const otherSections: Section[] = [
  {
    id: "business",
    title: "Business Profile",
    desc: "Tell me how the business is structured and how it runs.",
    qs: [
      { id: "business_0", type: "text", q: "What kind of business is this?", hint: "A sentence or two is fine.", opts: [] },
      { id: "business_1", type: "multi", q: "Who is involved in day-to-day operations?", hint: "", opts: [
        "Owner", "Office/admin", "Sales staff", "Service/field staff", "Bookkeeper/accountant", "Other",
      ]},
      { id: "business_2", type: "text", q: "How many years has the business been operating?", hint: "", opts: [] },
      { id: "business_3", type: "text", q: "How many people work in the business today?", hint: "", opts: [] },
      { id: "business_4", type: "text", q: "What area do you primarily serve?", hint: "", opts: [] },
    ],
  },
  {
    id: "offerings",
    title: "Products & Services",
    desc: "Help me understand what the business sells and what drives revenue.",
    qs: [
      { id: "offerings_0", type: "textarea", q: "What products or services do you offer?", hint: "", opts: [] },
      { id: "offerings_1", type: "text", q: "What's most important to grow?", hint: "", opts: [] },
    ],
  },
  {
    id: "daily",
    title: "Day-to-Day Operations",
    desc: "Walk me through a normal day.",
    qs: [
      { id: "daily_0", type: "multi", q: "What happens on a typical day?", hint: "", opts: [
        "Serve customers/clients", "Handle orders/appointments", "Admin/paperwork",
        "Follow-ups", "Deliveries", "Billing/invoicing",
      ]},
    ],
  },
  {
    id: "sales",
    title: "Customers & Sales",
    desc: "Help me understand how customers or clients find you and buy from you.",
    qs: [
      { id: "sales_0", type: "multi", q: "How do customers/clients find you?", hint: "", opts: [
        "Website", "Phone", "Referral", "Social media", "Google", "Repeat customer", "Other",
      ]},
      { id: "sales_1", type: "multi", q: "What happens after an inquiry comes in?", hint: "", opts: [
        "Respond", "Quote/estimate", "Schedule", "Deliver service/product", "Follow up", "Collect payment",
      ]},
      { id: "sales_2", type: "multi", q: "Where are customers and sales tracked?", hint: "", opts: [
        "Spreadsheet", "Accounting software", "CRM", "Memory", "Multiple places",
      ]},
    ],
  },
  {
    id: "money",
    title: "Money & Billing",
    desc: "Help me understand pricing, invoicing and profitability.",
    qs: [
      { id: "money_0", type: "multi", q: "How is pricing/invoicing handled?", hint: "", opts: [
        "Spreadsheet", "Accounting software", "Invoicing app", "Handwritten", "Other",
      ]},
      { id: "money_1", type: "multi", q: "What financial visibility is missing?", hint: "", opts: [
        "True profit per job/sale", "Outstanding invoices", "Cash flow", "Cost tracking",
      ]},
      { id: "money_2", type: "text", q: "Which specific software/tools do you use today, if any?", hint: "For example: QuickBooks, Wave, FreshBooks.", opts: [] },
    ],
  },
];

const OPERATIONAL_SECTIONS: Record<IndustryId, Section[]> = {
  renovation: renovationSections,
  roofing: roofingSections,
  siding: sidingSections,
  landscaping: landscapingSections,
  restaurant: restaurantSections,
  retail: retailSections,
  other: otherSections,
};

export function getOperationalSections(industry: string): Section[] {
  const id = (INDUSTRIES.some((i) => i.id === industry) ? industry : DEFAULT_INDUSTRY) as IndustryId;
  return OPERATIONAL_SECTIONS[id];
}
