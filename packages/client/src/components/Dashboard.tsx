import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Brain, 
  Plus, 
  Search, 
  Filter, 
  Link as LinkIcon, 
  FileText, 
  Video, 
  StickyNote,
  Share,
  LogOut,
  Menu,
  X,
  Trash2 // <-- Add this
} from 'lucide-react';
import axios from 'axios';

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'link': return <LinkIcon className="h-4 w-4" />;
      case 'article': return <FileText className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'note': return <StickyNote className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu */}
      <div className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Second Brain</h1>
        <button
          onClick={logout}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-purple-600" />
              <span className="text-xl font-bold text-gray-900">Second Brain</span>
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Brains</h2>
            <div className="space-y-2">
              {brains.map((brain) => (
                <button
                  key={brain._id}
                  onClick={() => {
                    setSelectedBrain(brain);
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedBrain?._id === brain._id
                      ? 'bg-purple-100 text-purple-800'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{brain.name}</div>
                  {brain.description && (
                    <div className="text-sm text-gray-500 mt-1">{brain.description}</div>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t">
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.username}`}
                  alt={user?.username}
                  className="h-10 w-10 rounded-full"
                />
                <div>
                  <div className="font-medium text-gray-900">{user?.username}</div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6">
          {selectedBrain && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedBrain.name}</h1>
                  <p className="text-gray-600 mt-1">
                    {items.length} items in your brain
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleShareBrain}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Share className="h-4 w-4" />
                    <span>Share</span>
                  </button>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search your brain..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="link">Links</option>
                    <option value="article">Articles</option>
                    <option value="video">Videos</option>
                    <option value="note">Notes</option>
                  </select>
                </div>
              </div>

              {/* Items grid & Empty state */}
              {items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <div
                      key={item._id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(item.type)}
                          <span className="text-sm text-gray-500 capitalize">{item.type}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                          {item.description}
                        </p>
                      )}

                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                          Visit Link →
                        </a>
                      )}

                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {item.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {item.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{item.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="text-xs text-gray-400 mt-3">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    This brain is empty
                  </h3>
                  <p className="text-gray-500">
                    No items have been added to this brain yet
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => setShowAddModal(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Add New Item</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newItem.title}
                  onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={newItem.type}
                  onChange={e => setNewItem({ ...newItem, type: e.target.value as any })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="link">Link</option>
                  <option value="article">Article</option>
                  <option value="video">Video</option>
                  <option value="note">Note</option>
                </select>
              </div>
              {(newItem.type === 'link' || newItem.type === 'video') && (
                <div>
                  <label className="block text-sm font-medium mb-1">URL</label>
                  <input
                    type="url"
                    value={newItem.url}
                    onChange={e => setNewItem({ ...newItem, url: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              )}
              {(newItem.type === 'article' || newItem.type === 'note') && (
                <div>
                  <label className="block text-sm font-medium mb-1">Content</label>
                  <textarea
                    value={newItem.content}
                    onChange={e => setNewItem({ ...newItem, content: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={newItem.description}
                  onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newItem.tags}
                  onChange={e => setNewItem({ ...newItem, tags: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
              >
                Add Item
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
