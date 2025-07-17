import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  isOpen = false;

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }
screenIsMobile(): boolean {
  return window.innerWidth < 768;
}

  closeSidebar() {
    this.isOpen = false;
  }
  constructor(private router: Router) { }

  ngOnInit(): void {

  }

  logout(): void {
    Swal.fire({
      icon: 'success',
      title: 'Sesión cerrada',
      text: 'Has cerrado sesión correctamente.',
      confirmButtonText: 'Aceptar'
    });
    // Redirigir al login o home
    this.router.navigate(['/']);
  }

}
