import 'dotenv/config';

export const modelsConfig = {
  text: { 
    id: process.env.TEXT_MODEL_ID, 
    dim: Number(process.env.TEXT_MODEL_DIM) 
    },
  image: { 
    id: process.env.IMAGE_MODEL_ID, 
    dim: Number(process.env.IMAGE_MODEL_DIM) 
    },
  cacheDir: process.env.MODEL_CACHE_DIR,
};
