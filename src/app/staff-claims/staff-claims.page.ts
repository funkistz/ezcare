import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Router, NavigationExtras } from '@angular/router';
import { Storage } from '@capacitor/storage';
import { HelperService } from '../services/helper.service';

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

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private helper: HelperService,
  ) { }

  ngOnInit() {
    this.checkUser();
  }

  async checkUser(event = null, policy_id = null) {

    this.user = null;
    this.staff = null;

    let { value }: any = await Storage.get({ key: 'staff' });
    let staff = value;

    if (staff) {
      this.staff = JSON.parse(staff);
      console.log(this.staff);
      this.getClaims('');
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

  async getClaims(search, event = null) {

    this.isSearching = true;
    this.services = null;

    let staff_id;

    console.log('search', search);

    if (this.segment == 'mine') {
      staff_id = this.staff.staff_id;
    } else {
      staff_id = 0;
    }

    this.authService.searchClaims(search, staff_id).subscribe(
      data => {

        this.isSearching = false;
        this.isSearched = true;

        if (data && data.data) {

          if (event) {
            event.target.complete();
          }

          if (data.data.length > 0) {
            this.services = data.data;
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
