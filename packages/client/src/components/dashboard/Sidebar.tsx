import React from 'react';
import { Brain, LogOut, X, Menu } from 'lucide-react';

interface SidebarProps {
    brains: any[];
    selectedBrain: any;
    setSelectedBrain: (brain: any) => void;
    user: any;
    logout: () => void;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    brains,
    selectedBrain,
    setSelectedBrain,
    user,
    logout,
    sidebarOpen,
    setSidebarOpen
}) => {
    return (
        <>
            <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-2xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
                <div className="flex items-center justify-between p-8 border-b border-gray-100/50">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/20">
                            <Brain className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                            Second Brain
                        </span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 flex flex-col h-[calc(100vh-89px)]">
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">Your Collections</h2>
                    <div className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {brains.map((brain) => (
                            <button
                                key={brain._id}
                                onClick={() => {
                                    setSelectedBrain(brain);
                                    setSidebarOpen(false);
                                }}
                                className={`w-full text-left p-3 rounded-xl transition-all duration-200 group ${selectedBrain?._id === brain._id
                                        ? 'bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-900 shadow-sm ring-1 ring-purple-100'
                                        : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <div className="font-semibold">{brain.name}</div>
                                {brain.description && (
                                    <div className={`text-sm mt-1 truncate ${selectedBrain?._id === brain._id ? 'text-purple-700/70' : 'text-gray-400 group-hover:text-gray-500'
                                        }`}>
                                        {brain.description}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="mt-auto pt-6 border-t border-gray-100/50">
                        <div className="flex items-center space-x-3 mb-6 bg-gray-50/80 p-3 rounded-xl backdrop-blur-sm border border-gray-100">
                            <img
                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.username}`}
                                alt={user?.username}
                                className="h-10 w-10 rounded-full ring-2 ring-white shadow-sm"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 truncate">{user?.username}</div>
                                <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors rounded-xl"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
