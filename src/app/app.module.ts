import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import {MatSliderModule} from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { CoreModule } from './core/core.module';
import { LogsComponent } from './logs/logs.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { QuillModule } from 'ngx-quill';
import Quill from 'quill';
import ImageResize from 'quill-image-resize';

Quill.register('modules/imageResize', ImageResize);

@NgModule({ declarations: [
        AppComponent,
        LogsComponent,
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        FormsModule,
        MatSliderModule,
        CoreModule,
        BrowserAnimationsModule,
        MatDialogModule,
        QuillModule.forRoot()], providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule { }
