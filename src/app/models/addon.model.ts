export const ADDON_TYPES = [
  { value: 'addon', label: 'Add-On' },
  { value: 'mapa', label: 'Mapa' },
  { value: 'skin', label: 'Skin' }
];

export const ADDON_TAGS = [
  { value: 'decoracion', label: 'Decoración' },
  { value: 'aventura', label: 'Aventura' },
  { value: 'mejora', label: 'Mejora' },
  { value: 'supervivencia', label: 'Supervivencia' },
  { value: 'pvp', label: 'PvP' },
  { value: 'minijuego', label: 'Minijuego' }
];

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
