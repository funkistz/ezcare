import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { HelperService } from '../services/helper.service';
import * as moment from 'moment';

@Component({
  selector: 'app-staff-claims',
  templateUrl: './staff-claims.page.html',
  styleUrls: ['./staff-claims.page.scss'],
})
export class StaffClaimsPage implements OnInit {

  user;
  staff;
  segment = 'mine';
  searchText = '';
  services;
  isSearched = false;
  isSearching = false;
  groupServices = [];
  branch;
  year = null;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    public helper: HelperService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.checkUser();
    this.helper.getStaffs();
  }

  ionViewDidEnter() {
    this.route.queryParams.subscribe(params => {
      if (params) {
        this.checkUser(params.refresh, false);
      }
    });
  }

  async checkUser(refresh = false, firsttime = true) {

    this.user = null;
    this.staff = null;

    let { value }: any = await Preferences.get({ key: 'staff' });
    let staff = value;

    if (staff) {
      this.staff = JSON.parse(staff);

      if (firsttime) {
        this.branch = Number(this.staff.user_branch);
      }

      this.getClaims(this.searchText);
    }

  }

  segmentChanged(ev: any) {

    this.segment = ev.detail.value;
    this.getClaims(this.searchText);
  }

  searchClaims(event) {

    this.isSearching = true;
    this.services = null;

    this.getClaims(event.target.value);

  }

  changeBranch(event) {

    this.getClaims('');

  }

  filterByDate() {

    this.getClaims('');

  }

  async getClaims(search, event = null) {

    this.isSearching = true;
    this.services = null;
    this.groupServices = [];

    let staff_id;

    console.log('search', search);

    if (this.segment == 'mine') {
      staff_id = this.staff.staff_id;
    } else {
      staff_id = 0;
    }

    this.authService.searchClaims(search, staff_id, false, this.branch, this.year).subscribe(
      data => {

        this.isSearching = false;
        this.isSearched = true;

        if (data && data.data) {

          if (event) {
            event.target.complete();
          }

          if (data.data.length > 0) {
            this.services = data.data;

            this.groupServices = [];
            let indexGrow = 0;
            this.groupServices[indexGrow] = {};
            this.groupServices[indexGrow].data = [];
            let previousDate = null;

            if (this.services[0]) {
              previousDate = moment(this.services[0].created_at).format('YYYYMM');
              this.groupServices[indexGrow].name = moment(this.services[0].created_at).format('MMM YYYY');
            }

            this.services.forEach(service => {

              const index = moment(service.created_at).format('YYYYMM');

              if (index != previousDate) {
                indexGrow++;
                this.groupServices[indexGrow] = {};
                this.groupServices[indexGrow].data = [];
                this.groupServices[indexGrow].name = moment(service.created_at).format('MMM YYYY');
                previousDate = moment(service.created_at).format('YYYYMM');
              }

              this.groupServices[indexGrow].data.push(service);

            });

            console.log('groupServices', this.groupServices);

          } else {
            this.services = null;
          }
          console.log('services', data);
        }
      }, error => {

        this.isSearching = false;
        this.isSearched = true;

        console.log(error);
        if (event) {
          event.target.complete();
        }
      });
  }

  viewClaim(claim_id) {

    let navigationExtras: NavigationExtras = {
      queryParams: {
        claim_id: claim_id
      }
    };
    this.router.navigate(['/staff-tabs/staffClaims/staff-view-claim'], navigationExtras);

  }

  addClaim() {

    this.router.navigate(['/staff-tabs/staffClaims/staff-add-claim']);

  }

}
