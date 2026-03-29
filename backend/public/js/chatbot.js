// Inject Chat UI HTML
const chatHTML = `
  <div id="messmitra-chatbot" class="chatbot-container closed">
    <div class="chatbot-header">
      <div class="chatbot-title">
        <span class="chatbot-icon">🤖</span>
        MessMitra AI
      </div>
      <button class="chatbot-close" onclick="chatbot.toggle()">×</button>
    </div>
    <div id="chatbot-messages" class="chatbot-messages">
      <div class="chat-msg bot-msg">Hi there! I am the MessMitra AI. You can ask me about messes, menus, pricing, or plans!</div>
    </div>
    <div class="chatbot-input">
      <input type="text" id="chatbot-input-field" placeholder="Ask something..." onkeypress="chatbot.handleEnter(event)">
      <button onclick="chatbot.sendMessage()" class="chatbot-send">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
      </button>
    </div>
  </div>
  <button id="chatbot-fab" class="chatbot-fab" onclick="chatbot.toggle()">
    <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
    <span>Ask AI ✨</span>
  </button>
`;

document.body.insertAdjacentHTML('beforeend', chatHTML);

const chatbot = {
  isOpen: false,
  isWaiting: false,
  toggle() {
    this.isOpen = !this.isOpen;
    document.getElementById('messmitra-chatbot').classList.toggle('closed', !this.isOpen);
    document.getElementById('chatbot-fab').style.transform = this.isOpen ? 'scale(0)' : 'scale(1)';
    if(this.isOpen) document.getElementById('chatbot-input-field').focus();
  },
  handleEnter(e) {
    if (e.key === 'Enter') this.sendMessage();
  },
  async sendMessage() {
    if (this.isWaiting) return; // Prevent spamming
    
    const inputField = document.getElementById('chatbot-input-field');
    const msg = inputField.value.trim();
    if (!msg) return;

    this.isWaiting = true;
    inputField.disabled = true;

    // Add user message to UI
    this.appendMessage(msg, 'user-msg');
    inputField.value = '';

    // Add loading state
    const loadingId = this.appendMessage('...', 'bot-msg loading');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: msg })
      });
      const data = await res.json();
      
      // Update UI
      document.getElementById(loadingId).remove();
      if (data.success && data.data) {
        this.appendMessage(data.data, 'bot-msg');
      } else {
        this.appendMessage(data.message || 'Error occurred.', 'bot-msg');
      }
    } catch (err) {
      document.getElementById(loadingId).remove();
      this.appendMessage('Network error. Is the server running?', 'bot-msg');
    } finally {
      this.isWaiting = false;
      inputField.disabled = false;
      inputField.focus();
    }
  },
  appendMessage(text, className) {
    const id = 'msg-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
    const formattedText = text.replace(/\n/g, '<br>');
    const msgHTML = `<div id="${id}" class="chat-msg ${className}">${formattedText}</div>`;
    const messagesDiv = document.getElementById('chatbot-messages');
    messagesDiv.insertAdjacentHTML('beforeend', msgHTML);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    return id;
  }
};

window.chatbot = chatbot;
