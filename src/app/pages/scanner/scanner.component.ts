import {AfterViewInit, Component, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {NgxScannerQrcodeComponent} from 'ngx-scanner-qrcode';
import {Html5Qrcode} from 'html5-qrcode';
import {JsonPipe} from '@angular/common';

@Component({
    selector: 'app-scanner',
    imports: [],
    templateUrl: './scanner.component.html',
    styleUrl: './scanner.component.scss'
})
export class ScannerComponent implements AfterViewInit, OnDestroy {

    @ViewChild('scanner', {static: true}) cameraScanner: any;

    private router = inject(Router);

    // Usa facingMode 'environment' para cámara trasera
    cameraConstraints: MediaStreamConstraints = {
        video: {
            facingMode: {exact: 'environment'} // o exact si quieres forzar
        }
    };

    devices: any[] = [];
    selectedDeviceId: string | null = null;

    private html5QrCode!: Html5Qrcode;

    async ngAfterViewInit() {
        this.html5QrCode = new Html5Qrcode("reader");

        const devices = await Html5Qrcode.getCameras();

        // Palabras clave que pueden aparecer en la etiqueta (en distintos idiomas/navegadores)
        const backCameraKeywords = [
            'back', 'rear', 'environment',      // Inglés
            'cámara trasera', 'camara trasera', // Español
            'cámara posterior', 'camara posterior',
            'cámara principal', 'camara principal'
        ];

        // Intentar encontrar la cámara trasera por label
        let backCamera = devices.find(d =>
            d.label && backCameraKeywords.some(k => d.label.toLowerCase().includes(k))
        );

        // Si no encontramos ninguna por nombre, usamos la última (suele ser trasera en móviles)
        if (!backCamera) {
            backCamera = devices[devices.length - 1];
        }

        this.html5QrCode.start(
            backCamera.id,
            {
                fps: 10,
                qrbox: {width: 250, height: 250}
            },
            (decodedText) => {
                // this.html5QrCode.stop();
                this.router.navigate([decodedText])
                // navegar o manejar el resultado
            },
            (errorMessage) => {
                // console.warn("No se detectó QR", errorMessage);
            }
        );
    }

    ngOnDestroy() {
        this.html5QrCode?.stop().catch(() => {
        });
    }

    /*async ngOnInit() {
        this.cameraScanner.start();
        // ✅ Aplica cámara trasera después de iniciar
        await this.cameraScanner.applyConstraints({
            video: {
                facingMode: { ideal: 'environment' }  // o ideal
            }
        });

        console.log(this.cameraScanner);
    }

    captureQRData(event: any){
        if (event){
            this.cameraScanner.stop()
            this.router.navigate([event[0].value])
        }
    }*/
}
