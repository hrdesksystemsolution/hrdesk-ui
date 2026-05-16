import React, { useEffect, useMemo, useState } from "react";
import "./Sidebar.css";
import api from "../services/api";

// Ranges match header.php exactly
const MENU_GROUPS = [
  { key: "system",          label: "System",           icon: "fa-cogs",       min: 1,   max: 99  },
  { key: "master",          label: "Master",           icon: "fa-cubes",      min: 100, max: 200 },
  { key: "timeoffice",      label: "Time Office",      icon: "fa-clock-o",    min: 201, max: 300 },
  { key: "attendanceleave", label: "Attendance/Leave", icon: "fa-desktop",    min: 301, max: 400 },
  { key: "salarywages",     label: "Salary Wages",     icon: "fa-calculator", min: 401, max: 500 },
  { key: "payroll",         label: "Payroll",          icon: "fa-inr",        min: 501, max: 600 },
  { key: "incometax",       label: "Income Tax",       icon: "fa-money",      min: 601, max: 700 },
  { key: "visitor",         label: "Visitor",          icon: "fa-suitcase",   min: 701, max: 800 },
];

const normalizeAccessArray = (value) => {
  if (!value) return [];
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((x) => Number(x)).filter((x) => !Number.isNaN(x));
  } catch {
    return [];
  }
};

const normalizeMenuRow = (row) => ({
  mnuno:    Number(row.mnuno),
  mnuname:  row.mnuname  || "",
  filename: row.filename || "#",
  mnutype:  row.mnu_type || row.mnutype || "",
  dashboard: row.dashboard != null ? String(row.dashboard) : "",
});

const getDashboardValue = () =>
  String(
    localStorage.getItem("dashboard") ||
    localStorage.getItem("user_dashboard") ||
    "1"
  );

// Match PHP: strpos($user_dashboard, $menu_dashboard) !== false
const matchesDashboard = (menuDashboard, userDashboard) => {
  if (!menuDashboard) return true;
  const menuDash = String(menuDashboard);
  return String(userDashboard)
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean)
    .some((d) => menuDash.includes(d));
};

const buildGroups = (menus, accessArray, dashboard) => {
  const allowed = menus.filter((m) => {
    const access = accessArray.length === 0 || accessArray.includes(m.mnuno);
    return access && matchesDashboard(m.dashboard, dashboard);
  });

  return MENU_GROUPS.map((g) => ({
    groupId:   g.key,
    groupName: g.label,
    icon:      g.icon,
    menus: allowed
      .filter((m) => m.mnuno >= g.min && m.mnuno <= g.max)
      .sort((a, b) => a.mnuno - b.mnuno),
  })).filter((g) => g.menus.length > 0);
};

