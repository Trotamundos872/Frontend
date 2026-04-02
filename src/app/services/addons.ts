import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Addon } from '../models/addon.model';



@Injectable({
  providedIn: 'root',
})

export class Addons {
    private baseUrl = 'https://localhost:8443/api/addon';

    constructor(private http: HttpClient) {}

  public getAll(): Observable<Addon[]> {
    return this.http.get<Addon[]>(`${this.baseUrl}`);
  }

    public getAddonById(id: string): Observable<Addon> {
    return this.http.get<Addon>(`${this.baseUrl}/${id}`);
  }
}
