import React, { useState } from 'react';
import { render } from 'react-dom';

import { getSyncMessage, getAsyncMessage, preloadLanguage } from './utils';

function App() {
  const [showMessage, setShowMessage] = useState(false);
  const [asyncMessage, setAsyncMessage] = useState('');
  const [language, setLang] = useState<'en' | 'fr'>('en');

  preloadLanguage(language);

  return (
    <div>
      <button
        id="toggle-language"
        onClick={() => setLang((curr) => (curr === 'en' ? 'fr' : 'en'))}
      >
        Toggle language: {language}
      </button>

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

render(<App />, node);
