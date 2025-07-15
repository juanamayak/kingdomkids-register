import {inject, Injectable} from '@angular/core';
import Swal from 'sweetalert2';
import {Observable} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class AlertsService {

    successAlert(message: string) {
        const confirmation = Swal.fire({
            title: '¡Proceso exitoso!',
            text: message,
            icon: 'success',
            confirmButtonText: 'Continuar',
            allowOutsideClick: false,
            customClass: {
                popup: 'rounded-xl',
                container: 'pt-0',
                confirmButton: 'text-white bg-green-600 rounded-lg px-3 py-2 text-center mr-2',
            },
            buttonsStyling: false,
            heightAuto: false,
        });

        return confirmation;
    }

    errorAlert(messages: any) {
        let msg;
        messages.forEach((m: any) => {
            msg = m.message;
        });

        Swal.fire({
            title: 'Ups, algo salió mal',
            text: msg,
            icon: 'error',
            confirmButtonText: 'Ok',
            allowOutsideClick: false,
            customClass: {
                popup: 'rounded-xl',
                container: 'pt-0',
                confirmButton:
                    'text-white bg-red-500 rounded-lg px-3 py-2 text-center',
            },
            buttonsStyling: false,
            heightAuto: false,
        });
    }

    confirmRequest(message: string) {
        const confirmation = Swal.fire({
            title: message,
            text: "This action cannot be reversed",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Continue',
            cancelButtonText: 'Cancel',
            allowOutsideClick: false,
            customClass: {
                popup: 'rounded-xl',
                title: 'text-xl px-14',
                confirmButton: 'text-white bg-green-600 rounded-lg px-3 py-2 text-center mr-2',
                cancelButton: 'text-white bg-red-500 rounded-lg px-3 py-2 text-center'
            },
            buttonsStyling: false,
            heightAuto: false
        });

        return confirmation;
    }

    confirmDelete(message: string) {
        const confirmation = Swal.fire({
            title: message,
            text: 'Esta acción no se puede revertir',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Continuar',
            cancelButtonText: 'Cancel',
            allowOutsideClick: false,
            customClass: {
                confirmButton:
                    'text-white bg-red-700 rounded-lg px-3 py-2 text-center mr-2',
                cancelButton:
                    'text-white bg-slate-400 rounded-lg px-3 py-2 text-center',
            },
            buttonsStyling: false,
            heightAuto: false,
        });

        return confirmation;
    }
}
