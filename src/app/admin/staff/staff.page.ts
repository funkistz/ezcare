import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { Router, NavigationExtras } from '@angular/router';

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
          console.log(data);
          this.staffs = data.data;
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

}
