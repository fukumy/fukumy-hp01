document.addEventListener('DOMContentLoaded', () => {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 13.4876 3.36093 14.891 4 16.1272L3 21L7.8728 20C9.10904 20.6391 10.5124 21 12 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    
    const window = document.createElement('div');
    window.className = 'chat-window';
    window.innerHTML = `
        <div class="chat-header">
            <h3>Fukumi-me AI 窓口</h3>
            <span class="close-chat">&times;</span>
        </div>
        <div class="chat-messages" id="chatMessages">
            <div class="message message-ai">こんにちは！ふくみーのアシスタントです。AI活用や業務効率化について、何でも聞いてくださいね。</div>
        </div>
        <div class="chat-input-area">
            <input type="text" class="chat-input" id="chatInput" placeholder="メッセージを入力...">
            <button class="chat-send" id="chatSend">送信</button>
        </div>
    `;

    document.body.appendChild(bubble);
    document.body.appendChild(window);

    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');
    const closeChat = window.querySelector('.close-chat');

    // Toggle Window
    bubble.addEventListener('click', () => {
        window.style.display = window.style.display === 'flex' ? 'none' : 'flex';
    });

    closeChat.addEventListener('click', () => {
        window.style.display = 'none';
    });

    // Send Message
    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // User Message UI
        appendMessage(text, 'user');
        chatInput.value = '';

        // Typing indicator
        const typing = appendMessage('考え中...', 'ai typing');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            const data = await response.json();
            typing.remove();
            
            if (data.text) {
                appendMessage(data.text, 'ai');
            } else {
                appendMessage('すみません、不具合が発生しました。後ほどお試しください。', 'ai');
            }
        } catch (error) {
            typing.remove();
            appendMessage('通信エラーが発生しました。', 'ai');
        }
    }

    function appendMessage(text, type) {
        const msg = document.createElement('div');
        msg.className = `message message-${type}`;
        msg.innerText = text;
        chatMessages.appendChild(msg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return msg;
    }

    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});
