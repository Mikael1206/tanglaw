import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../services/prismaClient";

const parseStringQuery = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const parseNumberQuery = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/**
 * Controller for scholarship-related routes.
 * Returns scholarship data from the database and maps it into the frontend shape.
 */
export const getScholarships = async (req: Request, res: Response) => {
  try {
    const program = parseStringQuery(req.query.program);
    const sector = parseStringQuery(req.query.sector)?.toUpperCase();
    const gwa = parseNumberQuery(req.query.gwa, NaN);
    const page = Math.max(parseNumberQuery(req.query.page, 1), 1);
    const pageSize = Math.min(Math.max(parseNumberQuery(req.query.pageSize, 100), 1), 500);

    const where: Prisma.ScholarshipWhereInput = {};
    if (program) {
      where.programCategories = { has: program };
    }
    if (sector === "PUBLIC" || sector === "PRIVATE") {
      where.sector = sector;
    }
    if (!Number.isNaN(gwa)) {
      where.minGwa = { lte: gwa };
    }

    const data = await prisma.scholarship.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        minGwa: true,
        name: true,
        provider: true,
        sector: true,
        incomeBracket: true,
        programCategories: true,
        requirements: true,
        benefits: true,
        link: true,
      },
    });

    const formatted = data.map((scholarship) => ({
      id: scholarship.id,
      name: scholarship.name,
      provider: scholarship.provider,
      type: scholarship.sector === "PUBLIC" ? "Public" : "Private",
      minGwa: scholarship.minGwa,
      incomeBracket: Number(scholarship.incomeBracket),
      programCategories: scholarship.programCategories || [],
      benefits: scholarship.benefits
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean),
      requirements: scholarship.requirements
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean),
      link: scholarship.link,
    }));

    res.json({ data: formatted });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[getScholarships] Database query failed:", message, err instanceof Error ? err.stack : "");
    res.status(500).json({ error: `Database query failed: ${message}` });
  }
};
