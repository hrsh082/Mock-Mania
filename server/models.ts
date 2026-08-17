import mongoose from 'mongoose';

const OptionSchema = new mongoose.Schema({
  label: { type: String, required: true },
  text: { type: String, required: true }
}, { _id: false });

const QuestionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  questionText: { type: String, required: true },
  passage: { type: String, default: null },
  options: [OptionSchema],
  correctAnswer: { type: String, required: true },
  explanation: { type: String, default: '' }
}, { _id: false });

const SectionSchema = new mongoose.Schema({
  sectionName: { type: String, required: true },
  timeLimitMinutes: { type: Number, required: true },
  questions: [QuestionSchema]
}, { _id: false });

const TestSchema = new mongoose.Schema({
  testTitle: { type: String, required: true },
  testType: { type: String, enum: ['FULL', 'ENGLISH', 'QUANT', 'REASONING'], default: 'FULL' },
  markingScheme: {
    correct: { type: Number, required: true },
    wrong: { type: Number, required: true },
    unattempted: { type: Number, required: true }
  },
  sections: [SectionSchema]
}, { timestamps: true });

const SectionBreakdownSchema = new mongoose.Schema({
  sectionName: { type: String, required: true },
  totalQuestions: { type: Number, required: true },
  attempted: { type: Number, required: true },
  correct: { type: Number, required: true },
  wrong: { type: Number, required: true },
  unattempted: { type: Number, required: true },
  score: { type: Number, required: true }
}, { _id: false });

const SessionSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: false },
  testTitle: { type: String, required: true },
  totalScore: { type: Number, required: true },
  maxPossibleScore: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  dateTaken: { type: Date, default: Date.now },
  sectionBreakdown: [SectionBreakdownSchema]
}, { timestamps: true });

export const TestModel = mongoose.model('Test', TestSchema);
export const SessionModel = mongoose.model('Session', SessionSchema);
