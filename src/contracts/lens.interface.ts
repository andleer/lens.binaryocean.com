export interface LensSpecification {
  focalLength: number;
  aperture: number;
  minFocus: number;
  magnification: number;
  teleconverter?: string; // "1.4x", "2x", or undefined for native
}

export interface Lens {
  id: number;
  manufacturer: string;
  model: string;
  mount: string;
  weight?: number; // Weight in grams (optional for backward compatibility)
  length?: number; // Length in mm (optional for backward compatibility)
  filter?: number | string; // Filter thread diameter in mm or empty string if no threads
  teleconverters: number[]; // [1.4, 2.0] - available teleconverter multipliers
  data: LensSpecification[];
}

export type LensData = Lens[];
