import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

export async function POST() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
  
  // Use gemini-1.5-flash for speed, or gemini-pro if region locked
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" } 
  });

  const prompt = `
    You are a Game Master designed to generate a "Teddy Town" Murder Mystery scenario.
    
    Generate a JSON object containing:
    1. A Story Title.
    2. A Victim (Name).
    3. A Solution (Who did it and exactly why).
    4. A Sheriff Companion named "Sheriff Paws" (He is NEVER the killer).
    5. 3 Suspects. Each must have a unique ID, Name, Role (e.g., Baker, Mayor), Personality, and 'isKiller' boolean.
    6. 3 Clues.
    
    IMPORTANT: Randomly select one of the 3 suspects to be the killer.

    The output must strictly follow this JSON schema:
    {
      "storyTitle": "String",
      "victim": "String",
      "solution": "String",
      "characters": [
        { "id": "String", "name": "String", "role": "String", "personality": "String", "isKiller": Boolean, "spriteColor": "HexCode" }
      ],
      "clues": [
        { "id": "String", "name": "String", "description": "String", "found": Boolean }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const gameData = JSON.parse(text);

    // --- ROBUST FIX: SHUFFLE THE SUSPECTS ---
    // This ensures the killer is never in the same spot twice.
    
    // 1. Separate Sheriff from everyone else (we want Sheriff first in UI)
    const sheriff = gameData.characters.find((c: any) => c.role.toLowerCase().includes("sheriff"));
    const suspects = gameData.characters.filter((c: any) => !c.role.toLowerCase().includes("sheriff"));

    // 2. Fisher-Yates Shuffle for suspects
    for (let i = suspects.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [suspects[i], suspects[j]] = [suspects[j], suspects[i]];
    }

    // 3. Reassemble (Sheriff first, then shuffled suspects)
    if (sheriff) {
      gameData.characters = [sheriff, ...suspects];
    } else {
      gameData.characters = suspects; // Fallback if AI forgot Sheriff
    }
    
    return NextResponse.json(gameData);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate story" }, { status: 500 });
  }
}