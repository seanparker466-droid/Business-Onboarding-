import { industryGroup, industryLabel, type IndustryGroup } from "./industries";

export type BlueprintStage = {
  name: string; owner: string; input: string; system: string; output: string; automation: string;
  screens: string; fields: string; roles: string; ai: string; dependency: string; priority: string;
};

type BlueprintTemplate = {
  stages: BlueprintStage[];
  dataModel: readonly [string, string][];
  roadmap: readonly [string, string, string][];
};

const fieldTradesTemplate: BlueprintTemplate = {
  stages: [
    { name: "Lead intake", owner: "Sales / office", input: "Customer + project request", system: "Lead record", output: "Qualified opportunity", automation: "Create lead, assign owner, start follow-up", screens: "Lead inbox · Lead detail · Follow-up queue", fields: "Customer, contact, source, project type, notes, next action", roles: "Owner · Office · Sales", ai: "Summarize inquiry, classify project type, draft follow-up", dependency: "Customer record", priority: "High" },
    { name: "Estimate", owner: "Estimator", input: "Scope + site information", system: "Estimate record", output: "Proposal / approval", automation: "Generate checklist and reminders", screens: "Estimate builder · Scope checklist · Proposal preview", fields: "Scope, measurements, labor, materials, allowances, price, margin", roles: "Estimator · Owner", ai: "Draft scope summary and identify missing estimate inputs", dependency: "Qualified lead", priority: "High" },
    { name: "Contract", owner: "Office", input: "Approved proposal", system: "Project record", output: "Active job", automation: "Create project, folders and baseline", screens: "Contract status · Project setup · Document hub", fields: "Signed agreement, customer, scope, price, dates, terms", roles: "Office · Owner", ai: "Extract key obligations and missing signatures", dependency: "Approved estimate", priority: "Medium" },
    { name: "Schedule", owner: "Scheduler", input: "Project + crew + dependencies", system: "Schedule", output: "Committed start date", automation: "Check conflicts and notify stakeholders", screens: "Calendar · Crew board · Schedule detail", fields: "Crew, dates, duration, dependencies, readiness, customer commitment", roles: "Scheduler · PM · Crew", ai: "Flag conflicts and recommend schedule adjustments", dependency: "Active project", priority: "Critical" },
    { name: "Materials", owner: "Purchasing", input: "Scope + schedule", system: "Material board", output: "Job-ready status", automation: "Flag missing purchases before start", screens: "Material request · Purchasing board · Delivery status", fields: "Item, quantity, vendor, cost, ordered, received, needed-by date", roles: "Purchasing · PM · Crew", ai: "Group purchases, detect missing items and summarize readiness", dependency: "Estimate + schedule", priority: "Critical" },
    { name: "Field execution", owner: "Crew / PM", input: "Job instructions", system: "Mobile job record", output: "Progress + issues", automation: "Capture photos, measurements, hours and notes", screens: "Today's jobs · Job detail · Daily update · Issue report", fields: "Instructions, photos, measurements, hours, materials used, issues", roles: "Crew · PM", ai: "Summarize daily progress and surface unresolved issues", dependency: "Scheduled job", priority: "High" },
    { name: "Billing", owner: "Office", input: "Costs + progress", system: "Job costing / invoice", output: "Invoice + margin", automation: "Match receipts and surface billing blockers", screens: "Cost dashboard · Receipt capture · Invoice queue", fields: "Estimated cost, actual cost, labor, materials, receipts, invoice, margin", roles: "Office · Owner", ai: "Explain cost variance and flag margin risk", dependency: "Active job + cost data", priority: "High" },
    { name: "Closeout", owner: "PM / office", input: "Completed work", system: "Closeout hub", output: "Final record + warranty", automation: "Checklist, customer update and document archive", screens: "Closeout checklist · Final documents · Warranty", fields: "Punch list, final photos, approvals, invoice status, warranty", roles: "PM · Office · Customer", ai: "Generate closeout summary and customer handoff", dependency: "Completed field work", priority: "Medium" },
  ],
  dataModel: [
    ["Customer", "Contact details, property, communication history"],
    ["Lead", "Source, stage, follow-up, estimate status"],
    ["Project", "Scope, contract, schedule, status, owner"],
    ["Job", "Crew, site instructions, photos, measurements, hours"],
    ["Material", "Item, vendor, quantity, cost, purchase and delivery status"],
    ["Financial", "Estimate, actual cost, receipts, invoice, margin"],
    ["Document", "Type, project, date, owner, storage location"],
  ],
  roadmap: [
    ["01", "Foundation", "Customers, leads, projects, users and document structure"],
    ["02", "Operational control", "Scheduling, materials, field updates and job status"],
    ["03", "Financial control", "Estimates, receipts, job costs, invoices and margin"],
    ["04", "Automation", "Reminders, alerts, customer updates and routine data movement"],
    ["05", "AI layer", "Summaries, exception detection, forecasting and decision support"],
  ],
};

