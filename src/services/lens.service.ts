import { Injectable } from '@angular/core';
import { Lens } from '../contracts/lens.interface';

@Injectable({
  providedIn: 'root'
})
export class LensService {

  /**
   * Calculate magnification based on focal length and minimum focus distance
   * Formula: Magnification = focal length (mm) / (minimum focus distance (m) * 1000 - focal length (mm))
   * 
   * This is an approximation based on the thin lens equation for close focus scenarios
   * 
   * @param focalLength - Focal length in millimeters
   * @param minFocus - Minimum focus distance in meters
   * @returns Magnification ratio (e.g., 0.25 = 1:4 magnification)
   */
  calculateMagnification(focalLength: number, minFocus: number): number {
    // Convert minFocus from meters to millimeters for calculation
    const minFocusMm = minFocus * 1000;
    
    // Basic magnification formula for close focus
    // M = f / (d - f) where f is focal length and d is object distance
    const magnification = focalLength / (minFocusMm - focalLength);
    
    // Return absolute value and round to reasonable precision
    return Math.abs(Math.round(magnification * 100) / 100);
  }

  /**
   * Calculate the theoretical minimum focus distance needed for a specific magnification
   * 
   * @param focalLength - Focal length in millimeters
   * @param targetMagnification - Desired magnification ratio
   * @returns Minimum focus distance in meters
   */
  calculateMinFocusForMagnification(focalLength: number, targetMagnification: number): number {
    // Rearrange formula: d = f * (1 + 1/M)
    const minFocusMm = focalLength * (1 + (1 / targetMagnification));
    
    // Convert back to meters and round to reasonable precision
    return Math.round((minFocusMm / 1000) * 100) / 100;
  }

  /**
   * Format magnification for display (e.g., 0.25 -> "1:4")
   * 
   * @param magnification - Magnification ratio
   * @returns Formatted string representation
   */
  formatMagnificationRatio(magnification: number): string {
    if (magnification >= 1) {
      return `${magnification.toFixed(1)}:1`;
    } else {
      const ratio = Math.round(1 / magnification);
      return `1:${ratio}`;
    }
  }

  /**
   * Determine if a lens is considered "macro" based on magnification
   * Traditional macro lenses achieve 1:1 (1.0x) or greater magnification
   * 
   * @param magnification - Magnification ratio
   * @returns True if considered macro capability
   */
  isMacroCapable(magnification: number): boolean {
    return magnification >= 1.0;
  }

  /**
   * Get maximum magnification for a lens
   * 
   * @param lens - Lens object with data array
   * @returns Maximum magnification value
   */
  getMaxMagnification(lens: Lens): number {
    return Math.max(...lens.data.map(d => d.magnification));
  }

  /**
   * Get maximum magnification with its corresponding focal length
   * 
   * @param lens - Lens object with data array
   * @returns Object containing magnification and focal length
   */
  getMaxMagnificationWithFocalLength(lens: Lens): { magnification: number, focalLength: number } {
    const maxMagnification = Math.max(...lens.data.map(d => d.magnification));
    const dataWithMaxMag = lens.data.find(d => d.magnification === maxMagnification);
    return {
      magnification: maxMagnification,
      focalLength: dataWithMaxMag?.focalLength || 0
    };
  }
}
