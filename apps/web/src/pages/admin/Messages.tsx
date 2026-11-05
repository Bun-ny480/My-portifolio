import { useEffect, useState } from "react";
import { adminApi, type AdminContactMessage } from "../../services/admin";

export default function AdminMessages() {
  const [messages, setMessages] = useState<AdminContactMessage[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [sendingReplyId, setSendingReplyId] = useState<string | null>(null);

  async function load() {
    try {
      setMessages(await adminApi.messages());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }

  useEffect(() => { load(); }, []);

  async function setStatus(id: string, status: AdminContactMessage["status"]) {
    setError(null);
    setNotice(null);
    try {
      await adminApi.updateMessageStatus(id, status);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update message status");
    }
  }

  async function del(id: string) {
    if (!confirm("Delete this message?")) return;
    setError(null);
    try {
      await adminApi.deleteMessage(id);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to delete message");
    }
  }

  async function sendReply(event: React.FormEvent<HTMLFormElement>, message: AdminContactMessage) {
    event.preventDefault();
    const body = replyDrafts[message.id]?.trim();
    if (!body) return;

    setSendingReplyId(message.id);
    setError(null);
    setNotice(null);
    try {
      await adminApi.replyToMessage(message.id, body);
      setReplyDrafts((drafts) => ({ ...drafts, [message.id]: "" }));
      setNotice(`Reply sent to ${message.email}.`);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to send reply");
    } finally {
      setSendingReplyId(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Messages</h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      {notice && <p role="status" className="text-emerald-400 mb-4">{notice}</p>}

      <div className="space-y-2">
        {messages.map((m) => (
          <div key={m.id} className="rounded-lg border border-border bg-surface">
            <button
              onClick={() => setOpenId(openId === m.id ? null : m.id)}
              className="w-full text-left p-4 flex items-baseline justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="font-medium truncate">{m.subject}</p>
                <p className="text-sm text-muted truncate">{m.fullName} — {m.email}</p>
              </div>
              <div className="text-right whitespace-nowrap">
                <span className={`text-xs px-2 py-0.5 rounded ${m.status === "NEW" ? "bg-accent/20 text-accent" : "bg-border text-muted"}`}>
                  {m.status.toLowerCase()}
                </span>
                <p className="text-xs text-muted mt-1">{new Date(m.createdAt).toLocaleDateString()}</p>
              </div>
            </button>

            {openId === m.id && (
              <div className="border-t border-border p-4 space-y-4">
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">Original message</p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.message}</p>
                </div>
                {m.replies.map((reply) => (
                  <div key={reply.id} className="rounded-md border border-accent/30 bg-accent/5 p-3">
                    <p className="mb-1 text-xs text-muted">Your reply · {new Date(reply.createdAt).toLocaleString()}</p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{reply.body}</p>
                  </div>
                ))}
                <form onSubmit={(event) => void sendReply(event, m)} className="space-y-2">
                  <label htmlFor={`reply-${m.id}`} className="block text-sm font-medium">Reply to {m.fullName}</label>
                  <textarea
                    id={`reply-${m.id}`}
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
                    rows={4}
                    maxLength={5000}
                    required
                    placeholder={`Write a reply to ${m.email}…`}
                    value={replyDrafts[m.id] ?? ""}
                    onChange={(event) => setReplyDrafts((drafts) => ({ ...drafts, [m.id]: event.target.value }))}
                  />
                  <button
                    type="submit"
                    disabled={sendingReplyId === m.id || !replyDrafts[m.id]?.trim()}
                    className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sendingReplyId === m.id ? "Sending…" : "Send reply"}
                  </button>
                </form>
                <div className="flex gap-2 flex-wrap">
                  {(["NEW", "READ", "REPLIED", "ARCHIVED"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(m.id, s)}
                      disabled={m.status === s}
                      className="text-xs px-2 py-1 rounded border border-border hover:border-accent disabled:opacity-40"
                    >
                      {s.toLowerCase()}
                    </button>
                  ))}
                  <button onClick={() => del(m.id)} className="text-xs text-red-400 ml-auto">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {messages.length === 0 && (
          <p className="text-muted text-sm">No messages yet.</p>
        )}
      </div>
    </div>
  );
}
