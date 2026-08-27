import React, { useState, useEffect } from 'react';
import {
  Award, CheckCircle2, XCircle, HelpCircle, BarChart2, Bookmark,
  RefreshCw, TrendingUp, ChevronDown, ChevronUp,
  ArrowLeft, Minus, BookOpen, Target, Zap, Hash
} from 'lucide-react';
import type { Test, UserResponse, GrandResult } from '../types';
import { calculateResults } from '../utils/scoring';
import { submitSessionResult, fetchPerformanceStats } from '../utils/api';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

interface Props {
  test: Test;
  responses: UserResponse[];
  onRetry: () => void;
  onUploadNew: () => void;
}

type Filter = 'ALL' | 'CORRECT' | 'WRONG' | 'SKIPPED' | 'MARKED';

export const ResultsScreen: React.FC<Props> = ({ test, responses, onRetry, onUploadNew }) => {
  const result: GrandResult = calculateResults(test, responses);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState<{ progression: any[]; sectionsBreakdown: any[] } | null>(null);
  const [dbError, setDbError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        await submitSessionResult({
          testId: test._id,
          testTitle: test.testTitle,
          totalScore: result.totalScore,
          maxPossibleScore: result.maxPossibleScore,
          accuracy: result.accuracy,
          sectionBreakdown: result.sectionResults.map(s => ({
            sectionName: s.sectionName, totalQuestions: s.totalQuestions,
            attempted: s.attempted, correct: s.correct, wrong: s.wrong,
            unattempted: s.unattempted, score: s.score
          }))
        });
        const s = await fetchPerformanceStats();
        setStats(s);
      } catch {
        setDbError('Could not save to database — ensure the server is running.');
      }
    };
    run();
  }, []);

  const respMap   = new Map(responses.map(r => [r.questionId, r.selectedAnswer]));
  const statusMap = new Map(responses.map(r => [r.questionId, r.status]));

  const allQs: Array<{ q: any; section: string }> = [];
  test.sections.forEach(s => {
    if (s.timeLimitMinutes > 0 && s.questions.length > 0) {
      s.questions.forEach(q => allQs.push({ q, section: s.sectionName }));
    }
  });

  const filtered = allQs.filter(({ q }) => {
    const sel = respMap.get(q.id);
    const st  = statusMap.get(q.id);
    if (filter === 'CORRECT') return sel === q.correctAnswer;
    if (filter === 'WRONG')   return sel != null && sel !== q.correctAnswer;
    if (filter === 'SKIPPED') return sel == null;
    if (filter === 'MARKED')  return st === 'MARKED_FOR_REVIEW' || st === 'MARKED_AND_ANSWERED';
    return true;
  });

  const scorePercent = Math.max(0, Math.min(100, (result.totalScore / result.maxPossibleScore) * 100));
  const r = 38; const circ = 2 * Math.PI * r;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12, boxShadow: 'var(--shadow-md)' }}>
        <div style={{ color: 'var(--gray-500)', marginBottom: 4, fontWeight: 600 }}>{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</div>
        ))}
      </div>
    );
  };

  const FILTERS: { key: Filter; label: string; icon: any; color: string }[] = [
    { key: 'ALL',     label: 'All',     icon: Hash,        color: 'var(--gray-500)' },
    { key: 'CORRECT', label: 'Correct', icon: CheckCircle2, color: 'var(--green-600)' },
    { key: 'WRONG',   label: 'Wrong',   icon: XCircle,      color: 'var(--red-500)'   },
    { key: 'SKIPPED', label: 'Skipped', icon: Minus,        color: 'var(--gray-400)'  },
    { key: 'MARKED',  label: 'Marked',  icon: Bookmark,    color: 'var(--apple-purple)' },
  ];

  const countFor = (f: Filter) => {
    if (f === 'ALL')     return allQs.length;
    if (f === 'CORRECT') return result.totalCorrect;
    if (f === 'WRONG')   return result.totalWrong;
    if (f === 'SKIPPED') return result.totalUnattempted;
    return responses.filter(r => r.status === 'MARKED_FOR_REVIEW' || r.status === 'MARKED_AND_ANSWERED').length;
  };

  return (
    <div className="page fade-in">

      {/* ── db error ── */}
      {dbError && (
        <div className="alert alert-warning" style={{ marginBottom: 16 }}>
          <span className="alert-icon">⚠</span> {dbError}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          HERO BANNER
      ══════════════════════════════════════════════════ */}
      <div style={{
        background: 'var(--sidebar-bg)',
        borderRadius: 'var(--r-2xl)',
        padding: '28px 32px',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.04)',
      }}>
        {/* decorative blobs */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 260, height: 260, borderRadius: '50%', background: 'rgba(79,70,229,0.12)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: 160, width: 180, height: 180, borderRadius: '50%', background: 'rgba(129,140,248,0.06)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, position: 'relative' }}>
          {/* Score ring */}
          <div style={{ position: 'relative', width: 94, height: 94, flexShrink: 0 }}>
            <svg width="94" height="94" viewBox="0 0 94 94" style={{ position: 'absolute' }}>
              <circle cx="47" cy="47" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
              <circle cx="47" cy="47" r={r} fill="none"
                stroke="#818CF8" strokeWidth="9"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - scorePercent / 100)}
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '47px 47px', transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 20, fontWeight: 600, color: 'white', letterSpacing: '-0.03em', lineHeight: 1 }}>{result.totalScore}</span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 600, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>/ {result.maxPossibleScore}</span>
            </div>
          </div>

          {/* Title + stats */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.25, marginBottom: 4 }}>
              {test.testTitle}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 500, marginBottom: 18 }}>
              Test completed · Results saved to database
            </div>

            {/* Inline stat pills */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { label: 'Questions', value: result.totalQuestions, icon: Hash,         color: 'rgba(255,255,255,0.9)' },
                { label: 'Correct',   value: result.totalCorrect,   icon: CheckCircle2, color: '#4ade80' },
                { label: 'Wrong',     value: result.totalWrong,     icon: XCircle,      color: '#f87171' },
                { label: 'Accuracy',  value: `${result.accuracy}%`, icon: Target,       color: '#818CF8' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 14px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <Icon size={13} style={{ color, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 600, color, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, alignSelf: 'center' }}>
            <button className="btn btn-secondary btn-sm" onClick={onRetry} style={{ gap: 6 }}>
              <RefreshCw size={12} /> Retry
            </button>
            <button onClick={onUploadNew} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.3)', fontSize: 11.5, fontFamily: 'var(--font)',
              fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 6px',
            }}>
              <ArrowLeft size={12} /> Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          CHARTS STRIP (only if ≥2 history sessions)
      ══════════════════════════════════════════════════ */}
      {stats && stats.progression.length >= 2 && (
        <div className="grid-2" style={{ marginBottom: 24 }}>
          {/* Score progression */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '18px 20px', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--indigo-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={13} style={{ color: 'var(--indigo-600)' }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Score Progression</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={stats.progression} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#818CF8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#818CF8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#e2e8f0" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis stroke="#e2e8f0" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" name="Score" stroke="#4F46E5" strokeWidth={2} fill="url(#gR)" dot={{ r: 3, fill: '#4F46E5', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Section accuracy */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '18px 20px', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--indigo-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart2 size={13} style={{ color: 'var(--indigo-600)' }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Section Accuracy</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={stats.sectionsBreakdown} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="sectionName" stroke="#e2e8f0" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis stroke="#e2e8f0" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avgAccuracy" name="Avg %" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          SECTION BREAKDOWN — flat table, no card wrap
      ══════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Award size={15} style={{ color: 'var(--indigo-600)' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Section Breakdown</span>
        </div>

        <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
          {/* header row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 60px 80px 70px 70px 70px 80px',
            gap: 0, padding: '9px 20px',
            background: 'var(--gray-50)',
            borderBottom: '1px solid var(--border)',
          }}>
            {['Section', 'Total', 'Attempted', '✓ Correct', '✗ Wrong', '– Skip', 'Score'].map((h, i) => (
              <div key={h} style={{
                fontSize: 10, fontWeight: 600, color: 'var(--gray-500)',
                textTransform: 'uppercase', letterSpacing: '0.07em',
                textAlign: i > 0 ? 'center' : 'left',
              }}>{h}</div>
            ))}
          </div>

          {/* data rows */}
          {result.sectionResults.map((s, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '2fr 60px 80px 70px 70px 70px 80px',
              padding: '12px 20px', borderBottom: '1px solid var(--gray-100)',
              alignItems: 'center',
            }}>
              <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--gray-900)' }}>{s.sectionName}</div>
              <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--gray-600)', fontWeight: 600 }}>{s.totalQuestions}</div>
              <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--gray-700)', fontWeight: 600 }}>{s.attempted}</div>
              <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 600, color: 'var(--green-600)' }}>{s.correct}</div>
              <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 600, color: 'var(--red-500)' }}>{s.wrong}</div>
              <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--gray-400)', fontWeight: 600 }}>{s.unattempted}</div>
              <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--gray-900)' }}>
                {s.score} <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>/ {s.maxPossibleScore}</span>
              </div>
            </div>
          ))}

          {/* grand total */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 60px 80px 70px 70px 70px 80px',
            padding: '12px 20px', background: 'var(--indigo-50)',
            borderTop: '2px solid var(--indigo-100)', alignItems: 'center',
          }}>
            <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--indigo-900)' }}>Grand Total</div>
            <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--indigo-800)' }}>{result.totalQuestions}</div>
            <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--indigo-800)' }}>{result.totalAttempted}</div>
            <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 600, color: 'var(--green-600)' }}>{result.totalCorrect}</div>
            <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 600, color: 'var(--red-500)' }}>{result.totalWrong}</div>
            <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--gray-500)' }}>{result.totalUnattempted}</div>
            <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 600, color: 'var(--indigo-700)' }}>
              {result.totalScore} <span style={{ color: 'var(--indigo-400)', fontWeight: 400 }}>/ {result.maxPossibleScore}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          QUESTION REVIEW — continuous list, NO card-per-question
      ══════════════════════════════════════════════════ */}
      <div>
        {/* Header + filter tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOpen size={15} style={{ color: 'var(--indigo-600)' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Question Review
            </span>
            <span style={{ fontSize: 12, color: 'var(--gray-400)', fontWeight: 500 }}>
              ({filtered.length} of {allQs.length})
            </span>
          </div>

          {/* Filter pills */}
          <div style={{ display: 'flex', gap: 6 }}>
            {FILTERS.map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 12px', borderRadius: 99,
                  fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'var(--font)',
                  transition: 'all 0.15s',
                  background: filter === key ? 'var(--indigo-600)' : 'white',
                  color: filter === key ? 'white' : 'var(--gray-500)',
                  border: filter === key ? '1px solid var(--indigo-600)' : '1px solid var(--border)',
                  boxShadow: filter === key ? 'var(--shadow-indigo)' : 'var(--shadow-xs)',
                }}
              >
                <Icon size={11} style={{ color: filter === key ? 'white' : color }} />
                {label}
                <span style={{
                  minWidth: 18, height: 18, borderRadius: 99, fontSize: 10, fontWeight: 600,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: filter === key ? 'rgba(255,255,255,0.2)' : 'var(--gray-100)',
                  color: filter === key ? 'white' : 'var(--gray-500)',
                }}>
                  {countFor(key)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Question list */}
        {filtered.length === 0 ? (
          <div className="empty-state">No questions match this filter.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(({ q, section }, idx) => {
              const sel  = respMap.get(q.id);
              const ok   = sel === q.correctAnswer;
              const skip = sel == null;
              const isEx = expanded[q.id];
              const isMk = statusMap.get(q.id) === 'MARKED_FOR_REVIEW' || statusMap.get(q.id) === 'MARKED_AND_ANSWERED';

              // Status strip color
              const strip = skip ? '#d1d5db' : ok ? '#10b981' : '#ef4444';

              return (
                <div key={q.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
                  {/* ── Question row ── */}
                  <div style={{ display: 'flex', gap: 0 }}>
                    {/* Left status strip */}
                    <div style={{ width: 4, background: strip, flexShrink: 0 }} />

                    <div style={{ flex: 1, padding: '16px 20px 16px 18px' }}>
                      {/* Meta row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {skip
                            ? <HelpCircle  size={14} style={{ color: '#9ca3af' }} />
                            : ok
                            ? <CheckCircle2 size={14} style={{ color: '#10b981' }} />
                            : <XCircle     size={14} style={{ color: '#ef4444' }} />
                          }
                          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {section} · Q{idx + 1}
                          </span>
                        </div>
                        <span style={{
                          fontSize: 10.5, fontWeight: 600, padding: '2px 9px', borderRadius: 99,
                          background: skip ? 'var(--gray-100)' : ok ? '#d1fae5' : '#fee2e2',
                          color: skip ? 'var(--gray-500)' : ok ? '#065f46' : '#991b1b',
                          border: `1px solid ${skip ? 'var(--gray-200)' : ok ? '#a7f3d0' : '#fecaca'}`,
                        }}>
                          {skip ? 'Skipped' : ok ? 'Correct' : 'Wrong'}
                        </span>
                      </div>

                      {/* Passage (collapsed preview) */}
                      {q.passage && (
                        <div style={{
                          fontSize: 12, color: 'var(--gray-500)', lineHeight: 1.6,
                          background: 'var(--gray-50)', borderRadius: 8, padding: '8px 12px',
                          marginBottom: 10, borderLeft: '2px solid var(--indigo-200)',
                          maxHeight: 80, overflow: 'hidden',
                          position: 'relative',
                        }}>
                          <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--indigo-400)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 3 }}>Passage</span>
                          {q.passage}
                        </div>
                      )}

                      {/* Question text */}
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--gray-900)', lineHeight: 1.65, marginBottom: 14, letterSpacing: '-0.01em' }}>
                        {q.questionText}
                      </div>

                      {/* ── Options — horizontal for short, vertical for long ── */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {q.options.map((opt: any) => {
                          const isCorrect  = opt.label === q.correctAnswer;
                          const isSelected = sel === opt.label;
                          const isWrong    = isSelected && !isCorrect;

                          let bg     = 'var(--gray-50)';
                          let border = 'var(--gray-200)';
                          let color  = 'var(--gray-700)';
                          let lblBg  = 'var(--gray-200)';
                          let lblClr = 'var(--gray-600)';

                          if (isCorrect) {
                            bg     = '#f0fdf4'; border = '#10b981'; color = '#065f46';
                            lblBg  = '#10b981'; lblClr = 'white';
                          } else if (isWrong) {
                            bg     = '#fef2f2'; border = '#ef4444'; color = '#991b1b';
                            lblBg  = '#ef4444'; lblClr = 'white';
                          }

                          return (
                            <div key={opt.label} style={{
                              display: 'flex', alignItems: 'flex-start', gap: 10,
                              padding: '9px 12px', borderRadius: 8,
                              background: bg, border: `1.5px solid ${border}`,
                              fontSize: 13, color, lineHeight: 1.5,
                            }}>
                              <span style={{
                                minWidth: 22, height: 22, borderRadius: 5,
                                background: lblBg, color: lblClr,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 10.5, fontWeight: 600, flexShrink: 0,
                              }}>{opt.label}</span>
                              <span style={{ flex: 1 }}>{opt.text}</span>
                              {isCorrect && <CheckCircle2 size={14} style={{ flexShrink: 0, color: '#10b981', marginTop: 2 }} />}
                              {isWrong   && <XCircle     size={14} style={{ flexShrink: 0, color: '#ef4444', marginTop: 2 }} />}
                            </div>
                          );
                        })}
                      </div>

                      {/* ── Answer summary ── */}
                      <div style={{
                        marginTop: 12, display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
                        fontSize: 12,
                      }}>
                        <div style={{ display: 'flex', gap: 16, color: 'var(--gray-500)' }}>
                          <span>
                            Your answer: <strong style={{ color: ok ? '#10b981' : sel ? '#ef4444' : 'var(--gray-400)' }}>
                              {sel ?? '—'}
                            </strong>
                          </span>
                          <span>
                            Correct: <strong style={{ color: '#10b981' }}>{q.correctAnswer}</strong>
                          </span>
                        </div>
                        {q.explanation && (
                          <button
                            onClick={() => setExpanded(p => ({ ...p, [q.id]: !p[q.id] }))}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: 'var(--indigo-600)', fontWeight: 600, fontSize: 12,
                              fontFamily: 'var(--font)', padding: '2px 0',
                            }}
                          >
                            {isEx ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            {isEx ? 'Hide explanation' : 'Show explanation'}
                          </button>
                        )}
                      </div>

                      {/* Explanation (expandable) */}
                      {isEx && q.explanation && (
                        <div className="fade-in" style={{
                          marginTop: 10, padding: '12px 14px',
                          background: 'var(--indigo-50)',
                          border: '1px solid var(--indigo-100)',
                          borderRadius: 8, fontSize: 13, color: 'var(--indigo-800)', lineHeight: 1.7,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, fontWeight: 600, color: 'var(--indigo-700)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            <Zap size={12} /> Explanation
                          </div>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
