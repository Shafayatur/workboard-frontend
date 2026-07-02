export interface Point {
  x: number; // normalized 0-1, relative to image width
  y: number; // normalized 0-1, relative to image height
}

export interface Shape {
  id: number;
  points: Point[];
  label: string;
  color: string;
  created_at: string;
}
