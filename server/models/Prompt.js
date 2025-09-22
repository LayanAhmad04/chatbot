const mongoose = require('mongoose');

const PromptSchema = new mongoose.Schema({
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    title: String,
    content: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Prompt', PromptSchema);
