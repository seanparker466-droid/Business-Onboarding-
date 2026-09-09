import { getSectionsForIndustry, getQuestionTextAnyIndustry } from "./questions";
import { industryGroup, type IndustryGroup } from "./industries";

export type Answers = Record<string, string[] | string>;

export type ModuleScore = {
  name: string;
  description: string;
  score: number;
  max: number;
  percent: number;
};

type Rule = readonly [string, string, readonly string[]];

const fieldTradeRules: readonly Rule[] = [
  ["Scheduling & Dispatch", "Centralize crew assignments, job timing, material readiness, weather and changes.", ["schedule", "scheduling", "crew", "weather", "schedule conflicts"]],
  ["Lead & Sales CRM", "Capture leads, automate follow-up and keep estimates and proposals in one pipeline.", ["lead", "estimate", "follow-up", "proposal", "sales"]],
  ["Project Management", "Create one source of truth from signed contract through completion and warranty.", ["project", "progress", "job status", "contract", "milestones"]],
  ["Materials & Purchasing", "Connect material lists, purchasing, delivery status, receipts and job allocation.", ["material", "purchasing", "receipts", "store runs", "delivery"]],
  ["Job Costing", "Compare estimated and actual labor, materials and subcontractor costs.", ["cost", "profitability", "labor", "invoicing", "bookkeeping"]],
  ["Field Operations", "Give crews mobile access to job instructions, photos, hours, issues and daily reports.", ["job-site", "photos", "hours", "field", "crew"]],
  ["Customer Experience", "Create a clear customer communication trail for updates, approvals and scheduling.", ["customer", "messages", "status", "communication", "follow-up"]],
  ["Document Hub", "Keep contracts, permits, photos, receipts, change orders and warranty records organized.", ["document", "paper", "folders", "permits", "records"]],
  ["Automation & AI", "Reduce repeated entry, reminders, follow-ups and administrative reporting.", ["re-entering", "data entry", "reminders", "repeating", "automated", "ai assistant"]],
] as const;

const restaurantRules: readonly Rule[] = [
  ["Reservations & Order CRM", "Capture reservations and orders and keep follow-up for catering/events in one pipeline.", ["reservation", "order", "catering", "follow-up", "online order"]],
  ["Staff Scheduling", "Centralize shift scheduling, call-offs, swaps and labor cost against sales.", ["schedule", "shift", "call-off", "staff", "labor cost"]],
  ["Kitchen & Floor Operations", "Give kitchen and floor staff shared visibility into tickets, 86'd items and special requests.", ["kitchen", "ticket", "86", "prep", "expo", "floor"]],
  ["Food & Beverage Inventory", "Connect par levels, ordering, spoilage and delivery status.", ["inventory", "spoilage", "stockout", "par level", "waste"]],
  ["Menu & Cost Management", "Compare menu pricing against true food, labor and waste cost.", ["cost", "profitability", "menu", "waste cost", "food cost"]],
  ["Customer Experience", "Create a clear guest communication trail for reservations, orders and feedback.", ["guest", "complaint", "review", "customer", "feedback"]],
  ["Vendor & Purchasing", "Connect vendor pricing, delivery tracking and invoice matching.", ["vendor", "purchase", "delivery", "invoice"]],
  ["Document Hub", "Keep licenses, permits, contracts and records organized.", ["document", "paper", "folders", "permits", "records", "license"]],
  ["Automation & AI", "Reduce repeated entry, reminders, follow-ups and administrative reporting.", ["re-entering", "data entry", "reminders", "repeating", "automated", "ai assistant"]],
] as const;

