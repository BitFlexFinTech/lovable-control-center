import { useState } from 'react';
import { Heart, MessageCircle, Bookmark, Share2, Music2, Plus, Play } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const tiktokVideos = [
  {
    id: '1',
    author: { 
      name: 'Khaby Lame', 
      username: 'khaby.lame', 
      avatar: '', 
      verified: true,
      followers: '162.5M'
    },
    description: 'When they make simple things complicated 😂 #fyp #comedy #khaby',
    music: 'Original Sound - Khaby Lame',
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400',
    engagement: { likes: 12000000, comments: 89000, saves: 234000, shares: 456000 },
  },
  {
    id: '2',
    author: { 
      name: 'Charli D\'Amelio', 
      username: 'charlidamelio', 
      avatar: '', 
      verified: true,
      followers: '151.8M'
    },
    description: 'New dance challenge! Can you do it? 💃 #dance #challenge #fyp',
    music: 'Trending Sound - Pop Hits 2024',
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400',
    engagement: { likes: 8500000, comments: 67000, saves: 189000, shares: 345000 },
  },
  {
    id: '3',
    author: { 
      name: 'MrBeast', 
      username: 'mrbeast', 
      avatar: '', 
      verified: true,
      followers: '92.3M'
    },
    description: 'I gave away $1,000,000 to random strangers! 💰 #mrbeast #giveaway',
    music: 'Epic Music - Cinematic',
    thumbnail: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400',
    engagement: { likes: 15000000, comments: 120000, saves: 567000, shares: 890000 },
  },
];

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export function TikTokFeed({ userId }: { userId?: string }) {
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [savedVideos, setSavedVideos] = useState<Set<string>>(new Set());
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  const toggleLike = (id: string) => {
    setLikedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const toggleSave = (id: string) => {
    setSavedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const toggleFollow = (username: string) => {
    setFollowedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(username)) newSet.delete(username);
      else newSet.add(username);
      return newSet;
    });
  };

  return (
    <div className="bg-black divide-y divide-white/10">
      {tiktokVideos.map((video) => (
        <article key={video.id} className="relative">
          {/* Video Thumbnail with Play Button */}
          <div className="relative aspect-[9/16] max-h-[500px] bg-black cursor-pointer group">
            <img 
              src={video.thumbnail} 
              alt="" 
              className="w-full h-full object-cover opacity-90"
            />
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
              <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <Play className="h-8 w-8 text-white fill-white ml-1" />
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="absolute right-3 bottom-20 flex flex-col items-center gap-5">
              {/* Profile */}
              <div className="relative">
                <Avatar className="h-12 w-12 border-2 border-white">
                  <AvatarImage src={video.author.avatar} />
                  <AvatarFallback className="bg-pink-500 text-white text-sm font-bold">
                    {video.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {!followedUsers.has(video.author.username) && (
                  <button 
                    onClick={() => toggleFollow(video.author.username)}
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center"
                  >
                    <Plus className="h-3 w-3 text-white" />
                  </button>
                )}
              </div>

              {/* Like */}
              <button 
                onClick={() => toggleLike(video.id)}
                className="flex flex-col items-center gap-1"
              >
                <div className={cn(
                  "h-11 w-11 rounded-full bg-white/10 backdrop-blur flex items-center justify-center",
                  likedVideos.has(video.id) && "text-red-500"
                )}>
                  <Heart className={cn(
                    "h-7 w-7 text-white",
                    likedVideos.has(video.id) && "fill-red-500 text-red-500"
                  )} />
                </div>
                <span className="text-xs text-white font-semibold">
                  {formatNumber(video.engagement.likes + (likedVideos.has(video.id) ? 1 : 0))}
                </span>
              </button>

              {/* Comments */}
              <button className="flex flex-col items-center gap-1">
                <div className="h-11 w-11 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                  <MessageCircle className="h-7 w-7 text-white" />
                </div>
                <span className="text-xs text-white font-semibold">
                  {formatNumber(video.engagement.comments)}
                </span>
              </button>

              {/* Save */}
              <button 
                onClick={() => toggleSave(video.id)}
                className="flex flex-col items-center gap-1"
              >
                <div className="h-11 w-11 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                  <Bookmark className={cn(
                    "h-7 w-7 text-white",
                    savedVideos.has(video.id) && "fill-yellow-400 text-yellow-400"
                  )} />
                </div>
                <span className="text-xs text-white font-semibold">
                  {formatNumber(video.engagement.saves + (savedVideos.has(video.id) ? 1 : 0))}
                </span>
              </button>

              {/* Share */}
              <button className="flex flex-col items-center gap-1">
                <div className="h-11 w-11 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                  <Share2 className="h-7 w-7 text-white" />
                </div>
                <span className="text-xs text-white font-semibold">
                  {formatNumber(video.engagement.shares)}
                </span>
              </button>

              {/* Music Disc */}
              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-600 animate-spin-slow flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-gray-400" />
              </div>
            </div>

            {/* Bottom Info */}
            <div className="absolute left-3 right-16 bottom-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-base">@{video.author.username}</span>
                {video.author.verified && (
                  <svg className="h-4 w-4 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6 12.6l1.5-1.5 2.6 2.6 6.4-6.4 1.5 1.5-7.9 7.9z"/>
                  </svg>
                )}
              </div>
              <p className="text-sm mb-3 line-clamp-2">{video.description}</p>
              <div className="flex items-center gap-2">
                <Music2 className="h-4 w-4" />
                <p className="text-xs truncate animate-marquee">{video.music}</p>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
