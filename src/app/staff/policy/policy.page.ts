import { Component, OnInit } from '@angular/core';
import { HelperService } from '../../services/helper.service';
import { AuthenticationService } from '../../services/authentication.service';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import * as moment from 'moment';

@Component({
  selector: 'app-policy',
  templateUrl: './policy.page.html',
  styleUrls: ['./policy.page.scss'],
})
export class PolicyPage implements OnInit {

  status;
  statusTemp;
  statusTemp2;
  staff_id;
  policies;
  loaded;
  start_date;
  end_date;
  staff;
  month;
  year;

  constructor(
    private authService: AuthenticationService,
    private route: ActivatedRoute, private router: Router,
    private helper: HelperService,
  ) { }

  ngOnInit() {

    const rt = this.route.queryParams.subscribe(params => {
      if (params) {

        console.log("params", params);

        if (params.status) {
          this.status = params.status;
          this.statusTemp = params.status;
          this.statusTemp2 = params.status;
          this.staff_id = params.staff_id;

          if (params.filter) {

            let filter = JSON.parse(params.filter);

            if (filter && filter.month != 'All') {
              this.month = moment(filter.month, 'MMM').format('M');
            } else {
              // this.month = moment('Jan', 'MMM').format('M');
            }

            if (filter && filter.year) {
              this.year = filter.year;
            } else {
              this.year = moment().year();
            }

            if (this.month) {
              const strDate = '1-' + this.month + '-' + this.year;
              this.start_date = moment(strDate, 'D-M-YYYY').toDate();
              this.end_date = moment(strDate, 'D-M-YYYY').endOf('month').toDate();
            } else {
              const strDate = this.year;
              this.start_date = moment(strDate, 'YYYY').startOf('year').toDate();
              let temp_start_date = moment(strDate, 'YYYY').startOf('year').toDate();
              this.end_date = moment(strDate, 'YYYY').endOf('year').toDate();

              console.log('temp_start_date', temp_start_date);
            }

            console.log('month', this.month);
            console.log('year', this.year);
            console.log('start_date', this.start_date);
            console.log('end_date', this.end_date);
          }

          this.getPolicy();
        } else {
          this.status = 'complete';
          this.statusTemp = 'complete';
          this.statusTemp2 = 'complete';

          this.helper.checkStaff().then((staff: any) => {
            if (staff) {
              this.staff = staff;
              this.staff_id = staff.staff_id;
              this.getPolicy();
            }
          }, error => {
            console.log('error', error);
          });
        }
      }
    });

    rt.unsubscribe();
  }

  changeStatus(event) {

    console.log(event.target.value);
    this.statusTemp2 = event.target.value;

    if (this.status == 'expired' || this.status == 'unpaid') {
      this.start_date = null;
      this.end_date = null;
    }

  }

  openFilterBy() {

    this.statusTemp = this.status;
    this.statusTemp2 = this.status;
    this.status = null;

  }

  filter() {
    this.status = this.statusTemp2;
    this.getPolicy();
  }

  cancel() {
    this.status = this.statusTemp;
  }

  searching(event) {
    let search = event.target.value.toLowerCase();
    this.getPolicy(search);
  }

  getPolicy(search = null) {
    this.loaded = false;
    this.policies = null;

    console.log('getPolicy');

    let data: any = {
      status: this.status,
      staff_id: this.staff_id,
    };

    if (this.start_date) {
      data.start_date = this.start_date;
    }

    console.log('data.start_date', data.start_date);

    if (this.end_date) {
      data.end_date = this.end_date;
    }

    if (search) {
      data.search = search;
    }

    data = JSON.stringify(data);

    this.authService.filterPolicy(data).subscribe(
      data => {
        this.loaded = true;
        this.policies = data.data;

        console.log('report', data);
      }, error => {
        this.loaded = true;
        console.log(error);


      });
  }

  viewPolicy(id) {

    let navigationExtras: NavigationExtras = {
      queryParams: {
        id: id,
      }
    };

    this.router.navigate(['/staff-tabs/policy/view'], navigationExtras);

  }
}
