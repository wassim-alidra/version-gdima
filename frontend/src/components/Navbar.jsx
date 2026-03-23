import { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    let { user, logoutUser } = useContext(AuthContext);

    return (
        <nav className="glass-panel" style={{ margin: 0, borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link to="/" style={{ fontSize: '1.25rem', fontWeight: 'bold', background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AgriGov Market</Link>
                {user && <Link to="/dashboard">Dashboard</Link>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {user ? (
                    <>
                        <span>Hello, {user.username} <span style={{ opacity: 0.7, fontSize: '0.9em' }}>({user.role})</span></span>
                        <button onClick={logoutUser} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register" style={{ background: 'var(--primary-color)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
