import type { Test } from '../types';

export interface ValidationError {
  path: string;
  message: string;
}

export function validateTestSchema(jsonString: string): { valid: boolean; errors: ValidationError[]; testData: Test | null } {
  const errors: ValidationError[] = [];
  let data: any = null;

  try {
    data = JSON.parse(jsonString);
  } catch (err: any) {
    return {
      valid: false,
      errors: [{ path: 'JSON Parsing', message: `Malformed JSON: ${err.message}` }],
      testData: null
    };
  }

  if (typeof data !== 'object' || data === null) {
    return {
      valid: false,
      errors: [{ path: 'Root', message: 'Uploaded content must be a JSON object' }],
      testData: null
    };
  }

  // 1. Root Level Validation
  if (!data.testTitle || typeof data.testTitle !== 'string' || data.testTitle.trim() === '') {
    errors.push({ path: 'testTitle', message: 'testTitle is required and must be a non-empty string' });
  }

  if (data.testType !== undefined && data.testType !== null) {
    if (typeof data.testType !== 'string' || !['FULL', 'ENGLISH', 'QUANT', 'REASONING'].includes(data.testType)) {
      errors.push({ path: 'testType', message: 'testType must be one of: FULL, ENGLISH, QUANT, REASONING' });
    }
  } else {
    data.testType = 'FULL';
  }

  if (!data.markingScheme || typeof data.markingScheme !== 'object') {
    errors.push({ path: 'markingScheme', message: 'markingScheme object is required' });
  } else {
    const { correct, wrong, unattempted } = data.markingScheme;
    if (typeof correct !== 'number') {
      errors.push({ path: 'markingScheme.correct', message: 'markingScheme.correct must be a number' });
    }
    if (typeof wrong !== 'number') {
      errors.push({ path: 'markingScheme.wrong', message: 'markingScheme.wrong must be a number' });
    }
    if (typeof unattempted !== 'number') {
      errors.push({ path: 'markingScheme.unattempted', message: 'markingScheme.unattempted must be a number' });
    }
  }

  if (!data.sections || !Array.isArray(data.sections)) {
    errors.push({ path: 'sections', message: 'sections must be a non-empty array' });
    return { valid: false, errors, testData: null };
  }

  if (data.sections.length === 0) {
    errors.push({ path: 'sections', message: 'At least one section is required' });
  }

  // Question ID tracker for duplicates
  const questionIds = new Set<string>();

  // 2. Sections Validation
  data.sections.forEach((section: any, sectionIdx: number) => {
    const sectionPath = `sections[${sectionIdx}]`;
    const secName = section?.sectionName || `Section ${sectionIdx + 1}`;

    if (!section || typeof section !== 'object') {
      errors.push({ path: sectionPath, message: 'Section must be an object' });
      return;
    }

    if (!section.sectionName || typeof section.sectionName !== 'string' || section.sectionName.trim() === '') {
      errors.push({ path: `${sectionPath}.sectionName`, message: `Section ${sectionIdx + 1} has missing or empty sectionName` });
    }

    if (typeof section.timeLimitMinutes !== 'number' || section.timeLimitMinutes < 0) {
      errors.push({ path: `${sectionPath}.timeLimitMinutes`, message: `Section "${secName}" must have a non-negative timeLimitMinutes` });
    }

    if (!section.questions || !Array.isArray(section.questions)) {
      errors.push({ path: `${sectionPath}.questions`, message: `Section "${secName}" has missing or invalid questions array` });
      return;
    }

    // A section with zero questions will skip gracefully at runtime, but we should validate questions if they exist.
    section.questions.forEach((q: any, qIdx: number) => {
      const qPath = `${sectionPath}.questions[${qIdx}]`;
      const qIdentifier = q?.id ? `Question ID: "${q.id}"` : `Question index ${qIdx + 1}`;

      if (!q || typeof q !== 'object') {
        errors.push({ path: qPath, message: `In section "${secName}", question index ${qIdx + 1} is invalid` });
        return;
      }

      if (!q.id || typeof q.id !== 'string' || q.id.trim() === '') {
        errors.push({ path: `${qPath}.id`, message: `In section "${secName}", question index ${qIdx + 1} is missing a string ID` });
      } else {
        if (questionIds.has(q.id)) {
          errors.push({ path: `${qPath}.id`, message: `Duplicate Question ID found: "${q.id}"` });
        }
        questionIds.add(q.id);
      }

      if (!q.questionText || typeof q.questionText !== 'string' || q.questionText.trim() === '') {
        errors.push({ path: `${qPath}.questionText`, message: `In section "${secName}", ${qIdentifier} has missing or empty questionText` });
      }

      if (q.passage !== undefined && q.passage !== null && typeof q.passage !== 'string') {
        errors.push({ path: `${qPath}.passage`, message: `In section "${secName}", ${qIdentifier} passage must be a string or null` });
      }

      if (!q.options || !Array.isArray(q.options) || q.options.length === 0) {
        errors.push({ path: `${qPath}.options`, message: `In section "${secName}", ${qIdentifier} must have a non-empty options array` });
        return;
      }

      const labels = new Set<string>();
      q.options.forEach((opt: any, optIdx: number) => {
        const optPath = `${qPath}.options[${optIdx}]`;
        if (!opt || typeof opt !== 'object') {
          errors.push({ path: optPath, message: `In section "${secName}", ${qIdentifier}, option index ${optIdx + 1} is invalid` });
          return;
        }

        if (!opt.label || typeof opt.label !== 'string' || opt.label.trim() === '') {
          errors.push({ path: `${optPath}.label`, message: `In section "${secName}", ${qIdentifier}, option index ${optIdx + 1} is missing a label` });
        } else {
          if (labels.has(opt.label)) {
            errors.push({ path: `${optPath}.label`, message: `In section "${secName}", ${qIdentifier}, duplicate option label "${opt.label}"` });
          }
          labels.add(opt.label);
        }

        if (opt.text === undefined || opt.text === null || typeof opt.text !== 'string' || opt.text.trim() === '') {
          errors.push({ path: `${optPath}.text`, message: `In section "${secName}", ${qIdentifier}, option "${opt?.label || optIdx + 1}" text is missing or empty` });
        }
      });

      if (!q.correctAnswer || typeof q.correctAnswer !== 'string' || q.correctAnswer.trim() === '') {
        errors.push({ path: `${qPath}.correctAnswer`, message: `In section "${secName}", ${qIdentifier} is missing correctAnswer` });
      } else if (labels.size > 0 && !labels.has(q.correctAnswer)) {
        errors.push({
          path: `${qPath}.correctAnswer`,
          message: `In section "${secName}", ${qIdentifier}: correctAnswer "${q.correctAnswer}" does not match any of the option labels [${Array.from(labels).join(', ')}]`
        });
      }

      if (q.explanation !== undefined && q.explanation !== null && typeof q.explanation !== 'string') {
        errors.push({ path: `${qPath}.explanation`, message: `In section "${secName}", ${qIdentifier} explanation must be a string` });
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors,
    testData: errors.length === 0 ? (data as Test) : null
  };
}
