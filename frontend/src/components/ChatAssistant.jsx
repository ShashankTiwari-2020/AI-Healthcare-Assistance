import {  useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  HeartPulse,
  Send,
  Plus,
  Search,
  MessageCircle,
  FileText,
  Paperclip,
  Globe,
  ShieldPlus,
  Lightbulb,
  Languages,
  CalendarDays,
  ShieldCheck,
  X,
  LoaderCircle,
} from "lucide-react";
import "./ChatAssistant.css";
import Documents, { saveDocumentFile } from "./Documents";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const quickActions = [
  {
    label: "Explain Simply",
    icon: Lightbulb,
    prompt: "Explain this health information in simple language.",
  },
  {
    label: "Translate",
    icon: Languages,
    prompt: "Translate your response into my selected language.",
  },
  {
    label: "Medicine Timetable",
    icon: CalendarDays,
    prompt:
      "Help me organize my medicines according to my doctor's prescribed instructions.",
  },
  {
    label: "Precautions",
    icon: ShieldCheck,
    prompt: "What general precautions should I consider for this health concern?",
  },
  {
    label: "Summarize",
    icon: FileText,
    prompt: "Summarize this health information in clear bullet points.",
  },
];


const reportSections = [
  "Key Findings",
  "Test Results",
  "Questions to Ask Your Doctor",
  "Important Safety Information",
];

function renderReportSections(text) {
  const headingPattern =
    /^\s*(?:\*\*)?\s*\d*\.?\s*(Key Findings|Test Results|Questions to Ask Your Doctor|Important Safety Information)\s*:?\s*(?:\*\*)?\s*$/gim;

  const matches = [...text.matchAll(headingPattern)];

  if (matches.length === 0) {
    return <div className="mc-message-text">{text}</div>;
  }

  const sections = matches.map((match, index) => ({
    title: match[1],
    content: text
      .slice(
        match.index + match[0].length,
        matches[index + 1]?.index ?? text.length
      )
      .trim(),
  }));

  return (
    <div className="mc-report-card">
      <div className="mc-report-header">
        <FileText size={22} />
        <div>
          <h3>Medical Report Analysis</h3>
          <p>AI-assisted explanation of your uploaded document</p>
        </div>
      </div>

      {sections.map((section) => (
        <section className="mc-report-section" key={section.title}>
          <h4>{section.title}</h4>
          <div className="mc-report-section-content">
            {section.content}
          </div>
        </section>
      ))}
    </div>
  );
}


const languageNames = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
};

function createChat() {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: "New conversation",
    preview: "Ask a health question",
    messages: [],
  };
}

