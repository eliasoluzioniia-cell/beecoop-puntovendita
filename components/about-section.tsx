import { AboutData } from "@/lib/notion"
import { Users, Shield, MapPin, Award } from "lucide-react"

export function AboutSection({ data }: { data: AboutData | null }) {
  const name = data?.name || "Bee Coop"
  const portrait = data?.portrait || "/assets/logo.jpg"
  const headline = data?.headline || "La 'Follia' che si fa Realtà — Accendiamo la speranza nel cuore di Enna."
  const biography = data?.biography && data.biography.length > 0 ? data.biography : [
    "In un’epoca segnata da incertezza e rassegnazione, la città di Enna ha un disperato bisogno di 'visionari'. Persone capaci di guardare oltre l’ostacolo, non con il peso della fatica, ma con il sorriso di chi crede fermamente nel futuro.",
    "La Bee Coop è una cooperativa sociale di tipo B che non si accontenta del semplice volontariato: punta all'indipendenza economica e alla dignità del lavoro, con il 75% di soci con disabilità.",
    "Aprire un negozio nella via Roma bassa significa accendere una vetrina dove troppe se ne sono spente; significa dire alla città che non tutto è perduto e che la rinascita è possibile se fondata su valori solidi."
  ]
  
  const location = data?.location || "Enna, Italia"
  const activeSince = data?.activeSince || "2026"
  const specialization = data?.specialization || "Cooperativa Sociale · Agricoltura · Artigianato"
  const awards = data?.awards || "75% Soci con Disabilità"

  return (
    <section id="about" className="relative border-t border-white/10 bg-black/45 backdrop-blur-md snap-start min-h-screen flex flex-col md:flex-row">
      {/* Portrait Left Column */}
      <div className="w-full md:w-1/2 h-[50vh] md:h-screen md:sticky md:top-0 overflow-hidden relative bg-black/60 flex items-center justify-center">
        <img
          src={portrait}
          alt={`Copertina di ${name}`}
          className="max-h-full max-w-full object-contain"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 pointer-events-none" />
      </div>

      {/* Story Right Column */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-16 md:px-16 md:py-24 bg-gradient-to-br from-slate-900/90 to-black/90">
        <div className="max-w-xl mx-auto w-full">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-[#2487ce] font-semibold">
            <span className="h-px w-8 bg-[#2487ce]" />
            Il Progetto &amp; La Visione
          </div>

          <p className="mt-8 text-balance font-serif text-3xl font-light leading-[1.15] text-white md:text-5xl drop-shadow-sm">
            {headline}
          </p>

          <div className="mt-10 space-y-6 text-pretty text-base leading-relaxed text-white/70 md:text-lg">
            {biography.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {/* Meta list */}
          <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-white/10 pt-10">
            <div>
              <dt className="text-xs uppercase tracking-[0.25em] text-white/40 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#2487ce]" /> Sede
              </dt>
              <dd className="mt-2 font-serif text-lg text-white md:text-xl">{location}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.25em] text-white/40 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-[#2487ce]" /> Attivo dal
              </dt>
              <dd className="mt-2 font-serif text-lg text-white md:text-xl">{activeSince}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.25em] text-white/40 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-[#2487ce]" /> Specializzazione
              </dt>
              <dd className="mt-2 font-serif text-lg text-white md:text-xl leading-snug">{specialization}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.25em] text-white/40 flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-[#2487ce]" /> Valore Sociale
              </dt>
              <dd className="mt-2 font-serif text-lg text-white md:text-xl">{awards}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}
