import { Request, Response } from "express";
import { Prisma, Question, QuestionType } from "@prisma/client";
import prisma from "../services/prismaClient";

const SUBJECT_LABELS: Record<QuestionType, string> = {
  MATH: "Mathematics",
  SCIENCE: "Science",
  ENGLISH: "English",
  FILIPINO: "Filipino",
  LOGIC: "Logical Reasoning",
};

// Order the mock exam's subject blocks follow (matches frontend SUBJECTS order).
const SUBJECT_ORDER: QuestionType[] = ["MATH", "SCIENCE", "ENGLISH", "FILIPINO", "LOGIC"];

const parseSubjectsQuery = (value: unknown): QuestionType[] => {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((v) => v.trim().toUpperCase())
    .filter((v): v is QuestionType => SUBJECT_ORDER.includes(v as QuestionType));
};

const parseDifficultyQuery = (value: unknown): number[] => {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((v) => Number(v.trim()))
    .filter((v) => Number.isInteger(v) && v >= 1 && v <= 5);
};

const shuffle = <T>(items: T[]): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const formatQuestion = (row: Question, id: number) => ({
  id,
  subject: SUBJECT_LABELS[row.type],
  difficulty: row.difficulty,
  questionText: row.text,
  options: row.choices as string[],
  correctAnswer: Number(row.correctAnswer),
});

/**
 * Controller for the readiness assessment question bank.
 * `mode=diagnostic` returns a shuffled, filtered subset of the DIAGNOSTIC pool.
 * `mode=mock` returns the full MOCK pool, grouped by subject in SUBJECT_ORDER.
 */
export const getQuestions = async (req: Request, res: Response) => {
  try {
    const mode = typeof req.query.mode === "string" && req.query.mode.toLowerCase() === "mock" ? "MOCK" : "DIAGNOSTIC";

    if (mode === "MOCK") {
      const rows = await prisma.question.findMany({
        where: { assessmentMode: "MOCK", isActive: true },
        orderBy: { sequenceNo: "asc" },
      });

      const bySubject = new Map<QuestionType, Question[]>();
      for (const row of rows) {
        const list = bySubject.get(row.type) ?? [];
        list.push(row);
        bySubject.set(row.type, list);
      }

      const ordered = SUBJECT_ORDER.flatMap((subject) => bySubject.get(subject) ?? []);
      return res.json({ data: ordered.map((row, idx) => formatQuestion(row, idx + 1)) });
    }

    const subjects = parseSubjectsQuery(req.query.subjects);
    const difficulties = parseDifficultyQuery(req.query.difficulty);
    const count = Math.min(Math.max(Number(req.query.count) || 10, 1), 50);

    const where: Prisma.QuestionWhereInput = {
      assessmentMode: "DIAGNOSTIC",
      isActive: true,
      type: { in: subjects.length ? subjects : SUBJECT_ORDER },
    };

    let pool = await prisma.question.findMany({
      where: difficulties.length ? { ...where, difficulty: { in: difficulties } } : where,
    });

    if (pool.length === 0 && difficulties.length) {
      pool = await prisma.question.findMany({ where });
    }

    const selected = shuffle(pool).slice(0, Math.min(count, pool.length));
    res.json({ data: selected.map((row, idx) => formatQuestion(row, idx + 1)) });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[getQuestions] Database query failed:", message, err instanceof Error ? err.stack : "");
    res.status(500).json({ error: `Database query failed: ${message}` });
  }
};
