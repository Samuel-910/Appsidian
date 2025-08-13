import { Component } from '@angular/core';
import { RegistroService } from '../../../service/registro.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CategoriaService } from '../../../service/categoria.service';
import { CuentasService } from '../../../service/cuentas.service';
import { EtiquetaService } from '../../../service/etiqueta.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  registros: any[] = [];
  categoriasMap = new Map<string, string>();
  cuentasMap = new Map<string, string>();
  nombreEtiquetaMap = new Map<string, string>();
  colorEtiquetaMap = new Map<string, string>();
  Math = Math;
  userId: string = '';
  form!: FormGroup;
  mostrarModal = false;
  categorias: any[] = [];
  cuentas: any[] = [];
  etiquetas: any[] = [];
  mostrarModalEtiqueta = false;
  etiquetaForm!: FormGroup;
  etiquetaEditando: any = null;
  constructor(private registroService: RegistroService,
    private categoriaService: CategoriaService,
    private cuentaService: CuentasService,
    private etiquetaService: EtiquetaService,
    private cuentasService: CuentasService,
    private fb: FormBuilder
  ) { }

  async ngOnInit() {
    const auth = localStorage.getItem('sb-mjompchhwvbqpnjnqlma-auth-token');
    if (auth) {
      const authObj = JSON.parse(auth);
      this.userId = authObj.user?.id || '';
    }
    this.form = this.fb.group({
      fecha_transaccion: ['', Validators.required],
      comentario: [''],
      tipo: ['gastos', Validators.required],
      monto: [0, Validators.required],
      id_categoria: [null, Validators.required],
      id_cuenta: [null, Validators.required],
      id_etiqueta: [null],
      id_user: [this.userId, Validators.required],
    });
    this.etiquetaForm = this.fb.group({
      nombre: ['', Validators.required],
      color: ['#000000', Validators.required],
    });
    await this.obtenerRegistros();
    this.cargarMapeos();
    await this.loadCategorias();
    await this.loadCuentas();
    await this.obtenerEtiquetas();
  }
  async obtenerRegistros() {
    try {
      const data = await this.registroService.getAll();
      this.registros = data || [];
    } catch (err) {
      console.error('Error al cargar registros', err);
    }
  }
  cargarMapeos() {
    // Obtener categorías
    this.categoriaService.getAll().then(categorias => {
      categorias.forEach(cat => {
        this.categoriasMap.set(cat.id_categoria, cat.nombre_categoria);
      });
    });

    // Obtener cuentas
    this.cuentaService.getAll().then(cuentas => {
      cuentas.forEach(cuenta => {
        this.cuentasMap.set(cuenta.id_cuenta, cuenta.nombre_cuenta);
      });
    });

    // Obtener etiquetas
    this.etiquetaService.getAll().then(etiquetas => {
      etiquetas.forEach(etiqueta => {
        this.nombreEtiquetaMap.set(etiqueta.id_etiqueta, etiqueta.nombre);
        this.colorEtiquetaMap.set(etiqueta.id_etiqueta, etiqueta.color);
      });
    });
  }
  async obtenerEtiquetas() {
    try {
      const etiquetas = await this.etiquetaService.getAll();
      console.log('Etiquetas:', etiquetas);
      this.etiquetas = etiquetas;
    } catch (error) {
      console.error('Error al obtener etiquetas:', error);
    }
  }
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
      const todos = await this.cuentaService.getAll();
      this.cuentas = todos.filter(r => r.id_user === this.userId);
      console.log('Cuentas cargadas:', this.cuentas);
    } catch (error) {
      console.error('Error al cargar cuentas:', error);
    }
  }
  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  async guardarTransaccion() {
    console.log('Formulario:', this.form.value);
    const auth = localStorage.getItem('sb-mjompchhwvbqpnjnqlma-auth-token');
    if (auth) {
      const authObj = JSON.parse(auth);
      this.userId = authObj.user?.id || '';
    }
    this.form.patchValue({ id_user: this.userId });
    if (this.form.valid) {
      const nuevaTransaccion = this.form.value;

      try {
        console.log('Guardando transacción:', nuevaTransaccion);
        if (
          nuevaTransaccion.monto === null ||
          isNaN(nuevaTransaccion.monto) ||
          nuevaTransaccion.monto <= 0
        ) {
          Swal.fire('Error', 'El monto ingresado no es válido.', 'error');
          return;
        }

        // Obtener cuenta origen para validar saldo
        const cuentaOrigen = await this.cuentasService.getById(Number(nuevaTransaccion.id_cuenta));

        if (!cuentaOrigen) {
          Swal.fire('Error', 'La cuenta seleccionada no existe.', 'error');
          return;
        }

        // Validación: monto no puede superar el saldo actual (solo si es gasto)
        if (nuevaTransaccion.tipo === 'gastos' && nuevaTransaccion.cantidad > cuentaOrigen.saldo_actual) {
          Swal.fire('Error', 'El monto excede el saldo disponible en la cuenta de origen.', 'error');
          return;
        }

        // Guardar transacción
        await this.registroService.create(nuevaTransaccion);

        // Actualizar saldo de cuenta según el tipo
        if (nuevaTransaccion.tipo === 'gastos') {
          await this.cuentasService.update(Number(nuevaTransaccion.id_cuenta), {
            saldo_actual: cuentaOrigen.saldo_actual - nuevaTransaccion.monto
          });
        } else if (nuevaTransaccion.tipo === 'ingresos') {
          await this.cuentasService.update(Number(nuevaTransaccion.id_cuenta), {
            saldo_actual: cuentaOrigen.saldo_actual + nuevaTransaccion.monto
          });
        }

        // Reset y actualizar vista
        this.form.reset();
        this.form.patchValue({ tipo: 'gastos' });
        await this.obtenerRegistros();
        this.cerrarModal();

        Swal.fire({
          icon: 'success',
          title: '¡Guardado!',
          text: 'La transacción se ha guardado correctamente.',
          confirmButtonColor: '#3085d6'
        });

      } catch (error) {
        console.error('Error al guardar transacción:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al guardar la transacción.',
          confirmButtonColor: '#d33'
        });
      }

    } else {
      const camposInvalidos = Object.keys(this.form.controls)
        .filter(key => this.form.get(key)?.invalid)
        .map(key => {
          switch (key) {
            case 'nombre': return 'Nombre';
            case 'cantidad': return 'Cantidad';
            case 'fecha': return 'Fecha';
            case 'id_categoria': return 'Categoría';
            case 'id_etiqueta': return 'Etiqueta';
            case 'tipo': return 'Tipo';
            case 'id_cuenta': return 'Cuenta';
            default: return key;
          }
        });

      Swal.fire({
        icon: 'warning',
        title: 'Formulario inválido',
        html: `Por favor completa los siguientes campos:<br><strong>${camposInvalidos.join(', ')}</strong>`,
        confirmButtonColor: '#f0ad4e'
      });
    }
  }


  abrirModalEtiqueta() {
    this.etiquetaEditando = null;
    this.etiquetaForm.reset({ nombre: '', color: '#000000' });
    this.mostrarModalEtiqueta = true;
  }

  cerrarModalEtiqueta() {
    this.mostrarModalEtiqueta = false;
  }

  async guardarEtiqueta() {
    if (this.etiquetaForm.invalid) return;

    const datos = this.etiquetaForm.value;

    try {
      if (this.etiquetaEditando) {
        await this.etiquetaService.update(this.etiquetaEditando.id_etiqueta, datos);
      } else {
        await this.etiquetaService.create({ ...datos, id_user: this.userId }); // cambia `id_user` si es dinámico
      }

      await this.obtenerEtiquetas();
      this.cerrarModalEtiqueta();
    } catch (err) {
      console.error('Error al guardar etiqueta:', err);
    }
  }

  editarEtiqueta(etiqueta: any) {
    this.etiquetaEditando = etiqueta;
    this.etiquetaForm.patchValue(etiqueta);
    this.mostrarModalEtiqueta = true;
  }

  async eliminarEtiqueta(id: number) {
    if (confirm('¿Estás seguro de eliminar esta etiqueta?')) {
      await this.etiquetaService.delete(id);
      await this.obtenerEtiquetasa();
    }
  }

  async obtenerEtiquetasa() {
    this.etiquetas = await this.etiquetaService.getAll();
  }

}
