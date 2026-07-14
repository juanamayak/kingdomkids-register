import {Component, inject, effect} from '@angular/core';
import {input} from '@angular/core';
import {Router} from '@angular/router';
import {MessageModule} from 'primeng/message';
import {ButtonModule} from 'primeng/button';
import {TagModule} from 'primeng/tag';
import {KidsService, KidDetail} from '../../services/kids.service';
import {CheckinService} from '../../services/checkin.service';
import {AlertsService} from '../../services/alerts.service';
import {signal, computed} from '@angular/core';

@Component({
    selector: 'app-verification',
    imports: [MessageModule, ButtonModule, TagModule],
    templateUrl: './verification.component.html',
    styleUrl: './verification.component.scss'
})
export class VerificationComponent {

    // P6: input signal moderno en lugar de @Input() con any
    id = input<string>('');

    private kidsService = inject(KidsService);
    private checkinService = inject(CheckinService);
    private alertsService = inject(AlertsService);
    private router = inject(Router);

    // P6: tipado estricto, cero any
    registro = signal<KidDetail | null>(null);
    isLoading = signal(false);
    isSubmitting = signal(false);

    tieneAlertas = computed(() => {
        const r = this.registro();
        return r && (r.allergy === 1 || r.medical_condition === 1);
    });

    constructor() {
        // P6: efecto reactivo al input en lugar de ngOnInit
        effect(() => {
            const kidId = this.id();
            if (kidId) {
                this.cargarRegistro(kidId);
            }
        });
    }

    private cargarRegistro(id: string): void {
        this.isLoading.set(true);

        this.kidsService.getKidRegister(id).subscribe({
            next: (res) => {
                this.isLoading.set(false);
                this.registro.set(res.kid);
            },
            error: (err) => {
                this.isLoading.set(false);
                console.error('Error al cargar registro:', err);
                this.alertsService.errorAlert('No se encontró el registro indicado.');
            }
        });
    }

    registrarEntrada(): void {
        const reg = this.registro();
        if (!reg) return;

        this.isSubmitting.set(true);

        this.checkinService.registerCheckin({register_id: reg.id}).subscribe({
            next: (res) => {
                this.isSubmitting.set(false);
                this.alertsService.successAlert(res.message).then(() => {
                    this.router.navigate(['/scanner']);
                });
            },
            error: (err) => {
                this.isSubmitting.set(false);
                this.alertsService.errorAlert(err?.error?.errors ?? 'Error al registrar la entrada.');
            }
        });
    }
}
