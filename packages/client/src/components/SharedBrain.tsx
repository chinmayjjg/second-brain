import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Brain, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import ContentGrid from './dashboard/ContentGrid';
import ViewContentModal from './dashboard/ViewContentModal';

const API_BASE_URL = 'https://second-brain-7mvv.onrender.com/api';

interface SharedBrainData {
  brain: {
    name: string;
    description?: string;
    userId: {
      username: string;
    };
  };
  items: Array<{
    _id: string;
    title: string;
    url?: string;
    content?: string;
    description?: string;
    type: 'link' | 'article' | 'video' | 'note';
    tags: string[];
    createdAt: string;
  }>;
}

const SharedBrain: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<SharedBrainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  useEffect(() => {
    fetchSharedBrain();
  }, [token]);

  const fetchSharedBrain = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/brains/shared/${token}`);
      setData(response.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load shared brain');
    } finally {
      setLoading(false);
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full">
          <div className="bg-red-100 p-4 rounded-full inline-block mb-4">
            <Brain className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Brain Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/" className="inline-flex items-center text-purple-600 font-medium hover:text-purple-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg shadow-lg shadow-purple-500/20">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div className="leading-tight">
                <h1 className="text-xl font-bold text-gray-900">{data.brain.name}</h1>
                <p className="text-sm text-gray-500 font-medium">
                  by {data.brain.userId.username}
                </p>
              </div>
            </div>

            <Link to="/login" className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
              Join Second Brain
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {data.brain.description && (
          <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">About this Brain</h2>
            <p className="text-gray-700 leading-relaxed text-lg">{data.brain.description}</p>
          </div>
        )}

        <div className="mb-6 flex items-center text-gray-500 text-sm font-medium">
          <span>{data.items.length} {data.items.length === 1 ? 'item' : 'items'} shared</span>
        </div>

        {/* Reuse ContentGrid with readOnly prop */}
        <ContentGrid
          items={data.items}
          onDelete={() => { }} // No-op
          onView={setSelectedItem}
          getEmbedUrl={getEmbedUrl}
          readOnly={true}
        />

        {data.items.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 mt-8">
            <div className="bg-gray-50 p-4 rounded-full inline-block mb-4">
              <Brain className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              This brain is empty
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              The owner hasn't added any content to this shared brain yet.
            </p>
          </div>
        )}
      </main>

      <ViewContentModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
};

export default SharedBrain;