const restaurantTemplate: BlueprintTemplate = {
  stages: [
    { name: "Reservation/Order intake", owner: "Host / front-of-house", input: "Guest request (phone/app/walk-in)", system: "Reservation/order record", output: "Confirmed reservation or order", automation: "Confirm and notify kitchen/floor", screens: "Reservation inbox · Order queue", fields: "Guest, party size or items, time, source, special requests", roles: "Host · Server · Manager", ai: "Summarize special requests and flag allergy conflicts", dependency: "None", priority: "High" },
    { name: "Kitchen prep", owner: "Kitchen / chef", input: "Order ticket", system: "Kitchen display / ticket", output: "Prepared dish", automation: "Route ticket and flag 86'd items", screens: "Kitchen display · Prep list", fields: "Items, modifiers, allergy flags, prep time", roles: "Chef · Line cooks", ai: "Flag allergy/substitution conflicts and estimate ticket times", dependency: "Confirmed order", priority: "Critical" },
    { name: "Service/Delivery", owner: "Server / driver", input: "Prepared order", system: "Table/delivery status", output: "Delivered order", automation: "Notify guest or table when ready", screens: "Table map · Delivery tracker", fields: "Table or guest, status, timing", roles: "Server · Driver · Expo", ai: "Predict delivery/table timing", dependency: "Kitchen prep", priority: "High" },
    { name: "Payment", owner: "Server / cashier", input: "Completed order", system: "POS transaction", output: "Closed check", automation: "Split/merge checks and apply tips", screens: "POS checkout", fields: "Items, tax, tip, payment method", roles: "Server · Cashier", ai: "Flag pricing/discount anomalies", dependency: "Delivered order", priority: "Medium" },
    { name: "Feedback & follow-up", owner: "Manager", input: "Completed visit/order", system: "Review/feedback record", output: "Review or repeat booking", automation: "Send review request and flag complaints", screens: "Feedback inbox", fields: "Rating, comments, follow-up status", roles: "Manager", ai: "Summarize sentiment and draft responses", dependency: "Payment", priority: "Medium" },
    { name: "Inventory & ordering", owner: "Chef / manager", input: "Par levels + usage", system: "Inventory record", output: "Purchase order", automation: "Flag low stock and suggest reorder", screens: "Inventory dashboard · Order guide", fields: "Item, par level, on-hand, vendor, cost", roles: "Chef · Manager", ai: "Forecast usage and flag waste trends", dependency: "None", priority: "Critical" },
  ],
  dataModel: [
    ["Guest", "Contact details, preferences, visit history"],
    ["Reservation/Order", "Source, items, party size, status"],
    ["Menu item", "Recipe, cost, price, allergens"],
    ["Inventory", "Item, par level, vendor, cost, on-hand"],
    ["Staff", "Role, shift, labor cost"],
    ["Financial", "Sales, cost, tips, margin"],
    ["Document", "Licenses, permits, contracts, records"],
  ],
  roadmap: [
    ["01", "Foundation", "Guests, menu, staff and document structure"],
    ["02", "Operational control", "Reservations/orders, kitchen tickets and inventory"],
    ["03", "Financial control", "Menu costing, sales, tips and margin"],
    ["04", "Automation", "Reminders, review requests and reorder alerts"],
    ["05", "AI layer", "Sentiment summaries, demand forecasting and decision support"],
  ],
};

