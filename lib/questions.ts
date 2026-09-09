import type { Question, Section } from "./types";
import { getOperationalSections, type IndustryId } from "./industries";

export type { Question, Section };

/** These 5 sections already work for any business and are shared by every industry. */
export const universalSections: readonly Section[] = [
  {
    id: "communication",
    title: "Communication",
    desc: "Help me find where important information gets lost.",
    qs: [
      { id: "communication_0", type: "multi", q: "How do customers communicate?", hint: "", opts: [
        "Phone", "Text", "Email", "Facebook", "Website", "In person",
      ]},
      { id: "communication_1", type: "multi", q: "How does the team communicate?", hint: "", opts: [
        "Text group", "Individual texts", "Phone", "Email", "App", "In person", "Whiteboard",
      ]},
      { id: "communication_2", type: "multi", q: "What communication problems happen?", hint: "", opts: [
        "Missed messages", "Wrong person gets message", "No history", "Slow responses",
        "Customer asks for updates", "Schedule changes missed", "Information buried in texts",
      ]},
    ],
  },
  {
    id: "documents",
    title: "Documents & Records",
    desc: "Help me understand how business information is stored.",
    qs: [
      { id: "documents_0", type: "multi", q: "What documents/records are created?", hint: "", opts: [
        "Contracts", "Estimates/quotes", "Invoices", "Change orders", "Plans/drawings",
        "Permits", "Receipts", "Warranty info", "Photos", "Inspection records",
      ]},
      { id: "documents_1", type: "multi", q: "Where are they stored?", hint: "", opts: [
        "Paper", "Computer folders", "Google Drive", "OneDrive", "Email",
        "Accounting software", "Project/POS software", "Customer phone", "Multiple places",
      ]},
    ],
  },
  {
    id: "website",
    title: "Website & Marketing",
    desc: "Help me understand your current online presence and what your website needs to accomplish.",
    qs: [
      { id: "website_0", type: "single", q: "Do you currently have a website?", hint: "", opts: [
        "Yes, and it's up to date", "Yes, but it's outdated", "No", "Not sure",
      ]},
      { id: "website_1", type: "multi", q: "Which marketing channels do you currently use?", hint: "", opts: [
        "Google Ads", "Facebook/Instagram ads", "SEO", "Email marketing",
        "Print/local ads", "Referral program", "None",
      ]},
      { id: "website_2", type: "single", q: "What do you currently spend on marketing/ads per month?", hint: "", opts: [
        "None", "Under $500", "$500-$2,000", "$2,000-$5,000", "$5,000+", "Not sure",
      ]},
      { id: "website_3", type: "multi", q: "What should the website do?", hint: "", opts: [
        "Generate leads", "Show completed work/products", "Explain services",
        "Build trust", "Allow online requests/orders", "Schedule appointments",
        "Collect project/order details", "Show service areas/locations", "Answer common questions",
      ]},
      { id: "website_4", type: "multi", q: "What builds customer trust?", hint: "", opts: [
        "Photos/portfolio", "Reviews", "Before/after", "Years in business",
        "Licensing/insurance", "Guarantees", "Clear process", "Meet the team", "Local reputation",
      ]},
    ],
  },
  {
    id: "pain",
    title: "Pain Points",
    desc: "Help me identify the bottlenecks worth automating first.",
    qs: [
      { id: "pain_0", type: "multi", q: "Where is the business losing the most time?", hint: "", opts: [
        "Scheduling", "Estimating/quoting", "Customer follow-up", "Purchasing",
        "Driving/store runs", "Data entry", "Finding information", "Field/floor reporting",
        "Invoicing", "Bookkeeping", "Document management",
      ]},
      { id: "pain_1", type: "multi", q: "What happens too often?", hint: "", opts: [
        "Repeating information", "Searching for texts", "Re-entering data",
        "Forgetting follow-ups", "Missing receipts", "Last-minute runs",
        "Schedule conflicts", "Customer status calls", "Unclear status",
      ]},
      { id: "pain_2", type: "single", q: "How severe are the operational problems overall?", hint: "", opts: [
        "Minor", "Noticeable", "Costly", "Very costly", "Business is being held back",
      ]},
    ],
  },
  {
    id: "future",
    title: "Future System",
    desc: "Design the software around the business—not the other way around.",
    qs: [
      { id: "future_0", type: "multi", q: "Which features would be most valuable?", hint: "", opts: [
        "Lead CRM", "Estimate/quote builder", "Proposal generator", "Project/order dashboard",
        "Scheduling", "Mobile app for staff", "Inventory tracking", "Purchasing", "Job/product costing",
        "Invoicing", "Customer portal", "Photo/job diary", "Document hub",
        "Automated reminders", "AI assistant",
      ]},
      { id: "future_1", type: "multi", q: "What should the owner see on one dashboard?", hint: "", opts: [
        "Today's jobs/orders", "Staff locations/status", "Upcoming jobs", "Open leads",
        "Estimates awaiting response", "Materials/inventory needed", "Invoices due",
        "Cash flow", "Profitability", "Customer messages", "Problems requiring attention",
      ]},
      { id: "future_2", type: "single", q: "What budget range would you expect for a new system?", hint: "", opts: [
        "Under $2,000", "$2,000-$5,000", "$5,000-$15,000", "$15,000+", "Not sure yet",
      ]},
      { id: "future_3", type: "text", q: "Is there a deadline or event driving this?", hint: "Optional — leave blank if there isn't one.", opts: [] },
      { id: "future_4", type: "textarea", q: "If you could eliminate one frustrating part of the business tomorrow, what would it be?", hint: "This is the most valuable free-form answer in the assessment.", opts: [] },
    ],
  },
] as const;

/** Full section list for a given industry: that industry's operational sections + the universal ones. */
export function getSectionsForIndustry(industry: string): Section[] {
  return [...getOperationalSections(industry), ...universalSections];
}

/** Search every industry's question pool for a given question id (used by admin, which doesn't
 * always have the owning business's industry pre-resolved everywhere it needs question text). */
export function getQuestionTextAnyIndustry(id: string): { section: string; question: string } | null {
  for (const industry of ["renovation", "roofing", "siding", "landscaping", "restaurant", "retail", "other"] as IndustryId[]) {
    for (const section of getSectionsForIndustry(industry)) {
      const question = section.qs.find((item) => item.id === id);
      if (question) return { section: section.title, question: question.q };
    }
  }
  return null;
}
