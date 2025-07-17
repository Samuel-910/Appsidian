import { Injectable } from '@angular/core';
import { supabase } from './supabase.config';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  async getData(table: string) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) throw error;
    return data;
  }

  async signIn(email: string) {
    return supabase.auth.signInWithOtp({ email });
  }

  async signOut() {
    return supabase.auth.signOut();
  }
    async signInWithPassword(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }
}
