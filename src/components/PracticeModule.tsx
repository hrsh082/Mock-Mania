import React, { useState, useEffect } from 'react';
import { Search, Clock, FileQuestion, Play, SlidersHorizontal, AlertTriangle, BookOpen, MousePointerClick } from 'lucide-react';
import { SlidingTabs } from './SlidingTabs';
import type { Test, TestType } from '../types';
import { fetchTests } from '../utils/api';

interface Props { onStartTest: (test: Test, rawJson: string) => void; }

const TYPE_TABS: { label: string; value: 'ALL' | TestType }[] = [
  { label: 'All',       value: 'ALL'       },
  { label: 'Full Mock', value: 'FULL'      },
  { label: 'English',   value: 'ENGLISH'   },
  { label: 'Quant',     value: 'QUANT'     },
  { label: 'Reasoning', value: 'REASONING' },
];

export const PracticeModule: React.FC<Props> = ({ onStartTest }) => {
  const [tests,    setTests]    = useState<Test[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [tab,      setTab]      = useState<'ALL' | TestType>('ALL');
  const [query,    setQuery]    = useState('');
  const [selected, setSelected] = useState<Test | null>(null);
  const [timers,   setTimers]   = useState<Record<number, number>>({});

  useEffect(() => {
    fetchTests()
      .then(setTests)
      .catch(() => setError('Could not connect to the backend server. Make sure it is running on port 5000.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tests.filter(t => {
    const matchType  = tab === 'ALL' || t.testType === tab;
    const matchQuery = t.testTitle.toLowerCase().includes(query.toLowerCase());
    return matchType && matchQuery;
  });

  const handleSelect = (t: Test) => { setSelected(t); setTimers({}); };

  const handleStart = () => {
    if (!selected) return;
    const customised: Test = {
      ...selected,
      sections: selected.sections.map((s, i) => ({
        ...s,
        timeLimitMinutes: timers[i] !== undefined ? timers[i] : s.timeLimitMinutes
      }))
    };
    onStartTest(customised, JSON.stringify(customised));
  };

  const totalQ   = selected?.sections.reduce((a, s) => a + s.questions.length, 0) ?? 0;
  const totalMin = selected?.sections.reduce((a, s, i) =>
    a + (timers[i] !== undefined ? timers[i] : s.timeLimitMinutes), 0) ?? 0;

  return (
    <div className="page fade-in">
      <div className="page-header">
        <h1 className="page-title">Practice Tests</h1>
        <p className="page-subtitle">Choose a mock test, adjust timers if needed, then start the exam.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 296px', gap: 20, alignItems: 'start' }}>
        {/* LEFT: catalog */}
        <div>
          {/* Filters row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
            {/* ── Sliding pill tabs ── */}
            <SlidingTabs
              tabs={TYPE_TABS}
              value={tab}
              onChange={setTab}
            />
            <div className="search-wrapper">
              <Search className="search-icon" size={13} />
              <input
                className="input input-sm"
                style={{ width: 180 }}
                placeholder="Search tests…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Test list */}
          {loading ? (
            <div className="empty-state">Loading catalog…</div>
          ) : error ? (
            <div className="alert alert-error">
              <AlertTriangle size={16} className="alert-icon" />
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <BookOpen size={22} />
              No tests found. Try a different filter or import a test.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filtered.map(t => {
                const q   = t.sections.reduce((a, s) => a + s.questions.length, 0);
                const min = t.sections.reduce((a, s) => a + s.timeLimitMinutes, 0);
                return (
                  <div
                    key={t._id ?? t.testTitle}
                    className={`test-card${selected?._id === t._id || selected?.testTitle === t.testTitle ? ' selected' : ''}`}
                    onClick={() => handleSelect(t)}
                  >
                    <div className="test-card-title">{t.testTitle}</div>
                    <div className="test-card-meta">
                      <span className={`badge ${t.testType === 'FULL' ? 'badge-green' : 'badge-slate'}`}>{t.testType ?? 'FULL'}</span>
                      <span className="text-subtle" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FileQuestion size={12} /> {q} Qs
                      </span>
                      <span className="text-subtle" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} /> {min} min
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: detail panel */}
        <div>
          {!selected ? (
            <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10, background: 'var(--slate-100)',
                border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 12px', color: 'var(--slate-400)'
              }}>
                <MousePointerClick size={20} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--slate-700)', marginBottom: 4 }}>Select a test</div>
              <div style={{ fontSize: 12, color: 'var(--slate-400)' }}>Click any test from the list to preview and configure it here.</div>
            </div>
          ) : (
            <div className="card slide-up">
              {/* Title */}
              <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--slate-900)', marginBottom: 4 }}>{selected.testTitle}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span className="badge badge-green">{selected.testType ?? 'FULL'}</span>
                  <span className="badge badge-slate">{selected.sections.length} sections</span>
                  <span className="badge badge-slate">{totalQ} questions</span>
                </div>
              </div>

              {/* Timer config */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--slate-500)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <SlidersHorizontal size={12} />
                  Adjust Section Timers
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selected.sections.filter(s => s.questions.length > 0 && s.timeLimitMinutes > 0).map((s, i) => (
                    <div key={i} className="timer-row">
                      <span style={{ fontWeight: 600, color: 'var(--slate-700)', fontSize: 12, flex: 1 }}>{s.sectionName}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          className="timer-input"
                          value={timers[i] !== undefined ? timers[i] : s.timeLimitMinutes}
                          onChange={e => setTimers(p => ({ ...p, [i]: Math.max(0.5, parseFloat(e.target.value) || s.timeLimitMinutes) }))}
                        />
                        <span style={{ fontSize: 11, color: 'var(--slate-400)', fontWeight: 500 }}>min</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <div style={{ flex: 1, background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '8px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--slate-900)' }}>{totalQ}</div>
                  <div style={{ fontSize: 10, color: 'var(--slate-400)', fontWeight: 600 }}>Questions</div>
                </div>
                <div style={{ flex: 1, background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '8px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--slate-900)' }}>{totalMin}</div>
                  <div style={{ fontSize: 10, color: 'var(--slate-400)', fontWeight: 600 }}>Minutes</div>
                </div>
              </div>

              {/* Start button */}
              <button className="btn btn-primary btn-xl" style={{ width: '100%' }} onClick={handleStart}>
                <Play size={15} fill="white" /> Start Exam
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
