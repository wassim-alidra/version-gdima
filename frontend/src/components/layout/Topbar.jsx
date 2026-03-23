import { Bell, Search } from "lucide-react";

const Topbar = ({ user }) => {
  const roleLabels = {
    FARMER: "Farmer",
    BUYER: "Buyer",
    TRANSPORTER: "Transporter",
    ADMIN: "Admin",
  };

  return (
    <header className="dashboard-topbar">
      <div className="topbar-left">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.username}</p>
      </div>

      <div className="topbar-right">
        <div className="topbar-search">
          <Search size={18} />
          <input type="text" placeholder="Search..." />
        </div>

        <button className="topbar-icon-btn">
          <Bell size={18} />
        </button>

        <div className="topbar-user">
          <div className="topbar-avatar">
            {user?.username?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="topbar-user-info">
            <span>{user?.username}</span>
            <small>{roleLabels[user?.role] || user?.role}</small>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;