import { useState } from 'react';
import { X, Send, Image as ImageIcon, LogIn } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabaseService } from '@/services/supabaseService';

interface PostFormProps {
    onClose: () => void;
}

export default function PostForm({ onClose }: PostFormProps) {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user, signInWithEmail } = useAuth();
    const [email, setEmail] = useState('');
    const [showLogin, setShowLogin] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setShowLogin(true);
            return;
        }

        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            const newPost = await supabaseService.createPost(content, user.id);
            if (newPost) {
                console.log('Post created:', newPost);
                // Ideally, we should trigger a refresh in the PlazaScene or add it to the list
                // For now, just close the form
                onClose();
                // Force reload to show new post (temporary solution until we have real-time or state management)
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to create post:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        try {
            await signInWithEmail(email);
            alert('Check your email for the login link!');
            setShowLogin(false);
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    if (showLogin && !user) {
        return (
            <div className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
                <h2 className="text-2xl font-bold text-village-base mb-4">Login to Post</h2>
                <p className="text-gray-600 mb-6">You need to be logged in to share updates with the village.</p>
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-village-accent"
                    />
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setShowLogin(false)}
                            className="flex-1 py-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-village-accent text-white rounded-xl font-bold hover:bg-green-600 transition-colors"
                        >
                            Send Magic Link
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
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
                                onClick={() => setShowLogin(true)}
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
