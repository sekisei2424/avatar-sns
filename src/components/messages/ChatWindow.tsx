'use client';

import { useEffect, useState, useRef } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase/client';
import { Send } from 'lucide-react';

interface Message {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    message_type: 'text' | 'booking_request' | 'system';
}

interface ChatWindowProps {
    conversationId: string;
}

export default function ChatWindow({ conversationId }: ChatWindowProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadMessages();
        markAsRead();
        const unsubscribe = subscribeToMessages();
        return () => {
            unsubscribe();
        };
    }, [conversationId]);

    const markAsRead = async () => {
        await supabaseService.markAsRead(conversationId);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMessages = async () => {
        const data = await supabaseService.fetchMessages(conversationId);
        setMessages(data as Message[]);
    };

    const subscribeToMessages = () => {
        const channel = supabase
            .channel(`conversation:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                (payload) => {
                    const newMessage = payload.new as Message;
                    // Prevent duplicates from optimistic updates
                    setMessages((prev) => {
                        if (prev.some(msg => msg.id === newMessage.id)) {
                            return prev;
                        }
                        return [...prev, newMessage];
                    });
                    // Mark as read when new message arrives if we are in the chat
                    markAsRead();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        const tempId = crypto.randomUUID();
        const tempMessage: Message = {
            id: tempId,
            content: newMessage,
            sender_id: user.id,
            created_at: new Date().toISOString(),
            message_type: 'text'
        };

        // Optimistic update
        setMessages((prev) => [...prev, tempMessage]);
        setNewMessage('');

        try {
            const sentMessage = await supabaseService.sendMessage(conversationId, user.id, tempMessage.content);
            // Replace temp message with real one if needed, or just let subscription handle it
            // But subscription might duplicate if we don't handle it.
            // A simple way is to filter out the temp message when the real one arrives, 
            // or just update the ID.
            // For now, let's rely on the subscription but we need to avoid duplicates.
            // Actually, the subscription will bring the real message.
            // We should remove the temp message when we get the real one, or update it.

            // Let's just update the temp message with the real ID
            setMessages((prev) => prev.map(msg => msg.id === tempId ? (sentMessage as Message) : msg));

        } catch (error) {
            console.error('Error sending message:', JSON.stringify(error, null, 2));
            // Rollback on error
            setMessages((prev) => prev.filter(msg => msg.id !== tempId));
            alert('Failed to send message');
        }
    };

    if (!user) return null;

    return (
        <div className="flex flex-col h-full">
            {/* Messages Area */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    const isMe = msg.sender_id === user.id;
                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe
                                    ? 'bg-blue-500 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                                    }`}
                            >
                                <p>{msg.content}</p>
                                <span className={`text-xs opacity-70 mt-1 block ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-grow px-4 py-2 rounded-full border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div >
    );
}
