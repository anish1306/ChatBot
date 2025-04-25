require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Import the cors package

const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

const apiKey = process.env.OPENAI_API_KEY;

async function getChatbotResponse(userInput) {
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: userInput }]
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error communicating with OpenAI API:', error.response ? error.response.data : error.message);
        //console.error('Error communicating with OpenAI API:', error);
        return "I'm sorry, I couldn't process your request.";
    }
}

// Define a POST endpoint for the chatbot
app.post('/chat', async (req, res) => {
    const userInput = req.body.message; // Get the user input from the request body
    if (!userInput) {
        return res.status(400).send({ error: 'Message is required' });
    }

    const botResponse = await getChatbotResponse(userInput);
    res.send({ response: botResponse });
});

// Start the server
app.listen(port, () => {
    console.log(`Chatbot is running at http://localhost:${port}`);
});
