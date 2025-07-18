import { Routes } from '@angular/router';

export const contenidoRoutes: Routes = [
    {
        path: 'contenido/:id', // Ruta para ver todas las disponibilidades
        loadComponent: () =>
            import('./contenido.component').then(m => m.ContenidoComponent),
    },
];
