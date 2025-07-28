// Example usage of the LensService for calculating magnifications
// This shows how you can use the service to calculate magnification values

import { LensService } from './lens.service';

// Example: Calculate magnifications for the Nikon 70-200mm lens data points
const lensService = new LensService();

// Test data for Z Mount 70-200mm f/2.8 VR S
const testData = [
  { focalLength: 70, minFocus: 0.55 },
  { focalLength: 85, minFocus: 0.63 },
  { focalLength: 105, minFocus: 0.68 },
  { focalLength: 135, minFocus: 0.80 },
  { focalLength: 200, minFocus: 0.55 }
];

console.log('Z Mount 70-200mm f/2.8 VR S - Calculated Magnifications:');
console.log('=========================================================');

testData.forEach(data => {
  const magnification = lensService.calculateMagnification(data.focalLength, data.minFocus);
  const ratioFormat = lensService.formatMagnificationRatio(magnification);
  
  console.log(`${data.focalLength}mm:`);
  console.log(`  Min Focus: ${data.minFocus}m`);
  console.log(`  Magnification: ${magnification}× (${ratioFormat})`);
  console.log('');
});

// Example: Calculate what minimum focus distance would be needed for 1:1 macro
console.log('Macro Calculations (1:1 magnification):');
console.log('=======================================');
[50, 85, 105].forEach(focal => {
  const minFocusFor1to1 = lensService.calculateMinFocusForMagnification(focal, 1.0);
  console.log(`${focal}mm lens needs ${minFocusFor1to1}m min focus for 1:1 macro`);
});
