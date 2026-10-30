
import {
  Activity,
  ArrowRight,
  Globe2,
  HeartPulse,
  MessageCircle,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";

import "./Dashboard.css";

export default function Dashboard({ user, onLogout, onOpenChat }) {
  return (
    <main className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <span className="dashboard-brand-icon">
            <HeartPulse size={25} />
          </span>
          <span>MediConnect <strong>AI</strong></span>
        </div>

        <p className="sidebar-label">WORKSPACE</p>

        <button className="sidebar-link sidebar-link-active">
          <Activity size={19} />
          Dashboard
        </button>

        <button className="sidebar-link" onClick={onOpenChat}>
          <MessageCircle size={19} />
          AI Health Assistant
        </button>

        <div className="sidebar-bottom">
          <div className="sidebar-security">
            <ShieldCheck size={20} />
            <div>
              <strong>Your privacy matters</strong>
              <p>Use trusted healthcare sources.</p>
            </div>
          </div>

          <div className="sidebar-user">
            <span className="avatar">
              <UserRound size={20} />
            </span>
            <div className="sidebar-user-info">
              <strong>{user?.full_name || "User"}</strong>
              <small>{user?.email || ""}</small>
            </div>
            <button
              className="logout-button"
              onClick={onLogout}
              title="Sign out"
              aria-label="Sign out"
            >
              ↗
            </button>
          </div>
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <p className="dashboard-eyebrow">YOUR HEALTH SPACE</p>
            <h1>Dashboard</h1>
          </div>

          <div className="topbar-status">
            <span className="status-dot" />
            Your assistant is ready
          </div>
        </header>

        <section className="dashboard-welcome">
          <div className="welcome-copy">
            <span className="welcome-tag">
              <HeartPulse size={15} />
              YOUR PERSONAL HEALTH COMPANION
            </span>

            <h2>
              Welcome back, {user?.full_name?.split(" ")[0] || "there"}!
            </h2>

            <p>
              Understand health information more easily.
              Ask questions and explore healthcare guidance in your preferred
              language.
            </p>

            <button className="dashboard-primary-button" onClick={onOpenChat}>
              Talk to your AI assistant
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="welcome-illustration">
            <div className="illustration-circle">
              <Stethoscope size={74} strokeWidth={1.4} />
              <span className="illustration-heart">
                <HeartPulse size={31} />
              </span>
            </div>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <h2>Your health tools</h2>
              <p>Choose a service to get started.</p>
            </div>
          </div>

          <div className="dashboard-cards">
            <button className="dashboard-card" onClick={onOpenChat}>
              <span className="dashboard-card-icon teal-icon">
                <MessageCircle size={23} />
              </span>
              <h3>AI Health Assistant</h3>
              <p>
                Ask general health-information questions in simple language.
              </p>
              <span className="card-action">
                Start a conversation <ArrowRight size={16} />
              </span>
            </button>

            <button
              className="dashboard-card"
              onClick={() =>
                alert("Multilingual support will be connected in a later step.")
              }
            >
              <span className="dashboard-card-icon blue-icon">
                <Globe2 size={23} />
              </span>
              <h3>Language Support</h3>
              <p>
                Explore healthcare information in your preferred language.
              </p>
              <span className="card-action">
                Explore languages <ArrowRight size={16} />
              </span>
            </button>

            <button
              className="dashboard-card"
              onClick={() =>
                alert("Health resources will be added in a later step.")
              }
            >
              <span className="dashboard-card-icon purple-icon">
                <ShieldCheck size={23} />
              </span>
              <h3>Health Resources</h3>
              <p>
                Learn about health topics and when to seek professional care.
              </p>
              <span className="card-action">
                Explore resources <ArrowRight size={16} />
              </span>
            </button>
          </div>
        </section>

        <section className="dashboard-notice">
          <span className="notice-icon">
            <ShieldCheck size={22} />
          </span>
          <div>
            <strong>Healthcare information, with care</strong>
            <p>
              The AI assistant is intended to provide general information,
              not a diagnosis or a replacement for a qualified healthcare
              professional.
            </p>
          </div>
        </section>

        <footer className="dashboard-footer">
          <span>© 2026 MediConnect AI</span>
          <span>Accessible healthcare information for everyone</span>
        </footer>
      </section>
    </main>
  );
}


