import { Routes } from '@angular/router';
import { csvExportGuard } from './csv-export.guard';
import { jsonExportGuard } from './json-export.guard';

export const routes: Routes = [
  {
    path: 'export/csv',
    canActivate: [csvExportGuard],
    children: []
  },
  {
    path: 'export/json',
    canActivate: [jsonExportGuard],
    children: []
  }
];
