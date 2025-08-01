import { Routes } from '@angular/router';

export const recordatoriosRoutes: Routes = [
    {
        path: 'recordatorios',
        loadComponent: () =>
            import('./recordatorios.component').then(m => m.RecordatoriosComponent),
    }
];
