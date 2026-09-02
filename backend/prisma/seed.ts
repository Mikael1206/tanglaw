import { Sector } from "@prisma/client";
import prisma from "../src/services/prismaClient";
import { SCHOLARSHIPS_DATA } from "../../frontend/src/data/canonical-scholarships";

interface ScholarshipSeed {
  name: string;
  provider: string;
  sector: Sector;
  incomeBracket: number;
  programCategories: string[];
  minGwa: number;
  requirements: string;
  benefits: string;
  returnService: boolean;
  link: string;
}

const extractIncomeBracket = (value?: string): number => {
  const match = value?.match(/\b(?:Php|₱)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.\d+)?)/i);
  return match ? Number(match[1].replace(/,/g, "")) : 0;
};

const extractMinGwa = (value?: string): number => {
  const match = value?.match(/(\d+(?:\.\d+)?)%/);
  return match ? Number(match[1]) : 0;
};

const toSector = (classification: string): Sector => (/national government|government/i.test(classification) ? "PUBLIC" : "PRIVATE");

async function main() {
  const scholarships: ScholarshipSeed[] = SCHOLARSHIPS_DATA.map((item) => ({
    name: item.name,
    provider: item.provider,
    sector: toSector(item.classification),
    incomeBracket: extractIncomeBracket(item.eligibility.financialStatus ?? item.coverageDetails ?? item.overview),
    programCategories: item.priorityPrograms.length ? item.priorityPrograms : ["Any"],
    minGwa: extractMinGwa(item.eligibility.minimumGPA),
    requirements: item.requirements.join("\n"),
    benefits: item.coverageDetails || item.overview,
    returnService: /return service|commitment/i.test(`${item.coverageDetails} ${item.overview}`),
    link: item.links[0] ?? "",
  }));

  console.log(`Seeding ${scholarships.length} scholarships...`);

  // Clear existing scholarship rows and insert canonical prototype data.
  await prisma.scholarship.deleteMany();

  for (const scholarship of scholarships) {
    await prisma.scholarship.create({
      data: {
        name: scholarship.name,
        provider: scholarship.provider,
        sector: scholarship.sector,
        incomeBracket: String(scholarship.incomeBracket),
        programCategories: scholarship.programCategories,
        minGwa: scholarship.minGwa,
        requirements: scholarship.requirements,
        benefits: scholarship.benefits,
        returnService: scholarship.returnService,
        link: scholarship.link,
      },
    });
  }

  console.log(`✅ Seeded ${scholarships.length} scholarship records successfully.`);
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
