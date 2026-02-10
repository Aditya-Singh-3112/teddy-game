export type Character = {
  id: string;
  name: string;
  role: string; // e.g., "Baker", "Mayor"
  personality: string;
  isKiller: boolean;
  spriteColor: string; // Placeholder for image mapping
};

export type Clue = {
  id: string;
  name: string;
  description: string;
  found: boolean;
};

export type GameState = {
  storyTitle: string;
  victim: string;
  characters: Character[];
  clues: Clue[];
  solution: string; // The explanation of the crime
  currentLocation: string;
};

export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  speaker?: string; // Who is talking?
};