import React from 'react';
import { X, Plus, Image, FileText, Video, StickyNote, Link as LinkIcon } from 'lucide-react';

interface AddContentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (e: React.FormEvent) => void;
    newItem: any;
    setNewItem: (item: any) => void;
}

const AddContentModal: React.FC<AddContentModalProps> = ({
    isOpen,
    onClose,
    onAdd,
    newItem,
    setNewItem
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity" onClick={onClose} />
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden transform transition-all scale-100">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
                <button
                    className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    onClick={onClose}
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="p-8">
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <Plus className="h-6 w-6 text-purple-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Add to Brain</h2>
                    </div>

                    <form onSubmit={onAdd} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                required
                                value={newItem.title}
                                onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none"
                                placeholder="Give it a catchy title..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                            <div className="grid grid-cols-4 gap-3">
                                {[
                                    { id: 'link', icon: LinkIcon, label: 'Link' },
                                    { id: 'article', icon: FileText, label: 'Article' },
                                    { id: 'video', icon: Video, label: 'Video' },
                                    { id: 'note', icon: StickyNote, label: 'Note' },
                                ].map(type => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setNewItem({ ...newItem, type: type.id })}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${newItem.type === type.id
                                                ? 'border-purple-500 bg-purple-50 text-purple-700 ring-1 ring-purple-500'
                                                : 'border-gray-200 hover:border-purple-200 hover:bg-gray-50 text-gray-600'
                                            }`}
                                    >
                                        <type.icon className="h-5 w-5 mb-1" />
                                        <span className="text-xs font-medium">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {(newItem.type === 'link' || newItem.type === 'video') && (
                            <div className="animate-fadeIn">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">URL</label>
                                <input
                                    type="url"
                                    value={newItem.url}
                                    onChange={e => setNewItem({ ...newItem, url: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none"
                                    placeholder="https://..."
                                />
                            </div>
                        )}

                        {(newItem.type === 'article' || newItem.type === 'note') && (
                            <div className="animate-fadeIn">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
                                <textarea
                                    value={newItem.content}
                                    onChange={e => setNewItem({ ...newItem, content: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none min-h-[120px]"
                                    placeholder="Write your thoughts here..."
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                            <input
                                type="text"
                                value={newItem.description}
                                onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none"
                                placeholder="Optional description"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
                            <input
                                type="text"
                                value={newItem.tags}
                                onChange={e => setNewItem({ ...newItem, tags: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none"
                                placeholder="design, coding, ideas (comma separated)"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 transform hover:-translate-y-0.5 transition-all"
                        >
                            Add Item
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddContentModal;
