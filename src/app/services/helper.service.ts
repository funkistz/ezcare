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
      translucent: true,
      mode: 'ios'
    });
    toast.present();
  }

  async presentLoading(message = 'Please wait...') {
    this.loading = await this.loadingController.create({
      message: message,
      mode: 'ios',
    });
    await this.loading.present();
  }

  updateLoading(message) {
    this.loading.setContent(message);
  }

  dissmissLoading() {

    setTimeout(() => {
      if (this.loading) {
        this.loading.dismiss();
      }
    }, 500);

  }

  async presentAlertDetails(header, message) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: header,
      message: message,
      mode: 'ios',
      buttons: [{
        text: 'Okay',
        handler: () => {
          console.log('Confirm Okay');
        }
      }
      ]
    });

    await alert.present();
  }
}
