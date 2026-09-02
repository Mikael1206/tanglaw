import fs from "fs";
import path from "path";

export type Subject = "MATH" | "ENGLISH" | "FILIPINO" | "SCIENCE" | "LOGIC";

export interface ParsedQuestion {
  subject: Subject;
  difficulty: number;
  text: string;
  choices: string[];
  correctAnswer: number;
  explanation: string;
}

interface SubjectRange {
  subject: Subject;
  start: number;
  end: number;
  /** Set for sections whose questions have no numbering and run directly into their options. */
  unnumbered?: boolean;
}

const OPTION1_PATH = path.join(__dirname, "../../frontend/src/components/option1.md");
const OPTION2_PATH = path.join(__dirname, "../../frontend/src/components/option2.md");

const OPTION1_RANGES: SubjectRange[] = [
  { subject: "MATH", start: 1, end: 375 },
  { subject: "ENGLISH", start: 376, end: 749 },
  { subject: "FILIPINO", start: 750, end: 1362 },
  { subject: "SCIENCE", start: 1363, end: 1880 },
  { subject: "LOGIC", start: 1881, end: 2300 },
];

const OPTION2_RANGES: SubjectRange[] = [
  { subject: "MATH", start: 1, end: 394 },
  { subject: "ENGLISH", start: 395, end: 796, unnumbered: true },
  { subject: "FILIPINO", start: 797, end: 1758 },
  { subject: "SCIENCE", start: 1759, end: 2316 },
  { subject: "LOGIC", start: 2317, end: 2826 },
];

const DIFFICULTY_RE = /(?:tier|difficulty)\s*(?:level)?\s*#?\s*:?\s*(\d)/i;
const ANSWER_LINE_RE = /^(?:answer|sagot|tamang sagot)\s*:\s*(.+)$/i;
const LETTER_ANSWER_RE = /^([a-e])\b/i;
const OPTION_RE = /^([a-e])[.)]\s*(.*)$/i;
const QUESTION_HASH_TEXT_RE = /^question\s*#?\s*\d+\s*:?\s*(.*)$/i;
const HASH_ONLY_RE = /^#\s*\d+\s*$/;
const NUMBERED_RE = /^(?:q\s*)?\d{1,3}[.)]\s*(.*)$/i;
const EXPLANATION_RE = /^(?:short\s+)?explanation\s*:?\s*(.*)$/i;
const OPTION_A_RE = /^a[.)]/i;

function isQuestionStart(line: string): boolean {
  return QUESTION_HASH_TEXT_RE.test(line) || HASH_ONLY_RE.test(line) || NUMBERED_RE.test(line);
}

function getLeadingText(line: string): string {
  const hashMatch = line.match(QUESTION_HASH_TEXT_RE);
  if (hashMatch) return hashMatch[1].trim();
  const numberedMatch = line.match(NUMBERED_RE);
  if (numberedMatch) return numberedMatch[1].trim();
  return "";
}

