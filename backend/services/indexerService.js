const detectTechStack = (rootFiles, tree) => {
    const stack = new Set();
    const allPaths = tree.map(t => t.path.toLowerCase());

    // Package.json / JS Ecosystem
    if (rootFiles.has('package.json')) stack.add('Node.js');
    if (rootFiles.has('package-lock.json') || rootFiles.has('yarn.lock')) stack.add('NPM/Yarn');

    // Python
    if (rootFiles.has('requirements.txt') || rootFiles.has('setup.py') || rootFiles.has('pipfile')) stack.add('Python');
    if (allPaths.some(p => p.includes('manage.py'))) stack.add('Django');

    // React / Next / Vue
    if (allPaths.some(p => p.includes('next.config'))) stack.add('Next.js');
    else if (allPaths.some(p => p.includes('react'))) stack.add('React');
    if (allPaths.some(p => p.includes('vue.config'))) stack.add('Vue.js');

    // TypeScript
    if (rootFiles.has('tsconfig.json') || allPaths.some(p => p.endsWith('.ts') || p.endsWith('.tsx'))) stack.add('TypeScript');

    // DevOps
    if (rootFiles.has('dockerfile') || rootFiles.has('docker-compose.yml')) stack.add('Docker');
    if (allPaths.some(p => p.includes('.github/workflows/'))) stack.add('GitHub Actions');

    // DB
    if (allPaths.some(p => p.includes('prisma'))) stack.add('Prisma');

    // General CSS
    if (allPaths.some(p => p.includes('tailwind.config'))) stack.add('Tailwind CSS');

    return Array.from(stack);
};

const findHotspots = (tree) => {
    // Find top 5 largest files (filtering out package-lock and large known generated files)
    return tree
        .filter(t => t.type === 'blob' && t.size && !t.path.includes('package-lock.json') && !t.path.includes('yarn.lock') && !t.path.includes('.min.js'))
        .sort((a, b) => b.size - a.size)
        .slice(0, 5)
        .map(t => ({
            path: t.path,
            size: t.size
        }));
};

const findSecretLeaks = (tree) => {
    const leaks = [];
    const patterns = [
        { regex: /\.env(\..*)?$/, risk: 'High', name: 'Environment File' },
        { regex: /\.pem$/, risk: 'Critical', name: 'Private Key (.pem)' },
        { regex: /id_rsa$/, risk: 'Critical', name: 'Private Key (id_rsa)' },
        { regex: /credentials\.json$/, risk: 'High', name: 'Credentials File' },
        { regex: /\.aws\/credentials/, risk: 'Critical', name: 'AWS Credentials' }
    ];

    tree.forEach(t => {
        if (t.type === 'blob') {
            const lowerPath = t.path.toLowerCase();
            // Only flag actual .env files, not .env.example
            if (lowerPath.includes('.env.example') || lowerPath.includes('.env.sample')) return;

            for (const pattern of patterns) {
                if (pattern.regex.test(lowerPath)) {
                    leaks.push({
                        path: t.path,
                        riskLevel: pattern.risk,
                        type: pattern.name
                    });
                    break; // Avoid double matching
                }
            }
        }
    });

    return leaks;
};

exports.summarizeStructure = (tree) => {
    let summary = 'Repository Structure Summary: ';

    const folders = new Set();
    const rootFiles = new Set();

    tree.forEach(item => {
        if (item.type === 'tree') {
            folders.add(item.path);
        } else {
            rootFiles.add(item.path.split('/').pop()); // Add filename for root checks
        }
    });

    const hasServer = folders.has('server') || folders.has('backend') || folders.has('api');
    const hasClient = folders.has('client') || folders.has('frontend') || folders.has('ui');
    const hasRoutes = folders.has('routes') || folders.has('src/routes');
    const hasModels = folders.has('models') || folders.has('src/models');
    const hasComponents = folders.has('components') || folders.has('src/components');

    if (hasServer && hasClient) {
        summary += 'This appears to be a full-stack project with explicit client and server separation. ';
    } else if (hasComponents && !hasServer && !hasRoutes) {
        summary += 'This appears to be primarily a frontend client application. ';
    } else if ((hasRoutes || hasModels) && !hasClient && !hasComponents) {
        summary += 'This appears to be primarily a backend API application. ';
    } else {
        summary += 'This project uses a flat or custom directory structure. ';
    }

    return {
        summary: summary.trim(),
        techStack: detectTechStack(rootFiles, tree),
        hotspots: findHotspots(tree),
        secrets: findSecretLeaks(tree)
    };
};