export default function ChatAssistant({ onBack }) {
  const [tab, setTab] = useState("chat");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("en");
  const [file, setFile] = useState(null);
  const [search, setSearch] = useState("");
const [chats, setChats] = useState(() => {
  try {
    const saved = localStorage.getItem("mediconnect_chats");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
});

const [activeChat, setActiveChat] = useState(
  () => localStorage.getItem("mediconnect_active_chat") || null
);
  

  const fileInputRef = useRef(null);

 
useEffect(() => {
  try {
    const savedChats = localStorage.getItem("mediconnect_chats");
    const parsedChats = savedChats ? JSON.parse(savedChats) : [];

    setChats(Array.isArray(parsedChats) ? parsedChats : []);

    const savedActiveChat = localStorage.getItem("mediconnect_active_chat");
    const selectedChat = Array.isArray(parsedChats)
      ? parsedChats.find((chat) => chat.id === savedActiveChat)
      : null;

    if (selectedChat) {
      setActiveChat(selectedChat.id);
      setMessages(Array.isArray(selectedChat.messages) ? selectedChat.messages : []);
    } else {
      setActiveChat(null);
      setMessages([]);
    }
  } catch (error) {
    console.error("Could not load local chat history:", error);
    setChats([]);
    setActiveChat(null);
    setMessages([]);
  }
}, []);


  function updateChatHistory(chatId, nextMessages) {
    setChats((previous) =>
      previous.map((chat) => {
        if (chat.id !== chatId) return chat;

        const firstUserMessage = nextMessages.find(
          (item) => item.role === "user"
        );

        return {
          ...chat,
          title:
  chat.title === "New conversation" && firstUserMessage
    ? (
  firstUserMessage.text
    .split("\n[Attached report:")[0]
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 32)
    .trim() || "New conversation"
)
    : chat.title,
          preview: nextMessages.length
            ? nextMessages[nextMessages.length - 1].text.slice(0, 65)
            : "Ask a health question",
          messages: nextMessages,
        };
      })
    );
  }

  function startNewChat() {
    if (loading) return;

    const newChat = createChat();

    setChats((previous) => [newChat, ...previous]);
    setActiveChat(newChat.id);
    setMessages([]);
    setMessage("");
    setFile(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function openChat(chat) {
    if (loading) return;

    setActiveChat(chat.id);
    setMessages(chat.messages);
    setMessage("");
    setFile(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleQuickAction(prompt) {
    setMessage(prompt);
  }

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    const validExtension = /\.(pdf|png|jpe?g|webp)$/i.test(
      selectedFile.name
    );

    if (
      !allowedTypes.includes(selectedFile.type) &&
      !validExtension
    ) {
      setError("Please select a PDF, PNG, JPG, JPEG, or WEBP file.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("The file must be smaller than 10 MB.");
      event.target.value = "";
      return;
    }

    setError("");
    setFile(selectedFile);
  }

  
async function handleSend(event) {
  event.preventDefault();

  const question = message.trim();

  if ((!question && !file) || loading) return;

  let chatId = activeChat;

  if (!chatId) {
    const newChat = createChat();
    chatId = newChat.id;
    setChats((previous) => [newChat, ...previous]);
    setActiveChat(chatId);
  }

  const selectedFile = file;

  const displayText = selectedFile
    ? `${question || "Please help me understand this medical report."}\n[Attached report: ${selectedFile.name}]`
    : question;

  const userMessage = {
    role: "user",
    text: displayText,
  };

  const nextMessages = [...messages, userMessage];

  setMessages(nextMessages);
  updateChatHistory(chatId, nextMessages);
  setMessage("");
  setError("");
  setLoading(true);

  try {
    let endpoint;
    let options;

    if (selectedFile) {
      // Upload the actual file for report analysis.
      endpoint = "http://127.0.0.1:8000/api/v1/reports/analyze";

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append(
        "question",
        question || "Explain this medical report in simple terms."
      );
      formData.append("provider", "sarvam");
      formData.append("language", language);

      options = {
        method: "POST",
        body: formData,
      };
    } else {
      // Preserve the existing text-chat API.
      endpoint = "http://127.0.0.1:8000/api/v1/chat/";

      const languageInstruction =
        language === "en"
          ? ""
          : ` Please respond in ${languageNames[language]}.`;

      options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: question + languageInstruction,
        }),
      };
    }

    const response = await fetch(endpoint, options);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        typeof data.detail === "string"
          ? data.detail
          : "Unable to process your request."
      );
    }

    // Save analyzed reports to My Documents.
if (selectedFile) {
  try {
    await saveDocumentFile(selectedFile);
  } catch (storageError) {
    console.error("Document storage failed:", storageError);
    setError("Report analyzed, but it could not be saved to My Documents.");
  }
}

    const assistantMessage = {
      role: "assistant",
      text: data.reply || "No response was returned by the server.",
    };

    const completedMessages = [
      ...nextMessages,
      assistantMessage,
    ];

    setMessages(completedMessages);
    updateChatHistory(chatId, completedMessages);
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  } catch (err) {
    setError(err.message || "Could not connect to the backend.");
  } finally {
    setLoading(false);
  }
}

  const filteredChats = chats.filter((chat) =>
    `${chat.title} ${chat.preview}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="mc-app">
      <header className="mc-header">
        <button
          className="mc-brand"
          onClick={onBack}
          type="button"
        >
          <span className="mc-brand-icon">
            <HeartPulse size={24} />
          </span>

          <span>
            MediConnect <strong>AI</strong>
          </span>
        </button>

        <nav className="mc-nav" aria-label="Main navigation">
          <button
  className={`mc-nav-item ${tab === "chat" ? "active" : ""}`}
  type="button"
  onClick={() => {
    setError("");
    setTab("chat");
  }}
>
  <MessageCircle size={18} />
  AI Assistant
</button>

          <button
  className="mc-nav-item"
  type="button"
  onClick={() => {
    setError("");
    setTab("documents");
  }}
>
  <FileText size={18} />
  My Reports
</button>

          <button
            className="mc-nav-item"
            type="button"
            onClick={() =>
              setError(
                "Health history has not been connected yet."
              )
            }
          >
            <HeartPulse size={18} />
            Health History
          </button>
        </nav>

        <label className="mc-language">
          <Globe size={17} />

          <select
            aria-label="Response language"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="ta">Tamil</option>
          </select>
        </label>

        <button
          className="mc-back-mobile"
          type="button"
          onClick={onBack}
          aria-label="Return to dashboard"
        >
          <ArrowLeft size={20} />
        </button>
      </header>

      <div className="mc-layout">
        <aside className="mc-sidebar">
          <button
            className="mc-new-chat"
            type="button"
            onClick={startNewChat}
            disabled={loading}
          >
            <Plus size={20} />
            New Chat
          </button>

          <label className="mc-search">
            <Search size={18} />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search conversations..."
              aria-label="Search conversations"
            />
          </label>

          <h3 className="mc-sidebar-heading">
            <MessageCircle size={18} />
            Recent Conversations
          </h3>

          <div className="mc-chat-list">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                type="button"
                className={`mc-history-item ${
                  activeChat === chat.id ? "selected" : ""
                }`}
                onClick={() => openChat(chat)}
              >
                <MessageCircle size={18} />

                <span className="mc-history-text">
                  <strong>{chat.title}</strong>
                  <small>{chat.preview}</small>
                </span>
              </button>
            ))}

            {filteredChats.length === 0 && (
              <p className="mc-empty-history">
                {search
                  ? "No matching conversations."
                  : "Your conversations will appear here."}
              </p>
            )}
          </div>

          <div className="mc-sidebar-footer">
            <ShieldCheck size={18} />

            <span>
              Avoid sharing passwords or unnecessary personal
              information.
            </span>
          </div>
        </aside>

        {tab === "documents" ? (
  <section className="mc-main">
    <Documents
      onBack={() => setTab("chat")}
      embedded
    />
  </section>
) : (
  <section className="mc-main">
          <div className="mc-conversation" aria-live="polite">
            {messages.length === 0 ? (
              <div className="mc-welcome">
                <span className="mc-welcome-icon">
                  <HeartPulse size={32} />
                </span>

                <h1>How can I help you today?</h1>

                <p>
                  Ask a health question in simple language. Choose
                  your preferred language above.
                </p>

                <div className="mc-suggestions">
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickAction(
                        "Explain common causes of a headache in simple language."
                      )
                    }
                  >
                    <Lightbulb size={16} />
                    Understand symptoms
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleQuickAction(
                        "What questions should I ask my doctor about a medical report?"
                      )
                    }
                  >
                    <FileText size={16} />
                    Understand a report
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleQuickAction(
                        "What general health precautions can help me stay healthy?"
                      )
                    }
                  >
                    <ShieldPlus size={16} />
                    Health precautions
                  </button>
                </div>
              </div>
            ) : (
              <div className="mc-messages">
                {messages.map((item, index) => (
                  <div
                    key={`${activeChat}-${item.role}-${index}`}
                    className={`mc-message-row ${item.role}`}
                  >
                    {item.role === "assistant" && (
                      <span className="mc-avatar">
                        <HeartPulse size={20} />
                      </span>
                    )}

                    
<div className="mc-message-bubble">
  {item.role === "assistant" &&
  reportSections.some((heading) =>
    item.text.includes(heading)
  ) ? (
    renderReportSections(item.text)
  ) : item.role === "assistant" ? (
    <div className="mc-message-text mc-markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {item.text}
      </ReactMarkdown>
    </div>
  ) : (
    <div className="mc-message-text">{item.text}</div>
  )}
</div>

                  </div>
                ))}

                {loading && (
                  <div className="mc-loading">
                    <LoaderCircle
                      size={18}
                      className="mc-spinner"
                    />
                    Sending your question...
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mc-bottom">
            <div className="mc-quick-actions">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <button
                    type="button"
                    key={action.label}
                    onClick={() =>
                      handleQuickAction(action.prompt)
                    }
                  >
                    <Icon size={16} />
                    {action.label}
                  </button>
                );
              })}
            </div>

            {file && (
              <div className="mc-file-preview">
                <FileText size={22} />

                <span>
                  <strong>{file.name}</strong>
                  <small>
                    Selected locally — not uploaded or analyzed yet
                  </small>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setFile(null);

                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  aria-label="Remove selected file"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            <form className="mc-composer" onSubmit={handleSend}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
                hidden
                onChange={handleFileChange}
                aria-label="Select a medical report"
              />

              <button
                className="mc-attach"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Attach a medical report"
                title="Attach a medical report"
              >
                <Paperclip size={21} />
              </button>

              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Type your health question..."
                maxLength={2000}
                rows={2}
                aria-label="Your health question"
              />

              <button
                className="mc-send"
                type="submit"
                disabled={(!message.trim() && !file) || loading}
                aria-label="Send message"
                title="Send message"
              >
                <Send size={19} />
              </button>
            </form>

            {error && (
              <div className="mc-error" role="alert">
                <span>{error}</span>

                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Dismiss error"
                >
                  <X size={17} />
                </button>
              </div>
            )}

            <p className="mc-disclaimer">
              <ShieldCheck size={15} />
              General health information only — not a diagnosis or a
              substitute for professional medical care.
            </p>

            <p className="mc-feature-note">
              Report analysis, persistent chat history, and reliable
              multilingual responses require backend support.
            </p>
          </div>
          </section>
)}
</div>
</main>
  );
}