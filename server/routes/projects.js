const express = require('express');
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const Prompt = require('../models/Prompt');

const router = express.Router();

// create project
router.post('/', auth, async (req, res) => {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    try {
        const p = new Project({ user: req.userId, name, description });
        await p.save();
        res.json(p);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'server error' });
    }
});

// list projects for user
router.get('/', auth, async (req, res) => {
    try {
        const projects = await Project.find({ user: req.userId }).sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'server error' });
    }
});

// add prompt to project
router.post('/:projectId/prompts', auth, async (req, res) => {
    const { projectId } = req.params;
    const { title, content } = req.body;
    if (!content) return res.status(400).json({ error: 'content required' });
    try {
        // TODO: verify project belongs to user (simple check)
        const prompt = new Prompt({ project: projectId, title, content });
        await prompt.save();
        res.json(prompt);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'server error' });
    }
});

// list prompts for project
router.get('/:projectId/prompts', auth, async (req, res) => {
    const { projectId } = req.params;
    try {
        const prompts = await Prompt.find({ project: projectId }).sort({ createdAt: -1 });
        res.json(prompts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'server error' });
    }
});

module.exports = router;
