import { Certification } from "@/types/portfolio"
import { BadgeCheck, ExternalLink } from "lucide-react"

export function CertificationsSection({ certs }: { certs: Certification[] }) {
  if (!certs.length) return null


  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto">
      <p className="text-xs text-amber-500 font-mono uppercase tracking-widest mb-1">
        Certifications
      </p>
      <h2 className="text-2xl font-medium text-white mb-8">Credentials</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {certs.map((cert) => (
          <div key={cert.id}
            className="border border-zinc-800/60 rounded-xl p-4 bg-zinc-900/20
                       hover:border-zinc-700 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20
                              flex items-center justify-center shrink-0">
                <BadgeCheck className="w-3.5 h-3.5 text-amber-500" />
              </div>
              {cert.credential_url && (
                <a href={cert.credential_url} target="_blank" rel="noopener noreferrer"
                  className="text-zinc-600 hover:text-white transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <h3 className="text-white text-sm font-medium mb-1 leading-snug">
              {cert.name}
            </h3>
            <p className="text-amber-500/70 text-xs font-mono mb-2">{cert.issuer}</p>
            <p className="text-zinc-600 text-xs font-mono">
              {new Date(cert.issue_date).toLocaleDateString("en-US", {
                month: "short", year: "numeric"
              })}
              {cert.expiry_date && (
                <> — {new Date(cert.expiry_date).toLocaleDateString("en-US", {
                  month: "short", year: "numeric"
                })}</>
              )}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
