import { Injectable, signal, computed } from '@angular/core';
import { LensData, Lens } from '../contracts/lens.interface';
import lensDataJson from '../assets/lens-data.json';
import { LensService } from './lens-calculations-service';


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
    // Process lens data to calculate magnifications and apertures where set to -1
    const processedData = lensDataJson.map(lens => {
      // Find the maximum magnification value for this lens (reference point)
      const maxMagnificationEntry = lens.data
        .filter(entry => entry.magnification > 0)
        .reduce((max, current) => 
          current.magnification > max.magnification ? current : max, 
          { magnification: 0, focalLength: 0, aperture: 0, minFocus: 0 }
        );

      // For aperture calculation on zoom lenses, find min and max focal lengths with valid apertures
      const validApertureEntries = lens.data.filter(entry => entry.aperture > 0);
      const minFocalLengthEntry = validApertureEntries.reduce((min, current) => 
        current.focalLength < min.focalLength ? current : min,
        validApertureEntries[0] || { focalLength: Infinity, aperture: 0 }
      );
      const maxFocalLengthEntry = validApertureEntries.reduce((max, current) => 
        current.focalLength > max.focalLength ? current : max,
        validApertureEntries[0] || { focalLength: 0, aperture: 0 }
      );

      // Process each data entry
      const processedLensData = lens.data.map(entry => {
        let updatedEntry = { ...entry };

        // Calculate magnification if set to -1
        if (entry.magnification === -1 && maxMagnificationEntry.magnification > 0) {
          const calculatedMagnification = this.lensService.calculateMagnification(
            entry.focalLength,
            entry.minFocus,
            maxMagnificationEntry.focalLength,
            maxMagnificationEntry.minFocus,
            maxMagnificationEntry.magnification
          );
          
          updatedEntry.magnification = calculatedMagnification;
        }

        // Calculate aperture if set to -1 (for zoom lenses)
        if (entry.aperture === -1 && validApertureEntries.length >= 2 && 
            minFocalLengthEntry.focalLength !== maxFocalLengthEntry.focalLength) {
          const calculatedAperture = this.lensService.calculateApertureAtFocalLength(
            entry.focalLength,
            minFocalLengthEntry.focalLength,
            maxFocalLengthEntry.focalLength,
            minFocalLengthEntry.aperture,
            maxFocalLengthEntry.aperture
          );
          
          updatedEntry.aperture = calculatedAperture;
        }
        
        return updatedEntry;
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
          if (lens.teleconverter !== criteria.teleconverterCompatible) return false;
        }

        return true;
      });
    });
  }
}
