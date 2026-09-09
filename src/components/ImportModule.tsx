import { AppleSelect } from './AppleSelect';
import React, { useState, useRef } from 'react';
import { Upload, CheckCircle2, AlertTriangle, Database, FileJson, ClipboardList, Copy } from 'lucide-react';
import { SlidingTabs } from './SlidingTabs';
import type { Test, TestType } from '../types';
import { validateTestSchema } from '../utils/schemaValidator';
import { saveTest } from '../utils/api';
import { WavyLoader } from './WavyLoader';

export const ImportModule: React.FC = () => {
  const [mode,       setMode]       = useState<'FILE' | 'PASTE'>('FILE');
  const [dragging,   setDragging]   = useState(false);
  const [pasted,     setPasted]     = useState('');
  const [preview,    setPreview]    = useState<Test | null>(null);
  const [_rawJson,   setRawJson]    = useState('');
  const [errors,     setErrors]     = useState<string[]>([]);
  const [testType,   setTestType]   = useState<TestType>('FULL');
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => { setPreview(null); setRawJson(''); setErrors([]); setSaved(false); };

  const process = (text: string) => {
    reset();
    const result = validateTestSchema(text);
    if (!result.valid) {
      setErrors(result.errors.map(e => `${e.path}: ${e.message}`));
    } else if (result.testData) {
      setPreview(result.testData);
      setRawJson(text);
    }
  };

  const readFile = (file: File) => {
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      setErrors(['Only .json files are accepted.']); return;
    }
    const reader = new FileReader();
    reader.onload = e => process(e.target?.result as string);
    reader.readAsText(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  };

  const handleSave = async () => {
    if (!preview) return;
    setSaving(true);
    try {
      await saveTest({ ...preview, testType });
      setSaved(true); setPreview(null); setPasted('');
    } catch {
      setErrors(['Failed to save to database. Is the server running?']);
    } finally { setSaving(false); }
  };

  return (
    <div className="page fade-in">
      <div className="page-header">
        <h1 className="page-title">Import Tests</h1>
        <p className="page-subtitle">Upload a JSON file or paste raw JSON to add a new test to the library.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
        {/* LEFT */}
        <div>
          {/* Mode + category row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <SlidingTabs
              tabs={[
                { label: 'Upload File', value: 'FILE'  },
                { label: 'Paste JSON', value: 'PASTE' },
              ]}
              value={mode}
              onChange={v => { setMode(v as 'FILE' | 'PASTE'); reset(); }}
            />
            <AppleSelect
              value={testType}
              onChange={v => setTestType(v as TestType)}
              style={{ flex: 1, maxWidth: 220 }}
              options={[
                { value: 'FULL',      label: 'Full Test' },
                { value: 'ENGLISH',   label: 'English Section' },
                { value: 'QUANT',     label: 'Quantitative Section' },
                { value: 'REASONING', label: 'Reasoning Section' },
              ]}
            />
          </div>

          {mode === 'FILE' ? (
            <div
              className={`upload-zone${dragging ? ' dragging' : ''}`}
              onDragEnter={e => { e.preventDefault(); setDragging(true); }}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) readFile(e.target.files[0]); }} />
              <div className="upload-zone-icon"><Upload size={22} /></div>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--slate-800)', marginBottom: 4 }}>Drop your JSON file here</div>
              <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>or click to browse from computer (.json files only)</div>
            </div>
          ) : (
            <div className="json-editor-card">
              <div className="json-editor-toolbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--gray-600)' }}>
                  <FileJson size={14} style={{ color: 'var(--apple-blue)' }} />
                  <span>JSON Editor</span>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 11, padding: '3px 8px' }}
                    onClick={() => setPasted(JSON.stringify({
                      testTitle: "Sample Non-Verbal Reasoning Test",
                      testType: "REASONING",
                      markingScheme: { correct: 1.0, wrong: -0.25, unattempted: 0 },
                      sections: [{
                        sectionName: "Pattern Matrix & Visual Reasoning",
                        timeLimitMinutes: 15,
                        questions: [{
                          id: "demo-nv-1",
                          questionText: "Which **figure** from the option choices completes the _pattern matrix_ below?",
                          passage: "Analyze the **90° clockwise rotation** of the inner indicator in each row.",
                          passageImageUrl: "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22220%22%20height%3D%2250%22%20viewBox%3D%220%200%20220%2050%22%3E%3Crect%20width%3D%22220%22%20height%3D%2250%22%20fill%3D%22%23f1f5f9%22%20rx%3D%228%22%2F%3E%3Ctext%20x%3D%2215%22%20y%3D%2230%22%20font-size%3D%2212%22%20font-weight%3D%22bold%22%20fill%3D%22%23007AFF%22%3ERow%20Rule%3A%20Rotate%2090%C2%B0%20Clockwise%3C%2Ftext%3E%3C%2Fsvg%3E",
                          imageUrl: "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22240%22%20height%3D%22240%22%20viewBox%3D%220%200%20240%20240%22%20fill%3D%22none%22%3E%3Crect%20width%3D%22240%22%20height%3D%22240%22%20fill%3D%22%23f8fafc%22%20rx%3D%2212%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%22105%22%20height%3D%22105%22%20rx%3D%228%22%20fill%3D%22white%22%20stroke%3D%22%23cbd5e1%22%20stroke-width%3D%222%22%2F%3E%3Crect%20x%3D%22125%22%20y%3D%2210%22%20width%3D%22105%22%20height%3D%22105%22%20rx%3D%228%22%20fill%3D%22white%22%20stroke%3D%22%23cbd5e1%22%20stroke-width%3D%222%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%22125%22%20width%3D%22105%22%20height%3D%22105%22%20rx%3D%228%22%20fill%3D%22white%22%20stroke%3D%22%23cbd5e1%22%20stroke-width%3D%222%22%2F%3E%3Crect%20x%3D%22125%22%20y%3D%22125%22%20width%3D%22105%22%20height%3D%22105%22%20rx%3D%228%22%20fill%3D%22%23f1f5f9%22%20stroke%3D%22%23007AFF%22%20stroke-width%3D%222%22%20stroke-dasharray%3D%224%204%22%2F%3E%3Ccircle%20cx%3D%2262%22%20cy%3D%2262%22%20r%3D%2230%22%20fill%3D%22none%22%20stroke%3D%22%23007AFF%22%20stroke-width%3D%224%22%2F%3E%3Cline%20x1%3D%2262%22%20y1%3D%2232%22%20x2%3D%2262%22%20y2%3D%2262%22%20stroke%3D%22%23007AFF%22%20stroke-width%3D%224%22%20stroke-linecap%3D%22round%22%2F%3E%3Ccircle%20cx%3D%22177%22%20cy%3D%2262%22%20r%3D%2230%22%20fill%3D%22none%22%20stroke%3D%22%23007AFF%22%20stroke-width%3D%224%22%2F%3E%3Cline%20x1%3D%22177%22%20y1%3D%2262%22%20x2%3D%22207%22%20y2%3D%2262%22%20stroke%3D%22%23007AFF%22%20stroke-width%3D%224%22%20stroke-linecap%3D%22round%22%2F%3E%3Ccircle%20cx%3D%2262%22%20cy%3D%22177%22%20r%3D%2230%22%20fill%3D%22none%22%20stroke%3D%22%23007AFF%22%20stroke-width%3D%224%22%2F%3E%3Cline%20x1%3D%2262%22%20y1%3D%22177%22%20x2%3D%2262%22%20y2%3D%22207%22%20stroke%3D%22%23007AFF%22%20stroke-width%3D%224%22%20stroke-linecap%3D%22round%22%2F%3E%3Ctext%20x%3D%22177%22%20y%3D%22187%22%20font-size%3D%2232%22%20font-weight%3D%22bold%22%20fill%3D%22%23007AFF%22%20text-anchor%3D%22middle%22%3E%3F%3C%2Ftext%3E%3C%2Fsvg%3E",
                          options: [
                            {
                              label: "A",
                              text: "North indicator",
                              imageUrl: "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22white%22%20rx%3D%228%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2228%22%20fill%3D%22none%22%20stroke%3D%22%23007AFF%22%20stroke-width%3D%224%22%2F%3E%3Cline%20x1%3D%2250%22%20y1%3D%2222%22%20x2%3D%2250%22%20y2%3D%2250%22%20stroke%3D%22%23007AFF%22%20stroke-width%3D%224%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E"
                            },
                            {
                              label: "B",
                              text: "East indicator",
                              imageUrl: "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22white%22%20rx%3D%228%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2228%22%20fill%3D%22none%22%20stroke%3D%22%23007AFF%22%20stroke-width%3D%224%22%2F%3E%3Cline%20x1%3D%2250%22%20y1%3D%2250%22%20x2%3D%2278%22%20y2%3D%2250%22%20stroke%3D%22%23007AFF%22%20stroke-width%3D%224%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E"
                            },
                            {
                              label: "C",
                              text: "West indicator",
                              imageUrl: "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22white%22%20rx%3D%228%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2228%22%20fill%3D%22none%22%20stroke%3D%22%23007AFF%22%20stroke-width%3D%224%22%2F%3E%3Cline%20x1%3D%2222%22%20y1%3D%2250%22%20x2%3D%2250%22%20y2%3D%2250%22%20stroke%3D%22%23007AFF%22%20stroke-width%3D%224%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E"
                            },
                            {
                              label: "D",
                              text: "South indicator",
                              imageUrl: "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22white%22%20rx%3D%228%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2228%22%20fill%3D%22none%22%20stroke%3D%22%23007AFF%22%20stroke-width%3D%224%22%2F%3E%3Cline%20x1%3D%2250%22%20y1%3D%2250%22%20x2%3D%2250%22%20y2%3D%2278%22%20stroke%3D%22%23007AFF%22%20stroke-width%3D%224%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E"
                            }
                          ],
                          correctAnswer: "C",
                          explanation: "In Row 1, the hand rotates **90° clockwise** (North → East). Applying the same 90° clockwise rotation to South in Row 2 yields **West** (Pattern C).",
                          explanationImageUrl: "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22260%22%20height%3D%2260%22%20viewBox%3D%220%200%20260%2060%22%3E%3Crect%20width%3D%22260%22%20height%3D%2260%22%20fill%3D%22%23f0fdf4%22%20rx%3D%228%22%2F%3E%3Ctext%20x%3D%2215%22%20y%3D%2236%22%20font-size%3D%2213%22%20font-weight%3D%22bold%22%20fill%3D%22%23166534%22%3ESouth%20(%E2%86%93)%20%E2%94%80%2090%C2%B0%20CW%20%E2%94%80%E2%96%BA%20West%20(%E2%86%90)%3C%2Ftext%3E%3C%2Fsvg%3E"
                        }]
                      }]
                    }, null, 2))}
                  >
                    Paste Non-Verbal Sample
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 11, padding: '3px 8px' }}
                    onClick={() => setPasted(JSON.stringify({
                      testTitle: "Sample Data Interpretation Test",
                      testType: "QUANT",
                      markingScheme: { correct: 1.0, wrong: -0.25, unattempted: 0 },
                      sections: [{
                        sectionName: "Data Interpretation (Bar Chart)",
                        timeLimitMinutes: 10,
                        questions: [{
                          id: "demo-di-1",
                          questionText: "What is the **average car production** (in thousands) across all three companies?",
                          passage: "Directions: Study the **car production bar chart** below.",
                          passageImageUrl: "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22220%22%20viewBox%3D%220%200%20400%20220%22%3E%3Crect%20width%3D%22400%22%20height%3D%22220%22%20fill%3D%22%23f8fafc%22%20rx%3D%2210%22%2F%3E%3Ctext%20x%3D%22200%22%20y%3D%2228%22%20font-size%3D%2214%22%20font-weight%3D%22bold%22%20fill%3D%22%231e293b%22%20text-anchor%3D%22middle%22%3ECar%20Production%20in%202025%20(in%20Thousands)%3C%2Ftext%3E%3Cline%20x1%3D%2260%22%20y1%3D%22170%22%20x2%3D%22360%22%20y2%3D%22170%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%2F%3E%3Cline%20x1%3D%2260%22%20y1%3D%2240%22%20x2%3D%2260%22%20y2%3D%22170%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%2F%3E%3Crect%20x%3D%2290%22%20y%3D%2285%22%20width%3D%2255%22%20height%3D%2285%22%20fill%3D%22%23007AFF%22%20rx%3D%224%22%2F%3E%3Ctext%20x%3D%22117%22%20y%3D%2277%22%20font-size%3D%2212%22%20font-weight%3D%22bold%22%20fill%3D%22%23007AFF%22%20text-anchor%3D%22middle%22%3E40k%3C%2Ftext%3E%3Ctext%20x%3D%22117%22%20y%3D%22190%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23475569%22%20text-anchor%3D%22middle%22%3ECompany%20A%3C%2Ftext%3E%3Crect%20x%3D%22180%22%20y%3D%2245%22%20width%3D%2255%22%20height%3D%22125%22%20fill%3D%22%2334C759%22%20rx%3D%224%22%2F%3E%3Ctext%20x%3D%22207%22%20y%3D%2237%22%20font-size%3D%2212%22%20font-weight%3D%22bold%22%20fill%3D%22%2334C759%22%20text-anchor%3D%22middle%22%3E60k%3C%2Ftext%3E%3Ctext%20x%3D%22207%22%20y%3D%22190%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23475569%22%20text-anchor%3D%22middle%22%3ECompany%20B%3C%2Ftext%3E%3Crect%20x%3D%22270%22%20y%3D%2265%22%20width%3D%2255%22%20height%3D%22105%22%20fill%3D%22%235856D6%22%20rx%3D%224%22%2F%3E%3Ctext%20x%3D%22297%22%20y%3D%2257%22%20font-size%3D%2212%22%20font-weight%3D%22bold%22%20fill%3D%22%235856D6%22%20text-anchor%3D%22middle%22%3E50k%3C%2Ftext%3E%3Ctext%20x%3D%22297%22%20y%3D%22190%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23475569%22%20text-anchor%3D%22middle%22%3ECompany%20C%3C%2Ftext%3E%3C%2Fsvg%3E",
                          options: [
                            { label: "A", text: "45 thousand" },
                            { label: "B", text: "50 thousand" },
                            { label: "C", text: "55 thousand" },
                            { label: "D", text: "60 thousand" }
                          ],
                          correctAnswer: "B",
                          explanation: "Average = (40 + 60 + 50) / 3 = **50 thousand**."
                        }]
                      }]
                    }, null, 2))}
                  >
                    Paste DI Chart Sample
                  </button>
                  {pasted && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 11, padding: '3px 8px', color: 'var(--red-500)' }}
                      onClick={() => setPasted('')}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <textarea
                className="json-textarea"
                rows={12}
                placeholder={'{\n  "testTitle": "IBPS PO Prelims Mock Test 1",\n  "testType": "FULL",\n  "markingScheme": { "correct": 1.0, "wrong": -0.25, "unattempted": 0.0 },\n  "sections": [\n    { ... }\n  ]\n}'}
                value={pasted}
                onChange={e => setPasted(e.target.value)}
              />

              <div className="json-editor-footer">
                <span style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>
                  {pasted ? `${pasted.split('\n').length} lines · ${pasted.length} chars` : 'Paste raw JSON string above'}
                </span>
                <button
                  className="btn btn-primary"
                  onClick={() => process(pasted)}
                  disabled={!pasted.trim()}
                  style={{ gap: 6 }}
                >
                  <CheckCircle2 size={14} /> Validate JSON
                </button>
              </div>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="alert alert-error" style={{ marginTop: 12, flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 600 }}>
                <AlertTriangle size={15} /> Validation failed
              </div>
              <ul style={{ paddingLeft: 20, fontSize: 12 }}>
                {errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
        </div>

        {/* RIGHT: status panel */}
        <div>
          {saved && (
            <div className="alert alert-success" style={{ marginBottom: 12 }}>
              <CheckCircle2 size={16} className="alert-icon" />
              <div><strong>Saved!</strong> Test added to your library. Go to Practice Tests to start it.</div>
            </div>
          )}

          {preview ? (
            <div className="card slide-up">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--green-700)', fontWeight: 600, fontSize: 13 }}>
                <CheckCircle2 size={16} /> JSON is valid
              </div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--slate-900)', marginBottom: 6 }}>{preview.testTitle}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                <span className="badge badge-green">{testType}</span>
                <span className="badge badge-slate">{preview.sections.length} sections</span>
                <span className="badge badge-slate">{preview.sections.reduce((a, s) => a + s.questions.length, 0)} questions</span>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', gap: 8, justifyContent: 'center' }} onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <WavyLoader size={18} inline center={false} />
                    <span>Saving to Library...</span>
                  </>
                ) : (
                  <>
                    <Database size={14} />
                    <span>Save to Library</span>
                  </>
                )}
              </button>
            </div>
          ) : !saved && (
            <div className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10, background: 'var(--slate-100)',
                border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 12px', color: 'var(--slate-400)'
              }}>
                <ClipboardList size={20} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--slate-600)', marginBottom: 4 }}>Validation results here</div>
              <div style={{ fontSize: 12, color: 'var(--slate-400)' }}>Upload or paste a JSON file to validate its schema.</div>
            </div>
          )}

          {/* Complete JSON Schema & AI Prompt Guide */}
          <div className="card" style={{ marginTop: 12, background: 'var(--slate-50)' }}>
            <div className="card-title" style={{ marginBottom: 10, justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileJson size={14} style={{ color: 'var(--apple-blue)' }} />
                AI Prompt & JSON Schema Guide
              </span>
              <button
                className="btn btn-ghost btn-sm"
                style={{
                  fontSize: 10.5,
                  padding: '3px 8px',
                  color: copiedPrompt ? '#065f46' : 'var(--apple-blue)',
                  background: copiedPrompt ? '#d1fae5' : 'transparent',
                  border: copiedPrompt ? '1px solid #a7f3d0' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
                onClick={() => {
                  navigator.clipboard.writeText(`Create a competitive exam mock test in JSON format adhering strictly to this schema:

{
  "testTitle": "String (e.g. IBPS PO Prelims Mock Test 1)",
  "testType": "FULL | ENGLISH | QUANT | REASONING",
  "markingScheme": { "correct": 1.0, "wrong": -0.25, "unattempted": 0.0 },
  "sections": [
    {
      "sectionName": "String (e.g. Data Interpretation or Non-Verbal Reasoning)",
      "timeLimitMinutes": Number,
      "questions": [
        {
          "id": "Unique String ID",
          "questionText": "Supports **bold** and _italic_ markdown",
          "passage": "Optional passage or DI set description",
          "passageImageUrl": "Optional DI Chart / Table image URL or SVG data URI (data:image/svg+xml;charset=utf-8,...)",
          "imageUrl": "Optional Question Matrix / Figure image URL or SVG data URI",
          "options": [
            {
              "label": "A",
              "text": "Option text string",
              "imageUrl": "Optional choice figure image URL or SVG data URI"
            }
          ],
          "correctAnswer": "Label string matching one option (e.g. A)",
          "explanation": "Optional step-by-step solution supporting **bold** text",
          "explanationImageUrl": "Optional visual solution diagram image URL or SVG data URI"
        }
      ]
    }
  ]
}

SPECIAL INSTRUCTIONS FOR VISUAL QUESTIONS:
1. For Data Interpretation (DI): Include the Bar/Line/Pie chart image URL or URL-encoded SVG in 'passageImageUrl' so all set questions share the chart.
2. For Non-Verbal Reasoning: Use 'imageUrl' for question matrices/patterns and 'imageUrl' inside options for figure choices A, B, C, D.`);
                  setCopiedPrompt(true);
                  setTimeout(() => setCopiedPrompt(false), 2500);
                }}
              >
                {copiedPrompt ? (
                  <>
                    <CheckCircle2 size={12} style={{ color: '#10b981' }} />
                    Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    Copy AI Prompt
                  </>
                )}
              </button>
            </div>

            <pre style={{ fontSize: 10, color: 'var(--slate-700)', lineHeight: 1.6, overflowX: 'auto', whiteSpace: 'pre-wrap', background: 'white', padding: 10, borderRadius: 8, border: '1px solid var(--border)' }}>{`{
  "testTitle": "string",
  "testType": "FULL | ENGLISH | QUANT | REASONING",
  "markingScheme": { "correct": 1.0, "wrong": -0.25, "unattempted": 0 },
  "sections": [{
    "sectionName": "Data Interpretation / Non-Verbal Reasoning",
    "timeLimitMinutes": 20,
    "questions": [{
      "id": "q1",
      "questionText": "Supports **bold** & _italic_",
      "passage": "Directions for DI Set / Reading Passage",
      "passageImageUrl": "DI Chart URL or SVG data URI (Bar/Line/Pie)",
      "imageUrl": "Question Matrix / Pattern Figure URL",
      "options": [{
        "label": "A",
        "text": "Option text",
        "imageUrl": "Choice figure URL for Non-Verbal options"
      }],
      "correctAnswer": "A",
      "explanation": "Step-by-step calculation or pattern rotation rule",
      "explanationImageUrl": "Visual solution figure URL"
    }]
  }]
}`}</pre>
            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--slate-500)', lineHeight: 1.5 }}>
              💡 <strong>Visual & Formatting Guidelines for AI Generation:</strong>
              <ul style={{ paddingLeft: 16, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <li><strong>Formatting:</strong> Use <code>**bold**</code> for key numbers and <code>_italic_</code> for terms.</li>
                <li><strong>Data Interpretation (DI):</strong> Attach chart URLs/SVGs to <code>passageImageUrl</code> so multi-question DI sets share 1 chart.</li>
                <li><strong>Non-Verbal Reasoning:</strong> Attach pattern puzzles to <code>imageUrl</code> and option figures to <code>options[].imageUrl</code>.</li>
                <li><strong>Image Format:</strong> Standard HTTPS URLs (e.g. <code>https://...</code>) or URL-encoded SVG Data URIs (<code>data:image/svg+xml;charset=utf-8,...</code>).</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
