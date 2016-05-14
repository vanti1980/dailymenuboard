import {
  it,
  inject,
  injectAsync,
  beforeEachProviders
} from '@angular/core/testing';
import {TestComponentBuilder} from '@angular/compiler/testing';

import {App} from './app.component';

describe('App', () => {
  beforeEachProviders(() => [
    App
  ]);
});
