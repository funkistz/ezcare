import { Component } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
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
  segment = 'claim';
  claim_payments;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
  ) {
    this.checkUser();
  }

  ionViewDidEnter() {
    this.checkUser();
  }

  async checkUser(event = null) {
    let { value }: any = await Preferences.get({ key: 'user' });
    // console.log(value);
    value = JSON.parse(value);
    this.user = value;
    // console.log(this.user.cust_id);

    this.getPolicies(this.user.cust_ic, event);
    this.getClaims(this.user.cust_id, event);
  }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
  }

  async getClaims(policy_id, event) {

    this.authService.getClaims(policy_id).subscribe(
      data => {

        if (data && data.data) {

          if (event) {
            event.target.complete();
          }

          this.services = data.data;
          this.claim_payments = data.claim_payments;
          console.log('claim', this.services);
          console.log('claim_payments', this.claim_payments);
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
