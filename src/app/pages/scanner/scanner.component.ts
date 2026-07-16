import {
    Component, inject, OnDestroy, AfterViewInit,
    signal, computed
} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Html5Qrcode} from 'html5-qrcode';
import {Subscription, interval} from 'rxjs';
import {switchMap, startWith} from 'rxjs/operators';
import {DrawerModule} from 'primeng/drawer';
import {ButtonModule} from 'primeng/button';
import {TagModule} from 'primeng/tag';
import {ToastModule} from 'primeng/toast';
import {MessageService} from 'primeng/api';
import {KidsService, KidDetail} from '../../services/kids.service';
import {
    CheckinService,
    CheckinDayStatus,
    CheckinStatus,
    CheckinRecord
} from '../../services/checkin.service';
import {environment} from '../../../environments/environment.development';

type ScannerStatus = 'activo' | 'error-camara';

@Component({
    selector: 'app-scanner',
    imports: [DrawerModule, ButtonModule, TagModule, ToastModule],
    providers: [MessageService],
    templateUrl: './scanner.component.html',
    styleUrl: './scanner.component.scss'
})
export class ScannerComponent implements AfterViewInit, OnDestroy {

    private html5QrCode!: Html5Qrcode;
    private kidsService = inject(KidsService);
    private checkinService = inject(CheckinService);
    private messageService = inject(MessageService);
    private httpClient = inject(HttpClient);

    // ── Estado del escáner ──────────────────────────────────────────────────
    scannerStatus = signal<ScannerStatus>('activo');
    isProcessing = signal(false); // P4: flag de deduplicación

    // ── Estado del drawer ───────────────────────────────────────────────────
    drawerVisible = signal(false);
    kid = signal<KidDetail | null>(null);
    isLoadingKid = signal(false);
    isSubmitting = signal(false);

    // ── P2: Estado del check-in del día ─────────────────────────────────────
    checkinDayStatus = signal<CheckinDayStatus | null>(null);
    isLoadingStatus = signal(false);

    // ── P7: Estado de conexión ──────────────────────────────────────────────
    isOnline = signal(true);
    private pingSubscription?: Subscription;

    // ── Computed: alertas médicas ────────────────────────────────────────────
    tieneAlertas = computed(() => {
        const k = this.kid();
        return k && (k.allergy === 1 || k.medical_condition === 1);
    });

    async ngAfterViewInit() {
        this.iniciarPingConexion(); // P7
        await this.iniciarScanner();
    }

    // ── P7: Ping periódico a la API para detectar conectividad ───────────────
    private iniciarPingConexion(): void {
        // Verifica conexión cada 15 segundos
        this.pingSubscription = interval(15_000).pipe(
            startWith(0),
            switchMap(() =>
                this.httpClient.get(`${environment.urlApi}/register/1`, { observe: 'response' }).pipe(
                    // Ignorar errores del ping (404 de ese recurso igual confirma que el server responde)
                )
            )
        ).subscribe({
            next: () => this.isOnline.set(true),
            error: (err) => {
                // Error de red (0) o CORS = sin conexión; 4xx/5xx = servidor activo
                this.isOnline.set(err.status !== 0);
            }
        });
    }

    // ── Scanner ──────────────────────────────────────────────────────────────
    private async iniciarScanner(): Promise<void> {
        try {
            // Crear la instancia solo la primera vez; reutilizarla en reinicios para
            // no reinyectar el DOM y evitar que el visor quede en blanco
            if (!this.html5QrCode) {
                this.html5QrCode = new Html5Qrcode('reader');
            }

            // facingMode evita llamar a getCameras() (que dispara getUserMedia internamente
            // y provoca el popup de permisos en cada visita a la ruta)
            await this.html5QrCode.start(
                {facingMode: 'environment'},
                {fps: 10, qrbox: {width: 250, height: 250}},
                (decodedText) => this.onQrDetectado(decodedText),
                () => { /* ignorar errores de frame */ }
            );

            this.scannerStatus.set('activo');
        } catch {
            this.scannerStatus.set('error-camara');
        }
    }


    // ── P4: Deduplicación ────────────────────────────────────────────────────
    private onQrDetectado(decodedText: string): void {
        // Ignorar lecturas mientras se procesa una o el drawer está abierto
        if (this.isProcessing() || this.drawerVisible()) return;

        const id = this.extraerIdDeQr(decodedText);

        if (id === null) {
            this.mostrarWarn('QR no reconocido', 'El código escaneado no corresponde a un registro válido.');
            return;
        }

        // P4: marcar como procesando ANTES de detener la cámara
        this.isProcessing.set(true);
        this.html5QrCode?.stop().catch(() => {});
        this.cargarDatosNino(id);
    }

    private extraerIdDeQr(decodedText: string): number | null {
        const segmentos = decodedText.split('/').filter(Boolean);
        const idStr = segmentos[segmentos.length - 1];
        const id = parseInt(idStr, 10);
        return isNaN(id) ? null : id;
    }

