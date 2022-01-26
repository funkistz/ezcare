import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-workshop',
  templateUrl: './workshop.page.html',
  styleUrls: ['./workshop.page.scss'],
})
export class WorkshopPage implements OnInit {

  workshops;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
  ) { }

  ngOnInit() {

  }

  ionViewDidEnter() {
    this.getWorkshop();
  }

  getWorkshop() {

    this.authService.getWorkshops(1).subscribe(
      (data: any) => {

        if (data && data.data) {
          console.log(data);
          this.workshops = data.data;
        }

        console.log('data', data);
      }, error => {
        console.log('error', error);
      });

  }

  view(id) {

    let navigationExtras: NavigationExtras = {
      queryParams: {
        id: id
      }
    };

    this.router.navigate(['/admin/workshop/view'], navigationExtras);
  }

  add() {

    this.router.navigate(['/admin/workshop/view']);
  }

}
