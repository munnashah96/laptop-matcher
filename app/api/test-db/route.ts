import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    await prisma.$connect()
    const count = await prisma.laptop.count()
    return NextResponse.json({ success: true, count })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}