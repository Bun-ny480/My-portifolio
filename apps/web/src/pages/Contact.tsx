import { useState } from "react";
import { publicApi } from "../services/api";

type Status = "idle" | "sending" | "sent" | "error";

export default function Contact() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErr(null);
    try {
      await publicApi.contact({ fullName, email, phone, subject, message, website });
      setStatus("sent");
      setFullName(""); setEmail(""); setPhone(""); setSubject(""); setMessage("");
    } catch (e) {
      setStatus("error");
      setErr(e instanceof Error ? e.message : "Failed to send");
    }
  }

  const inputClass =
    "w-full px-3 py-2 rounded-md bg-surface border border-border focus:outline-none focus:border-accent";

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Contact</h1>
      <p className="mt-2 text-muted">Tell me about your project.</p>

      {status === "sent" && (
        <div className="mt-6 rounded-lg border border-accent bg-surface p-4">
          Thanks — your message is in. I'll get back to you soon.
        </div>
      )}

      {err && <p className="mt-6 text-red-400">{err}</p>}

      <form onSubmit={onSubmit} className="mt-10 space-y-4">
        <input
          className={inputClass}
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          minLength={2}
          maxLength={120}
        />
        <input
          className={inputClass}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className={inputClass}
          placeholder="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={30}
        />
        <input
          className={inputClass}
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          minLength={3}
          maxLength={160}
        />
        <textarea
          className={inputClass}
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          minLength={10}
          maxLength={5000}
          rows={6}
        />

        {/* honeypot — hidden from real users, bots fill it */}
        <div className="hidden" aria-hidden="true">
          <label>
            Website
            <input
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={status === "sending"}
          className="px-5 py-2 rounded-md bg-accent text-bg font-medium disabled:opacity-50"
        >
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
      </form>
    </div>
  );
}
