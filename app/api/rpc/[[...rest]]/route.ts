import { RPCHandler } from '@orpc/server/fetch';
import { onError } from '@orpc/server';
import { router } from '@/src/server/api';

const handler = new RPCHandler(router, {
  interceptors: [
    onError((error) => {
      console.error('ORPC Error:', error);
    }),
  ],
});

async function handleRequest(request: Request) {
  try {
    const { response } = await handler.handle(request, {
      prefix: '/api/rpc',
      context: {}, // User context is handled by middleware
    });

    return response ?? new Response(JSON.stringify({ error: 'Not found' }), { 
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Handler error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
