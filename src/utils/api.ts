import type { Test } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000/api';

export async function fetchTests(type?: string): Promise<Test[]> {
  const url = type ? `${API_BASE_URL}/tests?type=${type}` : `${API_BASE_URL}/tests`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to fetch tests');
  }
  return res.json();
}

export async function saveTest(test: Test): Promise<Test> {
  const res = await fetch(`${API_BASE_URL}/tests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(test)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to save test');
  }
  return res.json();
}

export async function saveSession(session: any): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/sessions` /* wait, let's look at server routes, it is /api/sessions */ || `${API_BASE_URL}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(session)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to save session');
  }
  return res.json();
}

// Correct API route mapping for sessions saving in backend
export async function submitSessionResult(sessionData: any): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sessionData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to submit scorecard results');
  }
  return res.json();
}

export async function fetchPerformanceStats(): Promise<{ progression: any[]; sectionsBreakdown: any[] }> {
  const res = await fetch(`${API_BASE_URL}/sessions/stats`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to fetch performance stats');
  }
  return res.json();
}

export async function fetchSessionsHistory(): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/sessions`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to fetch session history');
  }
  return res.json();
}

export async function updateTestType(id: string, testType: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/tests/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ testType }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update test type');
  }
}

export async function deleteTest(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/tests/${id}`, { method: 'DELETE' });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to delete test'); }
}

export async function deleteSession(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/sessions/${id}`, { method: 'DELETE' });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to delete session'); }
}

export async function fetchTestById(id: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/tests/${id}`);
  if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Test not found'); }
  return res.json();
}