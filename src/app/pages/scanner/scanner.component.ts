import {Component, inject, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {NgxScannerQrcodeComponent} from 'ngx-scanner-qrcode';

@Component({
  selector: 'app-scanner',
  imports: [
      NgxScannerQrcodeComponent
  ],
  templateUrl: './scanner.component.html',
  styleUrl: './scanner.component.scss'
})
export class ScannerComponent implements OnInit{

    @ViewChild('scanner', {static: true}) cameraScanner: any;

    private router = inject(Router);

    ngOnInit(): void {
        this.cameraScanner.start();
    }

    captureQRData(event: any){
        if (event){
            this.cameraScanner.stop()
            this.router.navigate([event])
        }
    }
}
