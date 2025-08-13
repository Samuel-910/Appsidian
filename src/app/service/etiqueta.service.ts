import { Injectable } from '@angular/core';
import { supabase } from '../supabase.config';


@Injectable({
  providedIn: 'root'
})
export class EtiquetaService {

  constructor() { }

  async getAll() {
    const { data, error } = await supabase.from('etiqueta').select('*');
    if (error) throw error;
    return data;
  }

  async getById(id: number) {
    const { data, error } = await supabase.from('etiqueta').select('*').eq('id_etiqueta', id).single();
    if (error) throw error;
    return data;
  }

  async create(tipo: any) {
    const { data, error } = await supabase.from('etiqueta').insert([tipo]);
    if (error) throw error;
    return data;
  }

  async update(id: number, tipo: any) {
    const { data, error } = await supabase.from('etiqueta').update(tipo).eq('id_etiqueta', id);
    if (error) throw error;
    return data;
  }

  async delete(id: number) {
    const { data, error } = await supabase.from('etiqueta').delete().eq('id_etiqueta', id);
    if (error) throw error;
    return data;
  }
}