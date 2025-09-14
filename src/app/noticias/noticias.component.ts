import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../supabase.service';

interface Noticia {
  id_noticia: number;
  nombre_fuente: string;
  url_fuente: string;
  fecha_publicacion: string;
  fecha_scraping: string;
  periodo_inicio: number;
  periodo_mes: number;
  periodo_semana: number;
  imagen_url: string;
  imagen_path: string;
  pais: string;
  region: string;
  ciudad: string;
  ubicacion_mencionada: string;
  categoria: string;
  entidades_mencionadas: string;
  titulo: string;
  contenido: string;
  language: string;
  tipo_noticia: string;
  fecha_registro: string;
}

@Component({
  selector: 'app-news-portal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './noticias.component.html',
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class NewsPortalComponent implements OnInit {
  Math = Math;

  noticias: Noticia[] = [];
  noticiasFiltradas: Noticia[] = [];
  noticiasPaginadas: Noticia[] = [];

  categorias: string[] = [];
  paises: string[] = [];
  regiones: string[] = [];
  ciudades: string[] = [];
  tiposNoticia: string[] = [];
  idiomas: string[] = [];
  fuentes: string[] = [];

  filtros = {
    busqueda: '',
    categoria: '',
    pais: '',
    region: '',
    ciudad: '',
    tipoNoticia: '',
    idioma: '',
    fuente: '',
    fechaInicio: '',
    fechaFin: ''
  };

  ordenamiento = {
    campo: 'fecha_publicacion',
    direccion: 'desc' as 'asc' | 'desc'
  };

  paginaActual = 1;
  itemsPorPagina = 25;
  totalPaginas = 0;

  constructor(private newsService: SupabaseService) {}

  ngOnInit() {
    this.cargarNoticias();
  }

  async cargarNoticias() {
    try {
      const resultado = await this.newsService.getNoticias(); // ← ahora solo trae todo
      this.noticias = resultado.data;
      this.extraerDatosParaFiltros();
      this.aplicarFiltros(); // ← filtra, ordena y pagina en memoria
    } catch (error) {
      console.error('Error cargando noticias:', error);
    }
  }

  extraerDatosParaFiltros() {
    const obtenerUnicos = (campo: keyof Noticia) =>
      [...new Set(this.noticias.map(n => n[campo]).filter(v => v))].sort();

    this.categorias = obtenerUnicos('categoria') as string[];
    this.paises = obtenerUnicos('pais') as string[];
    this.regiones = obtenerUnicos('region') as string[];
    this.ciudades = obtenerUnicos('ciudad') as string[];
    this.tiposNoticia = obtenerUnicos('tipo_noticia') as string[];
    this.idiomas = obtenerUnicos('language') as string[];
    this.fuentes = obtenerUnicos('nombre_fuente') as string[];
  }

  aplicarFiltros() {
    let resultados = [...this.noticias];

    if (this.filtros.busqueda) {
      const busqueda = this.filtros.busqueda.toLowerCase();
      resultados = resultados.filter(n =>
        n.titulo?.toLowerCase().includes(busqueda) ||
        n.contenido?.toLowerCase().includes(busqueda) ||
        n.entidades_mencionadas?.toLowerCase().includes(busqueda)
      );
    }
    if (this.filtros.categoria) resultados = resultados.filter(n => n.categoria === this.filtros.categoria);
    if (this.filtros.pais) resultados = resultados.filter(n => n.pais === this.filtros.pais);
    if (this.filtros.region) resultados = resultados.filter(n => n.region === this.filtros.region);
    if (this.filtros.ciudad) resultados = resultados.filter(n => n.ciudad === this.filtros.ciudad);
    if (this.filtros.tipoNoticia) resultados = resultados.filter(n => n.tipo_noticia === this.filtros.tipoNoticia);
    if (this.filtros.idioma) resultados = resultados.filter(n => n.language === this.filtros.idioma);
    if (this.filtros.fuente) resultados = resultados.filter(n => n.nombre_fuente === this.filtros.fuente);
    if (this.filtros.fechaInicio) resultados = resultados.filter(n => n.fecha_publicacion >= this.filtros.fechaInicio);
    if (this.filtros.fechaFin) resultados = resultados.filter(n => n.fecha_publicacion <= this.filtros.fechaFin);

    this.noticiasFiltradas = resultados;
    this.aplicarOrdenamiento();
  }

  aplicarOrdenamiento() {
    this.noticiasFiltradas.sort((a, b) => {
      const valorA = a[this.ordenamiento.campo as keyof Noticia];
      const valorB = b[this.ordenamiento.campo as keyof Noticia];
      let comparacion = 0;
      if (valorA < valorB) comparacion = -1;
      if (valorA > valorB) comparacion = 1;
      return this.ordenamiento.direccion === 'asc' ? comparacion : -comparacion;
    });
    this.calcularPaginacion();
  }

  cambiarDireccionOrdenamiento() {
    this.ordenamiento.direccion = this.ordenamiento.direccion === 'asc' ? 'desc' : 'asc';
    this.aplicarOrdenamiento();
  }

  limpiarFiltros() {
    this.filtros = {
      busqueda: '',
      categoria: '',
      pais: '',
      region: '',
      ciudad: '',
      tipoNoticia: '',
      idioma: '',
      fuente: '',
      fechaInicio: '',
      fechaFin: ''
    };
    this.aplicarFiltros();
  }

  calcularPaginacion() {
    this.totalPaginas = Math.ceil(this.noticiasFiltradas.length / this.itemsPorPagina);
    this.paginaActual = Math.min(this.paginaActual, this.totalPaginas || 1);
    this.actualizarNoticiasPaginadas();
  }

  actualizarNoticiasPaginadas() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    this.noticiasPaginadas = this.noticiasFiltradas.slice(inicio, fin);
  }

  irAPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarNoticiasPaginadas(); // ← ya no recarga backend
    }
  }

  cambiarItemsPorPagina() {
    this.paginaActual = 1;
    this.calcularPaginacion(); // ← recalcula en memoria
  }

  obtenerPaginasVisibles(): number[] {
    const paginas: number[] = [];
    const maxPaginas = 5;
    let inicio = Math.max(1, this.paginaActual - Math.floor(maxPaginas / 2));
    let fin = Math.min(this.totalPaginas, inicio + maxPaginas - 1);
    if (fin - inicio < maxPaginas - 1) {
      inicio = Math.max(1, fin - maxPaginas + 1);
    }
    for (let i = inicio; i <= fin; i++) paginas.push(i);
    return paginas;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  onImageError(event: any) {
    event.target.style.display = 'none';
  }
}
