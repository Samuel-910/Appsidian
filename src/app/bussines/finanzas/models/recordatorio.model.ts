// models/recordatorio.model.ts
export interface Recordatorio {
    id_recordatorio?: number;
    nombre: string;
    frecuencia: string;
    comentario: string;
    cantidad: string;
    hora: string;
    fecha_inicio: Date;
    fecha_fin: Date;
    id_user: string;
    id_categoria?: number;
    id_cuenta?: number;
}
