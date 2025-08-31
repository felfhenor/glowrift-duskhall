import { AppComponent } from '@/app/app.component';
import { appConfig } from '@/app/app.config';
import { enableProfiling } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

enableProfiling();
bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err),
);
