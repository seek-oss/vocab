import { useState } from 'react';
import { createRoot } from 'react-dom/client';

import {
  getSyncMessage,
  getAsyncMessage,
  preloadLanguage,
  type LanguageName,
} from './utils';

function App() {
  const [showMessage, setShowMessage] = useState(false);
  const [asyncMessage, setAsyncMessage] = useState('');
  const [language, setLang] = useState<LanguageName>('en');

  preloadLanguage(language);

  return (
    <div>
      <label htmlFor="languages">Language:</label>
      <select
        name="languages"
        id="language-select"
        onChange={(event) => {
          setLang(event.currentTarget.value as LanguageName);
        }}
      >
        <option value="en">en</option>
        <option value="fr">fr</option>
        <option value="pseudo">pseudo</option>
      </select>

      <button id="show-message" onClick={() => setShowMessage(true)}>
        Show Message
      </button>
      <button
        onClick={() => {
          setShowMessage(false);
          setAsyncMessage('');
        }}
      >
        Clear Message
      </button>
      {showMessage && (
        <>
          <div>
            <label>Sync Message:&nbsp;</label>
            <strong id="sync-message">
              {getSyncMessage(language, language) || ''}
            </strong>
          </div>

          <div>
            <label>Async Message:&nbsp;</label>
            <strong id="async-message">{asyncMessage}</strong>
          </div>
          <button
            id="update-message"
            onClick={() =>
              getAsyncMessage(language, language).then((v) =>
                setAsyncMessage(v),
              )
            }
          >
            Update Async Message
          </button>
        </>
      )}
    </div>
  );
}

const node = document.createElement('div');

document.body.appendChild(node);

createRoot(node).render(<App />);
