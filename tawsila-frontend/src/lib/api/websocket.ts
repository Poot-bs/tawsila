import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WS_URL } from '@/lib/utils/constants';

class WebSocketClient {
  private client: Client | null = null;
  private connected = false;
  private connectCount = 0;
  private onConnectCallbacks: Array<() => void> = [];
  private onErrorCallbacks: Array<(err: any) => void> = [];

  connect(token: string, onConnect: () => void, onError: (err: any) => void) {
    this.connectCount += 1;

    if (this.client && this.connected) {
      onConnect();
      return;
    }

    this.onConnectCallbacks.push(onConnect);
    this.onErrorCallbacks.push(onError);

    if (this.client && !this.connected) {
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL.replace('ws://', 'http://').replace('wss://', 'https://')),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      this.connected = true;
      this.onConnectCallbacks.forEach((cb) => cb());
      this.onConnectCallbacks = [];
    };

    this.client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
      this.onErrorCallbacks.forEach((cb) => cb(frame));
      this.onErrorCallbacks = [];
    };

    this.client.activate();
  }

  disconnect() {
    if (this.connectCount > 0) {
      this.connectCount -= 1;
    }

    if (this.client && this.connectCount === 0) {
      this.client.deactivate();
      this.connected = false;
      this.onConnectCallbacks = [];
      this.onErrorCallbacks = [];
    }
  }

  subscribe(topic: string, callback: (message: any) => void) {
    if (!this.client || !this.connected) {
      console.error('Cannot subscribe: STOMP client is not connected.');
      return null;
    }

    return this.client.subscribe(topic, (message) => {
      if (message.body) {
        try {
          callback(JSON.parse(message.body));
        } catch (e) {
          callback(message.body);
        }
      } else {
        callback(null);
      }
    });
  }

  send(destination: string, body: any) {
    if (!this.client || !this.connected) {
      console.error('Cannot send message: STOMP client is not connected.');
      return;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }
}

export const wsClient = new WebSocketClient();
