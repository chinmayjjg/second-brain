import React from 'react';
import { Link as LinkIcon, FileText, Video, StickyNote, Trash2, ExternalLink, Play, Eye } from 'lucide-react';

interface ContentGridProps {
    items: any[];
    onDelete: (id: string) => void;
    onView: (item: any) => void;
    getEmbedUrl: (url: string) => string | null;
    readOnly?: boolean;
}

const ContentGrid: React.FC<ContentGridProps> = ({ items, onDelete, onView, getEmbedUrl, readOnly = false }) => {

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'link': return <LinkIcon className="h-4 w-4" />;
            case 'article': return <FileText className="h-4 w-4" />;
            case 'video': return <Video className="h-4 w-4" />;
            case 'note': return <StickyNote className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fadeIn">
            {items.map((item) => (
                <div
                    key={item._id}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden"
                >
                    <div className="p-6 flex flex-col flex-grow">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-2 rounded-lg ${item.type === 'video' ? 'bg-red-50 text-red-600' :
                                    item.type === 'link' ? 'bg-blue-50 text-blue-600' :
                                        'bg-purple-50 text-purple-600'
                                }`}>
                                {getTypeIcon(item.type)}
                            </div>
                            {!readOnly && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(item._id); }}
                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    title="Delete"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <h3 className="font-bold text-gray-900 text-lg mb-3 line-clamp-2 leading-snug group-hover:text-purple-600 transition-colors">
                            {item.title}
                        </h3>

                        {item.type === 'video' && item.url && getEmbedUrl(item.url) && (
                            <div className="mb-4 -mx-6 mt-2 relative pt-[56.25%] bg-black group-hover:brightness-110 transition-all">
                                <iframe
                                    className="absolute inset-0 w-full h-full"
                                    src={getEmbedUrl(item.url)!}
                                    title={item.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        )}

                        {item.description && (
                            <p className="text-gray-500 text-sm mb-4 line-clamp-3 leading-relaxed flex-grow">
                                {item.description}
                            </p>
                        )}

                        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
                            <div className="flex space-x-2">
                                {item.type === 'note' && (
                                    <button
                                        onClick={() => onView(item)}
                                        className="flex items-center space-x-1.5 text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors"
                                    >
                                        <Eye className="h-3 w-3" />
                                        <span>Read</span>
                                    </button>
                                )}
                                {item.type === 'video' && !getEmbedUrl(item.url) && item.url && (
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-1.5 text-xs font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                                    >
                                        <Play className="h-3 w-3" />
                                        <span>Watch</span>
                                    </a>
                                )}
                                {item.type === 'link' && item.url && (
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                        <span>Visit</span>
                                    </a>
                                )}
                            </div>

                            <span className="text-xs text-gray-400 font-medium">
                                {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    {item.tags.length > 0 && (
                        <div className="px-6 pb-4 flex flex-wrap gap-1.5">
                            {item.tags.slice(0, 3).map((tag: string, index: number) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-gray-50 text-gray-500 text-[10px] font-medium uppercase tracking-wider rounded-md border border-gray-100"
                                >
                                    {tag}
                                </span>
                            ))}
                            {item.tags.length > 3 && (
                                <span className="px-2 py-1 bg-gray-50 text-gray-400 text-[10px] font-medium rounded-md border border-gray-100">
                                    +{item.tags.length - 3}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ContentGrid;
