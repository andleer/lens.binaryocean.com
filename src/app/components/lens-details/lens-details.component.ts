import { Component, input, inject, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Lens } from '../../../contracts/lens.interface';
import { LensService } from '../../../services/lens.calculations';

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
}
