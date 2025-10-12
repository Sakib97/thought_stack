import { useState } from "react";
import { useAuth } from "../../../context/AuthProvider";
import ProfilePage from "./ProfilePage";
import { Outlet, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";


import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, theme, Grid, Select } from "antd";

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const DashboardPage = () => {
    const { user, userMeta } = useAuth();
    const [collapsed, setCollapsed] = useState(true);
    const screens = useBreakpoint();

    const {
        token: { borderRadiusLG },
    } = theme.useToken();

    if (!user || !userMeta) {
        return <p>Not Logged In !</p>;
    }

    const getSelectedKey = () => {
        if (location.pathname.includes("/dashboard/profile")) return "1";
        if (location.pathname.includes("/dashboard/write-article")) return "2";
        if (location.pathname.includes("/dashboard/manage-users")) return "3";
        return "1"; // fallback
    };

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
                        color: "black",
                        fontWeight: "bold",
                        fontSize: 18,
                        display: "flex",
                        alignItems: "center", // Vertically center items
                        justifyContent: "center", // Horizontally center items
                        gap: 8,
                    }}
                >
                    <div style={{ transform: `translateY(7%) ${collapsed ? "translateX(20%)" : "translateX(0%)"}` }}>
                        <i className="fi fi-rr-dashboard-panel"
                            style={{ fontSize: collapsed ? 21 : 19 }}
                        ></i>
                    </div>
                    <div>
                        {!collapsed && "Dashboard"}
                    </div>
                </div>
                <Menu
                    theme="light"
                    mode="inline"
                    defaultSelectedKeys={[getSelectedKey()]}
                    items={[
                        {
                            key: "1", icon: <i className="fi fi-br-user" style={{ fontSize: 16 }}></i>,
                            label: <Link style={{ textDecoration: 'none' }} to="/dashboard/profile">Profile</Link>
                        },
                        ...(((userMeta.role === "editor" || userMeta.role === "admin") && userMeta.is_active)
                            ? [{
                                key: "2", icon: <i className="fi fi-br-scroll-document-story" style={{ fontSize: 16 }}></i>,
                                label: <Link style={{ textDecoration: 'none' }} to="/dashboard/write-article">Write Article</Link>
                            }]
                            : []),
                        ...(((userMeta.role === "editor" || userMeta.role === "admin") && userMeta.is_active)
                            ? [{
                                key: "3", icon: <i className="fi fi-br-document-gear" style={{ fontSize: 16 }}></i>,
                                label: <Link style={{ textDecoration: 'none' }} to="/dashboard/manage-articles">Manage Articles</Link>
                            }]
                            : []),
                        ...(((userMeta.role === "editor" || userMeta.role === "admin") && userMeta.is_active)
                            ? [{
                                key: "4", icon: <i className="fi fi-br-comment-question" style={{ fontSize: 16 }}></i>,
                                label: <Link style={{ textDecoration: 'none' }} to="/dashboard/manage-comments">Manage Comments</Link>
                            }]
                            : []),
                        ...(userMeta.role === "admin" && userMeta.is_active
                            ? [{
                                key: "5", icon: <i className="fi fi-bs-user-gear" style={{ fontSize: 16 }}></i>,
                                label: <Link style={{ textDecoration: 'none' }} to="/dashboard/manage-users">Manage Users</Link>
                            }]
                            : []),
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
                    font-size: 20px !important;  /* bigger when selected */
                    transform: scale(1.1);
                    transition: all 0.3s ease;   /* smooth animation */
                    }
      `}</style>
        </Layout>
    );
};

export default DashboardPage;
