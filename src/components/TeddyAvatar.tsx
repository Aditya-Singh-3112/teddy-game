export default function TeddyAvatar({ color, isTalking }: { color: string, isTalking?: boolean }) {
  return (
    <div className={`relative w-32 h-32 transition-transform duration-300 ${isTalking ? 'scale-110 -translate-y-2' : 'scale-100'}`}>
      {/* Ears */}
      <div className="absolute top-1 left-1 w-10 h-10 rounded-full brightness-90" style={{ backgroundColor: color }} />
      <div className="absolute top-1 right-1 w-10 h-10 rounded-full brightness-90" style={{ backgroundColor: color }} />
      
      {/* Head */}
      <div className="absolute top-5 left-0 w-32 h-28 rounded-[2.5rem] shadow-lg flex justify-center items-center z-10" style={{ backgroundColor: color }}>
        
        {/* Eyes */}
        <div className="absolute top-10 left-8 w-3 h-4 bg-black rounded-full animate-blink" />
        <div className="absolute top-10 right-8 w-3 h-4 bg-black rounded-full animate-blink" />
        
        {/* Snout Area */}
        <div className="absolute top-14 w-12 h-9 bg-white/20 rounded-full flex justify-center">
          {/* Nose */}
          <div className="mt-2 w-4 h-3 bg-black/80 rounded-full" />
        </div>

        {/* Mouth (only visible if talking) */}
        {isTalking && (
          <div className="absolute top-20 w-4 h-2 bg-black/60 rounded-full animate-pulse" />
        )}
      </div>
    </div>
  );
}