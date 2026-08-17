# Mock Test Runner

Mock Test Runner is a premium, client-side single-page React web application built with Vite and TypeScript. It simulates competitive online exams (e.g., IBPS PO or SSC CGL style) under strict, section-wise timed conditions.

## Key Features

- **JSON Mock Test Upload & Validation:** Drag and drop or browse test files. Throws highly specific path-based errors for missing fields, incorrect types, duplicates, and invalid options.
- **Section-Wise Timed Simulator:** Runs sections sequentially. Auto-locks a section when its timer reaches zero and moves the candidate to the next section. Previous sections cannot be re-visited.
- **Exam Navigation Palette:** Interactive grid showcasing different visual states: *Not Visited*, *Not Answered*, *Answered*, *Marked for Review*, and *Marked & Answered*.
- **Split-Screen Comprehension Panel:** Renders reading passages side-by-side with questions. Can be toggled on/off to adapt to screen sizes.
- **Resilient Sessions (Resume Test):** Implements local storage cache. If the user refreshes or accidentally leaves, they can choose "Resume Test" on the upload screen. Warns the user on refresh/close.
- **Scorecard Dashboard:** Displays sections metrics (attempted/correct/incorrect/unattempted/score), grand totals, accuracy rates, and custom marking schemes.
- **Detailed Explanations:** Explains correct answers post-test with category filters (*Incorrect*, *Unattempted*, *Correct*).

## Setup & Running Locally

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run Development Server:**
   ```bash
   npm run dev
   ```

3. **Verify Scoring Logic (Unit Tests):**
   ```bash
   npx tsx src/utils/scoring.test.ts
   ```

---

## JSON Test Schema Specification

Mock tests uploaded to the application must adhere strictly to the following JSON structure:

```json
{
  "testTitle": "IBPS PO Prelims Mock Test 1",
  "markingScheme": { 
    "correct": 1.0, 
    "wrong": -0.25, 
    "unattempted": 0.0 
  },
  "sections": [
    {
      "sectionName": "English Language",
      "timeLimitMinutes": 20,
      "questions": [
        {
          "id": "eng-1",
          "questionText": "What is the capital of France?",
          "passage": "France is a country in Western Europe...",
          "options": [
            { "label": "A", "text": "Berlin" },
            { "label": "B", "text": "Paris" },
            { "label": "C", "text": "Rome" },
            { "label": "D", "text": "Madrid" }
          ],
          "correctAnswer": "B",
          "explanation": "Paris is the official capital city of France."
        }
      ]
    }
  ]
}
```

### Properties Definition:

1. **`testTitle`** `(String)`: The title of the test displayed on the upload preview, testing header, and results dashboard.
2. **`markingScheme`** `(Object)`:
   - `correct` `(Number)`: Marks rewarded for a correct option.
   - `wrong` `(Number)`: Penalty applied for a wrong option (usually a negative number).
   - `unattempted` `(Number)`: Marks rewarded for skipping a question (usually 0).
3. **`sections`** `(Array)`: Non-empty list of test sections.
   - `sectionName` `(String)`: Name of the section (e.g. English Language, Quantitative Aptitude).
   - `timeLimitMinutes` `(Number)`: Section time limit in minutes.
   - `questions` `(Array)`: Array of questions within the section.
     - `id` `(String)`: Unique identifier for the question (must be unique across the entire test).
     - `questionText` `(String)`: The question statement.
     - `passage` `(String | null)`: Optional reading-comprehension or shared text. Displayed in a side panel if present.
     - `options` `(Array)`: Options list containing objects with:
       - `label` `(String)`: Identifier label (e.g. "A", "B", "C").
       - `text` `(String)`: Option description.
     - `correctAnswer` `(String)`: Label matching one of the options (e.g. "B").
     - `explanation` `(String, Optional)`: Helpful review description displayed in post-test analysis.
