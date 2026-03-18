const intents = {
    authentication: ['auth', 'login', 'signin', 'signup', 'jwt', 'token', 'passport', 'session', 'security'],
    database: ['db', 'database', 'mongo', 'mongoose', 'postgres', 'sql', 'prisma', 'schema', 'connection', 'storage'],
    deployment: ['docker', 'docker-compose', 'ci', 'cd', 'deploy', 'workflow', 'nginx', 'aws', 'vercel', 'devops'],
    notifications: ['mail', 'email', 'smtp', 'nodemailer', 'sendgrid', 'notification'],
    payments: ['stripe', 'paypal', 'payment', 'checkout', 'billing'],
    websockets: ['socket', 'ws', 'realtime', 'io'],
    frontend: ['component', 'view', 'page', 'ui', 'react', 'vue', 'template'],
    backend: ['controller', 'route', 'api', 'handler', 'middleware'],
    analytics: ['report', 'analytics', 'chart', 'dashboard', 'metric'],
    ai: ['ai', 'ml', 'bot', 'prompt', 'model', 'chatbot', 'llm', 'openai'],
    file_upload: ['upload', 'multer', 's3', 'attachment', 'file']
};

const detectIntent = (query) => {
    const q = query.toLowerCase();
    for (const [intent, keywords] of Object.entries(intents)) {
        if (keywords.some(kw => q.includes(kw))) {
            return intent;
        }
    }
    return 'general';
};

const getKeywordsForIntent = (intent) => {
    return intents[intent] || [];
};

const axios = require('axios');

async function askGemini(query, repoData) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    try {
        const prompt = `You are an AI assistant analyzing a GitHub repository. Answer the user's question concisely based on this data:
    Repo: ${repoData.owner}/${repoData.name}
    Description: ${repoData.description || 'N/A'}
    Stars: ${repoData.stars || 0}, Forks: ${repoData.forks || 0}, Issues: ${repoData.openIssues || 0}
    Language: ${repoData.language || 'N/A'}, Tech Stack: ${(repoData.techStack || []).join(', ')}
    Overall Health Score: ${repoData.healthScore?.overall || 0}/100
    Maintenance Score: ${repoData.healthScore?.maintenance || 0}/100
    Collaboration Score: ${repoData.healthScore?.collaboration || 0}/100
    Documentation Score: ${repoData.healthScore?.documentation || 0}/100
    Deployment Score: ${repoData.healthScore?.deployment || 0}/100
    Open-Source Contribution Readiness Grade (0-100): ${repoData.contributionReadiness || 0}
    Secret Leaks Detected: ${repoData.secretLeaks?.length || 0}
    Monolith File Hotspots: ${(repoData.monolithHotspots || []).map(h => h.path).join(', ')}
    Codebase Architecture Summary: ${repoData.structureSummary || 'N/A'}
    
    User Query: "${query}"
    
    Answer clearly and concisely in 1-3 sentences.`;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            { contents: [{ parts: [{ text: prompt }] }] }
        );
        return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Gemini API Error:', error.message);
        return null;
    }
}

exports.searchFiles = async (query, repoData) => {
    const q = query.toLowerCase();

    // 1. Try Gemini first if key exists
    let directAnswer = await askGemini(query, repoData);

    // 2. Expanded Fallback Rule-Based Engine
    if (!directAnswer) {
        if (q.includes('how many issues') || q.includes('open issues') || q.includes('issue count')) {
            directAnswer = `This repository currently has ${repoData.openIssues || 0} open issues.`;
        } else if (q.includes('stars') || q.includes('how many stars') || q.includes('stargazers')) {
            directAnswer = `This repository has ${repoData.stars || 0} stars.`;
        } else if (q.includes('health') || q.includes('score')) {
            directAnswer = `The overall project health score is ${repoData.healthScore?.overall || 0}/100. It measures maintenance, collaboration, docs, and deployment readiness.`;
        } else if (q.includes('forks') || q.includes('how many forks')) {
            directAnswer = `This repository has been forked ${repoData.forks || 0} times.`;
        } else if (q.includes('owner') || q.includes('author') || q.includes('who created')) {
            directAnswer = `This repository is owned by ${repoData.owner}.`;
        } else if (q.includes('language') || q.includes('tech stack') || q.includes('stack')) {
            directAnswer = `The primary language is ${repoData.language || 'unknown'} and the detected stack includes: ${(repoData.techStack || []).join(', ')}.`;
        } else if (q.includes('description') || q.includes('what is this') || q.includes('about')) {
            directAnswer = repoData.description ? `Description: ${repoData.description}` : 'No description is available for this repository.';
        } else if (q.includes('readiness grade') || q.includes('contribution readiness')) {
            directAnswer = `The OSS Contribution Readiness Grade (${repoData.contributionReadiness || 0}/100) measures how open-source friendly this repository is by checking for CONTRIBUTING.md, CODE_OF_CONDUCT.md, Issue Templates, and Licenses.`;
        } else if (q.includes('monolith') || q.includes('hotspots') || q.includes('largest files') || q.includes('big files')) {
            const hotspots = (repoData.monolithHotspots || []).map(h => h.path).join(', ');
            directAnswer = hotspots ? `Code Hotspots identify the largest single files that might need refactoring. The hotspots here are: ${hotspots}.` : `No major hotspots detected.`;
        } else if (q.includes('secret') || q.includes('leak') || q.includes('security')) {
            directAnswer = `The security scan detected ${repoData.secretLeaks?.length || 0} potential generic secret leaks (like exposed .env or .pem files).`;
        } else if (q.split(' ').length > 3) {
            // Unmatched complex question fallback
            directAnswer = `I couldn't find a direct answer based on my hardcoded rules. (Pro tip: Add a GEMINI_API_KEY to the backend .env file to secretly unlock true conversational AI that can answer ANY question about this repo!)`;
        }
    }

    const tree = repoData.files || [];
    const intent = detectIntent(query);
    const keywords = getKeywordsForIntent(intent);

    // Create a base search token list from query
    const queryTokens = q.split(/[\s,.-]+/).filter(t => t.length > 2);
    const allSearchTerms = [...new Set([...queryTokens, ...keywords])];

    const results = tree.map(file => {
        let score = 0;
        const lowerPath = file.path.toLowerCase();

        // File Name Match holds highest weight
        const fileName = lowerPath.split('/').pop();

        allSearchTerms.forEach(term => {
            // High score for exact filename
            if (fileName.includes(term)) score += 50;
            // High score for folder path match
            else if (lowerPath.includes(term)) score += 20;
        });

        return {
            path: file.path,
            type: file.type,
            score,
            intent
        };
    }).filter(f => f.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5); // Return top 5

    const formattedResults = results.map(r => {
        // Generate an explanation
        let role = 'Likely contains logic related to ' + r.intent + '.';
        if (r.intent === 'general') {
            role = 'Matches keyword search.';
        }

        // Calculate a dummy confidence
        const confidence = Math.min(99, Math.round(50 + (r.score * 0.5))) + '%';

        return {
            file: r.path,
            confidence,
            reason: `File path matches search terms for intent: ${r.intent}`,
            likelyRole: role
        };
    });

    return {
        answer: directAnswer,
        results: formattedResults
    };
};
