import {Component, inject, Input, OnInit} from '@angular/core';
import {KidsService} from '../../services/kids.service';
import {MessageModule} from 'primeng/message';
import {ButtonModule} from 'primeng/button';
import {CheckinService} from '../../services/checkin.service';
import {Router} from '@angular/router';
import {AlertsService} from '../../services/alerts.service';

@Component({
    selector: 'app-verification',
    imports: [
        MessageModule,
        ButtonModule
    ],
    templateUrl: './verification.component.html',
    styleUrl: './verification.component.scss'
})
export class VerificationComponent implements OnInit {

    @Input() id: any;

    private kidsService = inject(KidsService);
    private checkinService = inject(CheckinService);
    private alertsService = inject(AlertsService);
    private router = inject(Router);

    public register: any;
    public alert = false;

    ngOnInit() {
        this.getRegister(this.id);
    }

    getRegister(id: any) {
        this.kidsService.getKidRegister(id).subscribe({
            next: res => {
                this.alert = true;
                this.register = res.kid;
                setTimeout(() => {
                    this.alert = false;
                }, 2500);
            },
            error: err => {
                console.log(err);
            }
        })
    }

    checkin(registerId: any) {
        const data = {
            register_id: registerId
        }

        this.checkinService.registerCheckin(data).subscribe({
            next: res => {
                this.alertsService.successAlert(res.message);
                setTimeout(() => {
                    this.router.navigate(['/scanner'])
                }, 2500);
            },
            error: err => {
                this.alertsService.errorAlert(err.error.errors);
            }
        })
    }

}
