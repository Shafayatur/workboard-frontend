import { create } from 'zustand';
import { api } from '@/lib/api';
import { AnnotateImage } from '@/types/image';
import { Point, Shape } from '@/types/annotation';

interface AnnotationState {
  images: AnnotateImage[];
  activeImageId: number | null;
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;
  fetchImages: () => Promise<void>;
  uploadImage: (file: File) => Promise<void>;
  deleteImage: (id: number) => Promise<void>;
  setActiveImage: (id: number) => void;
  createShape: (imageId: number, points: Point[], label?: string) => Promise<void>;
  suggestLabel: (imageBase64: string) => Promise<string>;
  updateShapeLabel: (imageId: number, shapeId: number, label: string) => Promise<void>;
  deleteShape: (imageId: number, shapeId: number) => Promise<void>;
  addShapeLocal: (imageId: number, shape: Shape) => void;
  removeShapeLocal: (imageId: number, shapeId: number) => void;
  clearError: () => void;
}

export const useAnnotationStore = create<AnnotationState>((set, get) => ({
  images: [],
  activeImageId: null,
  isLoading: false,
  isUploading: false,
  error: null,

  fetchImages: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<AnnotateImage[]>('/images/');
      set((state) => ({
        images: data,
        isLoading: false,
        activeImageId: data.some((img) => img.id === state.activeImageId)
          ? state.activeImageId
          : data[0]?.id ?? null,
      }));
    } catch {
      set({ error: 'Could not load images.', isLoading: false });
    }
  },

  uploadImage: async (file) => {
    set({ isUploading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name);
      formData.append('order', String(get().images.length));
      const { data } = await api.post<AnnotateImage>('/images/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      set({ images: [...get().images, data], activeImageId: data.id, isUploading: false });
    } catch {
      set({ error: 'Could not upload image.', isUploading: false });
    }
  },

  deleteImage: async (id) => {
    const prev = get().images;
    const remaining = prev.filter((img) => img.id !== id);
    set({
      images: remaining,
      activeImageId: get().activeImageId === id ? remaining[0]?.id ?? null : get().activeImageId,
    });
    try {
      await api.delete(`/images/${id}/`);
    } catch {
      set({ images: prev, error: 'Could not delete image — restored.' });
    }
  },

  setActiveImage: (id) => set({ activeImageId: id }),

  createShape: async (imageId, points, label = '') => {
    set({ error: null });
    try {
      const { data } = await api.post<Shape>(`/images/${imageId}/shapes/`, {
        points,
        label,
      });
      get().addShapeLocal(imageId, data);
    } catch {
      set({ error: 'Could not save shape.' });
    }
  },

  suggestLabel: async (imageBase64) => {
    try {
      const { data } = await api.post<{ label: string }>('/annotate/suggest-label/', {
        image_base64: imageBase64,
      });
      return data.label;
    } catch {
      return ''; // non-fatal — shape still saves, just without an AI label
    }
  },

  updateShapeLabel: async (imageId, shapeId, label) => {
    const prev = get().images;
    set({
      images: prev.map((img) =>
        img.id === imageId
          ? { ...img, shapes: img.shapes.map((s) => (s.id === shapeId ? { ...s, label } : s)) }
          : img
      ),
    });
    try {
      await api.patch(`/shapes/${shapeId}/`, { label });
    } catch {
      set({ images: prev, error: 'Could not rename shape — reverted.' });
    }
  },

  deleteShape: async (imageId, shapeId) => {
    const prev = get().images;
    get().removeShapeLocal(imageId, shapeId);
    try {
      await api.delete(`/shapes/${shapeId}/`);
    } catch {
      set({ images: prev, error: 'Could not delete shape — restored.' });
    }
  },

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

  clearError: () => set({ error: null }),
}));