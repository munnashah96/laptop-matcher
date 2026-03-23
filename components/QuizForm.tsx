'use client'

import { useState, useEffect, useMemo } from 'react'

type Preferences = {
  maxPrice: number
  minRam: number
  minStorage: number
  brands: string[]
  purpose: string
}

type Laptop = {
  id: number
  brand: string
  model: string
  processor: string
  ram_gb: number
  storage_gb: number
  storage_type: string
  graphics: string
  price_usd: number
  weight_kg: number
  screen_inches: number
  affiliate_link: string | null
  image_url: string | null
  amazon_url: string | null
  newegg_url: string | null
  bestbuy_url: string | null
  score?: number
}

export default function QuizForm() {
  // --- State (unchanged) ---
  const [prefs, setPrefs] = useState<Preferences>({
    maxPrice: 1500,
    minRam: 8,
    minStorage: 256,
    brands: [],
    purpose: 'general',
  })
  const [step, setStep] = useState(1)
  const [recommendations, setRecommendations] = useState<Laptop[]>([])
  const [loading, setLoading] = useState(false)

  // AI related
  const [aiQuery, setAiQuery] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [showAiInput, setShowAiInput] = useState(false)
  const [aiParsed, setAiParsed] = useState<Preferences | null>(null)

  // Explanations (AI generated)
  const [explanations, setExplanations] = useState<Record<number, string>>({})

  // Refinement
  const [refinementQuery, setRefinementQuery] = useState('')
  const [refining, setRefining] = useState(false)

  // Sorting & filtering
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'ram_asc' | 'ram_desc' | 'storage_asc' | 'storage_desc'>('price_asc')
  const [filterBrand, setFilterBrand] = useState<string>('all')
  const [filterMinPrice, setFilterMinPrice] = useState<number | null>(null)

  const [quotaExceeded, setQuotaExceeded] = useState(false)
  const brandsList = ['Dell', 'HP', 'Lenovo', 'Apple', 'Asus', 'Acer', 'MSI', 'Razer']
  const MAX_AI_EXPLANATIONS = 3

  // --- LocalStorage helpers (unchanged) ---
  const savePrefsToLocalStorage = (newPrefs: Preferences) => {
    localStorage.setItem('laptopMatcherPrefs', JSON.stringify(newPrefs))
  }

  useEffect(() => {
    const savedPrefs = localStorage.getItem('laptopMatcherPrefs')
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs)
        setPrefs(parsed)
      } catch (e) {}
    }
  }, [])

  // --- Handlers (unchanged) ---
  const handleBrandToggle = (brand: string) => {
    setPrefs(prev => {
      const newBrands = prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand]
      const newPrefs = { ...prev, brands: newBrands }
      savePrefsToLocalStorage(newPrefs)
      return newPrefs
    })
  }

  // AI parsing (unchanged)
  const handleAiQuery = async () => {
    if (!aiQuery.trim()) return
    setAiLoading(true)
    try {
      const response = await fetch('/api/ask-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiQuery }),
      })
      const data = await response.json()
      if (response.ok) {
        setAiParsed({
          maxPrice: data.maxPrice ?? prefs.maxPrice,
          minRam: data.minRam ?? prefs.minRam,
          minStorage: data.minStorage ?? prefs.minStorage,
          brands: data.brands ?? prefs.brands,
          purpose: data.purpose ?? prefs.purpose,
        })
      } else {
        console.error('AI parsing failed:', data.error)
      }
    } catch (error) {
      console.error('AI request failed', error)
    } finally {
      setAiLoading(false)
    }
  }

  const applyAiPreferences = () => {
    if (aiParsed) {
      const newPrefs = { ...prefs, ...aiParsed }
      setPrefs(newPrefs)
      savePrefsToLocalStorage(newPrefs)
      setAiParsed(null)
      setStep(3)
    }
  }

  const cancelAiPreferences = () => {
    setAiParsed(null)
  }

  // --- Rule‑based explanation (unchanged) ---
  const generateWhyThisLaptop = (laptop: Laptop, prefs: Preferences): string => {
    const reasons: string[] = []
    if (laptop.price_usd <= prefs.maxPrice) {
      reasons.push(`✅ Within your budget ($${laptop.price_usd})`)
    } else {
      reasons.push(`⚠️ Slightly above budget, but great value`)
    }
    if (laptop.ram_gb >= prefs.minRam) {
      reasons.push(`💾 ${laptop.ram_gb}GB RAM (meets your minimum)`)
    } else {
      reasons.push(`💾 ${laptop.ram_gb}GB RAM – still good for light tasks`)
    }
    if (laptop.storage_gb >= prefs.minStorage) {
      reasons.push(`💽 ${laptop.storage_gb}GB ${laptop.storage_type} storage`)
    } else {
      reasons.push(`💽 ${laptop.storage_gb}GB ${laptop.storage_type} storage – enough for most users`)
    }
    if (prefs.brands.length > 0 && prefs.brands.includes(laptop.brand)) {
      reasons.push(`🏷️ Your preferred brand: ${laptop.brand}`)
    }
    switch (prefs.purpose) {
      case 'gaming':
        if (laptop.graphics.includes('RTX') || laptop.graphics.includes('GTX')) {
          reasons.push(`🎮 Great for gaming: ${laptop.graphics} graphics`)
        } else if (laptop.graphics.includes('Integrated')) {
          reasons.push(`🎮 Integrated graphics – fine for casual gaming`)
        } else {
          reasons.push(`🎮 ${laptop.graphics} – suitable for many games`)
        }
        if (laptop.ram_gb >= 16) {
          reasons.push(`🚀 16GB+ RAM ideal for gaming`)
        }
        break
      case 'office':
        if (laptop.weight_kg <= 2.0) {
          reasons.push(`💼 Lightweight (${laptop.weight_kg}kg) – easy to carry`)
        }
        if (laptop.graphics.includes('Integrated')) {
          reasons.push(`🔋 Integrated graphics saves battery for office work`)
        }
        break
      case 'portable':
        if (laptop.weight_kg <= 1.5) {
          reasons.push(`✈️ Ultra‑light (${laptop.weight_kg}kg) – perfect for travel`)
        }
        if (laptop.screen_inches <= 14) {
          reasons.push(`📱 Compact ${laptop.screen_inches}" screen, easy to pack`)
        }
        break
      default:
        if (laptop.weight_kg <= 2.0) {
          reasons.push(`⚖️ Reasonable weight (${laptop.weight_kg}kg)`)
        }
        break
    }
    if (reasons.length === 0) {
      reasons.push(`🤖 Solid all‑rounder laptop`)
    }
    return reasons.join(' · ')
  }

  // --- AI explanation fetching with caching (unchanged) ---
  const getExplanationCacheKey = (laptop: Laptop, prefs: Preferences) => {
    const prefsKey = `${prefs.maxPrice}|${prefs.minRam}|${prefs.minStorage}|${prefs.brands.join(',')}|${prefs.purpose}`
    return `explanation_${laptop.id}_${prefsKey}`
  }

  const fetchExplanations = async (laptops: Laptop[], currentPrefs: Preferences) => {
    if (quotaExceeded) return
    const newExplanations: Record<number, string> = {}
    const toFetch = laptops.slice(0, MAX_AI_EXPLANATIONS)
    for (const laptop of toFetch) {
      const cacheKey = getExplanationCacheKey(laptop, currentPrefs)
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        newExplanations[laptop.id] = cached
        continue
      }
      try {
        const res = await fetch('/api/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ laptop, prefs: currentPrefs }),
        })
        const data = await res.json()
        if (res.ok) {
          newExplanations[laptop.id] = data.explanation
          localStorage.setItem(cacheKey, data.explanation)
        } else {
          if (res.status === 429) setQuotaExceeded(true)
          newExplanations[laptop.id] = generateWhyThisLaptop(laptop, currentPrefs)
        }
      } catch {
        newExplanations[laptop.id] = generateWhyThisLaptop(laptop, currentPrefs)
      }
      setExplanations(prev => ({ ...prev, ...newExplanations }))
    }
    for (let i = MAX_AI_EXPLANATIONS; i < laptops.length; i++) {
      const laptop = laptops[i]
      newExplanations[laptop.id] = generateWhyThisLaptop(laptop, currentPrefs)
      setExplanations(prev => ({ ...prev, [laptop.id]: newExplanations[laptop.id] }))
    }
  }

  // --- Form submission (unchanged) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    savePrefsToLocalStorage(prefs)

    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxPrice: prefs.maxPrice,
          minRam: prefs.minRam,
          minStorage: prefs.minStorage,
          brands: prefs.brands,
          purpose: prefs.purpose,
          topN: 50,
        }),
      })
      if (!response.ok) throw new Error('Failed to fetch recommendations')
      const data: Laptop[] = await response.json()
      setRecommendations(data)
      setExplanations({})
      await fetchExplanations(data, prefs)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // --- Refinement (unchanged) ---
  const handleRefinement = async () => {
    if (!refinementQuery.trim() || recommendations.length === 0 || quotaExceeded) return
    setRefining(true)
    try {
      const response = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: refinementQuery,
          laptops: recommendations,
          prefs,
        }),
      })
      const result = await response.json()
      if (result.error) {
        console.error('Refinement AI failed:', result.error)
        setRefinementQuery('')
        setRefining(false)
        return
      }

      let newPrefs = { ...prefs }
      if (result.criteria) {
        const { maxPrice, minRam, minStorage, brands, purpose, maxWeight, minScreen } = result.criteria
        if (maxPrice !== undefined) newPrefs.maxPrice = maxPrice
        if (minRam !== undefined) newPrefs.minRam = minRam
        if (minStorage !== undefined) newPrefs.minStorage = minStorage
        if (brands !== undefined) newPrefs.brands = brands
        if (purpose !== undefined) newPrefs.purpose = purpose
      }

      const matchRes = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxPrice: newPrefs.maxPrice,
          minRam: newPrefs.minRam,
          minStorage: newPrefs.minStorage,
          brands: newPrefs.brands,
          purpose: newPrefs.purpose,
          topN: 50,
        }),
      })
      const newRecommendations = await matchRes.json()
      setRecommendations(newRecommendations)
      setPrefs(newPrefs)
      savePrefsToLocalStorage(newPrefs)
      setExplanations({})
      await fetchExplanations(newRecommendations, newPrefs)
      setRefinementQuery('')
    } catch (error) {
      console.error('Refinement error:', error)
    } finally {
      setRefining(false)
    }
  }

  // --- Reset (unchanged) ---
  const resetPreferences = () => {
    const defaultPrefs: Preferences = {
      maxPrice: 1500,
      minRam: 8,
      minStorage: 256,
      brands: [],
      purpose: 'general',
    }
    setPrefs(defaultPrefs)
    savePrefsToLocalStorage(defaultPrefs)
    setStep(1)
    setRecommendations([])
    setExplanations({})
  }

  // --- Sorting & filtering (unchanged) ---
  const filteredAndSortedRecommendations = useMemo(() => {
    let filtered = [...recommendations]
    if (filterBrand !== 'all') {
      filtered = filtered.filter(laptop => laptop.brand === filterBrand)
    }
    if (filterMinPrice !== null) {
      filtered = filtered.filter(laptop => laptop.price_usd >= filterMinPrice)
    }
    switch (sortBy) {
      case 'price_asc': filtered.sort((a, b) => a.price_usd - b.price_usd); break
      case 'price_desc': filtered.sort((a, b) => b.price_usd - a.price_usd); break
      case 'ram_asc': filtered.sort((a, b) => a.ram_gb - b.ram_gb); break
      case 'ram_desc': filtered.sort((a, b) => b.ram_gb - a.ram_gb); break
      case 'storage_asc': filtered.sort((a, b) => a.storage_gb - b.storage_gb); break
      case 'storage_desc': filtered.sort((a, b) => b.storage_gb - a.storage_gb); break
    }
    return filtered
  }, [recommendations, sortBy, filterBrand, filterMinPrice])

  // --- Click tracking for product links (unchanged) ---
  const handleClickLink = (laptop: Laptop, store: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'select_content', {
        content_type: 'product_link',
        content_id: laptop.id,
        items: [
          {
            item_id: laptop.id.toString(),
            item_name: `${laptop.brand} ${laptop.model}`,
            price: laptop.price_usd,
            brand: laptop.brand,
            item_category: 'laptop',
          },
        ],
        store: store,
      })
    }
  }

  // --- Render (compact styles) ---
  return (
    <div className="space-y-6">
      {/* Quiz Form */}
      <div className="glass rounded-3xl p-4 md:p-6 max-w-3xl mx-auto">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-3 text-center">
          Tell us about your dream laptop
        </h2>

        {/* AI Assistant Section */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowAiInput(!showAiInput)}
            className="text-white/80 hover:text-white text-xs underline"
          >
            {showAiInput ? 'Hide AI Assistant' : '✨ Ask AI for help'}
          </button>
          {showAiInput && (
            <div className="mt-2">
              <textarea
                rows={2}
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Describe your ideal laptop in natural language, e.g., 'I need a gaming laptop under $1500 with at least 16GB RAM and a good graphics card'"
                className="w-full px-3 py-2 text-sm rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                type="button"
                onClick={handleAiQuery}
                disabled={aiLoading}
                className="mt-2 px-3 py-1.5 rounded-full bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition disabled:opacity-50"
              >
                {aiLoading ? 'Parsing...' : '🤖 Understand My Needs'}
              </button>

              {aiParsed && (
                <div className="mt-3 p-3 bg-white/20 rounded-lg backdrop-blur-sm border border-white/30">
                  <p className="text-white font-semibold text-sm mb-1">✨ I understood:</p>
                  <ul className="text-xs text-white/90 space-y-0.5">
                    <li>💰 Budget: ${aiParsed.maxPrice}</li>
                    <li>💾 RAM: {aiParsed.minRam} GB</li>
                    <li>💽 Storage: {aiParsed.minStorage} GB</li>
                    <li>🏷️ Brands: {aiParsed.brands.length ? aiParsed.brands.join(', ') : 'Any'}</li>
                    <li>🎯 Purpose: {aiParsed.purpose}</li>
                  </ul>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={applyAiPreferences}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded-full hover:bg-green-700"
                    >
                      Apply & Continue
                    </button>
                    <button
                      onClick={cancelAiPreferences}
                      className="px-3 py-1 bg-gray-600 text-white text-xs rounded-full hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex justify-between mb-6 text-white/70">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-sm
                ${step >= i ? 'bg-white text-indigo-600 border-white' : 'border-white/30 text-white/50'}`}
              >
                {i}
              </div>
              {i < 3 && <div className={`w-10 h-0.5 mx-1 ${step > i ? 'bg-white' : 'bg-white/30'}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div key={step} className="animate-fadeIn">
            {/* Step 1: Budget & RAM */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-semibold text-sm mb-1">
                    Max Budget: ${prefs.maxPrice}
                  </label>
                  <input
                    type="range"
                    min="300"
                    max="5000"
                    step="100"
                    value={prefs.maxPrice}
                    onChange={e => setPrefs({ ...prefs, maxPrice: Number(e.target.value) })}
                    className="w-full accent-white"
                  />
                  <div className="flex justify-between text-white/80 text-xs mt-0.5">
                    <span>$300</span>
                    <span>$5000</span>
                  </div>
                </div>

                <div>
                  <label className="block text-white font-semibold text-sm mb-1">Minimum RAM</label>
                  <select
                    value={prefs.minRam}
                    onChange={e => setPrefs({ ...prefs, minRam: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-white/50 [&_option]:text-gray-800"
                  >
                    <option value="4">4 GB</option>
                    <option value="8">8 GB</option>
                    <option value="16">16 GB</option>
                    <option value="32">32 GB</option>
                    <option value="64">64 GB</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Storage & Brand */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-semibold text-sm mb-1">Minimum Storage</label>
                  <select
                    value={prefs.minStorage}
                    onChange={e => setPrefs({ ...prefs, minStorage: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white focus:outline-none [&_option]:text-gray-800"
                  >
                    <option value="256">256 GB</option>
                    <option value="512">512 GB</option>
                    <option value="1024">1 TB</option>
                    <option value="2048">2 TB</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-semibold text-sm mb-1">Preferred Brands (optional)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2">
                    {brandsList.map(brand => (
                      <label key={brand} className="flex items-center space-x-1 text-white text-sm">
                        <input
                          type="checkbox"
                          checked={prefs.brands.includes(brand)}
                          onChange={() => handleBrandToggle(brand)}
                          className="w-3.5 h-3.5 rounded border-white/30 bg-white/20 text-indigo-600 focus:ring-white"
                        />
                        <span className="text-xs">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Purpose */}
            {step === 3 && (
              <div>
                <label className="block text-white font-semibold text-sm mb-2">Primary Use</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2">
                  {['general', 'gaming', 'office', 'portable'].map(p => (
                    <label key={p} className="flex items-center space-x-1 text-white text-sm">
                      <input
                        type="radio"
                        name="purpose"
                        value={p}
                        checked={prefs.purpose === p}
                        onChange={e => setPrefs({ ...prefs, purpose: e.target.value })}
                        className="w-3.5 h-3.5 text-indigo-600 border-white/30 bg-white/20 focus:ring-white"
                      />
                      <span className="text-xs capitalize">{p}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between pt-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 transition text-sm"
              >
                Previous
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="ml-auto px-4 py-2 rounded-full bg-white text-indigo-600 font-semibold hover:bg-white/90 transition shadow-lg text-sm"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="ml-auto px-5 py-2 rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold hover:opacity-90 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? 'Finding...' : 'Find Laptops'}
              </button>
            )}
          </div>
        </form>

        {/* Reset button */}
        <div className="mt-4 text-center">
          <button
            onClick={resetPreferences}
            className="text-white/70 hover:text-white text-xs underline"
          >
            Reset all preferences
          </button>
        </div>
      </div>

      {/* Loading & Empty States (unchanged) */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent"></div>
        </div>
      )}

      {!loading && recommendations.length === 0 && (
        <div className="text-center py-8">
          <p className="text-white/80 text-base">
            No laptops found matching your criteria. Try adjusting your preferences!
          </p>
        </div>
      )}

      {/* Recommendations Section (unchanged) */}
      {!loading && recommendations.length > 0 && (
        <div className="max-w-6xl mx-auto mt-8">
          {/* Sorting & Filtering Controls */}
          <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
            <h3 className="text-xl font-bold text-white">Top Picks for You</h3>
            <div className="flex gap-2 text-xs">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30 focus:outline-none [&_option]:text-gray-800"
              >
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="ram_asc">RAM: Low to High</option>
                <option value="ram_desc">RAM: High to Low</option>
                <option value="storage_asc">Storage: Low to High</option>
                <option value="storage_desc">Storage: High to Low</option>
              </select>
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30 focus:outline-none [&_option]:text-gray-800"
              >
                <option value="all">All Brands</option>
                {brandsList.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Min price"
                value={filterMinPrice ?? ''}
                onChange={(e) => setFilterMinPrice(e.target.value ? Number(e.target.value) : null)}
                className="px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30 focus:outline-none w-20 text-sm [&_option]:text-gray-800"
              />
            </div>
          </div>

          {/* Refinement Input */}
          <div className="mt-4 mb-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={refinementQuery}
                onChange={(e) => setRefinementQuery(e.target.value)}
                placeholder="Ask a follow‑up, e.g., 'Show me lighter options'"
                className="flex-1 px-3 py-1.5 text-sm rounded-full bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                onClick={handleRefinement}
                disabled={refining || quotaExceeded}
                className="px-4 py-1.5 rounded-full bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 transition disabled:opacity-50"
              >
                {refining ? 'Refining...' : 'Refine Results'}
              </button>
            </div>
            <p className="text-white/60 text-xs mt-1">
              Example: “Make them cheaper”, “Show only Dell”, “I need a lighter laptop”
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedRecommendations.map((laptop, index) => (
              <div
                key={laptop.id}
                className="card rounded-2xl p-3 shadow-xl border border-white/30 bg-white/90 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-2xl animate-fadeInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <img
                  src={laptop.image_url || '/placeholder.jpg'}
                  alt={`${laptop.brand} ${laptop.model}`}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                  onError={(e) => { e.currentTarget.src = '/placeholder.jpg' }}
                />
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xl font-bold text-gray-800">{laptop.brand}</span>
                  <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                    ${laptop.price_usd}
                  </span>
                </div>
                <p className="text-gray-600 text-xs mb-2">{laptop.model}</p>

                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs text-gray-700 mb-3">
                  <div><span className="font-medium">Processor:</span> {laptop.processor}</div>
                  <div><span className="font-medium">RAM:</span> {laptop.ram_gb} GB</div>
                  <div><span className="font-medium">Storage:</span> {laptop.storage_gb} GB {laptop.storage_type}</div>
                  <div><span className="font-medium">Graphics:</span> {laptop.graphics}</div>
                  <div><span className="font-medium">Weight:</span> {laptop.weight_kg} kg</div>
                  <div><span className="font-medium">Screen:</span> {laptop.screen_inches}"</div>
                </div>

                <div className="flex gap-1 mt-2">
                  {laptop.amazon_url && (
                    <a
                      href={laptop.amazon_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleClickLink(laptop, 'Amazon')}
                      className="flex-1 text-center px-2 py-1 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 transition"
                    >
                      🛒 Amazon
                    </a>
                  )}
                  {laptop.newegg_url && (
                    <a
                      href={laptop.newegg_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleClickLink(laptop, 'Newegg')}
                      className="flex-1 text-center px-2 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition"
                    >
                      🔧 Newegg
                    </a>
                  )}
                  {laptop.bestbuy_url && (
                    <a
                      href={laptop.bestbuy_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleClickLink(laptop, 'BestBuy')}
                      className="flex-1 text-center px-2 py-1 bg-yellow-500 text-white text-xs rounded-lg hover:bg-yellow-600 transition"
                    >
                      📺 Best Buy
                    </a>
                  )}
                </div>

                <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
                  <p className="font-semibold text-indigo-600 mb-0.5">✨ Why this laptop?</p>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    {explanations[laptop.id] || generateWhyThisLaptop(laptop, prefs)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}