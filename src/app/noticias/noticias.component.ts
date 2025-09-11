// Extensión simple para tu supabase.service.ts existente
export interface Noticia {
  id: number;
  fuente: string;
  link: string;
  titulo: string;
  fecha: string;
  contenido: string;
  imagen_url?: string;
  imagen_path?: string;
}

// Agregar estos métodos a tu SupabaseService existente:
/*

*/

// news-display.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../supabase.service';

export interface Noticia {
  id: number;
  fuente: string;
  link: string;
  titulo: string;
  fecha: string;
  contenido: string;
  imagen_url?: string;
  imagen_path?: string;
}

@Component({
  selector: 'app-news-display',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <!-- Header -->
      <div class="bg-white/70 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div class="max-w-7xl mx-auto px-6 py-12">
          <div class="text-center">
            <h1 class="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Portal de Noticias
            </h1>
            <p class="text-gray-600 text-xl">Las últimas noticias al instante</p>
            <div class="flex justify-center items-center mt-6">
              <div class="flex items-center bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                <div class="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span class="text-gray-700 font-medium">{{ noticias.length }} noticias disponibles</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="max-w-7xl mx-auto px-6 py-8">
        <!-- Filters -->
        <div class="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div class="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <!-- Source Filter -->
              <div class="relative">
                <select 
                  [(ngModel)]="selectedFuente" 
                  (change)="filterNoticias()"
                  class="appearance-none bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                  <option value="">Todas las fuentes</option>
                  <option *ngFor="let fuente of fuentes" [value]="fuente">{{ fuente }}</option>
                </select>
                <i class="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
              </div>
              
              <!-- Search -->
              <div class="relative">
                <input 
                  type="text" 
                  [(ngModel)]="searchTerm"
                  (input)="filterNoticias()"
                  placeholder="Buscar noticias..."
                  class="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 w-full md:w-64">
                <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>
            
            <!-- Refresh Button -->
            <button 
              (click)="loadNoticias()"
              [disabled]="loading"
              class="flex items-center px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl">
              <i class="fas" [class.fa-refresh]="!loading" [class.fa-spinner]="loading" [class.fa-spin]="loading" class="mr-2"></i>
              {{ loading ? 'Cargando...' : 'Actualizar' }}
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading && noticias.length === 0" class="flex flex-col items-center justify-center py-20">
          <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <p class="text-gray-600 text-lg">Cargando noticias...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="bg-red-50 border-l-4 border-red-400 p-6 mb-6 rounded-r-xl">
          <div class="flex items-center">
            <i class="fas fa-exclamation-triangle text-red-500 mr-3 text-xl"></i>
            <div>
              <h3 class="text-red-800 font-semibold text-lg">Error al cargar noticias</h3>
              <p class="text-red-600">{{ error }}</p>
              <button 
                (click)="loadNoticias()" 
                class="mt-2 text-red-700 hover:text-red-900 font-medium underline">
                Intentar de nuevo
              </button>
            </div>
          </div>
        </div>

        <!-- News Grid -->
        <div *ngIf="!loading || noticias.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <article *ngFor="let noticia of filteredNoticias; trackBy: trackByNoticia" 
                   class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden group">
            
            <!-- Image -->
            <div class="relative h-56 bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 overflow-hidden">
              <img *ngIf="noticia.imagen_url && !imageErrors[noticia.id]" 
                   [src]="noticia.imagen_url" 
                   [alt]="noticia.titulo"
                   class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                   (error)="onImageError(noticia.id)"
                   (load)="onImageLoad(noticia.id)">
              
              <div *ngIf="!noticia.imagen_url || imageErrors[noticia.id]" 
                   class="w-full h-full flex items-center justify-center">
                <i class="fas fa-newspaper text-white/70 text-5xl"></i>
              </div>
              
              <!-- Source Badge -->
              <div class="absolute top-4 left-4">
                <span class="px-3 py-1 bg-white/90 backdrop-blur-md text-blue-700 text-sm font-bold rounded-full shadow-lg border border-white/50">
                  {{ noticia.fuente }}
                </span>
              </div>

              <!-- Date Badge -->
              <div class="absolute top-4 right-4">
                <span class="px-3 py-1 bg-black/50 backdrop-blur-md text-white text-xs font-medium rounded-full">
                  {{ formatDate(noticia.fecha) }}
                </span>
              </div>
            </div>

            <!-- Content -->
            <div class="p-6">
              <h3 class="font-bold text-xl text-gray-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 leading-tight">
                {{ noticia.titulo }}
              </h3>
              
              <p class="text-gray-600 text-sm line-clamp-4 leading-relaxed mb-4">
                {{ noticia.contenido }}
              </p>

              <!-- Action Button -->
              <div class="pt-4 border-t border-gray-100">
                <a *ngIf="noticia.link; else noLink" 
                   [href]="noticia.link" 
                   target="_blank"
                   class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg group">
                  <span>Leer más</span>
                  <i class="fas fa-external-link-alt ml-2 group-hover:translate-x-1 transition-transform duration-200"></i>
                </a>
                
                <ng-template #noLink>
                  <div class="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-500 text-sm font-medium rounded-xl">
                    <i class="fas fa-link-slash mr-2"></i>
                    Sin enlace disponible
                  </div>
                </ng-template>
              </div>
            </div>
          </article>
        </div>

        <!-- Empty State -->
        <div *ngIf="filteredNoticias.length === 0 && !loading && !error" 
             class="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-200">
          <i class="fas fa-search text-gray-400 text-6xl mb-6"></i>
          <h3 class="text-2xl font-semibold text-gray-600 mb-2">No se encontraron noticias</h3>
          <p class="text-gray-500 text-lg mb-6">
            {{ searchTerm || selectedFuente ? 'Prueba con otros filtros de búsqueda' : 'No hay noticias disponibles en este momento' }}
          </p>
          <button 
            *ngIf="searchTerm || selectedFuente"
            (click)="clearFilters()"
            class="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-200 shadow-lg">
            <i class="fas fa-times mr-2"></i>
            Limpiar filtros
          </button>
        </div>

        <!-- Results Count -->
        <div *ngIf="filteredNoticias.length > 0 && (searchTerm || selectedFuente)" 
             class="text-center mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p class="text-blue-700 font-medium">
            Mostrando {{ filteredNoticias.length }} de {{ noticias.length }} noticias
            <span *ngIf="selectedFuente"> de <strong>{{ selectedFuente }}</strong></span>
            <span *ngIf="searchTerm"> que contienen "<strong>{{ searchTerm }}</strong>"</span>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .line-clamp-4 {
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    article {
      animation: fadeInUp 0.5s ease-out forwards;
    }

    article:nth-child(1) { animation-delay: 0.1s; }
    article:nth-child(2) { animation-delay: 0.2s; }
    article:nth-child(3) { animation-delay: 0.3s; }
  `]
})
export class NewsDisplayComponent implements OnInit {
  private supabaseService = inject(SupabaseService);

  noticias: Noticia[] = [];
  filteredNoticias: Noticia[] = [];
  fuentes: string[] = [];
  
  selectedFuente = '';
  searchTerm = '';
  
  loading = false;
  error = '';
  
  imageErrors: { [key: number]: boolean } = {};

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    await Promise.all([
      this.loadNoticias(),
      this.loadFuentes()
    ]);
  }

  async loadNoticias() {
    this.loading = true;
    this.error = '';
    
    try {
      this.noticias = await this.supabaseService.getNoticias();
      this.filterNoticias();
    } catch (error: any) {
      this.error = error.message || 'Error al cargar las noticias';
      console.error('Error loading noticias:', error);
    } finally {
      this.loading = false;
    }
  }

  async loadFuentes() {
    try {
      this.fuentes = await this.supabaseService.getFuentes();
    } catch (error: any) {
      console.error('Error loading fuentes:', error);
    }
  }

  filterNoticias() {
    let filtered = [...this.noticias];

    if (this.selectedFuente) {
      filtered = filtered.filter(n => n.fuente === this.selectedFuente);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(n => 
        n.titulo.toLowerCase().includes(term) || 
        n.contenido.toLowerCase().includes(term) ||
        n.fuente.toLowerCase().includes(term)
      );
    }

    this.filteredNoticias = filtered;
  }

  clearFilters() {
    this.selectedFuente = '';
    this.searchTerm = '';
    this.filterNoticias();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
  }

  onImageError(noticiaId: number) {
    this.imageErrors[noticiaId] = true;
  }

  onImageLoad(noticiaId: number) {
    this.imageErrors[noticiaId] = false;
  }

  trackByNoticia(index: number, noticia: Noticia): number {
    return noticia.id;
  }
}