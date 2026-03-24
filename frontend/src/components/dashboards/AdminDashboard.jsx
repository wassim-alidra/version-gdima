import { useState, useEffect } from "react";
import api from "../../api/axios";
import { Users, Home, AlertCircle, Bell, TrendingUp, Package, ShoppingCart, CheckCircle } from "lucide-react";
import "../../styles/dashboard.css";

const AdminDashboard = ({ activeTab }) => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [catalog, setCatalog] = useState([]);
    const [notifMessage, setNotifMessage] = useState("");
    const [catalogForm, setCatalogForm] = useState({ name: "", description: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeTab === "dashboard") fetchStats();
        if (activeTab === "users") fetchUsers();
        if (activeTab === "complaints") fetchComplaints();
        if (activeTab === "catalog") fetchCatalog();
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const res = await api.get("market/admin-stats/");
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get("market/users-list/");
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchComplaints = async () => {
        try {
            const res = await api.get("market/complaints/");
            setComplaints(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSendNotification = async (e) => {
        e.preventDefault();
        if (!notifMessage) return;
        setLoading(true);
        try {
            await api.post("market/notifications/send_broadcast/", { message: notifMessage });
            alert("Broadcast sent successfully to all Farmers and Buyers!");
            setNotifMessage("");
        } catch (err) {
            const msg = err.response?.data?.detail || err.response?.data?.message || "Error sending notification. Please try again.";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const fetchCatalog = async () => {
        try {
            const res = await api.get("market/catalog/");
            setCatalog(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddCatalogItem = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("market/catalog/", catalogForm);
            alert("Added to catalog!");
            setCatalogForm({ name: "", description: "" });
            fetchCatalog();
        } catch (err) {
            alert("Error adding to catalog");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCatalogItem = async (id) => {
        if (!window.confirm("Remove this product from the official list?")) return;
        try {
            await api.delete(`market/catalog/${id}/`);
            fetchCatalog();
        } catch (err) {
            alert("Error removing item");
        }
    };

    const handleResolveComplaint = async (id) => {
        try {
            await api.patch(`market/complaints/${id}/`, { is_resolved: true });
            fetchComplaints();
        } catch (err) {
            console.error(err);
        }
    };

    if (activeTab === "dashboard") {
        if (!stats) return <div className="loading-spinner">Loading statistics...</div>;
        
        const metricCards = [
            { label: "Total Users", value: stats.total_users, icon: <Users />, color: "blue" },
            { label: "Revenue (DA)", value: stats.total_revenue, icon: <TrendingUp />, color: "green" },
            { label: "Total Products", value: stats.total_products, icon: <Package />, color: "purple" },
            { label: "Active Orders", value: stats.total_orders, icon: <ShoppingCart />, color: "orange" },
        ];

        return (
            <div className="admin-overview animate-in">
                <div className="stats-grid">
                    {metricCards.map((m, i) => (
                        <div key={i} className={`stat-card stat-${m.color}`}>
                            <div className="stat-icon">{m.icon}</div>
                            <div className="stat-info">
                                <h3>{m.value}</h3>
                                <p>{m.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="dashboard-sections mt-2">
                    <div className="glass-panel">
                        <h3>Actor Distribution</h3>
                        <div className="distribution-list">
                            <div className="dist-item"><span>Farmers:</span> <strong>{stats.farmers_count}</strong></div>
                            <div className="dist-item"><span>Buyers:</span> <strong>{stats.buyers_count}</strong></div>
                            <div className="dist-item"><span>Transporters:</span> <strong>{stats.transporters_count}</strong></div>
                        </div>
                    </div>
                    <div className="glass-panel">
                        <h3>Critical Alerts</h3>
                        <div className="alert-item">
                            <AlertCircle size={20} color="#ef4444" />
                            <span>{stats.pending_complaints} Pending Complaints</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (activeTab === "users") {
        return (
            <div className="glass-panel animate-in">
                <div className="section-header">
                    <h2>Platform Users</h2>
                    <p>Management and overview of all registered actors</p>
                </div>
                <div className="history-table-container">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Role</th>
                                <th>Email</th>
                                <th>Joined Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td><strong>{u.username}</strong></td>
                                    <td><span className={`role-pill role-${u.role.toLowerCase()}`}>{u.role}</span></td>
                                    <td>{u.email}</td>
                                    <td>{new Date(u.date_joined).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (activeTab === "complaints") {
        return (
            <div className="glass-panel animate-in">
                <div className="section-header">
                    <h2>System Complaints</h2>
                    <p>Review issues reported by users</p>
                </div>
                <div className="complaints-feed">
                    {complaints.map(c => (
                        <div key={c.id} className={`complaint-card ${c.is_resolved ? 'resolved' : ''}`}>
                            <div className="complaint-head">
                                <strong>{c.username}</strong>
                                <span className="timestamp">{new Date(c.created_at).toLocaleString()}</span>
                            </div>
                            <h3>{c.subject}</h3>
                            <p>{c.message}</p>
                            {!c.is_resolved && (
                                <button className="btn-success-sm" onClick={() => handleResolveComplaint(c.id)}>Mark as Resolved</button>
                            )}
                        </div>
                    ))}
                    {complaints.length === 0 && <p className="empty-text">No complaints found.</p>}
                </div>
            </div>
        );
    }

    if (activeTab === "catalog") {
        return (
            <div className="glass-panel animate-in">
                <div className="section-header">
                    <h2>Official Product Catalog</h2>
                    <p>Manage the list of products farmers are allowed to sell</p>
                </div>

                <form className="expanded-form mb-2" onSubmit={handleAddCatalogItem}>
                    <div className="grid-form">
                        <div className="form-group span-2">
                            <label>Product Type Name</label>
                            <input 
                                value={catalogForm.name} 
                                onChange={(e) => setCatalogForm({...catalogForm, name: e.target.value})}
                                placeholder="e.g. Red Sweet Tomatoes" 
                                required
                            />
                        </div>
                        <div className="form-group span-2">
                            <label>Official Description (Global)</label>
                            <textarea 
                                value={catalogForm.description}
                                onChange={(e) => setCatalogForm({...catalogForm, description: e.target.value})}
                                placeholder="General description for this product type..." 
                                rows="2"
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn-primary mt-1" disabled={loading}>
                        {loading ? "Adding..." : "Add to Official List"}
                    </button>
                </form>

                <div className="inventory-list mt-2">
                    <h3>Defined Products</h3>
                    <div className="grid-list">
                        {catalog.map(item => (
                            <div key={item.id} className="card-item animate-in">
                                <div className="card-content">
                                    <h3>{item.name}</h3>
                                    <p className="p-desc">{item.description}</p>
                                </div>
                                <button className="btn-danger-outline full-width" onClick={() => handleDeleteCatalogItem(item.id)}>Remove from Catalog</button>
                            </div>
                        ))}
                        {catalog.length === 0 && <p className="empty-text">Catalog is empty.</p>}
                    </div>
                </div>
            </div>
        );
    }

    if (activeTab === "notifications") {
        return (
            <div className="glass-panel animate-in max-600">
                <div className="section-header">
                    <h2>Broadcast Farmer Alerts</h2>
                    <p>Send official notifications to all registered farmers</p>
                </div>
                <form className="admin-form" onSubmit={handleSendNotification}>
                    <div className="form-group">
                        <label>Minister Message</label>
                        <textarea 
                            rows="5" 
                            placeholder="Type your official announcement here..."
                            value={notifMessage}
                            onChange={(e) => setNotifMessage(e.target.value)}
                            required
                        ></textarea>
                    </div>
                    <button type="submit" className="btn-primary-lg" disabled={loading}>
                        {loading ? "Sending..." : "Send Broadcast to Farmers"}
                    </button>
                </form>
            </div>
        );
    }

    return null;
};

export default AdminDashboard;
