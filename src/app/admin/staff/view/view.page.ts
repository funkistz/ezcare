import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../../services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HelperService } from '../../../services/helper.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
})
export class ViewPage implements OnInit {

  id;
  staff;
  user: any = {};
  users;
  user_id;
  isActive: any = false;
  isManager = 0;

  constructor(
    private authService: AuthenticationService,
    private route: ActivatedRoute, private router: Router,
    private helper: HelperService,
    private navCtrl: NavController,
  ) { }

  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      if (params && params.id) {
        this.id = params.id;

        this.getStaff(this.id);
      }
    });

  }

  getStaff(id) {

    this.authService.getStaff(id).subscribe(
      (data: any) => {

        if (data && data.data) {
          // console.log(data);
          this.staff = data.data;
          this.users = data.users;

          if (data.data.user) {
            this.user = data.data.user;
            this.user_id = data.data.user.user_id;

            this.isActive = this.user.user_active;

            if (this.user.is_manager) {
              this.isManager = parseInt(this.user.is_manager);
            }

            this.users.push(this.user);
          }

        }

        console.log('this.user', this.user);
      }, error => {
        console.log(error);
      });


  }

  changeUserId(event) {

    this.user_id = event.detail.value;

  }

  updateStaffUser() {

    let data: any = {
      staff_id: this.user_id,
      user_active: this.isActive,
      is_manager: this.isManager,
    };

    this.helper.presentLoading();

    this.authService.updateStaff(this.staff.id, data).subscribe(
      (data: any) => {

        this.navCtrl.back();

        if (data && data.data) {
          // console.log(data);
          this.staff = data.data;
        }

        console.log(data);
        this.helper.dissmissLoading();
      }, error => {
        console.log(error);
        this.helper.dissmissLoading();
      });

  }
}
