import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './material.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { AppService } from '../app/core/services/app.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SnackbarService } from './core/services/snackbar.service';
import { LoaderService } from './core/services/loader.service';
import { LoaderComponent } from './core/components/loader.component';

@NgModule({
  declarations: [
    AppComponent,
    LoaderComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserModule,
    MaterialModule,
  ],
  providers: [AppService],
  bootstrap: [AppComponent]
})
export class AppModule { }
