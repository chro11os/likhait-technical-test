import React, { useRef, useCallback } from "react";
import { COLORS } from "../constants/colors";

interface SidebarProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
  width?: number;
  onWidthChange?: (width: number) => void;
}

const MIN_WIDTH = 72;
const MAX_WIDTH = 420;
const COLLAPSE_THRESHOLD = 180;

const Sidebar: React.FC<SidebarProps> = ({
  onNavigate,
  currentPage = "history",
  width = 280,
  onWidthChange,
}) => {
  const isDragging = useRef(false);
  const isCollapsed = width < COLLAPSE_THRESHOLD;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isDragging.current) return;
        const newWidth = Math.min(
          Math.max(moveEvent.clientX, MIN_WIDTH),
          MAX_WIDTH,
        );
        onWidthChange?.(newWidth);
      };

      const handleMouseUp = () => {
        isDragging.current = false;
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [onWidthChange],
  );

  const handleToggle = () => {
    if (onWidthChange) {
      onWidthChange(isCollapsed ? 280 : MIN_WIDTH);
    }
  };

  const sidebarStyle: React.CSSProperties = {
    width: `${width}px`,
    height: "100vh",
    background: `linear-gradient(180deg, ${COLORS.primary.p01} 0%, ${COLORS.primary.p02} 100%)`,
    display: "flex",
    flexDirection: "column",
    borderRight: `1px solid ${COLORS.secondary.s04}`,
    position: "fixed",
    left: 0,
    top: 0,
    zIndex: 20,
    boxSizing: "border-box",
  };

  const headerStyle: React.CSSProperties = {
    padding: isCollapsed ? "24px 12px" : "24px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: isCollapsed ? "center" : "space-between",
    borderBottom: `1px solid ${COLORS.secondary.s04}`,
  };

  const logoStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    overflow: "hidden",
  };

  const logoIconStyle: React.CSSProperties = {
    width: "44px",
    height: "44px",
    minWidth: "44px",
    background: COLORS.primary.p07,
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "bold",
    color: "white",
  };

  const logoTextStyle: React.CSSProperties = {
    display: isCollapsed ? "none" : "flex",
    flexDirection: "column",
    overflow: "hidden",
    whiteSpace: "nowrap",
  };

  const logoTitleStyle: React.CSSProperties = {
    fontSize: "20px",
    fontWeight: 700,
    color: COLORS.primary.p09,
    lineHeight: 1.2,
  };

  const toggleButtonStyle: React.CSSProperties = {
    width: "36px",
    height: "36px",
    background: "transparent",
    border: "none",
    borderRadius: "8px",
    display: isCollapsed ? "none" : "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.2s",
    flexShrink: 0,
  };

  const navStyle: React.CSSProperties = {
    flex: 1,
    padding: "16px 0",
  };

  const navItemStyle: React.CSSProperties = {
    width: "100%",
    padding: isCollapsed ? "16px" : "14px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: isCollapsed ? "center" : "flex-start",
    gap: "14px",
    background: currentPage === "history" ? COLORS.primary.p03 : "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: 500,
    color: COLORS.primary.p09,
    textAlign: "left",
    transition: "background 0.2s",
    overflow: "hidden",
    whiteSpace: "nowrap",
  };

  const navTextStyle: React.CSSProperties = {
    display: isCollapsed ? "none" : "inline",
  };

  const resizerStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    right: -4,
    width: "8px",
    height: "100%",
    cursor: "col-resize",
    zIndex: 30,
  };

  return (
    <aside style={sidebarStyle}>
      <div style={headerStyle}>
        <div style={logoStyle}>
          <span style={logoIconStyle}>$</span>
          <div style={logoTextStyle}>
            <div style={logoTitleStyle}>Expense Tracker</div>
          </div>
        </div>
        <button
          style={toggleButtonStyle}
          aria-label="Toggle sidebar"
          onClick={handleToggle}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#464343"
            strokeWidth="2"
            style={{
              transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>

      <nav style={navStyle}>
        <button
          style={navItemStyle}
          onClick={() => onNavigate?.("history")}
          title={isCollapsed ? "History" : undefined}
          onMouseEnter={(e) => {
            if (currentPage !== "history") {
              e.currentTarget.style.background = COLORS.primary.p02;
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== "history") {
              e.currentTarget.style.background = "transparent";
            }
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ flexShrink: 0 }}
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span style={navTextStyle}>History</span>
        </button>
      </nav>

      <div
        style={resizerStyle}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleToggle}
        title="Drag to resize sidebar"
      />
    </aside>
  );
};

export default Sidebar;
