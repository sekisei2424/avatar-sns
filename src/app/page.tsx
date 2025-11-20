'use client';

import { useState } from 'react';
import PhaserGame from '@/components/game/PhaserGame';
import Sidebar from '@/components/ui/Sidebar';
import Modal from '@/components/ui/Modal';
import JobBoard from '@/components/ui/JobBoard';
import PostForm from '@/components/ui/PostForm';
import { X } from 'lucide-react';

export default function Home() {
  const [isJobBoardOpen, setIsJobBoardOpen] = useState(false);
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  return (
    <main className="flex w-full h-screen bg-village-base overflow-hidden">
      {/* Sidebar Layer */}
      <div className="flex-shrink-0 z-20">
        <Sidebar
          onPostClick={() => setIsPostFormOpen(true)}
        />
      </div>

      {/* Game Layer */}
      <div className="flex-grow relative z-0">
        <PhaserGame
          currentScene="plaza"
          onOpenJobBoard={() => setIsJobBoardOpen(true)}
          onOpenPost={(post) => setSelectedPost(post)}
        />
      </div>

      {/* Modals */}
      <Modal
        isOpen={isJobBoardOpen}
        onClose={() => setIsJobBoardOpen(false)}
        title="Village Jobs"
      >
        <JobBoard />
      </Modal>

      <Modal
        isOpen={isPostFormOpen}
        onClose={() => setIsPostFormOpen(false)}
        title="Share Experience"
      >
        <PostForm onClose={() => setIsPostFormOpen(false)} />
      </Modal>

      {/* Post Detail Overlay */}
      {selectedPost && (
        <div className="absolute inset-0 z-50 pointer-events-none flex items-end">
          {/* Backdrop to close */}
          <div
            className="absolute inset-0 bg-black/20 pointer-events-auto"
            onClick={() => setSelectedPost(null)}
          />

          <div className="w-full h-full flex p-8 gap-8 pointer-events-none">
            {/* Avatar (Bottom Left) */}
            <div className="mt-auto pointer-events-auto animate-in zoom-in-50 fade-in duration-300 z-50">
              <div
                className="w-80 h-80 rounded-3xl shadow-2xl border-8 border-white flex items-center justify-center transform hover:scale-105 transition-transform overflow-hidden bg-white"
              >
                <img
                  src={selectedPost.avatarPath}
                  alt={selectedPost.username}
                  className="w-full h-full object-contain p-4"
                />
              </div>
            </div>

            {/* Content (Right Side - Larger) */}
            <div className="flex-grow h-full flex items-center justify-center pointer-events-auto animate-in zoom-in-95 fade-in duration-200">
              <div className="w-full max-w-5xl h-[80vh] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border border-white/50 relative flex flex-col">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors"
                >
                  <X size={32} />
                </button>

                <div className="flex items-center gap-6 mb-8 border-b border-gray-100 pb-6">
                  <div className="w-16 h-16 rounded-full shadow-md overflow-hidden bg-gray-100">
                    <img
                      src={selectedPost.avatarPath}
                      alt={selectedPost.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold text-gray-800">{selectedPost.username}</h2>
                    <span className="text-gray-500 text-lg">Just now • Plaza</span>
                  </div>
                </div>

                <div className="prose prose-xl max-w-none flex-grow overflow-y-auto pr-4 custom-scrollbar">
                  <p className="text-2xl text-gray-700 leading-relaxed">
                    {selectedPost.content}
                  </p>
                  {/* Mock long content for demo */}
                  <p className="text-xl text-gray-500 mt-8 leading-relaxed">
                    (This is a placeholder for more detailed content, images, or comments that might be associated with this post. The UI is designed to handle longer text gracefully.)
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex gap-6">
                  <button className="flex-1 py-4 bg-village-accent text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-green-600 hover:shadow-xl transition-all transform hover:-translate-y-1">
                    Like
                  </button>
                  <button className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold text-xl hover:bg-gray-200 transition-colors">
                    Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
