// Helper to get week string (e.g. YYYY-MM-DD or Week N, YYYY)
const getWeekString = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay()); // Set to Sunday
    return d.toISOString().split('T')[0];
};

exports.calculateHealth = (metadata, commits, contributors, tree) => {
    let maintenance = 50;
    let collaboration = 50;
    let documentation = 50;
    let deployment = 50;

    const strengths = [];
    const risks = [];
    const recommendations = [];

    // Maintenance & Commit Activity (Time Series)
    const activityMap = new Map();
    if (commits && commits.length > 0) {
        const latestCommitDate = new Date(commits[0].commit.author.date);
        const daysSinceLastCommit = (new Date() - latestCommitDate) / (1000 * 60 * 60 * 24);
        if (daysSinceLastCommit < 14) {
            maintenance += 40;
            strengths.push('Repository is actively maintained with recent commits in the last 14 days.');
        } else if (daysSinceLastCommit < 60) {
            maintenance += 20;
        } else {
            maintenance -= 20;
            risks.push('Project has not been updated recently.');
        }

        // Build timeline from past 50 commits
        commits.forEach(c => {
            const week = getWeekString(c.commit.author.date);
            activityMap.set(week, (activityMap.get(week) || 0) + 1);
        });
    }

    const commitActivity = Array.from(activityMap.entries())
        .map(([week, count]) => ({ week, count }))
        .sort((a, b) => new Date(a.week) - new Date(b.week));

    // Collaboration Score (based on contributors & issues)
    const numContributors = contributors ? contributors.length : 0;
    if (numContributors > 5) {
        collaboration += 30;
        strengths.push('Project has strong contributor diversity.');
    } else if (numContributors > 1) {
        collaboration += 10;
    } else {
        collaboration -= 10;
        risks.push('Project relies mostly on a single contributor.');
    }

    if (metadata.open_issues_count > 50) {
        collaboration -= 10;
        recommendations.push('Issue backlog is high. Consider dedicating time to resolve open issues.');
    }

    // Documentation & Contribution Readiness Score
    let contributionReadiness = 0;
    const lowerPaths = tree.map(t => t.path.toLowerCase());

    const hasReadme = lowerPaths.some(p => p.includes('readme.md'));
    const hasLicense = Boolean(metadata.license);
    const hasDocs = lowerPaths.some(p => p.startsWith('docs/'));
    const hasContributing = lowerPaths.some(p => p.includes('contributing.md'));
    const hasCodeOfConduct = lowerPaths.some(p => p.includes('code_of_conduct.md'));
    const hasIssueTemplate = lowerPaths.some(p => p.includes('.github/issue_template'));

    if (hasReadme) { documentation += 20; contributionReadiness += 30; }
    else { risks.push('No README found. Documentation is critical for onboarding.'); }

    if (hasLicense) { documentation += 20; contributionReadiness += 20; }
    else { recommendations.push('Add a license to clarify usage rights.'); }

    if (hasDocs) documentation += 10;
    if (hasContributing) contributionReadiness += 25;
    if (hasCodeOfConduct) contributionReadiness += 15;
    if (hasIssueTemplate) contributionReadiness += 10;

    if (contributionReadiness >= 80) strengths.push('Excellent open-source readiness. Easy for new developers to contribute.');
    if (contributionReadiness < 50) recommendations.push('Consider adding a CONTRIBUTING.md or CODE_OF_CONDUCT.md to improve open-source onboarding.');

    // Deployment Score
    const hasDocker = lowerPaths.some(p => p === 'dockerfile' || p === 'docker-compose.yml');
    const hasCiCd = lowerPaths.some(p => p.startsWith('.github/workflows/'));

    if (hasDocker) {
        deployment += 25;
        strengths.push('Docker configuration detected, indicating deployment readiness.');
    }
    if (hasCiCd) {
        deployment += 25;
        strengths.push('CI/CD workflows detected.');
    }
    if (!hasDocker && !hasCiCd) {
        recommendations.push('Consider adding CI/CD pipelines or containerization for better deployment practices.');
    }

    // Cap at 100, normalize below 0
    const clamp = (val) => Math.min(100, Math.max(0, val));
    maintenance = clamp(maintenance);
    collaboration = clamp(collaboration);
    documentation = clamp(documentation);
    deployment = clamp(deployment);

    const overall = Math.round((maintenance + collaboration + documentation + deployment) / 4);

    return {
        scores: { overall, maintenance, collaboration, documentation, deployment },
        insights: { strengths, risks, recommendations },
        contributionReadiness,
        commitActivity
    };
};
