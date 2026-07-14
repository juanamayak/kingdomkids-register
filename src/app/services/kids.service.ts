import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RegisterResponse {
    register: { id: number };
}

export interface ConfirmationResponse {
    register: {
        id: number;
        name: string;
        lastname: string;
        birthday: string;
        age: number;
        address: string;
        allergy: number;
        allergy_description: string;
        medical_condition: number;
        medical_condition_description: string;
    };
    qr: string;
}

export interface Parent {
    full_name: string;
    email: string;
    cellphone: string;
    type: string;
}

export interface AuthorizedPerson {
    full_name: string;
    cellphone: string;
    relationship: string;
}

export interface KidDetail {
    id: number;
    name: string;
    lastname: string;
    birthday: string;
    age: number;
    allergy: number;
    allergy_description: string;
    medical_condition: number;
    medical_condition_description: string;
    parents: Parent[];
    authorized: AuthorizedPerson[];
}

export interface KidResponse {
    kid: KidDetail;
}

export interface RegisterPayload {
    name: string;
    lastname: string;
    birthday: string;
    age: number | null;
    address: string;
    parents: { full_name: string; email: string; cellphone: string; type: string }[];
    authorized_person: { full_name: string; cellphone: string; relationship: string }[];
    allergy: number | null;
    allergy_description: string;
    medical_condition: number | null;
    medical_condition_description: string;
    mdf_member: number | null;
    another_church: number | null;
    another_church_name: string;
    invited: number | null;
    invite_name: string;
    terms_condition: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class KidsService {
    private urlApi = environment.urlApi;
    private httpClient = inject(HttpClient);

    public register(data: RegisterPayload): Observable<RegisterResponse> {
        return this.httpClient.post<RegisterResponse>(`${this.urlApi}/register`, data);
    }

    public getConfirmationRegister(id: number | string): Observable<ConfirmationResponse> {
        return this.httpClient.get<ConfirmationResponse>(`${this.urlApi}/register/confirmation/${id}`);
    }

    public getKidRegister(id: number | string): Observable<KidResponse> {
        return this.httpClient.get<KidResponse>(`${this.urlApi}/register/${id}`);
    }
}
