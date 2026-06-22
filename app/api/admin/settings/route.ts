import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAdminAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAdminAuth(request)
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await prisma.adminSettings.findFirst()

    if (!settings) {
      const newSettings = await prisma.adminSettings.create({
        data: {},
      })
      return NextResponse.json(newSettings)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json(
      { error: 'Failed to get settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAdminAuth(request)
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { activeHoursStart, activeHoursEnd } = await request.json()

    let settings = await prisma.adminSettings.findFirst()

    if (!settings) {
      settings = await prisma.adminSettings.create({
        data: {
          activeHoursStart,
          activeHoursEnd,
        },
      })
    } else {
      settings = await prisma.adminSettings.update({
        where: { id: settings.id },
        data: {
          activeHoursStart,
          activeHoursEnd,
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}