import { Routes } from '@angular/router';

export const categoriaRoutes: Routes = [
    {
        path: 'categoria',
        loadComponent: () =>
            import('./categoria.component').then(m => m.CategoriaComponent),
    }
];
