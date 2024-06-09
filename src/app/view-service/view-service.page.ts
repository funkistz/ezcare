import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Preferences } from '@capacitor/preferences';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';
import { HelperService } from '../services/helper.service';
import { AlertController, LoadingController, ToastController, ActionSheetController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-view-service',
  templateUrl: './view-service.page.html',
  styleUrls: ['./view-service.page.scss'],
})
export class ViewServicePage implements OnInit {

  service_id;
  service;
  staff;

  constructor(
    private authService: AuthenticationService,
    private route: ActivatedRoute, private router: Router,
    private photoViewer: PhotoViewer,
    public helper: HelperService,
    public alertController: AlertController,
  ) { }

  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      if (params && params.service_id) {
        this.service_id = params.service_id;

        this.getService(this.service_id);
      }
    });

    this.getStaff();

  }

  async getStaff() {
    let { value }: any = await Preferences.get({ key: 'staff' });
    this.staff = JSON.parse(value);
    console.log('staff', this.staff);
  }

  async getService(service_id, event = null) {

    this.authService.getService(service_id).subscribe(
      data => {

        if (data && data.data) {

          console.log('getService', data);


          if (event) {
            event.target.complete();
          }

          this.service = data.data;
          console.log(this.service);

        }
      }, error => {
        console.log(error);
        if (event) {
          event.target.complete();
        }
      });

  }

  imagePreview(src) {

    this.photoViewer.show(src);

  }

  async deleteService() {

    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Are you sure want to delete?',
      message: 'This action will permanently delete the data.',
      mode: 'ios',
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
          console.log('Confirm Cancel');
        }
      }, {
        text: 'Okay',
        handler: () => {

          this.helper.presentLoading();

          this.authService.deleteService(this.service_id).subscribe(
            result => {

              this.helper.dissmissLoading();
              this.helper.presentToast('Service deleted.');
              let navigationExtras: NavigationExtras = {
                queryParams: {
                  refresh: 'yes'
                }
              };

              this.router.navigate(['/staff-tabs/staff-services'], navigationExtras);

            }, error => {
              console.log(error);
              this.helper.dissmissLoading();
              this.helper.presentToast(error.error.message);
            });


        }
      }
      ]
    });

    await alert.present();
  }

}
