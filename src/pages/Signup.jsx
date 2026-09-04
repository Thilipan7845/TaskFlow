import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckSquare,
} from "lucide-react";

import { supabase } from "../lib/supabase";

function Signup() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSignup(event) {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");

    // Validation
    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!password.trim()) {
      setErrorMessage("Please create a password.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (!acceptedTerms) {
      setErrorMessage(
        "Please accept the Terms and Privacy Policy."
      );
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setMessage(
        "Account created successfully! Please check your email to verify your account."
      );

      setTimeout(() => {
        navigate("/login");
      }, 3000);
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

      <div className="auth-container signup-container">

        {/* Left Side */}
        <section className="auth-info signup-info">
          <Link to="/" className="auth-logo">
            <CheckSquare size={32} />
            <span>TaskFlow</span>
          </Link>

          <div className="auth-info-content">
            <div className="auth-badge">
              ✦ START YOUR PRODUCTIVITY JOURNEY
            </div>

            <h1>
              Build a better
              <span> flow today.</span>
            </h1>

            <p>
              Create your TaskFlow account and start organizing your work,
              managing your priorities, and tracking your progress.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature">
                <span>✦</span>
                Create and manage unlimited tasks
              </div>

              <div className="auth-feature">
                <span>✦</span>
                Track progress in real time
              </div>

              <div className="auth-feature">
                <span>✦</span>
                Build better productivity habits
              </div>
            </div>
          </div>
        </section>

        {/* Right Side */}
        <section className="auth-card">

          <div className="auth-card-header">
            <p className="auth-small-text">
              CREATE ACCOUNT
            </p>

            <h2>Start your TaskFlow</h2>

            <p>
              Create your account and take control of your daily tasks.
            </p>
          </div>

          {/* Success Message */}
          {message && (
            <p className="auth-success-message">
              {message}
            </p>
          )}

          {/* Error Message */}
          {errorMessage && (
            <p className="auth-error-message">
              {errorMessage}
            </p>
          )}

          <form onSubmit={handleSignup}>

            {/* Full Name */}
            <div className="form-group">
              <label>Full Name</label>

              <div className="input-wrapper">
                <User size={19} />

                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(event.target.value)
                  }
                />
              </div>
            </div>

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
              <label>Password</label>

              <div className="input-wrapper">
                <Lock size={19} />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
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

            {/* Terms */}
            <label className="terms-checkbox">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) =>
                  setAcceptedTerms(
                    event.target.checked
                  )
                }
              />

              <span>
                I agree to the Terms and Privacy Policy
              </span>
            </label>

            {/* Signup Button */}
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}

              {!loading && (
                <ArrowRight size={19} />
              )}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?
            <Link to="/login">
              {" "}Sign in
            </Link>
          </p>

        </section>
      </div>
    </main>
  );
}

export default Signup;