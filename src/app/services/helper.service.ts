import { Injectable } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  loading;

  constructor(
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
  ) { }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
      translucent: true
    });
    toast.present();
  }

  async presentLoading(message = 'Please wait...') {
    this.loading = await this.loadingController.create({
      message: message,
    });
    await this.loading.present();
  }

  dissmissLoading() {
    if (this.loading) {
      this.loading.dismiss();
    }
  }
}
