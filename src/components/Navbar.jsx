import { Link } from "react-router-dom";
import { CheckSquare } from "lucide-react";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <CheckSquare size={28} />
        <span>TaskFlow</span>
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>

        <Link to="/login">Login</Link>

        <Link to="/signup" className="get-started-btn">
          Get Started
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;