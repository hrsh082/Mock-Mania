import type { Test, UserResponse, GrandResult, SectionResult } from '../types';

/**
 * Computes scores and stats for the mock test session.
 * 
 * Rules:
 * - Negative marking (markingScheme.wrong) ONLY applies to wrong answers.
 * - Unattempted questions receive markingScheme.unattempted (typically 0) and NEVER get negative marking.
 */
export function calculateResults(test: Test, responses: UserResponse[]): GrandResult {
  const { markingScheme } = test;
  const responseMap = new Map<string, string | null>();
  
  responses.forEach(resp => {
    responseMap.set(resp.questionId, resp.selectedAnswer);
  });

  const sectionResults: SectionResult[] = [];
  
  let totalQuestions = 0;
  let totalAttempted = 0;
  let totalCorrect = 0;
  let totalWrong = 0;
  let totalUnattempted = 0;
  let totalScore = 0;
  let maxPossibleScore = 0;

  test.sections.forEach(section => {
    // Skip sections that have zero questions or zero time limit from scores if they were skipped.
    // However, to keep it uniform, we compute for all sections present in the active test session.
    if (section.timeLimitMinutes === 0 || section.questions.length === 0) {
      return;
    }

    let sectionAttempted = 0;
    let sectionCorrect = 0;
    let sectionWrong = 0;
    let sectionUnattempted = 0;
    let sectionScore = 0;

    section.questions.forEach(q => {
      const selected = responseMap.get(q.id);
      
      if (selected === undefined || selected === null) {
        // Unattempted
        sectionUnattempted++;
        sectionScore += markingScheme.unattempted; // Usually 0
      } else {
        // Attempted
        sectionAttempted++;
        if (selected === q.correctAnswer) {
          sectionCorrect++;
          sectionScore += markingScheme.correct;
        } else {
          sectionWrong++;
          sectionScore += markingScheme.wrong; // Apply negative marking here (negative number, e.g. -0.25)
        }
      }
    });

    const sectionMax = section.questions.length * markingScheme.correct;

    sectionResults.push({
      sectionName: section.sectionName,
      totalQuestions: section.questions.length,
      attempted: sectionAttempted,
      correct: sectionCorrect,
      wrong: sectionWrong,
      unattempted: sectionUnattempted,
      score: Number(sectionScore.toFixed(4)), // Avoid floating point inaccuracies
      maxPossibleScore: sectionMax
    });

    totalQuestions += section.questions.length;
    totalAttempted += sectionAttempted;
    totalCorrect += sectionCorrect;
    totalWrong += sectionWrong;
    totalUnattempted += sectionUnattempted;
    totalScore += sectionScore;
    maxPossibleScore += sectionMax;
  });

  const accuracy = totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;

  return {
    testTitle: test.testTitle,
    sectionResults,
    totalQuestions,
    totalAttempted,
    totalCorrect,
    totalWrong,
    totalUnattempted,
    totalScore: Number(totalScore.toFixed(4)),
    maxPossibleScore,
    accuracy: Number(accuracy.toFixed(2))
  };
}
