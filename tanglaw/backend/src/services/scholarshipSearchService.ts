/**
 * Scholarship search service for the Owel RAG chatbot.
 *
 * Replaces the old file-based vector store with direct PostgreSQL queries.
 * Uses ILIKE text search across scholarship fields to find relevant records,
 * then formats them as structured context text for the LLM.
 */
import prisma from "./prismaClient";

export interface FormattedScholarship {
  name: string;
  provider: string;
  sector: string;
  incomeBracket: string;
  programCategories: string[];
  minGwa: number;
  requirements: string[];
  benefits: string[];
  returnService: boolean;
  link: string;
}

/**
 * Search scholarships by text query across name, provider, benefits, and requirements.
 * Returns top N matches formatted as readable context for the LLM.
 */
export async function searchScholarshipsAsContext(
  query: string,
  topK: number = 8
): Promise<string> {
  const sanitized = query.replace(/[%_]/g, "\\$&"); // escape LIKE wildcards

  const records = await prisma.scholarship.findMany({
    where: {
      OR: [
        { name: { contains: sanitized, mode: "insensitive" } },
        { provider: { contains: sanitized, mode: "insensitive" } },
        { benefits: { contains: sanitized, mode: "insensitive" } },
        { requirements: { contains: sanitized, mode: "insensitive" } },
      ],
    },
    take: topK,
    orderBy: { name: "asc" },
  });

  if (records.length === 0) {
    // Fallback: if no matches, return all scholarships so the LLM can still answer
    const all = await prisma.scholarship.findMany({
      take: topK,
      orderBy: { name: "asc" },
    });
    const formatted = all.map(formatScholarshipRecord);
    return formatted.join("\n\n---\n\n");
  }

  return records.map(formatScholarshipRecord).join("\n\n---\n\n");
}

/**
 * Format a single scholarship DB record into human-readable text for the LLM context.
 */
function formatScholarshipRecord(
  record: {
    name: string;
    provider: string;
    sector: string;
    incomeBracket: string;
    programCategories: string[];
    minGwa: number;
    requirements: string;
    benefits: string;
    returnService: boolean;
    link: string;
  }
): string {
  const lines: string[] = [];

  lines.push(`**${record.name}**`);
  lines.push(`Provider: ${record.provider}`);
  lines.push(`Sector: ${record.sector === "PUBLIC" ? "Public" : "Private"}`);

  const income = Number(record.incomeBracket);
  if (income > 0) {
    lines.push(`Maximum Family Income: ₱${income.toLocaleString()}/year`);
  } else {
    lines.push(`Maximum Family Income: No income limit`);
  }

  if (record.programCategories.length > 0) {
    const programs = record.programCategories.join(", ");
    lines.push(`Priority Programs: ${programs === "Any" ? "All programs / Any" : programs}`);
  }

  if (record.minGwa > 0) {
    // Some use percentage (85), some use GPA scale — preserve original format
    lines.push(`Minimum GWA: ${record.minGwa >= 75 ? `${record.minGwa}%` : `${record.minGwa.toFixed(2)}`}`);
  } else {
    lines.push(`Minimum GWA: None specified`);
  }

  lines.push(`Return of Service: ${record.returnService ? "Yes — required after graduation" : "No"}`);

  if (record.requirements.trim()) {
    lines.push(`\\nRequirements:`);
    const reqs = record.requirements
      .split(/\r?\n/)
      .map((r) => r.trim())
      .filter(Boolean);
    for (const req of reqs) {
      lines.push(`- ${req}`);
    }
  }

  if (record.benefits.trim()) {
    lines.push(`\\nBenefits:`);
    const benefits = record.benefits
      .split(/\r?\n/)
      .map((b) => b.trim())
      .filter(Boolean);
    for (const benefit of benefits) {
      lines.push(`- ${benefit}`);
    }
  }

  if (record.link) {
    lines.push(`\\nApplication URL: ${record.link}`);
  }

  return lines.join("\n");
}

/**
 * Get all scholarships as formatted context (for cases where no specific query is given).
 */
export async function getAllScholarshipsAsContext(): Promise<string> {
  const all = await prisma.scholarship.findMany({
    orderBy: { name: "asc" },
  });

  if (all.length === 0) {
    return "No scholarship records found in the database.";
  }

  return all.map(formatScholarshipRecord).join("\n\n---\n\n");
}
