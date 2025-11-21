import { useState } from 'react';
import { X, Send, Image as ImageIcon, LogIn } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabaseService } from '@/services/supabaseService';
import AuthModal from '@/components/auth/AuthModal';

interface PostFormProps {
    onClose: () => void;
}

export default function PostForm({ onClose }: PostFormProps) {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setShowAuthModal(true);
            return;
        }

        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            const newPost = await supabaseService.createPost(content, user.id);
            if (newPost) {
                console.log('Post created:', newPost);
                onClose();
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to create post:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="relative">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={user ? "What's happening in your village?" : "Please log in to post..."}
                        disabled={!user}
                        className="w-full h-48 bg-white/50 backdrop-blur-sm rounded-2xl p-6 text-lg text-gray-800 placeholder-gray-500 border border-white/50 focus:outline-none focus:ring-2 focus:ring-village-accent/50 resize-none shadow-inner transition-all disabled:opacity-50"
                    />
                    <div className="absolute bottom-4 right-4 text-gray-500 text-sm">
                        {content.length}/280
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-600 hover:bg-white/50 transition-colors"
                    >
                        <ImageIcon size={20} />
                        <span>Add Photo</span>
                    </button>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl text-gray-600 hover:bg-gray-100/50 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        {user ? (
                            <button
                                type="submit"
                                disabled={!content.trim() || isSubmitting}
                                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-village-accent to-green-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={18} />
                                {isSubmitting ? 'Posting...' : 'Post'}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowAuthModal(true)}
                                className="flex items-center gap-2 px-8 py-3 bg-village-base text-white rounded-xl font-bold shadow-lg hover:bg-gray-800 transition-all"
                            >
                                <LogIn size={18} />
                                Login to Post
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
