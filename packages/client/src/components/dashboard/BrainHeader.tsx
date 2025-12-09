import React from 'react';
import { Share, Plus, Search, Filter, Menu } from 'lucide-react';

interface BrainHeaderProps {
    selectedBrain: any;
    itemCount: number;
    onShare: () => void;
    onAddItem: () => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filterType: string;
    setFilterType: (type: string) => void;
    setSidebarOpen: (open: boolean) => void;
}

const BrainHeader: React.FC<BrainHeaderProps> = ({
    selectedBrain,
    itemCount,
    onShare,
    onAddItem,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    setSidebarOpen
}) => {
    return (
        <div className="mb-8 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 text-gray-400 hover:text-gray-600 bg-white rounded-lg border border-gray-200 shadow-sm"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{selectedBrain.name}</h1>
                        <p className="text-gray-500 mt-1 font-medium">
                            {itemCount} {itemCount === 1 ? 'item' : 'items'} stored
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={onShare}
                        className="flex items-center space-x-2 px-4 py-2.5 bg-white text-gray-700 rounded-xl border border-gray-200 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                    >
                        <Share className="h-4 w-4" />
                        <span className="hidden sm:inline">Share</span>
                    </button>
                    <button
                        onClick={onAddItem}
                        className="flex items-center space-x-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Add Content</span>
                        <span className="sm:hidden">Add</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-purple-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search your brain..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm outline-none"
                    />
                </div>
                <div className="relative min-w-[180px]">
                    <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm outline-none appearance-none cursor-pointer"
                    >
                        <option value="all">All Types</option>
                        <option value="link">Links</option>
                        <option value="article">Articles</option>
                        <option value="video">Videos</option>
                        <option value="note">Notes</option>
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none border-l pl-2 border-gray-200">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrainHeader;
