import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's subscription plan from user_profiles
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('subscription_plan')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      // Default to trial if no profile found
      return NextResponse.json({
        success: true,
        plan: 'trial',
        user_id: user.id
      });
    }

    return NextResponse.json({
      success: true,
      plan: profile?.subscription_plan || 'trial',
      user_id: user.id
    });

  } catch (error) {
    console.error('Error fetching user plan:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}