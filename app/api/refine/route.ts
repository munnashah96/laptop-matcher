import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

export async function POST(request: NextRequest) {
  try {
    const { query, laptops, prefs } = await request.json()

    const laptopsSummary = laptops.map((l: any, idx: number) =>
      `${idx + 1}. ${l.brand} ${l.model}: $${l.price_usd}, ${l.ram_gb}GB RAM, ${l.storage_gb}GB ${l.storage_type}, ${l.graphics}, ${l.weight_kg}kg, ${l.screen_inches}"`
    ).join('\n')

    const prompt = `
You are a laptop recommendation assistant. The user currently sees these laptops:

${laptopsSummary}

User preferences: budget $${prefs.maxPrice}, min RAM ${prefs.minRam}GB, min storage ${prefs.minStorage}GB, brands: ${prefs.brands.join(', ') || 'any'}, purpose: ${prefs.purpose}.

The user now asks: "${query}"

Based on this query, you need to refine the list. Return a JSON object with:
- "action": "filter" or "rerank"
- "criteria": (if action is filter) an object with keys like "maxPrice", "minRam", "minStorage", "brands", "purpose", "maxWeight", "minScreen" (only include those that are relevant)
- "message": a short explanation of what you did

Only output the JSON, no other text.
`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const jsonMatch = text.match(/\{.*\}/s)
    const refinement = JSON.parse(jsonMatch ? jsonMatch[0] : text)

    return NextResponse.json(refinement)
  } catch (error) {
    console.error('Gemini refinement error:', error)
    return NextResponse.json({ error: 'Failed to refine results' }, { status: 500 })
  }
}