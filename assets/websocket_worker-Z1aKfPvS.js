import { d as debug } from "./index-Kx0mckbv.js";
const MAX_SIZE = 524288;
const log = debug("websocket");
log("webworker started");
class SocketWorker {
  constructor(postMessage) {
    this.sendToParent = postMessage || this.sendMessage.bind(this);
  }
  postMessage(event) {
    this.processEvent({ data: event });
  }
  sendMessage(event) {
    this.onmessage({ data: event });
  }
  processEvent(event) {
    let e = event.data;
    if (e.action == "connect")
      this.connect(e.endpoint);
    else if (e.action == "emit")
      this.emit(e.event, e.data);
    else if (e.action == "heartbeat")
      this.heartbeat();
    else if (e.action == "close")
      this.close();
  }
  connect(endpoint) {
    let socket = null;
    try {
      log("connecting to", endpoint);
      socket = new WebSocket(endpoint);
    } catch (ex) {
      log("Failed to connect", ex);
    }
    if (socket) {
      socket.onmessage = (e) => {
        this.sendToParent({ type: "message", data: e.data });
      };
      socket.onopen = (e) => {
        log("connected");
        this.sendToParent({ type: "connect" });
      };
      socket.onclose = (e) => {
        log("closed");
        this.sendToParent({
          type: "disconnect",
          data: {
            code: e.code,
            reason: e.reason
          }
        });
      };
      this.socket = socket;
      if (socket.readyState == WebSocket.OPEN)
        socket.onopen();
    } else {
      log("no socket created");
    }
  }
  emit(event, data = {}) {
    let packet = JSON.stringify([event, data]);
    if (packet.length > MAX_SIZE) {
      let code = Math.floor(Math.random() * 1e4);
      let pages = Math.ceil(packet.length / MAX_SIZE);
      for (let x = 0; x < pages; x += 1) {
        this.socket.send(`p${code}-${x + 1}-${pages}:` + packet.slice(x * MAX_SIZE, (x + 1) * MAX_SIZE));
        log("sent page", code, x, pages);
      }
    } else {
      this.socket.send(packet);
      log("sent");
    }
  }
  heartbeat() {
    this.socket.send(JSON.stringify(["heartbeat", null]));
  }
  close() {
    this.socket.close();
  }
}
export {
  SocketWorker as default
};
