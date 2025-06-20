import {Component, inject, OnInit} from '@angular/core';
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {DatePipe} from '@angular/common';
import {FloatLabelModule} from 'primeng/floatlabel';
import {InputTextModule} from 'primeng/inputtext';
import {DatePickerModule} from 'primeng/datepicker';
import {CheckboxModule} from 'primeng/checkbox';
import {RadioButtonModule} from 'primeng/radiobutton';
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Select, SelectModule} from 'primeng/select';
import {InputGroupModule} from 'primeng/inputgroup';
import {InputGroupAddonModule} from 'primeng/inputgroupaddon';
import {Months} from '../../constants/months';
import {KidsService} from '../../services/kids.service';
import moment from 'moment';
import {MessageService} from 'primeng/api';
import {ToastModule} from 'primeng/toast';
import {Router} from '@angular/router';
import {IconFieldModule} from 'primeng/iconfield';
import {InputIconModule} from 'primeng/inputicon';
import {MessageModule} from 'primeng/message';

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
        InputGroupModule,
        InputGroupAddonModule,
        SelectModule,
        IconFieldModule,
        InputIconModule,
        ToastModule,
        FormsModule,
        MessageModule,
        DatePipe,
    ],
    providers: [MessageService],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {

    private kidsService = inject(KidsService);
    private formBuilder = inject(FormBuilder);
    private messageService = inject(MessageService);
    private router = inject(Router);

    public registerForm: any;

    public currentDate = new Date();

    public isLoading = false;

    public months = Months
    public years: any;

    ngOnInit() {
        this.years = this.getYears();
        this.initRegisterForm();
    }

    initRegisterForm() {
        this.registerForm = this.formBuilder.group({
            name: ['', Validators.required],
            lastname: ['', Validators.required],
            birthday_day: ['', Validators.required],
            birthday_month: ['', Validators.required],
            birthday_year: ['', Validators.required],
            birthday: [''],
            age: [''],
            address: ['', Validators.required],
            parents: this.formBuilder.array([
                this.formBuilder.group({
                    full_name: ['', Validators.required],
                    email: ['', Validators.required],
                    cellphone: ['', Validators.required],
                    type: ['Mamá', Validators.required],
                }),
                this.formBuilder.group({
                    full_name: ['', Validators.required],
                    email: ['', Validators.required],
                    cellphone: ['', Validators.required],
                    type: ['Papá', Validators.required],
                })
            ]),
            authorized_person: this.formBuilder.array([
                this.formBuilder.group({
                    full_name: [''],
                    cellphone: [''],
                    relationship: [''],
                }),
                this.formBuilder.group({
                    full_name: [''],
                    cellphone: [''],
                    relationship: [''],
                })
            ]),
            allergy: [null, Validators.required],
            allergy_description: [''],
            medical_condition: [null, Validators.required],
            medical_condition_description: [''],
            mdf_member: [null, Validators.required],
            another_church: [null, Validators.required],
            another_church_name: [''],
            invited: [null, Validators.required],
            invite_name: [''],
            terms_condition: ['', Validators.required],
        });
    }

    register() {
        this.isLoading = true;
        this.registerForm.disable();

        const year = this.registerForm.get('birthday_year').value;
        const month = this.registerForm.get('birthday_month').value;
        const day = this.registerForm.get('birthday_day').value;
        this.registerForm.controls.birthday.setValue(moment(year + '-' + month + '-' + day).format('YYYY-MM-DD'));

        const birthdate = new Date(moment(year + '-' + month + '-' + day).format('YYYY-MM-DD'));
        var timeDiff = Math.abs(Date.now() - birthdate.getTime());
        let age = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365.25);
        const allowAges = [5, 6, 7, 8, 9, 10, 11];
        if (allowAges.includes(age)) {
            this.registerForm.controls.age.setValue(age);
            const data = this.registerForm.value;
            this.kidsService.register(data).subscribe({
                next: data => {
                    this.isLoading = false;
                    this.router.navigate(['success', data.register.id]);
                },
                error: err => {
                    this.isLoading = false;
                    this.registerForm.enable();
                    for (const error of err.error.errors) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.message,
                            sticky: true
                        });
                    }

                }
            });
        } else {
            this.isLoading = false;
            this.registerForm.enable();
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: `La edad del niño/a es ${age}. No cumple con el rango de edades permitidos para el registro.`,
                sticky: true,
            });
        }
    }

    calculateAge() {
        const year = this.registerForm.get('birthday_year').value;
        const month = this.registerForm.get('birthday_month').value;
        const day = this.registerForm.get('birthday_day').value;
        const birthdate = new Date(moment(year + '-' + month + '-' + day).format('YYYY-MM-DD'));
        var timeDiff = Math.abs(Date.now() - birthdate.getTime());
        let age = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365.25);
        const allowAges = [5, 6, 7, 8, 9, 10, 11];
        if (!allowAges.includes(age)) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: `La edad del niño/a es ${age}. No cumple con el rango de edades permitidos para el registro.`,
                sticky: true
            });
        }
    }

    private getYears() {
        const years = [];
        const dateStart = moment('2009-01-01');
        const dateEnd = moment().add(30, 'y');
        while (dateEnd.diff(dateStart, 'years') >= 0) {
            years.push(dateStart.format('YYYY'));
            dateStart.add(1, 'year');
        }
        return years;
    }

    get parents() {
        return this.registerForm.get("parents") as FormArray
    }

    get allergy() {
        return this.registerForm.get("allergy");
    }

    get medical_condition() {
        return this.registerForm.get("medical_condition");
    }

    get mdf_member() {
        return this.registerForm.get("mdf_member");
    }

    get another_church() {
        return this.registerForm.get("another_church");
    }

    get invited() {
        return this.registerForm.get("invited");
    }

    get authorized_person() {
        return this.registerForm.get("authorized_person") as FormArray
    }


}
