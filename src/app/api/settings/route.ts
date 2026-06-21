import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export let MOCK_SETTINGS = {
  shopName: "Elysian Custom Boutique",
  shopAddress: "Plot 42, Shilpa Hills, Madhapur, Hyderabad, Telangana, 500081",
  contactPhone: "+91 98765 43210"
};

export async function GET() {
  try {
    let settings = await prisma.boutiqueSettings.findFirst();
    if (!settings) {
      // Auto-create default settings in database
      settings = await prisma.boutiqueSettings.create({
        data: MOCK_SETTINGS
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.warn("[API/settings GET] Database unreachable. Returning in-memory mock settings.", error);
    return NextResponse.json(MOCK_SETTINGS);
  }
}

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
  }

  const { shopName, shopAddress, contactPhone } = body;

  try {
    let settings = await prisma.boutiqueSettings.findFirst();
    if (settings) {
      settings = await prisma.boutiqueSettings.update({
        where: { id: settings.id },
        data: { shopName, shopAddress, contactPhone }
      });
    } else {
      settings = await prisma.boutiqueSettings.create({
        data: { shopName, shopAddress, contactPhone }
      });
    }

    // Update local mock
    MOCK_SETTINGS = { shopName, shopAddress, contactPhone };
    return NextResponse.json(settings);
  } catch (error: any) {
    console.warn("[API/settings POST] Database unreachable. Saving to in-memory mock settings.", error.message || error);
    MOCK_SETTINGS = {
      shopName: shopName || MOCK_SETTINGS.shopName,
      shopAddress: shopAddress || MOCK_SETTINGS.shopAddress,
      contactPhone: contactPhone || MOCK_SETTINGS.contactPhone
    };
    return NextResponse.json(MOCK_SETTINGS);
  }
}
