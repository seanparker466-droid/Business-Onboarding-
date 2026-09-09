export type Question =
  | { id: string; type: "single"; q: string; hint: string; opts: readonly string[] }
  | { id: string; type: "multi"; q: string; hint: string; opts: readonly string[] }
  | { id: string; type: "text"; q: string; hint: string; opts?: readonly string[] }
  | { id: string; type: "textarea"; q: string; hint: string; opts?: readonly string[] };

export type Section = {
  id: string;
  title: string;
  desc: string;
  qs: readonly Question[];
};

export const sections: readonly Section[] = [
  {
    "id": "business",
    "title": "Business Profile",
    "desc": "Tell me how the company is structured and how work gets done.",
    "qs": [
      {
        "id": "business_0",
        "type": "single",
        "q": "What best describes the business?",
        "hint": "",
        "opts": [
          "Solo owner/operator",
          "Small contractor team",
          "General contractor with subs",
          "Remodeling/renovation company",
          "Design-build company",
          "Other"
        ]
      },
      {
        "id": "business_1",
        "type": "multi",
        "q": "Who is involved in day-to-day operations?",
        "hint": "Select everyone who touches a job.",
        "opts": [
          "Owner",
          "Office/admin",
          "Estimator/sales",
          "Project manager",
          "Crew/field employees",
          "Subcontractors",
          "Bookkeeper/accountant",
          "Designer"
        ]
      },
      {
        "id": "business_2",
        "type": "multi",
        "q": "Where is work primarily performed?",
        "hint": "",
        "opts": [
          "Residential",
          "Light commercial",
          "Both",
          "New construction",
          "Renovations/additions",
          "Exterior improvements",
          "Decks/patios/outdoor living"
        ]
      }
    ]
  },
  {
    "id": "services",
    "title": "Services",
    "desc": "Help me understand what the business sells and which work drives revenue.",
    "qs": [
      {
        "id": "services_0",
        "type": "multi",
        "q": "Which services are offered?",
        "hint": "",
        "opts": [
          "Decks",
          "Porches",
          "Patios",
          "Pergolas",
          "Fences",
          "Siding",
          "Roofing",
          "Windows/doors",
          "Kitchen remodels",
          "Bathroom remodels",
          "Basements",
          "Additions",
          "General repairs",
          "Other"
        ]
      },
      {
        "id": "services_1",
        "type": "multi",
        "q": "Which services are most important to grow?",
        "hint": "",
        "opts": [
          "Decks/outdoor living",
          "Whole-home renovations",
          "Kitchens",
          "Bathrooms",
          "Additions",
          "Repairs/maintenance",
          "Other"
        ]
      }
    ]
  },
  {
    "id": "daily",
    "title": "Day-to-Day Operations",
    "desc": "Walk me through a normal workday from morning through closeout.",
    "qs": [
      {
        "id": "daily_0",
        "type": "multi",
        "q": "What happens every morning?",
        "hint": "",
        "opts": [
          "Check schedule",
          "Review job notes",
          "Load trucks",
          "Pick up materials",
          "Confirm crews",
          "Call customers",
          "Check weather",
          "Review subcontractors",
          "Handle emergencies",
          "Other"
        ]
      },
      {
        "id": "daily_1",
        "type": "multi",
        "q": "What happens during the workday?",
        "hint": "",
        "opts": [
          "Travel between jobs",
          "Install/build",
          "Answer customer questions",
          "Buy missing materials",
          "Document progress",
          "Take photos",
          "Update schedule",
          "Handle change requests",
          "Coordinate subs",
          "Collect payments"
        ]
      },
      {
        "id": "daily_2",
        "type": "multi",
        "q": "What happens at the end of the day?",
        "hint": "",
        "opts": [
          "Clean up",
          "Take progress photos",
          "Update customer",
          "Update job notes",
          "Record hours",
          "Record materials used",
          "Secure site",
          "Plan next day",
          "Submit receipts"
        ]
      }
    ]
  },
  {
    "id": "sales",
    "title": "Leads & Sales",
    "desc": "Help me understand how a new lead becomes a signed customer.",
    "qs": [
      {
        "id": "sales_0",
        "type": "multi",
        "q": "How do leads arrive?",
        "hint": "",
        "opts": [
          "Website form",
          "Phone",
          "Text",
          "Facebook/Instagram",
          "Google",
          "Referral",
          "Repeat customer",
          "Home show",
          "Email",
          "Other"
        ]
      },
      {
        "id": "sales_1",
        "type": "multi",
        "q": "What happens after a lead arrives?",
        "hint": "",
        "opts": [
          "Call back",
          "Text back",
          "Site visit",
          "Measure",
          "Take photos",
          "Create estimate",
          "Send proposal",
          "Follow up",
          "Schedule consultation",
          "Collect deposit"
        ]
      },
      {
        "id": "sales_2",
        "type": "multi",
        "q": "Where are leads and estimates tracked?",
        "hint": "",
        "opts": [
          "Notebook",
          "Spreadsheet",
          "Email",
          "Text messages",
          "Accounting software",
          "CRM",
          "Project software",
          "Multiple places",
          "Memory/head"
        ]
      }
    ]
  },
  {
    "id": "projects",
    "title": "Project Lifecycle",
    "desc": "Walk me through the full job from signed agreement to completion.",
    "qs": [
      {
        "id": "projects_0",
        "type": "multi",
        "q": "Which steps normally happen after a customer signs?",
        "hint": "",
        "opts": [
          "Contract",
          "Deposit",
          "Create project folder",
          "Create schedule",
          "Order materials",
          "Assign crew",
          "Notify customer",
          "Permits",
          "Subcontractor scheduling",
          "Job kickoff"
        ]
      },
      {
        "id": "projects_1",
        "type": "multi",
        "q": "How is project progress tracked?",
        "hint": "",
        "opts": [
          "Paper",
          "Text messages",
          "Photos",
          "Spreadsheet",
          "Calendar",
          "Project-management app",
          "Accounting software",
          "Memory",
          "Multiple places"
        ]
      },
      {
        "id": "projects_2",
        "type": "multi",
        "q": "What usually triggers a project update?",
        "hint": "",
        "opts": [
          "Daily",
          "Milestones",
          "Customer request",
          "Problem/change",
          "Material delivery",
          "Inspection",
          "Weekly"
        ]
      }
    ]
  },
  {
    "id": "site",
    "title": "Job Site",
    "desc": "Help me understand what your field staff need and what information comes back.",
    "qs": [
      {
        "id": "site_0",
        "type": "multi",
        "q": "What do crews need before arriving?",
        "hint": "",
        "opts": [
          "Address",
          "Scope of work",
          "Plans/drawings",
          "Material list",
          "Special instructions",
          "Customer notes",
          "Photos",
          "Permit information",
          "Contact information"
        ]
      },
      {
        "id": "site_1",
        "type": "multi",
        "q": "What gets captured from the job site?",
        "hint": "",
        "opts": [
          "Photos",
          "Hours",
          "Materials used",
          "Measurements",
          "Issues",
          "Change orders",
          "Customer requests",
          "Inspection notes",
          "Completion status"
        ]
      },
      {
        "id": "site_2",
        "type": "multi",
        "q": "How are job-site updates sent back?",
        "hint": "",
        "opts": [
          "Text",
          "Phone call",
          "Email",
          "App",
          "Paper",
          "Shared photos",
          "End-of-day report",
          "They usually aren't"
        ]
      }
    ]
  },
  {
    "id": "materials",
    "title": "Materials & Inventory",
    "desc": "Help me find where money and time are lost in materials.",
    "qs": [
      {
        "id": "materials_0",
        "type": "multi",
        "q": "How are materials planned?",
        "hint": "",
        "opts": [
          "Takeoff",
          "Estimate list",
          "Spreadsheet",
          "Handwritten list",
          "Software",
          "Supplier quote",
          "Experience"
        ]
      },
      {
        "id": "materials_1",
        "type": "multi",
        "q": "How are materials purchased?",
        "hint": "",
        "opts": [
          "Owner",
          "Office",
          "Project manager",
          "Crew member",
          "Customer",
          "Multiple people"
        ]
      },
      {
        "id": "materials_2",
        "type": "multi",
        "q": "What inventory/material problems occur?",
        "hint": "",
        "opts": [
          "Missing material",
          "Wrong material",
          "Over-ordering",
          "Under-ordering",
          "Lost receipts",
          "No stock visibility",
          "Unused leftovers",
          "Emergency store runs",
          "Delivery problems"
        ]
      }
    ]
  },
  {
    "id": "vendors",
    "title": "Vendors & Purchasing",
    "desc": "Help me understand supplier relationships, pricing and your purchasing workflow.",
    "qs": [
      {
        "id": "vendors_0",
        "type": "multi",
        "q": "Where are purchases recorded?",
        "hint": "",
        "opts": [
          "Accounting software",
          "Receipts",
          "Spreadsheet",
          "Email",
          "Vendor portal",
          "Text messages",
          "Not consistently"
        ]
      },
      {
        "id": "vendors_1",
        "type": "multi",
        "q": "What would help most?",
        "hint": "",
        "opts": [
          "Preferred vendor list",
          "Price comparison",
          "Purchase orders",
          "Material approvals",
          "Delivery tracking",
          "Job allocation",
          "Receipt capture",
          "Vendor history"
        ]
      }
    ]
  },
  {
    "id": "people",
    "title": "People & Scheduling",
    "desc": "Help me map employees, subs and scheduling dependencies.",
    "qs": [
      {
        "id": "people_0",
        "type": "multi",
        "q": "How are people scheduled?",
        "hint": "",
        "opts": [
          "Paper calendar",
          "Phone calendar",
          "Google Calendar",
          "Text messages",
          "Spreadsheet",
          "Project app",
          "Whiteboard",
          "Memory"
        ]
      },
      {
        "id": "people_1",
        "type": "multi",
        "q": "What makes scheduling difficult?",
        "hint": "",
        "opts": [
          "Weather",
          "Material delays",
          "Customer changes",
          "Sub availability",
          "Crew availability",
          "Permits",
          "Too many jobs",
          "Travel time",
          "Emergencies"
        ]
      },
      {
        "id": "people_2",
        "type": "multi",
        "q": "What should scheduling show?",
        "hint": "",
        "opts": [
          "Crew",
          "Job",
          "Address",
          "Scope",
          "Materials ready",
          "Customer contact",
          "Start date",
          "Due date",
          "Weather",
          "Subcontractors"
        ]
      }
    ]
  },
  {
    "id": "money",
    "title": "Money & Job Costing",
    "desc": "Help me understand estimating, invoicing and profitability.",
    "qs": [
      {
        "id": "money_0",
        "type": "multi",
        "q": "How are estimates created?",
        "hint": "",
        "opts": [
          "Spreadsheet",
          "Accounting software",
          "Estimating software",
          "Templates",
          "Handwritten",
          "Project software",
          "Other"
        ]
      },
      {
        "id": "money_1",
        "type": "multi",
        "q": "How are job costs tracked?",
        "hint": "",
        "opts": [
          "Not tracked",
          "Spreadsheet",
          "Accounting software",
          "Project software",
          "Receipts manually",
          "Estimated after completion",
          "Multiple places"
        ]
      },
      {
        "id": "money_2",
        "type": "multi",
        "q": "What financial visibility is missing?",
        "hint": "",
        "opts": [
          "True job profit",
          "Labor cost",
          "Material cost",
          "Subcontractor cost",
          "Change-order profit",
          "Outstanding invoices",
          "Cash flow",
          "Estimated vs actual"
        ]
      }
    ]
  },
  {
    "id": "communication",
    "title": "Communication",
    "desc": "Help me find where important information gets lost.",
    "qs": [
      {
        "id": "communication_0",
        "type": "multi",
        "q": "How do customers communicate?",
        "hint": "",
        "opts": [
          "Phone",
          "Text",
          "Email",
          "Facebook",
          "Website",
          "In person"
        ]
      },
      {
        "id": "communication_1",
        "type": "multi",
        "q": "How does the team communicate?",
        "hint": "",
        "opts": [
          "Text group",
          "Individual texts",
          "Phone",
          "Email",
          "App",
          "In person",
          "Whiteboard"
        ]
      },
      {
        "id": "communication_2",
        "type": "multi",
        "q": "What communication problems happen?",
        "hint": "",
        "opts": [
          "Missed messages",
          "Wrong person gets message",
          "No history",
          "Slow responses",
          "Customer asks for updates",
          "Schedule changes missed",
          "Information buried in texts"
        ]
      }
    ]
  },
  {
    "id": "documents",
    "title": "Documents & Records",
    "desc": "Help me understand how project information is stored.",
    "qs": [
      {
        "id": "documents_0",
        "type": "multi",
        "q": "What documents are created?",
        "hint": "",
        "opts": [
          "Contracts",
          "Estimates",
          "Invoices",
          "Change orders",
          "Plans",
          "Permits",
          "Receipts",
          "Warranty info",
          "Photos",
          "Inspection records"
        ]
      },
      {
        "id": "documents_1",
        "type": "multi",
        "q": "Where are they stored?",
        "hint": "",
        "opts": [
          "Paper",
          "Computer folders",
          "Google Drive",
          "OneDrive",
          "Email",
          "Accounting software",
          "Project software",
          "Customer phone",
          "Multiple places"
        ]
      }
    ]
  },
  {
    "id": "website",
    "title": "Website & Marketing",
    "desc": "Help me understand what your website needs to accomplish.",
    "qs": [
      {
        "id": "website_0",
        "type": "multi",
        "q": "What should the website do?",
        "hint": "",
        "opts": [
          "Generate leads",
          "Show completed work",
          "Explain services",
          "Build trust",
          "Allow estimate requests",
          "Schedule consultations",
          "Collect project details",
          "Show service areas",
          "Answer common questions"
        ]
      },
      {
        "id": "website_1",
        "type": "multi",
        "q": "What builds customer trust?",
        "hint": "",
        "opts": [
          "Project photos",
          "Reviews",
          "Before/after",
          "Years in business",
          "Licensing/insurance",
          "Guarantees",
          "Clear process",
          "Meet the team",
          "Local reputation"
        ]
      }
    ]
  },
  {
    "id": "pain",
    "title": "Pain Points",
    "desc": "Help me identify the bottlenecks worth automating first.",
    "qs": [
      {
        "id": "pain_0",
        "type": "multi",
        "q": "Where is the business losing the most time?",
        "hint": "",
        "opts": [
          "Scheduling",
          "Estimating",
          "Customer follow-up",
          "Material purchasing",
          "Driving/store runs",
          "Data entry",
          "Finding information",
          "Job-site reporting",
          "Invoicing",
          "Bookkeeping",
          "Document management"
        ]
      },
      {
        "id": "pain_1",
        "type": "multi",
        "q": "What happens too often?",
        "hint": "",
        "opts": [
          "Repeating information",
          "Searching for texts",
          "Re-entering data",
          "Forgetting follow-ups",
          "Missing receipts",
          "Last-minute material runs",
          "Schedule conflicts",
          "Customer status calls",
          "Unclear job status"
        ]
      },
      {
        "id": "pain_2",
        "type": "multi",
        "q": "How severe are the operational problems overall?",
        "hint": "",
        "opts": [
          "Minor",
          "Noticeable",
          "Costly",
          "Very costly",
          "Business is being held back"
        ]
      }
    ]
  },
  {
    "id": "future",
    "title": "Future System",
    "desc": "Design the software around the business\u2014not the other way around.",
    "qs": [
      {
        "id": "future_0",
        "type": "multi",
        "q": "Which features would be most valuable?",
        "hint": "",
        "opts": [
          "Lead CRM",
          "Estimate builder",
          "Proposal generator",
          "Project dashboard",
          "Scheduling",
          "Crew mobile app",
          "Material/inventory tracking",
          "Purchasing",
          "Job costing",
          "Invoicing",
          "Customer portal",
          "Photo/job diary",
          "Document hub",
          "Automated reminders",
          "AI assistant"
        ]
      },
      {
        "id": "future_1",
        "type": "multi",
        "q": "What should the owner see on one dashboard?",
        "hint": "",
        "opts": [
          "Today's jobs",
          "Crew locations/status",
          "Upcoming jobs",
          "Open leads",
          "Estimates awaiting response",
          "Materials needed",
          "Invoices due",
          "Cash flow",
          "Job profitability",
          "Customer messages",
          "Problems requiring attention"
        ]
      },
      {
        "id": "future_2",
        "type": "textarea",
        "q": "If you could eliminate one frustrating part of the business tomorrow, what would it be?",
        "hint": "This is the most valuable free-form answer in the assessment.",
        "opts": []
      }
    ]
  }
] as const;
