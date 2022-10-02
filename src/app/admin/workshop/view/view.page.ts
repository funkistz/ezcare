import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../../services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { HelperService } from '../../../services/helper.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
})
export class ViewPage implements OnInit {

  id;
  workshop: any = {};
  ionicForm: FormGroup;
  image_link;
  states = [
    "johor",
    "kedah",
    "kelantan",
    "melaka",
    "negeri sembilan",
    "pahang",
    "perak",
    "perlis",
    "pulau pinang",
    "sarawak",
    "selangor",
    "terengganu",
    "kuala lumpur",
    "labuan",
    "sabah",
    "putrajaya"
  ];
  isActive: any = false;

  constructor(
    private authService: AuthenticationService,
    private route: ActivatedRoute, private router: Router,
    public formBuilder: FormBuilder,
    private helper: HelperService,
    private navCtrl: NavController,
  ) { }

  ngOnInit() {

    this.ionicForm = this.formBuilder.group({
      image_url: ['', []],
      name: ['', [Validators.required]],
      desc: ['', []],
      phone: ['', [Validators.required]],
      phone2: ['', []],
      latitude: ['', [Validators.required]],
      longitude: ['', [Validators.required]],
      address1: ['', [Validators.required]],
      address2: ['', []],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      postcode: ['', [Validators.required]],
      is_active: ['', []],
    });

    this.route.queryParams.subscribe(params => {
      if (params && params.id) {

        this.helper.presentLoading();
        this.id = params.id;

        this.getWorkshop(this.id);
      }
    });

  }

  getWorkshop(id) {

    this.authService.getWorkshop(id).subscribe(
      (data: any) => {

        if (data && data.data) {
          // console.log(data);
          this.workshop = data.data;

          this.image_link = this.workshop.image_url;

          this.ionicForm.controls['image_url'].setValue(this.workshop.image_url);
          this.ionicForm.controls['name'].setValue(this.workshop.name);
          this.ionicForm.controls['desc'].setValue(this.workshop.desc);
          this.ionicForm.controls['phone'].setValue(this.workshop.phone);
          this.ionicForm.controls['phone2'].setValue(this.workshop.phone2);
          this.ionicForm.controls['latitude'].setValue(this.workshop.latitude);
          this.ionicForm.controls['longitude'].setValue(this.workshop.longitude);
          this.ionicForm.controls['address1'].setValue(this.workshop.address1);
          this.ionicForm.controls['address2'].setValue(this.workshop.address2);
          this.ionicForm.controls['city'].setValue(this.workshop.city);
          this.ionicForm.controls['state'].setValue(this.workshop.state);
          this.ionicForm.controls['postcode'].setValue(this.workshop.postcode);
          this.ionicForm.controls['is_active'].setValue(Number(this.workshop.is_active));
        }

        this.helper.dissmissLoading();
        console.log(data);
      }, error => {
        this.helper.dissmissLoading();
        console.log(error);
      });
  }

  imageChange() {

    this.image_link = this.ionicForm.value.image_url;

  }

  submit() {

    this.helper.presentLoading();

    let data = this.ionicForm.value;
    data.country = 'malaysia';


    if (this.id) {
      this.authService.updateWorkshop(this.id, data).subscribe(
        result => {

          this.helper.dissmissLoading();
          this.helper.presentToast('Successfully updated');
          this.navCtrl.back();

        }, error => {
          console.log(error);
          this.helper.dissmissLoading();
          this.helper.presentToast(error.error.message);
        });
    } else {
      this.authService.addWorkshop(data).subscribe(
        result => {

          this.helper.dissmissLoading();
          this.helper.presentToast('Successfully added');
          this.navCtrl.back();

        }, error => {
          console.log(error);
          this.helper.dissmissLoading();
          this.helper.presentToast(error.error.message);
        });
    }



  }

}
