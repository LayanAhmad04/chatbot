const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    messages: [{ role: String, content: String }],
}, { timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);
