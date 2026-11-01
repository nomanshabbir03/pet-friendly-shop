import { Schema, models, model } from 'mongoose';

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true, // matched directly against Product.category — see lib/models/Product.ts
    },
    image: {
      type: String, // Cloudinary URL (or a local /public path, e.g. for seeded content)
      trim: true,
    },
    // Same {name, slug} shape CategoryNavBar's dropdown already expected from the old static
    // lib/categories.ts (categorySubcategories) — kept identical so no consumer needed a
    // different data shape, just a different data source.
    subcategories: [
      {
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, trim: true },
      },
    ],
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

export default models.Category || model('Category', CategorySchema);
