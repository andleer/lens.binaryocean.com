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
  selectedLenses = input<Lens[]>([]);
  
  // Output events
  lensesSelected = output<Lens[]>();

  onLensClick(lens: Lens) {
    const currentSelection = [...this.selectedLenses()];
    const isSelected = currentSelection.some(selected => selected.model === lens.model);
    
    if (isSelected) {
      // Remove lens from selection
      const updatedSelection = currentSelection.filter(selected => selected.model !== lens.model);
      this.lensesSelected.emit(updatedSelection);
    } else {
      // Add lens to selection
      const updatedSelection = [...currentSelection, lens];
      this.lensesSelected.emit(updatedSelection);
    }
  }

  isLensSelected(lens: Lens): boolean {
    return this.selectedLenses().some(selected => selected.model === lens.model);
  }
}
