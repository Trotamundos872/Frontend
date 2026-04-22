export class Addon {
  id?: number;
  descripcion?: string;
  likes?: number;
  nombre?: string;
  tipo?: string;
  tag?: string;
  urlMiniatura?: string;
  textoAddon?: string;
  nombresCreadores?: string[];
  idsCreadores?: number[];

  constructor(data: Partial<Addon>) {
    Object.assign(this, data);
  }
}
