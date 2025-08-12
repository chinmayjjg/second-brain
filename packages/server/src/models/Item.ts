import mongoose, { Document, Schema } from 'mongoose';

export interface IItem extends Document {
  title: string;
  url?: string;
  content?: string;
  description?: string;
  type: 'link' | 'article' | 'video' | 'note';
  tags: string[];
  userId: mongoose.Types.ObjectId;
  brainId: mongoose.Types.ObjectId;
  metadata?: {
    thumbnail?: string;
    author?: string;
    publishedAt?: Date;
    duration?: number; // for videos
  };
  createdAt: Date;
  updatedAt: Date;
}

const itemSchema = new Schema<IItem>({
  title: { type: String, required: true },
  url: { type: String },
  content: { type: String },
  description: { type: String },
  type: { 
    type: String, 
    enum: ['link', 'article', 'video', 'note'], 
    required: true 
  },
  tags: [{ type: String, trim: true }],
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  brainId: { type: Schema.Types.ObjectId, ref: 'Brain', required: true },
  metadata: {
    thumbnail: String,
    author: String,
    publishedAt: Date,
    duration: Number
  }
}, {
  timestamps: true
});

itemSchema.index({ userId: 1, createdAt: -1 });
itemSchema.index({ tags: 1 });
itemSchema.index({ title: 'text', description: 'text', content: 'text' });

export default mongoose.model<IItem>('Item', itemSchema);