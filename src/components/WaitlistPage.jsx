import { useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { validateName, validateEmail, validatePhone } from "../lib/validation";
import { COUNTRIES } from "../lib/countries";
import "./WaitlistPage.css";

const FEATURES = [
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    colorClass: "icon--morning",
    title: "Smart Break Timer",
    desc: "Auto-reminds every 30–60 min, pauses when you're idle",
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    colorClass: "icon--sleep",
    title: "Guided Micro-Breaks",
    desc: "Animated stretches & breathing, right in your browser",
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    colorClass: "icon--yoga",
    title: "Streak Tracking",
    desc: "Daily habit grid that keeps your break streak alive",
  },
];

const SHARE_TEXT =
  "I just joined the AFK waitlist — smart break reminders for people who sit too long. Join me:";
const AFK_URL = "https://afk-break.vercel.app/";

// ─── Field ─────────────────────────────────────────────────
function Field({ id, label, error, touched, children }) {
  return (
    <div
      className={`field ${touched && error ? "field--error" : ""} ${touched && !error ? "field--valid" : ""}`}
    >
      {children}
      {touched && error && (
        <span className="field-error" role="alert">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </span>
      )}
      {touched && !error && (
        <span className="field-valid" aria-label="Valid">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}
    </div>
  );
}

// ─── SuccessView ────────────────────────────────────────────
function SuccessView() {
  const link = AFK_URL;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const el = document.createElement("textarea");
      el.value = link;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const encoded = encodeURIComponent(SHARE_TEXT + " " + link);

  return (
    <div className="success-view">
      <div className="success-emoji">🎉</div>
      <h2 className="success-title">You're on the list!</h2>
      <p className="success-subtitle">
        We'll notify you as soon as AFK is ready for you.
      </p>

      <div className="share-divider" />

      <p className="share-prompt">
        Know someone who needs break reminders?
        <br />
        Share AFK with them.
      </p>

      <div className="referral-box">
        <input className="referral-input" readOnly value={link} />
        <button
          className={`btn-copy ${copied ? "btn-copy--copied" : ""}`}
          onClick={handleCopy}
        >
          {copied ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <div className="share-buttons">
        <button
          className="share-btn share-btn--wa"
          onClick={() =>
            window.open(`https://wa.me/?text=${encoded}`, "_blank")
          }
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.11.546 4.093 1.504 5.822L0 24l6.335-1.477A11.955 11.955 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82c-1.876 0-3.664-.508-5.233-1.452l-.375-.222-3.889.907.949-3.764-.244-.389A9.78 9.78 0 0 1 2.18 12c0-5.422 4.398-9.82 9.82-9.82 5.422 0 9.82 4.398 9.82 9.82 0 5.422-4.398 9.82-9.82 9.82z" />
          </svg>
          WhatsApp
        </button>
        <button
          className="share-btn share-btn--tw"
          onClick={() =>
            window.open(
              `https://twitter.com/intent/tweet?text=${encoded}`,
              "_blank",
            )
          }
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Twitter
        </button>
        <button
          className="share-btn share-btn--li"
          onClick={() =>
            window.open(
              `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`,
              "_blank",
            )
          }
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          LinkedIn
        </button>
      </div>
    </div>
  );
}

// ─── WaitlistPage ───────────────────────────────────────────
export default function WaitlistPage() {
  const [fields, setFields] = useState({
    name: "",
    email: "",
    phone: "",
    countryDial: "+91",
    countryName: "India",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  // Live validate a single field
  const validate = (name, value, extra = {}) => {
    const dial = extra.countryDial ?? fields.countryDial;
    switch (name) {
      case "name":
        return validateName(value);
      case "email":
        return validateEmail(value);
      case "phone":
        return validatePhone(value, dial);
      default:
        return null;
    }
  };

  const handleChange = (name, value) => {
    setFields((f) => ({ ...f, [name]: value }));
    if (touched[name]) {
      setErrors((e) => ({ ...e, [name]: validate(name, value) }));
    }
  };

  const handleCountryChange = (e) => {
    const selected = COUNTRIES[e.target.selectedIndex];
    setFields((f) => ({
      ...f,
      countryDial: selected.dial,
      countryName: selected.name,
    }));
    if (touched.phone) {
      setErrors((er) => ({
        ...er,
        phone: validatePhone(fields.phone, selected.dial),
      }));
    }
  };

  const handleBlur = (name) => {
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors((e) => ({ ...e, [name]: validate(name, fields[name]) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    // Touch all fields to surface all errors
    const allTouched = { name: true, email: true, phone: true };
    setTouched(allTouched);

    const newErrors = {
      name: validateName(fields.name),
      email: validateEmail(fields.email),
      phone: validatePhone(fields.phone, fields.countryDial),
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) return;

    setSubmitting(true);
    try {
      const payload = {
        name: fields.name.trim(),
        email: fields.email.trim().toLowerCase(),
        phone: parseInt(fields.phone.replace(/\D/g, ""), 10),
        country_code: fields.countryDial,
        country: fields.countryName,
      };

      const { error } = await supabase.from("waitlist").insert([payload]);

      if (error) {
        if (error.code === "23505") {
          // Unique constraint — email already registered
          setSubmitError("This email is already on the waitlist! 🎉");
        } else {
          setSubmitError("Something went wrong. Please try again.");
          console.error(error);
        }
        setSubmitting(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setSubmitError(
        "Network error. Please check your connection and try again.",
      );
      console.error(err);
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      {/* Background blobs */}
      <div className="blobs" aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <main className="card">
        {success ? (
          <SuccessView />
        ) : (
          <div className="card-inner">
            {/* Badge */}
            <div className="badge">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 9.9-1" />
              </svg>
              <span>Chrome Extension · Early Access</span>
            </div>

            {/* Heading */}
            <h1 className="heading">
              Work Hard.
              <br />
              Break Smarter.
            </h1>
            <p className="subheading">
              AFK watches your screen time and nudges you to move — guided
              stretches and breathing exercises, built right into your browser.
            </p>

            {/* Feature list */}
            <ul className="features" aria-label="What AFK does">
              {FEATURES.map((f) => (
                <li key={f.title} className="feature-item">
                  <span className={`feature-icon ${f.colorClass}`}>
                    {f.icon}
                  </span>
                  <div className="feature-text">
                    <strong>{f.title}</strong>
                    <span>{f.desc}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="divider" />

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              noValidate
              aria-label="Waitlist signup form"
            >
              {/* Name */}
              <Field error={errors.name} touched={touched.name}>
                <input
                  type="text"
                  className="input"
                  placeholder="Your full name"
                  value={fields.name}
                  autoComplete="name"
                  maxLength={80}
                  onChange={(e) => handleChange("name", e.target.value)}
                  onBlur={() => handleBlur("name")}
                  aria-label="Full name"
                  aria-invalid={touched.name && !!errors.name}
                />
              </Field>

              {/* Email */}
              <Field error={errors.email} touched={touched.email}>
                <input
                  type="email"
                  className="input"
                  placeholder="Email address"
                  value={fields.email}
                  autoComplete="email"
                  maxLength={254}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  aria-label="Email address"
                  aria-invalid={touched.email && !!errors.email}
                />
              </Field>

              {/* Phone */}
              <Field error={errors.phone} touched={touched.phone}>
                <div className="phone-row">
                  <select
                    className="country-select"
                    onChange={handleCountryChange}
                    aria-label="Country code"
                  >
                    {COUNTRIES.map((c, i) => (
                      <option key={i} value={c.dial}>
                        {c.flag} {c.dial}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    className="input phone-input"
                    placeholder="Phone number"
                    value={fields.phone}
                    autoComplete="tel"
                    maxLength={15}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^\d\s\-().]/g, "");
                      handleChange("phone", v);
                    }}
                    onBlur={() => handleBlur("phone")}
                    aria-label="Phone number"
                    aria-invalid={touched.phone && !!errors.phone}
                  />
                </div>
              </Field>

              {/* Submit error */}
              {submitError && (
                <div className="submit-error" role="alert">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                className={`btn-submit ${submitting ? "btn-submit--loading" : ""}`}
                disabled={submitting}
              >
                <span className="btn-label">Join the Waitlist</span>
                <span className="btn-arrow">→</span>
                <span className="btn-spinner" aria-hidden="true">
                  <span className="spinner" />
                </span>
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
