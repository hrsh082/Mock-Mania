export interface Option {
  label: string;
  text: string;
}

export interface Question {
  id: string;
  questionText: string;
  passage: string | null;
  options: Option[];
  correctAnswer: string;
  explanation?: string;
}

export interface Section {
  sectionName: string;
  timeLimitMinutes: number;
  questions: Question[];
}

export interface MarkingScheme {
  correct: number;
  wrong: number;
  unattempted: number;
}

export type TestType = 'FULL' | 'ENGLISH' | 'QUANT' | 'REASONING';

export interface Test {
  _id?: string;
  testTitle: string;
  testType?: TestType;
  markingScheme: MarkingScheme;
  sections: Section[];
}

// User state and response types
export type QuestionStatus = 
  | 'NOT_VISITED'
  | 'NOT_ANSWERED'
  | 'ANSWERED'
  | 'MARKED_FOR_REVIEW'
  | 'MARKED_AND_ANSWERED';

export interface UserResponse {
  questionId: string;
  selectedAnswer: string | null; // null represents unattempted
  status: QuestionStatus;
}

export interface SectionResult {
  sectionName: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  wrong: number;
  unattempted: number;
  score: number;
  maxPossibleScore: number;
}

export interface GrandResult {
  testTitle: string;
  sectionResults: SectionResult[];
  totalQuestions: number;
  totalAttempted: number;
  totalCorrect: number;
  totalWrong: number;
  totalUnattempted: number;
  totalScore: number;
  maxPossibleScore: number;
  accuracy: number; // percentage: correct / attempted
}
