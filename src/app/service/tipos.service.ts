import { Injectable } from '@angular/core';
import { supabase } from '../supabase.config';


@Injectable({
  providedIn: 'root'
})
export class TiposService {

  constructor() { }

  async getAll() {
    const { data, error } = await supabase.from('tipos').select('*');
    if (error) throw error;
    return data;
  }

  async getById(id: number) {
    const { data, error } = await supabase.from('tipos').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async create(tipo: any) {
    const { data, error } = await supabase.from('tipos').insert([tipo]);
    if (error) throw error;
    return data;
  }

  async update(id: number, tipo: any) {
    const { data, error } = await supabase.from('tipos').update(tipo).eq('id', id);
    if (error) throw error;
    return data;
  }

  async delete(id: number) {
    const { data, error } = await supabase.from('tipos').delete().eq('id', id);
    if (error) throw error;
    return data;
  }
}