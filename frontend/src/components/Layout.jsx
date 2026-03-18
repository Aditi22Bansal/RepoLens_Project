import React from 'react';
import { Github } from 'lucide-react';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
    return (
        <>
            <header style={{ borderBottom: '1px solid var(--panel-border)', background: 'var(--panel-bg)' }}>
                <div className="container flex-between" style={{ padding: '1rem 2rem' }}>
                    <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }} className="flex-center">
                        <Github size={28} color="var(--accent-color)" style={{ marginRight: '10px' }} />
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>GitHub Project Health Analyzer</h2>
                    </Link>
                    <nav>
                        <a href="https://github.com" target="_blank" rel="noreferrer" className="btn">
                            View on GitHub
                        </a>
                    </nav>
                </div>
            </header>

            <main style={{ flex: 1 }}>
                {children}
            </main>

            <footer style={{ borderTop: '1px solid var(--panel-border)', padding: '2rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p>&copy; {new Date().getFullYear()} Intelligent Repository Search Assistant & Health Analyzer</p>
            </footer>
        </>
    );
};

export default Layout;
