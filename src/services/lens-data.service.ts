import { Injectable, signal, computed } from '@angular/core';
import { LensData, Lens } from '../contracts/lens.interface';
import { LensService } from './lens.calculations';

// Import lens data from multiple files
import nikonZLenses from '../assets/lens-data/nikon-z-mount.json';
import sonyELenses from '../assets/lens-data/sony-e-mount.json';
import canonRFLenses from '../assets/lens-data/canon-rf-mount.json';
import tamronZLenses from '../assets/lens-data/tamron-z-mount.json';

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
    // Extract lens data from the new structured files and add manufacturer/mount info
    const allLensData = [
      ...nikonZLenses.lenses.map(lens => ({
        ...lens,
        manufacturer: nikonZLenses.manufacturer,
        mount: nikonZLenses.mount
      })),
      ...sonyELenses.lenses.map(lens => ({
        ...lens,
        manufacturer: sonyELenses.manufacturer,
        mount: sonyELenses.mount
      })),
      ...canonRFLenses.lenses.map(lens => ({
        ...lens,
        manufacturer: canonRFLenses.manufacturer,
        mount: canonRFLenses.mount
      })),
      ...tamronZLenses.lenses.map(lens => ({
        ...lens,
        manufacturer: tamronZLenses.manufacturer,
        mount: tamronZLenses.mount
      }))
    ];

    // Process lens data to calculate magnifications where set to -1
    const processedData = allLensData.map(lens => {
      // Find the maximum magnification value for this lens (reference point)
      const maxMagnificationEntry = lens.data
        .filter(entry => entry.magnification > 0)
        .reduce((max, current) => 
          current.magnification > max.magnification ? current : max, 
          { magnification: 0, focalLength: 0, aperture: 0, minFocus: 0 }
        );

      // If no positive magnification found, return lens as-is
      if (maxMagnificationEntry.magnification === 0) {
        return lens;
      }

      // Process each data entry
      const processedLensData = lens.data.map(entry => {
        // If magnification is -1, calculate it
        if (entry.magnification === -1) {
          const calculatedMagnification = this.lensService.calculateMagnification(
            entry.focalLength,
            entry.minFocus,
            maxMagnificationEntry.focalLength,
            maxMagnificationEntry.minFocus,
            maxMagnificationEntry.magnification
          );
          
          return {
            ...entry,
            magnification: calculatedMagnification
          };
        }
        
        return entry;
      });

      return {
        ...lens,
        data: processedLensData
      };
    });

    this._lensData.set(processedData);
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
}
