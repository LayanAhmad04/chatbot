const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: String
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
