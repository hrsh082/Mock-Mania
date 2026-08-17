import { calculateResults } from './scoring';
import type { Test, UserResponse } from '../types';

// Define a sample test
const sampleTest: Test = {
  testTitle: 'Test Exam',
  markingScheme: {
    correct: 1,
    wrong: -0.25,
    unattempted: 0
  },
  sections: [
    {
      sectionName: 'English Language',
      timeLimitMinutes: 20,
      questions: [
        {
          id: 'eng-1',
          questionText: 'Q1',
          passage: null,
          options: [
            { label: 'A', text: 'Opt A' },
            { label: 'B', text: 'Opt B' }
          ],
          correctAnswer: 'A'
        },
        {
          id: 'eng-2',
          questionText: 'Q2',
          passage: null,
          options: [
            { label: 'A', text: 'Opt A' },
            { label: 'B', text: 'Opt B' }
          ],
          correctAnswer: 'B'
        },
        {
          id: 'eng-3',
          questionText: 'Q3',
          passage: null,
          options: [
            { label: 'A', text: 'Opt A' },
            { label: 'B', text: 'Opt B' }
          ],
          correctAnswer: 'A'
        }
      ]
    },
    {
      sectionName: 'Quantitative Aptitude',
      timeLimitMinutes: 20,
      questions: [
        {
          id: 'quant-1',
          questionText: 'Q4',
          passage: null,
          options: [
            { label: 'A', text: 'Opt A' },
            { label: 'B', text: 'Opt B' }
          ],
          correctAnswer: 'A'
        },
        {
          id: 'quant-2',
          questionText: 'Q5',
          passage: null,
          options: [
            { label: 'A', text: 'Opt A' },
            { label: 'B', text: 'Opt B' }
          ],
          correctAnswer: 'B'
        }
      ]
    }
  ]
};

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function runTests() {
  console.log('Running scoring tests...');

  // Test Case 1: Mixed answers
  // English:
  // eng-1: A (Correct) -> +1 mark
  // eng-2: A (Incorrect, correct is B) -> -0.25 mark
  // eng-3: null (Unattempted) -> 0 marks (NOT -0.25!)
  // Expected English Score: 1 - 0.25 = 0.75 marks
  // Expected English attempted = 2, unattempted = 1, correct = 1, wrong = 1
  //
  // Quant:
  // quant-1: A (Correct) -> +1 mark
  // quant-2: null (Unattempted) -> 0 marks
  // Expected Quant Score: 1 mark
  // Expected Quant attempted = 1, unattempted = 1, correct = 1, wrong = 0
  //
  // Grand totals:
  // totalQuestions = 5
  // totalAttempted = 3
  // totalCorrect = 2
  // totalWrong = 1
  // totalUnattempted = 2
  // totalScore = 0.75 + 1.0 = 1.75
  // accuracy = (2 / 3) * 100 = 66.67%
  
  const responses: UserResponse[] = [
    { questionId: 'eng-1', selectedAnswer: 'A', status: 'ANSWERED' },
    { questionId: 'eng-2', selectedAnswer: 'A', status: 'ANSWERED' },
    { questionId: 'eng-3', selectedAnswer: null, status: 'NOT_ANSWERED' },
    { questionId: 'quant-1', selectedAnswer: 'A', status: 'ANSWERED' },
    { questionId: 'quant-2', selectedAnswer: null, status: 'NOT_ANSWERED' }
  ];

  const results = calculateResults(sampleTest, responses);

  console.log('Results output:', JSON.stringify(results, null, 2));

  // Assertions for English Section
  const engResult = results.sectionResults.find(r => r.sectionName === 'English Language')!;
  assert(engResult !== undefined, 'English Language section results should exist');
  assert(engResult.totalQuestions === 3, 'English should have 3 questions');
  assert(engResult.attempted === 2, 'English attempted should be 2');
  assert(engResult.unattempted === 1, 'English unattempted should be 1');
  assert(engResult.correct === 1, 'English correct should be 1');
  assert(engResult.wrong === 1, 'English wrong should be 1');
  assert(engResult.score === 0.75, `English score should be 0.75, got ${engResult.score}`);

  // Assertions for Quant Section
  const quantResult = results.sectionResults.find(r => r.sectionName === 'Quantitative Aptitude')!;
  assert(quantResult !== undefined, 'Quant section results should exist');
  assert(quantResult.totalQuestions === 2, 'Quant should have 2 questions');
  assert(quantResult.attempted === 1, 'Quant attempted should be 1');
  assert(quantResult.unattempted === 1, 'Quant unattempted should be 1');
  assert(quantResult.correct === 1, 'Quant correct should be 1');
  assert(quantResult.wrong === 0, 'Quant wrong should be 0');
  assert(quantResult.score === 1.0, `Quant score should be 1.0, got ${quantResult.score}`);

  // Assertions for Grand Result
  assert(results.totalQuestions === 5, 'Grand total questions should be 5');
  assert(results.totalAttempted === 3, 'Grand total attempted should be 3');
  assert(results.totalCorrect === 2, 'Grand total correct should be 2');
  assert(results.totalWrong === 1, 'Grand total wrong should be 1');
  assert(results.totalUnattempted === 2, 'Grand total unattempted should be 2');
  assert(results.totalScore === 1.75, `Grand total score should be 1.75, got ${results.totalScore}`);
  assert(results.accuracy === 66.67, `Grand total accuracy should be 66.67, got ${results.accuracy}`);

  console.log('✓ All scoring logic tests passed successfully!');
}

runTests();
