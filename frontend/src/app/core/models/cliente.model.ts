import { Genero } from './enums';

export interface Cliente {
  id: number;
  clienteId: string;
  nombre: string;
  genero: Genero;
  edad: number;
  identificacion: string;
  direccion: string;
  telefono: string;
  estado: boolean;
}

export interface ClienteCreateRequest {
  clienteId: string;
  nombre: string;
  genero: Genero;
  edad: number;
  identificacion: string;
  direccion: string;
  telefono: string;
  contrasena: string;
  estado: boolean;
}

export type ClienteUpdateRequest = Omit<ClienteCreateRequest, 'clienteId' | 'contrasena'> & {
  contrasena?: string;
};
