import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

export async function POST(request: NextRequest) {
  try {
    const { laptop, prefs } = await request.json()

    const prompt = `
You are a helpful laptop recommendation assistant.
Given the following laptop specs and user preferences, write a short, friendly explanation (1–2 sentences) why this laptop is a good match.

Laptop:
- Brand: ${laptop.brand}
- Model: ${laptop.model}
- Price: $${laptop.price_usd}
- RAM: ${laptop.ram_gb} GB
- Storage: ${laptop.storage_gb} GB ${laptop.storage_type}
- Graphics: ${laptop.graphics}
- Weight: ${laptop.weight_kg} kg
- Screen: ${laptop.screen_inches}"

User preferences:
- Max budget: $${prefs.maxPrice}
- Min RAM: ${prefs.minRam} GB
- Min storage: ${prefs.minStorage} GB
- Preferred brands: ${prefs.brands.join(', ') || 'Any'}
- Purpose: ${prefs.purpose}

Write a concise, engaging explanation. Use emojis if appropriate. Keep it under 30 words.
    `

    const result = await model.generateContent(prompt)
    const explanation = result.response.text()

    return NextResponse.json({ explanation })
  } catch (error) {
    console.error('Gemini explanation error:', error)
    return NextResponse.json({ error: 'Failed to generate explanation' }, { status: 500 })
  }
}