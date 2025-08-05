import { NextRequest, NextResponse } from 'next/server';

// In production, this would check actual OAuth tokens from database
// For demo purposes, we'll simulate connected status
let connectedAccounts: { [key: string]: { email: string; provider: string; connected_at: string } } = {};

export async function GET(request: NextRequest) {
  try {
    // In demo mode, simulate some connected accounts
    const demoConnections = {
      'user_demo': {
        email: 'user@demo.com',
        provider: 'gmail',
        connected_at: '2024-01-15T10:30:00Z'
      }
    };

    // Check for demo user or return connected status
    const userId = 'user_demo'; // In production, get from auth session
    const connection = demoConnections[userId] || connectedAccounts[userId];

    if (connection) {
      return NextResponse.json({
        success: true,
        connected: true,
        email: connection.email,
        provider: connection.provider,
        connected_at: connection.connected_at
      });
    } else {
      return NextResponse.json({
        success: true,
        connected: false,
        email: null,
        provider: null
      });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to check email status'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, provider, access_token } = await request.json();
    
    // In production, store OAuth tokens securely in database
    const userId = 'user_demo'; // Get from auth session
    connectedAccounts[userId] = {
      email,
      provider,
      connected_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Email account connected successfully',
      email,
      provider
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to connect email account'
    }, { status: 400 });
  }
}