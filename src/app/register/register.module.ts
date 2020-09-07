import { RegisterRoutingModule } from './register-routing..module';
import { MaterialModule } from './../material.module';
import { CommonModule } from '@angular/common';
import { RegisterComponent } from './register.component';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [RegisterComponent],
  providers: [],
  imports: [CommonModule, RegisterRoutingModule, ReactiveFormsModule, MaterialModule],
  exports: [RegisterComponent],
})

export class RegisterModule {

}
