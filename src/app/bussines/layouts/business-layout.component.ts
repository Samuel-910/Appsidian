import { Component } from '@angular/core';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-business-layout',
    standalone: true,
  template: `
<div class="flex flex-col h-screen">
  <!-- Botón hamburguesa visible solo en móviles -->
  <div class="md:hidden bg-white shadow px-4 py-2 flex justify-between items-center">
    <button (click)="toggleSidebar()">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"/>
      </svg>
    </button>
  </div>

  <div class="flex flex-1 overflow-hidden">
    <app-sidebar
      class="w-64 shrink-0 bg-white shadow-md z-50"
      [ngClass]="{
        'hidden': !sidebarOpen,
        'fixed inset-0': sidebarOpen && isMobile(),
        'md:block': true
      }"
    ></app-sidebar>

    <!-- Botón para cerrar sidebar en móvil -->
    <button
      *ngIf="sidebarOpen && isMobile()"
      class="fixed top-4 right-2 z-50 bg-green-600 text-white rounded-full p-2 md:hidden"
      (click)="toggleSidebar()"
    >
      ✕
    </button>

    <!-- Contenido principal -->
    <div class="flex-1 overflow-y-auto p-6 bg-gray-50">
      <router-outlet></router-outlet>
    </div>
  </div>
</div>

  `,
  imports: [SidebarComponent, RouterOutlet, CommonModule]
})
export class BusinessLayoutComponent {
  sidebarOpen = false;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  isMobile(): boolean {
    return window.innerWidth < 768;
  }
}
