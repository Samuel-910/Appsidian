import { Injectable } from '@angular/core';
import { supabase } from '../supabase.config';


@Injectable({
  providedIn: 'root'
})
export class RecordatorioService {

  constructor() { }

  async getAll() {
    const { data, error } = await supabase.from('recordatorios').select('*');
    console.log('CategoriaService - getAll', data, error);
    if (error) throw error;
    return data;
  }

  async getById(id: number) {
    const { data, error } = await supabase.from('recordatorios').select('*').eq('id_recordatorio', id).single();
    if (error) throw error;
    return data;
  }

  async create(tipo: any) {
    const { data, error } = await supabase.from('recordatorios').insert([tipo]);
    if (error) throw error;
    return data;
  }

  async update(id: number, tipo: any) {
    const { data, error } = await supabase.from('recordatorios').update(tipo).eq('id_recordatorio', id);
    if (error) throw error;
    return data;
  }

  async delete(id: number) {
    const { data, error } = await supabase.from('recordatorios').delete().eq('id_recordatorio', id);
    if (error) throw error;
    return data;
  }
}