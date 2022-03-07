import { Component, OnInit } from '@angular/core';
import { HelperService } from '../../services/helper.service';
import { AuthenticationService } from '../../services/authentication.service';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';

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

  constructor(
    private authService: AuthenticationService,
    private route: ActivatedRoute, private router: Router,
    private helper: HelperService,
  ) { }

  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      if (params) {

        console.log("params", params);

        if (params.status) {
          this.status = params.status;
          this.statusTemp = params.status;
          this.statusTemp2 = params.status;
          this.staff_id = params.staff_id;
          this.getPolicy();
        }
      }
    });
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

  getPolicy() {
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

    if (this.end_date) {
      data.end_date = this.end_date;
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

    this.router.navigate(['/policy/view'], navigationExtras);

  }
}
