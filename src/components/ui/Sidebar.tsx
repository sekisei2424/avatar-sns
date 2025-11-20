import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusSquare, User, MapPin } from 'lucide-react';

interface SidebarProps {
    onPostClick: () => void;
}

export default function Sidebar({ onPostClick }: SidebarProps) {
    const pathname = usePathname();
    const isPlaza = pathname === '/' || pathname === '/plaza';
    const isVillage = pathname === '/village';
    const isSearch = pathname === '/search';
    const isProfile = pathname === '/profile';

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

            <button onClick={() => handleNavigation('/search')} title="Search" className={iconClass(isSearch)}>
                <Search size={32} />
            </button>

            <button onClick={() => handleNavigation('/profile')} title="Profile" className={iconClass(isProfile)}>
                <User size={32} />
            </button>
        </nav>
    );
}
