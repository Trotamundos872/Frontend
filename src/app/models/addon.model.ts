export class Addon {
  id?: number;
  descripcion?: string;
  likes?: number;
  nombre?: string;
  tipo?: string;
  urlMiniatura?: string;

  constructor(data: Partial<Addon>) {
    Object.assign(this, data);
  }
}