const retailTemplate: BlueprintTemplate = {
  stages: [
    { name: "Inquiry/Order intake", owner: "Sales associate", input: "Customer inquiry or online order", system: "Order record", output: "Confirmed order", automation: "Confirm and route to fulfillment", screens: "Order inbox", fields: "Customer, items, channel, notes", roles: "Associate · Manager", ai: "Draft responses and flag urgent requests", dependency: "None", priority: "High" },
    { name: "Fulfillment prep", owner: "Stock / warehouse staff", input: "Confirmed order", system: "Pick list", output: "Packed order", automation: "Generate pick list and flag stock issues", screens: "Pick list · Stock check", fields: "Items, quantity, location, status", roles: "Stock staff", ai: "Flag substitutions for out-of-stock items", dependency: "Confirmed order", priority: "Critical" },
    { name: "Sale/Checkout", owner: "Cashier", input: "Selected items", system: "POS transaction", output: "Completed sale", automation: "Apply promotions and update inventory", screens: "POS checkout", fields: "Items, price, discounts, payment", roles: "Cashier", ai: "Flag pricing anomalies", dependency: "None", priority: "High" },
    { name: "Shipping/Pickup", owner: "Fulfillment staff", input: "Packed order", system: "Shipping/pickup record", output: "Delivered or picked-up order", automation: "Notify customer and generate tracking", screens: "Shipping queue · Pickup board", fields: "Carrier, tracking, pickup status", roles: "Fulfillment staff", ai: "Predict delivery delays", dependency: "Fulfillment prep", priority: "Medium" },
    { name: "Returns/Exchanges", owner: "Associate / manager", input: "Return request", system: "Returns record", output: "Resolved return", automation: "Restock and refund/exchange", screens: "Returns queue", fields: "Item, reason, condition, resolution", roles: "Associate · Manager", ai: "Flag return-fraud patterns", dependency: "Completed sale", priority: "Medium" },
    { name: "Inventory & restock", owner: "Buyer / manager", input: "Sales + stock levels", system: "Inventory record", output: "Purchase order", automation: "Flag reorder points", screens: "Inventory dashboard", fields: "SKU, on-hand, reorder point, vendor, cost", roles: "Buyer · Manager", ai: "Forecast demand and flag slow movers", dependency: "None", priority: "Critical" },
  ],
  dataModel: [
    ["Customer", "Contact details, purchase history"],
    ["Order", "Channel, items, status"],
    ["Product/SKU", "Category, price, cost, stock"],
    ["Inventory", "On-hand, reorder point, vendor"],
    ["Staff", "Role, shift"],
    ["Financial", "Sales, margin, returns"],
    ["Document", "Receipts, contracts, records"],
  ],
  roadmap: [
    ["01", "Foundation", "Customers, products, staff and document structure"],
    ["02", "Operational control", "Orders, fulfillment and inventory"],
    ["03", "Financial control", "Pricing, margins and returns"],
    ["04", "Automation", "Reorder alerts, shipping notifications and review requests"],
    ["05", "AI layer", "Demand forecasting, slow-mover detection and decision support"],
  ],
};

const otherTemplate: BlueprintTemplate = {
  stages: [
    { name: "Inquiry intake", owner: "Owner / staff", input: "Customer inquiry", system: "Inquiry record", output: "Quote or booking", automation: "Auto-respond and log", screens: "Inquiry inbox", fields: "Customer, request, source, notes", roles: "Owner · Staff", ai: "Draft responses", dependency: "None", priority: "High" },
    { name: "Quote/Order", owner: "Owner", input: "Confirmed request", system: "Quote/order record", output: "Accepted quote", automation: "Generate quote and send reminders", screens: "Quote builder", fields: "Scope, price, terms", roles: "Owner", ai: "Draft quote language", dependency: "Inquiry", priority: "High" },
    { name: "Delivery/Service", owner: "Staff", input: "Accepted quote/order", system: "Job/order record", output: "Completed work", automation: "Track status and notify customer", screens: "Job tracker", fields: "Status, notes, completion date", roles: "Staff", ai: "Summarize progress", dependency: "Accepted quote", priority: "Medium" },
    { name: "Billing & follow-up", owner: "Owner / bookkeeper", input: "Completed work", system: "Invoice record", output: "Paid invoice", automation: "Send invoice and chase payment", screens: "Invoice queue", fields: "Amount, due date, status", roles: "Owner · Bookkeeper", ai: "Draft payment reminders", dependency: "Completed work", priority: "Medium" },
  ],
  dataModel: [
    ["Customer", "Contact details, history"],
    ["Job/Order", "Scope, status"],
    ["Financial", "Price, cost, invoice status"],
    ["Document", "Records"],
  ],
  roadmap: [
    ["01", "Foundation", "Customers, jobs/orders and document structure"],
    ["02", "Operational control", "Scheduling and job/order tracking"],
    ["03", "Financial control", "Quoting, invoicing and payment tracking"],
    ["04", "Automation", "Reminders and follow-ups"],
    ["05", "AI layer", "Summaries and decision support"],
  ],
};