const retailRules: readonly Rule[] = [
  ["Customer & Sales CRM", "Capture customer inquiries and orders and keep follow-up in one pipeline.", ["customer", "lead", "order", "follow-up", "sales"]],
  ["Staff Scheduling", "Centralize shift scheduling, coverage and seasonal peaks.", ["schedule", "shift", "staff", "coverage"]],
  ["Store & Fulfillment Operations", "Give staff shared visibility into stock, promotions and order fulfillment.", ["floor", "fulfillment", "stock levels", "promotions", "pickup"]],
  ["Inventory & Merchandise", "Connect reorder points, purchasing, shrinkage and supplier delays.", ["inventory", "stockout", "overstock", "shrinkage", "merchandise"]],
  ["Money & Margins", "Compare pricing and margins against true product-level profitability.", ["cost", "profitability", "margin", "pricing"]],
  ["Customer Experience", "Create a clear customer communication trail for orders, returns and updates.", ["customer", "messages", "status", "returns", "feedback"]],
  ["Vendor & Purchasing", "Connect vendor pricing, delivery tracking and purchase orders.", ["vendor", "purchase", "delivery", "purchase orders"]],
  ["Document Hub", "Keep receipts, contracts and records organized.", ["document", "paper", "folders", "records", "receipts"]],
  ["Automation & AI", "Reduce repeated entry, reminders, follow-ups and administrative reporting.", ["re-entering", "data entry", "reminders", "repeating", "automated", "ai assistant"]],
] as const;

const otherRules: readonly Rule[] = [
  ["Customer & Lead Management", "Capture inquiries and keep follow-up and quotes in one pipeline.", ["lead", "customer", "follow-up", "quote", "referral"]],
  ["Scheduling", "Centralize appointments, jobs and staff availability.", ["schedule", "appointment", "staff"]],
  ["Money & Billing", "Compare pricing and invoicing against true job/sale profitability.", ["cost", "profit", "invoic", "cash flow"]],
  ["Document Hub", "Keep records and paperwork organized in one place.", ["document", "paper", "records", "folders"]],
  ["Automation & AI", "Reduce repeated entry, reminders, follow-ups and administrative reporting.", ["re-entering", "data entry", "reminders", "repeating", "automated"]],
] as const;

const MODULE_RULES: Record<IndustryGroup, readonly Rule[]> = {
  fieldTrades: fieldTradeRules,
  restaurant: restaurantRules,
  retail: retailRules,
  other: otherRules,
};

export function flattenAnswers(answers: Answers) {
  return Object.values(answers)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter(Boolean)
    .join(" | ")
    .toLowerCase();
}

export function getModules(answers: Answers, industry: string = "renovation"): ModuleScore[] {
  const flat = flattenAnswers(answers);
  const rules = MODULE_RULES[industryGroup(industry)];
  return rules
    .map(([name, description, keys]) => {
      const score = keys.filter((key) => flat.includes(key)).length;
      const max = keys.length;
      return { name, description, score, max, percent: max ? Math.round((score / max) * 100) : 0 };
    })
    .sort((a, b) => b.score - a.score);
}

export function getReadiness(answers: Answers, industry: string = "renovation") {
  const modules = getModules(answers, industry);
  const totalSignals = modules.reduce((total, module) => total + module.score, 0);
  return Math.min(98, Math.max(62, 58 + totalSignals * 2));
}

export function getPriorityLabel(score: number, percent: number) {
  if (score >= 4 || percent >= 60) return "High opportunity";
  if (score >= 2 || percent >= 30) return "Medium opportunity";
  return "Lower priority";
}

export function getModuleKeywordMap(industry: string): Record<string, readonly string[]> {
  const rules = MODULE_RULES[industryGroup(industry)];
  return Object.fromEntries(rules.map(([name, , keys]) => [name, keys]));
}

export function getQuestionText(id: string, industry: string = "renovation") {
  for (const section of getSectionsForIndustry(industry)) {
    const question = section.qs.find((item) => item.id === id);
    if (question) return { section: section.title, question: question.q };
  }
  // Fall back to searching every industry's pool — covers admin views that
  // render a mix of businesses without threading each one's industry through.
  return getQuestionTextAnyIndustry(id) || { section: "Other", question: id };
}
