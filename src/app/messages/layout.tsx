'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabaseService } from '@/services/supabaseService';
import Sidebar from '@/components/ui/Sidebar';
import { User } from 'lucide-react';

export default function MessagesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadConversations();
        }
    }, [user]);

    const loadConversations = async () => {
        if (!user) return;
        const data = await supabaseService.fetchConversations(user.id);
        setConversations(data);
        setLoading(false);
    };

    return (
        <div className="flex h-screen">
            {/* Main Sidebar (Navigation) */}
            <div className="flex-shrink-0 z-20">
                <Sidebar onPostClick={() => { }} />
            </div>

            {/* Messages Sidebar (Conversation List) */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-800">Messages</h1>
                </div>

                <div className="flex-grow overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-gray-500 text-center">Loading...</div>
                    ) : conversations.length === 0 ? (
                        <div className="p-4 text-gray-500 text-center">
                            No conversations yet.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {conversations.map((convo) => (
                                <Link
                                    key={convo.conversation_id}
                                    href={`/messages/${convo.conversation_id}`}
                                    className="block p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                            {convo.other_user?.avatar_type ? (
                                                // Ideally render the SVG avatar here, but for list view maybe just initial or simple icon
                                                <User size={20} className="text-gray-500" />
                                            ) : (
                                                <span className="font-bold text-gray-500">
                                                    {convo.other_user?.username?.[0]?.toUpperCase() || '?'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-900 truncate">
                                                {convo.other_user?.username || 'Unknown User'}
                                            </p>
                                            <p className="text-sm text-gray-500 truncate">
                                                Click to chat
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-grow bg-gray-50">
                {children}
            </div>
        </div>
    );
}