function parseSubjectBlock(rawLines: string[], subject: Subject, unnumbered = false): ParsedQuestion[] {
  const lines = rawLines.map((l) => l.trim());
  const questions: ParsedQuestion[] = [];
  let currentDifficulty = 1;
  let pos = 0;

  // Skip front-matter/preamble lines until the first question marker.
  if (unnumbered) {
    // No numbering to detect a question start; look ahead for the first
    // "A." option line and treat the line before it as the first question.
    while (pos < lines.length) {
      const d = lines[pos].match(DIFFICULTY_RE);
      if (d) currentDifficulty = Number(d[1]);
      if (lines[pos] && OPTION_A_RE.test(lines[pos + 1] ?? "")) break;
      pos++;
    }
  } else {
    while (pos < lines.length && !isQuestionStart(lines[pos])) {
      const d = lines[pos].match(DIFFICULTY_RE);
      if (d) currentDifficulty = Number(d[1]);
      pos++;
    }
  }

  while (pos < lines.length) {
    const line = lines[pos];
    if (!line) {
      pos++;
      continue;
    }

    const d = line.match(DIFFICULTY_RE);
    if (d && !isQuestionStart(line)) {
      currentDifficulty = Number(d[1]);
      pos++;
      continue;
    }

    if (!isQuestionStart(line) && !unnumbered) {
      pos++;
      continue;
    }

    const questionTextParts: string[] = [];
    const leading = isQuestionStart(line) ? getLeadingText(line) : line;
    if (leading) questionTextParts.push(leading);
    pos++;

    const optionLines: { letter: string; text: string }[] = [];

    while (pos < lines.length && !ANSWER_LINE_RE.test(lines[pos])) {
      const l = lines[pos];
      if (!l) {
        pos++;
        continue;
      }
      const opt = l.match(OPTION_RE);
      if (opt) {
        optionLines.push({ letter: opt[1].toLowerCase(), text: opt[2].trim() });
      } else if (optionLines.length === 0) {
        questionTextParts.push(l);
      } else {
        optionLines[optionLines.length - 1].text += ` ${l}`;
      }
      pos++;
    }

    if (pos >= lines.length) break; // dangling question with no answer key — drop it

    const answerMatch = lines[pos].match(ANSWER_LINE_RE);
    const answerRaw = answerMatch![1].trim();
    const letterMatch = answerRaw.match(LETTER_ANSWER_RE);
    const answerLetter = letterMatch ? letterMatch[1].toLowerCase() : null;
    pos++;

    const explanationParts: string[] = [];
    while (pos < lines.length) {
      const l = lines[pos];
      if (!l) {
        pos++;
        if (explanationParts.length > 0) break;
        continue;
      }
      if (isQuestionStart(l) || ANSWER_LINE_RE.test(l) || OPTION_RE.test(l) || DIFFICULTY_RE.test(l)) break;
      const exp = l.match(EXPLANATION_RE);
      if (exp) {
        explanationParts.push(exp[1].trim());
        pos++;
        if (unnumbered) break; // unnumbered sections only ever have a single explanation line
        continue;
      }
      if (explanationParts.length > 0 && !unnumbered) {
        explanationParts.push(l);
        pos++;
        continue;
      }
      break;
    }

    let choices: string[];
    let correctAnswer: number;

    if (optionLines.length >= 2) {
      choices = optionLines.map((o) => o.text).filter(Boolean);
      if (answerLetter) {
        const idx = optionLines.findIndex((o) => o.letter === answerLetter);
        correctAnswer = idx >= 0 ? idx : answerLetter.charCodeAt(0) - 97;
      } else {
        correctAnswer = choices.findIndex((c) => c.toLowerCase() === answerRaw.toLowerCase());
      }
    } else {
      const extra = Math.max(0, questionTextParts.length - 1);
      let take = Math.min(4, extra);
      if (extra === 5) {
        const last5 = questionTextParts.slice(-5);
        if (last5.every((l) => l.length <= 20)) take = 5;
      }
      choices = questionTextParts.splice(questionTextParts.length - take, take);
      if (answerLetter) {
        correctAnswer = answerLetter.charCodeAt(0) - 97;
      } else {
        correctAnswer = choices.findIndex((c) => c.toLowerCase() === answerRaw.toLowerCase());
      }
    }

    const text = questionTextParts.filter(Boolean).join(" ").trim();
    const explanation = explanationParts.filter(Boolean).join(" ").trim();

    if (!text || choices.length < 2 || correctAnswer < 0 || correctAnswer >= choices.length) {
      continue;
    }

    questions.push({ subject, difficulty: currentDifficulty, text, choices, correctAnswer, explanation });
  }

  return questions;
}

function parseFile(filePath: string, ranges: SubjectRange[]): ParsedQuestion[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const allLines = content.split(/\r?\n/);
  const results: ParsedQuestion[] = [];

  for (const range of ranges) {
    const blockLines = allLines.slice(range.start - 1, range.end);
    results.push(...parseSubjectBlock(blockLines, range.subject, range.unnumbered));
  }

  return results;
}

/** option1.md → DIAGNOSTIC pool. Returns all parsed questions, ~50/subject. */
export function parseOption1(): ParsedQuestion[] {
  return parseFile(OPTION1_PATH, OPTION1_RANGES);
}

/**
 * option2.md → MOCK pool. Per subject, keeps only the first 50 valid
 * parsed questions (in document order) and warns if a subject falls short.
 */
export function parseOption2(): ParsedQuestion[] {
  const all = parseFile(OPTION2_PATH, OPTION2_RANGES);
  const bySubject = new Map<Subject, ParsedQuestion[]>();
  for (const q of all) {
    const list = bySubject.get(q.subject) ?? [];
    list.push(q);
    bySubject.set(q.subject, list);
  }

  const result: ParsedQuestion[] = [];
  for (const range of OPTION2_RANGES) {
    const list = bySubject.get(range.subject) ?? [];
    if (list.length < 50) {
      console.warn(`[option2.md] ${range.subject}: only ${list.length}/50 questions parsed`);
    }
    result.push(...list.slice(0, 50));
  }
  return result;
}

if (require.main === module) {
  for (const [label, parse] of [
    ["option1.md (DIAGNOSTIC)", parseOption1],
    ["option2.md (MOCK)", parseOption2],
  ] as const) {
    const questions = parse();
    console.log(`\n=== ${label}: ${questions.length} total ===`);

    const bySubject = new Map<Subject, ParsedQuestion[]>();
    for (const q of questions) {
      const list = bySubject.get(q.subject) ?? [];
      list.push(q);
      bySubject.set(q.subject, list);
    }

    for (const [subject, list] of bySubject) {
      const byDifficulty = new Map<number, number>();
      for (const q of list) {
        byDifficulty.set(q.difficulty, (byDifficulty.get(q.difficulty) ?? 0) + 1);
      }
      const diffSummary = [1, 2, 3, 4, 5]
        .map((d) => `d${d}=${byDifficulty.get(d) ?? 0}`)
        .join(" ");
      console.log(`  ${subject}: ${list.length} (${diffSummary})`);
    }
  }
}
