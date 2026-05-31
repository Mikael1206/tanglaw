import prisma from "../src/services/prismaClient";

async function main() {
  const scholarships = [
    {
      name: "DOST-SEI Undergraduate Scholarship",
      provider: "Department of Science and Technology",
      sector: "PUBLIC",
      incomeBracket: 0,
      programCategories: ["STEM"],
      minGwa: 85,
      requirements: "Natural-born Filipino citizen\nGWA of 85% or higher\nBelongs to STEM strand in high school (or top 5% of non-STEM class)\nMust pass the DOST-SEI exam",
      benefits: "Full Tuition & school fees coverage (up to ₱40,000/yr)\nMonthly Living Allowance (₱7,000/month)\nBook & transportation subsidies\nGroup health insurance",
      returnService: true,
      link: "https://www.sei.dost.gov.ph",
    },
    {
      name: "CHED Merit Scholarship Program (CMSP)",
      provider: "Commission on Higher Education",
      sector: "PUBLIC",
      incomeBracket: 400000,
      programCategories: ["Any"],
      minGwa: 90,
      requirements: "Filipino citizen\nCombined family income of ₱400,000 or below\nGeneral Weighted Average (GWA) of 90% or above",
      benefits: "Full Tuition subsidy (up to ₱120,000/yr for private; free in SUCs)\nStipend of ₱80,000 per academic year\nBook and study grant allowance",
      returnService: false,
      link: "https://ched.gov.ph",
    },
    {
      name: "SM Foundation College Scholarship",
      provider: "SM Foundation",
      sector: "PRIVATE",
      incomeBracket: 250000,
      programCategories: ["STEM"],
      minGwa: 88,
      requirements: "Graduate of public high schools or SM-partner private schools\nAnnual family income not exceeding ₱250,000\nGeneral Weighted Average (GWA) of 88% or above in Grade 12",
      benefits: "Full Tuition & matriculation coverage\nMonthly living stipend\nExclusive part-time job opportunities during breaks\nAssured placement in SM Group of Companies after graduation",
      returnService: false,
      link: "https://www.sm-foundation.org",
    },
    {
      name: "Manila City Educational Assistance",
      provider: "City Government of Manila",
      sector: "PUBLIC",
      incomeBracket: 200000,
      programCategories: ["Any"],
      minGwa: 0,
      requirements: "Resident of Manila City for at least 3 years\nEnrolled in state colleges/universities (SUCs) or local colleges\nParent must be a registered voter in Manila",
      benefits: "₱5,000 educational cash aid per semester\nPriority in local government internship positions",
      returnService: false,
      link: "https://manila.gov.ph",
    },
    {
      name: "Mega-Tech Computer Science Scholarship",
      provider: "Mega-Tech Group Philippines",
      sector: "PRIVATE",
      incomeBracket: 0,
      programCategories: ["STEM"],
      minGwa: 0,
      requirements: "Incoming 1st year BSCS, BSIT, or BSCpE student\nMust maintain a semester GWA of 1.75 or better\nActive portfolio showing mini coding projects is highly prioritized",
      benefits: "100% Tuition & miscellaneous fees covered\nTech-pack allowance (high-spec laptop and accessories)\nGuaranteed internship and 2-year employment contract after college",
      returnService: true,
      link: "https://megatech-grants.org",
    },
    {
      name: "Health-Care Alliance Foundation Grant",
      provider: "Health-Care Alliance PH",
      sector: "PRIVATE",
      incomeBracket: 300000,
      programCategories: ["Medical-Allied"],
      minGwa: 0,
      requirements: "Currently enrolled in Nursing, MedTech, or Pharmacy program\nAnnual household income below ₱300,000\nMaintain a GPA of 2.25 or higher without failing grades",
      benefits: "₱35,000 financial subsidy per semester\nClinical clerkship stipend and uniform allowances\nFree reviewer materials for board exams",
      returnService: false,
      link: "https://healthcare-alliance.org",
    },
    {
      name: "Humanities & Arts Excellence Fellowship",
      provider: "Cultural Center Sponsoring Board",
      sector: "PRIVATE",
      incomeBracket: 0,
      programCategories: ["Humanities"],
      minGwa: 0,
      requirements: "Enrolled in Literature, Fine Arts, History, or Philosophy programs\nSubmit a portfolio of 3 original essays or artistic drafts\nRecommendation letter from the Department Chair",
      benefits: "₱40,000 subsidy per school year\nFully sponsored publication and thesis printing grants\nFree admission to writing conventions and artistic forums",
      returnService: false,
      link: "https://humanities-fellows.ph",
    },
    {
      name: "Tulong Dunong Program (TDP-TES)",
      provider: "UniFAST & CHED",
      sector: "PUBLIC",
      incomeBracket: 300000,
      programCategories: ["Any"],
      minGwa: 0,
      requirements: "Filipino tertiary student enrolled in CHED-recognized SUCs or LUCs\nNo other major active government educational scholarship\nPassing grades in all subjects",
      benefits: "₱15,000 financial assistance per school year\nCan be combined with local government subsidies",
      returnService: false,
      link: "https://unifast.deped.gov.ph",
    }
  ];

  // Clear existing scholarship rows and insert canonical prototype data.
  await prisma.scholarship.deleteMany();

  for (const scholarship of scholarships) {
    await prisma.scholarship.create({
      data: {
        name: scholarship.name,
        provider: scholarship.provider,
        sector: scholarship.sector as any,
        incomeBracket: String(scholarship.incomeBracket),
        programCategories: scholarship.programCategories,
        minGwa: scholarship.minGwa,
        requirements: scholarship.requirements,
        benefits: scholarship.benefits,
        returnService: scholarship.returnService,
        link: scholarship.link,
      } as any,
    });
  }

  console.log("Seeded scholarship data successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
