async function sendMessage() {
    const userInput = document.getElementById('user-input').value;
    if (!userInput) return;

    const userMessage = document.createElement('div');
    userMessage.className = 'message user-message';
    userMessage.textContent = userInput;
    document.getElementById('messages').appendChild(userMessage);

    document.getElementById('user-input').value = '';

    const progressBar = document.getElementById('progress-bar');
    const progressBarFill = progressBar.firstElementChild;
    progressBar.style.display = 'block';
    progressBarFill.style.width = '0%';

    const response = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userInput })
    });

    progressBar.style.display = 'none';

    const data = await response.json();
    const botMessage = document.createElement('div');
    botMessage.className = 'message bot-message';
    document.getElementById('messages').appendChild(botMessage);

    const words = formatResponse(data.response).split(' ');
    let index = 0;

    function displayNextWord() {
        if (index < words.length) {
            botMessage.innerHTML += words[index] + ' ';
            index++;
            setTimeout(displayNextWord, 100); // Adjust the delay as needed
        } else {
            // Scroll to the bottom of the messages container
            document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
        }
    }

    displayNextWord();
}

function formatResponse(response) {
    // Basic formatting: replace newlines with <br> tags and add bullet points for lists
    return response.replace(/\n/g, '<br>').replace(/•/g, '<br>•');
}

document.getElementById('send-button').addEventListener('click', sendMessage);

document.getElementById('user-input').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
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