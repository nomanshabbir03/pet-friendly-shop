import { Schema, models, model } from 'mongoose';

// Singleton document — there is only ever one Announcement, identified by this fixed id.
export const ANNOUNCEMENT_SINGLETON_ID = 'singleton';

const AnnouncementSchema = new Schema(
  {
    _id: {
      type: String,
      default: ANNOUNCEMENT_SINGLETON_ID,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

export default models.Announcement || model('Announcement', AnnouncementSchema);
