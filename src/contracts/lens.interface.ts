export interface LensSpecification {
  focalLength: number;
  aperture: number;
  minFocus: number;
  magnification: number;
}

export interface Lens {
  id: number;
  manufacturer: string;
  model: string;
  shortName: string;
  mount: string;
  teleconverter: boolean;
  data: LensSpecification[];
}

export type LensData = Lens[];
