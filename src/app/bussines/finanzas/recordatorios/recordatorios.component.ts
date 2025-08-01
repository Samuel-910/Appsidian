import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { supabase } from '../../../supabase.config';
import Swal from 'sweetalert2';
import { CategoriaService } from '../../../service/categoria.service';
import { CuentasService } from '../../../service/cuentas.service';

@Component({
  selector: 'app-recordatorios',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './recordatorios.component.html',
  styleUrl: './recordatorios.component.css'
})
export class RecordatoriosComponent implements OnInit {
  recordatorios: any[] = [];
  categorias: any[] = [];
  cuentas: any[] = [];

  userId: string = '';
  error: string | null = null;

  mostrarModal = false;
  editando: any = null;

  nuevoRecordatorio: any = {
    nombre: '',
    frecuencia: '',
    comentario: '',
    cantidad: '',
    hora: '',
    fecha_inicio: '',
    fecha_fin: '',
    id_user: '',
    id_categoria: null,
    id_cuenta: null
  };

  async ngOnInit() {
    const auth = localStorage.getItem('sb-mjompchhwvbqpnjnqlma-auth-token');
    if (auth) {
      const authObj = JSON.parse(auth);
      this.userId = authObj.user?.id || '';
      this.nuevoRecordatorio.id_user = this.userId;
      console.log('Usuario logueado:', this.nuevoRecordatorio);
    }

    await this.loadCategorias();
    await this.loadCuentas();
    await this.loadRecordatorios();
  }

  constructor(private categoriaService: CategoriaService,
    private cuentasService: CuentasService
  ) { }

  // Cargar datos desde Supabase
  async loadCategorias() {
    try {
      const todos = await this.categoriaService.getAll();
      this.categorias = todos.filter(
        r => (r.id_user === this.userId || r.id_user === 'general') && r.tipo === 'gastos'
      );


      console.log('categorias cargadas:', this.categorias);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  }

  async loadCuentas() {
    try {
      const todos = await this.cuentasService.getAll();
      this.cuentas = todos.filter(r => r.id_user === this.userId);
      console.log('Cuentas cargadas:', this.cuentas);
    } catch (error) {
      console.error('Error al cargar cuentas:', error);
    }
  }

  async loadRecordatorios() {
    try {
      const { data, error } = await supabase
        .from('recordatorios')
        .select('*')
        .eq('id_user', this.userId);
      if (error) throw error;
      this.recordatorios = data;
    } catch (err: any) {
      this.error = err.message;
    }
  }

  // Abrir modal para nuevo o edición
  abrirModal(recordatorio?: any) {
    this.mostrarModal = true;
    if (recordatorio) {
      this.editando = { ...recordatorio };
    } else {
      this.editando = null;
      this.nuevoRecordatorio = {
        nombre: '',
        frecuencia: '',
        comentario: '',
        cantidad: '',
        hora: '',
        fecha_inicio: '',
        fecha_fin: '',
        id_user: this.userId,
        id_categoria: null,
        id_cuenta: null
      };
    }
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.editando = null;
    this.limpiarFormulario();
    this.error = null;
  }

  async guardarRecordatorio() {
    const recordatorio = this.editando ? this.editando : this.nuevoRecordatorio;
    this.nuevoRecordatorio.id_user = this.userId;
    if (!recordatorio.nombre || !recordatorio.frecuencia) {
      this.error = 'Nombre y frecuencia son obligatorios';
      return;
    }

    try {
      if (this.editando) {
        // Actualizar
        const { error } = await supabase
          .from('recordatorios')
          .update(recordatorio)
          .eq('id_recordatorio', recordatorio.id_recordatorio);
        if (error) throw error;

        Swal.fire('Actualizado', 'El recordatorio ha sido actualizado.', 'success');
      } else {
        // Crear
        const { error } = await supabase.from('recordatorios').insert([recordatorio]);
        if (error) throw error;

        Swal.fire('Creado', 'El recordatorio ha sido creado.', 'success');
      }

      this.cerrarModal();
      await this.loadRecordatorios();
    } catch (err: any) {
      this.error = err.message;
      Swal.fire('Error', this.error ?? 'Ocurrió un error', 'error');
    }
  }

  // Eliminar
  async deleteRecordatorio(id: number) {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¡Esta acción no se puede deshacer!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase
          .from('recordatorios')
          .delete()
          .eq('id_recordatorio', id);
        if (error) throw error;

        Swal.fire('Eliminado', 'El recordatorio ha sido eliminado.', 'success');
        await this.loadRecordatorios();
      } catch (err: any) {
        this.error = err.message;
        Swal.fire('Error', this.error ?? 'Ocurrió un error', 'error');
      }
    }
  }

  limpiarFormulario() {
    this.nuevoRecordatorio = {
      nombre: '',
      frecuencia: '',
      cantidad: null,
      hora: '',
      fecha_inicio: '',
      fecha_fin: '',
      id_user: null,       // mantenemos el usuario logueado
      id_categoria: null,
      id_cuenta: null
    };
  }


  getDiasParaProximoPago(recordatorio: any): string {
    if (!recordatorio.fecha_inicio || !recordatorio.fecha_fin || !recordatorio.frecuencia) {
      return 'Datos incompletos';
    }

    const ahora = new Date();
    const fechaInicio = new Date(recordatorio.fecha_inicio);
    const fechaFin = new Date(recordatorio.fecha_fin);
    let proximo = new Date(fechaInicio);

    // Aplicar frecuencia hasta encontrar el próximo pago válido
    while (proximo <= ahora && proximo <= fechaFin) {
      switch (recordatorio.frecuencia) {
        case 'Semanal':
          proximo.setDate(proximo.getDate() + 7);
          break;
        case 'Quincenal':
          proximo.setDate(proximo.getDate() + 15);
          break;
        case 'Mensual':
          proximo.setMonth(proximo.getMonth() + 1);
          break;
        case 'Bimestral':
          proximo.setMonth(proximo.getMonth() + 2);
          break;
        case 'Trimestral':
          proximo.setMonth(proximo.getMonth() + 3);
          break;
        case 'Anual':
          proximo.setFullYear(proximo.getFullYear() + 1);
          break;
        case 'Único':
        default:
          if (proximo > ahora && proximo <= fechaFin) {
            break;
          } else {
            return 'Pago único ya vencido';
          }
      }
    }

    // Verificar si está dentro del rango permitido
    if (proximo > fechaFin) return 'No hay más pagos programados';

    const diffMs = proximo.getTime() - ahora.getTime();
    const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDias === 0) return 'Es hoy';
    if (diffDias === 1) return 'Mañana';
    return `Faltan ${diffDias} días`;
  }








esActivo(recordatorio: any): boolean {
  const hoy = new Date();
  const fechaFin = new Date(recordatorio.fecha_fin);

  hoy.setHours(0, 0, 0, 0);
  fechaFin.setHours(0, 0, 0, 0);

  const activo = hoy <= fechaFin;
  return activo;
}


}
