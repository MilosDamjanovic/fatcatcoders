import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  public isDisplayed = false;

  constructor() { }

  public hide(): void {
    this.isDisplayed = false;
  }
  public show(): void {
    this.isDisplayed = true;
  }
}
