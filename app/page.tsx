import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] overflow-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-700 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <span className="text-xl font-display font-bold text-slate-900 tracking-tight">Nura</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#market" className="hidden sm:inline text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Market</a>
            <a href="#technology" className="hidden sm:inline text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Technology</a>
            <a href="#roadmap" className="hidden sm:inline text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Roadmap</a>
            <Link
              href="/demo"
              className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors duration-200 shadow-sm"
            >
              Try Live Demo
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center px-6 pt-24 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Speechmatics Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-semibold text-blue-800">Built on Speechmatics Medical Model — 98% accuracy</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-slate-900 leading-[1.08] tracking-tight mb-6">
            The Doctor Speaks.
            <br />
            <span className="text-blue-700">Nura Does Everything Else.</span>
          </h1>

          {/* Market positioning stat */}
          <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10">
            Ambient AI scribes generated $600M in revenue in 2025. They only transcribe.
            <br className="hidden sm:block" />
            <span className="text-slate-800 font-semibold">Nura transcribes, reasons, and acts.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link
              href="/demo"
              className="group px-8 py-4 bg-blue-700 hover:bg-blue-800 text-white text-base font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-700/20 hover:shadow-xl hover:shadow-blue-700/30 flex items-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
              See It In Action — 60 Seconds
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

          {/* The Problem — verified stats, no banned side-stripe borders */}
          <div className="max-w-4xl mx-auto">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6 text-left">The crisis</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
                <p className="text-3xl font-display font-bold text-slate-900">3+ hrs</p>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">per day spent on documentation alone</p>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">J Gen Intern Med, 2023</p>
              </div>
              <div className="p-5 rounded-xl bg-white border border-red-200 shadow-sm">
                <p className="text-3xl font-display font-bold text-slate-900">251,454</p>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">deaths/year from medical errors (3rd leading cause, US)</p>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">Makary &amp; Daniel, BMJ/Johns Hopkins, 2016</p>
              </div>
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
                <p className="text-3xl font-display font-bold text-slate-900">43%</p>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">of physicians experience burnout across 10 high-income countries</p>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">Commonwealth Fund, 2025</p>
              </div>
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
                <p className="text-3xl font-display font-bold text-slate-900">1M</p>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">health workers short by 2030 in WHO European Region</p>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">WHO Europe, 2026</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beyond AI Scribes — with market context */}
      <section id="how-it-works" className="relative z-10 py-20 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-4">Beyond AI Scribes</h2>
            <p className="text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
              The $600M ambient scribe market is already commoditizing; 67% of providers plan to switch vendors.
              The next opportunity isn&apos;t better transcription. It&apos;s autonomous clinical intelligence.
            </p>
            <p className="text-xs text-slate-400 mt-2">Menlo Ventures, State of AI in Healthcare, Oct 2025</p>
          </div>

          {/* Comparison: scribes vs Nura */}
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
              <p className="text-sm text-blue-600 mb-3">Nura — zero commands</p>
              <div className="text-sm text-blue-800 font-mono bg-white px-3 py-2 rounded-lg border border-blue-200 font-semibold">
                Voice → Notes + Decisions + Actions
              </div>
            </div>
          </div>

          {/* Pipeline Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { num: "01", title: "Listen", desc: "Real-time streaming transcription with speaker diarization" },
              { num: "02", title: "Extract", desc: "Medications, symptoms, allergies, conditions" },
              { num: "03", title: "Cross-Reference", desc: "Drug interactions & allergy conflicts checked instantly" },
              { num: "04", title: "Decide", desc: "Urgency classification, referral routing, gap analysis" },
              { num: "05", title: "Act", desc: "SOAP notes, record updates, referrals, appointments" },
            ].map((step, i) => (
              <div key={i} className="relative p-4 rounded-xl bg-slate-50 border border-slate-200 group hover:bg-blue-50 hover:border-blue-200 transition-colors duration-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{step.num}</p>
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

      {/* Competitive Matrix */}
      <section className="relative z-10 py-20 border-t border-slate-200 bg-[#f8fafc]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-4">Why This Isn&apos;t Just Another Scribe</h2>
            <p className="text-base text-slate-500">Documentation is table stakes. Clinical reasoning is the differentiator.</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-5 py-4 font-semibold text-slate-700">Capability</th>
                  <th className="px-4 py-4 text-center font-semibold text-slate-500">Abridge</th>
                  <th className="px-4 py-4 text-center font-semibold text-slate-500">DAX Copilot</th>
                  <th className="px-4 py-4 text-center font-semibold text-slate-500">Nabla</th>
                  <th className="px-4 py-4 text-center font-semibold text-blue-700">Nura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { cap: "Real-time transcription", a: true, d: true, n: true, nura: true },
                  { cap: "Speaker diarization", a: true, d: true, n: true, nura: true },
                  { cap: "SOAP note generation", a: true, d: true, n: true, nura: true },
                  { cap: "Drug interaction detection", a: false, d: false, n: false, nura: true },
                  { cap: "Allergy conflict alerts", a: false, d: false, n: false, nura: true },
                  { cap: "Autonomous referral routing", a: false, d: false, n: false, nura: true },
                  { cap: "Patient record auto-update", a: false, d: false, n: false, nura: true },
                  { cap: "Follow-up scheduling", a: false, d: false, n: false, nura: true },
                  { cap: "Zero commands needed", a: false, d: false, n: false, nura: true },
                ].map((row, i) => (
                  <tr key={i} className={i >= 3 ? "bg-blue-50/30" : ""}>
                    <td className="px-5 py-3 text-slate-700 font-medium">{row.cap}</td>
                    <td className="px-4 py-3 text-center">{row.a ? <span className="text-slate-400">&#10003;</span> : <span className="text-slate-300">—</span>}</td>
                    <td className="px-4 py-3 text-center">{row.d ? <span className="text-slate-400">&#10003;</span> : <span className="text-slate-300">—</span>}</td>
                    <td className="px-4 py-3 text-center">{row.n ? <span className="text-slate-400">&#10003;</span> : <span className="text-slate-300">—</span>}</td>
                    <td className="px-4 py-3 text-center">{row.nura ? <span className="text-blue-700 font-bold">&#10003;</span> : <span className="text-slate-300">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Market Opportunity */}
      <section id="market" className="relative z-10 py-20 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-4">Market Opportunity</h2>
            <p className="text-base text-slate-500 max-w-2xl mx-auto">Documentation + Clinical Decision Support + Autonomous Actions = three markets in one product.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Total Addressable Market</p>
              <p className="text-4xl font-display font-bold text-slate-900">$16.25B</p>
              <p className="text-sm text-slate-500 mt-2">Ambient Clinical Intelligence by 2035</p>
            </div>
            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-200 text-center">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Serviceable Market (US)</p>
              <p className="text-4xl font-display font-bold text-blue-800">$2.87B</p>
              <p className="text-sm text-blue-600 mt-2">ACI market in 2025, growing 2.4x YoY</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Healthcare AI Spend</p>
              <p className="text-4xl font-display font-bold text-slate-900">$1.4B</p>
              <p className="text-sm text-slate-500 mt-2">Tripled from 2024; 85% goes to startups</p>
              <p className="text-[10px] text-slate-400 mt-1">Menlo Ventures, 2025</p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 text-center">
            <p className="text-sm text-amber-800 font-medium">
              Italy&apos;s AI in healthcare market: <span className="font-bold">EUR 3.19 billion by 2030</span>
              <span className="text-amber-600 text-xs ml-2">(Markets &amp; Markets, 2026)</span>
            </p>
          </div>
        </div>
      </section>

      {/* Speechmatics Technology Section */}
      <section id="technology" className="relative z-10 py-20 border-t border-slate-200 bg-[#f8fafc]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Foundation Technology</p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-4">Powered by Speechmatics Medical Model</h2>
            <p className="text-base text-slate-500 max-w-2xl mx-auto">
              Without Speechmatics, the entire pipeline breaks. It&apos;s not a component; it&apos;s the foundation
              that enables everything downstream.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {[
              { title: "98% Accuracy", desc: "2x better than nearest competitor on medical terminology. ICD-10 codes, drug names, dosages." },
              { title: "Real-Time Streaming", desc: "WebSocket API delivers words as they're spoken. Not batch processing; true real-time." },
              { title: "Speaker Diarization", desc: "Separates doctor from patient automatically. Enables role-aware clinical reasoning." },
              { title: "Medical Vocabulary", desc: "Custom dictionary boosted for clinical terms. Procedures, medications, anatomy." },
              { title: "Enterprise Reliability", desc: "Powers 100% of UK emergency calls. Zero-downtime, production-grade infrastructure." },
              { title: "55+ Languages", desc: "Multilingual support ready for EU expansion. HIPAA-compliant with zero data retention." },
            ].map((item, i) => (
              <div key={i} className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
                <h4 className="text-sm font-bold text-slate-800 mb-2">{item.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Architecture Diagram — visual flow */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-6">Processing Pipeline — 2-5 second end-to-end latency</p>
            <div className="flex flex-col gap-3">
              {/* Step 1 */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-700">1</span>
                </div>
                <div className="flex-1 px-4 py-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm font-semibold text-blue-800">Audio Stream → Speechmatics Medical Model</p>
                  <p className="text-xs text-blue-600">98% accuracy, real-time streaming, speaker diarization</p>
                </div>
              </div>
              {/* Step 2 */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-slate-600">2</span>
                </div>
                <div className="flex-1 px-4 py-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-sm font-semibold text-slate-800">Diarized Transcript (Doctor | Patient)</p>
                  <p className="text-xs text-slate-500">Timestamped, role-separated, medical terms recognized</p>
                </div>
              </div>
              {/* Step 3 */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-indigo-700">3</span>
                </div>
                <div className="flex-1 px-4 py-3 rounded-lg bg-indigo-50 border border-indigo-200">
                  <p className="text-sm font-semibold text-indigo-800">Gemini 3 Flash — Clinical Reasoning Engine</p>
                  <p className="text-xs text-indigo-600">Multimodal understanding with Featherless AI fallback</p>
                </div>
              </div>
              {/* Step 4 */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-emerald-700">4</span>
                </div>
                <div className="flex-1 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <p className="text-sm font-semibold text-emerald-800">Autonomous Agent Actions (parallel)</p>
                  <p className="text-xs text-emerald-600">Drug interactions · Allergy alerts · Urgency classification · Referral routing · Record updates · SOAP notes</p>
                </div>
              </div>
              {/* Step 5 */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-emerald-700">5</span>
                </div>
                <div className="flex-1 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <p className="text-sm font-semibold text-emerald-800">Real-time SSE → Frontend</p>
                  <p className="text-xs text-emerald-600">{'<'} 3 seconds from speech to clinical decision</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tech Stack Bar */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 text-sm font-semibold text-slate-500">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              Speechmatics
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              Gemini 3 Flash
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              Featherless AI
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              Vultr
            </span>
          </div>
        </div>
      </section>

      {/* Evidence-Based Impact */}
      <section className="relative z-10 py-20 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-4">Evidence-Based Impact</h2>
            <p className="text-base text-slate-500">Published research proves the category works. Nura goes further.</p>
          </div>

          {/* Research stats as clean rows */}
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">What peer-reviewed research shows</p>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                { stat: "13.4%", desc: "reduction in total EHR time per appointment", source: "JAMA, 2024" },
                { stat: "5.6 min", desc: "saved per appointment with virtual scribes", source: "JAMA Network Open, 2024" },
                { stat: "2.5x", desc: "greater time savings for power users per note", source: "medRxiv, 2025" },
                { stat: "600+", desc: "offices using AI scribes at Kaiser Permanente (40 hospitals)", source: "AHA, 2024" },
              ].map((row, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <p className="text-2xl font-display font-bold text-blue-700 w-24 flex-shrink-0">{row.stat}</p>
                  <p className="text-sm text-slate-700 flex-1">{row.desc}</p>
                  <p className="text-[10px] text-slate-400 font-medium flex-shrink-0">{row.source}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Nura's differentiator */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-6 items-start">
            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-200">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">Nura goes beyond</p>
              <p className="text-sm text-slate-700 leading-relaxed">
                Those systems only generate notes. Nura does everything they do <span className="font-semibold">plus</span> detects drug interactions,
                flags allergies, routes referrals, and books follow-ups — autonomously.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-center min-w-[200px]">
              <p className="text-xs text-red-600 font-semibold uppercase tracking-wider mb-2">Preventable errors</p>
              <p className="text-3xl font-display font-bold text-slate-900">44K–98K</p>
              <p className="text-xs text-slate-600 mt-1">hospital deaths/year (US)</p>
              <p className="text-[10px] text-slate-400 mt-1">StatPearls, 2024</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise ROI */}
      <section className="relative z-10 py-20 border-t border-slate-200 bg-[#f8fafc]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-3">Enterprise ROI</h2>
            <p className="text-base text-slate-500">For a 200-doctor hospital</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
              <p className="text-4xl font-display font-bold text-blue-700">400h</p>
              <p className="text-sm text-slate-600 mt-2">documentation hours saved per day</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
              <p className="text-4xl font-display font-bold text-slate-900">$60K</p>
              <p className="text-sm text-slate-600 mt-2">saved per day at $150/hr physician cost</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-emerald-200 shadow-sm text-center">
              <p className="text-4xl font-display font-bold text-emerald-700">$15.6M</p>
              <p className="text-sm text-slate-600 mt-2">annual savings per hospital</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
              <p className="text-4xl font-display font-bold text-slate-900">$500K+</p>
              <p className="text-sm text-slate-600 mt-2">cost to replace one physician</p>
              <p className="text-[10px] text-slate-400 mt-1">Mayo Clinic Proceedings, 2022</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 text-center">
            <p className="text-sm text-slate-600">
              PCP burnout costs US healthcare <span className="font-bold text-slate-800">$260M/year</span> in excess spending from turnover alone.
              <span className="text-xs text-slate-400 ml-2">Sinsky et al., Mayo Clinic Proceedings, 2022</span>
            </p>
          </div>
        </div>
      </section>

      {/* Demo Scenarios */}
      <section className="relative z-10 py-20 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-4">60 Seconds to Clinical Intelligence</h2>
            <p className="text-base text-slate-500">No login. No setup. Three real scenarios.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="p-6 rounded-2xl bg-red-50 border border-red-200">
              <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-3">Demo 1</p>
              <h4 className="text-base font-bold text-slate-800 mb-2">Drug Interaction Detection</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Lisinopril + Ibuprofen prescribed in conversation. Nura catches the interaction and alerts in real-time.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200">
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-3">Demo 2</p>
              <h4 className="text-base font-bold text-slate-800 mb-2">Allergy Conflict Alert</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Sulfa drug prescribed to patient with documented sulfa allergy. Nura flags it before the prescription leaves the room.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-purple-50 border border-purple-200">
              <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-3">Demo 3</p>
              <h4 className="text-base font-bold text-slate-800 mb-2">Urgent Cardiac Referral</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Patient describes chest pain on exertion. Nura classifies urgency and routes a cardiology referral autonomously.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/demo"
              className="inline-flex items-center gap-3 px-8 py-4 bg-blue-700 hover:bg-blue-800 text-white text-base font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-700/20"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
              Launch Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Future Roadmap */}
      <section id="roadmap" className="relative z-10 py-20 border-t border-slate-200 bg-[#f8fafc]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-4">Roadmap</h2>
            <p className="text-base text-slate-500">From hackathon to enterprise deployment.</p>
          </div>

          <div className="space-y-4">
            {[
              { phase: "Now", title: "Single-Encounter Analysis", desc: "Real-time transcription, clinical reasoning, autonomous actions on pre-loaded patient scenarios.", active: true },
              { phase: "Q3 2026", title: "Multi-Language & EHR Integration", desc: "Speechmatics 55+ language support. FHIR/HL7 interop for real EHR systems." },
              { phase: "Q4 2026", title: "Live Mic & Batch Processing", desc: "Real-time microphone input (already prototyped). Multi-patient batch analysis for hospital shifts." },
              { phase: "2027", title: "Full EHR & Payer Integration", desc: "Prior authorization automation. Payer-provider AI coordination. Clinical trial matching." },
              { phase: "2027+", title: "On-Premise Enterprise", desc: "Speechmatics supports on-prem. Hospital-grade deployment with data sovereignty guarantees." },
            ].map((item, i) => (
              <div key={i} className={`flex gap-5 p-5 rounded-xl border ${item.active ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
                <div className="flex-shrink-0 w-20 text-right">
                  <p className={`text-xs font-bold uppercase tracking-wider ${item.active ? 'text-blue-700' : 'text-slate-400'}`}>{item.phase}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 mb-1">{item.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-24 bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-5">Doctors Are Burning Out.<br/>Patients Are Paying The Price.</h2>
          <p className="text-base text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed">
            251,454 deaths per year from medical errors. 1 million health workers short in Europe by 2030.
            The $600M scribe market only transcribes. Nura transcribes, reasons, and acts.
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
          <p className="text-xs text-slate-500 mt-4">No login. No setup. Three real scenarios included.</p>
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
