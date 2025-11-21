import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusSquare, User, MapPin, LogIn, LogOut, MessageCircle } from 'lucide-react';
import AuthModal from '@/components/auth/AuthModal';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabaseService } from '@/services/supabaseService';
import { supabase } from '@/lib/supabase/client';

interface SidebarProps {
    onPostClick: () => void;
}

export default function Sidebar({ onPostClick }: SidebarProps) {
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const isPlaza = pathname === '/' || pathname === '/plaza';
    const isVillage = pathname === '/village';
    const isSearch = pathname === '/search';
    const isProfile = pathname === '/profile';
    const isMessages = pathname.startsWith('/messages');

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            const unsubscribe = subscribeToUnread();
            return () => {
                unsubscribe();
            };
        } else {
            setUnreadCount(0);
        }
    }, [user, pathname]); // Re-fetch when pathname changes (e.g. leaving a chat)

    const fetchUnreadCount = async () => {
        const count = await supabaseService.getUnreadCount();
        setUnreadCount(count as number);
    };

    const subscribeToUnread = () => {
        // Listen for new messages to increment count
        // Ideally we should filter by "not sent by me" but RLS might handle visibility
        // For simplicity, we'll just re-fetch count on any message insert that we can see
        const channel = supabase
            .channel('global_messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages'
                },
                () => {
                    // Re-fetch count to be accurate
                    fetchUnreadCount();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const iconClass = (isActive: boolean) =>
        `p-3 rounded-xl transition-all duration-200 hover:bg-white/10 ${isActive ? 'text-village-accent scale-110' : 'text-white hover:text-village-accent hover:scale-105'}`;

    const handleNavigation = (path: string) => {
        if (pathname !== path) {
            window.location.href = path;
        }
    };

    return (
        <nav className="h-full w-20 bg-village-base border-r border-gray-700 flex flex-col items-center justify-evenly py-8 z-50 shadow-xl">
            <button onClick={() => handleNavigation('/')} title="Plaza" className={iconClass(isPlaza)}>
                <Home size={32} />
            </button>

            <button onClick={() => handleNavigation('/village')} title="My Village" className={iconClass(isVillage)}>
                <MapPin size={32} />
            </button>

            <button
                onClick={onPostClick}
                className={iconClass(false)}
                title="Post"
            >
                <PlusSquare size={32} />
            </button>

            <div className="relative">
                <button onClick={() => handleNavigation('/messages')} title="Messages" className={iconClass(isMessages)}>
                    <MessageCircle size={32} />
                </button>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full transform translate-x-1/4 -translate-y-1/4">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </div>

            <button onClick={() => handleNavigation('/search')} title="Search" className={iconClass(isSearch)}>
                <Search size={32} />
            </button>

            <div className="mt-auto pb-4 flex flex-col items-center gap-6">
                <button
                    onClick={() => handleNavigation('/profile')}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg border-2 ${isProfile ? 'border-village-accent scale-110' : 'border-white/20 hover:scale-105'}`}
                    title="Profile"
                >
                    {user ? (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold overflow-hidden">
                            {user.user_metadata?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                    ) : (
                        <div className="w-full h-full rounded-full bg-gray-600 flex items-center justify-center text-gray-300">
                            <User size={20} />
                        </div>
                    )}
                </button>

                <button
                    onClick={() => user ? signOut() : setIsAuthModalOpen(true)}
                    className={`p-3 transition-all duration-200 rounded-xl ${user
                        ? 'text-red-400 hover:bg-red-500/10 hover:text-red-500'
                        : 'text-green-400 hover:bg-green-500/10 hover:text-green-500'
                        }`}
                    title={user ? "Sign Out" : "Sign In"}
                >
                    {user ? <LogOut size={24} /> : <LogIn size={24} />}
                </button>
            </div>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </nav>
    );
}
