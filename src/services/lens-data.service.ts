import { Injectable, signal, computed } from '@angular/core';
import { LensData, Lens } from '../contracts/lens.interface';
import lensDataJson from '../assets/lens-data.json';


@Injectable({
  providedIn: 'root'
})
export class LensDataService {
  // Signal to hold the lens data - initialized directly with imported data
  private readonly _lensData = signal<LensData>(lensDataJson);

  // Public readonly signal
  readonly lensData = this._lensData.asReadonly();

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
