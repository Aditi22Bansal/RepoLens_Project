const Repository = require('../models/Repository');
const { parseGitHubUrl, getRepoMetadata, getRepoTree, getRecentCommits, getContributors } = require('../services/githubService');
const { calculateHealth } = require('../services/analyzerService');
const { summarizeStructure } = require('../services/indexerService');
const { searchFiles } = require('../services/searchService');

exports.analyzeRepo = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: 'GitHub URL is required' });

        const { owner, repo } = parseGitHubUrl(url);

        // Fetch GitHub data
        const metadata = await getRepoMetadata(owner, repo);
        const branch = metadata.default_branch;

        // Fetch tree, commits, contributors
        const tree = await getRepoTree(owner, repo, branch);
        const commits = await getRecentCommits(owner, repo, 50);
        const contributors = await getContributors(owner, repo);

        // Compute insights (Advanced features included)
        const health = calculateHealth(metadata, commits, contributors, tree);
        const structure = summarizeStructure(tree);

        // Upsert into DB
        const repoDoc = await Repository.findOneAndUpdate(
            { url: `https://github.com/${owner}/${repo}` },
            {
                url: `https://github.com/${owner}/${repo}`,
                owner,
                name: repo,
                description: metadata.description,
                stars: metadata.stargazers_count,
                forks: metadata.forks_count,
                watchers: metadata.watchers_count,
                openIssues: metadata.open_issues_count,
                language: metadata.language,
                topics: metadata.topics,
                createdAt: metadata.created_at,
                updatedAt: metadata.updated_at,
                pushedAt: metadata.pushed_at,
                license: metadata.license ? metadata.license.name : null,
                defaultBranch: branch,
                healthScore: health.scores,
                healthInsights: health.insights,
                contributionReadiness: health.contributionReadiness,
                commitActivity: health.commitActivity,
                structureSummary: structure.summary,
                techStack: structure.techStack,
                monolithHotspots: structure.hotspots,
                secretLeaks: structure.secrets,
                files: tree.map(t => ({ path: t.path, type: t.type, size: t.size })),
                lastAnalyzed: Date.now()
            },
            { new: true, upsert: true }
        );

        res.json({ message: 'Analysis complete', data: repoDoc });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getRepoOverview = async (req, res) => {
    try {
        const repo = await Repository.findById(req.params.id).select('-files -commitActivity');
        if (!repo) return res.status(404).json({ error: 'Repo not found' });
        res.json({ data: repo });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getRepoHealth = async (req, res) => {
    try {
        const repo = await Repository.findById(req.params.id)
            .select('healthScore healthInsights structureSummary techStack monolithHotspots secretLeaks contributionReadiness commitActivity');
        if (!repo) return res.status(404).json({ error: 'Repo not found' });
        res.json({ data: repo });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getRepoFiles = async (req, res) => {
    try {
        const repo = await Repository.findById(req.params.id).select('files');
        if (!repo) return res.status(404).json({ error: 'Repo not found' });
        res.json({ data: repo.files });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.searchRepo = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ error: 'Search query is required' });

        const repo = await Repository.findById(req.params.id);
        if (!repo) return res.status(404).json({ error: 'Repo not found' });

        const results = await searchFiles(query, repo);
        res.json({ data: results });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getRecommendations = async (req, res) => {
    try {
        const repo = await Repository.findById(req.params.id).select('healthInsights');
        if (!repo) return res.status(404).json({ error: 'Repo not found' });
        res.json({ data: repo.healthInsights.recommendations });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const history = await Repository.find()
            .sort({ lastAnalyzed: -1 })
            .limit(10)
            .select('owner name description stars language healthScore techStack lastAnalyzed url');

        res.json({ data: history });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
