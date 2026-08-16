import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ApiService } from 'src/app/core/services/api.service';

@Component({
  selector: 'app-dev-metrics',
  templateUrl: './dev-metrics.component.html',
  styleUrls: ['./dev-metrics.component.scss']
})
export class DevMetricsComponent implements OnInit {
  metrics: any = null;
  loading = false;
  error: string | null = null;
  keys = Object.keys;

  constructor(private api: ApiService, private modalCtrl: ModalController) {}

  ngOnInit(): void {
    this.fetch();
  }

  async fetch() {
    this.loading = true;
    this.error = null;
    try {
      this.metrics = await this.api.getMetrics().toPromise();
    } catch (err) {
      this.error = 'Falha ao buscar métricas';
      console.error('DevMetrics fetch error', err);
    } finally {
      this.loading = false;
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
