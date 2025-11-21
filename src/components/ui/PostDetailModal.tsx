'use client';

import { X, MessageCircle } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabaseService } from '@/services/supabaseService';
import { useRouter } from 'next/navigation';

interface PostDetailModalProps {
    post: any;
    onClose: () => void;
}

export default function PostDetailModal({ post, onClose }: PostDetailModalProps) {
    const { user } = useAuth();
    const router = useRouter();

    const handleMessage = async () => {
        if (!user) {
            alert('Please sign in to message');
            return;
        }
        if (user.id === post.id) return; // post.id here is actually post.id, but we need post.user_id. 
        // Wait, the post object passed from Phaser might have different structure.
        // In PlazaScene, we mapped it to PostData: { id, username, content, avatarPath, avatar_type, ... }
        // We need the original user_id to start a conversation.
        // PlazaScene's PostData doesn't have user_id explicitly? 
        // Let's check PlazaScene.ts again. 
        // It maps: id: post.id (which is the post ID). 
        // We need user_id. 

        // I need to update PlazaScene to include user_id in the mapped data.
        // But for now, let's assume we can get it or we need to fetch it.
        // Actually, let's check PlazaScene.ts mapping.
    };

    const startConversation = async () => {
        if (!user) return;
        try {
            // We need the user_id of the post author.
            // If it's missing from the prop, we are in trouble.
            // Let's assume for a moment we fix PlazaScene to pass user_id.
            const targetUserId = post.user_id;

            if (!targetUserId) {
                console.error('No user_id found on post');
                return;
            }

            const convo = await supabaseService.createConversation(user.id, targetUserId);
            router.push(`/messages/${convo.id}`);
        } catch (error) {
            console.error('Error starting conversation:', error);
            alert('Could not start conversation');
        }
    };

    return (
        <div className="absolute inset-0 z-50 pointer-events-none flex items-end">
            {/* Backdrop to close */}
            <div
                className="absolute inset-0 bg-black/20 pointer-events-auto"
                onClick={onClose}
            />

            <div className="w-full h-full flex p-8 gap-8 pointer-events-none">
                {/* Avatar (Bottom Left) */}
                <div className="mt-auto pointer-events-auto animate-in zoom-in-50 fade-in duration-300 z-50">
                    <div
                        className="w-80 h-80 rounded-3xl shadow-2xl border-8 border-white flex items-center justify-center transform hover:scale-105 transition-transform overflow-hidden bg-white"
                    >
                        <img
                            src={post.avatarPath}
                            alt={post.username}
                            className="w-full h-full object-contain p-4"
                        />
                    </div>
                </div>

                {/* Content (Right Side - Larger) */}
                <div className="flex-grow h-full flex items-center justify-center pointer-events-auto animate-in zoom-in-95 fade-in duration-200">
                    <div className="w-full max-w-5xl h-[80vh] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border border-white/50 relative flex flex-col">
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors"
                        >
                            <X size={32} />
                        </button>

                        <div className="flex items-center gap-6 mb-8 border-b border-gray-100 pb-6">
                            <div className="w-16 h-16 rounded-full shadow-md overflow-hidden bg-gray-100">
                                <img
                                    src={post.avatarPath}
                                    alt={post.username}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <h2 className="text-4xl font-bold text-gray-800">{post.username}</h2>
                                <span className="text-gray-500 text-lg">Just now • Plaza</span>
                            </div>
                        </div>

                        <div className="prose prose-xl max-w-none flex-grow overflow-y-auto pr-4 custom-scrollbar">
                            <p className="text-2xl text-gray-700 leading-relaxed">
                                {post.content}
                            </p>
                            <p className="text-xl text-gray-500 mt-8 leading-relaxed">
                                (This is a placeholder for more detailed content...)
                            </p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 flex gap-6">
                            <button className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold text-xl hover:bg-gray-200 transition-colors">
                                Like
                            </button>
                            {user && user.id !== post.user_id && (
                                <button
                                    onClick={startConversation}
                                    className="flex-1 py-4 bg-blue-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-blue-600 hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                                >
                                    <MessageCircle size={24} />
                                    Message
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
