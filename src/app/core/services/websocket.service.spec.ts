import { TestBed } from '@angular/core/testing';

import { WebsocketService } from './websocket.service';

describe('WebsocketService', () => {
  let service: WebsocketService;
  let originalWebSocket: unknown;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebsocketService);
    originalWebSocket = (window as unknown as { WebSocket: unknown }).WebSocket;
  });

  afterEach(() => {
    (window as unknown as { WebSocket: unknown }).WebSocket = originalWebSocket;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('P-06: connect não abre o socket — cria apenas o Subject', () => {
    const openSpy = jasmine.createSpy('openSpy');
    (window as unknown as { WebSocket: unknown }).WebSocket = jasmine
      .createSpy('WebSocket')
      .and.callFake(() => {
        openSpy();
        return { readyState: WebSocket.CONNECTING, send: jasmine.createSpy('send'), close: jasmine.createSpy('close') };
      });

    service.connect('http://localhost:8000/api/v1/ws/find_movie/');

    expect(openSpy).not.toHaveBeenCalled();
  });

  it('P-03/P-06: mensagens enviadas antes do OPEN são enfileiradas e despachadas no onopen', () => {
    const sendSpy = jasmine.createSpy('send');
    const fakeSocket: {
      readyState: number;
      send: jasmine.Spy;
      close: jasmine.Spy;
      onopen: (() => void) | null;
    } = {
      readyState: WebSocket.CONNECTING,
      send: sendSpy,
      close: jasmine.createSpy('close'),
      onopen: null,
    };
    (window as unknown as { WebSocket: unknown }).WebSocket = jasmine
      .createSpy('WebSocket')
      .and.returnValue(fakeSocket);

    const subject = service.connect('http://localhost:8000/api/v1/ws/find_movie/');
    const subscriber = jasmine.createSpyObj('subscriber', ['next', 'error', 'complete']);
    subject.subscribe(subscriber);

    subject.next('Avatar');

    expect(sendSpy).not.toHaveBeenCalled();
    expect(fakeSocket.onopen).toBeTruthy();

    fakeSocket.readyState = WebSocket.OPEN;
    fakeSocket.onopen!();
    expect(sendSpy).toHaveBeenCalledOnceWith('Avatar');
  });
});