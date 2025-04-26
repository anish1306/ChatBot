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
        console.log('ChatGPT Response:', data); // Log the exact response

        // Add the bot's message to the chat with a typing effect
        const botMessage = document.createElement('div');
        botMessage.className = 'message bot-message';
        messagesContainer.appendChild(botMessage);

        // Scroll to the bottom of the messages container
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Display the response with formatting
        await typeResponse(botMessage, data.response);

        // Scroll to the bottom again after the typing effect
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
        console.error('Error fetching response:', error);
        progressBar.style.display = 'none';
    }
}

// Function to display the response with formatting
async function typeResponse(element, response) {
    // Check if the response contains a numbered list
    if (response.match(/^\d+\./m)) {
        const lines = response.split('\n');
        const ul = document.createElement('ul'); // Create a list container
        ul.style.marginLeft = '20px'; // Add some indentation
        for (const line of lines) {
            if (line.match(/^\d+\./)) {
                const li = document.createElement('li');
                // Remove the leading number and period (e.g., "1. ") before adding to the list
                const cleanedLine = line.replace(/^\d+\.\s*/, '');
                li.innerHTML = formatMarkdown(cleanedLine.trim()); // Format the line and add it as a list item
                ul.appendChild(li);
            } else if (line.trim() !== '') {
                // Add non-list lines as paragraphs only if they are not empty
                const p = document.createElement('p');
                p.innerHTML = formatMarkdown(line.trim()); // Format non-list lines as paragraphs
                element.appendChild(p);
            }
        }
        element.appendChild(ul); // Append the list to the element
    } else {
        // For regular text, display it word by word
        const words = response.split(' '); // Split the response into words
        for (const word of words) {
            element.innerHTML += `${formatMarkdown(word)} `; // Add each word with formatting
            await new Promise((resolve) => setTimeout(resolve, 50)); // Delay between words
        }
    }
}

// Function to format Markdown-like syntax
function formatMarkdown(text) {
    // Replace #### Heading with <h4>Heading</h4>
    text = text.replace(/####\s*(.+)/g, '<h4>$1</h4>');

    // Replace ### Heading with <h3>Heading</h3>
    text = text.replace(/###\s*(.+)/g, '<h3>$1</h3>');

    // Replace ## Heading with <h2>Heading</h2>
    text = text.replace(/##\s*(.+)/g, '<h2>$1</h2>');

    // Replace # Heading with <h1>Heading</h1>
    text = text.replace(/#\s*(.+)/g, '<h1>$1</h1>');

    // Replace **bold** with <strong>bold</strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Replace *italic* with <em>italic</em>
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Replace `inline code` with <code>inline code</code>
    text = text.replace(/`(.*?)`/g, '<code>$1</code>');

    // Replace --- or *** with <hr> (horizontal rule)
    text = text.replace(/^\s*(---|\*\*\*)\s*$/gm, '<hr>');

    return text;
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
            sendMessage(); // Submit the input
            userInput.blur(); // Remove focus to close the keyboard
        }
    });
});