async function sendMessage() {
    const userInput = document.getElementById('user-input').value.trim();
    if (!userInput) return;

    // Hide the placeholder text if it's visible
    const placeholder = document.getElementById('placeholder-text');
    if (placeholder) {
        placeholder.style.display = 'none';
    }

    // Add the user's message to the chat
    const messagesContainer = document.getElementById('messages');
    const userMessage = document.createElement('div');
    userMessage.className = 'message user-message';
    userMessage.textContent = userInput;
    messagesContainer.appendChild(userMessage);

    // Clear the input box
    document.getElementById('user-input').value = '';

    // Show the progress bar
    const progressBar = document.getElementById('progress-bar');
    const progressBarFill = progressBar.firstElementChild;
    progressBar.style.display = 'block';
    progressBarFill.style.width = '0%';

    try {
        // Fetch the response from the backend
        const response = await fetch('https://chatbot-s5zd.onrender.com/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userInput }),
        });

        progressBar.style.display = 'none';

        const data = await response.json();

        // Add the bot's message to the chat
        const botMessage = document.createElement('div');
        botMessage.className = 'message bot-message';
        botMessage.innerHTML = formatResponse(data.response); // Format the response
        messagesContainer.appendChild(botMessage);

        // Scroll to the bottom of the messages container
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
        console.error('Error fetching response:', error);
        progressBar.style.display = 'none';
    }
}

function formatResponse(response) {
    // Basic formatting: replace newlines with <br> tags and add bullet points for lists
    return response.replace(/\n/g, '<br>').replace(/•/g, '<br>•');
}

// Handle the send button click
document.getElementById('send-button').addEventListener('click', sendMessage);

// Handle the Enter and Shift + Enter keys
document.getElementById('user-input').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        if (event.shiftKey) {
            // Allow Shift + Enter to insert a new line
            event.preventDefault();
            const input = document.getElementById('user-input');
            input.value += '\n'; // Add a new line to the input box
        } else {
            // Submit the input on Enter
            event.preventDefault();
            sendMessage();
        }
    }
});

// Speech recognition setup
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

document.getElementById('voice-button').addEventListener('click', () => {
    recognition.start();
});

recognition.addEventListener('result', (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById('user-input').value = transcript;
    sendMessage();
});

recognition.addEventListener('speechend', () => {
    recognition.stop();
});

recognition.addEventListener('error', (event) => {
    console.error('Speech recognition error detected: ' + event.error);
});

document.getElementById('clear-button').addEventListener('click', () => {
    const messagesContainer = document.getElementById('messages');
    messagesContainer.innerHTML = ''; // Clear all messages

    // Reset the placeholder text
    const placeholder = document.createElement('div');
    placeholder.id = 'placeholder-text';
    placeholder.textContent = 'Welcome! What can I help you with?';
    messagesContainer.appendChild(placeholder);

    // Clear the input box
    document.getElementById('user-input').value = '';
});

document.addEventListener("DOMContentLoaded", () => {
    const userInput = document.getElementById("user-input");

    // Detect "Enter" key press and blur the input on mobile
    userInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent default behavior (e.g., adding a new line)
            userInput.blur(); // Remove focus to close the keyboard
        }
    });
});
