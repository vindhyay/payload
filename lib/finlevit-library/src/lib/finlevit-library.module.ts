import { NgModule } from '@angular/core';
import { FinlevitLibraryComponent } from './finlevit-library.component';
import { InputComponent } from './input/input.component';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { HttpClientModule } from '@angular/common/http';
import { CardComponent } from './card/card.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabsComponent } from './tabs/tabs.component';
import { NumberComponent } from './number/number.component';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaComponent } from './textarea/textarea.component';
import { SelectComponent } from './select/select.component';
import { MultiSelectComponent } from './multi-select/multi-select.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioGroupComponent } from './radio-group/radio-group.component';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxGroupComponent } from './checkbox-group/checkbox-group.component';
import { ButtonComponent } from './button/button.component';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DatepickerComponent } from './datepicker/datepicker.component';
import { CalendarModule } from 'primeng/calendar';
import {TableModule} from "primeng/table";
import { NgxMaskModule } from 'ngx-mask';

import { TableComponent } from './table/table.component';
import { FinlevitFileUploadComponent } from "./finlevit-file-upload/finlevit-file-upload.component";
import { LoaderComponent } from "./loader/loader.component";
import { NgxLoadingModule } from "ngx-loading";

@NgModule({
  declarations: [
    FinlevitLibraryComponent,
    InputComponent,
    CardComponent,
    TabsComponent,
    NumberComponent,
    CheckboxComponent,
    TextareaComponent,
    SelectComponent,
    MultiSelectComponent,
    CheckboxGroupComponent,
    RadioGroupComponent,
    DatepickerComponent,
    ButtonComponent,
    TableComponent,
    FinlevitFileUploadComponent,
    LoaderComponent
  ],
  imports: [
    CalendarModule,
    InputMaskModule,
    InputTextModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    HttpClientModule,
    InputNumberModule,
    DropdownModule,
    TooltipModule,
    TabMenuModule,
    CheckboxModule,
    InputTextareaModule,
    MultiSelectModule,
    RadioButtonModule,
    ButtonModule,
    RippleModule,
    TableModule,
    NgxMaskModule.forRoot({}),
    NgxLoadingModule
  ],
  exports: [
    FinlevitLibraryComponent,
    InputComponent,
    CardComponent,
    TabsComponent,
    NumberComponent,
    CheckboxComponent,
    TextareaComponent,
    SelectComponent,
    MultiSelectComponent,
    CheckboxGroupComponent,
    RadioGroupComponent,
    DatepickerComponent,
    ButtonComponent,
    TableComponent,
    TableModule,
    FinlevitFileUploadComponent,
    LoaderComponent
  ]
})
export class FinlevitLibraryModule {}
