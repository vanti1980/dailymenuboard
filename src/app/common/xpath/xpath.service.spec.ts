import {provide, Injector} from '@angular/core';
import {describe, expect, it, xit, inject, fakeAsync, beforeEachProviders} from '@angular/core/testing';
import {
    BaseRequestOptions,
    Response,
    ResponseOptions,
    ConnectionBackend,
    Http
} from '@angular/http';
import {MockBackend} from '@angular/http/testing';

import {XpathService} from './xpath.service.ts';

describe('Test XpathService', () => {

    beforeEachProviders(() => {
        return [
            BaseRequestOptions,
            MockBackend,
            provide(Http, {
                useFactory:
                function(backend, defaultOptions) {
                    return new Http(backend, defaultOptions);
                },
                deps: [MockBackend, BaseRequestOptions]
            }),
            XpathService
        ];
    });

    it(' should correctly resolve XPath', inject([XpathService, MockBackend], (testService, mockBackend) => {
        mockBackend.connections.subscribe((conn) => {
            expect(conn.request.url).toBe('http://somedomain.com');
            let response = new ResponseOptions({ body: "<html><body><div id='header'>header</div><div id='content'>content</div></body></html>" });
            conn.mockRespond(new Response(response));
        });
        var obs = testService.resolveXPath('http://somedomain.com', '//div[@id="header"]/following-sibling::div');
        obs.subscribe((data) => {
            expect(data).toBe('content');
        });
    }));

});
