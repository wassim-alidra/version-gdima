import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Package, ShoppingBag, Clock, CheckCircle, DollarSign, Plus, Truck, AlertCircle, FileText } from "lucide-react";
import "../../styles/dashboard.css";

const FarmerDashboard = ({ activeTab }) => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({
        total_products: 0,
        total_quantity: 0,
        total_orders: 0,
        pending_orders: 0,
        completed_orders: 0,
        total_revenue: 0
    });
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price_per_kg: "",
        quantity_available: "",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProducts();
        fetchOrders();
        fetchStats();
    }, [activeTab]);

    const fetchProducts = async () => {
        try {
            const res = await api.get("market/products/");
            setProducts(res.data);
        } catch (err) {
            console.error("Error fetching products:", err);
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await api.get("market/orders/");
            setOrders(res.data);
        } catch (err) {
            console.error("Error fetching orders:", err);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await api.get("market/products/stats/");
            setStats(res.data);
        } catch (err) {
            console.error("Error fetching stats:", err);
        }
    };

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.name || !formData.price_per_kg || !formData.quantity_available || !formData.description) {
            alert("Please fill all fields, including description.");
            setLoading(false);
            return;
        }

        try {
            await api.post("market/products/", {
                name: formData.name,
                description: formData.description,
                price_per_kg: parseFloat(formData.price_per_kg),
                quantity_available: parseFloat(formData.quantity_available),
            });

            setFormData({
                name: "",
                description: "",
                price_per_kg: "",
                quantity_available: "",
            });

            fetchProducts();
            fetchStats();
            alert("Product added successfully.");
        } catch (err) {
            console.error("Error adding product:", err);
            alert("Failed to add product: " + (err.response?.data?.description || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        const ok = window.confirm("Are you sure you want to delete this product?");
        if (!ok) return;

        try {
            await api.delete(`market/products/${id}/`);
            fetchProducts();
            fetchStats();
        } catch (err) {
            console.error("Error deleting product:", err);
            alert("Failed to delete product.");
        }
    };

    const handleUpdateOrderStatus = async (id, status) => {
        try {
            await api.patch(`market/orders/${id}/`, { status });
            fetchOrders();
            fetchStats();
        } catch (err) {
            console.error("Error updating order:", err);
            alert("Failed to update order status.");
        }
    };

    if (activeTab === "dashboard") {
        const statCards = [
            { label: "Products", value: stats.total_products, icon: <Package />, color: "blue" },
            { label: "Active Orders", value: stats.pending_orders, icon: <ShoppingBag />, color: "yellow" },
            { label: "Completed", value: stats.completed_orders, icon: <CheckCircle />, color: "green" },
            { label: "Revenue", value: `${stats.total_revenue} DA`, icon: <DollarSign />, color: "purple" }
        ];

        return (
            <div className="farmer-dashboard-home animate-in">
                <div className="stats-grid">
                    {statCards.map((s, i) => (
                        <div key={i} className={`stat-card stat-${s.color}`}>
                            <div className="stat-icon">{s.icon}</div>
                            <div className="stat-info">
                                <h3>{s.value}</h3>
                                <p>{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="dashboard-sections">
                    <div className="glass-panel">
                        <div className="panel-header">
                            <h3>Quick Add Product</h3>
                            <Plus size={20} color="#6b7280" />
                        </div>
                        <form className="mini-form" onSubmit={handleAddProduct}>
                            <input name="name" value={formData.name} onChange={handleChange} placeholder="Product Name" />
                            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe your product..." rows="2" />
                            <div className="form-row">
                                <input type="number" name="price_per_kg" value={formData.price_per_kg} onChange={handleChange} placeholder="Price /kg" />
                                <input type="number" name="quantity_available" value={formData.quantity_available} onChange={handleChange} placeholder="Qty kg" />
                            </div>
                            <button type="submit" className="btn-primary" disabled={loading}>{loading ? "Adding..." : "Add Product"}</button>
                        </form>
                    </div>

                    <div className="glass-panel">
                        <div className="panel-header">
                            <h3>Pending Sales</h3>
                            <Clock size={20} color="#f59e0b" />
                        </div>
                        <div className="mini-list">
                            {orders.filter(o => o.status === 'PENDING').slice(0, 3).map(o => (
                                <div key={o.id} className="mini-item">
                                    <div className="item-main">
                                        <strong>{o.product_name}</strong>
                                        <span>{o.quantity}kg • {o.total_price} DA</span>
                                    </div>
                                    <div className="flex-gap-sm">
                                        <button className="btn-sm" onClick={() => handleUpdateOrderStatus(o.id, 'ACCEPTED')}>Accept</button>
                                        <button className="btn-sm btn-outline" onClick={() => handleUpdateOrderStatus(o.id, 'CANCELLED')}>Reject</button>
                                    </div>
                                </div>
                            ))}
                            {orders.filter(o => o.status === 'PENDING').length === 0 && <p className="empty-text">No pending orders.</p>}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (activeTab === "products") {
        return (
            <div className="glass-panel animate-in">
                <div className="section-header">
                    <h2>Manage My Products</h2>
                    <p>Add new products or update existing inventory</p>
                </div>

                <form className="expanded-form" onSubmit={handleAddProduct}>
                    <div className="grid-form">
                        <div className="form-group span-2">
                            <label>Product Name</label>
                            <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Fresh Red Tomatoes" />
                        </div>
                        <div className="form-group span-2">
                            <label>Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Tell buyers about your harvest..." rows="3" />
                        </div>
                        <div className="form-group">
                            <label>Price per Kg (DA)</label>
                            <input type="number" name="price_per_kg" value={formData.price_per_kg} onChange={handleChange} placeholder="0.00" />
                        </div>
                        <div className="form-group">
                            <label>Available Quantity (kg)</label>
                            <input type="number" name="quantity_available" value={formData.quantity_available} onChange={handleChange} placeholder="0" />
                        </div>
                    </div>
                    <button type="submit" className="btn-primary mt-1" disabled={loading}>{loading ? "Publishing..." : "Add Product to Market"}</button>
                </form>

                <div className="inventory-list mt-2">
                    <h3>Current Inventory</h3>
                    <div className="grid-list">
                        {products.map(p => (
                            <div key={p.id} className="card-item animate-in">
                                <div className="card-content">
                                    <h3>{p.name}</h3>
                                    <p className="p-desc">{p.description}</p>
                                    <div className="product-meta">
                                        <strong>{p.price_per_kg} DA/kg</strong>
                                        <span>{p.quantity_available}kg left</span>
                                    </div>
                                </div>
                                <button className="btn-danger-outline full-width" onClick={() => handleDeleteProduct(p.id)}>Remove Product</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (activeTab === "orders") {
        return (
            <div className="glass-panel animate-in">
                <div className="section-header">
                    <h2>Orders & Sales</h2>
                    <p>Track incoming buyer requests</p>
                </div>
                <div className="history-table-container">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Total Price</th>
                                <th>Customer</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(o => (
                                <tr key={o.id}>
                                    <td>#{o.id}</td>
                                    <td>{o.product_name}</td>
                                    <td>{o.quantity}kg</td>
                                    <td>{o.total_price} DA</td>
                                    <td>{o.buyer_name}</td>
                                    <td><span className={`status-badge ${o.status.toLowerCase()}`}>{o.status}</span></td>
                                    <td>
                                        {o.status === 'PENDING' && (
                                            <div className="flex-gap-sm">
                                                <button className="btn-success-sm" onClick={() => handleUpdateOrderStatus(o.id, 'ACCEPTED')}>Accept</button>
                                                <button className="btn-danger-sm" onClick={() => handleUpdateOrderStatus(o.id, 'CANCELLED')}>Reject</button>
                                            </div>
                                        )}
                                        {o.status === 'ACCEPTED' && <span className="text-muted">Wait for Transporter</span>}
                                        {o.status === 'DELIVERED' && <CheckCircle size={16} color="#059669" />}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {orders.length === 0 && <p className="empty-state">No orders yet.</p>}
                </div>
            </div>
        );
    }

    if (activeTab === "tracking") {
        const activeTracking = orders.filter(o => ['ACCEPTED', 'IN_TRANSIT'].includes(o.status));
        return (
            <div className="glass-panel animate-in">
                <div className="section-header">
                    <h2>Delivery Tracking</h2>
                    <p>Monitor your products en route to buyers</p>
                </div>
                <div className="grid-list">
                    {activeTracking.map(o => (
                        <div key={o.id} className="card-item tracking-card">
                            <div className="card-header">
                                <h3>Order #{o.id}</h3>
                                <span className={`status-badge ${o.status.toLowerCase()}`}>{o.status}</span>
                            </div>
                            <div className="tracking-info">
                                <div className="info-row">
                                    <Truck size={18} />
                                    <span>Transporter: {o.transporter_name || "Assigning..."}</span>
                                </div>
                                <div className="info-row">
                                    <Clock size={18} />
                                    <span>Delivery Status: {o.delivery_status || "Pending Pickup"}</span>
                                </div>
                            </div>
                            <div className="progress-track-container">
                                <div className="track-step active">Accepted</div>
                                <div className={`track-line ${o.status === 'IN_TRANSIT' || o.status === 'DELIVERED' ? 'active' : ''}`}></div>
                                <div className={`track-step ${o.status === 'IN_TRANSIT' || o.status === 'DELIVERED' ? 'active' : ''}`}>In Transit</div>
                                <div className={`track-line ${o.status === 'DELIVERED' ? 'active' : ''}`}></div>
                                <div className={`track-step ${o.status === 'DELIVERED' ? 'active' : ''}`}>Delivered</div>
                            </div>
                        </div>
                    ))}
                    {activeTracking.length === 0 && <p className="empty-state">No active deliveries to track.</p>}
                </div>
            </div>
        );
    }

    if (activeTab === "prices") {
        return (
            <div className="glass-panel animate-in">
                <div className="section-header">
                    <h2><FileText size={24} /> Official Market Prices</h2>
                    <p>Reference prices set by the Ministry of Agriculture</p>
                </div>
                <div className="price-list-placeholder">
                    <p className="notice-box">
                        <AlertCircle size={20} />
                        Official price lists will be updated once the Ministry administrator publishes them.
                    </p>
                    <table className="price-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Average Price</th>
                                <th>Max Allowed</th>
                                <th>Trend</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Vegetables</td>
                                <td>-- DA/kg</td>
                                <td>-- DA/kg</td>
                                <td>Stable</td>
                            </tr>
                            <tr>
                                <td>Fruits</td>
                                <td>-- DA/kg</td>
                                <td>-- DA/kg</td>
                                <td>Rising</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (activeTab === "complaints") {
        return (
            <div className="glass-panel animate-in max-600">
                <div className="section-header">
                    <h2>Submit a Complaint</h2>
                    <p>Report issues with buyers, transporters, or payments</p>
                </div>
                <form className="complaint-form" onSubmit={(e) => { e.preventDefault(); alert("Complaint submitted to Ministry."); }}>
                    <div className="form-group">
                        <label>Issue Type</label>
                        <select>
                            <option>Payment Issue</option>
                            <option>Transporter Delay</option>
                            <option>Product Refusal</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea placeholder="Describe the problem in detail..." rows="5"></textarea>
                    </div>
                    <div className="form-group">
                        <label>Related Order ID (Optional)</label>
                        <input type="text" placeholder="e.g. #123" />
                    </div>
                    <button type="submit" className="btn-danger">Submit Complaint</button>
                </form>
            </div>
        );
    }

    return null;
};

export default FarmerDashboard;