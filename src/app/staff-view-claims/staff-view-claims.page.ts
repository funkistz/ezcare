import { Component, OnInit } from '@angular/core';

import { AuthenticationService } from '../services/authentication.service';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { Storage } from '@capacitor/storage';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-staff-view-claims',
  templateUrl: './staff-view-claims.page.html',
  styleUrls: ['./staff-view-claims.page.scss'],
})
export class StaffViewClaimsPage implements OnInit {

  claim;
  claim_id;
  staff;
  remarks;
  loading;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute,
    public alertController: AlertController,
    public loadingController: LoadingController,
    public toastController: ToastController,
  ) { }

  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      if (params && params.claim_id) {
        this.claim_id = params.claim_id;
        console.log(this.claim_id);

        this.getClaim(this.claim_id);

      }
    });

    this.getStaff();

  }

  async getStaff() {
    let { value }: any = await Storage.get({ key: 'staff' });
    this.staff = JSON.parse(value);
    console.log(this.staff);
  }

  async getClaim(claim_id, event = null) {

    this.claim = null;

    this.authService.getClaim(claim_id).subscribe(
      data => {

        if (data && data.data) {

          if (event) {
            event.target.complete();
          }

          this.claim = data.data;
          console.log('claim', this.claim);
        }
      }, error => {

        console.log(error);
        if (event) {
          event.target.complete();
        }
      });
  }

  async action(type) {

    const alert = await this.alertController.create({
      header: 'Are you sure want to submit!',
      // message: 'Are you sure want to submit!',
      // mode: 'ios',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Confirm',
          handler: () => {
            console.log('Confirm Okay');

            this.submit(type);

          }
        }
      ]
    });

    await alert.present();
  }

  submit(type) {

    this.presentLoading();

    let data: any = {};
    data.remarks = this.remarks;
    data.status = type;
    data.approve_reject_by = this.staff.user_id;

    this.authService.updateClaim(this.claim_id, data).subscribe(
      result => {

        this.dissmissLoading();
        this.presentToast('Claim ' + type);
        // this.isSubmitted = true;
        // this.navCtrl.back();
        console.log(result);
        this.getClaim(this.claim_id);

        // if (data && data) {
        // }
      }, error => {
        console.log(error);
        this.dissmissLoading();
        this.presentToast(error.error.message);
      });

  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      message: 'Please wait...',
    });
    await this.loading.present();
  }

  dissmissLoading() {
    if (this.loading) {
      this.loading.dismiss();
    }
  }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

}
