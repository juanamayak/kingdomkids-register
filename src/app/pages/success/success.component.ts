import {Component, ElementRef, inject, Input, OnInit, ViewChild} from '@angular/core';
import {KidsService} from '../../services/kids.service';
import {MessageService} from 'primeng/api';
import {DatePipe} from '@angular/common';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {RouterLink} from '@angular/router';
import {ButtonModule} from 'primeng/button';

@Component({
    selector: 'app-success',
    imports: [
        DatePipe,
        RouterLink,
        ButtonModule
    ],
    providers: [MessageService],
    templateUrl: './success.component.html',
    styleUrl: './success.component.scss'
})
export class SuccessComponent implements OnInit {

    @ViewChild('qrImg') qrImg: any;

    @Input() id: any;

    private kidsService = inject(KidsService);
    private messageService = inject(MessageService);

    public currentDate = new Date();

    public register: any;
    public qr: any;

    ngOnInit() {
        this.getRegister();
    }

    getRegister() {
        this.kidsService.getConfirmationRegister(this.id).subscribe({
            next: data => {
                this.register = data.register;
                this.qr = data.qr;
            },
            error: err => {
                console.log(err);
            }
        });
    }

    public generatePDF(): void {
        html2canvas(this.qrImg.nativeElement).then((canvas) => {
            const imageGeneratedFromTemplate = canvas.toDataURL('image/png');

            let PDF = new jsPDF('p', 'mm', 'a6',);
            var imgData = 'data:image/jpeg;base64,' + this.qr;

            PDF.setFontSize(15);
            PDF.text('ESCUELA DE VERANO 2024', 5, 10);
            PDF.setFontSize(12);
            PDF.text('22 AL 26 DE JULIO', 5, 15);

            PDF.setFontSize(7);
            PDF.text('Edades: de 5 a 11 años', 5, 20);
            PDF.text('Horario: Lunes a Viernes de 09:00 a 13:00 hrs', 5, 23);
            PDF.text('Entrada: Av. 35 Entre Calle 1 y 3 Sur', 5, 26);
            PDF.text('EVENTO TOTALMENTE GRATUITO', 5, 29);

            PDF.setFontSize(7);
            PDF.text('DURANTE LA SEMANA LOS NIÑOS DEBEN TRAER:', 5, 35);
            PDF.text('- Lunch y botella de agua con sus nombres escritos.', 6, 38);
            PDF.text('- Si son hermanos traer el lunch por separado, también con su nombre.', 6, 41);
            PDF.text('- Tenis y ropa cómoda.', 6, 44);

            PDF.setFontSize(7);
            PDF.text('IMPORTANTE:', 5, 50);
            let importanteText = 'Si tu niño(a) presenta gripa, tos, fiebre. Deberá quedarse en casa. ' +
                'En caso de detectar síntomas durante la escuela, nos comunicaremos contigo. ' +
                'También agradecemos nos hagas saber si tu niño(a) tiene alergias o alguna condición de salud. ';
            let lines = PDF.splitTextToSize(importanteText, 90);
            PDF.text(lines, 5, 53);

            let importantText2 = 'Diariamente al llegar a recepción debes estar presente con ellos para recibir el pase con el que podrán recogerlos a la salida.'
            let lines2 = PDF.splitTextToSize(importantText2, 90);
            PDF.text(lines2, 5, 65);

            let importantText3 = 'EL QR es su acceso diario. Te invitamos a descargarlo al registrarse en línea y tenerlo listo al momento de llegar a recepción.'
            let lines3 = PDF.splitTextToSize(importantText3, 90);
            PDF.text(lines3, 5, 75);

            PDF.addImage(imgData, 'JPEG', 30, 80, 40, 40);
            PDF.setFontSize(7);
            PDF.text('¡Apóyanos donando una bolsa de dulces! Podrás entregarlos en el área de registro.', 6, 125);

            PDF.setFontSize(12);
            PDF.text('GRAN CLAUSURA ¡PARA TODA LA FAMILIA!', 8, 135);
            PDF.text('SÁBADO 27 de JULIO A LAS 7PM', 15, 140);

            /*PDF.setFontSize(9);
            PDF.text('Mundo de Fe Playa del Carmen', 5, 100);*/
            PDF.save(`${this.register.name} QR.pdf`);
        });
    }
}
