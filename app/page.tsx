import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] overflow-hidden">
      {/* Subtle ambient gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-blue-100/40 blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-indigo-100/30 blur-[100px] translate-y-1/3 -translate-x-1/4" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full bg-emerald-50/40 blur-[80px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 w-full border-b border-slate-200/60 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-700 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <span className="text-xl font-display font-bold text-slate-900 tracking-tight">Nura</span>
          </div>
          <Link
            href="/demo"
            className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors duration-200 shadow-sm"
          >
            Try Live Demo
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-blue-800">AI Agent Olympics — Autonomous Clinical Intelligence</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-slate-900 leading-[1.08] tracking-tight mb-6">
            The Doctor Speaks.
            <br />
            <span className="text-blue-700">Nura Does Everything Else.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
            An autonomous clinical voice agent that listens to doctor-patient conversations and independently detects drug interactions, flags allergy conflicts, routes referrals, and generates structured SOAP notes — in real-time.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/demo"
              className="group px-8 py-4 bg-blue-700 hover:bg-blue-800 text-white text-base font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-700/20 hover:shadow-xl hover:shadow-blue-700/30 flex items-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
              Watch Live Demo
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 text-base font-semibold rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200"
            >
              How It Works
            </a>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <p className="text-3xl font-display font-bold text-blue-700">49%</p>
              <p className="text-sm text-slate-500 mt-1">of physician workday spent on documentation</p>
            </div>
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <p className="text-3xl font-display font-bold text-red-600">62%</p>
              <p className="text-sm text-slate-500 mt-1">of physicians report burnout from charting</p>
            </div>
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <p className="text-3xl font-display font-bold text-emerald-600">$4.6B</p>
              <p className="text-sm text-slate-500 mt-1">annual cost of physician turnover from burnout</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Gap / How It Works Section */}
      <section id="how-it-works" className="relative z-10 py-20 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-4">Beyond AI Scribes</h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">Current tools only do one thing. Nura does everything — autonomously.</p>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-700 mb-1">AI Scribes</h3>
              <p className="text-sm text-slate-500 mb-3">Abridge, DAX, Nabla</p>
              <div className="text-sm text-slate-600 font-mono bg-white px-3 py-2 rounded-lg border border-slate-200">
                Voice → Notes <span className="text-slate-400">only</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-700 mb-1">CDSS Tools</h3>
              <p className="text-sm text-slate-500 mb-3">Epic alerts, Lexicomp</p>
              <div className="text-sm text-slate-600 font-mono bg-white px-3 py-2 rounded-lg border border-slate-200">
                Manual Input → Alerts <span className="text-slate-400">only</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-blue-50 border-2 border-blue-200 relative">
              <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-blue-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">Nura</div>
              <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-blue-900 mb-1">Autonomous Agent</h3>
              <p className="text-sm text-blue-600 mb-3">Nura — one button</p>
              <div className="text-sm text-blue-800 font-mono bg-white px-3 py-2 rounded-lg border border-blue-200 font-semibold">
                Voice → Notes + Decisions + Actions
              </div>
            </div>
          </div>

          {/* Pipeline Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { icon: "🎙️", title: "Listen", desc: "Real-time transcription with speaker diarization" },
              { icon: "🧠", title: "Understand", desc: "Extract medications, symptoms, conditions" },
              { icon: "⚡", title: "Cross-Reference", desc: "Check drug interactions & allergy conflicts" },
              { icon: "🚨", title: "Decide", desc: "Flag urgency, route referrals autonomously" },
              { icon: "📋", title: "Document", desc: "Generate SOAP notes & update patient record" },
            ].map((step, i) => (
              <div key={i} className="relative p-4 rounded-xl bg-slate-50 border border-slate-200 text-center group hover:bg-blue-50 hover:border-blue-200 transition-colors duration-200">
                <div className="text-2xl mb-2">{step.icon}</div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">{step.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                {i < 4 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-5 text-slate-300 -translate-y-1/2 z-10">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Nura Detects */}
      <section className="relative z-10 py-20 border-t border-slate-200 bg-[#f8fafc]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-4">Autonomous Clinical Intelligence</h2>
            <p className="text-lg text-slate-500">Press play. The agent handles the rest.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: "⚠️", title: "Drug Interactions", desc: "Detects dangerous combinations between current medications and newly mentioned drugs" },
              { icon: "🛡️", title: "Allergy Conflicts", desc: "Cross-references patient allergies against prescribed medications in real-time" },
              { icon: "🏥", title: "Diagnosis Tracking", desc: "Identifies and classifies conditions as new, existing, or suspected" },
              { icon: "📨", title: "Referral Routing", desc: "Autonomously decides which specialist is needed and dispatches the referral" },
              { icon: "📋", title: "SOAP Generation", desc: "Complete clinical notes generated instantly — Subjective, Objective, Assessment, Plan" },
              { icon: "📅", title: "Appointment Booking", desc: "Schedules follow-ups and specialist visits automatically after analysis" },
            ].map((item, i) => (
              <div key={i} className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="text-2xl mb-3">{item.icon}</div>
                <h4 className="text-sm font-bold text-slate-800 mb-1.5">{item.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="relative z-10 py-14 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">Powered By</p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-semibold text-slate-500">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              Speechmatics
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              Featherless AI
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              Next.js 14
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              SQLite
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              Vultr
            </span>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-20 bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">See It In Action</h2>
          <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto">
            Watch Nura process a doctor-patient conversation in real-time — detecting conflicts, flagging alerts, and generating notes autonomously.
          </p>
          <Link
            href="/demo"
            className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white text-base font-semibold rounded-xl transition-colors duration-200 shadow-lg shadow-blue-600/30"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
            Launch Live Demo
          </Link>
          <p className="text-xs text-slate-500 mt-4">No login required. Three demo scenarios included.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 bg-slate-900 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-700 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <span className="text-sm font-display font-bold text-white">Nura</span>
          </div>
          <p className="text-xs text-slate-500">
            Autonomous Clinical Voice Agent — AI Agent Olympics 2025
          </p>
        </div>
      </footer>
    </div>
  );
}
