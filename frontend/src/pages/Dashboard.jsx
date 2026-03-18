import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, FolderTree, Star, GitFork, Activity, Shield, Code, Loader2, BotMessageSquare, AlertTriangle, Cpu, Weight, Users } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
    const { state } = useLocation();
    const { owner, name } = useParams();
    const [repoData, setRepoData] = useState(state?.repoData || null);
    const [loading, setLoading] = useState(!state?.repoData);
    const [error, setError] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [directAnswer, setDirectAnswer] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (!repoData) {
            const fetchRepo = async () => {
                try {
                    const res = await axios.post('http://localhost:5000/api/repo/analyze', { url: `https://github.com/${owner}/${name}` });
                    setRepoData(res.data.data);
                } catch (err) {
                    setError('Failed to fetch repository metadata.');
                } finally {
                    setLoading(false);
                }
            };
            fetchRepo();
        }
    }, [repoData, owner, name]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery || !repoData?._id) return;

        setIsSearching(true);
        setDirectAnswer(null);
        try {
            const res = await axios.post(`http://localhost:5000/api/repo/${repoData._id}/search`, { query: searchQuery });
            setSearchResults(res.data.data.results || []);
            setDirectAnswer(res.data.data.answer || null);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    if (loading) {
        return (
            <div className="container flex-center animate-fade-in" style={{ minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
                <Loader2 className="spinner" size={64} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-color)' }} />
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Analyzing Code Architecture & History...</p>
            </div>
        );
    }

    if (error || !repoData) {
        return <div className="container" style={{ color: 'var(--danger-color)' }}>{error || 'Not found'}</div>;
    }

    const { healthScore, healthInsights, structureSummary, techStack, secretLeaks, monolithHotspots, contributionReadiness, commitActivity } = repoData;

    const renderScoreBar = (label, score, colorOverride) => {
        let color = colorOverride || 'var(--danger-color)';
        if (!colorOverride && score > 40) color = 'var(--warning-color)';
        if (!colorOverride && score >= 70) color = 'var(--success-color)';

        return (
            <div style={{ marginBottom: '1rem' }} key={label}>
                <div className="flex-between" style={{ marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                    <span>{label}</span>
                    <span style={{ fontWeight: 600 }}>{score}/100</span>
                </div>
                <div style={{ height: '8px', background: 'var(--panel-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${score}%`, backgroundColor: color, borderRadius: '4px', transition: 'width 1s ease-out' }}></div>
                </div>
            </div>
        );
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    };

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem 1rem' }}>

            {/* Header Panel */}
            <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <FolderTree color="var(--accent-color)" /> {repoData.owner} / {repoData.name}
                    </h1>
                    <p style={{ margin: 0 }}>{repoData.description || 'No description provided.'}</p>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div className="flex-center" style={{ gap: '0.5rem', color: 'var(--text-secondary)' }}><Star size={18} /> {repoData.stars}</div>
                    <div className="flex-center" style={{ gap: '0.5rem', color: 'var(--text-secondary)' }}><GitFork size={18} /> {repoData.forks}</div>
                    <div className="flex-center" style={{ gap: '0.5rem', color: 'var(--text-secondary)' }}><Activity size={18} /> {repoData.openIssues} Issues</div>
                </div>
            </div>

            {/* Advanced Features Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Tech Stack Extractor */}
                <div className="glass-panel">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.1rem' }}>
                        <Cpu size={18} color="var(--accent-color)" /> Tech Stack Detected
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {techStack && techStack.length > 0 ? techStack.map(tech => (
                            <span key={tech} style={{ padding: '0.3rem 0.8rem', background: 'rgba(47, 129, 247, 0.1)', color: 'var(--accent-color)', border: '1px solid rgba(47, 129, 247, 0.4)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 500 }}>
                                {tech}
                            </span>
                        )) : <span style={{ color: 'var(--text-secondary)' }}>Language: {repoData.language}</span>}
                    </div>
                </div>

                {/* Contribution Readiness Grade */}
                <div className="glass-panel">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.1rem' }}>
                        <Users size={18} color="#a371f7" /> OSS Contribution Readiness
                    </h3>
                    {renderScoreBar('Readiness Grade', contributionReadiness || 0, '#a371f7')}
                </div>

                {/* Security Scan */}
                <div className="glass-panel" style={{ borderColor: secretLeaks && secretLeaks.length > 0 ? 'rgba(248, 81, 73, 0.5)' : 'var(--glass-border)' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.1rem', color: secretLeaks && secretLeaks.length > 0 ? 'var(--danger-color)' : 'inherit' }}>
                        <AlertTriangle size={18} color={secretLeaks && secretLeaks.length > 0 ? 'var(--danger-color)' : 'var(--success-color)'} />
                        Security Scan
                    </h3>
                    {secretLeaks && secretLeaks.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {secretLeaks.slice(0, 3).map((leak, i) => (
                                <div key={i} style={{ fontSize: '0.85rem', background: 'rgba(248, 81, 73, 0.1)', padding: '0.4rem', borderRadius: '4px', borderLeft: '3px solid var(--danger-color)' }}>
                                    <strong>{leak.type}:</strong> {leak.path.split('/').pop()}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--success-color)', margin: 0, fontSize: '0.9rem' }}>No exposed generic secrets patterns detected in tree.</p>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem', marginBottom: '2rem' }}>

                {/* Core Health Matrix & Commit Chart */}
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="flex-between" style={{ marginBottom: '1rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                            <Shield color="var(--success-color)" /> Project Health Score
                        </h3>
                        <h2 style={{ margin: 0, color: healthScore.overall > 70 ? 'var(--success-color)' : 'var(--warning-color)' }}>
                            {healthScore.overall}/100
                        </h2>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        {renderScoreBar('Maintenance', healthScore.maintenance)}
                        {renderScoreBar('Collaboration', healthScore.collaboration)}
                        {renderScoreBar('Documentation', healthScore.documentation)}
                        {renderScoreBar('Deployment', healthScore.deployment)}
                    </div>

                    <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Commit Activity (Past Weeks)</h4>
                    <div style={{ height: '120px', width: '100%', marginTop: 'auto' }}>
                        {commitActivity && commitActivity.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={commitActivity}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--success-color)" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="var(--success-color)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }} />
                                    <Area type="monotone" dataKey="count" stroke="var(--success-color)" fillOpacity={1} fill="url(#colorCount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>No recent commits found.</div>}
                    </div>
                </div>

                {/* Structure Explorer & Insights & Hotspots */}
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Code color="var(--accent-color)" /> Architecture Summary</h3>
                        <p style={{ marginTop: '0.5rem', lineHeight: '1.6', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                            {structureSummary}
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>AI Recommendations</h4>
                            <ul style={{ paddingLeft: '1.2rem', margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                {healthInsights.risks.map((risk, i) => <li key={`risk-${i}`} style={{ marginBottom: '0.5rem', color: 'var(--warning-color)' }}>{risk}</li>)}
                                {healthInsights.recommendations.map((rec, i) => <li key={`rec-${i}`} style={{ marginBottom: '0.5rem' }}>{rec}</li>)}
                                {healthInsights.strengths.slice(0, 2).map((str, i) => <li key={`str-${i}`} style={{ marginBottom: '0.5rem', color: 'var(--success-color)' }}>{str}</li>)}
                            </ul>
                        </div>

                        <div>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                                <Weight size={16} color="var(--accent-color)" /> Code Hotspots
                            </h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Largest files requiring potential refactoring.</p>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {monolithHotspots && monolithHotspots.map((file, i) => (
                                    <li key={i} className="flex-between" style={{ fontSize: '0.85rem', marginBottom: '0.4rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.2rem' }}>
                                        <span style={{ fontFamily: 'monospace', color: 'var(--accent-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }} title={file.path}>{file.path.split('/').pop()}</span>
                                        <span style={{ color: 'var(--text-secondary)' }}>{formatSize(file.size)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Intelligent Search Assistant */}
            <div className="glass-panel">
                <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                        <BotMessageSquare color="var(--accent-color)" /> Intelligent Codebase Search
                    </h2>
                    <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                        Our agent detected intent and path architecture. Ask natural language questions to find specific logic.
                    </p>
                </div>

                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="e.g., Where is the Docker deployment config?"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary" disabled={isSearching} style={{ whiteSpace: 'nowrap' }}>
                        {isSearching ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Ask Assistant'}
                    </button>
                </form>

                {/* Search Results */}
                {directAnswer && (
                    <div className="animate-fade-in" style={{ background: 'rgba(47, 129, 247, 0.1)', border: '1px solid var(--accent-color)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1rem' }}>
                        <p style={{ margin: 0, display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
                            <BotMessageSquare color="var(--accent-color)" style={{ marginTop: '2px', flexShrink: 0 }} />
                            <span style={{ fontSize: '1.05rem', lineHeight: '1.5' }}>{directAnswer}</span>
                        </p>
                    </div>
                )}
                {searchResults.length > 0 && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {searchResults.map((result, idx) => (
                            <div key={idx} style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                                <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                                    <span style={{ fontFamily: 'monospace', color: 'var(--accent-color)', fontWeight: 600 }}>{result.file}</span>
                                    <span style={{ fontSize: '0.85rem', background: 'rgba(35, 134, 54, 0.2)', color: 'var(--success-color)', padding: '2px 8px', borderRadius: '12px' }}>
                                        {result.confidence} Confidence
                                    </span>
                                </div>
                                <p style={{ margin: '0.5rem 0', fontWeight: '500' }}>{result.likelyRole}</p>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    <strong>Matching Logic:</strong> {result.reason}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!isSearching && searchResults.length === 0 && !directAnswer && searchQuery && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                        No relevant files or answers found. Try refining your query.
                    </div>
                )}
            </div>

        </div>
    );
};

export default Dashboard;
