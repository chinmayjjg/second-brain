import axios from 'axios';

type ItemType = 'link' | 'article' | 'video' | 'note';

interface SafetyCheckInput {
  title: string;
  description?: string;
  content?: string;
  type: ItemType;
  url?: string;
}

interface GroqModerationResponse {
  isSafe: boolean;
  reason: string;
}

interface SafetyCheckOutput {
  isSafe: boolean;
  ageRestricted: boolean;
  reason: string;
  provider: string;
  checkedAt: Date;
}

interface SourceCheckOutput {
  isDeleted: boolean;
  statusCode?: number;
  reason?: string;
  checkedAt: Date;
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const SOURCE_CHECK_TIMEOUT_MS = 6000;
const EXPLICIT_SEXUAL_PATTERNS = [
  /\bfuck\b/i,
  /\bfucking\b/i,
  /\bsex\b/i,
  /\bsexual\b/i,
  /\bblowjob\b/i,
  /\bhandjob\b/i,
  /\bporn\b/i,
  /\bnude\b/i,
  /\bnudes\b/i
];

const hasExplicitSexualLanguage = (input: SafetyCheckInput): boolean => {
  const combined = `${input.title} ${input.description || ''} ${input.content || ''}`;
  return EXPLICIT_SEXUAL_PATTERNS.some((pattern) => pattern.test(combined));
};

const buildSafetyPrompt = (input: SafetyCheckInput): string => {
  return [
    'You are a strict content safety classifier for shared public content.',
    'Return only valid JSON with this exact shape:',
    '{"isSafe": boolean, "reason": string}',
    'Rules:',
    '- Mark isSafe=false for explicit sexual content, graphic violence, self-harm instruction, hate/harassment, illegal activity instruction, or dangerous content for minors.',
    '- Mark isSafe=true for benign educational/news/contextual discussion without explicit instructions.',
    '- Keep reason under 120 characters.',
    '',
    `Type: ${input.type}`,
    `Title: ${input.title}`,
    `Description: ${input.description || ''}`,
    `URL: ${input.url || ''}`,
    `Content: ${input.content || ''}`
  ].join('\n');
};

const parseGroqResponse = (rawText: string): GroqModerationResponse | null => {
  const trimmed = rawText.trim();
  const jsonCandidate = trimmed.startsWith('{')
    ? trimmed
    : trimmed.replace(/```json|```/g, '').trim();

  try {
    const parsed = JSON.parse(jsonCandidate) as Partial<GroqModerationResponse>;
    if (typeof parsed.isSafe !== 'boolean') return null;
    return {
      isSafe: parsed.isSafe,
      reason: typeof parsed.reason === 'string' && parsed.reason.trim()
        ? parsed.reason.trim()
        : 'Classified by Groq moderation'
    };
  } catch {
    return null;
  }
};

export const runSafetyCheck = async (input: SafetyCheckInput): Promise<SafetyCheckOutput> => {
  if (hasExplicitSexualLanguage(input)) {
    return {
      isSafe: false,
      ageRestricted: true,
      reason: 'Explicit sexual language detected.',
      provider: 'rule-based-explicit-language',
      checkedAt: new Date()
    };
  }

  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODERATION_MODEL || 'llama-3.1-8b-instant';

  if (!apiKey) {
    return {
      isSafe: true,
      ageRestricted: false,
      reason: 'GROQ_API_KEY not configured; defaulted to safe.',
      provider: 'groq-missing-key',
      checkedAt: new Date()
    };
  }

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'Return JSON only.' },
          { role: 'user', content: buildSafetyPrompt(input) }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    const rawText = response.data?.choices?.[0]?.message?.content || '';
    const parsed = parseGroqResponse(rawText);
    if (!parsed) {
      return {
        isSafe: true,
        ageRestricted: false,
        reason: 'Could not parse Groq moderation result.',
        provider: 'groq-parse-fallback',
        checkedAt: new Date()
      };
    }

    return {
      isSafe: parsed.isSafe,
      ageRestricted: !parsed.isSafe,
      reason: parsed.reason,
      provider: `groq:${model}`,
      checkedAt: new Date()
    };
  } catch (error: any) {
    return {
      isSafe: true,
      ageRestricted: false,
      reason: `Groq request failed: ${error?.message || 'unknown error'}`,
      provider: 'groq-error-fallback',
      checkedAt: new Date()
    };
  }
};

export const checkSourceAvailability = async (url?: string): Promise<SourceCheckOutput> => {
  const checkedAt = new Date();
  if (!url) {
    return {
      isDeleted: false,
      reason: 'No URL source attached.',
      checkedAt
    };
  }

  const probe = async (method: 'head' | 'get') => {
    return axios.request({
      method,
      url,
      timeout: SOURCE_CHECK_TIMEOUT_MS,
      maxRedirects: 5,
      validateStatus: () => true
    });
  };

  try {
    let response = await probe('head');
    if (response.status === 405 || response.status === 403) {
      response = await probe('get');
    }

    if (response.status >= 400) {
      return {
        isDeleted: true,
        statusCode: response.status,
        reason: `Source returned HTTP ${response.status}`,
        checkedAt
      };
    }

    return {
      isDeleted: false,
      statusCode: response.status,
      reason: `Source reachable (HTTP ${response.status})`,
      checkedAt
    };
  } catch (error: any) {
    return {
      isDeleted: true,
      reason: `Source unreachable: ${error?.message || 'unknown error'}`,
      checkedAt
    };
  }
};
