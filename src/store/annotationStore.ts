import { create } from 'zustand';
import { api } from '@/lib/api';
import { AnnotateImage } from '@/types/image';
import { Shape } from '@/types/annotation';

interface AnnotationState {
  images: AnnotateImage[];
  activeImageId: number | null;
  isLoading: boolean;
  error: string | null;
  fetchImages: () => Promise<void>;
  setActiveImage: (id: number) => void;
  addShapeLocal: (imageId: number, shape: Shape) => void;
  removeShapeLocal: (imageId: number, shapeId: number) => void;
}

export const useAnnotationStore = create<AnnotationState>((set, get) => ({
  images: [],
  activeImageId: null,
  isLoading: false,
  error: null,

  fetchImages: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<AnnotateImage[]>('/images/');
      set({
        images: data,
        isLoading: false,
        activeImageId: data[0]?.id ?? null,
      });
    } catch {
      set({ error: 'Could not load images.', isLoading: false });
    }
  },

  setActiveImage: (id) => set({ activeImageId: id }),

  addShapeLocal: (imageId, shape) =>
    set({
      images: get().images.map((img) =>
        img.id === imageId ? { ...img, shapes: [...img.shapes, shape] } : img
      ),
    }),

  removeShapeLocal: (imageId, shapeId) =>
    set({
      images: get().images.map((img) =>
        img.id === imageId
          ? { ...img, shapes: img.shapes.filter((s) => s.id !== shapeId) }
          : img
      ),
    }),
}));