const TEMPLATES: Record<IndustryGroup, BlueprintTemplate> = {
  fieldTrades: fieldTradesTemplate,
  restaurant: restaurantTemplate,
  retail: retailTemplate,
  other: otherTemplate,
};

export function getBlueprintTemplate(industry: string): BlueprintTemplate {
  return TEMPLATES[industryGroup(industry)];
}

export function getSpecTitle(industry: string): string {
  return `${industryLabel(industry).toUpperCase()} — SOFTWARE BUILD SPECIFICATION`;
}

// ---------------------------------------------------------------------------
// Per-group opportunity content: recommendations, automation ideas, impact
// narrative and "what to build first", keyed by the exact module names each
// group's rule set produces (see lib/assessment-analysis.ts MODULE_RULES).
// ---------------------------------------------------------------------------

type OpportunityContent = { recommendations: string[]; automation: { title: string; description: string }; impact: string; firstBuild: string };

const fieldTradesOpportunities: Record<string, OpportunityContent> = {
  "Materials & Purchasing": {
    recommendations: ["Material request board", "Vendor database", "Purchase orders", "Delivery status", "Receipt capture", "Job allocation"],
    automation: { title: "Automatically check material readiness", description: "When a job is scheduled, compare the required material list with purchase and delivery status, then alert the responsible person about missing items." },
    impact: "Material readiness directly affects whether a crew can start, stay productive and finish without unplanned trips.",
    firstBuild: "Build a job-linked material request and purchasing board first.",
  },
  "Scheduling & Dispatch": {
    recommendations: ["Crew calendar", "Job dependencies", "Material readiness", "Customer scheduling", "Change alerts", "Dispatch view"],
    automation: { title: "Detect schedule conflicts", description: "When a job date or crew changes, check assignments, dependencies and customer commitments and surface conflicts before they become problems." },
    impact: "Scheduling friction creates downstream conflicts between crews, customers, materials, weather and job timing.",
    firstBuild: "Build a shared schedule with crew assignment, dependencies and material-readiness status.",
  },
  "Lead & Sales CRM": {
    recommendations: ["Lead inbox", "Pipeline stages", "Follow-up reminders", "Estimate tracking", "Proposal status", "Source tracking"],
    automation: { title: "Never let a lead go cold", description: "Create follow-up tasks and reminders automatically based on lead stage, estimate status and the last customer interaction." },
    impact: "Lead and follow-up gaps create revenue leakage before a project is even scheduled.",
    firstBuild: "Build a lead pipeline with automatic follow-up tasks and estimate status.",
  },
  "Project Management": {
    recommendations: ["Project dashboard", "Milestones", "Change orders", "Task ownership", "Closeout checklist", "Warranty records"],
    automation: { title: "Create projects from approved work", description: "Once a proposal is accepted, automatically create the project, milestones, documents, tasks and initial schedule information." },
    impact: "Disconnected project information makes it harder to control scope, changes, milestones and accountability.",
    firstBuild: "Build a project record that becomes the single source of truth after approval.",
  },
  "Job Costing": {
    recommendations: ["Estimate baseline", "Labor tracking", "Material costs", "Subcontractor costs", "Actual vs. estimated", "Margin view"],
    automation: { title: "Connect costs to the job", description: "Capture receipts, labor and subcontractor costs against the correct project and compare actuals with the original estimate." },
    impact: "Weak job-cost visibility makes it difficult to know which jobs are actually profitable until after the work is complete.",
    firstBuild: "Build job-cost tracking that connects estimates, labor, materials, receipts and invoices.",
  },
  "Field Operations": {
    recommendations: ["Mobile job view", "Daily reports", "Photos", "Measurements", "Issue tracking", "Hours"],
    automation: { title: "Turn field updates into records", description: "Use mobile updates, photos, hours and issues to automatically keep the project record current." },
    impact: "Field information that arrives late or incomplete forces office staff to chase updates and recreate job records.",
    firstBuild: "Build a mobile field update flow for instructions, photos, hours, measurements and issues.",
  },
  "Customer Experience": {
    recommendations: ["Customer portal", "Status updates", "Approvals", "Scheduling messages", "Communication history", "Closeout updates"],
    automation: { title: "Send proactive customer updates", description: "Trigger customer notifications when scheduling, materials, milestones or approvals change so fewer status calls are needed." },
    impact: "Customers should not have to call for information that the system can proactively communicate.",
    firstBuild: "Build proactive customer updates tied to project milestones and schedule changes.",
  },
  "Document Hub": {
    recommendations: ["Project document hub", "Contracts", "Permits", "Receipts", "Photos", "Warranty files"],
    automation: { title: "Organize project documents automatically", description: "Route contracts, photos, receipts, permits and closeout documents into the correct project and category." },
    impact: "Scattered records increase search time and make closeout, billing, warranty and compliance harder.",
    firstBuild: "Build a project document hub with automatic filing by document type.",
  },
  "Automation & AI": {
    recommendations: ["Centralized data", "Task automation", "Notifications", "AI summaries", "Exception alerts", "Reporting"],
    automation: { title: "Automate repetitive administration", description: "Identify repeated data entry and handoffs, then automate reminders, summaries and routine record updates." },
    impact: "Repeated manual work is a strong candidate for standardization, automation and AI assistance.",
    firstBuild: "Map the repetitive administrative workflow and automate its highest-volume handoff first.",
  },
};

