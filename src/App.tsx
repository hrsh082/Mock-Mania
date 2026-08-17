import { useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, UploadCloud, History, GraduationCap, AlertTriangle, ArrowRight, User } from 'lucide-react';
import { DashboardModule } from './components/DashboardModule';
import { PracticeModule } from './components/PracticeModule';
import { ImportModule } from './components/ImportModule';
import { HistoryModule } from './components/HistoryModule';
import { TestTakingScreen } from './components/TestTakingScreen';
import { ResultsScreen } from './components/ResultsScreen';
import type { Test, UserResponse } from './types';

type Screen = 'APP' | 'TESTING' | 'RESULTS';
type Module = 'DASHBOARD' | 'PRACTICE' | 'IMPORT' | 'HISTORY';

const LS_KEY = 'exam_portal_session';

interface SavedSession {
  test: Test; rawJson: string; responses: UserResponse[];
  secIdx: number; qIdx: number; secondsLeft: number;
}

const NAV = [
  { id: 'DASHBOARD' as Module, label: 'Dashboard',       Icon: LayoutDashboard },
  { id: 'PRACTICE'  as Module, label: 'Practice Tests',  Icon: BookOpen        },
  { id: 'IMPORT'    as Module, label: 'Import Tests',    Icon: UploadCloud     },
  { id: 'HISTORY'   as Module, label: 'History',         Icon: History         },
];

export default function App() {
  const [screen,   setScreen]   = useState<Screen>('APP');
  const [module,   setModule]   = useState<Module>('DASHBOARD');
  const [test,     setTest]     = useState<Test | null>(null);
  const [rawJson,  setRawJson]  = useState('');
  const [responses,setResponses]= useState<UserResponse[]>([]);
  const [resume,   setResume]   = useState<SavedSession | null>(null);
  const [isResume, setIsResume] = useState(false);

  // Load any saved session
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setResume(JSON.parse(raw));
    } catch { localStorage.removeItem(LS_KEY); }
  }, []);

  // Warn before leaving mid-test
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (screen === 'TESTING') { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [screen]);

  const startTest = (t: Test, json: string) => {
    localStorage.removeItem(LS_KEY);
    setResume(null); setIsResume(false);
    setTest(t); setRawJson(json);
    const init: UserResponse[] = [];
    t.sections.forEach(s => s.questions.forEach(q =>
      init.push({ questionId: q.id, selectedAnswer: null, status: 'NOT_VISITED' })
    ));
    setResponses(init);
    setScreen('TESTING');
  };

  const resumeTest = () => {
    if (!resume) return;
    setTest(resume.test); setRawJson(resume.rawJson);
    setResponses(resume.responses); setIsResume(true);
    setScreen('TESTING');
  };

  const onStateUpdate = (si: number, qi: number, sl: number, r: UserResponse[]) => {
    if (!test) return;
    const s: SavedSession = { test, rawJson, responses: r, secIdx: si, qIdx: qi, secondsLeft: sl };
    localStorage.setItem(LS_KEY, JSON.stringify(s));
    setResponses(r);
  };

  const onSubmit = (final: UserResponse[]) => {
    localStorage.removeItem(LS_KEY);
    setResume(null); setIsResume(false);
    setResponses(final); setScreen('RESULTS');
  };

  const backToApp = () => {
    setTest(null); setRawJson(''); setResponses([]);
    setIsResume(false); setScreen('APP'); setModule('DASHBOARD');
    try { const r = localStorage.getItem(LS_KEY); setResume(r ? JSON.parse(r) : null); }
    catch { setResume(null); }
  };

  /* ── Full-screen exam mode ── */
  if (screen === 'TESTING' && test) {
    return (
      <TestTakingScreen
        test={test}
        onSubmit={onSubmit}
        initialResponses={isResume && resume ? resume.responses : undefined}
        initialSectionIndex={isResume && resume ? resume.secIdx : 0}
        initialQuestionIndex={isResume && resume ? resume.qIdx : 0}
        initialSecondsLeft={isResume && resume ? resume.secondsLeft : undefined}
        onStateUpdate={onStateUpdate}
      />
    );
  }

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <GraduationCap size={18} />
          </div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-name">ExamPortal</span>
            <span className="sidebar-logo-sub">Prep Platform</span>
          </div>
        </div>

        {/* Nav */}
        <p className="sidebar-section-label">Navigation</p>
        <nav className="sidebar-nav">
          {NAV.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`sidebar-link${module === id && screen === 'APP' ? ' active' : ''}`}
              onClick={() => { setScreen('APP'); setModule(id); }}
            >
              <Icon className="nav-icon" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="avatar">
            <User size={14} />
          </div>
          <div>
            <div className="sidebar-user-name">Harsh Gajjar</div>
            <div className="sidebar-user-role">Candidate</div>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="app-content">
        {/* Resume banner */}
        {resume && screen === 'APP' && (
          <div style={{ padding: '12px 32px 0' }}>
            <div className="alert alert-warning fade-in" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={16} className="alert-icon" style={{ flexShrink: 0 }} />
                <div>
                  <strong>Unfinished test detected:</strong> {resume.test.testTitle}
                  <div style={{ fontSize: 11, marginTop: 2, opacity: 0.8 }}>You have an active session in progress.</div>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5 }} onClick={resumeTest}>
                Resume <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {screen === 'APP' && module === 'DASHBOARD' && <DashboardModule />}
        {screen === 'APP' && module === 'PRACTICE'  && <PracticeModule onStartTest={startTest} />}
        {screen === 'APP' && module === 'IMPORT'    && <ImportModule />}
        {screen === 'APP' && module === 'HISTORY'   && <HistoryModule />}

        {screen === 'RESULTS' && test && (
          <ResultsScreen
            test={test}
            responses={responses}
            onRetry={() => startTest(test, rawJson)}
            onUploadNew={backToApp}
          />
        )}
      </main>
    </div>
  );
}
