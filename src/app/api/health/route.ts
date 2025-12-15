import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const backendUrl = process.env.NEXT_PUBLIC_ENPHASE_API_URL || 'http://localhost:3005';

    // Test backend connectivity with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    let backendResponse, backendData = null, backendError = null;

    try {
      backendResponse = await fetch(`${backendUrl}/health`, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });

      if (backendResponse.ok) {
        try {
          backendData = await backendResponse.json();
        } catch (e) {
          console.warn('Backend responded but with invalid JSON:', e);
          backendData = { error: 'Invalid JSON response' };
        }
      } else {
        backendError = `HTTP ${backendResponse.status}: ${backendResponse.statusText}`;
      }
    } catch (e) {
      backendError = e instanceof Error ? e.message : 'Connection failed';
      console.error('Backend health check failed:', backendError);
    } finally {
      clearTimeout(timeoutId);
    }

    const responseTime = Date.now() - startTime;

    if (backendData) {
      return NextResponse.json({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          responseTime: `${responseTime}ms`,
          frontend: {
            environment: process.env.NODE_ENV,
            appUrl: process.env.NEXT_PUBLIC_APP_URL,
            nodeVersion: process.version
          },
          backend: {
            url: backendUrl,
            healthy: true,
            status: backendResponse?.status || 200,
            data: backendData
          },
          environment: {
            enphaseApiUrl: backendUrl
          }
        }
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: backendError || 'Backend service unavailable',
          timestamp: new Date().toISOString(),
          responseTime: `${responseTime}ms`,
          frontend: {
            environment: process.env.NODE_ENV,
            appUrl: process.env.NEXT_PUBLIC_APP_URL
          },
          backend: {
            url: backendUrl,
            healthy: false,
            status: backendResponse?.status || null,
            error: backendError
          }
        },
        { status: 503 }
      );
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;

    console.error('Health check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Health check failed',
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        frontend: {
          environment: process.env.NODE_ENV,
          appUrl: process.env.NEXT_PUBLIC_APP_URL
        },
        backend: {
          url: process.env.NEXT_PUBLIC_ENPHASE_API_URL || 'http://localhost:3005',
          healthy: false,
          error: error instanceof Error ? error.message : 'Connection failed'
        }
      },
      { status: 503 }
    );
  }
}