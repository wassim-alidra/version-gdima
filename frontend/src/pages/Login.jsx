import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Login = () => {
    let { loginUser } = useContext(AuthContext);

    return (
        <div className="auth-container">
            <div className="glass-panel">
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Welcome Back</h2>
                <form onSubmit={loginUser}>
                    <input type="text" name="username" placeholder="Username" required />
                    <input type="password" name="password" placeholder="Password" required />
                    <button type="submit" style={{ width: '100%', marginTop: '1rem' }}>Sign In</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
