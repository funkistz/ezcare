import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-staff-services',
  templateUrl: './staff-services.page.html',
  styleUrls: ['./staff-services.page.scss'],
})
export class StaffServicesPage implements OnInit {

  searchText = '';
  services;
  isSearched = false;
  isSearching = false;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  searchServices() {

    this.isSearching = true;
    this.services = null;

    console.log(this.searchText);

    this.getServices(this.searchText);

  }

  async getServices(search, event = null) {

    this.authService.searchServices(search).subscribe(
      data => {

        this.isSearching = false;
        this.isSearched = true;

        if (data && data.data) {

          if (event) {
            event.target.complete();
          }

          this.services = data.data;
          console.log('services', this.services);
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
