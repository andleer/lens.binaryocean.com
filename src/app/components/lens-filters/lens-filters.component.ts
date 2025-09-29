import { Component, signal, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LensDataService } from '../../../services/lens-data.service';

export interface FilterCriteria {
  manufacturers: string[];
  mounts: string[];
  formats: string[];
}

@Component({
  selector: 'app-lens-filters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lens-filters.component.html',
  styleUrl: './lens-filters.component.css'
})
export class LensFiltersComponent {
  private readonly lensDataService = inject(LensDataService);
  
  // Filter properties - arrays for multiple selections
  selectedManufacturers = signal<string[]>([]);
  selectedMounts = signal<string[]>([]);
  selectedFormats = signal<string[]>([]);
  
  // Output events
  filtersChanged = output<FilterCriteria>();
  
  // Format options
  readonly formats = ['Full', 'Crop'];
  
  // Get unique manufacturers and mounts from service
  get manufacturers(): string[] {
    return this.lensDataService.manufacturers();
  }
  
  get mounts(): string[] {
    return this.lensDataService.mountTypes();
  }

  toggleManufacturer(manufacturer: string) {
    const current = this.selectedManufacturers();
    if (current.includes(manufacturer)) {
      this.selectedManufacturers.set(current.filter(m => m !== manufacturer));
    } else {
      this.selectedManufacturers.set([...current, manufacturer]);
    }
    this.emitFilters();
  }

  toggleMount(mount: string) {
    const current = this.selectedMounts();
    if (current.includes(mount)) {
      this.selectedMounts.set(current.filter(m => m !== mount));
    } else {
      this.selectedMounts.set([...current, mount]);
    }
    this.emitFilters();
  }

  toggleFormat(format: string) {
    const current = this.selectedFormats();
    if (current.includes(format)) {
      this.selectedFormats.set(current.filter(f => f !== format));
    } else {
      this.selectedFormats.set([...current, format]);
    }
    this.emitFilters();
  }

  private emitFilters() {
    const criteria: FilterCriteria = {
      manufacturers: this.selectedManufacturers(),
      mounts: this.selectedMounts(),
      formats: this.selectedFormats()
    };
    this.filtersChanged.emit(criteria);
  }
}
