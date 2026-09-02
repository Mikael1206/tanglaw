/**
 * Canonical type for a scholarship opportunity displayed in the browser UI.
 * Used by ScholarshipBrowser, ScholarshipCard, and related components.
 */
export const OSFA_SCHOLARSHIPS: ScholarshipOpportunity[] = [
  {
    name: "A Better Chance Scholarship",
    provider: "A Better Chance Foundation Inc",
    coverageType: "Partial Coverage",
    classification: "Private",
    strand: "All Strand",
    overview:
      "The A Better Chance Foundation Scholarship Program, in partnership with the Polytechnic University of the Philippines (PUP), provides support to students from low-income families. Its goal is to help them continue their education and achieve their goals.",
    coverageDetails: "Educational financial assistance per MOA",
    eligibility: {
      minimumGPA: "2.00 (85%)",
      financialStatus: "Must come from a financially disadvantaged family.",
      exclusivity: "Must not be a recipient of any other scholarship program.",
    },
    priorityPrograms: [
      "Journalism",
      "Information Technology",
      "Office Management",
      "Finance Management",
      "Engineering",
      "Health Sciences",
      "HRM",
    ],
    requirements: [
      "Copy of latest academic records",
      "PUP Certificate of Registration (COR)",
      "Proof of Financial Status",
      "Personal Data Sheet (PDS)",
    ],
    examInformation: { type: "Interview" },
    deadline: "Subject to deadline set by the benefactor",
    links: ["https://www.facebook.com/abetterchancefoundation2001/"],
  },
  {
    name: "Chinese Filipino Business Club Scholarship",
    provider: "Chinese Filipino Business Club, Inc.",
    coverageType: "Partial Coverage",
    classification: "Private",
    strand: "All Strand",
    overview:
      "Chinese-Filipino Business Club, Inc. (CFBCI) is one of the prominent non-profit organizations in the Filipino-Chinese community with a membership of more than 300 individuals of the Sino-Filipino community.",
    coverageDetails: "Educational financial assistance per MOA",
    eligibility: {
      financialStatus: "Must come from a financially disadvantaged family.",
      minimumGPA: "2.00 (85%)",
    },
    priorityPrograms: [
      "Architecture",
      "Accounting",
      "Engineering",
      "Education (Major in Math & English)",
    ],
    requirements: [
      "Accomplished Application Form",
      "Certified true copy of grades",
      "If incoming college student, photocopy of college admission notice.",
      "Copies of utility bills",
      "Autobiography",
      "Photos of inside and outside of residence",
      "Sketch of home address.",
      "Recommendation from Office of Student Affairs or High School Principal.",
    ],
    examInformation: { type: "None" },
    deadline: "May 30, 2026",
    links: [
      "https://cfbci.ph/",
      "https://www.facebook.com/share/p/1Emv5CjNo8/",
    ],
  },
  {
    name: "JAPRL Foundation Scholarship",
    provider: "JAPRL Foundation Inc.",
    coverageType: "Partial Coverage",
    classification: "Private",
    strand: "All Strand",
    overview:
      "Non-profit organization that provides scholarship grants and learning opportunities to financially challenged individuals",
    coverageDetails:
      "Weekly transportation allowance, books, projects, and other school related fees.",
    eligibility: {
      financialStatus: "Must come from a financially disadvantaged family.",
      minimumGPA: "2.00 (85%)",
    },
    priorityPrograms: ["Open to all Programs"],
    requirements: [
      "Complete Grades",
      "Registration Form",
      "Application Form",
      "Intake Interview Form",
      "Current utility bill",
      "OSFA Recommendation",
      "Sketch of address",
    ],
    examInformation: { type: "Interview" },
    deadline: "Subject to deadline set by the benefactor",
    links: ["https://www.facebook.com/japrlfoundation.inc"],
  },
  {
    name: "Megaworld Foundation Scholarship",
    provider: "Megaworld Foundation",
    coverageType: "Partial Coverage",
    classification: "Private",
    strand: "All Strand",
    overview:
      "The Megaworld Foundation Scholarship Program has been helping lots of students achieve their dreams for a long time. They believe education can change lives, so they support 1,000 students in 76 schools in Metro Manila and other places.",
    coverageDetails:
      "Semestral allowance, training and seminars, internship opportunities, and career opportunities.",
    eligibility: {
      minimumGPA: "General average of 85% with no grade lower than 80%",
      exclusivity: "Must not be a recipient of any other scholarship program.",
      financialStatus: "Annual household income must not exceed Php 400,000",
      residency: "Must be resident near any Megaworld township or project",
    },
    priorityPrograms: [
      "Accounting Technology",
      "Tourism Management",
      "Accounting Information System",
      "Supply Management",
      "Advertising and Public Relations",
      "Operations Management",
      "Architecture",
      "Management Accounting",
      "Business Administration",
      "Interior Design",
      "Business Economics",
      "Industrial Engineering",
      "Financial Management",
      "Hospitality Management",
    ],
    requirements: [
      "Current Registration/Enrollment Form",
      "Complete Report of Grades",
      "Barangay Certificate of Residency (Applicant)",
      "Proof of Parents' Financial Ability",
      "Birth Certificate",
      "House Photos",
      "Photograph of applicant with family/guardian",
      "Latest utility bills",
      "Official School ID",
    ],
    examInformation: { type: "Interview" },
    deadline: "Application Start: February 11, 2026. Deadline: February 28, 2026",
    links: [
      "https://www.megaworldfoundation.com/scholarship_program",
      "https://www.facebook.com/officialmegaworldcorp",
    ],
  },
];

export interface ScholarshipOpportunity {
  name: string;
  provider: string;
  coverageType: string;
  classification: string;
  strand: string;
  overview: string;
  coverageDetails: string;
  eligibility: Record<string, string | undefined>;
  priorityPrograms: string[];
  requirements: string[];
  examInformation: { type: string };
  deadline: string;
  links: string[];
}
