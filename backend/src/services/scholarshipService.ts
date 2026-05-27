import { Scholarship } from "../models/scholarship";

/**
 * Service layer for scholarships.
 * This file returns a fixed set of mock scholarships for frontend demonstration.
 */
export function getMockScholarships(): Scholarship[] {
  return [
    {
      id: "scholarship-001",
      title: "PUP Academic Excellence Grant",
      description: "A merit-based scholarship for high-performing students in PUP Manila.",
      category: "Merit",
      amount: "₱20,000",
      eligibility: ["GPA 1.75 or better", "Enrolled in BSCS or related program"],
      deadline: "2026-09-15",
    },
    {
      id: "scholarship-002",
      title: "Filipino STEM Opportunity Fund",
      description: "Support for STEM learners pursuing undergraduate degrees in science and technology.",
      category: "Need-Based",
      amount: "₱35,000",
      eligibility: ["Philippine citizen", "Household income below regional threshold"],
      deadline: "2026-10-01",
    },
  ];
}
