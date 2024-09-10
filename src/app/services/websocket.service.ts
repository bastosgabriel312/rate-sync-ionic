import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private ws!: WebSocket;
  private subject!: Subject<any>;

  constructor() { }

  connect(url: string): Subject<any> {
    if (!this.subject) {
      this.subject = this.create(url);
    }
    return this.subject;
  }

  private create(url: string): Subject<any> {
    this.ws = new WebSocket(url);

    const observable = new Observable(observer => {
      this.ws.onmessage = (event) => observer.next(event.data);
      this.ws.onerror = (event) => observer.error(event);
      this.ws.onclose = () => observer.complete();
      return () => this.ws.close();
    });

    const observer = {
      next: (data: Object) => {
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify(data));
        }
      }
    };

    return Subject.create(observer, observable);
  }
}
