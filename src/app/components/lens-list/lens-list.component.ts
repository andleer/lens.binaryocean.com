import { Component, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Lens } from '../../../contracts/lens.interface';

@Component({
  selector: 'app-lens-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lens-list.component.html',
  styleUrl: './lens-list.component.css'
})
export class LensListComponent {
  // Input properties
  lenses = input.required<Lens[]>();
  selectedLens = input<Lens | null>(null);
  
  // Output events
  lensSelected = output<Lens>();

  onLensClick(lens: Lens) {
    this.lensSelected.emit(lens);
  }
}
