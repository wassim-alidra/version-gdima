import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        role: 'FARMER',
        farm_name: '',
        location: '',
        company_name: '',
        vehicle_type: '',
        license_plate: '',
        capacity: 0
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('users/register/', formData);
            alert('Registration successful! Please login.');
            navigate('/login');
        } catch (error) {
            console.error(error);
            if (error.response && error.response.data) {
                const errorData = error.response.data;
                const errorMessages = Object.keys(errorData).map(key => `${key}: ${errorData[key]}`).join('\n');
                alert(`Registration failed:\n${errorMessages}`);
            } else {
                alert('Registration failed. Check console for details.');
            }
        }
    };

    return (
        <div className="auth-container" style={{ maxWidth: '500px' }}>
            <div className="glass-panel">
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Create Account</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
                        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                    </div>
                    <input type="email" name="email" placeholder="Email" onChange={handleChange} required />

                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Select Role</label>
                    <select name="role" onChange={handleChange} value={formData.role}>
                        <option value="FARMER">Farmer</option>
                        <option value="BUYER">Buyer</option>
                        <option value="TRANSPORTER">Transporter</option>
                    </select>

                    {formData.role === 'FARMER' && (
                        <div className="role-fields fade-in">
                            <input type="text" name="farm_name" placeholder="Farm Name" onChange={handleChange} />
                            <input type="text" name="location" placeholder="Location" onChange={handleChange} />
                        </div>
                    )}

                    {formData.role === 'BUYER' && (
                        <div className="role-fields fade-in">
                            <input type="text" name="company_name" placeholder="Company Name" onChange={handleChange} />
                        </div>
                    )}

                    {formData.role === 'TRANSPORTER' && (
                        <div className="role-fields fade-in">
                            <input type="text" name="vehicle_type" placeholder="Vehicle Type" onChange={handleChange} />
                            <input type="text" name="license_plate" placeholder="License Plate" onChange={handleChange} />
                            <input type="number" name="capacity" placeholder="Capacity (tons)" onChange={handleChange} />
                        </div>
                    )}

                    <button type="submit" style={{ width: '100%', marginTop: '1rem' }}>Register</button>
                </form>
            </div>
        </div>
    );
};

export default Register;