const restaurantOpportunities: Record<string, OpportunityContent> = {
  "Reservations & Order CRM": {
    recommendations: ["Reservation inbox", "Order queue", "Catering pipeline", "Follow-up reminders", "Source tracking"],
    automation: { title: "Never lose a catering lead", description: "Create follow-up tasks automatically for catering and event inquiries based on stage and last contact." },
    impact: "Reservation and order gaps create empty tables and missed catering revenue before service even begins.",
    firstBuild: "Build a unified reservation/order inbox with automatic confirmation and follow-up.",
  },
  "Staff Scheduling": {
    recommendations: ["Shift calendar", "Call-off/swap requests", "Labor cost vs. sales", "Availability tracking"],
    automation: { title: "Detect coverage gaps", description: "When a call-off happens, check upcoming shifts against forecasted demand and flag coverage risk." },
    impact: "Scheduling friction creates understaffed shifts, overtime cost and inconsistent guest experience.",
    firstBuild: "Build a shift schedule with call-off/swap handling and labor cost visibility.",
  },
  "Kitchen & Floor Operations": {
    recommendations: ["Kitchen display system", "86'd item alerts", "Allergy flagging", "Expo coordination"],
    automation: { title: "Keep the floor in sync with the kitchen", description: "Push 86'd items and ticket delays from the kitchen display straight to front-of-house automatically." },
    impact: "When kitchen and floor operate on different information, guests get wrong orders and slow service.",
    firstBuild: "Build a shared kitchen display feeding real-time status to front-of-house.",
  },
  "Food & Beverage Inventory": {
    recommendations: ["Par level tracking", "Vendor order guides", "Waste logging", "Delivery tracking"],
    automation: { title: "Flag low stock before service", description: "Compare par levels against on-hand inventory each morning and flag items that need an emergency order." },
    impact: "Inventory blind spots cause spoilage, stockouts mid-service and inconsistent food cost.",
    firstBuild: "Build a par-level inventory board tied to vendor ordering.",
  },
  "Menu & Cost Management": {
    recommendations: ["Recipe costing", "Menu profitability report", "Waste cost tracking", "POS integration"],
    automation: { title: "Flag margin-losing menu items", description: "Compare recipe cost against menu price automatically and flag items with shrinking margin." },
    impact: "Without real recipe costing, it's hard to know which menu items are actually profitable.",
    firstBuild: "Build recipe-level costing connected to POS sales data.",
  },
  "Customer Experience": {
    recommendations: ["Feedback inbox", "Review request automation", "Complaint tracking", "Guest history"],
    automation: { title: "Turn feedback into action", description: "Send review requests automatically after a visit and route complaints to a manager immediately." },
    impact: "Guest feedback that isn't captured or acted on quickly becomes a bad review instead of a fixable problem.",
    firstBuild: "Build automatic post-visit feedback requests with complaint escalation.",
  },
  "Vendor & Purchasing": {
    recommendations: ["Vendor price comparison", "Delivery tracking", "Invoice matching", "Purchase orders"],
    automation: { title: "Catch vendor price creep", description: "Compare each delivery invoice against the last order and flag unexpected price increases." },
    impact: "Without price tracking, vendor cost increases quietly erode margin over time.",
    firstBuild: "Build a vendor invoice log with automatic price-change flags.",
  },
  "Document Hub": {
    recommendations: ["License/permit tracker", "Contract storage", "Record archive"],
    automation: { title: "Track renewal deadlines automatically", description: "Alert the manager before a license or permit expires instead of finding out after the fact." },
    impact: "Missed license or permit renewals create compliance risk and can shut down service.",
    firstBuild: "Build a license/permit tracker with renewal alerts.",
  },
  "Automation & AI": {
    recommendations: ["Centralized data", "Task automation", "Notifications", "AI summaries", "Reporting"],
    automation: { title: "Automate repetitive administration", description: "Identify repeated data entry and handoffs, then automate reminders, summaries and routine record updates." },
    impact: "Repeated manual work is a strong candidate for standardization, automation and AI assistance.",
    firstBuild: "Map the repetitive administrative workflow and automate its highest-volume handoff first.",
  },
};

