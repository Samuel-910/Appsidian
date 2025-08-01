import { Component, OnInit } from '@angular/core';
import { Recordatorio } from '../finanzas/models/recordatorio.model';
import { RecordatorioService } from '../../service/recordatorio.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  recordatorios: Recordatorio[] = [];
  userId: string = ''; // Asegúrate de obtener el userId desde tu auth o storage
  async ngOnInit() {
    const auth = localStorage.getItem('sb-mjompchhwvbqpnjnqlma-auth-token');
    if (auth) {
      const authObj = JSON.parse(auth);
      this.userId = authObj.user?.id || '';
    }
    await this.cargarRecordatorios();
    this.mostrarAlertasDePagos();
  }
  constructor(private recordatorioService: RecordatorioService) { }

  async cargarRecordatorios() {
    const data = await this.recordatorioService.getAll();
    this.recordatorios = data.filter(r => r.id_user === this.userId);
  }
  mostrarAlertasDePagos() {
    const hoyOMañana = this.recordatorios.filter(r => {
      const resultado = this.getDiasParaProximoPago(r);
      return resultado === 'Es hoy' || resultado === 'Mañana';
    });

    if (hoyOMañana.length > 0) {
      const mensajes = hoyOMañana.map(r => {
        const texto = this.getDiasParaProximoPago(r);
        const icono = texto === 'Es hoy' ? '🔴' : '🟡';
        const colorBorde = texto === 'Es hoy' ? 'border-l-red-400' : 'border-l-amber-400';
        const colorHeader = texto === 'Es hoy' ? 'bg-gradient-to-r from-red-50 to-pink-50' : 'bg-gradient-to-r from-amber-50 to-yellow-50';
        const colorBadge = texto === 'Es hoy' ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-amber-500 to-yellow-500';

        // Formatear cantidad con símbolo de moneda
        const cantidadFormateada = new Intl.NumberFormat('es-PE', {
          style: 'currency',
          currency: 'PEN'
        }).format(parseFloat(r.cantidad) || 0);

        // Formatear fecha de fin
        const fechaFin = new Date(r.fecha_fin).toLocaleDateString('es-PE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });

        return `
        <div class="mb-4 bg-gradient-to-br from-white via-blue-50 to-blue-100 rounded-xl shadow-lg border border-blue-200 overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 backdrop-blur-sm">
          <!-- Header del recordatorio -->
          <div class="flex items-center justify-between p-4 ${colorHeader} ${colorBorde} border-l-4 backdrop-blur-sm">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-white rounded-full shadow-md">
                <span class="text-lg">${icono}</span>
              </div>
              <div>
                <h3 class="font-bold text-slate-800 text-lg leading-tight">${r.nombre}</h3>
                <p class="text-xs text-slate-600 opacity-80">Recordatorio de pago</p>
              </div>
            </div>
            <span class="px-4 py-2 text-sm font-bold text-white rounded-full shadow-lg ${colorBadge} hover:scale-105 transition-transform">
              ${texto}
            </span>
          </div>
          
          <!-- Contenido principal -->
          <div class="p-4 bg-gradient-to-br from-white to-blue-50 space-y-4">
            <!-- Fila de cantidad y frecuencia -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200 hover:shadow-md transition-all">
                <div class="p-2 bg-emerald-100 rounded-full">
                  <span class="text-xl">💰</span>
                </div>
                <div>
                  <p class="text-xs text-emerald-700 font-semibold uppercase tracking-wider">Monto</p>
                  <p class="text-lg font-bold text-emerald-800">${cantidadFormateada}</p>
                </div>
              </div>
              
              <div class="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:shadow-md transition-all">
                <div class="p-2 bg-blue-100 rounded-full">
                  <span class="text-xl">🔄</span>
                </div>
                <div>
                  <p class="text-xs text-blue-700 font-semibold uppercase tracking-wider">Frecuencia</p>
                  <p class="text-sm font-bold text-blue-800 capitalize">${r.frecuencia}</p>
                </div>
              </div>
            </div>
            
            <!-- Fila de hora y fecha fin -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200 hover:shadow-md transition-all">
                <div class="p-2 bg-purple-100 rounded-full">
                  <span class="text-xl">⏰</span>
                </div>
                <div>
                  <p class="text-xs text-purple-700 font-semibold uppercase tracking-wider">Hora</p>
                  <p class="text-sm font-bold text-purple-800">${r.hora}</p>
                </div>
              </div>
              
              <div class="flex items-center gap-3 p-3 bg-gradient-to-r from-cyan-50 to-sky-50 rounded-lg border border-cyan-200 hover:shadow-md transition-all">
                <div class="p-2 bg-cyan-100 rounded-full">
                  <span class="text-xl">📅</span>
                </div>
                <div>
                  <p class="text-xs text-cyan-700 font-semibold uppercase tracking-wider">Vence</p>
                  <p class="text-sm font-bold text-cyan-800">${fechaFin}</p>
                </div>
              </div>
            </div>
            
            <!-- Comentario si existe -->
            ${r.comentario ? `
              <div class="mt-4 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border-l-4 border-l-slate-400 shadow-inner">
                <div class="flex items-start gap-3">
                  <div class="p-2 bg-slate-100 rounded-full mt-1">
                    <span class="text-lg">💬</span>
                  </div>
                  <div class="flex-1">
                    <p class="text-xs text-slate-700 font-semibold uppercase tracking-wider mb-2">Comentario</p>
                    <p class="text-sm text-slate-700 italic leading-relaxed bg-white p-3 rounded-lg border border-slate-200">"${r.comentario}"</p>
                  </div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>`;
      }).join('');
      Swal.fire({
        title: `<div class=" text-center">
                <div class="flex items-center justify-center gap-4 text-slate-800 font-bold text-2xl mb-4">
                  <div class="h-15 w-15 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg">
                    <span class="text-white text-2xl">💳</span>
                  </div>
                  <span class="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent drop-shadow-sm">
                    Recordatorios de Pagos
                  </span>
                </div>
              </div>`,
        html: `<div class="max-h-[46vh] overflow-y-auto pr-1 space-y-5 bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 p-4 rounded-xl border border-blue-200">
               ${mensajes}
             </div>`,
        confirmButtonText: '✓ Entendido',
        allowOutsideClick: false,
        width: '750px',
        padding: '2rem',
        background: 'transparent',
        customClass: {
          popup: 'tailwind-popup-extended',
          title: 'tailwind-title-extended',
          htmlContainer: 'tailwind-content-extended',
          confirmButton: 'tailwind-button-confirm'
        },
        didOpen: () => {
          // Aplicamos las clases de Tailwind al popup
          const popup = document.querySelector('.tailwind-popup-extended');
          const title = document.querySelector('.tailwind-title-extended');
          const content = document.querySelector('.tailwind-content-extended');
          const confirmBtn = document.querySelector('.tailwind-button-confirm');

          if (popup) {
            popup.className += ' bg-gradient-to-br from-slate-100 via-blue-100 to-indigo-200 border-2 border-blue-300 rounded-3xl shadow-2xl shadow-blue-500/30 font-sans backdrop-blur-lg';

          }

          if (title) {
            title.className += ' text-slate-800 drop-shadow-lg';
          }

          if (content) {
            content.className += ' text-slate-700';
          }

          if (confirmBtn) {
            confirmBtn.className = 'px-8 py-4 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white font-bold rounded-full shadow-xl shadow-blue-500/40 hover:shadow-blue-600/50 hover:-translate-y-1 hover:scale-105 transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-60 border-2 border-blue-400';
          }

          // Inyectamos estilos adicionales mejorados
          const style = document.createElement('style');
          style.textContent = `
          @keyframes slideInScale {
            0% {
              opacity: 0;
              transform: scale(0.8) translateY(-40px) rotateX(15deg);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.02) translateY(-10px) rotateX(5deg);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0) rotateX(0);
            }
          }
          
          .tailwind-popup-extended {
            backdrop-filter: blur(20px) saturate(180%);
            position: relative;
          }
          
          .tailwind-popup-extended::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.8) 0%,
              rgba(240, 249, 255, 0.6) 25%,
              rgba(219, 234, 254, 0.4) 50%,
              rgba(191, 219, 254, 0.6) 75%,
              rgba(147, 197, 253, 0.8) 100%
            );
            border-radius: 1.5rem;
            z-index: -1;
          }
          
          /* Scrollbar personalizada mejorada */
          .tailwind-content-extended .max-h-96::-webkit-scrollbar {
            width: 8px;
          }
          
          .tailwind-content-extended .max-h-96::-webkit-scrollbar-track {
            background: linear-gradient(to bottom, #e0f2fe, #bae6fd);
            border-radius: 4px;
            box-shadow: inset 0 2px 4px rgba(59, 130, 246, 0.1);
          }
          
          .tailwind-content-extended .max-h-96::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #3b82f6, #2563eb);
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .tailwind-content-extended .max-h-96::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #2563eb, #1d4ed8);
            transform: scale(1.1);
          }
          
          /* Responsive mejorado */
          @media (max-width: 768px) {
            .tailwind-popup-extended {
              margin: 8px !important;
              width: calc(100% - 16px) !important;
            }
            
            .grid-cols-2 {
              grid-template-columns: 1fr !important;
            }
            
            .flex-wrap {
              flex-direction: column !important;
              align-items: center !important;
              gap: 8px !important;
            }
          }
          
          /* Efectos hover mejorados para las tarjetas */
          .tailwind-content-extended .mb-4:hover {
            transform: translateY(-4px) scale(1.02);
            box-shadow: 0 20px 40px rgba(59, 130, 246, 0.15);
          }
          
          /* Animaciones de los badges del header */
          .tailwind-title-extended .hover\\:scale-105:hover {
            animation: pulse 1s infinite;
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1.05); }
            50% { transform: scale(1.1); }
          }
          
          /* Efecto glass morphism para el contenedor de contenido */
          .tailwind-content-extended > div {
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.7) !important;
            box-shadow: 
              0 8px 32px rgba(59, 130, 246, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.6);
          }
          
          /* Mejoras para los iconos en círculos */
          .tailwind-content-extended .rounded-full {
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
          }
          
          .tailwind-content-extended .rounded-full:hover {
            transform: rotate(10deg) scale(1.1);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
          }
        `;
          document.head.appendChild(style);
        }
      });
    }
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

}
