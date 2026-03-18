const { Octokit } = require('@octokit/rest');
const dotenv = require('dotenv');
dotenv.config();

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN || undefined,
});

// Parse GitHub URL to get owner and repo name
exports.parseGitHubUrl = (url) => {
    try {
        // Check if it's already "owner/repo" form
        if (!url.includes('github.com')) {
            const parts = url.split('/');
            if (parts.length === 2) return { owner: parts[0], repo: parts[1] };
        }

        // Valid URL parse
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        if (pathParts.length >= 2) {
            return { owner: pathParts[0], repo: pathParts[1] };
        }
        throw new Error('Invalid GitHub URL format');
    } catch (e) {
        throw new Error('Invalid GitHub URL: ' + e.message);
    }
};

exports.getRepoMetadata = async (owner, repo) => {
    try {
        const { data } = await octokit.rest.repos.get({ owner, repo });
        return data;
    } catch (error) {
        throw new Error(`API Error (Metadata): ${error.message}`);
    }
};

exports.getRepoTree = async (owner, repo, branch) => {
    try {
        const { data } = await octokit.rest.git.getTree({
            owner,
            repo,
            tree_sha: branch,
            recursive: 'true',
        });
        return data.tree;
    } catch (error) {
        throw new Error(`API Error (Tree): ${error.message}`);
    }
};

exports.getRecentCommits = async (owner, repo, per_page = 100) => {
    try {
        const { data } = await octokit.rest.repos.listCommits({ owner, repo, per_page });
        return data;
    } catch (error) {
        throw new Error(`API Error (Commits): ${error.message}`);
    }
};

exports.getContributors = async (owner, repo) => {
    try {
        const { data } = await octokit.rest.repos.listContributors({ owner, repo, per_page: 100 });
        return data;
    } catch (error) {
        // Sometimes repos have too many contributors or disabled endpoints
        return [];
    }
};
