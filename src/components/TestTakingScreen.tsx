import React, { useState, useEffect } from 'react';
import { Clock, ChevronRight, Bookmark, AlertCircle, Eye, EyeOff, LayoutGrid } from 'lucide-react';
import type { Test, UserResponse, QuestionStatus } from '../types';
import confetti from 'canvas-confetti';

interface Props {
  test: Test;
  onSubmit: (responses: UserResponse[]) => void;
  initialResponses?: UserResponse[];
  initialSectionIndex?: number;
  initialQuestionIndex?: number;
  initialSecondsLeft?: number;
  onStateUpdate?: (si: number, qi: number, sl: number, r: UserResponse[]) => void;
}

export const TestTakingScreen: React.FC<Props> = ({
  test, onSubmit,
  initialResponses, initialSectionIndex = 0,
  initialQuestionIndex = 0, initialSecondsLeft,
  onStateUpdate
}) => {
  const activeSections = test.sections.filter(s => s.timeLimitMinutes > 0 && s.questions.length > 0);
  const [secIdx,   setSecIdx]   = useState(initialSectionIndex);
  const [qIdx,     setQIdx]     = useState(initialQuestionIndex);
  const [showPass, setShowPass] = useState(true);
  const [modal, setModal] = useState<{
    open: boolean; title: string; body: string;
    confirm?: () => void; cancel?: () => void;
  }>({ open: false, title: '', body: '' });

  const [responses, setResponses] = useState<UserResponse[]>(() => {
    if (initialResponses?.length) return initialResponses;
    const init: UserResponse[] = [];
    test.sections.forEach(s => s.questions.forEach(q =>
      init.push({ questionId: q.id, selectedAnswer: null, status: 'NOT_VISITED' })
    ));
    return init;
  });

  const sec = activeSections[secIdx];
  const q   = sec?.questions[qIdx];

  const [secsLeft, setSecsLeft] = useState(() =>
    initialSecondsLeft !== undefined ? initialSecondsLeft : Math.floor(sec.timeLimitMinutes * 60)
  );

  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  // mark first view
  useEffect(() => {
    if (!q) return;
    setResponses(prev => prev.map(r =>
      r.questionId === q.id && r.status === 'NOT_VISITED'
        ? { ...r, status: 'NOT_ANSWERED' }
        : r
    ));
  }, [qIdx, secIdx]);

  // timer
  useEffect(() => {
    if (secsLeft <= 0) { handleTimeout(); return; }
    const t = setInterval(() => {
      setSecsLeft(p => {
        const n = p - 1;
        onStateUpdate?.(secIdx, qIdx, n, responses);
        return n;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [secsLeft, secIdx]);

  useEffect(() => {
    onStateUpdate?.(secIdx, qIdx, secsLeft, responses);
  }, [responses, qIdx, secIdx]);

  const getResp = (id: string) => responses.find(r => r.questionId === id);

  const updateResp = (id: string, status: QuestionStatus, ans?: string | null) => {
    setResponses(prev => prev.map(r => {
      if (r.questionId !== id) return r;
      if (status === 'NOT_ANSWERED') return { ...r, status, selectedAnswer: null };
      return {
        ...r,
        status,
        selectedAnswer: ans !== undefined ? ans : r.selectedAnswer
      };
    }));
  };

  const handleSelect = (label: string) => {
    if (!q) return;
    const cur = getResp(q.id);
    const newStatus: QuestionStatus =
      cur?.status === 'MARKED_FOR_REVIEW' || cur?.status === 'MARKED_AND_ANSWERED'
        ? 'MARKED_AND_ANSWERED'
        : 'ANSWERED';
    updateResp(q.id, newStatus, label);
  };

  const handleClear = () => { if (q) updateResp(q.id, 'NOT_ANSWERED', null); };

  const goNext = () => {
    if (qIdx < sec.questions.length - 1) {
      setQIdx(qIdx + 1);
    } else {
      openAlert('End of Section', `You've reached the last question. Use the question palette to review, or submit the section.`);
    }
  };

  const handleSaveNext = () => {
    if (q) {
      const cur = getResp(q.id);
      if (!cur?.selectedAnswer) updateResp(q.id, 'NOT_ANSWERED');
    }
    goNext();
  };

  const handleMarkNext = () => {
    if (!q) return;
    const cur = getResp(q.id);
    updateResp(q.id, cur?.selectedAnswer ? 'MARKED_AND_ANSWERED' : 'MARKED_FOR_REVIEW');
    goNext();
  };

  const handleTimeout = () => {
    const isLast = secIdx === activeSections.length - 1;
    if (!isLast) {
      openAlert('Time Up!', `Time is up for "${sec.sectionName}". Moving to the next section.`, () => advanceSection());
    } else {
      openAlert('Time Up!', 'Time is up for the final section. Submitting your test.', () => submitTest());
    }
  };

  const handleSubmitSection = () => {
    const isLast = secIdx === activeSections.length - 1;
    openConfirm(
      isLast ? 'Submit Test?' : 'Submit Section?',
      isLast
        ? 'Are you sure you want to submit the full test? This cannot be undone.'
        : `Submit "${sec.sectionName}"? You cannot return to this section.`,
      () => isLast ? submitTest() : advanceSection()
    );
  };

  const advanceSection = () => {
    const n = secIdx + 1;
    setSecIdx(n); setQIdx(0);
    setSecsLeft(Math.floor(activeSections[n].timeLimitMinutes * 60));
  };

  const submitTest = () => {
    try { confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } }); } catch {}
    onSubmit(responses);
  };

  const openAlert   = (title: string, body: string, confirm?: () => void) =>
    setModal({ open: true, title, body, confirm: confirm ?? (() => {}) });

  const openConfirm = (title: string, body: string, confirm: () => void, cancel?: () => void) =>
    setModal({ open: true, title, body, confirm, cancel });

  const closeModal  = () => setModal(p => ({ ...p, open: false }));

  if (!sec || !q) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 12, color: '#64748b' }}>
        <AlertCircle size={40} color="#ef4444" />
        <strong>No active sections found.</strong>
      </div>
    );
  }

  const curResp    = getResp(q.id);
  const isPassage  = !!q.passage;
  const timerCls   = secsLeft < 60 ? 'timer-danger' : secsLeft < 120 ? 'timer-warning' : 'timer-normal';

  return (
    <div className="exam-shell">
      {/* ── Top bar ── */}
      <header className="exam-topbar">
        <div>
          <div className="exam-topbar-title">{test.testTitle}</div>
          <div className="exam-topbar-section">{sec.sectionName}</div>
        </div>

        {/* Section pills */}
        <div style={{ display: 'flex', gap: 6, overflow: 'hidden', flex: 1, justifyContent: 'center' }}>
          {activeSections.map((s, i) => (
            <div key={i} style={{
              padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600,
              background: i === secIdx ? 'var(--indigo-600)' : i < secIdx ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.04)',
              color: i === secIdx ? '#fff' : i < secIdx ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.4)',
              border: i === secIdx ? '1px solid rgba(129,140,248,0.4)' : '1px solid rgba(255,255,255,0.07)',
              whiteSpace: 'nowrap'
            }}>
              {s.sectionName}{i < secIdx ? ' ✓' : ''}
            </div>
          ))}
        </div>

        {/* Timer */}
        <div className={`timer-display ${timerCls}`}>
          <Clock size={16} />
          <span>{fmt(secsLeft)}</span>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="exam-body">
        {/* Main question area */}
        <div className="exam-main">
          {/* Passage */}
          {isPassage && showPass && (
            <div className="passage-card fade-in">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--green-700)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Reading Passage
                </span>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowPass(false)} style={{ gap: 4 }}>
                  <EyeOff size={13} /> Hide
                </button>
              </div>
              <div style={{ lineHeight: 1.85, fontSize: 13.5, color: 'var(--slate-700)', whiteSpace: 'pre-wrap' }}>
                {q.passage}
              </div>
            </div>
          )}

          {isPassage && !showPass && (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowPass(true)} style={{ alignSelf: 'flex-start' }}>
              <Eye size={13} /> Show Passage
            </button>
          )}

          {/* Question card */}
          <div className="question-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span className="question-num">Question {qIdx + 1} of {sec.questions.length}</span>
              {(curResp?.status === 'MARKED_FOR_REVIEW' || curResp?.status === 'MARKED_AND_ANSWERED') && (
                <span className="badge badge-violet">
                  <Bookmark size={10} /> Marked for review
                </span>
              )}
            </div>

            <div className="question-text">{q.questionText}</div>

            <div className="option-list">
              {q.options.map(opt => {
                const sel = curResp?.selectedAnswer === opt.label;
                return (
                  <button
                    key={opt.label}
                    className={`option-btn${sel ? ' selected' : ''}`}
                    onClick={() => handleSelect(opt.label)}
                  >
                    <span className="option-label">{opt.label}</span>
                    <span style={{ flex: 1 }}>{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="q-actions" style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-ghost btn-sm" onClick={handleClear} disabled={!curResp?.selectedAnswer}>
                Clear Response
              </button>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={handleMarkNext} style={{ color: 'var(--violet-500)', borderColor: '#ddd6fe' }}>
                  <Bookmark size={13} /> Mark & Next
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleSaveNext}>
                  Save & Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right palette ── */}
        <aside className="exam-palette">
          <div className="palette-header">
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--slate-700)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <LayoutGrid size={14} style={{ color: 'var(--green-700)' }} />
              Question Palette
            </span>
          </div>

          {/* Section tabs if multiple */}
          {activeSections.length > 1 && (
            <div className="palette-section-tabs">
              {activeSections.map((s, i) => (
                <button
                  key={i}
                  className={`palette-section-tab${i === secIdx ? ' active' : ''}`}
                  onClick={() => { if (i <= secIdx) { setSecIdx(i); setQIdx(0); } }}
                  disabled={i > secIdx}
                >
                  {s.sectionName}
                </button>
              ))}
            </div>
          )}

          {/* Grid */}
          <div className="palette-grid">
            {sec.questions.map((sq, i) => {
              const r = getResp(sq.id);
              let cls = 'pq-not-visited';
              if (r) {
                if (r.status === 'NOT_ANSWERED')        cls = 'pq-not-answered';
                else if (r.status === 'ANSWERED')       cls = 'pq-answered';
                else if (r.status === 'MARKED_FOR_REVIEW' || r.status === 'MARKED_AND_ANSWERED') cls = 'pq-marked';
              }
              return (
                <button
                  key={sq.id}
                  className={`pq-btn ${cls}${i === qIdx ? ' active-q' : ''}`}
                  onClick={() => setQIdx(i)}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="palette-legend">
            {[
              ['pq-not-visited',  '#cbd5e1', 'Not visited'],
              ['pq-not-answered', '#fca5a5', 'Not answered'],
              ['pq-answered',     '#6ee7b7', 'Answered'],
              ['pq-marked',       '#c4b5fd', 'Marked'],
            ].map(([, color, label]) => (
              <div key={label} className="legend-item">
                <div className="legend-dot" style={{ background: color }} />
                {label}
              </div>
            ))}
          </div>

          {/* Submit */}
          <div className="palette-submit-area">
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSubmitSection}>
              {secIdx === activeSections.length - 1 ? 'Submit Test' : 'Submit Section →'}
            </button>
          </div>
        </aside>
      </div>

      {/* ── Modal ── */}
      {modal.open && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon-wrap" style={{ background: 'var(--indigo-50)', color: 'var(--indigo-700)' }}>
                <AlertCircle size={18} />
              </div>
              <span className="modal-title">{modal.title}</span>
            </div>
            <div className="modal-body">{modal.body}</div>
            <div className="modal-actions">
              {modal.cancel && (
                <button className="btn btn-secondary" onClick={() => { closeModal(); modal.cancel?.(); }}>
                  Cancel
                </button>
              )}
              <button className="btn btn-primary" onClick={() => { closeModal(); modal.confirm?.(); }}>
                {modal.cancel ? 'Confirm' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