    // ── P2 + P5: Carga de datos del niño y estado del día ───────────────────
    private cargarDatosNino(id: number): void {
        this.isLoadingKid.set(true);

        this.kidsService.getKidRegister(id).subscribe({
            next: (res) => {
                this.kid.set(res.kid);
                this.isLoadingKid.set(false);
                this.drawerVisible.set(true);
                this.cargarEstadoDelDia(id); // P2: cargar estado en paralelo
            },
            error: (err) => {
                this.isLoadingKid.set(false);
                this.isProcessing.set(false); // liberar para próximo escaneo

                // P5: mensajes de error descriptivos según tipo de fallo
                if (err.status === 404) {
                    this.mostrarWarn('Niño no encontrado', 'Este código QR no corresponde a ningún registro en el sistema.');
                } else if (err.status === 0) {
                    this.mostrarError('Sin conexión', 'No hay conexión con el servidor. Verifica la red e intenta de nuevo.');
                    this.isOnline.set(false);
                } else {
                    this.mostrarError('Error inesperado', `Error ${err.status}: no se pudo obtener la información.`);
                }

                this.reanudarScanner();
            }
        });
    }

    // ── P2: Determinar el estado del check-in en el día actual ───────────────
    private cargarEstadoDelDia(kidId: number): void {
        this.isLoadingStatus.set(true);

        this.checkinService.getCheckinsByKid(kidId).subscribe({
            next: (res) => {
                this.isLoadingStatus.set(false);
                this.checkinDayStatus.set(this.calcularEstadoDelDia(res.checkins));
            },
            error: () => {
                this.isLoadingStatus.set(false);
                // No bloquear el flujo si falla la consulta de estado
                this.checkinDayStatus.set({status: 'sin_entrada', checkinId: null, entradaHora: null, salidaHora: null});
            }
        });
    }

    private calcularEstadoDelDia(checkins: CheckinRecord[]): CheckinDayStatus {
        const hoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // Filtrar checkins que ocurrieron hoy
        const hoyCheckins = checkins.filter(c => {
            const fechaCheckin = new Date(c.checkin_date).toISOString().split('T')[0];
            return fechaCheckin === hoy;
        });

        if (hoyCheckins.length === 0) {
            return {status: 'sin_entrada', checkinId: null, entradaHora: null, salidaHora: null};
        }

        // Tomar el registro más reciente del día
        const ultimo = hoyCheckins.sort(
            (a, b) => new Date(b.checkin_date).getTime() - new Date(a.checkin_date).getTime()
        )[0];

        const entradaHora = this.formatearHora(ultimo.checkin_date);

        if (!ultimo.checkout_date && (ultimo.status === null || ultimo.status === 1)) {
            return {status: 'con_entrada', checkinId: ultimo.id, entradaHora, salidaHora: null};
        }

        const salidaHora = ultimo.checkout_date ? this.formatearHora(ultimo.checkout_date) : null;
        return {status: 'completo', checkinId: ultimo.id, entradaHora, salidaHora};
    }

    private formatearHora(dateString: string): string {
        return new Date(dateString).toLocaleTimeString('es-MX', {hour: '2-digit', minute: '2-digit'});
    }

    // ── Acción: Registrar entrada ────────────────────────────────────────────
    registrarEntrada(): void {
        const kidData = this.kid();
        if (!kidData) return;

        this.isSubmitting.set(true);

        this.checkinService.registerCheckin({register_id: kidData.id}).subscribe({
            next: (_res) => {
                this.isSubmitting.set(false);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Entrada registrada',
                    detail: `${kidData.name} ${kidData.lastname} ingresó correctamente.`,
                    life: 4000
                });
                this.cerrarDrawer();
            },
            error: (err) => {
                this.isSubmitting.set(false);
                const msg = err?.error?.message ?? 'Ocurrió un error al registrar la entrada.';
                this.mostrarError('Error al registrar', msg);
            }
        });
    }

    cerrarDrawer(): void {
        this.drawerVisible.set(false);
        this.kid.set(null);
        this.checkinDayStatus.set(null);
        setTimeout(() => this.reanudarScanner(), 400);
    }

    private async reanudarScanner(): Promise<void> {
        this.isProcessing.set(false); // P4: liberar flag
        try {
            // Detener si está corriendo, luego reiniciar la misma instancia
            if (this.html5QrCode) {
                await this.html5QrCode.stop().catch(() => {});
            }
            await this.iniciarScanner();
        } catch { /* silenciar */ }
    }

    // ── Helpers de toast ─────────────────────────────────────────────────────
    private mostrarWarn(summary: string, detail: string): void {
        this.messageService.add({severity: 'warn', summary, detail, life: 5000});
    }

    private mostrarError(summary: string, detail: string): void {
        this.messageService.add({severity: 'error', summary, detail, life: 6000});
    }

    ngOnDestroy(): void {
        this.html5QrCode?.stop().catch(() => {});
        this.pingSubscription?.unsubscribe();
    }
}
