import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ translated: text });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [{role: 'user', content: 'Traduza para português (pt-BR): ' + text}]
      })
    });

    const data = await response.json();
    return NextResponse.json({ translated: data.content[0].text });
  } catch (error) {
    console.error('Erro na tradução:', error);
    return NextResponse.json({ translated: text });
  }
}
