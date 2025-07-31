import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { TiposService } from '../../service/tipos.service';
import { SupabaseService } from '../../supabase.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  isOpen = false;
  tipos: any[] = [];
  mostrarCategorias = false;
  mostrarEntretenimiento = false;
  mostrarFinanzas = false;

  constructor(private router: Router, private tiposService: TiposService,
    private supabase: SupabaseService) { }

  ngOnInit(): void {
    this.obtenertipos();

  }
  obtenertipos() {
    const auth = localStorage.getItem('sb-mjompchhwvbqpnjnqlma-auth-token');
    let user_id = null;
    if (auth) {
      const authObj = JSON.parse(auth);
      user_id = authObj.user?.id;
    }

    // Obtener todos los tipos y filtrar por user_id
    this.tiposService.getAll().then(data => {
      this.tipos = data.filter((tipo: any) => tipo.user_id === user_id);
    });
  }
  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }

  screenIsMobile(): boolean {
    return window.innerWidth < 768;
  }

  closeSidebar() {
    this.isOpen = false;
  }

  async logout() {
    const { error } = await this.supabase.signOut();
    if (error) {
      console.error('Error al cerrar sesión:', error.message);
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Sesión cerrada',
        text: 'Has cerrado sesión correctamente.',
        confirmButtonText: 'Aceptar'
      });
      this.router.navigate(['/']);
    }
  }
  refreshData(tipoId: string): void {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard/contenido', tipoId]);
    });
  }

  toggleCategorias() {
    this.mostrarCategorias = !this.mostrarCategorias;
  }

  toggleEntretenimiento() {
  this.mostrarEntretenimiento = !this.mostrarEntretenimiento;
}
  toggleFinanzas() {
  this.mostrarFinanzas = !this.mostrarFinanzas;
}
}
