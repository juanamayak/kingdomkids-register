import {inject, Injectable} from '@angular/core';
import {environment} from '../../environments/environment.development';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

export interface CheckinPayload {
    register_id: number;
}

export interface CheckinResponse {
    message: string;
}

export interface CheckinRecord {
    id: number;
    uuid: string;
    kid_id: number;
    checkin_date: string;
    checkout_date: string | null;
    status: number | null;
    createdAt: string;
}

export interface CheckinsResponse {
    ok: boolean;
    checkins: CheckinRecord[];
}

// Estado del check-in del niño en el día actual
export type CheckinStatus = 'sin_entrada' | 'con_entrada' | 'completo';

export interface CheckinDayStatus {
    status: CheckinStatus;
    checkinId: number | null;
    entradaHora: string | null;
    salidaHora: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class CheckinService {
    public urlApi: string = environment.urlApi;
    private httpClient = inject(HttpClient);

    public registerCheckin(data: CheckinPayload): Observable<CheckinResponse> {
        return this.httpClient.post<CheckinResponse>(`${this.urlApi}/checkin`, data);
    }

    public getCheckinsByKid(registerId: number): Observable<CheckinsResponse> {
        return this.httpClient.get<CheckinsResponse>(`${this.urlApi}/checkinAndOut/index/${registerId}`);
    }
}
