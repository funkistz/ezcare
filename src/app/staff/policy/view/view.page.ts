import { Component, OnInit } from '@angular/core';
import { HelperService } from '../../../services/helper.service';
import { AuthenticationService } from '../../../services/authentication.service';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { CallNumber } from '@ionic-native/call-number/ngx';

@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
})
export class ViewPage implements OnInit {

  id;
  loaded;
  policy;

  constructor(
    private authService: AuthenticationService,
    private route: ActivatedRoute, private router: Router,
    private helper: HelperService,
    private callNumber: CallNumber,
  ) { }

  ngOnInit() {

    const rt = this.route.queryParams.subscribe(params => {
      if (params) {

        console.log("params", params);

        if (params.id) {
          this.id = params.id;
          this.getPolicy(this.id);
        }
      }
    });

    rt.unsubscribe();

  }

  getPolicy(id) {
    this.loaded = false;

    this.authService.getPolicy(id).subscribe(
      data => {
        this.loaded = true;
        this.policy = data.data;

        console.log('report', data);
      }, error => {
        this.loaded = true;
        console.log(error);
      });
  }

  async call() {

    this.callNumber.callNumber(this.policy.cust_phone1, true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.log('Error launching dialer', err));

  }

  whatsapp() {

    console.log('whatsapp');
    let phone = this.policy.cust_phone1;

    if (this.policy.cust_phone1.charAt(0) != '6') {
      phone = '6' + this.policy.cust_phone1;
    }

    let link = 'https://api.whatsapp.com/send?phone=6' + this.policy.cust_phone1;


    window.open(link, '_system', 'location=yes');

  }

  viewClaim(claim_id) {

    let navigationExtras: NavigationExtras = {
      queryParams: {
        claim_id: claim_id
      }
    };
    this.router.navigate(['/policy/view/claim'], navigationExtras);

  }

}
