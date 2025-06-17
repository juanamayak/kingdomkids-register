import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment.development';

@Injectable({
    providedIn: 'root'
})
export class KidsService {
    public urlApi: string = environment.urlApi;
    private httpClient = inject(HttpClient);

    constructor() {
    }

    public register(data: any): Observable<any> {
        return this.httpClient.post(`${this.urlApi}/register`, data);
    }
}
