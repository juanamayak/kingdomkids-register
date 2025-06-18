import {Component, inject, Input, OnInit} from '@angular/core';
import {KidsService} from '../../services/kids.service';
import {MessageService} from 'primeng/api';
import {DatePipe} from '@angular/common';

@Component({
    selector: 'app-success',
    imports: [
        DatePipe
    ],
    providers: [MessageService],
    templateUrl: './success.component.html',
    styleUrl: './success.component.scss'
})
export class SuccessComponent implements OnInit {

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
        })
    }
}
