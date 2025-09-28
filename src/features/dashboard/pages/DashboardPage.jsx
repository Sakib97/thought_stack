import { useState } from "react";
import { useAuth } from "../../../context/AuthProvider";
import ProfilePage from "./ProfilePage";
import { Outlet } from "react-router-dom";

import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, theme, Grid, Select } from "antd";

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const DashboardPage = () => {
    const { user } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const screens = useBreakpoint();

    const {
        token: { borderRadiusLG },
    } = theme.useToken();

    if (!user) {
        return <p>Not Logged In !</p>;
    }

    return (
        <Layout style={{ minHeight: "100vh", background: "#f0f0f0", overflowX: "hidden" }}>
            {/* Sidebar */}
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                //  on small screens (<768px) -> fully hide, on larger -> collapse to icons
                collapsedWidth={screens.md ? 80 : 0}
                breakpoint="md"
                style={{ background: "#e0e0e0" }}
            >
                <div
                    className="demo-logo-vertical"
                    style={{
                        height: 30,
                        margin: 16,
                        background: "rgba(0, 0, 0, 0.15)",
                        borderRadius: 8,
                        textAlign: "center",
                        lineHeight: "30px",
                        color: "black",
                        fontWeight: "bold",
                        fontSize: 18,
                        // display: "flex",
                    }}
                > <i className="fi fi-sr-dashboard-monitor"
                    style={{ fontSize: collapsed ? 21 : 15 }}
                ></i> {!collapsed && "Dashboard"}
                </div>
                <Menu
                    theme="light"
                    mode="inline"
                    defaultSelectedKeys={["1"]}
                    items={[
                        { key: "1", icon: <i className="fi fi-sr-user" style={{fontSize:  15 }}></i>, label: "Profile" },
                        { key: "2", icon: <i className="fi fi-sr-settings" style={{fontSize:  15 }}></i>, label: "Settings" },
                        { key: "3", icon: <i className="fi fi-sr-upload" style={{fontSize:  15 }}></i>, label: "Uploads" },
                    ]}
                    style={{ background: "#e0e0e0" }}
                />
            </Sider>

            {/* Main Layout */}
            <Layout>
                <Header
                    style={{
                        padding: 0,
                        background: "#f0f0f0",
                    }}
                >
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: "16px",
                            width: 64,
                            height: 64,
                        }}
                    />
                </Header>

                <Content
                    style={{
                        margin: "24px 16px",
                        padding: 24,
                        minHeight: 280,
                        background: "#ffffff",
                        borderRadius: borderRadiusLG,
                        overflowX: "hidden",
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>

            {/* Custom Styles */}
            <style>{`
                body {
                overflow-x: hidden; /* prevent horizontal scroll globally */
                }
                .ant-menu-item {
                transition: background 0.3s, color 0.3s;
                }
                .ant-menu-item:hover {
                background: rgb(176, 170, 170) !important;
                }
                .ant-menu-item:hover .anticon {
                color: #333 !important; /* dark gray icons on hover */
                }
                .ant-menu-item-selected {
                background:rgb(176, 170, 170) !important; /* slightly darker for selected */
                    font-weight: bold;
                    color: black !important; /* white text for selected */
                }
                
                .ant-menu-item-selected .ant-menu-item-icon {
                    font-size: 17px !important;  /* bigger when selected */
                    transform: scale(1.1);
                    transition: all 0.3s ease;   /* smooth animation */
                    }
      `}</style>
        </Layout>
    );
};

export default DashboardPage;
