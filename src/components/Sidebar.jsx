import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  ListTodo,
  Plus,
  BarChart3,
  CalendarDays,
  TrendingUp,
  CheckSquare,
  LogOut,
  Brain,
  GitBranch,
  Users,
  Mail,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabase";

function Sidebar({
  onClose,
  isMobileMenuOpen = false,
}) {
  const location = useLocation();

  const navigate =
    useNavigate();

  // =========================================
  // LOGOUT
  // =========================================

  async function handleLogout() {
    const {
      error,
    } =
      await supabase.auth.signOut();

    if (error) {
      alert(
        "Failed to logout: " +
          error.message
      );

      return;
    }

    navigate("/login");
  }

  // =========================================
  // ACTIVE LINK
  // =========================================

  function getLinkClass(path) {
    return location.pathname === path
      ? "sidebar-link active"
      : "sidebar-link";
  }

  return (
    <aside
      id="taskflow-navigation"
      className={`sidebar mobile-sidebar ${
        isMobileMenuOpen
          ? "mobile-sidebar-open"
          : ""
      }`}
    >

      {/* LOGO */}

      <Link
        to="/dashboard"
        className="sidebar-logo"
        onClick={onClose}
      >
        <CheckSquare size={28} />

        <span>
          TaskFlow
        </span>
      </Link>

      <button
        type="button"
        className="mobile-sidebar-close"
        onClick={onClose}
        aria-label="Close navigation menu"
      >
        <X size={20} />
      </button>

      {/* NAVIGATION */}

      <nav
        className="sidebar-nav"
        onClick={onClose}
      >

        {/* DASHBOARD */}

        <Link
          to="/dashboard"
          className={getLinkClass(
            "/dashboard"
          )}
        >
          <LayoutDashboard size={20} />

          <span>
            Dashboard
          </span>
        </Link>

        {/* MY TASKS */}

        <Link
          to="/dashboard/tasks"
          className={getLinkClass(
            "/dashboard/tasks"
          )}
        >
          <ListTodo size={20} />

          <span>
            My Tasks
          </span>
        </Link>

        {/* ADD TASK */}

        <Link
          to="/dashboard/add-task"
          className={getLinkClass(
            "/dashboard/add-task"
          )}
        >
          <Plus size={20} />

          <span>
            Add Task
          </span>
        </Link>

        {/* AI ASSISTANT */}

        <Link
          to="/dashboard/ai-assistant"
          className={getLinkClass(
            "/dashboard/ai-assistant"
          )}
        >
          <Brain size={20} />

          <span>
            AI Assistant
          </span>
        </Link>

        {/* DEPENDENCIES */}

        <Link
          to="/dashboard/dependencies"
          className={getLinkClass(
            "/dashboard/dependencies"
          )}
        >
          <GitBranch size={20} />

          <span>
            Dependencies
          </span>
        </Link>

        {/* COLLABORATION */}

        <Link
          to="/dashboard/collaboration"
          className={getLinkClass(
            "/dashboard/collaboration"
          )}
        >
          <Users size={20} />

          <span>
            Collaboration
          </span>
        </Link>

        {/* INVITATIONS */}

        <Link
          to="/dashboard/invitations"
          className={getLinkClass(
            "/dashboard/invitations"
          )}
        >
          <Mail size={20} />

          <span>
            Invitations
          </span>
        </Link>

        {/* PRODUCTIVITY */}

        <Link
          to="/dashboard/productivity"
          className={getLinkClass(
            "/dashboard/productivity"
          )}
        >
          <BarChart3 size={20} />

          <span>
            Productivity
          </span>
        </Link>

        {/* PLANNER */}

        <Link
          to="/dashboard/planner"
          className={getLinkClass(
            "/dashboard/planner"
          )}
        >
          <CalendarDays size={20} />

          <span>
            Planner
          </span>
        </Link>

        {/* PERFORMANCE */}

        <Link
          to="/dashboard/performance"
          className={getLinkClass(
            "/dashboard/performance"
          )}
        >
          <TrendingUp size={20} />

          <span>
            Performance
          </span>
        </Link>

      </nav>

      {/* LOGOUT */}

      <div className="sidebar-bottom">

        <button
          type="button"
          className="sidebar-link logout-link"
          onClick={
            handleLogout
          }
        >
          <LogOut size={20} />

          <span>
            Logout
          </span>
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;