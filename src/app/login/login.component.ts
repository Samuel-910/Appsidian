import { Component } from '@angular/core';
import { SupabaseService } from '../supabase.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
    imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email = '';
  password = '';
  error: string | null = null;

  constructor(private supabase: SupabaseService,private router: Router) {}

  async login() {
    try {
      await this.supabase.signInWithPassword(this.email, this.password);
          this.router.navigate(['/tipos']);
    } catch (err: any) {
      this.error = err.message;
    }
  }
}