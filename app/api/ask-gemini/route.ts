import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()
    if (!query) {
      return NextResponse.json({ error: 'No query provided' }, { status: 400 })
    }

    const prompt = `
You are a helpful assistant that extracts laptop preferences from natural language.
Given the following user query, return a JSON object with these fields:
- maxPrice: number (or null if not mentioned)
- minRam: number (in GB, or null)
- minStorage: number (in GB, or null)
- brands: array of strings (brand names, or empty array)
- purpose: string ("gaming", "office", "portable", "general", or null)

Only output the JSON, no other text.

User query: "${query}"
`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const jsonMatch = text.match(/\{.*\}/s)
    const preferences = JSON.parse(jsonMatch ? jsonMatch[0] : text)

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Gemini error:', error)
    return NextResponse.json({ error: 'Failed to parse query' }, { status: 500 })
  }
}