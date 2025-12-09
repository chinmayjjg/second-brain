import React from 'react';
import { X, Link as LinkIcon, FileText, Video, StickyNote } from 'lucide-react';

interface ViewContentModalProps {
    item: any;
    onClose: () => void;
}

const ViewContentModal: React.FC<ViewContentModalProps> = ({ item, onClose }) => {
    if (!item) return null;

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'link': return <LinkIcon className="h-5 w-5" />;
            case 'article': return <FileText className="h-5 w-5" />;
            case 'video': return <Video className="h-5 w-5" />;
            case 'note': return <StickyNote className="h-5 w-5" />;
            default: return <FileText className="h-5 w-5" />;
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity" onClick={onClose} />
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col transform transition-all scale-100">
                <button
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-20"
                    onClick={onClose}
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="p-8 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className={`p-3 rounded-xl ${item.type === 'video' ? 'bg-red-100 text-red-600' :
                                item.type === 'link' ? 'bg-blue-100 text-blue-600' :
                                    'bg-purple-100 text-purple-600'
                            }`}>
                            {getTypeIcon(item.type)}
                        </div>
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">{item.type}</span>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">{item.title}</h2>

                    {item.description && (
                        <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-gray-600 italic">
                                {item.description}
                            </p>
                        </div>
                    )}

                    <div className="prose prose-lg max-w-none text-gray-700">
                        {item.content ? (
                            <div className="whitespace-pre-wrap leading-relaxed">
                                {item.content}
                            </div>
                        ) : (
                            <p className="text-gray-400 italic text-center py-8">No content available to display.</p>
                        )}
                    </div>

                    {item.tags && item.tags.length > 0 && (
                        <div className="mt-10 pt-6 border-t border-gray-100">
                            <div className="flex flex-wrap gap-2">
                                {item.tags.map((tag: string, index: number) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-6 text-sm text-gray-400">
                        Added on {new Date(item.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewContentModal;
