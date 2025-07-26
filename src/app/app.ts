import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LensDataService } from '../services/lens-data.service';
import { LensService } from '../services/lens.service';
import { Lens } from '../contracts/lens.interface';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
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
  
  // Filter properties
  filterManufacturer = signal('');
  filterMount = signal('');
  filterTeleconverter = signal('');
  
  // Get unique manufacturers and mounts from service
  get manufacturers(): string[] {
    return this.lensDataService.manufacturers();
  }
  
  get mounts(): string[] {
    return this.lensDataService.mountTypes();
  }

  constructor() {
    // Initialize filtered lenses with all lenses
    this.filteredLenses.set(this.lenses());
  }
  
  applyFilters() {
    // Use the service's filterLenses method for better performance
    const criteria: any = {};
    
    if (this.filterManufacturer()) {
      criteria.manufacturers = [this.filterManufacturer()];
    }
    
    if (this.filterMount()) {
      criteria.mounts = [this.filterMount()];
    }
    
    if (this.filterTeleconverter()) {
      criteria.teleconverterCompatible = this.filterTeleconverter() === 'true';
    }
    
    // If no filters are applied, show all lenses
    if (Object.keys(criteria).length === 0) {
      this.filteredLenses.set(this.lenses());
    } else {
      // Use the service's filterLenses method
      const filteredSignal = this.lensDataService.filterLenses(criteria);
      this.filteredLenses.set(filteredSignal());
    }
    
    this.selectedLens.set(null);
  }
  
  selectLens(lens: Lens) {
    this.selectedLens.set(lens);
  }
  
  clearFilters() {
    this.filterManufacturer.set('');
    this.filterMount.set('');
    this.filterTeleconverter.set('');
    this.filteredLenses.set(this.lenses());
    this.selectedLens.set(null);
  }

  // Delegate to lens service for magnification calculations
  getMaxMagnification(lens: Lens): number {
    return this.lensService.getMaxMagnification(lens);
  }

  getMaxMagnificationWithFocalLength(lens: Lens): { magnification: number, focalLength: number } {
    return this.lensService.getMaxMagnificationWithFocalLength(lens);
  }
}