const retailOpportunities: Record<string, OpportunityContent> = {
  "Customer & Sales CRM": {
    recommendations: ["Customer inbox", "Order pipeline", "Follow-up reminders", "Source tracking"],
    automation: { title: "Never let an inquiry go cold", description: "Create follow-up tasks automatically based on inquiry stage and last customer contact." },
    impact: "Inquiry and follow-up gaps create lost sales before a customer even makes a purchase decision.",
    firstBuild: "Build a unified customer inquiry/order pipeline with automatic follow-up.",
  },
  "Staff Scheduling": {
    recommendations: ["Shift calendar", "Coverage planning", "Seasonal peak planning", "Availability tracking"],
    automation: { title: "Detect coverage gaps", description: "Check upcoming shifts against forecasted foot traffic and flag coverage risk before it happens." },
    impact: "Scheduling gaps create understaffed peak periods and lost sales at the register.",
    firstBuild: "Build a shift schedule with seasonal peak and coverage planning.",
  },
  "Store & Fulfillment Operations": {
    recommendations: ["Stock-level dashboard", "Promotion alerts", "Pickup/fulfillment tracker"],
    automation: { title: "Keep staff in sync on stock and promotions", description: "Push stock-level and promotion changes to all staff devices automatically instead of relying on memory." },
    impact: "When staff don't have current stock and promotion information, customers get wrong answers and lost sales.",
    firstBuild: "Build a shared stock/promotion dashboard visible to all staff.",
  },
  "Inventory & Merchandise": {
    recommendations: ["Reorder point alerts", "Shrinkage tracking", "Slow-mover reports", "Seasonal planning"],
    automation: { title: "Flag reorder points automatically", description: "Compare on-hand inventory against reorder points daily and generate draft purchase orders." },
    impact: "Inventory blind spots cause stockouts on best sellers and overstock on slow movers at the same time.",
    firstBuild: "Build a reorder-point inventory board tied to purchasing.",
  },
  "Money & Margins": {
    recommendations: ["Product-level margin report", "Best/worst seller tracking", "Online vs. in-store comparison"],
    automation: { title: "Flag margin-losing products", description: "Compare product cost against selling price automatically and flag items with shrinking margin." },
    impact: "Without product-level margin tracking, it's hard to know which products are actually profitable.",
    firstBuild: "Build product-level margin tracking connected to POS sales data.",
  },
  "Customer Experience": {
    recommendations: ["Order status updates", "Return/exchange tracking", "Customer history"],
    automation: { title: "Send proactive order updates", description: "Trigger customer notifications automatically when an order ships, is backordered or is ready for pickup." },
    impact: "Customers shouldn't have to call to check on an order the system already knows the status of.",
    firstBuild: "Build automatic order-status notifications for shipping and pickup.",
  },
  "Vendor & Purchasing": {
    recommendations: ["Vendor catalog", "Price comparison", "Purchase orders", "Delivery tracking"],
    automation: { title: "Catch vendor price creep", description: "Compare each vendor invoice against the last order and flag unexpected price increases." },
    impact: "Without price tracking, vendor cost increases quietly erode margin over time.",
    firstBuild: "Build a vendor purchase-order log with automatic price-change flags.",
  },
  "Document Hub": {
    recommendations: ["Receipt archive", "Contract storage", "Record archive"],
    automation: { title: "Organize records automatically", description: "Route receipts, contracts and vendor documents into the correct category automatically." },
    impact: "Scattered records increase time spent on returns, taxes and vendor disputes.",
    firstBuild: "Build a searchable receipt/document archive.",
  },
  "Automation & AI": {
    recommendations: ["Centralized data", "Task automation", "Notifications", "AI summaries", "Reporting"],
    automation: { title: "Automate repetitive administration", description: "Identify repeated data entry and handoffs, then automate reminders, summaries and routine record updates." },
    impact: "Repeated manual work is a strong candidate for standardization, automation and AI assistance.",
    firstBuild: "Map the repetitive administrative workflow and automate its highest-volume handoff first.",
  },
};

