const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const Prompt = require('../models/Prompt');
const Chat = require('../models/Chat');

const router = express.Router();

// POST /api/chat/:projectId
// Body: { message: "user text" }
router.post('/:projectId', auth, async (req, res) => {
    const { projectId } = req.params;
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });

    try {
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ error: 'project not found' });

        // load prompts for project as context (optional)
        const prompts = await Prompt.find({ project: projectId });
        let systemContext = `You are a helpful assistant for project "${project.name}".\n\n`;
        if (prompts && prompts.length) {
            systemContext += 'Project prompts/context:\n' + prompts.map(p => `- ${p.title || 'prompt'}: ${p.content}`).join('\n');
        }

        // messages for chat API
        const messages = [
            { role: 'system', content: systemContext },
            { role: 'user', content: message }
        ];

        // call OpenRouter chat completion (non-OpenAI model)
        const openrouterResponse = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'mistralai/mixtral-8x7b-instruct', // non-OpenAI example model
                messages
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 120000
            }
        );

        // parse response - follow OpenRouter chat-completions format
        const assistantMessage = openrouterResponse.data?.choices?.[0]?.message?.content
            || openrouterResponse.data?.output?.[0]?.content
            || JSON.stringify(openrouterResponse.data);

        // save to chat history
        const chat = new Chat({
            project: projectId,
            messages: [
                { role: 'user', content: message },
                { role: 'assistant', content: assistantMessage }
            ]
        });
        await chat.save();

        res.json({ reply: assistantMessage });
    } catch (err) {
        console.error('Chat error', err?.response?.data || err.message || err);
        res.status(500).json({ error: 'LLM call failed', details: err?.response?.data || err.message });
    }
});

module.exports = router;
