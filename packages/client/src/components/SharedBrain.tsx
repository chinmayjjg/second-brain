import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Brain, LinkIcon, FileText, Video, StickyNote } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'link':
        return <LinkIcon className="h-4 w-4" />;
      case 'article':
        return <FileText className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'note':
        return <StickyNote className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Brain Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{data.brain.name}</h1>
              <p className="text-gray-600">
                Shared by {data.brain.userId.username}
                {data.brain.description && ` • ${data.brain.description}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <p className="text-gray-600">{data.items.length} items in this brain</p>
        </div>

        {/* Items grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.items.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Type */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(item.type)}
                  <span className="text-sm text-gray-500 capitalize">{item.type}</span>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>

              {/* Description */}
              {item.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">{item.description}</p>
              )}

              {/* URL */}
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

              {/* Tags */}
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

              {/* Date */}
              <div className="text-xs text-gray-400 mt-3">
                {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {data.items.length === 0 && (
          <div className="text-center py-12">
            <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              This brain is empty
            </h3>
            <p className="text-gray-500">No items have been added to this brain yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedBrain;
