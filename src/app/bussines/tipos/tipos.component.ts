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

  async addTipo(tipo: any) {
    try {
      // Obtener el objeto de auth desde localStorage
      const auth = localStorage.getItem('sb-mjompchhwvbqpnjnqlma-auth-token');
      let user_id = null;
      if (auth) {
        const authObj = JSON.parse(auth);
        user_id = authObj.user?.id;
      }

      // Crear el objeto tipo con user_id
      const tipoConUsuario = { ...tipo, user_id };

      await this.tiposService.create(tipoConUsuario);
      this.nuevoNombre = '';
      
      await this.obtenertipos();
    } catch (err: any) {
      this.error = err.message;
    }
  }

  async updateTipo(id: number, tipo: any) {
    try {
      await this.tiposService.update(id, tipo);
      await this.obtenertipos();
    } catch (err: any) {
      this.error = err.message;
    }
  }

  async deleteTipo(id: number) {
    try {
      await this.tiposService.delete(id);
      await this.obtenertipos();
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
