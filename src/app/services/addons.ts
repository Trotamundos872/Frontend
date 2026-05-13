import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout, catchError, of, tap } from 'rxjs';
import { Addon } from '../models/addon.model';
import { isPlatformBrowser } from '@angular/common';
import { API_URL, APP_CONFIG, AppConfig } from '../app.constants';



@Injectable({
  providedIn: 'root',
})

export class Addons {
  private apiUrl = inject(API_URL);
  private appConfig = inject<AppConfig>(APP_CONFIG);
  private baseUrl = `${this.apiUrl}/api/addon`;
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) { }

  public getAll(termino: string = '', orden: string = 'normal', categoria: string = ''): Observable<Addon[]> {
    let url = `${this.baseUrl}/buscar?buscar=${termino}&orden=${orden}`;
    if (categoria) {
      url += `&categoria=${categoria}`;
    }
    return this.http.get<Addon[]>(url).pipe(
      timeout(5000),
      catchError(err => {
        return of([]);
      })
    );
  }

  public getAddonById(id: string): Observable<Addon> {
    return this.http.get<Addon>(`${this.baseUrl}/${id}`).pipe(
      timeout(5000)
    );
  }

  public getMisCreaciones(): Observable<Addon[]> {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem("jwtToken") || '';
    }
    return this.http.get<Addon[]>(`${this.baseUrl}/mis-creaciones`, {
      headers: { 'Authorization': 'Bearer ' + token }
    }).pipe(
      timeout(5000),
      catchError(err => {
        console.error('Error fetching mis creaciones:', err);
        return of([]);
      })
    );
  }

  public getCreadorByToken(): Observable<any> {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem("jwtToken") || '';
    }
    return this.http.get<any>(`${this.apiUrl}/api/creador/mi-perfil`, {
      headers: { 'Authorization': 'Bearer ' + token }
    }).pipe(
      timeout(5000)
    );
  }

  public getCreadorById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/creador/${id}`).pipe(
      timeout(5000)
    );
  }

  public updateCreadorProfile(profileData: { nombre: string; especialidad: string }): Observable<any> {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem("jwtToken") || '';
    }
    return this.http.put<any>(`${this.apiUrl}/api/creador/mi-perfil`, profileData, {
      headers: { 'Authorization': 'Bearer ' + token }
    }).pipe(
      timeout(5000)
    );
  }

  public getAddonsDeCreador(id: string): Observable<Addon[]> {
    return this.http.get<Addon[]>(`${this.baseUrl}/perfil/${id}`).pipe(
      timeout(5000),
      catchError(err => {
        console.error('Error fetching addons de creador:', err);
        return of([]);
      })
    );
  }

  public createAddon(addon: Addon): Observable<any> {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem("jwtToken") || '';
    }
    return this.http.post<any>(`${this.baseUrl}`, addon, {
      headers: { 'Authorization': 'Bearer ' + token }
    }).pipe(
      timeout(10000)
    );
  }

  public darLike(addonId: number): Observable<any> {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem("jwtToken") || '';
    }
    return this.http.post<any>(`${this.baseUrl}/darlike/${addonId}`, {}, {
      headers: { 'Authorization': 'Bearer ' + token }
    }).pipe(
      timeout(5000)
    );
  }

  public subirArchivo(archivoData: any): Observable<any> {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem("jwtToken") || '';
    }
    
    const idAddon = archivoData.addon.id;
    
    return this.http.post<any>(`${this.apiUrl}/api/archivos/subir?idAddon=${idAddon}`, archivoData, {
      headers: { 'Authorization': 'Bearer ' + token }
    }).pipe(
      timeout(10000)
    );
  }

  //enpoint de mi servidor
  public subirArchivoReal(file: File, nombreDestino: string): Observable<any> {
    const formData = new FormData();
    const renamedFile = new File([file], nombreDestino, { type: file.type });
    formData.append('archivo', renamedFile);

    return this.http.post<any>(this.appConfig.uploadUrl, formData).pipe(
      timeout(30000) // 30 segundos para archivos grandes
    );
  }

  public getArchivosByAddon(idAddon: string | number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/archivos/addon/${idAddon}`).pipe(
      timeout(5000),
      catchError(err => {
        console.error('Error fetching archivos:', err);
        return of([]);
      })
    );
  }

  public comprobarLike(addonId: number): Observable<any> {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem("jwtToken") || '';
    }
    return this.http.get<any>(`${this.baseUrl}/darlike/comprobar/${addonId}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    }).pipe(
      timeout(5000),
      catchError(err => of({ haDadoLike: false }))
    );
  }

  // SUSCRIPCIONES
  public toggleSubscripcion(idCreador: number): Observable<any> {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem("jwtToken") || '';
    }
    return this.http.post<any>(`${this.apiUrl}/api/subscripcion/susbscribe/${idCreador}`, {}, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
  }

  public getEstadoSubscripcion(idCreador: number): Observable<any> {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem("jwtToken") || '';
    }
    return this.http.get<any>(`${this.apiUrl}/api/subscripcion/estado/${idCreador}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    }).pipe(
      catchError(() => of({ subscrito: false }))
    );
  }

  public updateAddon(id: number, addonData: any): Observable<any> {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem("jwtToken") || '';
    }
    return this.http.put<any>(`${this.baseUrl}/${id}`, addonData, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
  }

  public eliminarAddon(id: number): Observable<any> {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem("jwtToken") || '';
    }
    return this.http.delete<any>(`${this.baseUrl}/${id}/eliminar`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
  }

  public getDetallesSubscritos(): Observable<any[]> {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem("jwtToken") || '';
    }
    return this.http.get<any[]>(`${this.apiUrl}/api/subscripcion/detalles-subscritos`, {
      headers: { 'Authorization': 'Bearer ' + token }
    }).pipe(
      catchError(err => {
        console.error('Error al obtener suscritos:', err);
        return of([]);
      })
    );
  }

  public getContarSeguidores(idCreador: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/subscripcion/contar-seguidores/${idCreador}`);
  }

  public registrarDescarga(idArchivo: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/archivos/descargar/${idArchivo}`, {});
  }

  public getAllCreadores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/creador/todos`).pipe(
      catchError(err => {
        console.error('Error al obtener todos los creadores:', err);
        return of([]);
      })
    );
  }

  public invitarCreador(idAddon: number, idCreador: number): Observable<any> {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem("jwtToken") || '';
    }
    return this.http.get<any>(`${this.apiUrl}/api/addon/invitar/enviar/${idAddon}/${idCreador}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
  }

  public getRanking(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/creador/ranking`);
  }

  public getInvitacionesPendientes(): Observable<any[]> {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem("jwtToken") || '';
    }
    return this.http.get<any[]>(`${this.apiUrl}/api/addon/mis-invitaciones`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
  }

  public aceptarInvitacion(idInvitacion: number): Observable<any> {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem("jwtToken") || '';
    }
    return this.http.get<any>(`${this.apiUrl}/api/addon/invitar/aceptar/${idInvitacion}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
  }

  public rechazarInvitacion(idInvitacion: number): Observable<any> {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem("jwtToken") || '';
    }
    return this.http.get<any>(`${this.apiUrl}/api/addon/invitar/rechazar/${idInvitacion}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
  }

  public denegarAcceso(idAddon: number, idCreador: number): Observable<any> {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem("jwtToken") || '';
    }
    return this.http.get<any>(`${this.apiUrl}/api/addon/invitar/bloquear/${idAddon}/${idCreador}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
  }

  public getCreadoresDeUnAddon(idAddon: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/addon/creadores-full/${idAddon}`);
  }
}
