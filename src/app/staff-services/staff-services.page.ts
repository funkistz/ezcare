import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Router, NavigationExtras } from '@angular/router';
import { Storage } from '@capacitor/storage';

@Component({
  selector: 'app-staff-services',
  templateUrl: './staff-services.page.html',
  styleUrls: ['./staff-services.page.scss'],
})
export class StaffServicesPage implements OnInit {

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
      this.getServices('');
    }

  }

  segmentChanged(ev: any) {

    this.segment = ev.detail.value;
    this.getServices(this.searchText);
  }

  searchClaims(event) {

    this.isSearching = true;
    this.services = null;

    this.getServices(event.target.value);

  }

  searchServices() {

    this.isSearching = true;
    this.services = null;

    console.log(this.searchText);

    this.getServices(this.searchText);

  }

  async getServices(search, event = null) {

    this.isSearching = true;
    this.services = null;
    let staff_id;

    console.log('search', search);

    if (this.segment == 'mine') {
      staff_id = this.staff.staff_id;
    } else {
      staff_id = 0;
    }

    this.authService.searchServices(search, staff_id).subscribe(
      data => {

        this.isSearching = false;
        this.isSearched = true;

        if (data && data.data) {

          if (event) {
            event.target.complete();
          }

          this.services = data.data;
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

  viewService(service_id) {

    console.log(service_id);

    let navigationExtras: NavigationExtras = {
      queryParams: {
        service_id: service_id
      }
    };
    this.router.navigate(['/staff-tabs/staff-services/view-service'], navigationExtras)

  }

}
