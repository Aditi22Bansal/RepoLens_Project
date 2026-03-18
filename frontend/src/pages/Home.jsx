import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Star, Clock, FolderTree, Cpu, History } from 'lucide-react';
import axios from 'axios';

const Home = () => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/repo/history');
                setHistory(res.data.data);
            } catch (err) {
                console.error("Failed to fetch history:", err);
            } finally {
                setLoadingHistory(false);
            }
        };
        fetchHistory();
    }, []);

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setError(null);
        try {
            const API_BASE = 'http://localhost:5000/api/repo';
            const res = await axios.post(`${API_BASE}/analyze`, { url });
            const repoData = res.data.data;
            navigate(`/repo/${repoData.owner}/${repoData.name}`, { state: { repoData } });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to analyze repository. Please check the URL.');
        } finally {
            setLoading(false);
        }
    };

    const handleHistoryClick = (repo) => {
        navigate(`/repo/${repo.owner}/${repo.name}`);
    };

    return (
        <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4rem' }}>

            {/* Hero Section */}
            <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ marginBottom: '1rem', fontSize: '2.5rem', background: 'linear-gradient(90deg, #2f81f7, #a371f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    GitHub Project Health Analyzer
                </h1>
                <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
                    Evaluate project health, explore codebase architecture, identify tech stacks and security hotspots, and use an Intelligent Agent to search the codebase.
                </p>

                <form onSubmit={handleAnalyze} style={{ display: 'flex', gap: '1rem', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
                        <Search size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Paste GitHub URL (e.g., https://github.com/facebook/react)"
                            style={{ paddingLeft: '3rem', fontSize: '1.2rem', padding: '1rem 1rem 1rem 3rem', borderRadius: '30px' }}
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    {error && <div style={{ color: 'var(--danger-color)', fontSize: '0.9rem' }}>{error}</div>}

                    <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem', borderRadius: '30px', marginTop: '1rem' }} disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="spinner" size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                <span>Scanning Repository Architecture...</span>
                            </>
                        ) : (
                            'Analyze Project'
                        )}
                    </button>
                </form>
            </div>

            {/* History Hub */}
            <div style={{ width: '100%', maxWidth: '1000px' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem' }}>
                    <History color="var(--accent-color)" /> Recently Analyzed Repositories
                </h2>

                {loadingHistory ? (
                    <div className="flex-center" style={{ padding: '2rem' }}>
                        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-secondary)' }} />
                    </div>
                ) : history.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No repositories analyzed yet.</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {history.map(repo => (
                            <div
                                key={repo._id}
                                className="glass-panel"
                                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}
                                onClick={() => handleHistoryClick(repo)}
                            >
                                <div className="flex-between">
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FolderTree size={16} /> {repo.owner}/{repo.name}
                                    </h3>
                                    <div className="flex-center" style={{ gap: '4px', fontSize: '0.85rem' }}>
                                        <Star size={14} color="var(--warning-color)" /> {repo.stars}
                                    </div>
                                </div>

                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {repo.description || 'No description provided.'}
                                </p>

                                <div className="flex-between" style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--panel-border)' }}>
                                    <div className="flex-center" style={{ gap: '0.4rem', fontSize: '0.85rem' }}>
                                        <Cpu size={14} color="var(--accent-color)" />
                                        {repo.techStack && repo.techStack.length > 0 ? repo.techStack[0] : (repo.language || 'Unknown')}
                                    </div>
                                    <div className="flex-center" style={{ gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        <Clock size={14} />
                                        {new Date(repo.lastAnalyzed).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default Home;
