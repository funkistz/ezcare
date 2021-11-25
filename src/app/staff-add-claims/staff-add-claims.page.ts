import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { DatePipe } from '@angular/common'
import { AuthenticationService } from '../services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform, LoadingController, ToastController, ActionSheetController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Storage } from '@capacitor/storage';

@Component({
  selector: 'app-staff-add-claims',
  templateUrl: './staff-add-claims.page.html',
  styleUrls: ['./staff-add-claims.page.scss'],
})
export class StaffAddClaimsPage implements OnInit {

  staff;
  loading;
  ionicForm: FormGroup;
  reportImages = [];
  quotationImages = [];
  // images: ApiImage[] = [];
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;


  constructor(
    public formBuilder: FormBuilder,
    public datepipe: DatePipe,
    private authService: AuthenticationService,
    private route: ActivatedRoute, private router: Router,
    public loadingController: LoadingController,
    public toastController: ToastController,
    private navCtrl: NavController,
    private plt: Platform,
    private actionSheetCtrl: ActionSheetController
  ) { }

  ngOnInit() {

    this.getStaff();

    this.ionicForm = this.formBuilder.group({
      reg_no: ['', [Validators.required]],
      // engine_oil_type_id: ['', []],
      // invoice_no: ['', [Validators.required]],
      // invoice_date: [currentDate, [Validators.required]],
      // current_mileage: ['', [Validators.required]],

      // next_due_mileage: ['', []],
      // next_due_date: ['', []],
      // next_due_mileage_atf: ['', []],
      // next_due_date_atf: ['', []],

      // workshop_name: ['', [Validators.required]],
      // remarks: ['', []],
    })

  }

  async getStaff() {
    let { value }: any = await Storage.get({ key: 'staff' });
    this.staff = JSON.parse(value);
    console.log(this.staff);
  }

  loadImages() {
    // this.api.getImages().subscribe(images => {
    //   this.images = images;
    // });
  }

  async selectImageSource(type) {
    const buttons = [
      {
        text: 'Take Photo',
        icon: 'camera',
        handler: () => {
          this.addImage(CameraSource.Camera, type);
        }
      },
      {
        text: 'Choose From Photos',
        icon: 'image',
        handler: () => {
          this.addImage(CameraSource.Photos, type);
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

  async addImage(source: CameraSource, type) {

    const image = await Camera.getPhoto({
      quality: 50,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source
    });

    const base64Data = await this.readAsBase64(image);

    const blobData = this.b64toBlob(image.base64String, `image/${image.format}`);
    const imageName = 'Give me a name';


    if (type == 'report') {

      this.reportImages.push({
        id: Date.now(),
        base64: "data:image/jpeg;base64, " + image.base64String,
        blobData: blobData,
        format: image.format
      });

    } else if (type == 'quotation') {

      this.quotationImages.push({
        id: Date.now(),
        base64: "data:image/jpeg;base64, " + image.base64String,
        blobData: blobData,
        format: image.format
      });

    }

    // const blobData = this.b64toBlob(image.base64String, `image/${image.format}`);
    // const imageName = 'Give me a name';

    // this.api.uploadImage(blobData, imageName, image.format).subscribe((newImage: ApiImage) => {
    //   this.images.push(newImage);
    // });
  }

  private async readAsBase64(photo: Photo) {
    if (this.plt.is('hybrid')) {
      const file = await Filesystem.readFile({
        path: photo.path
      });

      return file.data;
    }
    else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(photo.webPath);
      const blob = await response.blob();

      return await this.convertBlobToBase64(blob) as string;
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

  // Used for browser direct file upload
  // uploadFile(event: EventTarget) {
  //   const eventObj: MSInputMethodContext = event as MSInputMethodContext;
  //   const target: HTMLInputElement = eventObj.target as HTMLInputElement;
  //   const file: File = target.files[0];
  //   this.api.uploadImageFile(file).subscribe((newImage: ApiImage) => {
  //     this.images.push(newImage);
  //   });
  // }

  // deleteImage(image: ApiImage, index) {
  //   this.api.deleteImage(image._id).subscribe(res => {
  //     this.images.splice(index, 1);
  //   });
  // }

  // Helper function
  // https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
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

  addClaim() {

    console.log('add');
    this.presentLoading();

    let data: any = {};
    data = this.ionicForm.value;
    data.status = 'pending';
    data.created_by = this.staff.user_id;

    this.authService.addClaim(data).subscribe(
      result => {

        this.dissmissLoading();
        this.presentToast('Claim added successfully');
        // this.isSubmitted = true;
        // this.navCtrl.back();
        console.log(result);

        // if (data && data) {
        // }
      }, error => {
        console.log(error);
        this.dissmissLoading();
        this.presentToast(error.error.message);
      });

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
