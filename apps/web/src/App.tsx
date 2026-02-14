import { useState } from 'react';
import { Dump } from './components/Dump';
import { Review } from './components/Review';
import { Now } from './components/Now';
import type { Commitment } from './lib/client';

function App() {
  const [reviewItems, setReviewItems] = useState<Commitment[]>([]);
  const [view, setView] = useState<'normal' | 'reviewing'>('normal');

  const onDumpComplete = (suggestions: Commitment[]) => {
    if (suggestions && suggestions.length > 0) {
      setReviewItems(suggestions);
      setView('reviewing');
    }
    // If no suggestions (e.g. empty or error), stay in normal view.
  };

  const handleReviewComplete = () => {
    setReviewItems([]);
    setView('normal');
  };

  return (
    <>
      <header className="fade-in" style={{ marginBottom: '1rem' }}>
        <div style={{ width: '24px', height: '24px', background: 'var(--accent-color)', borderRadius: '50%' }}></div>
      </header>

      <main className="stack">
        {/* Dump is always visible, but maybe disabled or minimized during review? 
            "Dump box (always visible)" - User Request
            So we keep it. */}
        <Dump onDumpSuccess={(items) => onDumpComplete(items)} />

        {/* Review Section */}
        {view === 'reviewing' && (
          <Review
            suggestions={reviewItems}
            onComplete={handleReviewComplete}
          />
        )}

        {/* Now Section - "core UI"
            Visible when not reviewing? "One action at a time."
            If we are reviewing, that is the action.
            So maybe hide Now when reviewing?
            User says: "Review section ... Visible ONLY when unconfirmed commitments exist"
            User says: "Now card ... Displays EXACTLY ONE commitment"
            User says: "One action at a time"
            
            Interpretation: If there are unconfirmed items (Review state), show Review. 
            Once confirmed, show Now.
        */}
        {view === 'normal' && (
          <Now />
        )}
      </main>

      <footer style={{ marginTop: 'auto', paddingTop: '2rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
        <p>&copy; {new Date().getFullYear()} Helm System</p>
      </footer>
    </>
  );
}

export default App;
