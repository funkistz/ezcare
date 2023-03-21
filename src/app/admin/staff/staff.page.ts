import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { Router, NavigationExtras } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { HelperService } from 'src/app/services/helper.service';
@Component({
  selector: 'app-staff',
  templateUrl: './staff.page.html',
  styleUrls: ['./staff.page.scss'],
})
export class StaffPage implements OnInit {

  staffs;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private alertController: AlertController,
    private helper: HelperService
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.getStaff();
  }

  getStaff() {

    console.log('getStaff');

    this.authService.getStaffs().subscribe(
      (data: any) => {

        console.log('getStaff');


        if (data && data.data) {
          console.log('staffs', data);
          this.staffs = data.data;
          // this.staffs.user_active = Number(this.staffs.user_active);
        }

        console.log('data', data);
      }, error => {
        console.log('error', error);
      });

  }

  viewStaff(id) {

    let navigationExtras: NavigationExtras = {
      queryParams: {
        id: id
      }
    };

    this.router.navigate(['/admin/staff/view'], navigationExtras);
  }

  async assignYearlyLeave() {

    console.log('assignYearlyLeave');

    const alert = await this.alertController.create({
      header: 'Assign new yearly leave for all staff',
      // message: 'This is an alert!',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {

          },
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: (data) => {
            this.confirmAssignYearlyLeave(data.total, data.year);
          },
        },
      ],
      inputs: [
        {
          name: 'total',
          type: 'number',
          placeholder: 'Total leave for all staff',
          min: 1,
          max: 30,
        },
        {
          name: 'year',
          placeholder: 'Year',
        }
      ]
    });

    await alert.present();

  }

  async confirmAssignYearlyLeave(days, year) {

    const alert = await this.alertController.create({
      header: 'Are you sure want to assign ' + days + ' days leave to all staff?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {

          },
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: () => {
            this.helper.presentLoading();

            this.authService.assignTotalLeave(days, year).subscribe(
              data => {
                this.helper.dissmissLoading();
                this.helper.presentToast('Successfully assign total leave.');
              }, error => {
                this.helper.dissmissLoading();
              });

          },
        },
      ]
    });

    await alert.present();

  }

}
