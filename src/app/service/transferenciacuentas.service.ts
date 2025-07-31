import { Injectable } from '@angular/core';
import { supabase } from '../supabase.config';


@Injectable({
  providedIn: 'root'
})
export class transferenciaCuentasService {

  constructor() { }

  async getAll() {
    const { data, error } = await supabase.from('transferencias_cuentas').select('*');
    console.log('transferenciaCuentasService - getAll', data, error);
    if (error) throw error;
    return data;
  }

  async getById(id: number) {
    const { data, error } = await supabase.from('transferencias_cuentas').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async create(tipo: any) {
    const { data, error } = await supabase.from('transferencias_cuentas').insert([tipo]);
    if (error) throw error;
    return data;
  }

  async update(id: number, tipo: any) {
    const { data, error } = await supabase.from('transferencias_cuentas').update(tipo).eq('id_trancuent', id);
    if (error) throw error;
    return data;
  }

  async delete(id: number) {
    const { data, error } = await supabase.from('transferencias_cuentas').delete().eq('id_trancuent', id);
    if (error) throw error;
    return data;
  }
}