import { Schema, models, model } from 'mongoose';

const HeroSlideSchema = new Schema(
  {
    image: {
      type: String,
      required: true, // Cloudinary URL (or a local /public path, e.g. for seeded content)
    },
    heading: {
      type: String,
      trim: true,
    },
    subtext: {
      type: String,
      trim: true,
    },
    buttonText: {
      type: String,
      trim: true,
    },
    buttonLink: {
      type: String,
      trim: true,
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

export default models.HeroSlide || model('HeroSlide', HeroSlideSchema);
