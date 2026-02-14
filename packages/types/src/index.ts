export type WorkStream = 'planning' | 'delivery' | 'ops';
export type EnergyLevel = 'light' | 'medium' | 'heavy';
export type CommitmentStatus = 'unconfirmed' | 'open' | 'done' | 'dismissed';

export interface Commitment {
    id: string;
    title: string;
    description?: string; // Sometimes used interchangeably
    personId?: string | null;
    workStream: WorkStream;
    energyLevel: EnergyLevel;
    status: CommitmentStatus;
    createdAt: string; // ISO date string
}

export interface CommitmentSuggestion {
    description: string;
    person: string | null;
    workStream: WorkStream;
    energyLevel: EnergyLevel;
    status: 'unconfirmed';
    confidence?: number;
    note?: string;
}

export interface DumpResponse {
    suggestions: CommitmentSuggestion[];
}

export interface NowResponse {
    id: string;
    now: string;
    why: string;
    energy: EnergyLevel;
}

export interface ConfirmRequest {
    id: string;
    action: 'confirm' | 'dismiss';
}

export interface ConfirmResponse {
    id: string;
    status: CommitmentStatus;
}
