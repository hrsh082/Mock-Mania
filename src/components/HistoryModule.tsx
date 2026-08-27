import React, { useState, useEffect } from 'react';
import {
  History, ChevronDown, ChevronUp, BarChart2,
  Calendar, Target, Award, Trash2, RotateCcw,
  Search, GitCompare, X, AlertTriangle
} from 'lucide-react';
import { fetchSessionsHistory, deleteSession } from '../utils/api';

interface Props { onRetake?: (testId: string) => void; }

export const HistoryModule: React.FC<Props> = ({ onRetake }) => {
  const [sessions,  setSessions]  = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [search,    setSearch]    = useState('');
  const [dateFilter,setDateFilter]= useState<'ALL'|'WEEK'|'MONTH'>('ALL');
  const [compareIds,setCompareIds]= useState<string[]>([]);
  const [showCompare,setShowCompare]=useState(false);

  useEffect(() => {
    fetchSessionsHistory()
      .then(data => setSessions(Array.isArray(data) ? data.slice().reverse() : []))
      .catch(e => setError(e.message ?? 'Failed to load history'))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: string) => setExpanded(p => p === id ? null : id);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete session for "${title}"? This cannot be undone.`)) return;
    try {
      await deleteSession(id);
      setSessions(prev => prev.filter(s => s._id !== id));
      if (compareIds.includes(id)) setCompareIds(prev => prev.filter(x => x !== id));
    } catch { alert('Failed to delete session.'); }
  };

  const toggleCompare = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const now = Date.now();
  const filtered = sessions.filter(s => {
    const matchSearch = s.testTitle?.toLowerCase().includes(search.toLowerCase());
    const date = new Date(s.createdAt).getTime();
    const matchDate =
      dateFilter === 'ALL'   ? true :
      dateFilter === 'WEEK'  ? (now - date) < 7  * 86400000 :
                               (now - date) < 30 * 86400000;
    return matchSearch && matchDate;
  });

  const totalTests = sessions.length;
  const avgAcc  = totalTests ? Math.round(sessions.reduce((a, s) => a + (s.accuracy ?? 0), 0) / totalTests) : 0;
  const best    = totalTests ? Math.max(...sessions.map(s => s.totalScore ?? 0)) : 0;

  const cmpSessions = compareIds.map(id => sessions.find(s => s._id === id)).filter(Boolean);

  return (
    <div className="page fade-in">
      <div className="page-header">
        <h1 className="page-title">History & Reports</h1>
        <p className="page-subtitle">Review all your past attempts and sectional performance breakdowns.</p>
      </div>

      {/* Summary strip */}
      {!loading && totalTests > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Total Attempts', value: totalTests, icon: History,  color: 'var(--apple-blue)',   bg: 'var(--blue-bg)' },
            { label: 'Avg Accuracy',   value: `${avgAcc}%`, icon: Target, color: 'var(--green-500)',    bg: 'var(--green-bg)' },
            { label: 'Personal Best',  value: best,   icon: Award,        color: 'var(--apple-purple)', bg: 'var(--purple-bg)' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} style={{ flex: 1, background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={17} style={{ color }} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.03em' }}>{value}</div>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 3 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters row */}
      {!loading && totalTests > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div className="search-wrapper" style={{ flex: 1, minWidth: 200 }}>
            <Search className="search-icon" size={13} />
            <input className="input input-sm" style={{ paddingLeft: 30 }} placeholder="Search by test name" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {/* Date filter */}
          <div style={{ display: 'flex', background: 'rgba(118,118,128,0.10)', borderRadius: 9, padding: 3, gap: 2 }}>
            {(['ALL','WEEK','MONTH'] as const).map(d => (
              <button key={d} onClick={() => setDateFilter(d)} style={{
                padding: '5px 12px', borderRadius: 7, border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 11.5, fontWeight: 600,
                background: dateFilter === d ? '#fff' : 'transparent',
                color: dateFilter === d ? 'var(--text-primary)' : 'var(--text-tertiary)',
                boxShadow: dateFilter === d ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.12s',
              }}>{d === 'ALL' ? 'All Time' : d === 'WEEK' ? 'This Week' : 'This Month'}</button>
            ))}
          </div>
          {/* Compare button */}
          {compareIds.length === 2 && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowCompare(true)} style={{ gap: 5 }}>
              <GitCompare size={13} /> Compare 2
            </button>
          )}
          {compareIds.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={() => setCompareIds([])} style={{ color: 'var(--text-tertiary)' }}>
              <X size={13} /> Clear
            </button>
          )}
        </div>
      )}

      {compareIds.length > 0 && compareIds.length < 2 && (
        <div className="alert alert-info" style={{ marginBottom: 12 }}>
          <GitCompare size={14} className="alert-icon" />
          Select one more session to compare ({2 - compareIds.length} remaining)
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          <AlertTriangle size={14} className="alert-icon" /> {error}
        </div>
      )}

      {loading ? (
        <div className="empty-state">Loading history�</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <History size={24} />
          {search ? 'No sessions match your search.' : 'No test sessions yet. Complete a test to see it here.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(s => {
            const isOpen = expanded === s._id;
            const acc    = s.accuracy ?? 0;
            const ok     = acc >= 70;
            const mid    = acc >= 50;
            const isCompared = compareIds.includes(s._id);
            const dateStr = new Date(s.createdAt ?? Date.now()).toLocaleString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            return (
              <div key={s._id} style={{
                background: 'rgba(255,255,255,0.88)', border: `1.5px solid ${isCompared ? 'var(--apple-blue)' : 'rgba(0,0,0,0.06)'}`,
                borderRadius: 14, overflow: 'hidden',
                boxShadow: isCompared ? '0 0 0 3px rgba(0,122,255,0.10)' : '0 1px 3px rgba(0,0,0,0.05)',
              }}>
                {/* Row header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px' }}>
                  {/* Compare checkbox */}
                  <input type="checkbox" checked={isCompared} onChange={() => toggleCompare(s._id)}
                    title="Select to compare" style={{ width: 15, height: 15, cursor: 'pointer', flexShrink: 0 }} />

                  {/* Score bubble */}
                  <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: 'var(--apple-blue)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => toggle(s._id)}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'white', lineHeight: 1 }}>{s.totalScore}</span>
                    <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>/{s.maxPossibleScore}</span>
                  </div>

                  {/* Title + date */}
                  <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => toggle(s._id)}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.01em' }}>{s.testTitle}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={10} /> {dateStr}
                    </div>
                  </div>

                  {/* Accuracy badge */}
                  <div style={{ padding: '4px 10px', borderRadius: 99, fontSize: 11.5, fontWeight: 600, background: ok ? 'var(--green-bg)' : mid ? 'var(--amber-bg)' : 'var(--red-bg)', color: ok ? 'var(--green-600)' : mid ? 'var(--amber-500)' : 'var(--red-600)', flexShrink: 0 }}>
                    <Target size={9} style={{ display: 'inline', marginRight: 3 }} />{acc}%
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    {onRetake && s.testId && (
                      <button className="btn btn-ghost btn-icon btn-sm" title="Retake this test" onClick={() => onRetake(s.testId)} style={{ color: 'var(--apple-blue)' }}>
                        <RotateCcw size={13} />
                      </button>
                    )}
                    <button className="btn btn-ghost btn-icon btn-sm" title="Delete session" onClick={() => handleDelete(s._id, s.testTitle)} style={{ color: 'var(--apple-red)' }}>
                      <Trash2 size={13} />
                    </button>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => toggle(s._id)} style={{ color: 'var(--text-tertiary)' }}>
                      {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </div>
                </div>

                {/* Expanded breakdown � animated slide */}
                {s.sectionBreakdown && (() => {
                  const tc = s.sectionBreakdown.reduce((a: number, sec: any) => a + (sec.correct ?? 0), 0);
                  const tw = s.sectionBreakdown.reduce((a: number, sec: any) => a + (sec.wrong   ?? 0), 0);
                  const tq = s.sectionBreakdown.reduce((a: number, sec: any) => a + (sec.totalQuestions ?? 0), 0);
                  return (
                    <div style={{ overflow: 'hidden', maxHeight: isOpen ? 1000 : 0, transition: 'max-height 0.32s cubic-bezier(0.4,0,0.2,1)', }}>
                    <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                      {/* Mini summary */}
                      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '12px 20px', background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                        {[
                          { label: 'Correct',  val: tc,         color: 'var(--green-500)' },
                          { label: 'Wrong',    val: tw,         color: 'var(--apple-red)'  },
                          { label: 'Skipped',  val: tq-tc-tw,  color: 'var(--text-tertiary)' },
                          { label: 'Accuracy', val: `${acc}%`,  color: ok ? 'var(--green-500)' : mid ? 'var(--amber-500)' : 'var(--apple-red)' },
                        ].map(({ label, val, color }) => (
                          <div key={label} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 18, fontWeight: 700, color, letterSpacing: '-0.02em' }}>{val}</div>
                            <div style={{ fontSize: 9.5, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 2 }}>{label}</div>
                          </div>
                        ))}
                      </div>
                      {/* Section bars */}
                      <div style={{ padding: '10px 20px 6px', fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <BarChart2 size={11} /> Sectional Breakdown
                      </div>
                      {s.sectionBreakdown.map((sec: any, i: number) => {
                        const secAcc = sec.attempted > 0 ? Math.round((sec.correct / sec.attempted) * 100) : 0;
                        return (
                          <div key={i} style={{ padding: '10px 20px', borderBottom: i < s.sectionBreakdown.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                              <span style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text-primary)' }}>{sec.sectionName}</span>
                              <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 12 }}>
                                <span style={{ color: 'var(--green-500)' }}>? {sec.correct}</span>
                                <span style={{ color: 'var(--apple-red)' }}>? {sec.wrong}</span>
                                <strong style={{ color: 'var(--text-primary)' }}>{sec.score}/{sec.maxPossibleScore ?? sec.totalQuestions}</strong>
                              </span>
                            </div>
                            <div style={{ height: 5, background: 'rgba(0,0,0,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${secAcc}%`, borderRadius: 99, background: secAcc >= 70 ? 'var(--green-500)' : secAcc >= 50 ? 'var(--amber-500)' : 'var(--apple-red)', transition: 'width 0.6s ease' }} />
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 3, fontWeight: 600 }}>{secAcc}% accuracy</div>
                          </div>
                        );
                      })}
                    </div>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      )}

      {/* Compare Modal */}
      {showCompare && cmpSessions.length === 2 && (
        <div className="modal-backdrop" onClick={() => setShowCompare(false)}>
          <div className="modal" style={{ maxWidth: 640, width: 'calc(100vw - 40px)' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ marginBottom: 16 }}>
              <div className="modal-icon-wrap"><GitCompare size={18} /></div>
              <span className="modal-title">Session Comparison</span>
              <button className="btn btn-ghost btn-icon btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setShowCompare(false)}><X size={16} /></button>
            </div>

            {/* Score headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', gap: 12, alignItems: 'center', marginBottom: 16 }}>
              {cmpSessions.map((s: any, idx: number) => (
                <div key={idx} style={{ background: idx === 0 ? 'var(--blue-bg)' : 'var(--purple-bg)', borderRadius: 12, padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.testTitle}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: idx === 0 ? 'var(--apple-blue)' : 'var(--apple-purple)', letterSpacing: '-0.03em' }}>{s.totalScore}<span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-tertiary)' }}>/{s.maxPossibleScore}</span></div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{s.accuracy}% accuracy</div>
                  <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>{new Date(s.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</div>
                </div>
              ))}
              <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)' }}>VS</div>
            </div>

            {/* Winner banner */}
            {(() => {
              const [a, b] = cmpSessions as any[];
              const winner = a.totalScore > b.totalScore ? 0 : a.totalScore < b.totalScore ? 1 : -1;
              if (winner === -1) return <div className="alert alert-info" style={{ marginBottom: 12, justifyContent: 'center', textAlign: 'center' }}>?? Both sessions scored equally!</div>;
              return <div className="alert alert-success" style={{ marginBottom: 12 }}>?? Session {winner + 1} wins by {Math.abs(a.totalScore - b.totalScore)} points ({Math.abs(a.accuracy - b.accuracy).toFixed(1)}% accuracy diff)</div>;
            })()}

            {/* Section comparison */}
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Sectional Comparison</div>
            {(cmpSessions[0] as any).sectionBreakdown?.map((sec: any, i: number) => {
              const sec2 = (cmpSessions[1] as any).sectionBreakdown?.[i];
              if (!sec2) return null;
              const acc1 = sec.attempted  > 0 ? Math.round((sec.correct  / sec.attempted)  * 100) : 0;
              const acc2 = sec2.attempted > 0 ? Math.round((sec2.correct / sec2.attempted) * 100) : 0;
              return (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{sec.sectionName}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', gap: 8, alignItems: 'center' }}>
                    <div>
                      <div style={{ height: 6, background: 'rgba(0,122,255,0.15)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${acc1}%`, background: 'var(--apple-blue)', borderRadius: 99 }} />
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>{acc1}% � {sec.correct}/{sec.attempted} correct</div>
                    </div>
                    <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 700 }}>
                      {acc1 > acc2 ? '??' : acc2 > acc1 ? '??' : '='}
                    </div>
                    <div>
                      <div style={{ height: 6, background: 'rgba(88,86,214,0.15)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${acc2}%`, background: 'var(--apple-purple)', borderRadius: 99 }} />
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>{acc2}% � {sec2.correct}/{sec2.attempted} correct</div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => setShowCompare(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
