import { Home, Package, ShoppingCart, Truck, Sprout, LogOut } from "lucide-react";

const Sidebar = ({ user, activeTab, setActiveTab, logoutUser }) => {
  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: <Home size={18} /> },
    {
      key: "products",
      label: user?.role === "BUYER" ? "Marketplace" : "My Products",
      icon: <Package size={18} />,
    },
    { key: "orders", label: "My Orders", icon: <ShoppingCart size={18} /> },
    { key: "tracking", label: "Track Order", icon: <Truck size={18} /> },
    { key: "services", label: "Services", icon: <Sprout size={18} /> },
  ];

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