import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout, catchError, of, tap } from 'rxjs';
import { Addon } from '../models/addon.model';
import { isPlatformBrowser } from '@angular/common';



@Injectable({
  providedIn: 'root',
})

export class Addons {
  private baseUrl = 'http://localhost:8080/api/addon';
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) { }

  public getAll(termino: string = ''): Observable<Addon[]> {
    const url = termino.trim() ? `${this.baseUrl}/buscar?buscar=${termino}` : this.baseUrl;
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
    return this.http.get<any>(`http://localhost:8080/api/creador/mi-perfil`, {
      headers: { 'Authorization': 'Bearer ' + token }
    }).pipe(
      timeout(5000)
    );
  }

  public getCreadorById(id: string): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/api/creador/${id}`).pipe(
      timeout(5000)
    );
  }

  public updateCreadorProfile(profileData: { nombre: string; especialidad: string }): Observable<any> {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem("jwtToken") || '';
    }
    return this.http.put<any>(`http://localhost:8080/api/creador/mi-perfil`, profileData, {
      headers: { 'Authorization': 'Bearer ' + token }
    }).pipe(
      timeout(5000)
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
}
