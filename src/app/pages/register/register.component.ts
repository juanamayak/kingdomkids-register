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
        FormsModule,
        DatePipe,
    ],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {

    private formBuilder = inject(FormBuilder);

    public registerForm: any;

    public currentDate = new Date();
    public ingredient!: string;

    public months = Months


    ngOnInit() {
        this.initRegisterForm();
    }

    initRegisterForm(){
        this.registerForm = this.formBuilder.group({
            name: ['', Validators.required],
            lastname: ['', Validators.required],
            birthday_day: ['', Validators.required],
            birthday_month: ['', Validators.required],
            birthday_year: ['', Validators.required],
            birthday: ['', Validators.required],
            age: ['', Validators.required],
            address: ['', Validators.required],
            parents: this.formBuilder.array([
                this.formBuilder.group({
                    full_name: ['', Validators.required],
                    cellphone: ['', Validators.required],
                    type: ['MAMA', Validators.required],
                }),
                this.formBuilder.group({
                    full_name: ['', Validators.required],
                    cellphone: ['', Validators.required],
                    type: ['PAPA', Validators.required],
                })
            ]),
            authorized_person: this.formBuilder.array([
                this.formBuilder.group({
                    full_name: ['', Validators.required],
                    cellphone: ['', Validators.required],
                    relationship: ['', Validators.required],
                }),
                this.formBuilder.group({
                    full_name: ['', Validators.required],
                    cellphone: ['', Validators.required],
                    relationship: ['', Validators.required],
                })
            ]),
            allergy: ['', Validators.required],
            allergy_description: ['', Validators.required],
            medical_condition: ['', Validators.required],
            medical_condition_description: ['', Validators.required],
            mdf_member: ['', Validators.required],
            another_church: ['', Validators.required],
            another_church_name: ['', Validators.required],
            invited: ['', Validators.required],
            invite_name: ['', Validators.required],
        });
    }

    register(){
        console.log(this.registerForm.value);
    }

    get parents() {
        return this.registerForm.get("parents") as FormArray
    }

    get authorized_person() {
        return this.registerForm.get("authorized_person") as FormArray
    }


}
