import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LensDataService } from '../services/lens-data.service';
import { LensService } from '../services/lens.service';
import { LensFiltersComponent, FilterCriteria } from './components/lens-filters/lens-filters.component';
import { Lens } from '../contracts/lens.interface';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, LensFiltersComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Lens Data Viewer');
  private readonly lensDataService = inject(LensDataService);
  private readonly lensService = inject(LensService);
  protected readonly Math = Math;
  
  // Use service signals directly
  readonly lenses = this.lensDataService.lensData;
  filteredLenses = signal<Lens[]>([]);
  selectedLens = signal<Lens | null>(null);

  constructor() {
    // Initialize filtered lenses with all lenses, sorted by max focal length
    const sortedLenses = [...this.lenses()].sort((a, b) => {
      const maxFocalA = this.lensService.getMaxFocalLength(a);
      const maxFocalB = this.lensService.getMaxFocalLength(b);
      return maxFocalA - maxFocalB;
    });
    this.filteredLenses.set(sortedLenses);
  }
  
  onFiltersChanged(criteria: FilterCriteria) {
    let filteredLenses: Lens[];
    
    // If no filters are applied, show all lenses
    if (criteria.manufacturers.length === 0 && criteria.mounts.length === 0) {
      filteredLenses = [...this.lenses()];
    } else {
      // Use the service's filterLenses method
      const serviceCriteria: any = {};
      if (criteria.manufacturers.length > 0) {
        serviceCriteria.manufacturers = criteria.manufacturers;
      }
      if (criteria.mounts.length > 0) {
        serviceCriteria.mounts = criteria.mounts;
      }
      const filteredSignal = this.lensDataService.filterLenses(serviceCriteria);
      filteredLenses = [...filteredSignal()];
    }
    
    // Sort by maximum focal length (ascending order)
    filteredLenses.sort((a, b) => {
      const maxFocalA = this.lensService.getMaxFocalLength(a);
      const maxFocalB = this.lensService.getMaxFocalLength(b);
      return maxFocalA - maxFocalB;
    });
    
    this.filteredLenses.set(filteredLenses);
    this.selectedLens.set(null);
  }

  onFiltersCleared() {
    // Sort lenses by max focal length when clearing filters
    const sortedLenses = [...this.lenses()].sort((a, b) => {
      const maxFocalA = this.lensService.getMaxFocalLength(a);
      const maxFocalB = this.lensService.getMaxFocalLength(b);
      return maxFocalA - maxFocalB;
    });
    
    this.filteredLenses.set(sortedLenses);
    this.selectedLens.set(null);
  }
  
  selectLens(lens: Lens) {
    this.selectedLens.set(lens);
  }

  // Delegate to lens service for magnification calculations
  getMaxMagnification(lens: Lens): number {
    return this.lensService.getMaxMagnification(lens);
  }

  getMaxMagnificationWithFocalLength(lens: Lens): { magnification: number, focalLength: number } {
    return this.lensService.getMaxMagnificationWithFocalLength(lens);
  }
}
