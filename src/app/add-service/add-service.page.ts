import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType } from '@capacitor/camera';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { DatePipe } from '@angular/common'
import { AuthenticationService } from '../services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-add-service',
  templateUrl: './add-service.page.html',
  styleUrls: ['./add-service.page.scss'],
})
export class AddServicePage implements OnInit {

  loading;
  ionicForm: FormGroup;
  defaultDate = new Date().toLocaleDateString();
  isSubmitted = false;
  serviceType = null;
  engineOilType = null;
  policy_id;

  constructor(
    public formBuilder: FormBuilder,
    public datepipe: DatePipe,
    private authService: AuthenticationService,
    private route: ActivatedRoute, private router: Router,
    public loadingController: LoadingController,
    public toastController: ToastController,
    private navCtrl: NavController
  ) { }

  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      if (params && params.policy_id) {
        this.policy_id = params.policy_id;
        console.log(this.policy_id);
      }
    });

    let currentDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd');

    this.ionicForm = this.formBuilder.group({
      service_type_id: ['', [Validators.required]],
      engine_oil_type_id: ['', []],
      invoice_no: ['', [Validators.required]],
      invoice_date: [currentDate, [Validators.required]],
      current_mileage: ['', [Validators.required]],

      next_due_mileage: ['', []],
      next_due_date: ['', []],
      next_due_mileage_atf: ['', []],
      next_due_date_atf: ['', []],

      workshop_name: ['', [Validators.required]],
      remarks: ['', []],
    })
  }

  // getDate(e) {
  //   let date = new Date(e.target.value).toISOString().substring(0, 10);
  //   this.ionicForm.get('dob').setValue(date, {
  //     onlyself: true
  //   })
  // }

  get errorControl() {
    return this.ionicForm.controls;
  }

  serviceTypeChange(event) {
    this.serviceType = event.detail.value;
  }

  engineOilTypeChange(event) {
    this.engineOilType = event.detail.value;

    let currentMileage = this.ionicForm.get('current_mileage').value;
    this.changeMileage(currentMileage);
  }

  currentMileageChange(event) {
    // console.log(event.detail.value);
    let currentMileage = parseInt(event.detail.value);

    this.changeMileage(currentMileage);
  }

  changeMileage(currentMileage) {

    let due_mileage = 0;
    let due_mileage_atf = 0;
    let date = new Date();
    let dateAtf = new Date();

    if (this.engineOilType == 1) {
      due_mileage = currentMileage + 7000;
      date.setMonth(date.getMonth() + 4);
    } else if (this.engineOilType == 2) {
      due_mileage = currentMileage + 10000;
      date.setMonth(date.getMonth() + 6);
    }

    due_mileage_atf = currentMileage + 30000;
    dateAtf.setMonth(dateAtf.getMonth() + 12);

    this.ionicForm.get('next_due_mileage').setValue(due_mileage);
    this.ionicForm.get('next_due_mileage_atf').setValue(due_mileage_atf);


    let stringdate = this.datepipe.transform(date, 'yyyy-MM-dd');
    let stringdateAtf = this.datepipe.transform(dateAtf, 'yyyy-MM-dd');

    this.ionicForm.get('next_due_date').setValue(stringdate);
    this.ionicForm.get('next_due_date_atf').setValue(stringdateAtf);

  }

  submitForm() {
    console.log(this.ionicForm.value);
    this.isSubmitted = true;
    if (!this.ionicForm.valid) {
      console.log('Please provide all the required values!')
      return false;
    } else {

      this.presentLoading();

      let data: any = {};
      data = this.ionicForm.value;
      data.policy_id = this.policy_id;
      data.invoice_date = this.datepipe.transform(data.invoice_date, 'yyyy-MM-dd');
      data.next_due_date = this.datepipe.transform(data.next_due_date, 'yyyy-MM-dd');
      data.next_due_date_atf = this.datepipe.transform(data.next_due_date_atf, 'yyyy-MM-dd');

      console.log(data);

      this.authService.addService(data).subscribe(
        datax => {

          this.dissmissLoading();
          this.presentToast('Service added successfully');
          this.isSubmitted = true;
          this.navCtrl.back();
          console.log(datax);

        }, error => {
          console.log(error);
          this.dissmissLoading();
          this.presentToast(error);
        });
    }
  }

  addAttachment() {

    const takePicture = async () => {
      const image = await Camera.getPhoto({
        quality: 50,
        allowEditing: true,
        resultType: CameraResultType.Uri
      });

      // image.webPath will contain a path that can be set as an image src.
      // You can access the original file using image.path, which can be
      // passed to the Filesystem API to read the raw data of the image,
      // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
      var imageUrl = image.webPath;

      // Can be set to the src of an image now
      // imageElement.src = imageUrl;
    };

  }

  numberOnlyValidation(event: any) {
    const pattern = /[0-9.,]/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      message: 'Please wait...',
    });
    await this.loading.present();
  }

  dissmissLoading() {
    if (this.loading) {
      this.loading.dismiss();
    }
  }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }


}
