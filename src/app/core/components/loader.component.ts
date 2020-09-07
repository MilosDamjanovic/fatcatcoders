import { LoaderService } from './../services/loader.service';
import { Component } from '@angular/core';

@Component({
  selector: 'ttd-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
})
export class LoaderComponent {
  constructor(private loaderService: LoaderService) { }

  show(): boolean {
    return this.loaderService.isDisplayed;
  }
}
