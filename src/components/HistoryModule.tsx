import React, { useState, useEffect } from 'react';
import {
  History, ChevronDown, ChevronUp, BarChart2,
  FileText, Calendar, Target, Award
} from 'lucide-react';
import { fetchSessionsHistory } from '../utils/api';

export const HistoryModule: React.FC = () => {
  const [sessions,  setSessions]  = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [search,    setSearch]    = useState('');

  useEffect(() => {
    fetchSessionsHistory()
      .then(data => setSessions(Array.isArray(data) ? data : []))
      .catch(e  => setError(e.message ?? 'Failed to load history'))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: string) => setExpanded(p => p === id ? null : id);

  const filtered = sessions.filter(s =>
    s.testTitle?.toLowerCase().includes(search.toLowerCase())
  );

  /* Summary stats */
  const totalTests  = sessions.length;
  const avgAcc      = totalTests
    ? Math.round(sessions.reduce((a, s) => a + (s.accuracy ?? 0), 0) / totalTests)
    : 0;
  const best        = totalTests ? Math.max(...sessions.map(s => s.totalScore ?? 0)) : 0;

  return (
    <div className="page fade-in">
      <div className="page-header">
        <h1 className="page-title">History &amp; Reports</h1>
        <p className="page-subtitle">Review all your past attempts and sectional performance breakdowns.</p>
      </div>

      {/* ── Summary strip ── */}
      {!loading && totalTests > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Total Attempts', value: totalTests, icon: History,    iconColor: '#4F46E5', iconBg: '#EEF2FF' },
            { label: 'Avg Accuracy',   value: `${avgAcc}%`, icon: Target,  iconColor: '#059669', iconBg: '#d1fae5' },
            { label: 'Personal Best',  value: best,  icon: Award,          iconColor: '#7c3aed', iconBg: '#ede9fe' },
          ].map(({ label, value, icon: Icon, iconColor, iconBg }) => (
            <div key={label} style={{
              flex: 1, background: 'white', border: '1px solid #e8eaf0',
              borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 3px rgba(15,16,53,0.06)',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} style={{ color: iconColor }} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 600, color: '#111827', lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Search ── */}
      {!loading && totalTests > 0 && (
        <div className="search-wrapper" style={{ marginBottom: 14 }}>
          <FileText size={14} className="search-icon" />
          <input
            className="input"
            placeholder="Search by test name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* ── States ── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              height: 72, borderRadius: 14, background: '#f1f5f9',
              animation: 'shimmer 1.4s infinite',
              backgroundImage: 'linear-gradient(90deg,#f1f5f9 25%,#e9edf5 50%,#f1f5f9 75%)',
              backgroundSize: '200% 100%',
            }} />
          ))}
          <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
        </div>
      ) : error ? (
        <div className="alert alert-warning">
          <span className="alert-icon">⚠</span>
          {error} — make sure the backend server is running on port 5000.
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <FileText size={28} />
          <div>
            {search
              ? `No results for "${search}"`
              : 'No attempts yet. Complete a practice test to see your history here.'}
          </div>
        </div>
      ) : (

        /* ── Session list ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(s => {
            const isOpen = expanded === s._id;
            const acc    = s.accuracy ?? 0;
            const ok     = acc >= 70;
            const mid    = acc >= 50;
            const dateStr = new Date(s.createdAt).toLocaleString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            });

            return (
              <div key={s._id} style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(15,16,53,0.05)' }}>

                {/* ── Row header ── */}
                <div
                  onClick={() => toggle(s._id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer', transition: 'background 0.12s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Score circle */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                    background: 'linear-gradient(135deg, #2563eb, #60a5fa)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: 'white', lineHeight: 1 }}>
                      {s.totalScore}
                    </span>
                    <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.65)', fontWeight: 500, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      /{s.maxPossibleScore}
                    </span>
                  </div>

                  {/* Title + date */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.01em' }}>
                      {s.testTitle}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Calendar size={11} /> {dateStr}
                    </div>
                  </div>

                  {/* Accuracy badge + chevron */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <div style={{
                      padding: '4px 11px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                      background: ok ? '#d1fae5' : mid ? '#fef3c7' : '#fee2e2',
                      color: ok ? '#065f46' : mid ? '#92400e' : '#991b1b',
                      border: `1px solid ${ok ? '#a7f3d0' : mid ? '#fde68a' : '#fecaca'}`,
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <Target size={10} /> {acc}%
                    </div>
                    <div style={{ color: '#d1d5db' }}>
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* ── Expandable section breakdown ── */}
                {isOpen && s.sectionBreakdown && (() => {
                  const totalCorrect = s.sectionBreakdown.reduce((a: number, sec: any) => a + (sec.correct ?? 0), 0);
                  const totalWrong   = s.sectionBreakdown.reduce((a: number, sec: any) => a + (sec.wrong   ?? 0), 0);
                  const totalQ       = s.sectionBreakdown.reduce((a: number, sec: any) => a + (sec.totalQuestions ?? 0), 0);
                  const totalSkip    = totalQ - totalCorrect - totalWrong;
                  return (
                    <div style={{ borderTop: '1px solid #f1f5f9' }}>

                      {/* ── Summary strip ── */}
                      <div style={{ display: 'flex', gap: 0, background: '#f8faff', borderBottom: '1px solid #eef0f8', padding: '12px 20px', justifyContent: 'space-around' }}>
                        {[
                          { label: 'Correct',  val: totalCorrect, color: '#059669', bg: '#d1fae5' },
                          { label: 'Wrong',    val: totalWrong,   color: '#dc2626', bg: '#fee2e2' },
                          { label: 'Skipped',  val: totalSkip,    color: '#6b7280', bg: '#f3f4f6' },
                          { label: 'Accuracy', val: `${acc}%`,    color: ok ? '#059669' : mid ? '#d97706' : '#dc2626', bg: ok ? '#d1fae5' : mid ? '#fef3c7' : '#fee2e2' },
                        ].map(({ label, val, color }) => (
                          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <div style={{ fontSize: 18, fontWeight: 600, color }}>{val}</div>
                            <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
                          </div>
                        ))}
                      </div>

                      {/* ── Section label ── */}
                      <div style={{ padding: '10px 20px 6px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.07em', textTransform: 'uppercase', background: '#fafafa' }}>
                        <BarChart2 size={12} style={{ color: '#4F46E5' }} />
                        Sectional Breakdown
                      </div>

                      {/* ── Section rows with accuracy bar ── */}
                      {s.sectionBreakdown.map((sec: any, i: number) => {
                        const secAcc = sec.attempted > 0 ? Math.round((sec.correct / sec.attempted) * 100) : 0;
                        return (
                          <div key={i} style={{ padding: '12px 20px', borderBottom: i < s.sectionBreakdown.length - 1 ? '1px solid #f8f9fc' : 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                              <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{sec.sectionName}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12 }}>
                                <span style={{ color: '#9ca3af' }}>Q: <strong style={{ color: '#374151' }}>{sec.totalQuestions}</strong></span>
                                <span style={{ color: '#059669' }}>✓ {sec.correct}</span>
                                <span style={{ color: '#dc2626' }}>✗ {sec.wrong}</span>
                                <span style={{ fontWeight: 600, color: '#111827' }}>{sec.score}<span style={{ color: '#d1d5db', fontWeight: 400 }}>/{sec.maxPossibleScore ?? sec.totalQuestions}</span></span>
                              </div>
                            </div>
                            {/* Accuracy bar */}
                            <div style={{ height: 6, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${secAcc}%`, borderRadius: 99, background: secAcc >= 70 ? '#10b981' : secAcc >= 50 ? '#f59e0b' : '#ef4444', transition: 'width 0.6s ease' }} />
                            </div>
                            <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4, fontWeight: 600 }}>{secAcc}% accuracy</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
