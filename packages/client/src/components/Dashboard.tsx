import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Brain } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

import Sidebar from './dashboard/Sidebar';
import BrainHeader from './dashboard/BrainHeader';
import ContentGrid from './dashboard/ContentGrid';
import AddContentModal from './dashboard/AddContentModal';
import ViewContentModal from './dashboard/ViewContentModal';

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
  moderation?: {
    isSafe: boolean;
    ageRestricted: boolean;
    reason: string;
    provider: string;
    checkedAt: string;
  };
  sourceStatus?: {
    isDeleted: boolean;
    statusCode?: number;
    reason?: string;
    checkedAt?: string;
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
  const [showExtensionInstallModal, setShowExtensionInstallModal] = useState(false);
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

  const handleInstallExtension = () => {
    setShowExtensionInstallModal(true);
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
                  onInstallExtension={handleInstallExtension}
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

      {showExtensionInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/55 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
            <div className="border-b border-gray-100 px-6 py-5 sm:px-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                    Browser Install
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-gray-900">
                    Install the Chrome extension in your browser
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Chrome does not allow a website to directly install a local unpacked extension, so we open the browser install steps here instead of downloading a zip.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExtensionInstallModal(false)}
                  className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Close install instructions"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-6 px-6 py-6 sm:px-8">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Use the unpacked extension folder, not a downloaded zip file.
              </div>

              <ol className="space-y-3 text-sm text-gray-700">
                <li className="rounded-2xl bg-gray-50 px-4 py-3">
                  1. Open <span className="font-semibold text-gray-900">chrome://extensions</span> in Chrome.
                </li>
                <li className="rounded-2xl bg-gray-50 px-4 py-3">
                  2. Turn on <span className="font-semibold text-gray-900">Developer mode</span>.
                </li>
                <li className="rounded-2xl bg-gray-50 px-4 py-3">
                  3. Click <span className="font-semibold text-gray-900">Load unpacked</span>.
                </li>
                <li className="rounded-2xl bg-gray-50 px-4 py-3">
                  4. Select the folder <code className="rounded bg-white px-2 py-1 text-xs text-gray-900">packages/extension</code>.
                </li>
              </ol>

              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-sm font-semibold text-gray-900">After installation</p>
                <p className="mt-2 text-sm text-gray-600">
                  Open the extension popup, keep the API URL set to <code className="rounded bg-gray-100 px-2 py-1 text-xs">http://localhost:5000/api</code> unless you changed it, then log in and choose a default brain.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
              <button
                type="button"
                onClick={() => setShowExtensionInstallModal(false)}
                className="rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText('packages/extension')}
                className="rounded-2xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Copy Folder Name
              </button>
            </div>
          </div>
        </div>
      )}

      <ViewContentModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
};

export default Dashboard;
