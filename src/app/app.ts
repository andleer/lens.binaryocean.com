import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LensDataService } from '../services/lens-data.service';
import { LensService } from '../services/lens-calculations-service';
import { LensFiltersComponent, FilterCriteria } from './components/lens-filters/lens-filters.component';
import { LensListComponent } from './components/lens-list/lens-list.component';
import { LensDetailsComponent } from './components/lens-details/lens-details.component';
import { Lens } from '../contracts/lens.interface';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, LensFiltersComponent, LensListComponent, LensDetailsComponent],
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
  selectedLenses = signal<Lens[]>([]);

  constructor() {
    // Initialize with empty filtered lenses - user must select filters first
    this.filteredLenses.set([]);
  }
  
  onFiltersChanged(criteria: FilterCriteria) {
    let filteredLenses: Lens[];
    
    // If no filters are applied, show empty list
    if (criteria.manufacturers.length === 0 && criteria.mounts.length === 0 && criteria.formats.length === 0) {
      filteredLenses = [];
    } else {
      // Use the service's filterLenses method
      const serviceCriteria: any = {};
      if (criteria.manufacturers.length > 0) {
        serviceCriteria.manufacturers = criteria.manufacturers;
      }
      if (criteria.mounts.length > 0) {
        serviceCriteria.mounts = criteria.mounts;
      }
      if (criteria.formats.length > 0) {
        serviceCriteria.formats = criteria.formats;
      }
      const filteredSignal = this.lensDataService.filterLenses(serviceCriteria);
      filteredLenses = [...filteredSignal()];
    }
    
    // Sort by maximum focal length (ascending order) only if there are lenses
    if (filteredLenses.length > 0) {
      filteredLenses.sort((a, b) => {
        const maxFocalA = this.lensService.getMaxFocalLength(a);
        const maxFocalB = this.lensService.getMaxFocalLength(b);
        return maxFocalA - maxFocalB;
      });
    }
    
    this.filteredLenses.set(filteredLenses);
    
    // Only keep selected lenses that are still in the filtered results
    const currentSelected = this.selectedLenses();
    const filteredIds = new Set(filteredLenses.map(lens => lens.id));
    const updatedSelected = currentSelected.filter(lens => filteredIds.has(lens.id));
    this.selectedLenses.set(updatedSelected);
  }
  
  onLensesSelected(lenses: Lens[]) {
    this.selectedLenses.set(lenses);
  }
}
