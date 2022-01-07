import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-image-preview',
  templateUrl: './image-preview.page.html',
  styleUrls: ['./image-preview.page.scss'],
})
export class ImagePreviewPage implements OnInit {

  src;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      if (params && params.src) {
        this.src = params.src;
        console.log(this.src);
      }
    });
  }

}
