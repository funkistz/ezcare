import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-warranty',
  templateUrl: './warranty.page.html',
  styleUrls: ['./warranty.page.scss'],
})
export class WarrantyPage implements OnInit {

  warrantyPlans;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.getWarranty();
  }

  getWarranty() {

    this.authService.getWarrantyPlans().subscribe(
      (data: any) => {

        if (data && data.data) {
          this.warrantyPlans = data.data;
        }

        console.log('data', data);
      }, error => {
        console.log('error', error);
      });

  }

  viewWarrantyPlan(id) {

    let navigationExtras: NavigationExtras = {
      queryParams: {
        id: id
      }
    };

    this.router.navigate(['/admin/warranty/view'], navigationExtras);

  }

}
