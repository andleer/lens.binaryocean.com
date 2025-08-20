import { Component, input, inject, ElementRef, effect, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Lens } from '../../../contracts/lens.interface';
import { LensService } from '../../../services/lens-calculations-service';

type SortColumn = 'focalLength' | 'aperture' | 'minFocus' | 'magnification';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-lens-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lens-details.component.html',
  styleUrl: './lens-details.component.css'
})
export class LensDetailsComponent {
  private readonly lensService = inject(LensService);
  private readonly elementRef = inject(ElementRef);
  
  // Input properties
  selectedLenses = input<Lens[]>([]);
  
  // Filter state
  showMaxMagOnly = signal<boolean>(false);
  
  // Teleconverter state
  selectedTeleconverters = signal<number[]>([]);
  
  // Computed property for available teleconverters from selected lenses
  availableTeleconverters = computed(() => {
    const teleconverters = new Set<number>();
    this.selectedLenses().forEach(lens => {
      lens.teleconverters.forEach(tc => teleconverters.add(tc));
    });
    return Array.from(teleconverters).sort((a, b) => a - b);
  });
  
  // Sort state
  sortColumn = signal<SortColumn>('focalLength');
  sortDirection = signal<SortDirection>('asc');

  // Computed property for sorted lens data
  sortedLensData = computed(() => {
    const allData: Array<{lens: Lens, data: any, teleconverter?: number}> = [];
    
    // Collect all data points from all selected lenses
    this.selectedLenses().forEach(lens => {
      const filteredData = this.getFilteredDataForLens(lens);
      filteredData.forEach(data => {
        // Add original lens data (no teleconverter)
        allData.push({ lens, data });
        
        // Add teleconverter data if teleconverters are selected
        this.selectedTeleconverters().forEach(tc => {
          // Only add TC data if this lens supports this teleconverter
          if (lens.teleconverters.includes(tc)) {
            const tcData = this.calculateTeleconverterData(data, tc);
            allData.push({ lens, data: tcData, teleconverter: tc });
          }
        });
      });
    });
    
    // Sort the data based on current sort column and direction
    return allData.sort((a, b) => {
      const column = this.sortColumn();
      const direction = this.sortDirection();
      
      let aValue = a.data[column];
      let bValue = b.data[column];
      
      // Handle numeric comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const result = aValue - bValue;
        return direction === 'asc' ? result : -result;
      }
      
      // Handle string comparison (shouldn't happen with current columns but good fallback)
      const result = String(aValue).localeCompare(String(bValue));
      return direction === 'asc' ? result : -result;
    });
  });

  constructor() {
    // Update CSS custom property when selected lenses change
    effect(() => {
      const lensCount = this.selectedLenses().length;
      this.elementRef.nativeElement.style.setProperty('--lens-count', lensCount.toString());
    });
  }

  // Sort methods
  sortBy(column: SortColumn) {
    if (this.sortColumn() === column) {
      // Toggle direction if same column
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  getSortIcon(column: SortColumn): string {
    if (this.sortColumn() !== column) {
      return '↕️'; // Neutral sort icon
    }
    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }

  // Delegate to lens service for magnification calculations
  getMaxMagnification(lens: Lens): number {
    return this.lensService.getMaxMagnification(lens);
  }

  getMaxMagnificationWithFocalLength(lens: Lens): { magnification: number, focalLength: number } {
    return this.lensService.getMaxMagnificationWithFocalLength(lens);
  }

  // Helper method to get all unique focal lengths across selected lenses
  getAllFocalLengths(): number[] {
    const focalLengths = new Set<number>();
    this.selectedLenses().forEach(lens => {
      lens.data.forEach(data => focalLengths.add(data.focalLength));
    });
    return Array.from(focalLengths).sort((a, b) => a - b);
  }

  // Helper method to get data for a specific lens at a specific focal length
  getLensDataAtFocalLength(lens: Lens, focalLength: number) {
    return lens.data.find(data => data.focalLength === focalLength);
  }

  // Get filtered data for a lens based on the max magnification filter
  getFilteredDataForLens(lens: Lens) {
    if (this.showMaxMagOnly()) {
      const maxMagData = this.lensService.getMaxMagnificationWithFocalLength(lens);
      return lens.data.filter(data => data.focalLength === maxMagData.focalLength);
    }
    return lens.data;
  }

  // Helper method to find the lens with the best magnification at a specific focal length
  getBestMagnificationAtFocalLength(focalLength: number): { lens: Lens; magnification: number } | null {
    let bestLens: Lens | null = null;
    let bestMagnification = 0;

    this.selectedLenses().forEach(lens => {
      const lensData = this.getLensDataAtFocalLength(lens, focalLength);
      if (lensData && lensData.magnification > bestMagnification) {
        bestMagnification = lensData.magnification;
        bestLens = lens;
      }
    });

    return bestLens ? { lens: bestLens, magnification: bestMagnification } : null;
  }

  // Helper method to check if a lens has the best magnification at a focal length
  isBestMagnificationAtFocalLength(lens: Lens, focalLength: number): boolean {
    const best = this.getBestMagnificationAtFocalLength(focalLength);
    return best ? best.lens.model === lens.model : false;
  }

  // Teleconverter methods
  toggleTeleconverter(tc: number) {
    const current = this.selectedTeleconverters();
    if (current.includes(tc)) {
      this.selectedTeleconverters.set(current.filter(t => t !== tc));
    } else {
      this.selectedTeleconverters.set([...current, tc]);
    }
  }

  isTeleconverterSelected(tc: number): boolean {
    return this.selectedTeleconverters().includes(tc);
  }

  /**
   * Round calculated f-stop to standard camera f-stop increments
   * Cameras display standard f-stops in 1/3 stop increments, not exact mathematical results
   */
  roundToStandardFStop(fstop: number): number {
    // Standard f-numbers in 1/3 stop increments (most common camera display values)
    const standardFStops = [
      1.0, 1.1, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.5, 2.8, 3.2, 3.5, 
      4.0, 4.5, 5.0, 5.6, 6.3, 7.1, 8.0, 9.0, 10, 11, 13, 14, 
      16, 18, 20, 22, 25, 29, 32, 36, 40, 45, 51, 57, 64
    ];
    
    // Find the closest standard f-stop
    let closest = standardFStops[0];
    let minDiff = Math.abs(fstop - closest);
    
    for (const standard of standardFStops) {
      const diff = Math.abs(fstop - standard);
      if (diff < minDiff) {
        minDiff = diff;
        closest = standard;
      }
    }
    
    return closest;
  }

  calculateTeleconverterData(originalData: any, teleconverter: number) {
    const calculatedAperture = originalData.aperture * teleconverter;
    const roundedAperture = this.roundToStandardFStop(calculatedAperture);
    
    return {
      focalLength: originalData.focalLength * teleconverter,
      aperture: roundedAperture,
      minFocus: originalData.minFocus, // Min focus distance doesn't change
      magnification: originalData.magnification * teleconverter
    };
  }
}
