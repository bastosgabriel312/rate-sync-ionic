import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

interface SocketObserver {
  next: (value: string) => void;
  error: (err: unknown) => void;
  complete: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private ws!: WebSocket;
  private subject!: Subject<string>;
  private pendingQueue: string[] = [];
  private subscriber: SocketObserver | null = null;

  // reconnection/backoff state
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 8; // caps backoff
  private baseDelayMs = 500; // base for exponential backoff

  constructor() { }

  connect(url: string): Subject<string> {
    if (!this.subject) {
      this.subject = this.create(url);
    }
    return this.subject;
  }

  private toWsUrl(url: string): string {
    return url.replace(/^http/, 'ws');
  }

  private create(url: string): Subject<string> {
    // Observable that pushes incoming websocket messages to subscribers
    const observable = new Observable<string>(observer => {
      this.subscriber = observer;
      this.open(url);
      return () => {
        this.subscriber = null;
        try { this.ws.close(); } catch (e) { /* ignore */ }
      };
    });

    // wrapper subject that sends outgoing messages through the websocket
    const rxSubject = new Subject<string>();

    // forward incoming messages from observable into rxSubject
    observable.subscribe({
      next: (v) => rxSubject.next(v),
      error: (e) => rxSubject.error(e),
      complete: () => rxSubject.complete(),
    });

    const send = (data: string) => {
      if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
        this.open(url);
      }
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(data);
      } else {
        this.pendingQueue.push(data);
      }
    };

    // return an object compatible with Subject<string>
    const proxy = {
      next: send,
      subscribe: rxSubject.subscribe.bind(rxSubject),
      asObservable: () => rxSubject.asObservable(),
      // minimal Subject-like interface
    } as unknown as Subject<string>;

    return proxy;
  }

  private open(url: string) {
    console.debug('[WebsocketService] opening', url);
    try {
      this.ws = new WebSocket(this.toWsUrl(url));
    } catch (e) {
      console.error('[WebsocketService] failed to create WebSocket', e);
      return;
    }

    this.ws.onopen = () => {
      console.debug('[WebsocketService] ws open');
      // reset reconnect attempts on successful open
      this.reconnectAttempts = 0;
      // flush pending messages
      while (this.pendingQueue.length > 0) {
        const msg = this.pendingQueue.shift() as string;
        try {
          if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(msg);
          }
        } catch (e) {
          console.error('[WebsocketService] error sending pending message', e);
          this.pendingQueue.unshift(msg);
          break;
        }
      }
    };

    // always attach handlers so incoming data isn't missed even if subscriber is set later
    this.ws.onmessage = (event) => {
      if (this.subscriber) {
        this.subscriber.next(event.data);
      } else {
        // if no subscriber yet, forward to rxSubject via asObservable path if available
        console.debug('[WebsocketService] message received but no subscriber set');
      }
    };

    this.ws.onerror = (event) => {
      console.error('[WebsocketService] ws error', event);
      if (this.subscriber) {
        this.subscriber.error(event);
      }
    };

    this.ws.onclose = (event) => {
      console.warn('[WebsocketService] ws closed', event);
      if (this.subscriber) {
        this.subscriber.complete();
      }
      // schedule reconnect attempt with exponential backoff
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        const delay = Math.min(this.baseDelayMs * (2 ** this.reconnectAttempts), 60000);
        this.reconnectAttempts += 1;
        console.debug('[WebsocketService] attempting reconnect in', delay, 'ms');
        setTimeout(() => {
          this.open(url);
        }, delay);
      } else {
        console.warn('[WebsocketService] max reconnect attempts reached');
      }
    };
  }
}