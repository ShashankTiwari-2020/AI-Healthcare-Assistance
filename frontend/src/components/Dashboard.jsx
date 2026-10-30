
import { useMemo, useState } from "react";

import {
  Activity,
  ArrowRight,
  Check,
  ChevronDown,
  Globe2,
  HeartPulse,
  MessageCircle,
  Search,
  ShieldCheck,
  Stethoscope,
  UserRound,
  X,
  BookOpen,
  AlertCircle,
  Heart,
  Apple,
  Brain,
  Pill,
} from "lucide-react";

import "./Dashboard.css";

const languages = [
  { name: "English", native: "English", code: "en" },
  { name: "Hindi", native: "हिन्दी", code: "hi" },
  { name: "Bengali", native: "বাংলা", code: "bn" },
  { name: "Tamil", native: "தமிழ்", code: "ta" },
  { name: "Telugu", native: "తెలుగు", code: "te" },
  { name: "Marathi", native: "मराठी", code: "mr" },
  { name: "Gujarati", native: "ગુજરાતી", code: "gu" },
  { name: "Kannada", native: "ಕನ್ನಡ", code: "kn" },
  { name: "Malayalam", native: "മലയാളം", code: "ml" },
  { name: "Punjabi", native: "ਪੰਜਾਬੀ", code: "pa" },
];

const resources = [
  {
    id: 1,
    category: "General Health",
    title: "Understanding regular health checkups",
    description:
      "Learn why routine health checkups can help monitor your general health and identify concerns early.",
    points: [
      "Discuss your health history with a qualified healthcare professional.",
      "Ask which screenings are appropriate for your age and circumstances.",
      "Keep a record of test results and follow-up appointments.",
    ],
  },
  {
    id: 2,
    category: "Nutrition",
    title: "Healthy eating habits",
    description:
      "Explore general principles of balanced nutrition and everyday food choices.",
    points: [
      "Include a variety of fruits and vegetables.",
      "Choose different sources of protein and whole grains.",
      "Drink enough water throughout the day.",
    ],
  },
  {
    id: 3,
    category: "Mental Health",
    title: "Taking care of mental well-being",
    description:
      "Understand some everyday practices that may support emotional well-being.",
    points: [
      "Maintain a regular sleep routine.",
      "Make time for activities you enjoy.",
      "Reach out to a trusted person or mental health professional when needed.",
    ],
  },
  {
    id: 4,
    category: "Medicines",
    title: "Understanding medication safety",
    description:
      "Learn general practices for using prescribed medicines safely.",
    points: [
      "Follow the instructions provided by your healthcare professional.",
      "Do not change your dose without professional advice.",
      "Tell your healthcare professional about other medicines you take.",
    ],
  },
  {
    id: 5,
    category: "Heart Health",
    title: "Understanding heart health",
    description:
      "Explore general information about maintaining cardiovascular health.",
    points: [
      "Discuss blood pressure and cholesterol monitoring with your clinician.",
      "Stay physically active according to your abilities.",
      "Seek medical advice about symptoms that concern you.",
    ],
  },
  {
    id: 6,
    category: "General Health",
    title: "When should you seek medical care?",
    description:
      "Understand why persistent, worsening, or concerning symptoms deserve professional attention.",
    points: [
      "Contact a healthcare professional about persistent or worsening symptoms.",
      "Do not rely on an AI assistant for diagnosis.",
      "Seek emergency services for severe or life-threatening symptoms.",
    ],
  },
];

const resourceCategories = [
  "All",
  "General Health",
  "Nutrition",
  "Mental Health",
  "Medicines",
  "Heart Health",
];

