
import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Eye,
  EyeOff,
  HeartPulse,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import "./index.css";
import Dashboard from "./components/Dashboard";
import ChatAssistant from "./components/ChatAssistant";

export default function App() {
  const [page, setPage] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
    setMessage("");
  }

  
async function handleSubmit(event) {
  event.preventDefault();
  setMessage("");

  if (page === "register" && form.password !== form.confirmPassword) {
    setMessage("Passwords do not match.");
    return;
  }

  try {
    const endpoint =
      page === "login"
        ? "http://127.0.0.1:8000/api/v1/auth/login"
        : "http://127.0.0.1:8000/api/v1/auth/register";

    const payload =
      page === "login"
        ? {
            email: form.email,
            password: form.password,
          }
        : {
            full_name: form.name,
            email: form.email,
            password: form.password,
          };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(
        typeof data.detail === "string"
          ? data.detail
          : "Request failed. Please check your details and try again."
      );
      return;
    }
  
if (page === "login") {
  setCurrentUser(data.user);
  setAccessToken(data.access_token);
  setMessage("");
  return;
} else {
  setMessage("Account created successfully! You can now sign in.");

  setForm((previous) => ({
    ...previous,
    password: "",
    confirmPassword: "",
  }));

  setPage("login");
}

  
  } catch {
    setMessage(
      "Could not connect to the server. Please check that the backend is running."
    );
  }
}

  
  function switchPage(nextPage) {
    setPage(nextPage);
    setMessage("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  }

  // Show the AI chat screen
  if (currentUser && page === "chat") {
    return (
      <ChatAssistant
        onBack={() => setPage("dashboard")}
      />
    );
  }

  // Show the dashboard after login
  if (currentUser) {
    return (
      <Dashboard
        user={currentUser}
        onOpenChat={() => setPage("chat")}
        onLogout={() => {
          setCurrentUser(null);
          setAccessToken(null);
          setForm({
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
          });
          setPage("login");
          setMessage("");
        }}
      />
    );
  }

  return (
    <main className="auth-layout">
      <section className="brand-panel">
        <div className="brand-header">
          <div className="brand-logo">
            <HeartPulse size={27} />
          </div>
          <span>MediConnect <strong>AI</strong></span>
        </div>

        <div className="brand-content">
          <div className="brand-tag">
            <Activity size={15} />
            HEALTHCARE, MADE UNDERSTANDABLE
          </div>

          <h1>
            Better health
            <br />
            begins with
            <br />
            <span>understanding.</span>
          </h1>

          <p className="brand-description">
            Your personal healthcare information companion.
            Get clear explanations and multilingual support
            to help you make more informed health decisions.
          </p>

          <div className="benefit-list">
            <div>
              <span className="benefit-icon"><HeartPulse size={19} /></span>
              <span>
                <strong>Healthcare guidance</strong>
                <small>Understand health information more easily.</small>
              </span>
            </div>

            <div>
              <span className="benefit-icon"><Activity size={19} /></span>
              <span>
                <strong>Language support</strong>
                <small>Designed for diverse communities.</small>
              </span>
            </div>

            <div>
              <span className="benefit-icon"><ShieldCheck size={19} /></span>
              <span>
                <strong>Privacy-conscious design</strong>
                <small>Your account deserves careful protection.</small>
              </span>
            </div>
          </div>
        </div>

        <div className="brand-footer">
          <HeartPulse size={15} />
          <span>Accessible healthcare information for everyone</span>
        </div>
      </section>

      <section className="form-panel">
        <div className="mobile-brand">
          <div className="brand-logo"><HeartPulse size={24} /></div>
          <span>MediConnect <strong>AI</strong></span>
        </div>

        <div className="auth-card">
          <div className="form-heading">
            <div className="form-icon">
              {page === "login" ? (
                <LockKeyhole size={23} />
              ) : (
                <UserRound size={23} />
              )}
            </div>

            <p className="form-eyebrow">
              {page === "login" ? "WELCOME BACK" : "GET STARTED"}
            </p>

            <h2>
              {page === "login" ? "Welcome back" : "Create your account"}
            </h2>

            <p className="form-subtitle">
              {page === "login"
                ? "Sign in to continue to your health space."
                : "Join us for more accessible healthcare information."}
            </p>
          </div>

          <div className="auth-tabs">
            <button
              type="button"
              className={page === "login" ? "tab-active" : ""}
              onClick={() => switchPage("login")}
            >
              Sign in
            </button>

            <button
              type="button"
              className={page === "register" ? "tab-active" : ""}
              onClick={() => switchPage("register")}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {page === "register" && (
              <div className="field-group">
                <label htmlFor="name">Full name</label>
                <div className="input-wrap">
                  <UserRound size={18} />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={updateField}
                    required
                    minLength={2}
                    maxLength={100}
                  />
                </div>
              </div>
            )}

            <div className="field-group">
              <label htmlFor="email">Email address</label>
              <div className="input-wrap">
                <Mail size={18} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={updateField}
                  required
                />
              </div>
            </div>

            <div className="field-group">
              <div className="label-row">
                <label htmlFor="password">Password</label>
                {page === "login" && (
                  <button
                    className="text-button"
                    type="button"
                    onClick={() =>
                      setMessage("Password recovery will be added later.")
                    }
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              <div className="input-wrap">
                <LockKeyhole size={18} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    page === "login" ? "current-password" : "new-password"
                  }
                  placeholder={
                    page === "register"
                      ? "Create a strong password"
                      : "Enter your password"
                  }
                  value={form.password}
                  onChange={updateField}
                  required
                  minLength={8}
                  maxLength={128}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {page === "register" && (
                <small className="field-hint">
                  Use at least 8 characters.
                </small>
              )}
            </div>

            {page === "register" && (
              <div className="field-group">
                <label htmlFor="confirmPassword">Confirm password</label>
                <div className="input-wrap">
                  <LockKeyhole size={18} />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Enter your password again"
                    value={form.confirmPassword}
                    onChange={updateField}
                    required
                    minLength={8}
                    maxLength={128}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {page === "register" && (
              <label className="terms-row">
                <input type="checkbox" required />
                <span>
                  I agree to the platform's terms and privacy policy.
                </span>
              </label>
            )}

            {message && (
              <div className="form-message" role="status">
                {message}
              </div>
            )}

            <button className="submit-button" type="submit">
              {page === "login" ? "Sign in to your account" : "Create account"}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="form-divider">
            <span>YOUR HEALTH, YOUR JOURNEY</span>
          </div>

          <div className="security-note">
            <ShieldCheck size={18} />
            <span>
              Your health information should always be handled with care.
            </span>
          </div>

          <p className="switch-text">
            {page === "login"
              ? "New to MediConnect AI?"
              : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() =>
                switchPage(page === "login" ? "register" : "login")
              }
            >
              {page === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>

        <footer className="form-footer">
          © 2026 MediConnect AI · Healthcare information support
        </footer>
      </section>
    </main>
  );
}

