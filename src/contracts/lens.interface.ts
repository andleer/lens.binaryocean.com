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
  teleconverter: boolean;
  teleconverterTypes?: string[]; // ["1.4x", "2x"] - available teleconverters
  data: LensSpecification[];
}

export type LensData = Lens[];
