import { useEffect, useState } from "react";
import { publicApi, type Service } from "../services/api";

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setServices(await publicApi.services());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    })();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Services</h1>
      <p className="mt-2 text-muted">What I can help you build.</p>

      {error && <p className="mt-6 text-red-400">{error}</p>}

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {services.map((s) => (
          <div key={s.id} className="rounded-lg border border-border bg-surface p-6">
            <h2 className="text-xl font-semibold">{s.title}</h2>
            <p className="mt-2 text-muted leading-relaxed">{s.description}</p>

            {s.deliverables.length > 0 && (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wide text-muted mb-2">Deliverables</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {s.deliverables.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            )}

            {s.technologies.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {s.technologies.map((t, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded bg-border text-muted">
                    {t}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-6 flex items-baseline justify-between">
              {s.priceFrom != null && (
                <p className="text-sm text-muted">From ${s.priceFrom}</p>
              )}
              <a href="/contact" className="text-sm text-accent">Discuss →</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
