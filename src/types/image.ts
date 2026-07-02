import { Shape } from './annotation';

export interface AnnotateImage {
  id: number;
  file: string; // URL
  name: string;
  order: number;
  uploaded_at: string;
  shapes: Shape[];
}
