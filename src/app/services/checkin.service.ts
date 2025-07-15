import {inject, Injectable} from '@angular/core';
import {environment} from '../../environments/environment.development';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckinService {
    public urlApi: string = environment.urlApi;
    private httpClient = inject(HttpClient);

    constructor() {
    }

    public registerCheckin(data: any): Observable<any> {
        return this.httpClient.post(`${this.urlApi}/checkin`, data);
    }
}
