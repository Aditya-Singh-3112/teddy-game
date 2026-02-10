'use client';

import { useState, useEffect, useRef } from 'react';
import { GameState, Character, Message } from '@/types/game';
import { Book, MapPin, Search, AlertTriangle, Send, Sparkles } from 'lucide-react';
import TeddyAvatar from '@/components/TeddyAvatar';
import Typewriter from '@/components/Typewriter';

export default function TeddyMystery() {
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [talkingTo, setTalkingTo] = useState<Character | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function initGame() {
      try {
        const res = await fetch('/api/start-game', { method: 'POST' });
        const data = await res.json();
        setGame(data);
        const sheriff = data.characters.find((c: Character) => c.role.toLowerCase().includes("sheriff")) || data.characters[0];
        setTalkingTo(sheriff);
        setMessages([{ role: 'assistant', content: `(Sheriff ${sheriff.name} tips his hat) "Detective! Thank goodness you're here. We have a situation. ${data.victim} was found... un-stuffed. It's tragic. Ask me anything, or talk to the suspects."`, speaker: sheriff.name }]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    initGame();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim() || !talkingTo || !game || isTyping) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: [...messages, userMsg], currentCharacter: talkingTo, gameState: game })
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response, speaker: talkingTo.name }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'system', content: "The bear seems confused..." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSwitchCharacter = (char: Character) => {
    if (talkingTo?.id === char.id) return;
    setTalkingTo(char);
    setMessages([{ role: 'system', content: `*You approach ${char.name}.*`, speaker: 'System' }]);
  };

  const handleAccuse = () => {
    if (!talkingTo) return;
    setGameOver(true);
    if (talkingTo.isKiller) {
      alert(`🎉 YOU SOLVED IT! ${talkingTo.name} was the killer!\n\nReason: ${game?.solution}`);
    } else {
      alert(`❌ WRONG! ${talkingTo.name} is innocent. The real killer got away...`);
    }
  };

  if (loading) return (
    <div className="flex flex-col h-screen items-center justify-center bg-[#fdf6e3] text-amber-900 font-typewriter">
      <div className="animate-bounce text-6xl mb-4">🐻🔍</div>
      <div className="text-2xl font-bold tracking-widest">BUILDING TEDDY TOWN...</div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-900 text-white font-sans overflow-hidden">
      
      {/* LEFT: Visual Scene */}
      <div className="flex-1 relative flex flex-col">
        {/* Atmospheric Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/10 via-transparent to-slate-900/90 pointer-events-none z-0"></div>
        
        {/* Dynamic Background Placeholder */}
        <div className="absolute inset-0 bg-cover bg-center opacity-40 z-[-1]" 
             style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1598188306155-25e400eb5809?q=80&w=2670&auto=format&fit=crop)' }}>
        </div>

        {/* GAME AREA */}
        <div className="flex-1 relative flex flex-col items-center justify-center">
          {/* Active Character Sprite */}
          {talkingTo && (
            <div className="mb-12 animate-breathe drop-shadow-2xl">
               <TeddyAvatar color={talkingTo.spriteColor} isTalking={isTyping} />
               <div className="text-center mt-4 bg-black/40 backdrop-blur-md px-4 py-1 rounded-full border border-white/20">
                 <span className="font-bold text-amber-200 tracking-wider uppercase text-sm">{talkingTo.role}</span>
               </div>
            </div>
          )}
        </div>

        {/* DIALOGUE BOX */}
        <div className="z-10 p-6 pb-8 max-w-4xl mx-auto w-full">
          <div className="bg-slate-900/95 border-2 border-amber-600/50 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-[300px]">
            
            {/* Header */}
            <div className="bg-slate-800/80 px-6 py-2 border-b border-slate-700 flex justify-between items-center">
              <span className="text-amber-500 font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                 <Sparkles size={14} /> {talkingTo?.name}
              </span>
              <span className="text-xs text-slate-400">Teddy Town Mystery</span>
            </div>

            {/* Chat History */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-lg leading-relaxed shadow-md font-hand ${
                    m.role === 'user' 
                      ? 'bg-amber-700/90 text-white rounded-br-sm' 
                      : m.role === 'system'
                        ? 'bg-transparent text-slate-400 text-center w-full italic text-sm'
                        : 'bg-slate-800 text-amber-50 rounded-bl-sm border border-slate-700'
                  }`}>
                    {/* Only typewriter the very last message if it's from the assistant */}
                    {i === messages.length - 1 && m.role === 'assistant' && !isTyping ? (
                      <Typewriter text={m.content} />
                    ) : (
                      m.content
                    )}
                  </div>
                </div>
              ))}
              {isTyping && <div className="text-slate-500 text-sm italic ml-4 animate-pulse">Writing...</div>}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input Area */}
            <div className="bg-slate-900 p-3 flex gap-2 border-t border-slate-700/50">
              <input 
                className="flex-1 bg-slate-800 border border-slate-700 text-amber-50 rounded-lg px-4 focus:outline-none focus:border-amber-500 transition-colors font-hand text-xl"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="What do you want to ask?"
                disabled={gameOver}
              />
              <button 
                onClick={sendMessage} 
                disabled={gameOver || isTyping}
                className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-6 rounded-lg font-bold transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Sidebar Notebook */}
      <div className="w-80 bg-[#fdf6e3] text-slate-800 shadow-2xl flex flex-col font-typewriter relative border-l-8 border-amber-900/80">
        
        {/* Notebook Title */}
        <div className="p-6 border-b-2 border-slate-200 bg-[#f4ebd0]">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
            <Book size={20} /> Case Files
          </h2>
          <p className="text-xs text-slate-500 mt-1">Property of Detective {game?.characters.find(c=>c.role.includes("Sheriff"))?.name || "Bear"}</p>
        </div>

        {/* Suspects */}
        <div className="flex-1 overflow-y-auto custom-scrollbar notebook-paper p-6 pt-2">
           <h3 className="font-bold underline mb-4 mt-4 decoration-amber-500/50 decoration-wavy">Suspects</h3>
           <div className="space-y-3">
            {game?.characters.map((char) => (
              <button 
                key={char.id}
                onClick={() => handleSwitchCharacter(char)}
                className={`w-full text-left flex items-center gap-3 p-2 rounded transition-all hover:bg-black/5 group ${talkingTo?.id === char.id ? 'bg-amber-200/50' : ''}`}
              >
                <div className="w-8 h-8 rounded-full border border-slate-400 shadow-sm relative overflow-hidden" style={{backgroundColor: char.spriteColor}}>
                  {/* Mini bear ears for icon */}
                  <div className="absolute top-0 left-0 w-2 h-2 bg-black/10 rounded-full"></div>
                  <div className="absolute top-0 right-0 w-2 h-2 bg-black/10 rounded-full"></div>
                </div>
                <div>
                  <div className={`font-bold text-sm ${talkingTo?.id === char.id ? 'text-amber-900' : 'text-slate-700'}`}>{char.name}</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">{char.role}</div>
                </div>
                {talkingTo?.id === char.id && <MapPin size={16} className="ml-auto text-amber-600" />}
              </button>
            ))}
           </div>

           <h3 className="font-bold underline mb-4 mt-8 decoration-amber-500/50 decoration-wavy">Clues</h3>
           <ul className="list-disc pl-4 space-y-2 text-sm text-slate-700">
             {game?.clues.map((clue, idx) => (
               <li key={idx}>
                 <span className="bg-yellow-200/50 px-1">{clue.description}</span>
               </li>
             ))}
           </ul>
        </div>

        {/* Accuse Button - Sticker Style */}
        <div className="p-4 bg-[#f4ebd0] border-t border-slate-300">
           <button 
             onClick={handleAccuse}
             className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded transform hover:-rotate-1 transition-transform shadow-lg border-2 border-white border-dashed flex items-center justify-center gap-2"
           >
             <AlertTriangle size={18} />
             SOLVE THE CASE
           </button>
        </div>
      </div>
    </div>
  );
}