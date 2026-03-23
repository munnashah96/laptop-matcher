'use client'

import { useState, useEffect } from 'react'

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
  image_url: string | null
  amazon_url: string | null
  newegg_url: string | null
  bestbuy_url: string | null
}

export default function TrendingPicks() {
  const [trending, setTrending] = useState<Laptop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/trending')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch trending')
        return res.json()
      })
      .then(data => {
        // Ensure data is an array (even if empty)
        setTrending(Array.isArray(data) ? data : [])
      })
      .catch(err => {
        console.error('Error fetching trending:', err)
        setTrending([]) // fallback to empty array
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-12">
        <h3 className="text-2xl font-bold text-white mb-4">🔥 Trending picks</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="card rounded-2xl p-5 shadow-xl border border-white/30 bg-white/90 backdrop-blur-sm animate-pulse">
              <div className="w-full h-40 bg-gray-300 rounded-lg mb-3"></div>
              <div className="h-6 bg-gray-300 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-full mb-1"></div>
              <div className="h-4 bg-gray-300 rounded w-full mb-1"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (trending.length === 0) return null // don't show anything if no trending picks

  return (
    <div className="max-w-6xl mx-auto mt-12">
      <h3 className="text-2xl font-bold text-white mb-4">🔥 Trending picks</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {trending.map((laptop) => (
          <div
            key={laptop.id}
            className="card rounded-2xl p-5 shadow-xl border border-white/30 bg-white/90 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-2xl"
          >
            <img
              src={laptop.image_url || '/placeholder.jpg'}
              alt={`${laptop.brand} ${laptop.model}`}
              className="w-full h-40 object-cover rounded-lg mb-3"
              onError={(e) => { e.currentTarget.src = '/placeholder.jpg' }}
            />
            <div className="flex justify-between items-start mb-3">
              <span className="text-2xl font-bold text-gray-800">{laptop.brand}</span>
              <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                ${laptop.price_usd}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-3">{laptop.model}</p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs md:text-sm text-gray-700 mb-4">
              <div><span className="font-medium">Processor:</span> {laptop.processor}</div>
              <div><span className="font-medium">RAM:</span> {laptop.ram_gb} GB</div>
              <div><span className="font-medium">Storage:</span> {laptop.storage_gb} GB {laptop.storage_type}</div>
              <div><span className="font-medium">Graphics:</span> {laptop.graphics}</div>
              <div><span className="font-medium">Weight:</span> {laptop.weight_kg} kg</div>
              <div><span className="font-medium">Screen:</span> {laptop.screen_inches}"</div>
            </div>
            <div className="flex gap-2 mt-3">
              {laptop.amazon_url && (
                <a
                  href={laptop.amazon_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center px-3 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition"
                >
                  🛒 Amazon
                </a>
              )}
              {laptop.newegg_url && (
                <a
                  href={laptop.newegg_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition"
                >
                  🔧 Newegg
                </a>
              )}
              {laptop.bestbuy_url && (
                <a
                  href={laptop.bestbuy_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center px-3 py-2 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition"
                >
                  📺 Best Buy
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}