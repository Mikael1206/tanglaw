/**
 * Scholarship data contract used by backend mock data and frontend responses.
 */
export interface Scholarship {
  id: string;
  title: string;
  description: string;
  category: string;
  amount: string;
  eligibility: string[];
  deadline: string;
}
