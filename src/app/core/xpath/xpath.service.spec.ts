import {provide, Injector} from '@angular/core';
import {describe, expect, it, xit, inject, async, fakeAsync, beforeEachProviders} from '@angular/core/testing';

import {Observable} from 'rxjs/Rx';

import {XpathService} from './xpath.service.ts';

describe('Test XpathService', () => {

  beforeEachProviders(() => {
      return [
          XpathService
      ];
    });

    it(' should correctly resolve XPath', async(inject([XpathService], (testService: XpathService) => {
        spyOn(testService, 'getXDomainContent').and.callFake(url => {
          expect(url).toEqual('http://somedomain.com');
          return Observable.of("<html><body><div id='header'>header</div><div id='content'>content</div></body></html>");
        });

        var obs = testService.loadAndResolveXPaths('http://somedomain.com', '//div[@id="header"]/following-sibling::div');
        obs.subscribe(data => {
            expect(data.url).toEqual('http://somedomain.com');
            expect(data.xpathResult).toEqual({'//div[@id="header"]/following-sibling::div':'content'});
        });
    })));

});