const otherOpportunities: Record<string, OpportunityContent> = {
  "Customer & Lead Management": {
    recommendations: ["Lead inbox", "Follow-up reminders", "Quote tracking", "Source tracking"],
    automation: { title: "Never let a lead go cold", description: "Create follow-up tasks automatically based on lead stage and last contact." },
    impact: "Lead and follow-up gaps create lost revenue before a sale is even made.",
    firstBuild: "Build a lead pipeline with automatic follow-up tasks.",
  },
  "Scheduling": {
    recommendations: ["Shared calendar", "Appointment reminders", "Staff availability"],
    automation: { title: "Reduce no-shows and conflicts", description: "Send automatic appointment reminders and flag double-bookings." },
    impact: "Scheduling friction creates missed appointments and wasted staff time.",
    firstBuild: "Build a shared calendar with automatic reminders.",
  },
  "Money & Billing": {
    recommendations: ["Invoice tracking", "Payment reminders", "Cost visibility"],
    automation: { title: "Chase overdue invoices automatically", description: "Send payment reminders automatically based on invoice due date." },
    impact: "Without invoice tracking, cash flow problems show up before anyone notices the pattern.",
    firstBuild: "Build simple invoice tracking with automatic payment reminders.",
  },
  "Document Hub": {
    recommendations: ["Record archive", "Contract storage"],
    automation: { title: "Organize records automatically", description: "Route documents into the correct category automatically instead of scattering them across folders and email." },
    impact: "Scattered records increase time spent searching and make billing and compliance harder.",
    firstBuild: "Build a simple searchable document archive.",
  },
  "Automation & AI": {
    recommendations: ["Centralized data", "Task automation", "Notifications", "AI summaries"],
    automation: { title: "Automate repetitive administration", description: "Identify repeated data entry and handoffs, then automate reminders, summaries and routine record updates." },
    impact: "Repeated manual work is a strong candidate for standardization, automation and AI assistance.",
    firstBuild: "Map the repetitive administrative workflow and automate its highest-volume handoff first.",
  },
};

const OPPORTUNITY_CONTENT: Record<IndustryGroup, Record<string, OpportunityContent>> = {
  fieldTrades: fieldTradesOpportunities,
  restaurant: restaurantOpportunities,
  retail: retailOpportunities,
  other: otherOpportunities,
};

const FALLBACK_CONTENT: OpportunityContent = {
  recommendations: ["Centralized data", "Task automation", "Notifications", "AI summaries", "Reporting"],
  automation: { title: "Automate repetitive administration", description: "Identify repeated data entry and handoffs, then automate reminders, summaries and routine record updates." },
  impact: "Repeated manual work is a strong candidate for standardization, automation and AI assistance.",
  firstBuild: "Map the repetitive administrative workflow and automate its highest-volume handoff first.",
};

function content(industry: string, moduleName: string): OpportunityContent {
  return OPPORTUNITY_CONTENT[industryGroup(industry)][moduleName] || FALLBACK_CONTENT;
}

export function getRecommendations(industry: string, moduleName: string): string[] {
  return content(industry, moduleName).recommendations;
}

export function getAutomationFor(industry: string, moduleName: string): { title: string; description: string } {
  return content(industry, moduleName).automation;
}

export function getOpportunityImpact(industry: string, moduleName: string): string {
  return content(industry, moduleName).impact;
}

export function getFirstBuild(industry: string, moduleName: string): string {
  return content(industry, moduleName).firstBuild;
}
