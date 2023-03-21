import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { HelperService } from 'src/app/services/helper.service';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-leave',
  templateUrl: './leave.page.html',
  styleUrls: ['./leave.page.scss'],
})
export class LeavePage implements OnInit {

  total_sl_leave;
  total_hl_leave;
  total_ml_leave;
  total_pl_leave;

  constructor(
    private authService: AuthenticationService,
    private alertController: AlertController,
    public helper: HelperService,
  ) { }

  ngOnInit() {

    this.getConfig();
  }

  getConfig() {

    this.authService.getLeaveConfig().subscribe(
      result => {
        if (result.data) {
          this.total_sl_leave = result.data.total_sl_leave;
          this.total_hl_leave = result.data.total_hl_leave;
          this.total_ml_leave = result.data.total_ml_leave;
          this.total_pl_leave = result.data.total_pl_leave;
        }
        console.log('data', result);

      }, error => {
        this.helper.dissmissLoading();
        console.log(error);
      });
  }

  updateSettings() {

    this.helper.presentLoading();

    const data = {
      total_sl_leave: this.total_sl_leave,
      total_hl_leave: this.total_hl_leave,
      total_ml_leave: this.total_ml_leave,
      total_pl_leave: this.total_pl_leave
    };

    this.authService.updateLeaveConfig(data).subscribe(
      result => {
        if (result.data) {
          this.total_sl_leave = result.data.total_sl_leave;
          this.total_hl_leave = result.data.total_hl_leave;
          this.total_ml_leave = result.data.total_ml_leave;
          this.total_pl_leave = result.data.total_pl_leave;
        }
        console.log('data', result);

      }, error => {
        this.helper.dissmissLoading();
        console.log(error);
      });
  }

  async assignYearlyLeave() {

    console.log('assignYearlyLeave');

    const alert = await this.alertController.create({
      header: 'Assign new annual leave for all staff',
      message: 'This action cannot be revert!',
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
      header: 'Are you sure want to assign ' + days + ' days annual leave to all staff?',
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
