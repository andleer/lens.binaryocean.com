import { Component, input, inject } from '@angular/core';
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
  
  // Input properties
  selectedLens = input<Lens | null>(null);

  // Delegate to lens service for magnification calculations
  getMaxMagnification(lens: Lens): number {
    return this.lensService.getMaxMagnification(lens);
  }

  getMaxMagnificationWithFocalLength(lens: Lens): { magnification: number, focalLength: number } {
    return this.lensService.getMaxMagnificationWithFocalLength(lens);
  }
}
