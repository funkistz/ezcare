import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { DatePipe } from '@angular/common'
import { AuthenticationService } from '../services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ToastController, ActionSheetController, AlertController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import * as moment from 'moment';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { decode } from "base64-arraybuffer";
import { HelperService } from '../services/helper.service';
@Component({
  selector: 'app-add-service',
  templateUrl: './add-service.page.html',
  styleUrls: ['./add-service.page.scss'],
})
export class AddServicePage implements OnInit {

  numbering = [
    '1st',
    '2nd',
    '3rd'
  ];
  loading;
  ionicForm: FormGroup;
  defaultDate = new Date().toLocaleDateString();
  isSubmitted = false;
  serviceType = null;
  engineOilType = null;
  policy_id;
  policy;

  reminderImages = [];
  receiptImages = [];
  mileageImages = [];
  reminderImagesUrl = [];
  receiptImagesUrl = [];
  mileageImagesUrl = [];

  // File upload task 
  fileUploadTask: AngularFireUploadTask;

  // Upload progress
  percentageVal: Observable<number>;

  // Track file uploading with snapshot
  trackSnapshot: Observable<any>;

  // Uploaded File URL
  UploadedImageURL: Observable<string>;

  constructor(
    public formBuilder: FormBuilder,
    public datepipe: DatePipe,
    private authService: AuthenticationService,
    private route: ActivatedRoute, private router: Router,
    public loadingController: LoadingController,
    public toastController: ToastController,
    private navCtrl: NavController,
    private actionSheetCtrl: ActionSheetController,
    public alertController: AlertController,
    private afStorage: AngularFireStorage,
    private firestore: AngularFirestore,
    public helper: HelperService,
  ) { }

  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      if (params && params.policy_id) {
        this.policy_id = params.policy_id;
        this.policy = JSON.parse(params.policy);
        console.log(this.policy);
      }
    });

    let currentDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd');

    this.ionicForm = this.formBuilder.group({
      service_type_id: ['', [Validators.required]],
      engine_oil_type_id: ['', [Validators.required]],
      invoice_no: ['', []],
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

    if (this.serviceType == 1) {
      this.ionicForm.get('engine_oil_type_id').setValidators([Validators.required]);
    } else {
      this.ionicForm.get('engine_oil_type_id').setValidators([]);
    }

    this.ionicForm.get('engine_oil_type_id').updateValueAndValidity();
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

  async confirmSubmitForm() {

    const alert = await this.alertController.create({
      header: 'Are you sure want to submit.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Confirm',
          handler: () => {

            this.submitForm();
          }
        }
      ]
    });

    alert.present();

  }

  async submitForm() {
    console.log(this.ionicForm.value);
    this.isSubmitted = true;
    if (!this.ionicForm.valid) {
      console.log('Please provide all the required values!')
      return false;
    } else {

      let loader = this.loading = await this.loadingController.create({
        message: 'Please wait...',
      });
      await this.loading.present();

      let data: any = {};
      data = this.ionicForm.value;
      data.policy_id = this.policy_id;
      data.invoice_date = this.datepipe.transform(data.invoice_date, 'yyyy-MM-dd');
      data.next_due_date = this.datepipe.transform(data.next_due_date, 'yyyy-MM-dd');
      data.next_due_date_atf = this.datepipe.transform(data.next_due_date_atf, 'yyyy-MM-dd');

      let index = 1;
      for (const inspectImage of this.reminderImages) {

        if (index < 4) {
          loader.message = 'Uploading ' + this.numbering[index - 1] + ' reminder image ';
        } else {
          loader.message = 'Uploading ' + index + 'th reminder image ';
        }

        let upload = await this.helper.uploadToFirebase(inspectImage.file, data.reg_no);
        console.log('finish... report', upload.url);
        this.reminderImagesUrl.push({
          name: upload.name,
          image_link: upload.url,
        });
        index++;
      }

      index = 1;
      for (const inspectImage of this.receiptImages) {

        if (index < 4) {
          loader.message = 'Uploading ' + this.numbering[index - 1] + ' receipt image ';
        } else {
          loader.message = 'Uploading ' + index + 'th receipt image ';
        }

        let upload = await this.helper.uploadToFirebase(inspectImage.file, data.reg_no);
        console.log('finish... report', upload.url);
        this.receiptImagesUrl.push({
          name: upload.name,
          image_link: upload.url,
        });
        index++;
      }

      index = 1;
      for (const inspectImage of this.mileageImages) {

        if (index < 4) {
          loader.message = 'Uploading ' + this.numbering[index - 1] + ' mileage image ';
        } else {
          loader.message = 'Uploading ' + index + 'th mileage image ';
        }

        let upload = await this.helper.uploadToFirebase(inspectImage.file, data.reg_no);
        console.log('finish... report', upload.url);
        this.mileageImagesUrl.push({
          name: upload.name,
          image_link: upload.url,
        });
        index++;
      }

      // for (const reportImage of this.reminderImages) {
      //   let upload = await this.uploadToFirebase(reportImage.file, data.reg_no, 'report');
      //   console.log('finish... report', upload.url);
      //   this.reminderImagesUrl.push({
      //     name: upload.filename,
      //     image_link: upload.url,
      //   });
      // }
      // for (const reportImage of this.receiptImages) {
      //   let upload = await this.uploadToFirebase(reportImage.file, data.reg_no, 'report');
      //   console.log('finish... report', upload.url);
      //   this.receiptImagesUrl.push({
      //     name: upload.filename,
      //     image_link: upload.url,
      //   });
      // }
      // for (const reportImage of this.mileageImages) {
      //   let upload = await this.uploadToFirebase(reportImage.file, data.reg_no, 'report');
      //   console.log('finish... report', upload.url);
      //   this.mileageImagesUrl.push({
      //     name: upload.filename,
      //     image_link: upload.url,
      //   });
      // }

      data.reminderImages = this.reminderImagesUrl;
      data.receiptImages = this.receiptImagesUrl;
      data.mileageImages = this.mileageImagesUrl;

      this.authService.addService(data).subscribe(
        datax => {

          this.addNotification();

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

  async selectImageSource(type) {
    const buttons = [
      {
        text: 'Take Photo',
        icon: 'camera',
        handler: () => {
          this.takePicture(type);
        }
      },
      {
        text: 'Choose From Photos',
        icon: 'image',
        handler: () => {
          this.pickImage(type);
        }
      }
    ];

    // Only allow file selection inside a browser
    // if (!this.plt.is('hybrid')) {
    //   buttons.push({
    //     text: 'Choose a File',
    //     icon: 'attach',
    //     handler: () => {
    //       this.fileInput.nativeElement.click();
    //     }
    //   });
    // }

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Select Image Source',
      mode: 'ios',
      buttons
    });
    await actionSheet.present();
  }

  async pickImage(type) {

    let images = await this.helper.imagePicker();
    console.log('pickImage', images);

    images.forEach(image => {

      if (type == 'reminder') {

        this.reminderImages.push({
          id: Date.now(),
          file: image.file.original,
          file_thumbnail: image.file.thumbnail,
          url: image.webPath,
          format: image.format
        });

      } else if (type == 'receipt') {

        this.receiptImages.push({
          id: Date.now(),
          file: image.file.original,
          file_thumbnail: image.file.thumbnail,
          url: image.webPath,
          format: image.format
        });

      } else if (type == 'mileage') {

        this.mileageImages.push({
          id: Date.now(),
          file: image.file.original,
          file_thumbnail: image.file.thumbnail,
          url: image.webPath,
          format: image.format
        });

      }

    });
  }

  async takePicture(type) {
    let image = await this.helper.camera();
    console.log('takePicture', image);

    if (type == 'reminder') {
      this.reminderImages.push({
        id: Date.now(),
        file: image.file.original,
        file_thumbnail: image.file.thumbnail,
        url: image.webPath,
        format: image.format
      });

    } else if (type == 'receipt') {
      this.receiptImages.push({
        id: Date.now(),
        file: image.file.original,
        file_thumbnail: image.file.thumbnail,
        url: image.webPath,
        format: image.format
      });
    } else if (type == 'mileage') {
      this.mileageImages.push({
        id: Date.now(),
        file: image.file.original,
        file_thumbnail: image.file.thumbnail,
        url: image.webPath,
        format: image.format
      });

    }

  }

  async addImage(source: CameraSource, type) {

    const image = await Camera.getPhoto({
      quality: 50,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source
    });

    // const base64Data = await this.readAsBase64(image);

    // const blobData = this.b64toBlob(image.base64String, `image/${image.format}`);

    const blob = new Blob([new Uint8Array(decode(image.base64String))], {
      type: `image/${image.format}`,
    });
    let filename: string = "" + moment().unix();

    const file = new File([blob], filename, {
      lastModified: moment().unix(),
      type: blob.type,
    });

    let data: any = {};
    data = this.ionicForm.value;
    this.reminderImagesUrl = [];
    this.receiptImagesUrl = [];
    this.mileageImagesUrl = [];

    if (type == 'reminder') {
      this.reminderImages.push({
        id: Date.now(),
        base64: "data:image/jpeg;base64, " + image.base64String,
        file: file,
        format: image.format
      });
    } else if (type == 'receipt') {
      this.receiptImages.push({
        id: Date.now(),
        base64: "data:image/jpeg;base64, " + image.base64String,
        file: file,
        format: image.format
      });
    } else if (type == 'mileage') {
      this.mileageImages.push({
        id: Date.now(),
        base64: "data:image/jpeg;base64, " + image.base64String,
        file: file,
        format: image.format
      });
    }
  }

  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  b64toBlob(b64Data, contentType = '', sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  async uploadToFirebase(file, reg_no, type, isUpdate = false): Promise<any> {

    return new Promise(async (resolve, reject) => {

      console.log('uploading...');

      const filename = new Date().getTime() + '_' + reg_no;

      // Storage path
      const fileStoragePath = `claims/${new Date().getTime()}_${reg_no}`;

      // Image reference
      const imageRef = this.afStorage.ref(fileStoragePath);

      // File upload task
      this.fileUploadTask = this.afStorage.upload(fileStoragePath, file);
      // Show uploading progress
      this.percentageVal = this.fileUploadTask.percentageChanges();

      await this.fileUploadTask.snapshotChanges().pipe(
        finalize(async () => {
          console.log('finish fileUploadTask');

          await imageRef.getDownloadURL().subscribe(downloadURL => {

            resolve({
              name: filename,
              url: downloadURL,
            });

          });
        })
      ).toPromise();


    });

  }

  addNotification() {

    let data = {
      title: 'New service has been created for reg no: ' + this.policy.cust_vehicleregno,
      body: 'Tap here to check it out!',
      text: 'Reg no: ' + this.policy.cust_vehicleregno + ', Policy no: ' + this.policy.cust_policyno,
      data: this.policy.cust_vehicleregno,
      user_id: 'staff_' + this.policy.cust_marketingofficer,
      data_add: new Date(),
    };

    this.firestore.collection('/notifications/').add(data).then(() => {
      console.log('success');

    }).catch(error => {

      // this.helper.presentToast(error);

    });

  }

  removeImage(index, type) {

    if (type == 'reminder') {
      this.reminderImages.splice(index, 1);
    } else if (type == 'receipt') {
      this.receiptImages.splice(index, 1);
    } else if (type == 'mileage') {
      this.mileageImages.splice(index, 1);
    }

  }

}
