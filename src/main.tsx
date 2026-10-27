import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SlideGallery } from './components/slides/SlideGallery';
import { clearAllStored } from './lib/storage';
import './styles/index.css';

function AppCrashed() {
  return (
    <main role="alert" className="mx-auto max-w-column space-y-4 px-5 py-20 text-center">
      <h1 className="text-title text-ink">LectureLens hit a problem</h1>
      <p className="text-lg text-ink-soft">Reloading usually fixes it. If it keeps happening, clearing the data saved in this browser will.</p>
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
          Reload
        </button>
        <button
          type="button"
          className="chip"
          onClick={() => {
            clearAllStored();
            window.location.reload();
          }}
        >
          Clear my data and reload
        </button>
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary where="app" fallback={() => <AppCrashed />}>
      {import.meta.env.DEV && new URLSearchParams(window.location.search).has('slides') ? <SlideGallery /> : <App />}
    </ErrorBoundary>
  </StrictMode>,
);
