import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { LensDataService } from '../services/lens-data.service';
import { Lens } from '../contracts/lens.interface';

export function csvExportGuard() {
  const lensDataService = inject(LensDataService);
  const router = inject(Router);

  // Get all lens data
  const lensData = lensDataService.lensData();
  
  // Generate CSV content
  const csvContent = generateCsvContent(lensData);
  
  // Trigger download
  downloadCsv(csvContent, 'lens-data.csv');
  
  // Redirect back to main app
  router.navigate(['/']);
  
  return false; // Prevent route activation
}

function generateCsvContent(lensData: Lens[]): string {
  const headers = [
    'Manufacturer',
    'Mount', 
    'Model',
    'Focal Length (mm)',
    'Max Aperture',
    'Min Focus Distance (m)',
    'Max Magnification',
    'Teleconverters'
  ];

  const rows: string[] = [headers.join(',')];

  lensData.forEach(lens => {
    lens.data.forEach(data => {
      const teleconverters = lens.teleconverters.length > 0 
        ? lens.teleconverters.map(tc => `${tc}x`).join(';')
        : 'None';

      const row = [
        escapeCsvValue(lens.manufacturer),
        escapeCsvValue(lens.mount),
        escapeCsvValue(lens.model),
        data.focalLength.toString(),
        data.aperture.toString(),
        data.minFocus.toString(),
        data.magnification.toString(),
        escapeCsvValue(teleconverters)
      ];

      rows.push(row.join(','));
    });
  });

  return rows.join('\n');
}

function escapeCsvValue(value: string): string {
  // Escape quotes and wrap in quotes if needed
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadCsv(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
