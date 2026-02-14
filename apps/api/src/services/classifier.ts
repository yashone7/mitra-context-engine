import { workStreamEnum, type WorkStream, energyLevelEnum, type EnergyLevel } from '../db/schema';

export interface CommitmentSuggestion {
    description: string;
    person: string | null;
    workStream: WorkStream;
    energyLevel: EnergyLevel;
    confidence: number;
    note?: string;
}

/**
 * Splits input text into atomic items and classifies them.
 * Gracefully falls back to default values if classification fails.
 */
export async function splitAndClassify(text: string): Promise<CommitmentSuggestion[]> {
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
        items.map(async (item) => classifyItem(item))
    );

    return suggestions;
}

/**
 * Classifies a single item.
 * Currently a stub / heuristic implementation.
 * Can be replaced with LLM call later.
 */
async function classifyItem(text: string): Promise<CommitmentSuggestion> {
    // Default values (Fallback)
    const suggestion: CommitmentSuggestion = {
        description: text,
        person: null,
        workStream: 'planning',
        energyLevel: 'medium',
        confidence: 1.0, // Stub confidence
        note: 'Stub classification',
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

        // TODO: Integrate Gemini/LLM here for better classification
        // If LLM fails, we just return the suggestion as modified by heuristics above.

    } catch (error) {
        // Graceful fallback: Do nothing, return safe defaults
        console.error('Classification failed for item:', text, error);
        suggestion.note = 'Classification failed, using defaults';
        suggestion.confidence = 0.5;
    }

    return suggestion;
}
