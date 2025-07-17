import { Component } from '@angular/core';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-business-layout',
    standalone: true,
  template: `
    <div class="flex flex-col h-screen">
      <div class="flex flex-1 overflow-hidden">
        <app-sidebar class="w-64 shrink-0"></app-sidebar>
        <div class="flex-1 overflow-y-auto p-6 bg-gray-50">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  imports: [SidebarComponent, RouterOutlet]
})
export class BusinessLayoutComponent {}