export default function Dashboard({ user, onLogout, onOpenChat }) {
  const [activeModal, setActiveModal] = useState(null);

  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem("mediconnect_language") || "English";
  });

  const [temporaryLanguage, setTemporaryLanguage] =
    useState(selectedLanguage);

  const [resourceSearch, setResourceSearch] = useState("");
  const [resourceCategory, setResourceCategory] = useState("All");
  const [expandedResource, setExpandedResource] = useState(null);

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesCategory =
        resourceCategory === "All" ||
        resource.category === resourceCategory;

      const searchText = resourceSearch.toLowerCase();

      const matchesSearch =
        resource.title.toLowerCase().includes(searchText) ||
        resource.description.toLowerCase().includes(searchText) ||
        resource.category.toLowerCase().includes(searchText);

      return matchesCategory && matchesSearch;
    });
  }, [resourceSearch, resourceCategory]);

  const openLanguageModal = () => {
    setTemporaryLanguage(selectedLanguage);
    setActiveModal("language");
  };

  const saveLanguage = () => {
    setSelectedLanguage(temporaryLanguage);
    localStorage.setItem("mediconnect_language", temporaryLanguage);
    setActiveModal(null);
  };

  const openResourcesModal = () => {
    setResourceSearch("");
    setResourceCategory("All");
    setExpandedResource(null);
    setActiveModal("resources");
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <main className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <span className="dashboard-brand-icon">
            <HeartPulse size={25} />
          </span>
          <span>
            MediConnect <strong>AI</strong>
          </span>
        </div>

        <p className="sidebar-label">WORKSPACE</p>

        <button className="sidebar-link sidebar-link-active" type="button">
          <Activity size={19} />
          Dashboard
        </button>

        <button
          className="sidebar-link"
          type="button"
          onClick={onOpenChat}
        >
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
              type="button"
              onClick={onLogout}
              title="Sign out"
              aria-label="Sign out"
            >
              ↗
            </button>
          </div>
        </div>
      </aside>

      {/* Main dashboard */}
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

        {/* Welcome banner */}
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
              Understand health information more easily. Ask questions and
              explore healthcare guidance in your preferred language.
            </p>

            <button
              className="dashboard-primary-button"
              type="button"
              onClick={onOpenChat}
            >
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

        {/* Health tools */}
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <h2>Your health tools</h2>
              <p>Choose a service to get started.</p>
            </div>
          </div>

          <div className="dashboard-cards">
            <button
              className="dashboard-card"
              type="button"
              onClick={onOpenChat}
            >
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
              type="button"
              onClick={openLanguageModal}
            >
              <span className="dashboard-card-icon blue-icon">
                <Globe2 size={23} />
              </span>

              <h3>Language Support</h3>

              <p>
                Current language: {selectedLanguage}. Choose your preferred
                language.
              </p>

              <span className="card-action">
                Explore languages <ArrowRight size={16} />
              </span>
            </button>

            <button
              className="dashboard-card"
              type="button"
              onClick={openResourcesModal}
            >
              <span className="dashboard-card-icon purple-icon">
                <ShieldCheck size={23} />
              </span>

              <h3>Health Resources</h3>

              <p>
                Explore general health topics and learn when to seek
                professional care.
              </p>

              <span className="card-action">
                Explore resources <ArrowRight size={16} />
              </span>
            </button>
          </div>
        </section>

        {/* Healthcare notice */}
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

      {/* Language selection modal */}
      {activeModal === "language" && (
        <div
          className="dashboard-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            className="dashboard-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="language-modal-title"
          >
            <div className="dashboard-modal-header">
              <span className="modal-heading-icon blue-icon">
                <Globe2 size={25} />
              </span>

              <button
                className="dashboard-modal-close"
                type="button"
                onClick={closeModal}
                aria-label="Close language selection"
              >
                <X size={20} />
              </button>
            </div>

            <h2 id="language-modal-title">Choose your language</h2>

            <p className="dashboard-modal-description">
              Select the language you prefer for your healthcare experience.
            </p>

            <div className="selected-language-note">
              <Check size={17} />
              Current language:
              <strong>{selectedLanguage}</strong>
            </div>

            <div className="language-grid">
              {languages.map((language) => (
                <button
                  key={language.code}
                  type="button"
                  className={`language-option ${
                    temporaryLanguage === language.name ? "selected" : ""
                  }`}
                  onClick={() => setTemporaryLanguage(language.name)}
                >
                  <span>
                    <strong>{language.name}</strong>
                    <small>{language.native}</small>
                  </span>

                  {temporaryLanguage === language.name && (
                    <Check size={19} />
                  )}
                </button>
              ))}
            </div>

            <div className="dashboard-modal-footer">
              <p>
                Your preference will be saved in this browser.
              </p>

              <button
                className="dashboard-primary-button"
                type="button"
                onClick={saveLanguage}
              >
                Save language
                <Check size={17} />
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Health resources modal */}
      {activeModal === "resources" && (
        <div
          className="dashboard-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            className="dashboard-modal resources-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="resources-modal-title"
          >
            <div className="dashboard-modal-header">
              <span className="modal-heading-icon purple-icon">
                <BookOpen size={25} />
              </span>

              <button
                className="dashboard-modal-close"
                type="button"
                onClick={closeModal}
                aria-label="Close health resources"
              >
                <X size={20} />
              </button>
            </div>

            <h2 id="resources-modal-title">Health Resource Library</h2>

            <p className="dashboard-modal-description">
              Explore simple educational information about everyday health
              topics.
            </p>

            <div className="resource-search">
              <Search size={19} />
              <input
                type="search"
                placeholder="Search health topics..."
                value={resourceSearch}
                onChange={(event) => setResourceSearch(event.target.value)}
              />
            </div>

            <div className="resource-categories">
              {resourceCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={
                    resourceCategory === category ? "active" : ""
                  }
                  onClick={() => {
                    setResourceCategory(category);
                    setExpandedResource(null);
                  }}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="resource-list">
              {filteredResources.length > 0 ? (
                filteredResources.map((resource) => (
                  <article className="resource-item" key={resource.id}>
                    <button
                      type="button"
                      className="resource-item-heading"
                      onClick={() =>
                        setExpandedResource(
                          expandedResource === resource.id
                            ? null
                            : resource.id
                        )
                      }
                      aria-expanded={expandedResource === resource.id}
                    >
                      <span>
                        <small>{resource.category}</small>
                        <strong>{resource.title}</strong>
                      </span>

                      <ChevronDown
                        size={19}
                        className={
                          expandedResource === resource.id ? "rotated" : ""
                        }
                      />
                    </button>

                    {expandedResource === resource.id && (
                      <div className="resource-item-content">
                        <p>{resource.description}</p>

                        <strong>Things to know:</strong>

                        <ul>
                          {resource.points.map((point, index) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </article>
                ))
              ) : (
                <div className="resource-empty">
                  <Search size={30} />
                  <strong>No resources found</strong>
                  <p>Try another search term or category.</p>
                </div>
              )}
            </div>

            <div className="resource-disclaimer">
              <AlertCircle size={20} />
              <p>
                These resources provide general educational information only.
                They are not a diagnosis or a substitute for advice from a
                qualified healthcare professional. For urgent symptoms, seek
                appropriate medical care.
              </p>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