const Sidebar = ({ onToggle }) => {
  const [menuGroups,     setMenuGroups]     = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [isHovered,      setIsHovered]      = useState(false);
  const [searchTerm,     setSearchTerm]     = useState("");
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState("");

  useEffect(() => { fetchMenus(); }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      setError("");

      let data;
      try {
        const res = await api.get("/menus");
        data = res.data;
      } catch {
        const res = await fetch(
          "http://localhost/HRDesk/menu-service.php?action=getMenus",
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Failed to load menus");
        data = await res.json();
      }

      let rows = [];
      if (Array.isArray(data))           rows = data;
      else if (Array.isArray(data?.data)) rows = data.data;
      else if (Array.isArray(data?.menus)) rows = data.menus;

      rows = rows.map(normalizeMenuRow);

      const accessArray = normalizeAccessArray(
        localStorage.getItem("menuaccessarray") ||
        localStorage.getItem("menu_access_array")
      );
      const dashboard = getDashboardValue();
      const groups    = buildGroups(rows, accessArray, dashboard);

      setMenuGroups(groups);
      // First group open by default
      if (groups.length > 0) {
        setExpandedGroups({ [groups[0].groupId]: true });
      }
    } catch (err) {
      console.error("Sidebar:", err);
      setError("Failed to load menus");
    } finally {
      setLoading(false);
    }
  };

  // Search by menu name only — no filename matching
  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return menuGroups;
    const term = searchTerm.toLowerCase();
    return menuGroups
      .map((g) => ({
        ...g,
        menus: g.menus.filter((m) => m.mnuname.toLowerCase().includes(term)),
      }))
      .filter((g) => g.menus.length > 0);
  }, [menuGroups, searchTerm]);

  // Auto-expand all groups while searching
  useEffect(() => {
    if (!searchTerm.trim()) return;
    const all = {};
    filteredGroups.forEach((g) => { all[g.groupId] = true; });
    setExpandedGroups(all);
  }, [searchTerm, filteredGroups]);

  const toggleGroup = (id) =>
    setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleMouseEnter = () => {
    setIsHovered(true);
    onToggle?.(true);
  };
  const handleMouseLeave = () => {
    setIsHovered(false);
    onToggle?.(false);
  };

  const handleNavigate = (menu) => {
    if (!menu?.filename || menu.filename === "#") return;
    window.location.href = menu.filename;
  };

  const handleLogout = () => {
    [
      "token", "user", "menuaccessarray", "menu_access_array",
      "dashboard", "year", "financial_year",
    ].forEach((k) => localStorage.removeItem(k));
    window.location.href = "/login";
  };

  return (
    <aside
      className={`sidebar ${isHovered ? "sidebar-expanded" : "sidebar-collapsed"}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Header ── */}
      <div className="sb-header">
        <div className="sb-logo">HR</div>
        {isHovered && <span className="sb-brand">HR Desk</span>}
      </div>

      {/* ── Search (visible only when expanded) ── */}
      {isHovered && (
        <div className="sb-search">
          <i className="fa fa-search sb-search-icon" />
          <input
            type="text"
            className="sb-search-input"
            placeholder="Search menus..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoComplete="off"
          />
          {searchTerm && (
            <button className="sb-search-clear" onClick={() => setSearchTerm("")}>
              ×
            </button>
          )}
        </div>
      )}

      {/* ── Navigation ── */}
      <nav className="sb-nav">
        {loading ? (
          <p className="sb-msg">Loading…</p>
        ) : error ? (
          <p className="sb-msg sb-err">{error}</p>
        ) : filteredGroups.length === 0 ? (
          <p className="sb-msg">No menus found</p>
        ) : (
          filteredGroups.map((group) => (
            <div key={group.groupId} className="sb-group">

              {/* Group header — always clickable */}
              <button
                className={`sb-group-hd ${expandedGroups[group.groupId] ? "sb-group-hd--open" : ""}`}
                onClick={() => toggleGroup(group.groupId)}
                title={group.groupName}
              >
                <i className={`fa ${group.icon} sb-grp-icon`} />
                {isHovered && (
                  <>
                    <span className="sb-grp-label">{group.groupName}</span>
                    <i className={`fa fa-chevron-down sb-grp-arrow ${expandedGroups[group.groupId] ? "sb-grp-arrow--open" : ""}`} />
                  </>
                )}
              </button>

              {/* Sub-items — only when sidebar is hovered AND group is expanded */}
              {isHovered && expandedGroups[group.groupId] && (
                <ul className="sb-items">
                  {group.menus.map((menu) => (
                    <li key={menu.mnuno} className="sb-item">
                      <button
                        className="sb-item-btn"
                        onClick={() => handleNavigate(menu)}
                        title={`${menu.mnuname}`}
                      >
                        <span className="sb-dot" />
                        <span className="sb-item-label">{menu.mnuname}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </nav>

      {/* ── Footer ── */}
      <div className="sb-footer">
        <button className="sb-logout" onClick={handleLogout} title="Logout">
          <i className="fa fa-sign-out sb-grp-icon" />
          {isHovered && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
