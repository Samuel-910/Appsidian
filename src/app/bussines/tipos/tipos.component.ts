import { Component } from '@angular/core';
import { TiposService } from '../../service/tipos.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Router } from '@angular/router';
import { SupabaseService } from '../../supabase.service';

@Component({
  selector: 'app-tipos',
  imports: [FormsModule,CommonModule],
  templateUrl: './tipos.component.html',
  styleUrl: './tipos.component.css'
})
export class TiposComponent {
  tipos: any[] = [];
  error: string | null = null;
  nuevoNombre: string = ''; // 👈 Agregado

  constructor(private tiposService: TiposService,   private router: Router,
  private supabase: SupabaseService) {}

  async ngOnInit() {
    await this.loadTipos();
  }

  async loadTipos() {
    try {
      this.tipos = await this.tiposService.getAll();
    } catch (err: any) {
      this.error = err.message;
    }
  }

  async addTipo(tipo: any) {
    try {
      await this.tiposService.create(tipo);
      this.nuevoNombre = ''; // 👈 Limpiar input luego de agregar
      await this.loadTipos();
    } catch (err: any) {
      this.error = err.message;
    }
  }

  async updateTipo(id: number, tipo: any) {
    try {
      await this.tiposService.update(id, tipo);
      await this.loadTipos();
    } catch (err: any) {
      this.error = err.message;
    }
  }

  async deleteTipo(id: number) {
    try {
      await this.tiposService.delete(id);
      await this.loadTipos();
    } catch (err: any) {
      this.error = err.message;
    }
  }

  async logout() {
  const { error } = await this.supabase.signOut();
  if (error) {
    console.error('Error al cerrar sesión:', error.message);
  } else {
    // Redirigir al login
    this.router.navigate(['/']);
  }
}

}
