import { Injectable, signal, computed } from '@angular/core';
import { LensData, Lens } from '../contracts/lens.interface';
import { LensService } from './lens.calculations';

// Import lens data from multiple files
import nikonZLenses from '../assets/lens-data/nikon-z-mount.json';
import nikonFLenses from '../assets/lens-data/nikon-f-mount.json';
import sonyELenses from '../assets/lens-data/sony-e-mount.json';
import canonRFLenses from '../assets/lens-data/canon-rf-mount.json';
import tamronZLenses from '../assets/lens-data/tamron-z-mount.json';
import tamronELenses from '../assets/lens-data/tamron-e-mount.json';
import tamronRFLenses from '../assets/lens-data/tamron-rf-mount.json';
import viltroxZLenses from '../assets/lens-data/viltrox-z-mount.json';
import viltroxRFLenses from '../assets/lens-data/viltrox-rf-mount.json';
import viltroxELenses from '../assets/lens-data/viltrox-e-mount.json';
import sigmaZLenses from '../assets/lens-data/sigma-z-mount.json';

// Interface for the structure of lens data files
interface LensDataSource {
  manufacturer: string;
  mount: string;
  lenses: Array<{
    id: number;
    model: string;
    weight?: number; // Weight in grams (optional for backward compatibility)
    length?: number; // Length in mm (optional for backward compatibility)
    filter?: number; // Filter thread size in mm (optional for backward compatibility)
    teleconverters: number[];
    data: Array<{
      focalLength: number;
      aperture: number;
      minFocus: number;
      magnification: number;
    }>;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class LensDataService {
  // Signal to hold the lens data - initialized with empty array, populated in constructor
  private readonly _lensData = signal<LensData>([]);

  constructor(private lensService: LensService) {
    this.loadData();
  }

  // Public readonly signal
  readonly lensData = this._lensData.asReadonly();

  private loadData(): void {
    const lensDataSources = [
      canonRFLenses,
      nikonZLenses,
      nikonFLenses,
      sonyELenses,
      tamronZLenses,
      tamronELenses,
      tamronRFLenses,
      viltroxZLenses,
      viltroxELenses,
      viltroxRFLenses,
      sigmaZLenses
    ];

    const allLenses = lensDataSources.flatMap(source => 
      this.extractLensData(source)
    );

    // Sort lenses by minimum focal length, then by maximum focal length
    const sortedLenses = allLenses.sort((a, b) => {
      const aMinFocal = Math.min(...a.data.map(d => d.focalLength));
      const aMaxFocal = Math.max(...a.data.map(d => d.focalLength));
      const bMinFocal = Math.min(...b.data.map(d => d.focalLength));
      const bMaxFocal = Math.max(...b.data.map(d => d.focalLength));

      // First sort by minimum focal length
      if (aMinFocal !== bMinFocal) {
        return aMinFocal - bMinFocal;
      }

      // If minimum focal lengths are equal, sort by maximum focal length
      return aMaxFocal - bMaxFocal;
    });

    // Set the signal with the sorted data
    this._lensData.set(sortedLenses);
  }

  // Computed signals for filtered data
  readonly manufacturers = computed(() => {
    const lenses = this._lensData();
    return [...new Set(lenses.map(lens => lens.manufacturer))].sort();
  });

  readonly mountTypes = computed(() => {
    const lenses = this._lensData();
    return [...new Set(lenses.map(lens => lens.mount))].sort();
  });

  getLensesByManufacturer(manufacturers: string[]) {
    return computed(() => {
      return this._lensData().filter(lens => 
        manufacturers.some(manufacturer => 
          lens.manufacturer.toLowerCase() === manufacturer.toLowerCase()
        )
      );
    });
  }

  getLensesByMount(mounts: string[]) {
    return computed(() => {
      return this._lensData().filter(lens => 
        mounts.some(mount => 
          lens.mount.toLowerCase() === mount.toLowerCase()
        )
      );
    });
  }

  getLensByIds(ids: number[]) {
    return computed(() => {
      return this._lensData().filter(lens => ids.includes(lens.id));
    });
  }

  // Comprehensive filter method for chaining multiple criteria
  filterLenses(criteria: {
    manufacturers?: string[];
    mounts?: string[];
    formats?: string[];
    ids?: number[];
    teleconverterCompatible?: boolean;
  }) {
    return computed(() => {
      return this._lensData().filter(lens => {
        // Filter by manufacturers
        if (criteria.manufacturers && criteria.manufacturers.length > 0) {
          const matchesManufacturer = criteria.manufacturers.some(manufacturer => 
            lens.manufacturer.toLowerCase() === manufacturer.toLowerCase()
          );
          if (!matchesManufacturer) return false;
        }

        // Filter by mounts
        if (criteria.mounts && criteria.mounts.length > 0) {
          const matchesMount = criteria.mounts.some(mount => 
            lens.mount.toLowerCase() === mount.toLowerCase()
          );
          if (!matchesMount) return false;
        }

        // Filter by formats (Full vs Crop)
        if (criteria.formats && criteria.formats.length > 0) {
          const lensFormat = (lens as any).cropFactor ? 'Crop' : 'Full';
          const matchesFormat = criteria.formats.includes(lensFormat);
          if (!matchesFormat) return false;
        }

        // Filter by IDs
        if (criteria.ids && criteria.ids.length > 0) {
          if (!criteria.ids.includes(lens.id)) return false;
        }

        // Filter by teleconverter compatibility
        if (criteria.teleconverterCompatible !== undefined) {
          const hasTC = lens.teleconverters && lens.teleconverters.length > 0;
          if (hasTC !== criteria.teleconverterCompatible) return false;
        }

        return true;
      });
    });
  }

  /**
   * Extract and normalize lens data from a single data source
   * Adds manufacturer and mount information to each lens
   */
  private extractLensData(dataSource: LensDataSource): Lens[] {
    return dataSource.lenses.map(lens => ({
      manufacturer: dataSource.manufacturer,
      mount: dataSource.mount,
      ...lens
    }));
  }
}
