const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
    url: { type: String, required: true, unique: true },
    owner: String,
    name: String,
    description: String,
    stars: Number,
    forks: Number,
    watchers: Number,
    openIssues: Number,
    language: String,
    topics: [String],
    createdAt: Date,
    updatedAt: Date,
    pushedAt: Date,
    license: String,
    defaultBranch: String,

    healthScore: {
        overall: Number,
        maintenance: Number,
        collaboration: Number,
        documentation: Number,
        deployment: Number
    },

    healthInsights: {
        strengths: [String],
        risks: [String],
        recommendations: [String]
    },

    structureSummary: String,
    techStack: [String],
    monolithHotspots: [{
        path: String,
        size: Number
    }],
    secretLeaks: [{
        path: String,
        riskLevel: String
    }],
    contributionReadiness: Number, // 0-100 score
    commitActivity: [{
        week: String,
        count: Number
    }],

    files: [{
        path: String,
        type: { type: String, enum: ['file', 'dir'] },
        size: Number
    }],

    lastAnalyzed: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Repository', repositorySchema);
