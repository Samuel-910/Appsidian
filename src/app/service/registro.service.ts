import { Injectable } from '@angular/core';
import { supabase } from '../supabase.config';


@Injectable({
  providedIn: 'root'
})
export class RegistroService {

  constructor() { }

  async getAll() {
    const { data, error } = await supabase.from('transaccion_gasto').select('*');
    console.log('transaccion_gasto - getAll', data, error);
    if (error) throw error;
    return data;
  }

  async getById(id: number) {
    const { data, error } = await supabase.from('transaccion_gasto').select('*').eq('id_transaccion', id).single();
    if (error) throw error;
    return data;
  }

  async create(tipo: any) {
    const { data, error } = await supabase.from('transaccion_gasto').insert([tipo]);
    if (error) throw error;
    return data;
  }

  async update(id: number, tipo: any) {
    const { data, error } = await supabase.from('transaccion_gasto').update(tipo).eq('id_transaccion', id);
    if (error) throw error;
    return data;
  }

  async delete(id: number) {
    const { data, error } = await supabase.from('transaccion_gasto').delete().eq('id_transaccion', id);
    if (error) throw error;
    return data;
  }
}