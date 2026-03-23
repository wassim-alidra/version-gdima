import { useState, useEffect } from "react";
import api from "../../api/axios";
import { ShoppingCart, Package, Truck, CheckCircle } from "lucide-react";
import "../../styles/dashboard.css";

const BuyerDashboard = ({ activeTab }) => {
    const [products, setProducts] = useState([]);
    const [myOrders, setMyOrders] = useState([]);

    useEffect(() => {
        fetchProducts();
        fetchMyOrders();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get("market/products/");
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMyOrders = async () => {
        try {
            const res = await api.get("market/orders/");
            setMyOrders(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleBuy = async (productId) => {
        const qty = prompt("Enter quantity (kg):");
        if (!qty) return;

        try {
            await api.post("market/orders/", {
                product: productId,
                quantity: parseFloat(qty),
            });
            alert("Order placed!");
            fetchMyOrders();
        } catch (err) {
            alert("Error placing order");
            console.error(err);
        }
    };

    const handleCancelOrder = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        try {
            await api.patch(`market/orders/${id}/`, { status: "CANCELLED" });
            fetchMyOrders();
        } catch (err) {
            alert("Error cancelling order");
            console.error(err);
        }
    };

    const totalOrders = myOrders.length;
    const pendingOrders = myOrders.filter((o) => o.status === "PENDING").length;
    const deliveredOrders = myOrders.filter((o) => o.status === "DELIVERED").length;
    const availableProducts = products.length;

    if (activeTab === "dashboard") {
        return (
            <div className="buyer-dashboard">
                <div className="stats">
                    <div className="stat-card stat-card-clean">
                        <div className="stat-card-top">
                            <span>Available Products</span>
                            <Package size={18} />
                        </div>
                        <h3>{availableProducts}</h3>
                    </div>

                    <div className="stat-card stat-card-clean">
                        <div className="stat-card-top">
                            <span>My Orders</span>
                            <ShoppingCart size={18} />
                        </div>
                        <h3>{totalOrders}</h3>
                    </div>

                    <div className="stat-card stat-card-clean">
                        <div className="stat-card-top">
                            <span>Pending Orders</span>
                            <Truck size={18} />
                        </div>
                        <h3>{pendingOrders}</h3>
                    </div>

                    <div className="stat-card stat-card-clean">
                        <div className="stat-card-top">
                            <span>Delivered</span>
                            <CheckCircle size={18} />
                        </div>
                        <h3>{deliveredOrders}</h3>
                    </div>
                </div>

                <div className="content-grid buyer-home-grid">
                    <div className="glass-panel">
                        <div className="section-header">
                            <h3>Featured Products</h3>
                            <p>Fresh products from farmers</p>
                        </div>

                        {products.length === 0 ? (
                            <p className="empty-state">No products available.</p>
                        ) : (
                            <div className="product-cards">
                                {products.slice(0, 6).map((p) => (
                                    <div key={p.id} className="product-card-modern">
                                        <div className="product-image-placeholder">
                                            <span>{p.name?.charAt(0)?.toUpperCase() || "P"}</span>
                                        </div>

                                        <div className="product-card-body">
                                            <div className="product-badge-row">
                                                <span className="mini-badge">Available</span>
                                            </div>

                                            <h4>{p.name}</h4>
                                            <p className="product-farmer">by {p.farmer_name}</p>

                                            <div className="product-meta">
                                                <span className="product-price">{p.price_per_kg} DA/kg</span>
                                                <span className="product-stock">{p.quantity_available}kg left</span>
                                            </div>

                                            <button className="btn-primary modern-btn" onClick={() => handleBuy(p.id)}>
                                                Buy Now
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="glass-panel">
                        <div className="section-header">
                            <h3>Recent Orders</h3>
                            <p>Your latest purchases</p>
                        </div>

                        {myOrders.length === 0 ? (
                            <p className="empty-state">No orders placed.</p>
                        ) : (
                            <div className="order-list-modern">
                                {myOrders.slice(0, 5).map((o) => (
                                    <div key={o.id} className="order-card-modern">
                                        <div className="order-card-top">
                                            <div>
                                                <h4>Order #{o.id}</h4>
                                                <p>{o.product_name}</p>
                                            </div>
                                            <div className="order-price">{o.total_price} DA</div>
                                        </div>

                                        <div className="order-card-bottom">
                                            <span>{o.quantity}kg</span>
                                            <span className={`badge badge-${o.status.toLowerCase()}`}>{o.status}</span>
                                        </div>

                                        {o.status === "PENDING" && (
                                            <button
                                                className="btn-delete modern-cancel-btn"
                                                onClick={() => handleCancelOrder(o.id)}
                                            >
                                                Cancel
                                            </button>
                                        )}
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
                    <h3>Marketplace</h3>
                    <p>Browse and buy available products</p>
                </div>

                {products.length === 0 ? (
                    <p className="empty-state">No products available.</p>
                ) : (
                    <div className="product-cards">
                        {products.map((p) => (
                            <div key={p.id} className="product-card-modern">
                                <div className="product-image-placeholder">
                                    <span>{p.name?.charAt(0)?.toUpperCase() || "P"}</span>
                                </div>

                                <div className="product-card-body">
                                    <div className="product-badge-row">
                                        <span className="mini-badge">Fresh</span>
                                    </div>

                                    <h4>{p.name}</h4>
                                    <p className="product-farmer">by {p.farmer_name}</p>

                                    <div className="product-meta">
                                        <span className="product-price">{p.price_per_kg} DA/kg</span>
                                        <span className="product-stock">{p.quantity_available}kg left</span>
                                    </div>

                                    <button className="btn-primary modern-btn" onClick={() => handleBuy(p.id)}>
                                        Buy Now
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
                    <h3>My Orders</h3>
                    <p>Track and manage your orders</p>
                </div>

                {myOrders.length === 0 ? (
                    <p className="empty-state">No orders placed.</p>
                ) : (
                    <div className="order-list-modern">
                        {myOrders.map((o) => (
                            <div key={o.id} className="order-card-modern">
                                <div className="order-card-top">
                                    <div>
                                        <h4>Order #{o.id}</h4>
                                        <p>{o.product_name}</p>
                                    </div>
                                    <div className="order-price">{o.total_price} DA</div>
                                </div>

                                <div className="order-card-bottom">
                                    <span>{o.quantity}kg</span>
                                    <span className={`badge badge-${o.status.toLowerCase()}`}>{o.status}</span>
                                </div>

                                {o.status === "PENDING" && (
                                    <button
                                        className="btn-delete modern-cancel-btn"
                                        onClick={() => handleCancelOrder(o.id)}
                                    >
                                        Cancel
                                    </button>
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
                    <p>Buyer services will appear here</p>
                </div>
                <p className="empty-state">Services section coming soon.</p>
            </div>
        );
    }

    return null;
};

export default BuyerDashboard;