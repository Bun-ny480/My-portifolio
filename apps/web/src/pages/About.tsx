import { useEffect, useState } from "react";
import { publicApi, type Profile } from "../services/api";

type Experience = { id: string; title: string; organization: string; startDate: string; endDate: string | null; description: string };
type Education = { id: string; institution: string; degree: string; startDate: string; endDate: string | null; description: string | null };
type Cert = { id: string; name: string; issuer: string; issuedAt: string; url: string | null };

function fmt(d: string | null) {
  if (!d) return "Present";
  return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short" });
}

export default function About() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [certs, setCerts] = useState<Cert[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [p, ex, ed, cs] = await Promise.all([
          publicApi.profile(),
          publicApi.experience(),
          publicApi.education(),
          publicApi.certifications(),
        ]);
        setProfile(p.profile);
        setExperience(ex);
        setEducation(ed);
        setCerts(cs);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      }
    })();
  }, []);

  if (error) return <div className="max-w-3xl mx-auto px-6 py-16 text-red-400">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-16">
      <section>
        <h1 className="text-3xl font-bold tracking-tight">About</h1>
        {profile?.bio && <p className="mt-6 leading-relaxed">{profile.bio}</p>}
        {profile?.mission && (
          <div className="mt-6">
            <h2 className="text-lg font-medium">Mission</h2>
            <p className="mt-2 text-muted leading-relaxed">{profile.mission}</p>
          </div>
        )}
        {profile?.philosophy && (
          <div className="mt-6">
            <h2 className="text-lg font-medium">Philosophy</h2>
            <p className="mt-2 text-muted leading-relaxed">{profile.philosophy}</p>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Experience</h2>
        {experience.length === 0 && <p className="text-muted">Nothing listed yet.</p>}
        <div className="space-y-6">
          {experience.map((e) => (
            <div key={e.id} className="border-l-2 border-border pl-4">
              <div className="flex justify-between gap-4">
                <div>
                  <h3 className="font-medium">{e.title}</h3>
                  <p className="text-sm text-muted">{e.organization}</p>
                </div>
                <p className="text-sm text-muted whitespace-nowrap">
                  {fmt(e.startDate)} — {fmt(e.endDate)}
                </p>
              </div>
              <p className="mt-2 text-sm leading-relaxed">{e.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Education</h2>
        {education.length === 0 && <p className="text-muted">Nothing listed yet.</p>}
        <div className="space-y-6">
          {education.map((e) => (
            <div key={e.id} className="border-l-2 border-border pl-4">
              <div className="flex justify-between gap-4">
                <div>
                  <h3 className="font-medium">{e.degree}</h3>
                  <p className="text-sm text-muted">{e.institution}</p>
                </div>
                <p className="text-sm text-muted whitespace-nowrap">
                  {fmt(e.startDate)} — {fmt(e.endDate)}
                </p>
              </div>
              {e.description && <p className="mt-2 text-sm leading-relaxed">{e.description}</p>}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Certifications</h2>
        {certs.length === 0 && <p className="text-muted">Nothing listed yet.</p>}
        <ul className="space-y-2">
          {certs.map((c) => (
            <li key={c.id} className="flex items-baseline justify-between gap-4 border-b border-border pb-2">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-muted">{c.issuer}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted">{new Date(c.issuedAt).getFullYear()}</p>
                {c.url && (
                  <a href={c.url} target="_blank" rel="noreferrer" className="text-xs">
                    verify →
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
