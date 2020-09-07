import { LoginRoutingModule } from './login-routing.module';
import { MaterialModule } from './../material.module';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [LoginComponent],
  imports: [CommonModule, LoginRoutingModule, ReactiveFormsModule, MaterialModule],
  exports: [LoginComponent],
})
export class LoginModule {}
