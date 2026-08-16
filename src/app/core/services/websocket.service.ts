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
    const observable = new Observable<string>(observer => {
      this.subscriber = observer;
      this.open(url);
      return () => {
        this.subscriber = null;
        this.ws.close();
      };
    });

    const observer = {
      next: (data: string) => {
        if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
          this.open(url);
        }
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(data);
        } else {
          this.pendingQueue.push(data);
        }
      }
    };

    return Subject.create(observer, observable);
  }

  private open(url: string) {
    this.ws = new WebSocket(this.toWsUrl(url));
    this.ws.onopen = () => {
      while (this.pendingQueue.length > 0) {
        const msg = this.pendingQueue.shift() as string;
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(msg);
        }
      }
    };
    if (this.subscriber) {
      this.ws.onmessage = (event) => this.subscriber!.next(event.data);
      this.ws.onerror = (event) => this.subscriber!.error(event);
      this.ws.onclose = () => this.subscriber!.complete();
    }
  }
}