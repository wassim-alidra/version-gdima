import { useContext, useState } from "react";
import AuthContext from "../context/AuthContext";
import FarmerDashboard from "../components/dashboards/FarmerDashboard";
import BuyerDashboard from "../components/dashboards/BuyerDashboard";
import TransporterDashboard from "../components/dashboards/TransporterDashboard";
import DashboardLayout from "../components/layout/DashboardLayout";
import "../styles/dashboard.css";

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState("dashboard");

    if (!user) return <div className="loading">Loading...</div>;

    return (
        <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            {user.role === "FARMER" && activeTab !== "tracking" && (
                <FarmerDashboard activeTab={activeTab} />
            )}

            {user.role === "BUYER" && activeTab !== "tracking" && (
                <BuyerDashboard activeTab={activeTab} />
            )}

            {user.role === "TRANSPORTER" && (
                <TransporterDashboard activeTab={activeTab} />
            )}

            {activeTab === "tracking" && (
                <div className="glass-panel">
                    <h3>🚚 Track Order</h3>
                    <p>Tracking system coming soon...</p>
                </div>
            )}

            {user.role === "ADMIN" && (
                <div className="glass-panel">
                    <h3>Admin Dashboard (Coming Soon)</h3>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Dashboard;