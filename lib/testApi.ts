const prisma = require("@/lib/utils/prisma") as any;

function normalizeQuestionType(questionType: unknown) {
  if (questionType === "MCQ") return "MULTIPLE_CHOICE";
  return questionType ?? "MULTIPLE_CHOICE";
}

function parseOptions(options: unknown) {
  if (Array.isArray(options)) return options;
  if (typeof options === "string") {
    try {
      const parsed = JSON.parse(options);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

function getUserId(user: { id?: string; userId?: string } | null | undefined) {
  return Number(user?.id ?? user?.userId);
}

export async function getTestListResponse(userId: number) {
  try {
    const tests = await prisma.test.findMany({
      include: {
        attempts: {
          where: { userId },
          orderBy: { completedAt: "desc" },
          take: 1,
        },
        type: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const result = tests.map((test: any) => ({
      id: test.id,
      title: test.title,
      description: test.description,
      type: test.type?.name ?? null,
      latestAttemptId: test.attempts[0]?.id ?? null,
      completed: Boolean(test.attempts[0]),
    }));

    return Response.json(result);
  } catch (error) {
    console.error("getTestListResponse:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

export async function getTestResponse(testId: number) {
  try {
    if (!Number.isFinite(testId)) {
      return Response.json({ message: "Invalid testId" }, { status: 400 });
    }

    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: { questions: true, type: true },
    });

    if (!test) {
      return Response.json({ message: "Test not found" }, { status: 404 });
    }

    const questions = test.questions.map((question: any) => ({
      id: question.id,
      text: question.text,
      options: parseOptions(question.options),
      questionType: normalizeQuestionType(question.questionType),
    }));

    return Response.json({
      id: test.id,
      title: test.title,
      type: test.type?.name ?? null,
      description: test.description,
      questions,
    });
  } catch (error) {
    console.error("getTestResponse:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

export async function submitTestResponse(user: { id?: string; userId?: string } | null | undefined, testId: number, body: unknown) {
  try {
    const userId = getUserId(user);
    if (!Number.isFinite(userId) || !Number.isFinite(testId)) {
      return Response.json({ message: "Invalid request" }, { status: 400 });
    }

    const rawAnswers = typeof body === "object" && body !== null ? (body as { answers?: unknown }).answers : undefined;

    let answers: unknown;
    if (typeof rawAnswers === "string") {
      try {
        answers = JSON.parse(rawAnswers);
      } catch {
        return Response.json({ message: "Invalid answers JSON" }, { status: 400 });
      }
    } else {
      answers = rawAnswers;
    }

    if (!answers || typeof answers !== "object") {
      return Response.json({ message: "answers object required" }, { status: 400 });
    }

    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: { questions: true, type: true },
    });

    if (!test) {
      return Response.json({ message: "Test not found" }, { status: 404 });
    }

    const existing = await prisma.attempt.findUnique({
      where: { userId_testId: { userId, testId } },
    });

    let autoScore = 0;

    for (const question of test.questions as any[]) {
      const normalizedType = normalizeQuestionType(question.questionType);
      if (normalizedType !== "MULTIPLE_CHOICE") continue;

      const submittedLetter = (answers as Record<string, unknown>)[question.id] ?? (answers as Record<string, unknown>)[String(question.id)];
      if (typeof submittedLetter !== "string") continue;

      if (submittedLetter.toLowerCase() === String(question.answer).toLowerCase()) {
        autoScore += Number(question.autoScore || 1);
      }
    }

    const now = new Date();
    const testTypeName = test.type?.name ?? null;

    if (testTypeName === "DIGITAL_LITERACY") {
      const minScore = Math.ceil(test.questions.length * 0.7);
      const passStatus = autoScore >= minScore ? "PASS" : "FAIL";

      const attempt = existing
        ? await prisma.attempt.update({
            where: { id: existing.id },
            data: {
              answers,
              autoScore,
              finalScore: autoScore,
              passStatus,
              completedAt: now,
              gradedAt: now,
            },
          })
        : await prisma.attempt.create({
            data: {
              userId,
              testId,
              answers,
              autoScore,
              finalScore: autoScore,
              passStatus,
              completedAt: now,
              gradedAt: now,
            },
          });

      return Response.json({
        message: "Submitted & Auto-Graded",
        autoScore,
        finalScore: autoScore,
        passStatus,
        attempt,
      });
    }

    const attempt = existing
      ? await prisma.attempt.update({
          where: { id: existing.id },
          data: {
            answers,
            autoScore,
            manualScore: null,
            finalScore: null,
            passStatus: null,
            completedAt: now,
            gradedAt: null,
          },
        })
      : await prisma.attempt.create({
          data: {
            userId,
            testId,
            answers,
            autoScore,
            manualScore: null,
            finalScore: null,
            passStatus: null,
            completedAt: now,
            gradedAt: null,
          },
        });

    return Response.json({
      message: "Submitted (Needs Manual Review for Essay)",
      autoScore,
      attempt,
    });
  } catch (error) {
    console.error("submitTestResponse:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

export async function getStatusResponse(userId: number) {
  try {
    const attempts = await prisma.attempt.findMany({
      where: { userId },
      include: { test: { include: { type: true } } },
    });

    const doneTypes = attempts
      .filter((attempt: any) => attempt.completedAt)
      .map((attempt: any) => attempt.test.type?.name)
      .filter((typeName: string | undefined): typeName is string => Boolean(typeName));

    const required = ["DIGITAL_LITERACY", "COLLEGE_READINESS"];
    const missing = required.filter((requiredType) => !doneTypes.includes(requiredType));

    return Response.json({ doneTypes, missing, completed: missing.length === 0 });
  } catch (error) {
    console.error("getStatusResponse:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

export async function getUserAttemptResponse(userId: number, testId: number, attemptId?: number | null) {
  try {
    if (!Number.isFinite(userId) || !Number.isFinite(testId)) {
      return Response.json({ message: "Invalid request" }, { status: 400 });
    }

    const attempt = await prisma.attempt.findFirst({
      where: attemptId ? { id: attemptId, userId } : { testId, userId },
    });

    if (!attempt) {
      return Response.json({ message: "No attempt found" }, { status: 404 });
    }

    return Response.json({ attempt });
  } catch (error) {
    console.error("getUserAttemptResponse:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}