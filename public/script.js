document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');
  const themeToggle = document.getElementById('theme-toggle');

  // Theme toggle functionality
  const currentTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', currentTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  // Helper function to add a message to the chat box
  const addMessage = (sender, text) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);

    // Add message content
    const contentDiv = document.createElement('div');
    contentDiv.textContent = text;
    messageElement.appendChild(contentDiv);

    // Add timestamp
    const timestampDiv = document.createElement('div');
    timestampDiv.classList.add('message-timestamp');
    const now = new Date();
    timestampDiv.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    messageElement.appendChild(timestampDiv);

    chatBox.appendChild(messageElement);
    // Scroll to the bottom of the chat box
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageElement;
  };

  // Show initial welcome message
  setTimeout(() => {
    addMessage('bot', 'Hello! I\'m your Gemini AI assistant. How can I help you today?');
  }, 500);

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userMessage = userInput.value.trim();
    if (!userMessage) {
      return;
    }

    // Add user's message to the chat box
    addMessage('user', userMessage);

    // Clear the input field
    userInput.value = '';

    // Show a temporary "Thinking..." message
    const thinkingMessage = addMessage('bot', 'Thinking...');
    thinkingMessage.classList.add('thinking');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation: [{ role: 'user', text: userMessage }],
        }),
      });

      console.log("Response:", response);
      if (!response.ok) {
        thinkingMessage.classList.remove('thinking');
        thinkingMessage.querySelector('div').textContent = 'Failed to get response from server.';
        return;
      }

      const data = await response.json();

      if (data && data.result) {
        // Replace "Thinking..." with the actual response
        thinkingMessage.classList.remove('thinking');
        thinkingMessage.querySelector('div').textContent = data.result;
      } else {
        thinkingMessage.classList.remove('thinking');
        thinkingMessage.querySelector('div').textContent = 'Sorry, no response received.';
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle network errors or other issues
      thinkingMessage.classList.remove('thinking');
      thinkingMessage.querySelector('div').textContent = 'Failed to get response from server.';
    }
  });
});