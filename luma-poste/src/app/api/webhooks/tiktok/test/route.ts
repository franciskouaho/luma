import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { publish_id, status, error_message, video_id, share_url } = await request.json();
    
    // Simuler l'appel du webhook
    const testBody = {
      publish_id: publish_id || 'test_publish_123',
      status: status || 'PUBLISHED',
      error_message: error_message || null,
      video_id: video_id || 'test_video_456',
      share_url: share_url || 'https://tiktok.com/@test/video/123',
      user_id: 'test_user_789'
    };

    // Appeler le webhook en interne
    const webhookUrl = new URL('/api/webhooks/tiktok', request.url);
    const response = await fetch(webhookUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tiktok-signature': 'test_signature'
      },
      body: JSON.stringify(testBody)
    });

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Test webhook envoyé',
      testData: testBody,
      webhookResponse: result
    });

  } catch (error) {
    console.error('❌ Erreur lors du test webhook:', error);
    return NextResponse.json(
      { error: 'Erreur lors du test' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint de test webhook TikTok',
    usage: 'POST avec { publish_id, status, error_message, video_id, share_url }',
    examples: {
      published: {
        publish_id: 'pub_123',
        status: 'PUBLISHED',
        video_id: 'vid_456',
        share_url: 'https://tiktok.com/@user/video/123'
      },
      failed: {
        publish_id: 'pub_123',
        status: 'FAILED',
        error_message: 'Video too long'
      },
      processing: {
        publish_id: 'pub_123',
        status: 'PROCESSING'
      }
    }
  });
}
