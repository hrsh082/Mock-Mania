import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import { TestModel, SessionModel } from './models.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. Get tests (filtered by type)
app.get('/api/tests', async (req, res) => {
  try {
    const { type } = req.query;
    const filter: any = {};
    if (type && ['FULL', 'ENGLISH', 'QUANT', 'REASONING'].includes(type as string)) {
      filter.testType = type;
    }
    const tests = await TestModel.find(filter).sort({ createdAt: -1 });
    res.json(tests);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Upload a new test
app.post('/api/tests', async (req, res) => {
  try {
    const testData = req.body;
    
    // Check if duplicate title
    const existing = await TestModel.findOne({ testTitle: testData.testTitle });
    if (existing) {
      return res.status(400).json({ error: `A test with title "${testData.testTitle}" already exists in the database.` });
    }

    const test = new TestModel(testData);
    await test.save();
    res.status(201).json(test);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 3. Save completed test session scorecard
app.post('/api/sessions', async (req, res) => {
  try {
    const sessionData = req.body;
    const session = new SessionModel(sessionData);
    await session.save();
    res.status(201).json(session);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 4. Get all test session results (history)
app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await SessionModel.find().sort({ dateTaken: 1 });
    res.json(sessions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Get performance analytics summary
app.get('/api/sessions/stats', async (req, res) => {
  try {
    const sessions = await SessionModel.find().sort({ dateTaken: 1 });
    
    // Format sessions for line chart progression
    const progression = sessions.map((s: any) => ({
      id: s._id,
      testTitle: s.testTitle,
      score: s.totalScore,
      maxScore: s.maxPossibleScore,
      accuracy: s.accuracy,
      date: new Date(s.dateTaken).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }));

    // Calculate section averages
    const sectionStats: Record<string, { totalAccuracy: number; count: number; totalScore: number }> = {};
    
    sessions.forEach((s: any) => {
      s.sectionBreakdown.forEach((sec: any) => {
        const name = sec.sectionName;
        const accuracy = sec.attempted > 0 ? (sec.correct / sec.attempted) * 100 : 0;
        
        if (!sectionStats[name]) {
          sectionStats[name] = { totalAccuracy: 0, count: 0, totalScore: 0 };
        }
        
        sectionStats[name].totalAccuracy += accuracy;
        sectionStats[name].totalScore += sec.score;
        sectionStats[name].count += 1;
      });
    });

    const sectionsBreakdown = Object.keys(sectionStats).map(name => {
      const stat = sectionStats[name];
      return {
        sectionName: name,
        avgAccuracy: Number((stat.totalAccuracy / stat.count).toFixed(2)),
        avgScore: Number((stat.totalScore / stat.count).toFixed(2))
      };
    });

    res.json({
      progression,
      sectionsBreakdown
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on port ${PORT}`);
});
