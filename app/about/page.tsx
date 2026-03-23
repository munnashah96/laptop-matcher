import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass rounded-3xl p-6 md:p-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">
          About Laptop Matcher
        </h1>

        <div className="space-y-6 text-white/90">
          <p className="text-lg leading-relaxed">
            Laptop Matcher is an AI‑powered recommendation engine that helps you find the perfect laptop based on your unique needs. Whether you're a gamer, a creative professional, a student, or just looking for a reliable everyday machine, our smart algorithm analyses your preferences and delivers personalised suggestions.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white/10 rounded-xl p-5">
              <h2 className="text-xl font-semibold text-white mb-3">🎯 How it works</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Answer a few quick questions about your budget, desired specs, and how you'll use the laptop.</li>
                <li>Our matching engine scores laptops from our curated database against your criteria.</li>
                <li>We show you the top matches, each with a clear explanation of why it fits your needs.</li>
                <li>Click through to retailers like Amazon, Newegg, and Best Buy to check current prices and availability.</li>
              </ol>
            </div>

            <div className="bg-white/10 rounded-xl p-5">
              <h2 className="text-xl font-semibold text-white mb-3">🤖 Powered by AI</h2>
              <p className="text-sm mb-3">
                Laptop Matcher uses Google's Gemini AI to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Understand natural language queries – just tell us what you want in plain English.</li>
                <li>Generate personalised “Why this laptop?” summaries that highlight why each recommendation matches your needs.</li>
                <li>Allow you to refine results conversationally (“Make them cheaper”, “Show only Dell laptops”).</li>
              </ul>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-5 mt-6">
            <h2 className="text-xl font-semibold text-white mb-3">🛠️ Technology</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div>⚛️ Next.js (React)</div>
              <div>🐘 PostgreSQL</div>
              <div>📦 Prisma ORM</div>
              <div>🎨 Tailwind CSS</div>
              <div>🤖 Google Gemini AI</div>
              <div>📊 Google Analytics 4</div>
            </div>
          </div>

          <div className="text-center mt-8 pt-4 border-t border-white/20">
            <p className="text-sm text-white/80 mb-4">
              Have feedback or suggestions? We'd love to hear from you!
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold hover:opacity-90 transition shadow-lg"
            >
              Find Your Laptop →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}