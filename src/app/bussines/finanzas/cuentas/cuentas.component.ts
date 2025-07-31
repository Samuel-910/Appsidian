import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CuentasService } from '../../../service/cuentas.service';
import { IconoService } from '../../../service/icono.service';
import Swal from 'sweetalert2';
import { transferenciaCuentasService } from '../../../service/transferenciacuentas.service';

@Component({
  selector: 'app-cuentas',
  imports: [CommonModule, FormsModule],
  templateUrl: './cuentas.component.html'
})
export class CuentasComponent {
  cuentas: any[] = [];
  iconos: any[] = [];
  error: string | null = null;
  mostrarModal = false;
  nuevaCuenta: any = {};
  modoEdicion: boolean = false;
  mostrarModalTransferencia = false;
  mostrarModalHistorial = false;
  transferencias: any[] = [];

  constructor(private transferenciaService: transferenciaCuentasService, private cuentasService: CuentasService, private iconoService: IconoService, private router: Router) { }
  transferencia = {
    fecha: '',
    cuenta_origen: '',
    cuenta_destino: '',
    monto: null,
    comentario: '',
    id_user: null
  };
  async abrirHistorialTransferencias() {
    this.mostrarModalHistorial = true;

    const transferencias = await this.transferenciaService.getAll();
    const cuentas = await this.cuentasService.getAll();

    this.transferencias = transferencias.map((t: any) => {
      const origen = cuentas.find((c: any) => c.id_cuenta === Number(t.cuenta_origen));
      const destino = cuentas.find((c: any) => c.id_cuenta === Number(t.cuenta_destino));

      return {
        ...t,
        cuenta_origen: origen || { nombre_cuenta: 'Desconocida', saldo_actual: 0 },
        cuenta_destino: destino || { nombre_cuenta: 'Desconocida', saldo_actual: 0 }
      };
    });
  }

  async realizarTransferencia() {
    const auth = localStorage.getItem('sb-mjompchhwvbqpnjnqlma-auth-token');
    let user_id = null;
    if (auth) {
      const authObj = JSON.parse(auth);
      user_id = authObj.user?.id;
    }

    this.transferencia.fecha = new Date().toISOString(); // Fecha actual en formato ISO
    this.transferencia.id_user = user_id;

    // Validación 1: cuentas no deben ser iguales
    if (this.transferencia.cuenta_origen === this.transferencia.cuenta_destino) {
      Swal.fire('Error', 'La cuenta de origen y destino no pueden ser la misma.', 'error');
      return;
    }

    try {
      // Obtener cuenta origen para validar saldo
      const cuentaOrigen = await this.cuentasService.getById(+this.transferencia.cuenta_origen);

      if (!cuentaOrigen) {
        Swal.fire('Error', 'No se pudo obtener la cuenta de origen.', 'error');
        return;
      }

      // Validación: monto debe ser un número válido y mayor que cero
      if (
        this.transferencia.monto === null ||
        isNaN(this.transferencia.monto) ||
        this.transferencia.monto <= 0
      ) {
        Swal.fire('Error', 'El monto ingresado no es válido.', 'error');
        return;
      }

      // Validación: monto no puede superar el saldo actual
      if (this.transferencia.monto > cuentaOrigen.saldo_actual) {
        Swal.fire('Error', 'El monto excede el saldo disponible en la cuenta de origen.', 'error');
        return;
      }


      // Si pasa todas las validaciones, registrar la transferencia
      await this.transferenciaService.create(this.transferencia);
      const cuentaOrigen1 = await this.cuentasService.getById(Number(this.transferencia.cuenta_origen));
      const cuentaDestino = await this.cuentasService.getById(Number(this.transferencia.cuenta_destino));

      await this.cuentasService.update(Number(this.transferencia.cuenta_origen), {
        saldo_actual: cuentaOrigen1.saldo_actual - this.transferencia.monto!
      });

      await this.cuentasService.update(Number(this.transferencia.cuenta_destino), {
        saldo_actual: cuentaDestino.saldo_actual + this.transferencia.monto!
      });


      this.mostrarModalTransferencia = false;
      Swal.fire('¡Transferencia realizada con éxito!', '', 'success');
      this.obtenercuentas();
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Ocurrió un error al realizar la transferencia.', 'error');
    }
  }

  async ngOnInit() {
    this.obtenercuentas();
    this.obternerIconos();
  }
  get total() {
    return this.cuentas.reduce((sum, c) => sum + c.saldo_actual, 0);
  }
  mostrarOpciones = false;

  seleccionarIcono(icono: any) {
    this.nuevaCuenta.id_icono = icono.id_icono;
    this.mostrarOpciones = false;
  }

  getIconoSeleccionadoClass() {
    const iconoSeleccionado = this.iconos.find(i => i.id_icono === this.nuevaCuenta.id_icono);
    return iconoSeleccionado ? iconoSeleccionado.ruta_icono : 'fas fa-question';
  }

  obtenerNombreIconoSeleccionado() {
    const icono = this.iconos.find(i => i.id_icono === this.nuevaCuenta.id_icono);
    return icono ? icono.nombre : 'Seleccionar';
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

  obtenercuentas() {
    const auth = localStorage.getItem('sb-mjompchhwvbqpnjnqlma-auth-token');
    let user_id = null;
    if (auth) {
      const authObj = JSON.parse(auth);
      user_id = authObj.user?.id;
    }
    this.cuentasService.getAll().then(data => {
      this.cuentas = data.filter((tipo: any) => tipo.id_user === user_id);
      if (this.cuentas.length === 0) {
        this.error = 'No tienes cuentas registradas. Por favor, crea una cuenta.';
      } else {
        this.error = null;
      }
    });
  }
  editarCuenta(cuenta: any) {
    this.nuevaCuenta = { ...cuenta };  // Copiamos la cuenta seleccionada
    this.modoEdicion = true;
    this.mostrarModal = true;
  }

  guardarCuenta() {
    if (this.modoEdicion) {
      // ✅ Envía el ID como primer argumento
      this.cuentasService.update(this.nuevaCuenta.id_cuenta, this.nuevaCuenta).then(() => {
        this.obtenercuentas(); // Recargar
        this.modoEdicion = false;
        this.nuevaCuenta = {}; // Limpiar
      });
    } else {
      // Crear nueva cuenta
      this.cuentasService.create(this.nuevaCuenta).then(() => {
        this.obtenercuentas();
        this.nuevaCuenta = {};
      });
    }
  }


  eliminarCuenta(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cuentasService.delete(id).then(() => {
          this.obtenercuentas();
          Swal.fire(
            'Eliminado',
            'La cuenta ha sido eliminada correctamente.',
            'success'
          );
        });
      }
    });
  }

  resetFormulario() {
    this.nuevaCuenta = {
      nombre_cuenta: '',
      saldo_actual: 0,
      color: '#2196f3',
      id_icono: 1
    };
  }
}
