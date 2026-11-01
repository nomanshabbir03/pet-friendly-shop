import { Schema, models, model } from 'mongoose';

const VetServiceSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    icon: {
      type: String, // lucide-react icon name (see constants/vet-service-icons.ts) — optional
      trim: true,
    },
    shortDescription: {
      type: String, // shown on the card in VeterinarySection
      trim: true,
    },
    detailContent: {
      type: String, // longer text shown on the /veterinary/[slug] detail page
      trim: true,
    },
    isEmergency: {
      type: Boolean,
      default: false, // clicking the card opens WhatsApp instead of a detail page
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default models.VetService || model('VetService', VetServiceSchema);
