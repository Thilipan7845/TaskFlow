import { CheckSquare } from "lucide-react";

function IntroScreen() {
  return (
    <div className="intro-screen">
      <div className="intro-content">
        <div className="intro-logo">
          <CheckSquare size={64} />
        </div>

        <h1>TaskFlow</h1>

        <p>INITIALIZING YOUR PRODUCTIVITY SPACE</p>

        <div className="loading-container">
          <div className="loading-bar"></div>
        </div>

        <span className="loading-text">LOADING...</span>
      </div>
    </div>
  );
}

export default IntroScreen;