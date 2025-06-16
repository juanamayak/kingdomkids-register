import {Component} from '@angular/core';
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {DatePipe} from '@angular/common';
import {FloatLabelModule} from 'primeng/floatlabel';
import {InputTextModule} from 'primeng/inputtext';
import {DatePickerModule} from 'primeng/datepicker';
import {CheckboxModule} from 'primeng/checkbox';
import {RadioButtonModule} from 'primeng/radiobutton';
import {FormsModule, NgControl, ReactiveFormsModule} from '@angular/forms';

@Component({
    selector: 'app-register',
    imports: [
        ButtonModule,
        CardModule,
        FloatLabelModule,
        InputTextModule,
        DatePickerModule,
        CheckboxModule,
        RadioButtonModule,
        ReactiveFormsModule,
        FormsModule,
        DatePipe
    ],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent {
    public currentDate = new Date();
}
