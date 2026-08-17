import React, { useState, useEffect } from 'react';
import {
  TrendingUp, BarChart2, Award,
  UploadCloud, BookOpen, LineChart as LineChartIcon,
  Target, Zap, Activity,
  CheckCircle2,
  MinusIcon,
  XCircle,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine
} from 'recharts';
import { fetchPerformanceStats } from '../utils/api';

export const DashboardModule: React.FC = () => {
  const [stats, setStats] = useState<{
    progression: any[];
    sectionsBreakdown: any[];
    rawSessions?: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const prog     = stats?.progression ?? [];
  const sections = stats?.sectionsBreakdown ?? [];
  const recent   = stats?.rawSessions?.slice(0, 5) ?? [];

  const totalTests  = prog.length;
  const avgScore    = totalTests ? Math.round(prog.reduce((a: number, i: any) => a + i.score, 0) / totalTests * 10) / 10 : 0;
  const avgAccuracy = totalTests ? Math.round(prog.reduce((a: number, i: any) => a + i.accuracy, 0) / totalTests) : 0;
  const best        = totalTests ? Math.max(...prog.map((i: any) => i.score)) : 0;

  /* trend vs previous session */
  const lastTwo = prog.slice(-2);
  const scoreTrend = lastTwo.length === 2 ? lastTwo[1].score - lastTwo[0].score : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: 'white', border: '1px solid #e8eaf0',
        borderRadius: 10, padding: '10px 14px', fontSize: 12,
        boxShadow: '0 8px 24px rgba(15,16,53,0.12)'
      }}>
        <div style={{ color: '#6b7280', marginBottom: 5, fontWeight: 600 }}>{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} style={{ color: p.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
            {p.name}: {p.value}{p.name.includes('%') || p.name === 'Accuracy' ? '%' : ''}
          </div>
        ))}
      </div>
    );
  };

  const STEPS = [
    { Icon: UploadCloud,    label: 'Import a test',     sub: 'Upload your JSON test file',   color: '#4F46E5', bg: '#EEF2FF' },
    { Icon: BookOpen,       label: 'Pick from library', sub: 'Browse saved mock tests',      color: '#7c3aed', bg: '#ede9fe' },
    { Icon: LineChartIcon,  label: 'Track results',     sub: 'See score & accuracy history', color: '#0891b2', bg: '#e0f2fe' },
  ];

  if (loading) {
    return (
      <div className="page fade-in">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 20 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: 80, borderRadius: 14, background: 'linear-gradient(90deg, #f1f5f9 25%, #e9edf5 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
          ))}
        </div>
        <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      </div>
    );
  }

  if (totalTests === 0) {
    return (
      <div className="page fade-in">
        {/* Welcome hero */}
        <div style={{
          background: 'var(--sidebar-bg)', borderRadius: 20, padding: '36px 40px',
          marginBottom: 24, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(79,70,229,0.15)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, left: 200, width: 200, height: 200, borderRadius: '50%', background: 'rgba(129,140,248,0.08)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 99, background: 'rgba(79,70,229,0.2)', border: '1px solid rgba(79,70,229,0.3)', marginBottom: 14 }}>
              <Zap size={12} style={{ color: '#818CF8' }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#818CF8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Get Started</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 600, color: 'white', letterSpacing: '-0.03em', marginBottom: 8, lineHeight: 1.2 }}>
              {greeting}, Harsh! 👋
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', maxWidth: 440, lineHeight: 1.65 }}>
              Welcome to ExamPortal. Import a test or pick from the library to start tracking your progress.
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="grid-3">
          {STEPS.map(({ Icon, label, sub, color, bg }, i) => (
            <div key={i} style={{
              background: 'white', border: '1px solid #e8eaf0', borderRadius: 16,
              padding: '24px', boxShadow: '0 1px 3px rgba(15,16,53,0.06)',
              transition: 'all 0.2s',
            }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Icon size={22} style={{ color }} />
              </div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 5, color: '#111827', letterSpacing: '-0.01em' }}>{label}</div>
              <div style={{ fontSize: 12.5, color: '#9ca3af', lineHeight: 1.5 }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page fade-in">

      {/* ── Greeting banner ── */}
      <div style={{
        background: 'var(--sidebar-bg)', borderRadius: 20, padding: '24px 30px',
        marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -50, right: 120, width: 180, height: 180, borderRadius: '50%', background: 'rgba(79,70,229,0.12)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(129,140,248,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <div style={{ fontSize: 20, fontWeight: 600, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            {greeting}, Harsh! 👋
          </div>
          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
            You've attempted <strong style={{ color: '#818CF8' }}>{totalTests}</strong> tests with an average accuracy of <strong style={{ color: '#4ade80' }}>{avgAccuracy}%</strong>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', flexShrink: 0 }}>
          <div style={{ textAlign: 'center', padding: '10px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
            <div style={{ fontSize: 24, fontWeight: 600, color: 'white', letterSpacing: '-0.03em', lineHeight: 1 }}>{best}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>Personal Best</div>
          </div>
        </div>
      </div>

      {/* ── KPI stat cards ── */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          {
            label: 'Tests Taken',
            value: totalTests,
            sub: 'Total attempts',
            icon: Activity,
            valueColor: '#4F46E5',
            extra: null,
          },
          {
            label: 'Avg Score',
            value: avgScore,
            sub: 'Marks per test',
            icon: TrendingUp,
            valueColor: '#0ea5e9',
            extra: scoreTrend !== 0
              ? { text: `${scoreTrend > 0 ? '↑' : '↓'} ${Math.abs(scoreTrend).toFixed(1)} vs last`, color: scoreTrend > 0 ? '#059669' : '#dc2626' }
              : null,
          },
          {
            label: 'Avg Accuracy',
            value: `${avgAccuracy}%`,
            sub: 'Correct / attempted',
            icon: Target,
            valueColor: avgAccuracy >= 70 ? '#10b981' : avgAccuracy >= 50 ? '#f59e0b' : '#ef4444',
            extra: null,
          },
          {
            label: 'Personal Best',
            value: best,
            sub: 'Highest score ever',
            icon: Award,
            valueColor: '#f59e0b',
            extra: null,
          },
        ].map(({ label, value, sub, icon: Icon, valueColor, extra }) => (
          <div key={label} style={{
            padding: '12px 16px', borderRadius: 14,
            background: 'white',
            border: '1px solid #e8eaf0',
            boxShadow: '0 1px 3px rgba(15,16,53,0.05)',
            display: 'flex', flexDirection: 'column', gap: 3,
          }}>
            {/* Title */}
            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#6b7280' }}>{label}</div>

            {/* Value row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon size={22} style={{ color: valueColor, flexShrink: 0 }} />
              <div style={{ fontSize: 28, fontWeight: 600, color: valueColor, letterSpacing: '-0.03em', lineHeight: 1 }}>
                {value}
              </div>
            </div>

            {/* Sublabel */}
            <div style={{ fontSize: 11.5, color: '#9ca3af', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {sub}
            </div>

            {/* Extra line */}
            {extra && (
              <div style={{ fontSize: 12, color: extra.color, fontWeight: 600, marginTop: 2 }}>
                {extra.text}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      {prog.length >= 2 && (
        <div className="grid-2" style={{ marginBottom: 20 }}>
          {/* Score Progression */}
          <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 16, padding: '20px', boxShadow: '0 1px 3px rgba(15,16,53,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', letterSpacing: '-0.01em' }}>Score Progression</div>
                <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>Your last {prog.length} attempts</div>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={18} style={{ color: '#4F46E5' }} />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={prog} margin={{ top: 8, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="gScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#818CF8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#818CF8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#e2e8f0" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#e2e8f0" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" name="Score" stroke="#4F46E5" strokeWidth={2.5} fill="url(#gScore)" dot={{ r: 3.5, fill: '#4F46E5', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#4F46E5', stroke: 'white', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Section Accuracy */}
          <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 16, padding: '20px', boxShadow: '0 1px 3px rgba(15,16,53,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', letterSpacing: '-0.01em' }}>Section Accuracy</div>
                <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>Average % per section</div>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart2 size={18} style={{ color: '#4F46E5' }} />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={sections} margin={{ top: 8, right: 4, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="sectionName" stroke="#e2e8f0" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#e2e8f0" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <ReferenceLine y={50} stroke="#e0e7ff" strokeDasharray="4 4" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avgAccuracy" name="Accuracy" fill="#4F46E5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Recent attempts ── */}
      {recent.length > 0 && (
        <div style={{ background: 'white', border: '1px solid #e8eaf0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(15,16,53,0.06)' }}>
          {/* Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={15} style={{ color: '#4F46E5' }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', letterSpacing: '-0.01em' }}>Recent Attempts</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>Last {recent.length} sessions</div>
              </div>
            </div>
          </div>

          {/* Rows */}
          {recent.map((s: any, i: number) => {
            const acc = s.accuracy ?? 0;
            const ok  = acc >= 70;
            const mid = acc >= 50 && acc < 70;
            return (
              <div key={s._id} style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '13px 20px',
                borderBottom: i < recent.length - 1 ? '1px solid #f8f9fc' : 'none',
                transition: 'background 0.12s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Status dot */}
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: ok ? '#d1fae5' : mid ? '#fef3c7' : '#fee2e2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {ok
                    ? <CheckCircle2 size={16} style={{ color: '#059669' }} />
                    : mid
                    ? <MinusIcon size={16} style={{ color: '#d97706' }} />
                    : <XCircle size={16} style={{ color: '#dc2626' }} />  
                  }
                </div>

                {/* Name */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: '#111827', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.testTitle}
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={10} />
                    {new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* Score */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                    {s.totalScore}
                    <span style={{ fontSize: 12, fontWeight: 400, color: '#9ca3af' }}> / {s.maxPossibleScore}</span>
                  </div>
                </div>

                {/* Accuracy badge */}
                <div style={{
                  padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                  background: ok ? '#d1fae5' : mid ? '#fef3c7' : '#fee2e2',
                  color: ok ? '#065f46' : mid ? '#92400e' : '#991b1b',
                  flexShrink: 0, minWidth: 52, textAlign: 'center',
                }}>
                  {acc}%
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
