import { Injectable } from '@angular/core';
import { supabase } from '../supabase.config';


@Injectable({
  providedIn: 'root'
})
export class IconoService {

  constructor() { }

  async getAll() {
    const { data, error } = await supabase.from('icono').select('*');
    console.log('CuentasService - getAll', data, error);
    if (error) throw error;
    return data;
  }

  async getById(id: number) {
    const { data, error } = await supabase.from('icono').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async create(tipo: any) {
    const { data, error } = await supabase.from('icono').insert([tipo]);
    if (error) throw error;
    return data;
  }

  async update(id: number, tipo: any) {
    const { data, error } = await supabase.from('icono').update(tipo).eq('id', id);
    if (error) throw error;
    return data;
  }

  async delete(id: number) {
    const { data, error } = await supabase.from('icono').delete().eq('id', id);
    if (error) throw error;
    return data;
  }
}