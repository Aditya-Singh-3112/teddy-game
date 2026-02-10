import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { messages, currentCharacter, gameState } = await req.json();

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

  // Define the System Instruction (The "Actor's script")
  const systemInstruction = `
    You are roleplaying as ${currentCharacter.name}, a ${currentCharacter.role} in Teddy Town.
    
    GAME CONTEXT:
    - Victim: ${gameState.victim}
    - Your Personality: ${currentCharacter.personality}
    - Are you the killer?: ${currentCharacter.isKiller ? "YES" : "NO"}
    - The Real Killer is: ${gameState.characters.find((c: any) => c.isKiller)?.name}
    
    INSTRUCTIONS:
    1. Keep responses short (max 2 sentences).
    2. Use cute teddy bear puns if appropriate (e.g., un-bear-lievable, paw-sitive).
    3. If you are the killer, act innocent but leave subtle contradictions.
    4. If you are innocent, tell the truth about what you saw.
    5. Never break character. You are a teddy bear.
  `;

  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    systemInstruction: systemInstruction
  });

  try {
    // Convert previous React messages to Gemini format
    // Gemini expects history in format: { role: 'user' | 'model', parts: [{ text: "..." }] }
    const history = messages.slice(0, -1).map((m: any) => ({
      role: 'user',
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1].content;

    const chat = model.startChat({
      history: history,
    });

    const result = await chat.sendMessage(lastMessage);
    const responseText = result.response.text();

    return NextResponse.json({ 
      response: responseText 
    });

  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ response: "I... I forgot what I was saying. (AI Error)" });
  }
}