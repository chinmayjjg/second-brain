import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Brain } from 'lucide-react';
import axios from 'axios';

import Sidebar from './dashboard/Sidebar';
import BrainHeader from './dashboard/BrainHeader';
import ContentGrid from './dashboard/ContentGrid';
import AddContentModal from './dashboard/AddContentModal';
import ViewContentModal from './dashboard/ViewContentModal';

const API_BASE_URL = 'https://second-brain-7mvv.onrender.com/api';

interface BrainType {
  _id: string;
  name: string;
  description?: string;
  isPublic: boolean;
}

interface Item {
  _id: string;
  title: string;
  url?: string;
  content?: string;
  description?: string;
  type: 'link' | 'article' | 'video' | 'note';
  tags: string[];
  metadata?: {
    thumbnail?: string;
    author?: string;
  };
  createdAt: string;
}

type ItemType = 'link' | 'article' | 'video' | 'note';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [brains, setBrains] = useState<BrainType[]>([]);
  const [selectedBrain, setSelectedBrain] = useState<BrainType | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [newItem, setNewItem] = useState<{
    title: string;
    url: string;
    content: string;
    description: string;
    type: ItemType;
    tags: string;
  }>({
    title: '',
    url: '',
    content: '',
    description: '',
    type: 'link',
    tags: ''
  });

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  useEffect(() => {
    fetchBrains();
  }, []);

  useEffect(() => {
    if (selectedBrain) {
      fetchItems();
    }
  }, [selectedBrain, searchQuery, filterType]);

  const fetchBrains = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/brains`);
      setBrains(response.data);
      if (response.data.length > 0) {
        setSelectedBrain(response.data[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch brains:', error);
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    if (!selectedBrain) return;

    try {
      const params = new URLSearchParams({
        brainId: selectedBrain._id,
        ...(searchQuery && { search: searchQuery }),
        ...(filterType !== 'all' && { type: filterType })
      });

      const response = await axios.get(`${API_BASE_URL}/items?${params}`);
      setItems(response.data.items);
    } catch (error) {
      console.error('Failed to fetch items:', error);
      setItems([]);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrain) return;

    try {
      await axios.post(`${API_BASE_URL}/items`, {
        ...newItem,
        brainId: selectedBrain._id,
        tags: newItem.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      });

      setNewItem({
        title: '',
        url: '',
        content: '',
        description: '',
        type: 'link',
        tags: ''
      });
      setShowAddModal(false);
      fetchItems();
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const handleShareBrain = async () => {
    if (!selectedBrain) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/brains/${selectedBrain._id}/share`);
      const shareUrl = `${window.location.origin}${response.data.shareUrl}`;

      await navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    } catch (error) {
      console.error('Failed to share brain:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/items/${itemId}`);
      fetchItems();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const getEmbedUrl = (url: string | undefined) => {
    if (!url) return null;
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex">
      {/* Sidebar Component */}
      <Sidebar
        brains={brains}
        selectedBrain={selectedBrain}
        setSelectedBrain={setSelectedBrain}
        user={user}
        logout={logout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {selectedBrain ? (
              <>
                <BrainHeader
                  selectedBrain={selectedBrain}
                  itemCount={items.length}
                  onShare={handleShareBrain}
                  onAddItem={() => setShowAddModal(true)}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  filterType={filterType}
                  setFilterType={setFilterType}
                  setSidebarOpen={setSidebarOpen}
                />

                {items.length > 0 ? (
                  <ContentGrid
                    items={items}
                    onDelete={handleDeleteItem}
                    onView={setSelectedItem}
                    getEmbedUrl={getEmbedUrl}
                  />
                ) : (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                    <div className="bg-gray-50 p-4 rounded-full inline-block mb-4">
                      <Brain className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      This brain is empty
                    </h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-6">
                      Start building your second brain by adding links, notes, videos, or articles.
                    </p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
                    >
                      Add First Item
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a brain to get started
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <AddContentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddItem}
        newItem={newItem}
        setNewItem={setNewItem}
      />

      <ViewContentModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
};

export default Dashboard;
