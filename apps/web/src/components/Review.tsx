import { useState } from 'react';
import { api, type Commitment } from '../lib/client';
import '../styles/global.css';

interface ReviewProps {
    suggestions: Commitment[];
    onComplete: () => void;
}

export function Review({ suggestions, onComplete }: ReviewProps) {
    // Local state to manage the list as the user processes them
    const [queue, setQueue] = useState<Commitment[]>(suggestions);
    const [processing, setProcessing] = useState(false);

    // If queue is empty, we are done
    if (queue.length === 0) {
        // Use useEffect or just call it immediately? 
        // Safe to call render null and trigger onComplete in effect?
        // Better to just show nothing and let parent handle, but parent doesn't know queue is empty unless we tell it.
        // Let's invoke onComplete via a small timeout to avoid render-cycle issues if we want to be safe,
        // or just return null and expect parent to have removed this component?
        // Actually, the parent passed `suggestions`. The parent doesn't know we are done unless we say so.
        // We act on `queue`.

        // Let's use a "Done" state internally before calling onComplete?
        // Or just call onComplete immediately when the last one is done.

        // Simpler: Trigger onComplete when the last action finishes.
        return null;
    }

    const current = queue[0];

    const handleAction = async (action: 'confirm' | 'dismiss') => {
        setProcessing(true);
        try {
            await api.confirm(current.id, action);
            // Remove from queue
            const newQueue = queue.slice(1);
            setQueue(newQueue);

            if (newQueue.length === 0) {
                onComplete();
            }
        } catch (error) {
            console.error(`Failed to ${action}:`, error);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <section className="fade-in stack" style={{
            padding: '2rem',
            border: '1px solid var(--border-color)',
            background: 'var(--card-bg)',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
                    Review ({queue.length} remaining)
                </span>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{current.title}</h3>
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                    {current.workStream && <span>{current.workStream}</span>}
                    {current.energyLevel && <span>{current.energyLevel}</span>}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                    onClick={() => handleAction('confirm')}
                    disabled={processing}
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: 'var(--text-main)',
                        color: 'var(--bg-color)',
                        border: 'none',
                        borderRadius: '4px',
                        opacity: processing ? 0.7 : 1
                    }}
                >
                    Keep
                </button>
                <button
                    onClick={() => handleAction('dismiss')}
                    disabled={processing}
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: 'transparent',
                        color: 'var(--text-dim)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        opacity: processing ? 0.7 : 1
                    }}
                >
                    Nope
                </button>
            </div>
        </section>
    );
}
