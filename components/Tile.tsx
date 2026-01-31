
import React, { useState, useEffect } from 'react';
import { TileSize, LiveTileData } from '../types';

interface TileProps {
  tile: LiveTileData;
  onLongPress: (id: string) => void;
  onClick: (url: string) => void;
  liveContent?: string[];
}

const Tile: React.FC<TileProps> = ({ tile, onLongPress, onClick, liveContent }) => {
  const [contentIndex, setContentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [timer, setTimer] = useState<any>(null);

  useEffect(() => {
    if (liveContent && liveContent.length > 0) {
      const interval = setInterval(() => {
        setIsFlipping(true);
        setTimeout(() => {
          setContentIndex((prev) => (prev + 1) % liveContent.length);
          setIsFlipping(false);
        }, 600);
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [liveContent]);

  const handleTouchStart = () => {
    const t = setTimeout(() => {
      onLongPress(tile.id);
    }, 800);
    setTimer(t);
  };

  const handleTouchEnd = () => {
    if (timer) clearTimeout(timer);
  };

  const sizeClasses = {
    [TileSize.SMALL]: 'col-span-1 row-span-1 h-[80px] w-[80px]',
    [TileSize.MEDIUM]: 'col-span-2 row-span-2 h-[170px] w-[170px]',
    [TileSize.WIDE]: 'col-span-4 row-span-2 h-[170px] w-full',
  };

  const currentText = liveContent ? liveContent[contentIndex] : tile.content;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onContextMenu={(e) => { e.preventDefault(); onLongPress(tile.id); }}
      onClick={() => onClick(tile.url)}
      className={`${sizeClasses[tile.size]} ${tile.color} relative overflow-hidden active-tile transition-all duration-200 cursor-pointer shadow-lg select-none perspective-1000 rounded-2xl`}
    >
      <div 
        className={`absolute inset-0 p-3 flex flex-col justify-between transition-all duration-700 ease-in-out ${isFlipping ? 'rotate-x-90 opacity-0 scale-95' : 'rotate-x-0 opacity-100 scale-100'}`}
      >
        {/* Top title / branding */}
        <div className="z-10 flex justify-between items-start pointer-events-none">
          <span className="text-[10px] font-semibold uppercase tracking-widest opacity-80 truncate max-w-[85%]">
            {tile.title}
          </span>
          {tile.isSystem && tile.size !== TileSize.SMALL && <span className="text-[10px] opacity-40">Live</span>}
        </div>
        
        {/* Centered Icon */}
        <div className="flex-1 flex items-center justify-center pointer-events-none">
          {tile.icon && (
             <span className={`${tile.size === TileSize.SMALL ? 'text-3xl' : 'text-6xl'} opacity-100 drop-shadow-lg`}>
               {tile.icon}
             </span>
          )}
        </div>

        {/* Live Content / Summary at bottom */}
        {tile.size !== TileSize.SMALL && currentText && (
           <div className="h-12 overflow-hidden pointer-events-none">
              <p className="text-[13px] font-normal leading-tight line-clamp-2 opacity-95">
                {currentText}
              </p>
           </div>
        )}
      </div>

      {/* Surface reflection effect */}
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-10 transition-opacity"></div>
    </div>
  );
};

export default Tile;
