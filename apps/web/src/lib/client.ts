export type CommitmentStatus = 'unconfirmed' | 'open' | 'done' | 'dismissed';

export interface Suggestion {
    description: string;
    workStream: string;
    energyLevel: string;
    // Status is implicitly 'unconfirmed' for suggestions
}

export interface Commitment {
    id: string;
    title: string;
    workStream: string;
    energyLevel: string;
    status: CommitmentStatus;
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
}

export interface DumpResponse {
    suggestions?: Commitment[]; // Now receiving full objects with IDs
    error?: string;
}

export interface ConfirmResponse {
    id: string;
    status: CommitmentStatus;
    error?: string;
}

export interface NowResponse {
    id: string;
    title: string;
    workStream: string;
    energyLevel: string;
    status: CommitmentStatus;
    createdAt: string;
    updatedAt: string;
    message?: string; // For null case "Nothing actionable right now."
    now?: null; // Explicit null check from API
}

export interface DoneResponse {
    id: string;
    status: 'done';
    error?: string;
}

// Helper to handle API errors
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorBody.error || `HTTP ${response.status}`);
    }
    return response.json();
}

export const api = {
    dump: async (text: string): Promise<DumpResponse> => {
        const res = await fetch('/dump', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
        });
        return handleResponse<DumpResponse>(res);
    },

    confirm: async (id: string, action: 'confirm' | 'dismiss'): Promise<ConfirmResponse> => {
        const res = await fetch('/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, action }),
        });
        return handleResponse<ConfirmResponse>(res);
    },

    getNow: async (): Promise<NowResponse> => {
        const res = await fetch('/now');
        return handleResponse<NowResponse>(res);
    },

    done: async (id: string): Promise<DoneResponse> => {
        const res = await fetch('/done', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        return handleResponse<DoneResponse>(res);
    },
};
