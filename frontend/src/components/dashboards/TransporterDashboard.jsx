import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Truck, ClipboardList, Clock, CheckCircle } from "lucide-react";
import "../../styles/dashboard.css";

const TransporterDashboard = ({ activeTab }) => {
    const [availableOrders, setAvailableOrders] = useState([]);
    const [myDeliveries, setMyDeliveries] = useState([]);

    useEffect(() => {
        fetchAvailableOrders();
        fetchMyDeliveries();
    }, []);

    const fetchAvailableOrders = async () => {
        try {
            const res = await api.get("market/deliveries/available_orders/");
            setAvailableOrders(res.data);
        } catch (err) {
            console.error("Error fetching available orders:", err);
        }
    };

    const fetchMyDeliveries = async () => {
        try {
            const res = await api.get("market/deliveries/");
            setMyDeliveries(res.data);
        } catch (err) {
            console.error("Error fetching deliveries:", err);
        }
    };

    const handleAccept = async (orderId) => {
        try {
            await api.post("market/deliveries/", {
                order: orderId,
            });
            alert("Delivery accepted!");
            fetchAvailableOrders();
            fetchMyDeliveries();
        } catch (err) {
            alert("Error accepting delivery");
            console.error(err);
        }
    };

    const handleUpdateDeliveryStatus = async (deliveryId, status) => {
        try {
            await api.patch(`market/deliveries/${deliveryId}/`, { status });
            fetchMyDeliveries();
        } catch (err) {
            alert("Error updating delivery status");
            console.error(err);
        }
    };

    const totalAvailable = availableOrders.length;
    const totalDeliveries = myDeliveries.length;
    const inTransitCount = myDeliveries.filter(
        (d) => d.status === "IN_TRANSIT"
    ).length;
    const deliveredCount = myDeliveries.filter(
        (d) => d.status === "DELIVERED"
    ).length;

    if (activeTab === "dashboard") {
        return (
            <div className="buyer-dashboard">
                <div className="stats">
                    <div className="stat-card stat-card-clean">
                        <div className="stat-card-top">
                            <span>Available Missions</span>
                            <ClipboardList size={18} />
                        </div>
                        <h3>{totalAvailable}</h3>
                    </div>

                    <div className="stat-card stat-card-clean">
                        <div className="stat-card-top">
                            <span>My Deliveries</span>
                            <Truck size={18} />
                        </div>
                        <h3>{totalDeliveries}</h3>
                    </div>

                    <div className="stat-card stat-card-clean">
                        <div className="stat-card-top">
                            <span>In Transit</span>
                            <Clock size={18} />
                        </div>
                        <h3>{inTransitCount}</h3>
                    </div>

                    <div className="stat-card stat-card-clean">
                        <div className="stat-card-top">
                            <span>Delivered</span>
                            <CheckCircle size={18} />
                        </div>
                        <h3>{deliveredCount}</h3>
                    </div>
                </div>

                <div className="content-grid buyer-home-grid">
                    <div className="glass-panel">
                        <div className="section-header">
                            <h3>Available for Delivery</h3>
                            <p>Orders waiting for a transporter</p>
                        </div>

                        {availableOrders.length === 0 ? (
                            <p className="empty-state">No orders needing delivery.</p>
                        ) : (
                            <div className="order-list-modern">
                                {availableOrders.slice(0, 5).map((o) => (
                                    <div key={o.id} className="order-card-modern">
                                        <div className="order-card-top">
                                            <div>
                                                <h4>Order #{o.id}</h4>
                                                <p>{o.product_name}</p>
                                            </div>
                                        </div>

                                        <div className="delivery-route">
                                            <span>From: {o.product_location || "Farm"}</span>
                                            <span>To: {o.buyer_location || "Buyer"}</span>
                                        </div>

                                        <div className="order-card-bottom">
                                            <span>{o.quantity}kg</span>
                                            <span className="mini-badge">Ready</span>
                                        </div>

                                        <button
                                            className="btn-primary modern-btn"
                                            onClick={() => handleAccept(o.id)}
                                        >
                                            Accept Delivery
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="glass-panel">
                        <div className="section-header">
                            <h3>Recent Deliveries</h3>
                            <p>Your latest assigned missions</p>
                        </div>

                        {myDeliveries.length === 0 ? (
                            <p className="empty-state">No active deliveries.</p>
                        ) : (
                            <div className="order-list-modern">
                                {myDeliveries.slice(0, 5).map((d) => (
                                    <div key={d.id} className="order-card-modern">
                                        <div className="order-card-top">
                                            <div>
                                                <h4>Delivery #{d.id}</h4>
                                                <p>For Order #{d.order}</p>
                                            </div>
                                        </div>

                                        <div className="order-card-bottom">
                                            <span>Status</span>
                                            <span
                                                className={`badge badge-${d.status === "DELIVERED"
                                                        ? "delivered"
                                                        : d.status === "IN_TRANSIT"
                                                            ? "accepted"
                                                            : "pending"
                                                    }`}
                                            >
                                                {d.status}
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

    if (activeTab === "orders") {
        return (
            <div className="glass-panel">
                <div className="section-header">
                    <h3>Available Delivery Orders</h3>
                    <p>Accept a new mission</p>
                </div>

                {availableOrders.length === 0 ? (
                    <p className="empty-state">No orders needing delivery.</p>
                ) : (
                    <div className="order-list-modern">
                        {availableOrders.map((o) => (
                            <div key={o.id} className="order-card-modern">
                                <div className="order-card-top">
                                    <div>
                                        <h4>Order #{o.id}</h4>
                                        <p>{o.product_name}</p>
                                    </div>
                                </div>

                                <div className="delivery-route">
                                    <span>From: {o.product_location || "Farm"}</span>
                                    <span>To: {o.buyer_location || "Buyer"}</span>
                                </div>

                                <div className="order-card-bottom">
                                    <span>{o.quantity}kg</span>
                                    <span className="mini-badge">Available</span>
                                </div>

                                <button
                                    className="btn-primary modern-btn"
                                    onClick={() => handleAccept(o.id)}
                                >
                                    Accept Delivery
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (activeTab === "tracking") {
        return (
            <div className="glass-panel">
                <div className="section-header">
                    <h3>My Deliveries</h3>
                    <p>Update delivery progress</p>
                </div>

                {myDeliveries.length === 0 ? (
                    <p className="empty-state">No active deliveries.</p>
                ) : (
                    <div className="order-list-modern">
                        {myDeliveries.map((d) => (
                            <div key={d.id} className="order-card-modern">
                                <div className="order-card-top">
                                    <div>
                                        <h4>Delivery #{d.id}</h4>
                                        <p>For Order #{d.order}</p>
                                    </div>
                                </div>

                                <div className="order-card-bottom">
                                    <span>Current Status</span>
                                    <span
                                        className={`badge badge-${d.status === "DELIVERED"
                                                ? "delivered"
                                                : d.status === "IN_TRANSIT"
                                                    ? "accepted"
                                                    : "pending"
                                            }`}
                                    >
                                        {d.status}
                                    </span>
                                </div>

                                <div className="delivery-actions">
                                    {d.status === "ASSIGNED" && (
                                        <button
                                            className="btn-primary"
                                            onClick={() =>
                                                handleUpdateDeliveryStatus(d.id, "IN_TRANSIT")
                                            }
                                        >
                                            Mark In Transit
                                        </button>
                                    )}

                                    {d.status === "IN_TRANSIT" && (
                                        <button
                                            className="btn-primary"
                                            onClick={() =>
                                                handleUpdateDeliveryStatus(d.id, "DELIVERED")
                                            }
                                        >
                                            Mark Delivered
                                        </button>
                                    )}
                                </div>
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
                    <p>Transporter services will appear here</p>
                </div>
                <p className="empty-state">Services section coming soon.</p>
            </div>
        );
    }

    return null;
};

export default TransporterDashboard;