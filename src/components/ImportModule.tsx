import React, { useState, useRef } from 'react';
import { Upload, CheckCircle2, AlertTriangle, Database, FileJson, ClipboardList } from 'lucide-react';
import { SlidingTabs } from './SlidingTabs';
import type { Test, TestType } from '../types';
import { validateTestSchema } from '../utils/schemaValidator';
import { saveTest } from '../utils/api';

export const ImportModule: React.FC = () => {
  const [mode,       setMode]       = useState<'FILE' | 'PASTE'>('FILE');
  const [dragging,   setDragging]   = useState(false);
  const [pasted,     setPasted]     = useState('');
  const [preview,    setPreview]    = useState<Test | null>(null);
  const [rawJson,    setRawJson]    = useState('');
  const [errors,     setErrors]     = useState<string[]>([]);
  const [testType,   setTestType]   = useState<TestType>('FULL');
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
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
            <select className="select" style={{ width: 'auto', flex: 1, maxWidth: 220 }} value={testType} onChange={e => setTestType(e.target.value as TestType)}>
              <option value="FULL">Full Test</option>
              <option value="ENGLISH">English Section</option>
              <option value="QUANT">Quantitative Section</option>
              <option value="REASONING">Reasoning Section</option>
            </select>
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
              <div className="upload-zone-icon"><Upload size={20} /></div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--slate-700)', marginBottom: 4 }}>Drop JSON file here</div>
              <div style={{ fontSize: 12, color: 'var(--slate-400)' }}>or click to browse — .json files only</div>
            </div>
          ) : (
            <div>
              <textarea
                className="textarea"
                style={{ height: 260 }}
                placeholder={'{\n  "testTitle": "My Mock Test",\n  "markingScheme": { "correct": 1, "wrong": -0.25, "unattempted": 0 },\n  "sections": [ ... ]\n}'}
                value={pasted}
                onChange={e => setPasted(e.target.value)}
              />
              <button className="btn btn-primary" style={{ marginTop: 10 }} onClick={() => process(pasted)}>
                Validate JSON
              </button>
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
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave} disabled={saving}>
                <Database size={14} />
                {saving ? 'Saving…' : 'Save to Library'}
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

          {/* JSON format guide */}
          <div className="card" style={{ marginTop: 12, background: 'var(--slate-50)' }}>
            <div className="card-title" style={{ marginBottom: 10 }}>
              <FileJson size={14} />
              Required JSON Schema
            </div>
            <pre style={{ fontSize: 10.5, color: 'var(--slate-600)', lineHeight: 1.7, overflowX: 'auto', whiteSpace: 'pre-wrap' }}>{`{
  "testTitle": "string",
  "markingScheme": {
    "correct": 1,
    "wrong": -0.25,
    "unattempted": 0
  },
  "sections": [{
    "sectionName": "string",
    "timeLimitMinutes": 20,
    "questions": [{
      "id": "q1",
      "questionText": "...",
      "passage": null,
      "options": [
        { "label": "A", "text": "..." }
      ],
      "correctAnswer": "A",
      "explanation": "optional"
    }]
  }]
}`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
