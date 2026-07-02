import { Component, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DatePipe } from '@angular/common';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import {
    AbstractControl,
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { Months } from '../../constants/months';
import { KidsService, RegisterPayload } from '../../services/kids.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Router } from '@angular/router';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageModule } from 'primeng/message';
import { differenceInYears, parseISO } from 'date-fns';

interface ParentFormControls {
    full_name: FormControl<string>;
    email: FormControl<string>;
    cellphone: FormControl<string>;
    type: FormControl<string>;
}

interface AuthorizedPersonFormControls {
    full_name: FormControl<string>;
    cellphone: FormControl<string>;
    relationship: FormControl<string>;
}

const ALLOWED_AGES = [5, 6, 7, 8, 9, 10, 11];

@Component({
    selector: 'app-register',
    imports: [
        ButtonModule,
        CardModule,
        FloatLabelModule,
        InputTextModule,
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
export class RegisterComponent {

    private kidsService = inject(KidsService);
    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private router = inject(Router);

    public isLoading = signal(false);
    public ageWarning = signal<string | null>(null);

    public currentDate = new Date();
    public months = Months;
    public days = this.generateDays();
    public years = this.generateYears();

    public registerForm = this.buildForm();

    private buildForm() {
        return this.fb.group({
            name: this.fb.nonNullable.control('', Validators.required),
            lastname: this.fb.nonNullable.control('', Validators.required),
            birthday_day: this.fb.nonNullable.control('', Validators.required),
            birthday_month: this.fb.nonNullable.control('', Validators.required),
            birthday_year: this.fb.nonNullable.control('', Validators.required),
            birthday: this.fb.nonNullable.control(''),
            age: this.fb.control<number | null>(null),
            address: this.fb.nonNullable.control('', Validators.required),
            parents: this.fb.array([
                this.buildParentGroup('Mamá'),
                this.buildParentGroup('Papá'),
            ]),
            authorized_person: this.fb.array([
                this.buildAuthorizedGroup(),
                this.buildAuthorizedGroup(),
            ]),
            allergy: this.fb.control<number | null>(null, Validators.required),
            allergy_description: this.fb.nonNullable.control(''),
            medical_condition: this.fb.control<number | null>(null, Validators.required),
            medical_condition_description: this.fb.nonNullable.control(''),
            mdf_member: this.fb.control<number | null>(null, Validators.required),
            another_church: this.fb.control<number | null>(null, Validators.required),
            another_church_name: this.fb.nonNullable.control(''),
            invited: this.fb.control<number | null>(null, Validators.required),
            invite_name: this.fb.nonNullable.control(''),
            terms_condition: this.fb.nonNullable.control(false, Validators.requiredTrue),
        });
    }

    private buildParentGroup(type: string): FormGroup<ParentFormControls> {
        return this.fb.group<ParentFormControls>({
            full_name: this.fb.nonNullable.control('', Validators.required),
            email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
            cellphone: this.fb.nonNullable.control('', Validators.required),
            type: this.fb.nonNullable.control(type, Validators.required),
        });
    }

    private buildAuthorizedGroup(): FormGroup<AuthorizedPersonFormControls> {
        return this.fb.group<AuthorizedPersonFormControls>({
            full_name: this.fb.nonNullable.control(''),
            cellphone: this.fb.nonNullable.control(''),
            relationship: this.fb.nonNullable.control(''),
        });
    }

    private generateDays(): string[] {
        return Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
    }

    private generateYears(): string[] {
        const currentYear = new Date().getFullYear();
        const minBirthYear = currentYear - 11;
        const maxBirthYear = currentYear - 5;
        const years: string[] = [];
        for (let y = maxBirthYear; y >= minBirthYear; y--) {
            years.push(String(y));
        }
        return years;
    }

    private computeAge(): number {
        const year = this.registerForm.get('birthday_year')!.value;
        const month = this.registerForm.get('birthday_month')!.value;
        const day = this.registerForm.get('birthday_day')!.value;
        if (!year || !month || !day) return -1;
        const birthdate = parseISO(`${year}-${month}-${day}`);
        return differenceInYears(new Date(), birthdate);
    }

    // Llamado desde el template cuando cualquier parte de la fecha cambia
    onBirthdayChange(): void {
        const year = this.registerForm.get('birthday_year')!.value;
        const month = this.registerForm.get('birthday_month')!.value;
        const day = this.registerForm.get('birthday_day')!.value;
        if (!year || !month || !day) return;

        const age = this.computeAge();
        if (!ALLOWED_AGES.includes(age)) {
            this.ageWarning.set(`La edad calculada es ${age} año(s). Solo se aceptan niños de 5 a 11 años.`);
        } else {
            this.ageWarning.set(null);
        }
    }

    onAllergyChange(value: number): void {
        const control = this.registerForm.get('allergy_description')!;
        if (value === 1) {
            control.addValidators(Validators.required);
        } else {
            control.clearValidators();
            control.setValue('');
        }
        control.updateValueAndValidity();
    }

    onMedicalConditionChange(value: number): void {
        const control = this.registerForm.get('medical_condition_description')!;
        if (value === 1) {
            control.addValidators(Validators.required);
        } else {
            control.clearValidators();
            control.setValue('');
        }
        control.updateValueAndValidity();
    }

    onAnotherChurchChange(value: number): void {
        const control = this.registerForm.get('another_church_name')!;
        if (value === 1) {
            control.addValidators(Validators.required);
        } else {
            control.clearValidators();
            control.setValue('');
        }
        control.updateValueAndValidity();
    }

    onInvitedChange(value: number): void {
        const control = this.registerForm.get('invite_name')!;
        if (value === 1) {
            control.addValidators(Validators.required);
        } else {
            control.clearValidators();
            control.setValue('');
        }
        control.updateValueAndValidity();
    }

    // Devuelve true si el campo del formulario principal es inválido y fue tocado
    isInvalid(field: string): boolean {
        const control = this.registerForm.get(field);
        return !!(control?.invalid && control?.touched);
    }

    // Devuelve true si un campo dentro del FormArray de padres es inválido y fue tocado
    isParentInvalid(index: number, field: string): boolean {
        const control = this.parents.at(index).get(field);
        return !!(control?.invalid && control?.touched);
    }

    // Devuelve el mensaje de error del campo dentro del FormArray de padres
    getParentError(index: number, field: string): string {
        const control = this.parents.at(index).get(field);
        if (control?.errors?.['required']) return 'Este campo es obligatorio.';
        if (control?.errors?.['email']) return 'Ingresa un correo electrónico válido.';
        return '';
    }

    register(): void {
        // Muestra todos los errores de validación si el formulario está incompleto
        if (this.registerForm.invalid) {
            this.registerForm.markAllAsTouched();
            this.messageService.add({
                severity: 'warn',
                summary: 'Formulario incompleto',
                detail: 'Por favor, completa todos los campos obligatorios.',
                life: 5000,
            });
            return;
        }

        const age = this.computeAge();
        if (!ALLOWED_AGES.includes(age)) {
            this.messageService.add({
                severity: 'error',
                summary: 'Edad no permitida',
                detail: `La edad del niño/a es ${age} año(s). El rango permitido es de 5 a 11 años.`,
                sticky: true,
            });
            return;
        }

        const year = this.registerForm.get('birthday_year')!.value;
        const month = this.registerForm.get('birthday_month')!.value;
        const day = this.registerForm.get('birthday_day')!.value;
        this.registerForm.get('birthday')!.setValue(`${year}-${month}-${day}`);
        this.registerForm.get('age')!.setValue(age);

        this.isLoading.set(true);
        this.registerForm.disable();

        const data = this.registerForm.getRawValue() as RegisterPayload;

        this.kidsService.register(data).subscribe({
            next: (response) => {
                this.isLoading.set(false);
                this.router.navigate(['success', response.register.id]);
            },
            error: (err: { error: { errors: { message: string }[] } }) => {
                this.isLoading.set(false);
                this.registerForm.enable();
                for (const error of err.error.errors) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.message,
                        sticky: true,
                    });
                }
            }
        });
    }

    get parents(): FormArray<FormGroup<ParentFormControls>> {
        return this.registerForm.get('parents') as FormArray<FormGroup<ParentFormControls>>;
    }

    get authorized_person(): FormArray<FormGroup<AuthorizedPersonFormControls>> {
        return this.registerForm.get('authorized_person') as FormArray<FormGroup<AuthorizedPersonFormControls>>;
    }

    get allergy(): AbstractControl {
        return this.registerForm.get('allergy')!;
    }

    get medical_condition(): AbstractControl {
        return this.registerForm.get('medical_condition')!;
    }

    get mdf_member(): AbstractControl {
        return this.registerForm.get('mdf_member')!;
    }

    get another_church(): AbstractControl {
        return this.registerForm.get('another_church')!;
    }

    get invited(): AbstractControl {
        return this.registerForm.get('invited')!;
    }
}
