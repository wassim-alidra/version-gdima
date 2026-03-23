import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Fix import
import api from '../api/axios';

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
    let [user, setUser] = useState(null);
    let [authTokens, setAuthTokens] = useState(null);
    let [loading, setLoading] = useState(true);

    const loginUser = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('token/', {
                username: e.target.username.value,
                password: e.target.password.value
            });
            if (response.status === 200) {
                setAuthTokens(response.data);
                setUser(jwtDecode(response.data.access)); // assuming payload has role
                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);
                // Fetch full user details validation
                fetchUserProfile();
                window.location.href = '/dashboard';

            }
        } catch (error) {
            alert('Something went wrong!');
        }
    }

    const fetchUserProfile = async () => {
        try {
            const response = await api.get('users/me/');
            setUser({ ...jwtDecode(localStorage.getItem('access_token')), ...response.data });
            // Merge decoded token data with profile data
        } catch (error) {
            console.error(error);
        }
    }

    const logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
    }

    const registerUser = async (formData) => {
        try {
            await api.post('users/register/', formData);
            alert('Registration successful! Please login.');
            window.location.href = '/login';
        } catch (error) {
            console.error(error);
            alert('Registration failed');
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                setAuthTokens({ access: token, refresh: localStorage.getItem('refresh_token') });
                const decoded = jwtDecode(token);
                setUser(decoded);
                fetchUserProfile(); // Get role and profile
            } catch (e) {
                logoutUser();
            }
        }
        setLoading(false);
    }, [])

    let contextData = {
        user: user,
        authTokens: authTokens,
        loginUser: loginUser,
        logoutUser: logoutUser,
        registerUser: registerUser,
    }

    return (
        <AuthContext.Provider value={contextData}>
            {loading ? <p>Loading...</p> : children}
        </AuthContext.Provider>
    )
}
