import { Injectable } from '@angular/core';
import { supabase } from '../supabase.config';


@Injectable({
  providedIn: 'root'
})
export class CuentasService {

  constructor() { }

  async getAll() {
    const { data, error } = await supabase.from('cuentas').select('*');
    console.log('CuentasService - getAll', data, error);
    if (error) throw error;
    return data;
  }

  async getById(id: number) {
    const { data, error } = await supabase.from('cuentas').select('*').eq('id_cuenta', id).single();
    if (error) throw error;
    return data;
  }

  async create(tipo: any) {
    const { data, error } = await supabase.from('cuentas').insert([tipo]);
    if (error) throw error;
    return data;
  }

  async update(id: number, tipo: any) {
    const { data, error } = await supabase.from('cuentas').update(tipo).eq('id_cuenta', id);
    if (error) throw error;
    return data;
  }

  async delete(id: number) {
    const { data, error } = await supabase.from('cuentas').delete().eq('id_cuenta', id);
    if (error) throw error;
    return data;
  }
}