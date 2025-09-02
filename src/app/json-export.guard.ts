import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { LensDataService } from '../services/lens-data.service';

export function jsonExportGuard() {
  const lensDataService = inject(LensDataService);
  const router = inject(Router);

  // Get all lens data (already includes manufacturer and mount for each lens)
  const lensData = lensDataService.lensData();
  
  // Create export object with metadata
  const exportData = {
    exportDate: new Date().toISOString(),
    totalLenses: lensData.length,
    lenses: lensData
  };
  
  // Generate JSON content with pretty formatting
  const jsonContent = JSON.stringify(exportData, null, 2);
  
  // Trigger download
  downloadJson(jsonContent, 'lens-data.json');
  
  // Redirect back to main app
  router.navigate(['/']);
  
  return false; // Prevent route activation
}

function downloadJson(jsonContent: string, filename: string) {
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
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
