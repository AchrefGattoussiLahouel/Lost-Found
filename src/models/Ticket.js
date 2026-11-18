import mongoose from 'mongoose';
const { Schema } = mongoose;

const TicketSchema = new Schema({
  lostId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  foundId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  scores: { semantic: Number, visual: Number, spatial: Number, temporal: Number, total: Number },
  tier: { type: String, enum: ['ALERT', 'POSSIBLE'], required: true },
  reasons: [String],
  status: {
    type: String,
    enum: ['PROPOSED', 'ACCEPTED', 'REFUSED', 'HANDED_OVER', 'CLOSED'],
    default: 'PROPOSED',
  },
  
}, { timestamps: { createdAt: true, updatedAt: false } });

TicketSchema.index({ lostId: 1, foundId: 1 }, { unique: true });
export default mongoose.model('Ticket', TicketSchema);
