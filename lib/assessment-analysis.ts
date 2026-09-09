import { sections } from "./questions";

export type Answers = Record<string, string[] | string>;

export type ModuleScore = {
  name: string;
  description: string;
  score: number;
  max: number;
  percent: number;
};

const rules = [
  ["Scheduling & Dispatch", "Centralize crew assignments, job timing, material readiness, weather and changes.", ["schedule", "scheduling", "crew", "weather", "schedule conflicts"]],
  ["Lead & Sales CRM", "Capture leads, automate follow-up and keep estimates and proposals in one pipeline.", ["lead", "estimate", "follow-up", "proposal", "sales"]],
  ["Project Management", "Create one source of truth from signed contract through completion and warranty.", ["project", "progress", "job status", "contract", "milestones"]],
  ["Materials & Purchasing", "Connect material lists, purchasing, delivery status, receipts and job allocation.", ["material", "purchasing", "receipts", "store runs", "delivery"]],
  ["Job Costing", "Compare estimated and actual labor, materials and subcontractor costs.", ["cost", "profitability", "labor", "invoicing", "bookkeeping"]],
  ["Field Operations", "Give crews mobile access to job instructions, photos, hours, issues and daily reports.", ["job-site", "photos", "hours", "field", "crew"]],
  ["Customer Experience", "Create a clear customer communication trail for updates, approvals and scheduling.", ["customer", "messages", "status", "communication", "follow-up"]],
  ["Document Hub", "Keep contracts, permits, photos, receipts, change orders and warranty records organized.", ["document", "paper", "folders", "permits", "records"]],
  ["Automation & AI", "Reduce repeated entry, reminders, follow-ups and administrative reporting.", ["re-entering", "data entry", "reminders", "repeating", "automated", "AI assistant"]],
] as const;

export function flattenAnswers(answers: Answers) {
  return Object.values(answers)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter(Boolean)
    .join(" | ")
    .toLowerCase();
}

export function getModules(answers: Answers): ModuleScore[] {
  const flat = flattenAnswers(answers);
  return rules
    .map(([name, description, keys]) => {
      const score = keys.filter((key) => flat.includes(key)).length;
      const max = keys.length;
      return { name, description, score, max, percent: max ? Math.round((score / max) * 100) : 0 };
    })
    .sort((a, b) => b.score - a.score);
}

export function getReadiness(answers: Answers) {
  const modules = getModules(answers);
  const totalSignals = modules.reduce((total, module) => total + module.score, 0);
  return Math.min(98, Math.max(62, 58 + totalSignals * 2));
}

export function getPriorityLabel(score: number, percent: number) {
  if (score >= 4 || percent >= 60) return "High opportunity";
  if (score >= 2 || percent >= 30) return "Medium opportunity";
  return "Lower priority";
}

export function getQuestionText(id: string) {
  for (const section of sections) {
    const question = section.qs.find((item) => item.id === id);
    if (question) return { section: section.title, question: question.q };
  }
  return { section: "Other", question: id };
}
