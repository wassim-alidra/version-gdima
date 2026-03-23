import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";

const DashboardLayout = ({ children, activeTab, setActiveTab }) => {
    const { user, logoutUser } = useContext(AuthContext);

    return (
        <div className="dashboard-layout">
            <Sidebar
                user={user}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                logoutUser={logoutUser}
            />

            <div className="dashboard-main">
                <Topbar user={user} />
                <div className="dashboard-content">{children}</div>
            </div>
        </div>
    );
};

export default DashboardLayout;