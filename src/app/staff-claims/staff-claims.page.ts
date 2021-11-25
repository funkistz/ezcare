import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-staff-claims',
  templateUrl: './staff-claims.page.html',
  styleUrls: ['./staff-claims.page.scss'],
})
export class StaffClaimsPage implements OnInit {

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

  searchClaims() {

    this.isSearching = true;
    this.services = null;

    console.log(this.searchText);

    this.getClaims(this.searchText);

  }

  async getClaims(search, event = null) {

    this.authService.searchClaims(search).subscribe(
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

  viewClaim(claim_id) {

    let navigationExtras: NavigationExtras = {
      queryParams: {
        claim_id: claim_id
      }
    };
    this.router.navigate(['/tabs/staffClaims/staff-view-claim'], navigationExtras);

  }

  addClaim() {

    this.router.navigate(['/tabs/staffClaims/staff-add-claim']);

  }

}
