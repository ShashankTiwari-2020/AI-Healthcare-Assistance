
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Download,
  FileText,
  Trash2,
  UploadCloud,
  LoaderCircle,
  Eye,
  Search,
  X,
  FileImage,
} from "lucide-react";

import "./Workspace.css";

const DB_NAME = "MediConnectLocalWorkspace";
const STORE_NAME = "documents";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
];

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore(mode, action) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);

    let result;

    try {
      result = action(store);
    } catch (error) {
      db.close();
      reject(error);
      return;
    }

    transaction.oncomplete = () => {
      db.close();
      resolve(result);
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };

    transaction.onabort = () => {
      db.close();
      reject(transaction.error || new Error("Storage operation failed."));
    };
  });
}

export async function saveDocumentFile(file) {
  if (!file) {
    throw new Error("No document selected.");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Unsupported document type.");
  }

  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    throw new Error("The file must be nonempty and no larger than 10 MB.");
  }

  const document = {
    id: crypto.randomUUID(),
    name: file.name,
    size: file.size,
    type: file.type,
    createdAt: Date.now(),
    blob: file,
  };

  await withStore("readwrite", (store) => store.add(document));

  return document;
}

async function getAllDocuments() {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).getAll();

    request.onsuccess = () => {
      const documents = request.result
        .sort((a, b) => b.createdAt - a.createdAt)
        .map(({ id, name, size, type, createdAt }) => ({
          id,
          name,
          size,
          type,
          created_at: new Date(createdAt).toISOString(),
        }));

      resolve(documents);
    };

    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export default function Documents({ onBack, embedded = false }) {
  const [docs, setDocs] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [preview, setPreview] = useState(null);

  const picker = useRef(null);

  async function refresh() {
    try {
      setDocs(await getAllDocuments());
      setError("");
    } catch {
      setError("Unable to access local document storage.");
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    return () => {
      if (preview?.url) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview]);

  async function upload(file) {
    if (!file) return;

    setError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Choose a PDF, PNG, JPG, JPEG, or WEBP document.");
      return;
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      setError("The file must be nonempty and no larger than 10 MB.");
      return;
    }

    setBusy(true);

    try {
      await saveDocumentFile(file);
      await refresh();
    } catch {
      setError("Upload failed. Check available browser storage space.");
    } finally {
      setBusy(false);

      if (picker.current) {
        picker.current.value = "";
      }
    }
  }

  async function getSavedDocument(id) {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);

      transaction.oncomplete = () => db.close();
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  }

  async function download(doc) {
    setError("");

    try {
      const saved = await getSavedDocument(doc.id);

      if (!saved?.blob) {
        throw new Error("Document not found.");
      }

      const url = URL.createObjectURL(saved.blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = saved.name;
      link.click();

      URL.revokeObjectURL(url);
    } catch {
      setError("Unable to download this document.");
    }
  }

  async function openPreview(doc) {
    setError("");

    try {
      const saved = await getSavedDocument(doc.id);

      if (!saved?.blob) {
        throw new Error("Document not found.");
      }

      const url = URL.createObjectURL(saved.blob);

      setPreview({
        ...doc,
        url,
        type: saved.type,
      });
    } catch {
      setError("Unable to preview this document.");
    }
  }

  function closePreview() {
    setPreview(null);
  }

  async function remove(doc) {
    if (!window.confirm(`Delete "${doc.name}" from this browser?`)) {
      return;
    }

    try {
      await withStore("readwrite", (store) => store.delete(doc.id));

      if (preview?.id === doc.id) {
        closePreview();
      }

      await refresh();
    } catch {
      setError("Unable to delete this document.");
    }
  }

  const totalReports = docs.length;

  const totalPDFs = docs.filter(
    (doc) => doc.type === "application/pdf"
  ).length;

  const totalImages = docs.filter(
    (doc) => doc.type?.startsWith("image/")
  ).length;

  const totalStorage = docs.reduce(
    (total, doc) => total + doc.size,
    0
  );

  const storageInMB = (totalStorage / (1024 * 1024)).toFixed(2);

  const filteredDocs = docs.filter((doc) => {
    const matchesSearch = doc.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "pdf" && doc.type === "application/pdf") ||
      (filter === "image" && doc.type?.startsWith("image/"));

    return matchesSearch && matchesFilter;
  });

  return (
    <section className={`workspace-documents ${embedded ? "embedded" : ""}`}>

      <div className="workspace-heading">
        <div>
          {!embedded && (
            <button
              className="workspace-icon-button"
              onClick={onBack}
              type="button"
              aria-label="Back"
            >
              <ArrowLeft size={19} />
            </button>
          )}

          <h2>My Documents</h2>
          <p>Your medical reports stored privately in this browser.</p>
        </div>

        <button
          className="workspace-primary"
          type="button"
          onClick={() => picker.current?.click()}
          disabled={busy}
        >
          {busy ? (
            <LoaderCircle size={18} className="mc-spinner" />
          ) : (
            <UploadCloud size={18} />
          )}
          Upload document
        </button>
      </div>

      <input
        ref={picker}
        type="file"
        hidden
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        onChange={(event) => upload(event.target.files?.[0])}
      />

      {error && (
        <p className="workspace-error" role="alert">
          {error}
        </p>
      )}

      {/* Dashboard Statistics */}
      <div className="workspace-stats">

        <div className="workspace-stat-card">
          <span className="workspace-stat-icon teal">
            <FileText size={21} />
          </span>

          <div>
            <small>Total Reports</small>
            <strong>{totalReports}</strong>
          </div>
        </div>

        <div className="workspace-stat-card">
          <span className="workspace-stat-icon blue">
            <FileText size={21} />
          </span>

          <div>
            <small>PDF Documents</small>
            <strong>{totalPDFs}</strong>
          </div>
        </div>

        <div className="workspace-stat-card">
          <span className="workspace-stat-icon purple">
            <FileImage size={21} />
          </span>

          <div>
            <small>Images</small>
            <strong>{totalImages}</strong>
          </div>
        </div>

        <div className="workspace-stat-card">
          <span className="workspace-stat-icon orange">
            <UploadCloud size={21} />
          </span>

          <div>
            <small>Storage Used</small>
            <strong>{storageInMB} MB</strong>
          </div>
        </div>

      </div>

      {/* Search and Filters */}
      <div className="workspace-toolbar">

        <div className="workspace-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search your reports..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="workspace-filters">
          <button
            type="button"
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </button>

          <button
            type="button"
            className={filter === "pdf" ? "active" : ""}
            onClick={() => setFilter("pdf")}
          >
            PDFs
          </button>

          <button
            type="button"
            className={filter === "image" ? "active" : ""}
            onClick={() => setFilter("image")}
          >
            Images
          </button>
        </div>

      </div>

      {/* Documents List */}
      <div className="workspace-doc-list">

        {filteredDocs.map((doc) => (
          <div className="workspace-document" key={doc.id}>

            <span className="workspace-file-icon">
              {doc.type?.startsWith("image/") ? (
                <FileImage size={23} />
              ) : (
                <FileText size={23} />
              )}
            </span>

            <div className="workspace-file-copy">
              <strong>{doc.name}</strong>

              <small>
                {(doc.size / 1024).toFixed(1)} KB ·{" "}
                {new Date(doc.created_at).toLocaleDateString()}
              </small>
            </div>

            <button
              className="workspace-icon-button"
              type="button"
              onClick={() => openPreview(doc)}
              aria-label={`Preview ${doc.name}`}
              title="Preview"
            >
              <Eye size={19} />
            </button>

            <button
              className="workspace-icon-button"
              type="button"
              onClick={() => download(doc)}
              aria-label={`Download ${doc.name}`}
              title="Download"
            >
              <Download size={19} />
            </button>

            <button
              className="workspace-icon-button danger"
              type="button"
              onClick={() => remove(doc)}
              aria-label={`Delete ${doc.name}`}
              title="Delete"
            >
              <Trash2 size={19} />
            </button>

          </div>
        ))}

        {!filteredDocs.length && (
          <div className="workspace-empty">
            <UploadCloud size={37} />

            <strong>
              {docs.length === 0
                ? "No documents uploaded yet"
                : "No matching documents found"}
            </strong>

            <span>
              {docs.length === 0
                ? "Upload PDFs or images, up to 10 MB each."
                : "Try another search or select a different filter."}
            </span>
          </div>
        )}

      </div>

      <p className="workspace-storage-note">
        Documents stay in this browser on this device. Clearing site data may
        permanently delete them. This is local storage, not cloud backup.
      </p>

      {/* Document Preview */}
      {preview && (
        <div
          className="workspace-preview-overlay"
          onClick={closePreview}
        >
          <div
            className="workspace-preview-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="workspace-preview-header">
              <strong>{preview.name}</strong>

              <button
                type="button"
                onClick={closePreview}
                aria-label="Close preview"
              >
                <X size={21} />
              </button>
            </div>

            {preview.type === "application/pdf" ? (
              <iframe
                src={preview.url}
                title={preview.name}
                className="workspace-preview-frame"
              />
            ) : (
              <img
                src={preview.url}
                alt={preview.name}
                className="workspace-preview-image"
              />
            )}
          </div>
        </div>
      )}

    </section>
  );
}
