import { Component } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { AuthenticationService } from '../services/authentication.service';
import { Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  user;
  cPolicy;
  policies;
  services;
  cService;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
  ) {
    this.checkUser();
  }

  async checkUser(event = null) {
    let { value }: any = await Storage.get({ key: 'user' });
    console.log(value);
    value = JSON.parse(value);
    this.user = value;
    console.log(this.user.cust_id);

    this.getPolicies(this.user.cust_ic, event);
    this.getClaims(this.user.cust_id, event);
  }

  async getClaims(policy_id, event) {

    this.authService.getClaims(policy_id).subscribe(
      data => {

        if (data && data.data) {

          if (event) {
            event.target.complete();
          }

          this.services = data.data;
          console.log('claim', this.services);
          this.cService = this.services[this.services.length - 1];
        }
      }, error => {
        console.log(error);
        if (event) {
          event.target.complete();
        }
      });

  }

  async getPolicies(cust_ic, event) {

    this.authService.getPoliciesByIC(cust_ic).subscribe(
      data => {

        if (data && data.data) {

          if (event) {
            event.target.complete();
          }

          this.policies = data.data;
          this.policies.forEach(poli => {
            if (poli.id == this.user.cust_id) {
              this.cPolicy = poli;
            }
          });
        }
      }, error => {
        console.log(error);
        if (event) {
          event.target.complete();
        }
      });

  }

  async doRefresh(event) {
    await this.checkUser(event);
  }

  viewClaim(claim_id) {

    let navigationExtras: NavigationExtras = {
      queryParams: {
        claim_id: claim_id
      }
    };
    this.router.navigate(['/tabs/tab3/staff-view-claim'], navigationExtras);

  }



}
