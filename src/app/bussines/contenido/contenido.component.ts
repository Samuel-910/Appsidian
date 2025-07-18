import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { supabase } from '../../supabase.config';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contenido',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contenido.component.html'
})
export class ContenidoComponent implements OnInit {
  contenidos: any[] = [];
  nuevoContenido: any = { titulo: '', capitulo: '', url: '', tipo_id: null, imagen_url: '', user_id: '' };
  editando: any = null;
  error: string | null = null;
  mostrarModal = false;
  imagenFile: File | null = null;
  editImagenFile: File | null = null;
  tipoId: number | null = null;
  userId: string = '';

  constructor(private route: ActivatedRoute) { }

  async ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      const tipoIdParam = params.get('id');
      if (tipoIdParam) {
        this.tipoId = Number(tipoIdParam);
        this.nuevoContenido.tipo_id = this.tipoId;
      }

      const auth = localStorage.getItem('sb-mjompchhwvbqpnjnqlma-auth-token');
      if (auth) {
        const authObj = JSON.parse(auth);
        this.userId = authObj.user?.id || '';
        this.nuevoContenido.user_id = this.userId;
      }

      await this.loadContenidos();
    });
  }


  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.imagenFile = event.target.files[0];
    }
  }

  onEditFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.editImagenFile = event.target.files[0];
    }
  }

  async uploadImage(): Promise<string | null> {
    if (!this.imagenFile) return null;
    const fileExt = this.imagenFile.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from('contenido-images')
      .upload(filePath, this.imagenFile);

    if (error) {
      this.error = 'Error subiendo la imagen';
      return null;
    }

    // Obtener la URL pública
    const { data } = supabase.storage.from('contenido-images').getPublicUrl(filePath);
    return data.publicUrl;
  }

  async loadContenidos() {
    try {
      const { data, error } = await supabase
        .from('contenido')
        .select('*')
        .eq('user_id', this.userId)
        .eq('tipo_id', this.tipoId);

      if (error) throw error;
      this.contenidos = data;
    } catch (err: any) {
      this.error = err.message;
    }
  }


  async addContenido() {
    try {
      // Subir imagen si hay archivo seleccionado
      if (this.imagenFile) {
        const url = await this.uploadImage();
        if (url) {
          this.nuevoContenido.imagen_url = url;
        }
      }

      const { error } = await supabase.from('contenido').insert([this.nuevoContenido]);
      if (error) throw error;
      this.nuevoContenido = { titulo: '', capitulo: '', url: '', tipo_id: this.nuevoContenido.tipo_id, imagen_url: '', user_id: this.nuevoContenido.user_id };
      this.imagenFile = null;
      await this.loadContenidos();
      Swal.fire('Éxito', 'El contenido ha sido creado.', 'success');
    } catch (err: any) {
      this.error = err.message;
      Swal.fire('Error', this.error ?? 'Ocurrió un error', 'error');
    }
  }

  setEdit(contenido: any) {
    this.editando = { ...contenido };
  }

  async updateContenido() {
    try {
      // Si hay nueva imagen, súbela y actualiza la URL
      if (this.editImagenFile) {
        const fileExt = this.editImagenFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('contenido-images')
          .upload(filePath, this.editImagenFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('contenido-images').getPublicUrl(filePath);
        this.editando.imagen_url = data.publicUrl;
        this.editImagenFile = null;
      }

      const { error } = await supabase.from('contenido')
        .update({
          titulo: this.editando.titulo,
          capitulo: this.editando.capitulo,
          url: this.editando.url,
          tipo_id: this.editando.tipo_id,
          imagen_url: this.editando.imagen_url,
          user_id: this.editando.user_id
        })
        .eq('id', this.editando.id);
      if (error) throw error;
      this.editando = null;
      await this.loadContenidos();
      Swal.fire('Éxito', 'El contenido ha sido actualizado.', 'success');
    } catch (err: any) {
      this.error = err.message;
      Swal.fire('Error', this.error ?? 'Ocurrió un error', 'error');
    }
  }

  async deleteContenido(id: number) {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¡Esta acción no se puede deshacer!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase.from('contenido').delete().eq('id', id);
        if (error) throw error;
        await this.loadContenidos();
        Swal.fire('Eliminado', 'El contenido ha sido eliminado.', 'success');
      } catch (err: any) {
        this.error = err.message;
        Swal.fire('Error', this.error ?? 'Ocurrió un error', 'error');
      }
    }
  }
}
