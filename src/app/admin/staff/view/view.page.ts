/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable radix */
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
  isEndorsementApprover = 0;
  isLeaveApprover = 0;
  isExGratiaApprover = 0;
  totalLeave = 0;
  totalSickLeave = 0;

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

        if (data && data) {
          console.log('staff', data);
          this.staff = data.data;
          this.users = data.users;

          if (data.data.user) {
            this.user = data.data.user;
            this.user_id = data.data.user.user_id;

            this.isActive = this.user.user_active;

            if (this.user.is_manager) {
              this.isManager = parseInt(this.user.is_manager);
            }

            if (this.user.is_endorsement_approver) {
              this.isEndorsementApprover = parseInt(this.user.is_endorsement_approver);
            }

            if (this.user.is_leave_approver) {
              this.isLeaveApprover = parseInt(this.user.is_leave_approver);
            }

            if (this.user.is_exgratia_approver) {
              this.isExGratiaApprover = parseInt(this.user.is_exgratia_approver);
            }

            if (this.user.user_active) {
              this.isActive = parseInt(this.user.user_active);
            }

            this.users.push(this.user);
          }

        }

        if (this.staff.current_leave) {
          this.totalLeave = this.staff.current_leave.total_leave;
        }

        if (this.staff.current_sick_leave) {
          this.totalSickLeave = this.staff.current_sick_leave.total_leave;
        }


      }, error => {
        console.log(error);
      });


  }

  changeUserId(event) {

    this.user_id = event.detail.value;

  }

  updateStaffUser() {

    const data: any = {
      staff_id: this.user_id,
      user_active: this.isActive,
      is_manager: this.isManager,
      isEndorsementApprover: this.isEndorsementApprover,
      is_leave_approver: this.isLeaveApprover,
      is_exgratia_approver: this.isExGratiaApprover,
      total_leave: this.totalLeave,
      total_sick_leave: this.totalSickLeave,
    };

    this.helper.presentLoading();

    this.authService.updateStaff(this.staff.id, data).subscribe(
      (result: any) => {

        this.navCtrl.back();

        if (result && result.data) {
          // console.log(data);
          this.staff = result.data;
        }

        console.log(result);
        this.helper.dissmissLoading();
      }, error => {
        console.log(error);
        this.helper.dissmissLoading();
      });

  }
}
