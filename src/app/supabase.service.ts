import { Injectable } from '@angular/core';
import { supabase } from './supabase.config';
interface Noticia {
  id_noticia: number;
  nombre_fuente: string;
  url_fuente: string;
  fecha_publicacion: string;
  fecha_scraping: string;
  periodo_inicio: number;
  periodo_mes: number;
  periodo_semana: number;
  imagen_url: string;
  imagen_path: string;
  pais: string;
  region: string;
  ciudad: string;
  ubicacion_mencionada: string;
  categoria: string;
  entidades_mencionadas: string;
  titulo: string;
  contenido: string;
  language: string;
  tipo_noticia: string;
  fecha_registro: string;
}

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  async getData(table: string) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) throw error;
    return data;
  }
  async signOut() {
    return supabase.auth.signOut();
  }
  async signInWithPassword(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:4200/verificacioncodigo'
    });

    if (error) throw error;
    return data;
  }


// supabase.service.ts
async getNoticias(): Promise<{ data: Noticia[]; total: number }> {
  const { data, count, error } = await supabase
    .from('noticiastodo')
    .select('*', { count: 'exact' });

  if (error) throw error;

  console.log('📊 Total noticias encontradas:', count);

  return {
    data: data as Noticia[],
    total: count ?? 0
  };
}



}
