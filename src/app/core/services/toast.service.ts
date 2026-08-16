import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastController: ToastController) { }

  async presentToast(message: string, color: string, duration: number = 4000) {
    const toast = await this.toastController.create({
      message,
      duration,
      color: color,
    });
    await toast.present();
  }

  async showErrorToast(message: string) {
    this.presentToast(message, 'danger');
  }

  async showSuccessToast(message: string) {
    this.presentToast(message, 'success');
  }

  async showWarningToast(message: string) {
    this.presentToast(message, 'warning');
  }
}

