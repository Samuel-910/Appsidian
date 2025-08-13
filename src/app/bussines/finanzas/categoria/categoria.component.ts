import { Component, OnInit } from '@angular/core';
import { CategoriaService } from '../../../service/categoria.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IconoService } from '../../../service/icono.service';

@Component({
  selector: 'app-categoria',
  imports: [FormsModule, CommonModule],
  templateUrl: './categoria.component.html',
  styleUrl: './categoria.component.css'
})
export class CategoriaComponent implements OnInit {
  categorias: any[] = [];
  selectedTab: 'gastos' | 'ingresos' = 'gastos';
  error: string | null = null;
  iconos: any[] = [];
  mostrarModalCategoria = false;
  modoEdicion: boolean = false;

  nuevaCategoria = {
    id_categoria: null,
    nombre_categoria: '',
    tipo: '',
    color: '#3b82f6',
    id_icono: 1,
    id_user: '' 
  };
  mostrarOpciones = false;
  constructor(private categoriaService: CategoriaService, private iconoService: IconoService) { }

  async ngOnInit() {
    this.obtenerCategorias();
    this.obternerIconos();
  }

  async obtenerCategorias() {
    const auth = localStorage.getItem('sb-mjompchhwvbqpnjnqlma-auth-token');
    let user_id = null;

    if (auth) {
      const authObj = JSON.parse(auth);
      user_id = authObj.user?.id;
    }

    try {
      const data = await this.categoriaService.getAll();

      // Filtrar categorías que sean del usuario o generales (id_user === 'general')
      this.categorias = data.filter((cat: any) =>
        cat.id_user === user_id || cat.id_user === 'general'
      );

      this.error = this.categorias.length === 0 ? 'No tienes categorías disponibles.' : null;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      this.error = 'Error al cargar las categorías.';
    }
  }


  get categoriasFiltradas() {
    const filtradas = this.categorias.filter(c => c.tipo === this.selectedTab);
    return filtradas;
  }
  obternerIconos() {
    this.iconoService.getAll().then(data => {
      console.log('Iconos obtenidos:', data);
      this.iconos = data;
    });
  }

  getRutaIconoPorId(id_icono: number): string {
    const icono = this.iconos.find(i => i.id_icono === id_icono);
    return icono ? icono.ruta_icono : '';
  }
  getIconoSeleccionadoClass() {
    const icono = this.iconos.find(i => i.id_icono === this.nuevaCategoria.id_icono);
    return icono ? icono.ruta_icono : 'fa-question';
  }

  obtenerNombreIconoSeleccionado() {
    const icono = this.iconos.find(i => i.id_icono === this.nuevaCategoria.id_icono);
    return icono ? icono.nombre : 'Selecciona un icono';
  }
  resetModal() {
    this.nuevaCategoria = { id_categoria: null, nombre_categoria: '', color: '#3b82f6', id_icono: 1, tipo: this.selectedTab, id_user: '' };
    this.mostrarModalCategoria = false;
    this.modoEdicion = false;
  }

  seleccionarIcono(icono: any) {
    this.nuevaCategoria.id_icono = icono.id_icono;
    this.mostrarOpciones = false;
  }
  guardarCategoria() {
    const auth = localStorage.getItem('sb-mjompchhwvbqpnjnqlma-auth-token');
    let user_id = null;

    if (auth) {
      const authObj = JSON.parse(auth);
      user_id = authObj.user?.id;
    }
    this.nuevaCategoria.tipo = this.selectedTab;
    this.nuevaCategoria.id_user = user_id;
    console.log('Guardando categoría:', this.nuevaCategoria);
    if (this.modoEdicion && this.nuevaCategoria.id_categoria != null) {
      this.categoriaService.update(this.nuevaCategoria.id_categoria, this.nuevaCategoria).then(() => {
        this.obtenerCategorias();
        this.resetModal();
      });
    } else {
      const { id_categoria, ...categoriaParaCrear } = this.nuevaCategoria;

      this.categoriaService.create(categoriaParaCrear).then(() => {
        this.obtenerCategorias();
        this.resetModal();
      });
    }
  }


  editarCategoria(categoria: any) {
    this.nuevaCategoria = { ...categoria };
    this.modoEdicion = true;
    this.mostrarModalCategoria = true;
  }

  eliminarCategoria(categoria: any) {
    const confirmado = confirm(`¿Estás seguro de eliminar la categoría "${categoria.nombre_categoria}"?`);
    if (confirmado) {
      this.categoriaService.delete(categoria.id_categoria).then(() => {
        this.obtenerCategorias(); // O el método que refresque la lista
      });
    }
  }

}
