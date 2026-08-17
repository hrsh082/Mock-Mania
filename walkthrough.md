# Full Stack Mock Test Runner Walkthrough

We have successfully migrated the Mock Test Runner into a full-stack SaaS-like web application. The platform now stores test mock parameters and user scorecards in MongoDB, supports dynamic sectional timers, and renders interactive progress analytics graphs.

## Core Features Implemented

### 1. MongoDB Backend (`server/`)
Developed an Express server inside the [server](file:///D:/mock-test-runner/server) folder:
- **Database Connection:** [db.ts](file:///D:/mock-test-runner/server/db.ts) connects Mongoose to local MongoDB or MongoDB Atlas.
- **Data Models:** [models.ts](file:///D:/mock-test-runner/server/models.ts) defines schemas for:
  - `Test`: Stores title, subject category (`testType`: 'FULL' | 'ENGLISH' | 'QUANT' | 'REASONING'), marking rules, sections, and questions.
  - `Session`: Stores completed user mock attempts (scores, accuracy, section breakdowns).
- **APIs:** [server.ts](file:///D:/mock-test-runner/server/server.ts) publishes routes:
  - `GET /api/tests` (catalog fetchers with query type parameters)
  - `POST /api/tests` (save new test files to MongoDB)
  - `POST /api/sessions` (save scorecards)
  - `GET /api/sessions/stats` (analytics statistics endpoints)

### 2. Frontend Chart Visualizations (Recharts)
In [ResultsScreen.tsx](file:///D:/mock-test-runner/src/components/ResultsScreen.tsx), the scorecard screen now automatically saves results to MongoDB on landing. It fetches past history from `/api/sessions/stats` and renders:
- **Score Progression Chart:** A Line Chart showing marks scored vs max possible score over past test attempts.
- **Subject Accuracy Breakdown:** A Bar Chart representing average accuracy percentages per subject section across all test attempts.

### 3. Dynamic Sectional Timers
In [UploadScreen.tsx](file:///D:/mock-test-runner/src/components/UploadScreen.tsx), the test preview panel features input fields next to each section. Users can dynamically scale the timer duration (e.g. 5 mins, 20 mins) before triggering the simulator.

### 4. Categorized Test Catalog
The upload dashboard displays a catalog of tests loaded from MongoDB, organized with tabs for quick filtering by category (*Reasoning*, *English*, *Quantitative*, *Full Tests*).

### 5. Import Methods (File Uploader & JSON Paste)
In [UploadScreen.tsx](file:///D:/mock-test-runner/src/components/UploadScreen.tsx), the import card offers dual sub-tabs:
- **Upload File:** Drag and drop or select a `.json` file.
- **Paste JSON Text:** Paste raw JSON text directly into a styled `<textarea>`, with validation feedback upon clicking "Validate & Preview JSON".

### 6. Celebration Animations & Themed Popups
- **Confetti Celebration:** Upon submitting the final section, a canvas confetti explosion triggers.
- **Custom Themed Modals:** Built custom Modal dialogs in [TestTakingScreen.tsx](file:///D:/mock-test-runner/src/components/TestTakingScreen.tsx) replacing native browser alerts and confirmations. Uses glassmorphic blur filters, distinct titles, warning headers, and matching action buttons.
- **Explanation Toggle Button:** Styled in [ResultsScreen.tsx](file:///D:/mock-test-runner/src/components/ResultsScreen.tsx) using the custom `.explanation-toggle` class to render as a clean, text link instead of a default browser button grey block.

---

## Verification & Build Compliance

### 1. Compile Checks
- Running `npx tsc --noEmit` on the frontend results in:
  ```bash
  The command exited with code 0 (no compile errors)
  ```

### 2. How to Run Backend Locally
Open a separate terminal window and start nodemon:
```bash
cd D:\mock-test-runner\server
npm run dev
```
The server will boot on port `5000` and connect to your database configured in `.env`.
