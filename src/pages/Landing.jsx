import { Link } from "react-router-dom";
import {
  ArrowRight,
  Play,
  CheckCircle2,
  Clock3,
  Zap,
} from "lucide-react";

import Navbar from "../components/Navbar";

function Landing() {
  return (
    <>
      <Navbar />

      <main className="hero">
        <section className="hero-left">
          <div className="hero-badge">
            ✦ Your productivity, redesigned
          </div>

          <h1>
            Make every task
            <br />
            <span>flow effortlessly.</span>
          </h1>

          <p className="hero-description">
            TaskFlow is your modern productivity space to organize tasks,
            track progress, and stay focused on what matters most.
          </p>

          <div className="hero-actions">
            <Link to="/signup" className="primary-btn">
              Start your flow
              <ArrowRight size={18} />
            </Link>

            <Link to="/login" className="secondary-btn">
              <Play size={16} />
              Explore TaskFlow
            </Link>
          </div>
        </section>

        <section className="hero-right">
          <div className="dashboard-preview">
            <div className="preview-top">
              <div className="preview-title">Today&apos;s Flow</div>

              <div className="live-indicator">
                <span className="live-dot"></span>
                LIVE
              </div>
            </div>

            <div className="preview-stats">
              <div className="preview-stat">
                <span>Total</span>
                <strong>12</strong>
              </div>

              <div className="preview-stat">
                <span>Active</span>
                <strong>05</strong>
              </div>

              <div className="preview-stat">
                <span>Done</span>
                <strong>07</strong>
              </div>
            </div>

            <div className="preview-task">
              <div className="task-icon">
                <Zap size={19} />
              </div>

              <div className="task-info">
                <h4>Build TaskFlow</h4>
                <p>High priority · Today</p>
              </div>

              <span className="task-status status-active"></span>
            </div>

            <div className="preview-task">
              <div className="task-icon">
                <Clock3 size={19} />
              </div>

              <div className="task-info">
                <h4>Learn React</h4>
                <p>In progress · 2h left</p>
              </div>

              <span className="task-status status-progress"></span>
            </div>

            <div className="preview-task">
              <div className="task-icon">
                <CheckCircle2 size={19} />
              </div>

              <div className="task-info">
                <h4>Project Planning</h4>
                <p>Completed today</p>
              </div>

              <span className="task-status status-done"></span>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default Landing;