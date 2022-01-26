import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { HelperService } from '../../services/helper.service';

@Component({
  selector: 'app-general',
  templateUrl: './general.page.html',
  styleUrls: ['./general.page.scss'],
})
export class GeneralPage implements OnInit {

  generals = {};

  constructor(
    private authService: AuthenticationService,
    private helper: HelperService,
  ) { }

  ngOnInit() {

    this.getGenerals();
  }

  getGenerals() {

    this.authService.getSettings().subscribe(
      data => {

        if (data && data.data) {
          this.generals = data.data[0];
        }

        console.log(data);
      }, error => {
        console.log(error);
      });

  }

}
