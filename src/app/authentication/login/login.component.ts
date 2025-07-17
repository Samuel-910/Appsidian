import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { SupabaseService } from '../../supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
constructor(private supabase: SupabaseService, private router: Router) { }
  currentTheme: 'theme-blue' | 'theme-red' | 'theme-green' = 'theme-blue';

  themeColors = {
    'theme-blue': { start: '#00BFFF', middle: '#1E90FF', end: '#00BFFF' },
    'theme-red': { start: '#FF4B2B', middle: '#FF416C', end: '#FF4B2B' },
    'theme-green': { start: '#38A169', middle: '#48BB78', end: '#38A169' },
  };

  get themeTextClass() {
    return {
      'theme-blue': 'text-blue-700',
      'theme-red': 'text-red-700',
      'theme-green': 'text-green-700',
    }[this.currentTheme];
  }

  get themeLinkClass() {
    return {
      'theme-blue': 'text-blue-700 hover:text-blue-500',
      'theme-red': 'text-red-700 hover:text-red-500',
      'theme-green': 'text-green-700 hover:text-green-500',
    }[this.currentTheme];
  }

  get themeRingClass() {
    return {
      'theme-blue': 'focus:ring-2 focus:ring-blue-300',
      'theme-red': 'focus:ring-2 focus:ring-red-300',
      'theme-green': 'focus:ring-2 focus:ring-green-300',
    }[this.currentTheme];
  }

  get themeButtonClass() {
    return {
      'theme-blue': 'bg-blue-600 hover:bg-blue-700',
      'theme-red': 'bg-red-600 hover:bg-red-700',
      'theme-green': 'bg-green-600 hover:bg-green-700',
    }[this.currentTheme];
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

async login() {
    try {
      await this.supabase.signInWithPassword(this.email, this.password);
        this.router.navigate(['/dashboard/tipos']);
        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: 'Has iniciado sesión correctamente.',
          confirmButtonText: 'Aceptar'
        });
      

    } catch (err: any) {
      console.error('Login failed', err);
      Swal.fire({
        icon: 'error',
        title: '¡Error!',
        text: 'Hubo un problema al iniciar sesión. Verifica tus credenciales.',
        confirmButtonText: 'Aceptar'
      });
    }
  }

  // Cambiar tema desde HTML si lo deseas
  changeTheme(theme: 'theme-blue' | 'theme-red' | 'theme-green') {
    this.currentTheme = theme;
  }
}

