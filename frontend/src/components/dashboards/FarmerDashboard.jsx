import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Package, ShoppingBag, Clock, CheckCircle } from "lucide-react";
import "../../styles/dashboard.css";

const FarmerDashboard = ({ activeTab }) => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        price_per_kg: "",
        quantity_available: "",
    });

    useEffect(() => {
        fetchProducts();
        fetchOrders();
    }, []);

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

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.price_per_kg || !formData.quantity_available) {
            alert("Please fill all fields.");
            return;
        }

        try {
            await api.post("market/products/", {
                name: formData.name,
                price_per_kg: parseFloat(formData.price_per_kg),
                quantity_available: parseFloat(formData.quantity_available),
            });

            setFormData({
                name: "",
                price_per_kg: "",
                quantity_available: "",
            });

            fetchProducts();
            alert("Product added successfully.");
        } catch (err) {
            console.error("Error adding product:", err);
            alert("Failed to add product.");
        }
    };

    const handleDeleteProduct = async (id) => {
        const ok = window.confirm("Are you sure you want to delete this product?");
        if (!ok) return;

        try {
            await api.delete(`market/products/${id}/`);
            fetchProducts();
        } catch (err) {
            console.error("Error deleting product:", err);
            alert("Failed to delete product.");
        }
    };

    const handleUpdateOrderStatus = async (id, status) => {
        try {
            await api.patch(`market/orders/${id}/`, { status });
            fetchOrders();
        } catch (err) {
            console.error("Error updating order:", err);
            alert("Failed to update order.");
        }
    };

    const totalProducts = products.length;
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
    const acceptedOrders = orders.filter(
        (o) => o.status === "ACCEPTED" || o.status === "DELIVERED"
    ).length;

    if (activeTab === "dashboard") {
        return (
            <div className="buyer-dashboard">
                <div className="stats">
                    <div className="stat-card stat-card-clean">
                        <div className="stat-card-top">
                            <span>My Products</span>
                            <Package size={18} />
                        </div>
                        <h3>{totalProducts}</h3>
                    </div>

                    <div className="stat-card stat-card-clean">
                        <div className="stat-card-top">
                            <span>Total Orders</span>
                            <ShoppingBag size={18} />
                        </div>
                        <h3>{totalOrders}</h3>
                    </div>

                    <div className="stat-card stat-card-clean">
                        <div className="stat-card-top">
                            <span>Pending Orders</span>
                            <Clock size={18} />
                        </div>
                        <h3>{pendingOrders}</h3>
                    </div>

                    <div className="stat-card stat-card-clean">
                        <div className="stat-card-top">
                            <span>Accepted Orders</span>
                            <CheckCircle size={18} />
                        </div>
                        <h3>{acceptedOrders}</h3>
                    </div>
                </div>

                <div className="content-grid buyer-home-grid">
                    <div className="glass-panel">
                        <div className="section-header">
                            <h3>Add Product</h3>
                            <p>Create a new product offer</p>
                        </div>

                        <form className="add-product-form" onSubmit={handleAddProduct}>
                            <div className="form-group">
                                <label>Product Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter product name"
                                />
                            </div>

                            <div className="form-group">
                                <label>Price per Kg</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="price_per_kg"
                                    value={formData.price_per_kg}
                                    onChange={handleChange}
                                    placeholder="Enter price"
                                />
                            </div>

                            <div className="form-group">
                                <label>Quantity Available</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="quantity_available"
                                    value={formData.quantity_available}
                                    onChange={handleChange}
                                    placeholder="Enter quantity"
                                />
                            </div>

                            <button type="submit" className="btn-primary modern-btn">
                                Add Product
                            </button>
                        </form>
                    </div>

                    <div className="glass-panel">
                        <div className="section-header">
                            <h3>Recent Orders</h3>
                            <p>Latest buyer requests</p>
                        </div>

                        {orders.length === 0 ? (
                            <p className="empty-state">No orders found.</p>
                        ) : (
                            <div className="order-list-modern">
                                {orders.slice(0, 5).map((o) => (
                                    <div key={o.id} className="order-card-modern">
                                        <div className="order-card-top">
                                            <div>
                                                <h4>Order #{o.id}</h4>
                                                <p>{o.product_name || "Product"}</p>
                                            </div>
                                            <div className="order-price">{o.total_price || 0} DA</div>
                                        </div>

                                        <div className="order-card-bottom">
                                            <span>{o.quantity}kg</span>
                                            <span className={`badge badge-${o.status.toLowerCase()}`}>
                                                {o.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (activeTab === "products") {
        return (
            <div className="glass-panel">
                <div className="section-header">
                    <h3>My Products</h3>
                    <p>Manage your available products</p>
                </div>

                <form className="add-product-form" onSubmit={handleAddProduct} style={{ marginBottom: "1.5rem" }}>
                    <div className="form-group">
                        <label>Product Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter product name"
                        />
                    </div>

                    <div className="form-group">
                        <label>Price per Kg</label>
                        <input
                            type="number"
                            step="0.01"
                            name="price_per_kg"
                            value={formData.price_per_kg}
                            onChange={handleChange}
                            placeholder="Enter price"
                        />
                    </div>

                    <div className="form-group">
                        <label>Quantity Available</label>
                        <input
                            type="number"
                            step="0.01"
                            name="quantity_available"
                            value={formData.quantity_available}
                            onChange={handleChange}
                            placeholder="Enter quantity"
                        />
                    </div>

                    <button type="submit" className="btn-primary">
                        Add Product
                    </button>
                </form>

                {products.length === 0 ? (
                    <p className="empty-state">No products added yet.</p>
                ) : (
                    <div className="product-cards">
                        {products.map((p) => (
                            <div key={p.id} className="product-card-modern">
                                <div className="product-image-placeholder">
                                    <span>{p.name?.charAt(0)?.toUpperCase() || "P"}</span>
                                </div>

                                <div className="product-card-body">
                                    <div className="product-badge-row">
                                        <span className="mini-badge">My Product</span>
                                    </div>

                                    <h4>{p.name}</h4>

                                    <div className="product-meta">
                                        <span className="product-price">{p.price_per_kg} DA/kg</span>
                                        <span className="product-stock">{p.quantity_available}kg available</span>
                                    </div>

                                    <button
                                        className="btn-delete modern-btn"
                                        onClick={() => handleDeleteProduct(p.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (activeTab === "orders") {
        return (
            <div className="glass-panel">
                <div className="section-header">
                    <h3>Incoming Orders</h3>
                    <p>Accept or reject customer orders</p>
                </div>

                {orders.length === 0 ? (
                    <p className="empty-state">No orders found.</p>
                ) : (
                    <div className="order-list-modern">
                        {orders.map((o) => (
                            <div key={o.id} className="order-card-modern">
                                <div className="order-card-top">
                                    <div>
                                        <h4>Order #{o.id}</h4>
                                        <p>{o.product_name || "Product"}</p>
                                    </div>
                                    <div className="order-price">{o.total_price || 0} DA</div>
                                </div>

                                <div className="order-card-bottom">
                                    <span>{o.quantity}kg</span>
                                    <span className={`badge badge-${o.status.toLowerCase()}`}>
                                        {o.status}
                                    </span>
                                </div>

                                {o.status === "PENDING" && (
                                    <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                                        <button
                                            className="btn-primary"
                                            onClick={() => handleUpdateOrderStatus(o.id, "ACCEPTED")}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            className="btn-delete modern-cancel-btn"
                                            onClick={() => handleUpdateOrderStatus(o.id, "CANCELLED")}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (activeTab === "services") {
        return (
            <div className="glass-panel">
                <div className="section-header">
                    <h3>Services</h3>
                    <p>Farmer services will appear here</p>
                </div>
                <p className="empty-state">Services section coming soon.</p>
            </div>
        );
    }

    return null;
};

export default FarmerDashboard;