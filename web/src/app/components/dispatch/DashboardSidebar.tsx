import React, { useState, useEffect } from "react";
import {
  IconLayoutDashboard, IconChartBar, IconRss,
  IconFolder, IconPlus,
  IconMicrophone, IconPlug, IconTerminal2,
  IconChevronLeft, IconChevronRight,
  IconCircle,
} from "@tabler/icons-react";
import { Logo } from "./Logo";
import { listProjects, type Project } from "../../api";

// ─── Types ──────────────────────────────────────────────────────────────────

type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

// ─── Data ───────────────────────────────────────────────────────────────────

const WORKSPACE_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", icon: IconLayoutDashboard },
  { id: "analytics", label: "Analytics", icon: IconChartBar },
  { id: "feed", label: "Feed", icon: IconRss },
];

const SETTINGS_ITEMS: NavItem[] = [
  { id: "voice-profile", label: "Voice Profile", icon: IconMicrophone },
  { id: "integrations", label: "Integrations", icon: IconPlug },
  { id: "cli-api", label: "CLI & API", icon: IconTerminal2 },
];

// ─── Boring Avatar ──────────────────────────────────────────────────────────

function BoringAvatar({ name, size = 18 }: { name: string; size?: number }) {
  const colors = [
    "#E8593C", "#F59E0B", "#22C55E", "#6366F1",
    "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16",
  ];
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const color = colors[hash % colors.length];
  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 4,
        backgroundColor: color + "20",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color: color,
        fontSize: size * 0.5,
        fontWeight: 600,
        fontFamily: "'IBM Plex Mono', monospace",
        lineHeight: 1,
      }}
    >
      {initial}
    </div>
  );
}

// ─── NavItem Component ──────────────────────────────────────────────────────

function SidebarNavItem({
  item,
  active,
  collapsed,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  const Icon = item.icon;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: collapsed ? 0 : 10,
        width: "100%",
        padding: collapsed ? "8px 0" : "7px 0",
        paddingLeft: collapsed ? 0 : 12,
        border: "none",
        borderLeft: active
          ? "2px solid #E8593C"
          : "2px solid transparent",
        background: active
          ? "rgba(232,89,60,0.08)"
          : hov
          ? "rgba(255,255,255,0.03)"
          : "transparent",
        borderRadius: 0,
        cursor: "pointer",
        transition: "all 0.12s ease",
        justifyContent: collapsed ? "center" : "flex-start",
        textDecoration: "none",
        color: active
          ? "#E6EDF3"
          : hov
          ? "#E6EDF3"
          : "#8B949E",
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        fontSize: 13,
        fontWeight: active ? 500 : 400,
        outline: "none",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: collapsed ? 20 : 18,
          height: collapsed ? 20 : 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon
          size={collapsed ? 18 : 16}
          stroke={active ? 2 : 1.5}
          color={active ? "#E8593C" : "currentColor"}
        />
      </div>
      {!collapsed && <span>{item.label}</span>}
    </button>
  );
}

// ─── Project Item ───────────────────────────────────────────────────────────

function ProjectItem({
  project,
  active,
  collapsed,
  onClick,
}: {
  project: Project;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  const [hov, setHov] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: collapsed ? 0 : 10,
        width: "100%",
        padding: collapsed ? "6px 0" : "5px 0",
        paddingLeft: collapsed ? 0 : 12,
        border: "none",
        borderLeft: active
          ? "2px solid #E8593C"
          : "2px solid transparent",
        background: active
          ? "rgba(232,89,60,0.08)"
          : hov
          ? "rgba(255,255,255,0.03)"
          : "transparent",
        borderRadius: 0,
        cursor: "pointer",
        transition: "all 0.12s ease",
        justifyContent: collapsed ? "center" : "flex-start",
        outline: "none",
        boxSizing: "border-box",
      }}
    >
      <BoringAvatar name={project.name} size={collapsed ? 20 : 16} />
      {!collapsed && (
        <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
          <div
            style={{
              fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
              fontSize: 13,
              color: active ? "#E6EDF3" : hov ? "#E6EDF3" : "#8B949E",
              fontWeight: active ? 500 : 400,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              transition: "color 0.12s ease",
            }}
          >
            {project.name}
          </div>
        </div>
      )}
    </button>
  );
}

// ─── Section Label ──────────────────────────────────────────────────────────

function SectionLabel({
  label,
  collapsed,
}: {
  label: string;
  collapsed: boolean;
}) {
  if (collapsed) return null;
  return (
    <div
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 9,
        color: "#484F58",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        padding: "16px 14px 6px 14px",
        userSelect: "none",
      }}
    >
      {label}
    </div>
  );
}

// ─── Sidebar Divider ────────────────────────────────────────────────────────

