/**
 * Tool definitions exposed to the AI agent for scholarship lookups.
 * These tools query the local Prisma database and return structured results.
 */
import { getPrisma } from "@/lib/db";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const searchScholarships = tool(
  async ({ gwa, sector, program }) => {
    try {
      const prisma = getPrisma();
      const scholarships = await prisma.scholarship.findMany({
        where: {
          minGwa: {
            gte: gwa,
          },
          sector: sector as "PUBLIC" | "PRIVATE",
          programCategories: {
            has: program,
          },
        },
      });
      return JSON.stringify(scholarships);
    } catch (error) {
      return `Error searching scholarships: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
  {
    name: "searchScholarships",
    description: "Search for scholarships based on a student's GWA, sector preference, and study program.",
    schema: z.object({
      gwa: z.number().describe("The student's General Weighted Average (GWA)."),
      sector: z.enum(["PUBLIC", "PRIVATE"]).describe("The scholarship sector: 'PUBLIC' or 'PRIVATE'."),
      program: z.string().describe("The student's study program/category (e.g., 'STEM', 'Engineering')."),
    }),
  }
);

export const getScholarshipDetails = tool(
  async ({ name }) => {
    try {
      const prisma = getPrisma();
      const scholarship = await prisma.scholarship.findFirst({
        where: {
          name: {
            equals: name,
            mode: "insensitive",
          },
        },
        select: {
          requirements: true,
          benefits: true,
        },
      });

      if (!scholarship) {
        return `Scholarship with name "${name}" not found.`;
      }

      return JSON.stringify(scholarship);
    } catch (error) {
      return `Error fetching scholarship details: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
  {
    name: "getScholarshipDetails",
    description: "Retrieve the specific requirements and benefits of a scholarship by its name.",
    schema: z.object({
      name: z.string().describe("The exact or close name of the scholarship."),
    }),
  }
);
