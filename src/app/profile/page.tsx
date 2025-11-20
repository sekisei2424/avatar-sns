'use client';

import { useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import PostForm from '@/components/ui/PostForm';
import Modal from '@/components/ui/Modal';
import { MapPin, Briefcase, Calendar } from 'lucide-react';

export default function ProfilePage() {
    const [isPostFormOpen, setIsPostFormOpen] = useState(false);

    return (
        <main className="flex w-full h-screen bg-village-base overflow-hidden">
            {/* Sidebar Layer */}
            <div className="flex-shrink-0 z-20">
                <Sidebar onPostClick={() => setIsPostFormOpen(true)} />
            </div>

            {/* Content Layer */}
            <div className="flex-grow relative z-0 overflow-y-auto bg-gray-50">
                {/* Header / Cover */}
                <div className="h-64 bg-gradient-to-r from-village-accent to-green-400 relative">
                    <div className="absolute -bottom-16 left-8">
                        <div className="w-32 h-32 bg-white rounded-full p-1 shadow-xl">
                            <div className="w-full h-full bg-blue-500 rounded-full"></div>
                        </div>
                    </div>
                </div>

                <div className="pt-20 px-8 pb-8 max-w-5xl mx-auto">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800">My Avatar</h1>
                            <p className="text-gray-500 text-lg">@my_avatar_id</p>
                        </div>
                        <button className="px-6 py-2 border-2 border-gray-300 rounded-full font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                            Edit Profile
                        </button>
                    </div>

                    <div className="flex gap-6 mb-8 text-gray-600">
                        <div className="flex items-center gap-2">
                            <MapPin size={20} />
                            <span>North Village</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Briefcase size={20} />
                            <span>Novice Farmer</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={20} />
                            <span>Joined Nov 2025</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Stats/Bio */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm">
                                <h3 className="font-bold text-gray-800 mb-4">Bio</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Just moved to the village! I love farming and meeting new people. Currently looking for wood to build my house.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm">
                                <h3 className="font-bold text-gray-800 mb-4">Stats</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Level</span>
                                        <span className="font-bold text-village-accent">5</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Reputation</span>
                                        <span className="font-bold text-village-accent">120</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Posts/Activity */}
                        <div className="lg:col-span-2 space-y-6">
                            <h3 className="font-bold text-2xl text-gray-800">Recent Activity</h3>
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-blue-500 rounded-full"></div>
                                        <div>
                                            <p className="font-bold text-gray-800">My Avatar</p>
                                            <p className="text-xs text-gray-500">Yesterday</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-700">Just finished planting the new crop! Can't wait for harvest season.</p>
                                    <div className="mt-4 h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                                        [Image Placeholder]
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Modal
                isOpen={isPostFormOpen}
                onClose={() => setIsPostFormOpen(false)}
                title="Share Experience"
            >
                <PostForm onClose={() => setIsPostFormOpen(false)} />
            </Modal>
        </main>
    );
}
