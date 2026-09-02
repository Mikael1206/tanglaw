-- CreateEnum
CREATE TYPE "Sector" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('LOGIC', 'MATH', 'SCIENCE', 'ENGLISH', 'FILIPINO');

-- CreateEnum
CREATE TYPE "AssessmentMode" AS ENUM ('DIAGNOSTIC', 'MOCK');

-- CreateTable
CREATE TABLE "Scholarship" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "sector" "Sector" NOT NULL,
    "incomeBracket" TEXT NOT NULL,
    "programCategories" TEXT[],
    "minGwa" DOUBLE PRECISION NOT NULL,
    "requirements" TEXT NOT NULL,
    "benefits" TEXT NOT NULL,
    "returnService" BOOLEAN NOT NULL,
    "link" TEXT NOT NULL,
    "contentVector" vector,

    CONSTRAINT "Scholarship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "assessmentMode" "AssessmentMode" NOT NULL DEFAULT 'DIAGNOSTIC',
    "sourceLabel" TEXT,
    "sequenceNo" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "text" TEXT NOT NULL,
    "choices" JSONB NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "authProvider" TEXT,
    "authProviderAccountId" TEXT,
    "yearLevel" TEXT,
    "program" TEXT,
    "gwa" DOUBLE PRECISION,
    "financialStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_authProvider_authProviderAccountId_key" ON "User"("authProvider", "authProviderAccountId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
