import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  console.log('🟢 GET /api/test - FUNCIONOU!');
  return NextResponse.json({ 
    method: 'GET', 
    message: 'Rota de teste funcionando!',
    time: new Date().toISOString() 
  });
}

export async function POST(req: NextRequest) {
  console.log('🟢 POST /api/test - INICIOU!');
  
  try {
    const body = await req.text();
    console.log('🟢 POST body recebido:', body);
    
    let parsedBody = null;
    try {
      parsedBody = JSON.parse(body);
    } catch {
      parsedBody = body;
    }
    
    return NextResponse.json({ 
      method: 'POST', 
      message: 'POST funcionou!',
      received: parsedBody,
      time: new Date().toISOString() 
    });
  } catch (error) {
    console.error('🔴 POST /api/test ERRO:', error);
    return NextResponse.json({ 
      error: 'Erro no teste',
      details: String(error) 
    }, { status: 500 });
  }
}