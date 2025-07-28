import { Component, input, inject, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Lens } from '../../../contracts/lens.interface';
import { LensService } from '../../../services/lens.service';

@Component({
  selector: 'app-lens-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lens-details.component.html',
  styleUrl: './lens-details.component.css'
})
export class LensDetailsComponent {
  private readonly lensService = inject(LensService);
  private readonly elementRef = inject(ElementRef);
  
  // Input properties
  selectedLenses = input<Lens[]>([]);

  constructor() {
    // Update CSS custom property when selected lenses change
    effect(() => {
      const lensCount = this.selectedLenses().length;
      this.elementRef.nativeElement.style.setProperty('--lens-count', lensCount.toString());
    });
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
}
