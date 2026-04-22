/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { NgZone } from '@angular/core';

bootstrapApplication(App, appConfig)
  .then((appRef) => {
    // Application bootstrapped successfully
  })
  .catch((err) => console.error(err));
