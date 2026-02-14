import { type DrizzleD1Database } from 'drizzle-orm/d1';
import { commitments, people, energySnapshots, type WorkStream, type EnergyLevel } from '../db/schema';
import * as schema from '../db/schema';
import { eq, desc, and, ne } from 'drizzle-orm';

interface SelectionResult {
    commitment: typeof commitments.$inferSelect;
    person: typeof people.$inferSelect | null;
    score: number;
    reasons: string[];
}

const ENERGY_SCORES: Record<EnergyLevel, number> = {
    light: 1,
    medium: 2,
    heavy: 3,
};

export async function selectNextCommitment(
    db: DrizzleD1Database<typeof schema>
): Promise<{ id: string; now: string; why: string; energy: EnergyLevel } | null> {
    // 1. Get Current Energy (Default: medium)
    // Since we can't easily query latest without complicated SQL in Drizzle D1 yet, let's just fetch all and sort in memory or simplistic query
    // For now, I will use a simple query to get the latest snapshot.
    const latestSnapshot = await db
        .select()
        .from(energySnapshots)
        .orderBy(desc(energySnapshots.createdAt))
        .limit(1)
        .get();

    const currentEnergy: EnergyLevel = latestSnapshot?.level ?? 'medium';
    const currentEnergyScore = ENERGY_SCORES[currentEnergy];

    // 2. Fetch ALL open commitments (joined with people)
    // We fetch all because we need soft filtering (if high-energy tasks are filtered out, we might need them if nothing else exists)
    const rows = await db
        .select({
            commitment: commitments,
            person: people,
        })
        .from(commitments)
        .leftJoin(people, eq(commitments.personId, people.id))
        .where(eq(commitments.status, 'open'))
        .all();

    if (rows.length === 0) {
        return null;
    }

    // 3. Score and Sort
    const scored: SelectionResult[] = rows.map(({ commitment, person }) => {
        let score = 0;
        const reasons: string[] = [];
        const taskEnergyScore = ENERGY_SCORES[commitment.energyLevel];

        // Factor 1: Energy Compatibility
        const isEnergyCompatible = taskEnergyScore <= currentEnergyScore;
        if (isEnergyCompatible) {
            score += 1;
            // reasons.push('Matches energy'); // Too generic, maybe keep it implicit
        }

        // Factor 2: Co-founder (Strict relationship check)
        if (person?.relationship === 'cofounder') {
            score += 10;
            reasons.push('Unblocks co-founder');
        }

        // Factor 3: Work Stream (Planning)
        if (commitment.workStream === 'planning') {
            score += 5;
            reasons.push('Planning task');
        }

        // Tie-breaker: CreatedAt ASC (handled in sort)

        return { commitment, person, score, reasons };
    });

    // 4. Soft Filtering & Sorting
    // Logic: Sort by Score DESC, then CreatedAt ASC.
    // Soft filter means: We prefer compatible tasks, but if ONLY incompatible tasks exist, we might show one?
    // Actually, standard scoring handles this: compatible gets +1. So incompatible tasks just have lower score.
    // We just sort.

    scored.sort((a, b) => {
        // 1. Score DESC
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        // 2. CreatedAt ASC (FIFO)
        return a.commitment.createdAt.getTime() - b.commitment.createdAt.getTime();
    });

    const best = scored[0];

    // Construct "Why"
    let why = best.reasons.join(' + ');
    if (!why) {
        if (ENERGY_SCORES[best.commitment.energyLevel] <= currentEnergyScore) {
            why = 'Fits current energy';
        } else {
            why = 'Oldest open commitment';
        }
    }

    return {
        id: best.commitment.id,
        now: best.commitment.title,
        why: why,
        energy: best.commitment.energyLevel,
    };
}
