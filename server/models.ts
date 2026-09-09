import mongoose, { Schema } from 'mongoose';

const OptionSchema = new Schema({
  label: { type: String, required: true },
  text: { type: String, required: false, default: '' },
  imageUrl: { type: String, required: false }
}, { _id: false });

const QuestionSchema = new Schema({
  id: { type: String, required: true },
  questionText: { type: String, required: true },
  passage: { type: String, default: null },
  passageImageUrl: { type: String, required: false },
  imageUrl: { type: String, required: false },
  options: [OptionSchema],
  correctAnswer: { type: String, required: true },
  explanation: { type: String, default: '' },
  explanationImageUrl: { type: String, required: false }
}, { _id: false });

const SectionSchema = new Schema({
  sectionName: { type: String, required: true },
  timeLimitMinutes: { type: Number, required: true },
  questions: [QuestionSchema]
}, { _id: false });

const TestSchema = new Schema({
  testTitle: { type: String, required: true },
  testType: { type: String, enum: ['FULL', 'ENGLISH', 'QUANT', 'REASONING'], default: 'FULL' },
  markingScheme: {
    correct: { type: Number, required: true },
    wrong: { type: Number, required: true },
    unattempted: { type: Number, required: true }
  },
  sections: [SectionSchema]
}, { timestamps: true });

const SectionBreakdownSchema = new Schema({
  sectionName: { type: String, required: true },
  totalQuestions: { type: Number, required: true },
  attempted: { type: Number, required: true },
  correct: { type: Number, required: true },
  wrong: { type: Number, required: true },
  unattempted: { type: Number, required: true },
  score: { type: Number, required: true }
}, { _id: false });

const SessionSchema = new Schema({
  testId: { type: Schema.Types.ObjectId, ref: 'Test', required: false },
  testTitle: { type: String, required: true },
  totalScore: { type: Number, required: true },
  maxPossibleScore: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  dateTaken: { type: Date, default: Date.now },
  sectionBreakdown: [SectionBreakdownSchema]
}, { timestamps: true });

export const TestModel = mongoose.model('Test', TestSchema);
export const SessionModel = mongoose.model('Session', SessionSchema);