function SidebarDivider({ collapsed }: { collapsed: boolean }) {
  if (collapsed) return <div style={{ height: 1, backgroundColor: "#21262D", margin: "4px 0" }} />;
  return <div style={{ height: 1, backgroundColor: "#21262D", margin: "4px 14px" }} />;
}

// ─── Collapse Toggle ────────────────────────────────────────────────────────

function CollapseToggle({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onToggle}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        padding: "10px 0",
        border: "none",
        borderTop: "1px solid #21262D",
        background: "transparent",
        cursor: "pointer",
        color: hov ? "#E6EDF3" : "#484F58",
        transition: "color 0.12s ease",
        marginTop: "auto",
        outline: "none",
      }}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {collapsed ? (
        <IconChevronRight size={16} stroke={1.5} />
      ) : (
        <IconChevronLeft size={16} stroke={1.5} />
      )}
    </button>
  );
}

// ─── Main Sidebar Component ─────────────────────────────────────────────────

interface DashboardSidebarProps {
  activeItem: string;
  onNavigate: (itemId: string) => void;
}

export function DashboardSidebar({ activeItem, onNavigate }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    listProjects()
      .then(setProjects)
      .catch(() => {});
  }, []);

  const sidebarWidth = collapsed ? 56 : 240;

  return (
    <div
      style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        height: "100vh",
        backgroundColor: "#0D1117",
        borderRight: "1px solid #21262D",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.2s ease, min-width 0.2s ease",
        overflow: "hidden",
        position: "sticky",
        top: 0,
        flexShrink: 0,
      }}
    >
      {/* ── Workspace Header ──────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: collapsed ? 0 : 8,
          padding: collapsed ? "16px 0" : "16px 14px",
          justifyContent: collapsed ? "center" : "flex-start",
          borderBottom: "1px solid #21262D",
        }}
      >
        <div style={{ flexShrink: 0 }}>
          <Logo size={collapsed ? 20 : 22} dark={true} />
        </div>
        {!collapsed && (
          <>
            <span
              style={{
                fontFamily: "'DM Mono', 'IBM Plex Mono', monospace",
                fontSize: 15,
                fontWeight: 500,
                color: "#E6EDF3",
                letterSpacing: "-0.02em",
              }}
            >
              byline
            </span>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 8,
                color: "#3FB950",
                padding: "2px 6px",
                borderRadius: 3,
                border: "0.5px solid rgba(63,185,80,0.3)",
                backgroundColor: "rgba(63,185,80,0.08)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                lineHeight: "12px",
              }}
            >
              self-hosted
            </span>
          </>
        )}
      </div>

      {/* ── Navigation ────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Workspace group */}
        <SectionLabel label="Workspace" collapsed={collapsed} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          {WORKSPACE_ITEMS.map((item) => (
            <SidebarNavItem
              key={item.id}
              item={item}
              active={activeItem === item.id}
              collapsed={collapsed}
              onClick={() => onNavigate(item.id)}
            />
          ))}
        </div>

        <SidebarDivider collapsed={collapsed} />

        {/* Projects group */}
        <SectionLabel label="Projects" collapsed={collapsed} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          {projects.slice(0, collapsed ? 3 : undefined).map((project) => (
            <ProjectItem
              key={project.id}
              project={project}
              active={activeItem === project.id}
              collapsed={collapsed}
              onClick={() => onNavigate(project.id)}
            />
          ))}
        </div>

        {/* Add project */}
        <div style={{ padding: collapsed ? "6px 0" : "2px 14px" }}>
          <button
            onClick={() => onNavigate("add-project")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: collapsed ? 0 : 8,
              width: "100%",
              padding: collapsed ? "6px 0" : "6px 0",
              paddingLeft: collapsed ? 0 : 12,
              border: "none",
              borderLeft: "2px solid transparent",
              background: "transparent",
              cursor: "pointer",
              justifyContent: collapsed ? "center" : "flex-start",
              color: "#8B949E",
              fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
              fontSize: 13,
              transition: "color 0.12s ease",
              outline: "none",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#E6EDF3")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8B949E")}
          >
            <div
              style={{
                width: collapsed ? 20 : 16,
                height: collapsed ? 20 : 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IconPlus size={collapsed ? 18 : 14} stroke={1.5} />
            </div>
            {!collapsed && <span>Add Project</span>}
          </button>
        </div>

        <SidebarDivider collapsed={collapsed} />

        {/* Settings group */}
        <SectionLabel label="Settings" collapsed={collapsed} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          {SETTINGS_ITEMS.map((item) => (
            <SidebarNavItem
              key={item.id}
              item={item}
              active={activeItem === item.id}
              collapsed={collapsed}
              onClick={() => onNavigate(item.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Collapse Toggle ───────────────────────────────────────────── */}
      <CollapseToggle
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
      />
    </div>
  );
}
