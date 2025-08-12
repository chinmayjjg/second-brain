import mongoose, { Document, Schema } from 'mongoose';

export interface IBrain extends Document {
  name: string;
  description?: string;
  userId: mongoose.Types.ObjectId;
  isPublic: boolean;
  shareToken?: string;
  collaborators: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const brainSchema = new Schema<IBrain>({
  name: { type: String, required: true },
  description: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isPublic: { type: Boolean, default: false },
  shareToken: { type: String, unique: true, sparse: true },
  collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true
});

export default mongoose.model<IBrain>('Brain', brainSchema);