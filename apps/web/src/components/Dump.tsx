import { useState } from 'react';
import { api } from '../lib/client';
import '../styles/global.css';

interface DumpProps {
    onDumpSuccess: (suggestions: any[]) => void;
}

export function Dump({ onDumpSuccess }: DumpProps) {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!text.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const response = await api.dump(text);
            setText('');
            if (response.suggestions) {
                onDumpSuccess(response.suggestions);
            } else {
                onDumpSuccess([]);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="stack fade-in" aria-label="Dump area">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Dump what’s in your head. No structure needed."
                rows={6}
                style={{
                    width: '100%',
                    padding: '1rem',
                    fontSize: '1rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    background: 'var(--card-bg)',
                    color: 'var(--text-main)',
                }}
                disabled={loading}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                    onClick={handleSubmit}
                    disabled={loading || !text.trim()}
                    style={{
                        padding: '0.75rem 1.5rem',
                        fontSize: '1rem',
                        background: 'var(--text-main)', // Using text-main for high contrast primary button
                        color: 'var(--bg-color)',
                        border: 'none',
                        borderRadius: '4px',
                        opacity: loading || !text.trim() ? 0.5 : 1,
                        transition: 'opacity 0.2s',
                    }}
                >
                    {loading ? 'Processing...' : 'Make sense of this'}
                </button>
                {error && <span style={{ color: 'var(--danger-color)', fontSize: '0.9rem' }}>{error}</span>}
            </div>
        </section>
    );
}
