
(() => {
  'use strict';

  // Use the local backend during development and Render in production.
  const API_ROOT =
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1'
      ? 'http://127.0.0.1:5001'
      : 'https://wallace-v5-backend.onrender.com';

  const API = `${API_ROOT}/api`;

  const shell = document.createElement('div');
  shell.className = 'wallace-ai';

  shell.innerHTML = `
    <button class="wallace-ai-launcher" type="button"
      aria-expanded="false" aria-controls="wallace-ai-panel"
      aria-label="Open Wallace AI Assistant">
      <span class="wallace-ai-launcher-icon" aria-hidden="true">AI</span>
      <span class="wallace-ai-launcher-label">Ask Wallace AI</span>
      <span class="wallace-ai-online" aria-hidden="true"></span>
    </button>

    <section class="wallace-ai-panel" id="wallace-ai-panel"
      role="dialog" aria-label="Wallace AI portfolio assistant" hidden>
      <header class="wallace-ai-header">
        <div class="wallace-ai-avatar" aria-hidden="true">W</div>
        <div>
          <strong>Wallace AI</strong>
          <span>Verified portfolio assistant</span>
        </div>
        <button class="wallace-ai-close" type="button"
          aria-label="Close Wallace AI Assistant">×</button>
      </header>

      <div class="wallace-ai-trust">
        <span aria-hidden="true">✓</span>
        Answers from the verified WALLACE.DEV backend.
      </div>

      <div class="wallace-ai-messages" role="log" aria-live="polite"></div>
      <div class="wallace-ai-suggestions" aria-label="Suggested questions"></div>

      <form class="wallace-ai-form">
        <label class="sr-only" for="wallace-ai-input">Ask Wallace AI</label>
        <input id="wallace-ai-input" name="question" type="text"
          autocomplete="off" maxlength="240"
          placeholder="Ask about projects, skills, availability…" required>
        <button type="submit" aria-label="Send question">➜</button>
      </form>

      <p class="wallace-ai-note">
        Responses use portfolio data stored in the WALLACE.DEV backend.
      </p>
    </section>
  `;

  document.body.appendChild(shell);

  const launcher = shell.querySelector('.wallace-ai-launcher');
  const panel = shell.querySelector('.wallace-ai-panel');
  const close = shell.querySelector('.wallace-ai-close');
  const messages = shell.querySelector('.wallace-ai-messages');
  const suggestions = shell.querySelector('.wallace-ai-suggestions');
  const form = shell.querySelector('.wallace-ai-form');
  const input = shell.querySelector('#wallace-ai-input');

  const questions = [
    'What projects has Wallace built?',
    'What technologies does Wallace use?',
    'Is Wallace available for an internship?',
    'What is Wallace currently learning?',
    'How can I contact Wallace?'
  ];

  const add = (kind, text, links = []) => {
    const row = document.createElement('div');
    row.className = `wallace-ai-message ${kind}`;

    const bubble = document.createElement('div');
    bubble.className = 'wallace-ai-bubble';

    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    bubble.appendChild(paragraph);

    if (Array.isArray(links) && links.length) {
      const actions = document.createElement('div');
      actions.className = 'wallace-ai-actions';

      links.forEach(link => {
        if (!link || typeof link.href !== 'string' ||
            typeof link.label !== 'string') {
          return;
        }

        const anchor = document.createElement('a');
        anchor.href = link.href;
        anchor.textContent = link.label;

        if (/^https?:/i.test(link.href)) {
          anchor.target = '_blank';
          anchor.rel = 'noopener noreferrer';
        }

        actions.appendChild(anchor);
      });

      if (actions.children.length) {
        bubble.appendChild(actions);
      }
    }

    row.appendChild(bubble);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
    return row;
  };

  async function ask(question) {
    add('user', question);

    const waiting = add('assistant', 'Checking verified portfolio data…');

    try {
      const result = await fetch(`${API}/assistant/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: question })
      });

      const contentType = result.headers.get('content-type') || '';

      if (!contentType.includes('application/json')) {
        throw new Error(`Unexpected server response (${result.status}).`);
      }

      const data = await result.json();

      if (!result.ok) {
        throw new Error(data.error || `Request failed (${result.status}).`);
      }

      if (typeof data.text !== 'string') {
        throw new Error('The server returned an unexpected response.');
      }

      waiting.remove();
      add('assistant', data.text, data.links || []);
    } catch (error) {
      console.error('Wallace AI assistant request failed:', error);
      waiting.remove();

      add(
        'assistant',
        'The portfolio assistant could not retrieve an answer. Please try again shortly.'
      );
    }
  }

  questions.forEach(question => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = question;
    button.addEventListener('click', () => ask(question));
    suggestions.appendChild(button);
  });

  launcher.addEventListener('click', () => {
    const shouldOpen = panel.hidden;
    panel.hidden = !shouldOpen;
    launcher.setAttribute('aria-expanded', String(shouldOpen));

    if (shouldOpen && !messages.children.length) {
      add(
        'assistant',
        'Hi — ask me about Wallace’s verified projects, technologies, learning, availability or contact details.'
      );
    }

    if (shouldOpen) input.focus();
  });

  close.addEventListener('click', () => {
    panel.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus();
  });

  form.addEventListener('submit', event => {
    event.preventDefault();

    const question = input.value.trim();
    if (!question) return;

    input.value = '';
    ask(question);
  });
})();
