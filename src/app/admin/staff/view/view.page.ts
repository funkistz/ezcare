import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../../services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HelperService } from '../../../services/helper.service';

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

  constructor(
    private authService: AuthenticationService,
    private route: ActivatedRoute, private router: Router,
    private helper: HelperService,
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

            this.users.push(this.user);
          }

        }

        console.log(data);
      }, error => {
        console.log(error);
      });


  }

  changeUserId(event) {

    this.user_id = event.detail.value;

  }

  updateStaffUser() {

    console.log(this.user_id);

    let data: any = {
      staff_id: this.user_id
    };

    this.helper.presentLoading();

    this.authService.updateStaff(this.staff.id, data).subscribe(
      (data: any) => {

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
