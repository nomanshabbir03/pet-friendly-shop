import { Schema, models, model } from 'mongoose';

const BrandSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // No longer required: brands can now also be created inline from the product form's brand
    // combobox (name only, no logo step there) — see components/admin/BrandCombobox.tsx. The
    // standalone Brand management form (components/admin/BrandForm.tsx) still requires a logo
    // client-side before it lets an admin save through that screen, so that flow's quality bar
    // is unchanged; this only relaxes what the schema/API itself will accept.
    logoUrl: {
      type: String, // Cloudinary URL
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

export default models.Brand || model('Brand', BrandSchema);
