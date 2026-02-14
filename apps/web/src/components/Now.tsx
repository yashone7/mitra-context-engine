import { useEffect, useState } from 'react';
import { api, type NowResponse } from '../lib/client';

export function Now() {
    const [data, setData] = useState<NowResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);
    const [showDoneFeedback, setShowDoneFeedback] = useState(false);

    const fetchNow = async () => {
        try {
            const result = await api.getNow();
            setData(result);
        } catch (error) {
            console.error('Failed to fetch now:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNow();
        // Polling every 10 seconds to keep it fresh without sockets, 
        // consistent with "quiet assistant" (pull based)
        const interval = setInterval(fetchNow, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleDone = async () => {
        if (!data || !data.id) return;

        setCompleting(true);
        try {
            await api.done(data.id);
            setShowDoneFeedback(true);
            setTimeout(() => {
                setShowDoneFeedback(false);
                fetchNow(); // Refresh to get the next item
            }, 1500); // 1.5s visual feedback
        } catch (error) {
            console.error('Failed to complete:', error);
        } finally {
            setCompleting(false);
        }
    };

    if (loading) {
        return <div className="fade-in" style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '2rem' }}>Loading...</div>;
    }

    if (showDoneFeedback) {
        return (
            <div className="fade-in center" style={{
                padding: '3rem',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                background: 'var(--card-bg)'
            }}>
                <span style={{ fontSize: '1.2rem', color: 'var(--text-dim)' }}>Done.</span>
            </div>
        );
    }

    // Case: returning null or explicit message
    if (!data || data.now === null || data.message) {
        return (
            <div className="fade-in center" style={{
                padding: '3rem',
                border: '1px dashed var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-dim)',
                background: 'var(--card-bg)'
            }}>
                Nothing actionable right now.
            </div>
        );
    }

    return (
        <article className="fade-in" style={{
            padding: '2rem',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            background: 'var(--card-bg)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
        }}>
            <div style={{
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '0.8rem',
                color: 'var(--text-dim)',
                fontWeight: 600
            }}>
                Now
            </div>

            <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                    {data.title}
                </h2>
                <p style={{ color: 'var(--text-dim)' }}>
                    {data.workStream} • {data.energyLevel} Energy
                </p>
            </div>

            <button
                onClick={handleDone}
                disabled={completing}
                style={{
                    alignSelf: 'flex-start',
                    padding: '0.75rem 2rem',
                    borderRadius: '50px',
                    border: '1px solid var(--border-color)',
                    background: 'transparent',
                    color: 'var(--text-main)',
                    fontSize: '1rem',
                    transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'var(--text-main)'; e.currentTarget.style.color = 'var(--bg-color)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-main)'; }}
            >
                {completing ? '...' : 'Done'}
            </button>
        </article>
    );
}
