import { Home, Package, ShoppingCart, Truck, Sprout, LogOut, Clock, Users, Bell, AlertCircle } from "lucide-react";

const Sidebar = ({ user, activeTab, setActiveTab, logoutUser }) => {
  const transporterItems = [
    { key: "dashboard", label: "Dashboard", icon: <Home size={18} /> },
    { key: "requests", label: "Delivery Requests", icon: <Package size={18} /> },
    { key: "status", label: "Update Status", icon: <Truck size={18} /> },
    { key: "history", label: "Delivery History", icon: <Clock size={18} /> },
    { key: "earnings", label: "Earnings", icon: <ShoppingCart size={18} /> },
    { key: "profile", label: "Profile", icon: <Sprout size={18} /> },
  ];

  const farmerItems = [
    { key: "dashboard", label: "Dashboard", icon: <Home size={18} /> },
    { key: "products", label: "My Products", icon: <Package size={18} /> },
    { key: "orders", label: "My Orders", icon: <ShoppingCart size={18} /> },
    { key: "tracking", label: "Track Delivery", icon: <Truck size={18} /> },
    { key: "prices", label: "Official Prices", icon: <Package size={18} /> },
    { key: "notifications", label: "Notifications", icon: <Bell size={18} /> },
    { key: "complaints", label: "Complaints", icon: <LogOut size={18} /> },
  ];

  const buyerItems = [
    { key: "dashboard", label: "Dashboard", icon: <Home size={18} /> },
    { key: "products", label: "Marketplace", icon: <Package size={18} /> },
    { key: "cart", label: "My Cart", icon: <ShoppingCart size={18} /> },
    { key: "orders", label: "My Orders", icon: <Clock size={18} /> },
    { key: "tracking", label: "Track Delivery", icon: <Truck size={18} /> },
    { key: "notifications", label: "Notifications", icon: <Bell size={18} /> },
    { key: "complaints", label: "Complaints", icon: <LogOut size={18} /> },
  ];

  const adminItems = [
    { key: "dashboard", label: "Overview", icon: <Home size={18} /> },
    { key: "users", label: "Users Management", icon: <Users size={18} /> },
    { key: "complaints", label: "Complaints", icon: <AlertCircle size={18} /> },
    { key: "catalog", label: "Manage Catalog", icon: <Package size={18} /> },
    { key: "notifications", label: "Farmer Alerts", icon: <Bell size={18} /> },
  ];

  const genericItems = [
    { key: "dashboard", label: "Dashboard", icon: <Home size={18} /> },
    {
      key: "products",
      label: user?.role === "BUYER" ? "Marketplace" : "My Products",
      icon: <Package size={18} />,
    },
    { key: "orders", label: "My Orders", icon: <ShoppingCart size={18} /> },
    { key: "services", label: "Services", icon: <Sprout size={18} /> },
  ];

  let menuItems = genericItems;
  if (user?.role === "TRANSPORTER") menuItems = transporterItems;
  if (user?.role === "FARMER") menuItems = farmerItems;
  if (user?.role === "BUYER") menuItems = buyerItems;
  if (user?.role === "ADMIN") menuItems = adminItems;

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">A</div>
        <div>
          <h2>AgriGov</h2>
          <p>Market Platform</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.key}
            className={`sidebar-link ${activeTab === item.key ? "active" : ""}`}
            onClick={() => setActiveTab(item.key)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={logoutUser}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;