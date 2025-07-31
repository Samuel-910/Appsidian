import { Injectable } from '@angular/core';
import { supabase } from '../supabase.config';


@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  constructor() { }

  async getAll() {
    const { data, error } = await supabase.from('categoria').select('*');
    console.log('CuentasService - getAll', data, error);
    if (error) throw error;
    return data;
  }

  async getById(id: number) {
    const { data, error } = await supabase.from('categoria').select('*').eq('id_categoria', id).single();
    if (error) throw error;
    return data;
  }

  async create(tipo: any) {
    const { data, error } = await supabase.from('categoria').insert([tipo]);
    if (error) throw error;
    return data;
  }

  async update(id: number, tipo: any) {
    const { data, error } = await supabase.from('categoria').update(tipo).eq('id_categoria', id);
    if (error) throw error;
    return data;
  }

  async delete(id: number) {
    const { data, error } = await supabase.from('categoria').delete().eq('id_categoria', id);
    if (error) throw error;
    return data;
  }
}