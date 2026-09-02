import { AssessmentMode, Prisma, QuestionType } from "@prisma/client";
import prisma from "../src/services/prismaClient";
import { ParsedQuestion, parseOption1, parseOption2 } from "../scripts/parse_question_bank";

function toRows(
  questions: ParsedQuestion[],
  assessmentMode: AssessmentMode,
  sourceLabel: string
): Prisma.QuestionCreateManyInput[] {
  const sequenceBySubject = new Map<string, number>();

  return questions.map((q) => {
    const sequenceNo = sequenceBySubject.get(q.subject) ?? 0;
    sequenceBySubject.set(q.subject, sequenceNo + 1);

    return {
      type: q.subject as QuestionType,
      difficulty: q.difficulty,
      assessmentMode,
      sourceLabel,
      sequenceNo,
      isActive: true,
      text: q.text,
      choices: q.choices,
      correctAnswer: String(q.correctAnswer),
      explanation: q.explanation,
    };
  });
}

async function main() {
  const diagnostic = toRows(parseOption1(), "DIAGNOSTIC", "option1.md");
  const mock = toRows(parseOption2(), "MOCK", "option2.md");
  const rows = [...diagnostic, ...mock];

  console.log(`Seeding ${rows.length} questions (${diagnostic.length} diagnostic, ${mock.length} mock)...`);

  await prisma.question.deleteMany();
  await prisma.question.createMany({ data: rows });

  console.log(`✅ Seeded ${rows.length} question records successfully.`);
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
