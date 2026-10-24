
(() => {
  'use strict';

  // Keep the existing backend endpoints.
  const API_ROOT =
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:5000'
      : 'https://wallace-v5-backend.onrender.com';

  const API = `${API_ROOT}/api`;
  const MAX_HISTORY = 6;

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
          <span>Portfolio assistant</span>
        </div>
        <button class="wallace-ai-new" type="button"
          aria-label="Start a new conversation" title="New conversation">New</button>
        <button class="wallace-ai-close" type="button"
          aria-label="Close Wallace AI Assistant">×</button>
      </header>

      <div class="wallace-ai-trust">
        <span aria-hidden="true">✓</span>
        Answers based on verified portfolio information.
      </div>

      <div class="wallace-ai-messages" role="log" aria-live="polite"
        aria-relevant="additions text"></div>
      <div class="wallace-ai-suggestions" aria-label="Suggested questions"></div>

      <form class="wallace-ai-form">
        <label class="sr-only" for="wallace-ai-input">Ask Wallace AI</label>
        <input id="wallace-ai-input" name="question" type="text"
          autocomplete="off" maxlength="500"
          placeholder="Say hello or ask a question…" required>
        <button type="submit" aria-label="Send question">➤</button>
      </form>

      <p class="wallace-ai-note">
        This assistant uses portfolio data, not a paid generative AI service.
      </p>
    </section>
  `;

  document.body.appendChild(shell);

  const launcher = shell.querySelector('.wallace-ai-launcher');
  const panel = shell.querySelector('.wallace-ai-panel');
  const close = shell.querySelector('.wallace-ai-close');
  const newConversation = shell.querySelector('.wallace-ai-new');
  const messages = shell.querySelector('.wallace-ai-messages');
  const suggestions = shell.querySelector('.wallace-ai-suggestions');
  const form = shell.querySelector('.wallace-ai-form');
  const input = shell.querySelector('#wallace-ai-input');

  let history = [];
  let isBusy = false;

  const questions = [
    'What projects has Wallace built?',
    'What technologies does Wallace use?',
    'Is Wallace available for an internship?',
    'What is Wallace currently learning?',
    'How can I contact Wallace?'
  ];

  function add(kind, text, links = []) {
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
        if (
          !link ||
          typeof link.href !== 'string' ||
          typeof link.label !== 'string'
        ) {
          return;
        }

        // Accept only relative links and safe web/email URLs.
        const href = link.href.trim();
        const safe =
          href.startsWith('/') && !href.startsWith('//') ||
          /^https?:\/\//i.test(href) ||
          /^mailto:[^\s]+$/i.test(href);

        if (!safe) return;

        const anchor = document.createElement('a');
        anchor.href = href;
        anchor.textContent = link.label;

        if (/^https?:\/\//i.test(href)) {
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
  }

  function remember(role, content) {
    history.push({ role, content: String(content).slice(0, 500) });
    history = history.slice(-MAX_HISTORY);
  }

  function showWelcome() {
    add(
      'assistant',
      'Hello! 👋 Welcome to WALLACE.DEV. You can greet me, ask about Wallace’s projects and skills, or ask a follow-up question. How can I help you today?'
    );
  }

  function resetConversation() {
    history = [];
    messages.replaceChildren();
    showWelcome();
    input.focus();
  }

  async function ask(question) {
    const cleanQuestion = question.trim();

    if (!cleanQuestion || isBusy) return;

    add('user', cleanQuestion);
    remember('user', cleanQuestion);

    isBusy = true;
    form.querySelector('button[type="submit"]').disabled = true;
    input.disabled = true;

    const waiting = add('assistant', 'One moment — checking the portfolio…');

    // Exclude the latest question from history because it is sent separately.
    const recentHistory = history.slice(0, -1).slice(-MAX_HISTORY);

    try {
      const result = await fetch(`${API}/assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cleanQuestion,
          history: recentHistory
        })
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
      remember('assistant', data.text);
    } catch (error) {
      console.error('Wallace AI assistant request failed:', error);
      waiting.remove();

      add(
        'assistant',
        'I couldn’t connect to the portfolio assistant just now. Please check your connection and try again.'
      );
    } finally {
      isBusy = false;
      form.querySelector('button[type="submit"]').disabled = false;
      input.disabled = false;
      input.focus();
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
      showWelcome();
    }

    if (shouldOpen) input.focus();
  });

  close.addEventListener('click', () => {
    panel.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus();
  });

  newConversation.addEventListener('click', resetConversation);

  form.addEventListener('submit', event => {
    event.preventDefault();

    const question = input.value.trim();
    if (!question) return;

    input.value = '';
    ask(question);
  });
})();
