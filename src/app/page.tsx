'use client';

import { useState } from 'react';
import PhaserGame from '@/components/game/PhaserGame';
import Sidebar from '@/components/ui/Sidebar';
import Modal from '@/components/ui/Modal';
import JobBoard from '@/components/ui/JobBoard';
import PostForm from '@/components/ui/PostForm';
import PostDetailModal from '@/components/ui/PostDetailModal';
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
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </main>
  );
}
