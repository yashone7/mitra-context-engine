import { type WorkStream, type EnergyLevel } from '../db/schema';

export interface CommitmentSuggestion {
    description: string;
    person: string | null;
    workStream: WorkStream;
    energyLevel: EnergyLevel;
    confidence: number;
    note?: string;
}

/**
 * Splits input text into atomic items and classifies them using Gemini LLM.
 * Gracefully falls back to heuristics if the LLM call fails.
 */
export async function splitAndClassify(text: string, apiKey?: string): Promise<CommitmentSuggestion[]> {
    if (!apiKey) {
        console.warn('No Gemini API key provided. Falling back to heuristics.');
        return heuristicSplitAndClassify(text);
    }

    try {
        console.log('Attempting classification with Gemini...');
        const suggestions = await classifyDumpWithGemini(text, apiKey);
        return suggestions;
    } catch (error) {
        console.error('Gemini classification failed:', error);
        return heuristicSplitAndClassify(text);
    }
}

/**
 * Calls Gemini API to classify the dump text.
 */
async function classifyDumpWithGemini(text: string, apiKey: string): Promise<CommitmentSuggestion[]> {
    const prompt = `
You are a strict JSON-only API. Your job is to decompose the following user "dump" of text into atomic commitments.

Input Text: "${text}"

Rules:
1. Split compound sentences into MULTIPLE atomic commitments.
2. Ensure each commitment represents ONE obligation.
3. If a person is not clearly implied, set "person" to null.
4. "workStream" must be one of: "planning", "delivery", "ops".
5. "energy" must be one of: "light", "medium", "heavy".
6. "confidence" should be a number between 0 and 1.
7. Return ONLY valid JSON matching the schema below.
8. Do NOT include markdown formatting or prose.

Schema:
{
  "commitments": [
    {
      "description": string,
      "person": string | null,
      "workStream": "planning" | "delivery" | "ops",
      "energy": "light" | "medium" | "heavy",
      "confidence": number,
      "note": string | null
    }
  ]
}
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.1, // Low temperature for determinism
            }
        })
    });

    if (!response.ok) {
        throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;

    // Defensive parsing
    let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
        throw new Error('Invalid response structure from Gemini');
    }

    // Clean up potential markdown code blocks if Gemini ignores the "no markdown" rule
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsed = JSON.parse(rawText);

    if (!parsed.commitments || !Array.isArray(parsed.commitments)) {
        throw new Error('Invalid JSON schema returned by Gemini');
    }

    // Map to strictly typed objects to ensure safety
    return parsed.commitments.map((c: any) => ({
        description: c.description || 'Unknown commitment',
        person: c.person || null,
        workStream: isValidWorkStream(c.workStream) ? c.workStream : 'planning',
        energyLevel: isValidEnergy(c.energy) ? c.energy : 'medium', // Note: prompt asks for 'energy', schema needs 'energyLevel'. adjust map
        confidence: typeof c.confidence === 'number' ? c.confidence : 0.5,
        note: c.note || null
    })).map((c: any) => ({
        ...c,
        // The prompting might return 'energy' but our type is 'energyLevel'. 
        // Let's ensure we map it correctly if the LLM follows the schema which uses 'energy'.
        // Re-reading helper: Schema asked for 'energy', code wants 'energyLevel'.
        // I'll fix the mapping here.
        energyLevel: c.energyLevel // mapped above
    }));
}

function isValidWorkStream(val: string): val is WorkStream {
    return ['planning', 'delivery', 'ops'].includes(val);
}

function isValidEnergy(val: string): val is EnergyLevel {
    return ['light', 'medium', 'heavy'].includes(val);
}


/**
 * Heuristic Fallback (Original Implementation)
 */
async function heuristicSplitAndClassify(text: string): Promise<CommitmentSuggestion[]> {
    // 1. Split logic: Newline > Period > Raw
    let items: string[] = [];
    if (text.includes('\n')) {
        items = text.split('\n');
    } else if (text.includes('.')) {
        items = text.split('.');
    } else {
        items = [text];
    }

    // Filter empty lines and trim
    items = items.map(i => i.trim()).filter(i => i.length > 0);

    // 2. Classify each item
    const suggestions: CommitmentSuggestion[] = await Promise.all(
        items.map(async (item) => classifyItemHeuristically(item))
    );

    return suggestions;
}

/**
 * Classifies a single item.
 */
async function classifyItemHeuristically(text: string): Promise<CommitmentSuggestion> {
    // Default values (Fallback)
    const suggestion: CommitmentSuggestion = {
        description: text,
        person: null,
        workStream: 'planning',
        energyLevel: 'medium',
        confidence: 1.0, // Stub confidence
        note: 'Fallback classification',
    };

    try {
        // Simple heuristics for demo purposes
        const lower = text.toLowerCase();

        // Heuristic: Work Stream
        if (lower.includes('email') || lower.includes('reply') || lower.includes('slack')) {
            suggestion.workStream = 'delivery';
        } else if (lower.includes('plan') || lower.includes('think') || lower.includes('roadmap')) {
            suggestion.workStream = 'planning';
        } else if (lower.includes('fix') || lower.includes('debug') || lower.includes('deploy')) {
            suggestion.workStream = 'ops';
        }

        // Heuristic: Energy
        if (lower.includes('quick') || lower.includes('easy')) {
            suggestion.energyLevel = 'light';
        } else if (lower.includes('hard') || lower.includes('complex') || lower.includes('deep')) {
            suggestion.energyLevel = 'heavy';
        }

        // Heuristic: Person (very naive)
        if (lower.includes('co-founder')) {
            suggestion.person = 'co-founder';
        }

    } catch (error) {
        // Graceful fallback: Do nothing, return safe defaults
        console.error('Classification failed for item:', text, error);
        suggestion.note = 'Classification failed, using defaults';
        suggestion.confidence = 0.5;
    }

    return suggestion;
}
