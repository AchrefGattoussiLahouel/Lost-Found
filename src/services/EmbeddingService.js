import {
  pipeline, env, AutoProcessor, CLIPVisionModelWithProjection, RawImage,
} from '@huggingface/transformers';
import { norm2 } from '../utils/vector';


export class EmbeddingService {
  constructor(cfg) {
    this.cfg = cfg;
    this.textPipe = null;
    this.imgProcessor = null;
    this.imgModel = null;
  }

  async init() {
    env.cacheDir = this.cfg.cacheDir;
    this.textPipe = await pipeline('feature-extraction', this.cfg.text.id);
    this.imgProcessor = await AutoProcessor.from_pretrained(this.cfg.image.id);
    this.imgModel = await CLIPVisionModelWithProjection.from_pretrained(this.cfg.image.id);
  }

  buildPostText(post) {
    return `${post.category}. ${post.title}. ${post.description || ''}`.trim();
  }

  async embedText(text) {
    const out = await this.textPipe(text, { pooling: 'mean', normalize: true });
    return Array.from(out.data); 
  }

  async embedImage(filePath) {
    const inputs = await this.imgProcessor(await RawImage.read(filePath));
    const { image_embeds } = await this.imgModel(inputs);
    const v = Array.from(image_embeds.data);
    const norm = norm2(v);
    return v.map((x) => x / norm); 
  }
}