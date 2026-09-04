import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckSquare,
} from "lucide-react";

import { supabase } from "../lib/supabase";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(event) {
    event.preventDefault();

    setErrorMessage("");

    // Basic validation
    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!password.trim()) {
      setErrorMessage("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const { error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      // Login successful → Dashboard
      navigate("/dashboard");
    } catch {
      setErrorMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-background-glow glow-one"></div>
      <div className="auth-background-glow glow-two"></div>

      <div className="auth-container">

        {/* Left Side */}
        <section className="auth-info">
          <Link to="/" className="auth-logo">
            <CheckSquare size={32} />
            <span>TaskFlow</span>
          </Link>

          <div className="auth-info-content">
            <div className="auth-badge">
              ✦ YOUR PRODUCTIVITY SPACE
            </div>

            <h1>
              Welcome back to
              <span> your flow.</span>
            </h1>

            <p>
              Continue organizing your work, tracking your progress,
              and turning your goals into completed tasks.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature">
                <span>✦</span>
                Organize everything in one place
              </div>

              <div className="auth-feature">
                <span>✦</span>
                Track your daily progress
              </div>

              <div className="auth-feature">
                <span>✦</span>
                Stay focused on what matters
              </div>
            </div>
          </div>
        </section>

        {/* Right Side - Login Card */}
        <section className="auth-card">

          <div className="auth-card-header">
            <p className="auth-small-text">
              WELCOME BACK
            </p>

            <h2>Sign in to TaskFlow</h2>

            <p>
              Enter your details to continue your productivity journey.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <p className="auth-error-message">
              {errorMessage}
            </p>
          )}

          <form onSubmit={handleLogin}>

            {/* Email */}
            <div className="form-group">
              <label>Email Address</label>

              <div className="input-wrapper">
                <Mail size={19} />

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">

              <div className="password-label">
                <label>Password</label>

                <button
                  type="button"
                  className="forgot-password"
                >
                  Forgot password?
                </button>
              </div>

              <div className="input-wrapper">
                <Lock size={19} />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Enter TaskFlow"}

              {!loading && (
                <ArrowRight size={19} />
              )}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?
            <Link to="/signup">
              {" "}Create one
            </Link>
          </p>

        </section>
      </div>
    </main>
  );
}

export default Login;