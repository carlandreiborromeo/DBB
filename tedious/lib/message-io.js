"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _nativeDuplexpair = _interopRequireDefault(require("native-duplexpair"));
var tls = _interopRequireWildcard(require("tls"));
var _events = require("events");
var _message = _interopRequireDefault(require("./message"));
var _packet = require("./packet");
var _incomingMessageStream = _interopRequireDefault(require("./incoming-message-stream"));
var _outgoingMessageStream = _interopRequireDefault(require("./outgoing-message-stream"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class MessageIO extends _events.EventEmitter {
  constructor(socket, packetSize, debug) {
    super();
    this.socket = socket;
    this.debug = debug;
    this.tlsNegotiationComplete = false;
    this.incomingMessageStream = new _incomingMessageStream.default(this.debug);
    this.incomingMessageIterator = this.incomingMessageStream[Symbol.asyncIterator]();
    this.outgoingMessageStream = new _outgoingMessageStream.default(this.debug, {
      packetSize: packetSize
    });
    this.socket.pipe(this.incomingMessageStream);
    this.outgoingMessageStream.pipe(this.socket);
  }
  packetSize(...args) {
    if (args.length > 0) {
      const packetSize = args[0];
      this.debug.log('Packet size changed from ' + this.outgoingMessageStream.packetSize + ' to ' + packetSize);
      this.outgoingMessageStream.packetSize = packetSize;
    }
    if (this.securePair) {
      this.securePair.cleartext.setMaxSendFragment(this.outgoingMessageStream.packetSize);
    }
    return this.outgoingMessageStream.packetSize;
  }

  // Negotiate TLS encryption.
  startTls(credentialsDetails, hostname, trustServerCertificate) {
    if (!credentialsDetails.maxVersion || !['TLSv1.2', 'TLSv1.1', 'TLSv1'].includes(credentialsDetails.maxVersion)) {
      credentialsDetails.maxVersion = 'TLSv1.2';
    }
    const secureContext = tls.createSecureContext(credentialsDetails);
    return new Promise((resolve, reject) => {
      const duplexpair = new _nativeDuplexpair.default();
      const securePair = this.securePair = {
        cleartext: tls.connect({
          socket: duplexpair.socket1,
          servername: hostname,
          secureContext: secureContext,
          rejectUnauthorized: !trustServerCertificate
        }),
        encrypted: duplexpair.socket2
      };
      const onSecureConnect = () => {
        securePair.encrypted.removeListener('readable', onReadable);
        securePair.cleartext.removeListener('error', onError);
        securePair.cleartext.removeListener('secureConnect', onSecureConnect);

        // If we encounter any errors from this point on,
        // we just forward them to the actual network socket.
        securePair.cleartext.once('error', err => {
          this.socket.destroy(err);
        });
        const cipher = securePair.cleartext.getCipher();
        if (cipher) {
          this.debug.log('TLS negotiated (' + cipher.name + ', ' + cipher.version + ')');
        }
        this.emit('secure', securePair.cleartext);
        securePair.cleartext.setMaxSendFragment(this.outgoingMessageStream.packetSize);
        this.outgoingMessageStream.unpipe(this.socket);
        this.socket.unpipe(this.incomingMessageStream);
        this.socket.pipe(securePair.encrypted);
        securePair.encrypted.pipe(this.socket);
        securePair.cleartext.pipe(this.incomingMessageStream);
        this.outgoingMessageStream.pipe(securePair.cleartext);
        this.tlsNegotiationComplete = true;
        resolve();
      };
      const onError = err => {
        securePair.encrypted.removeListener('readable', onReadable);
        securePair.cleartext.removeListener('error', onError);
        securePair.cleartext.removeListener('secureConnect', onSecureConnect);
        securePair.cleartext.destroy();
        securePair.encrypted.destroy();
        reject(err);
      };
      const onReadable = () => {
        // When there is handshake data on the encrypted stream of the secure pair,
        // we wrap it into a `PRELOGIN` message and send it to the server.
        //
        // For each `PRELOGIN` message we sent we get back exactly one response message
        // that contains the server's handshake response data.
        const message = new _message.default({
          type: _packet.TYPE.PRELOGIN,
          resetConnection: false
        });
        let chunk;
        while (chunk = securePair.encrypted.read()) {
          message.write(chunk);
        }
        this.outgoingMessageStream.write(message);
        message.end();
        this.readMessage().then(async response => {
          // Setup readable handler for the next round of handshaking.
          // If we encounter a `secureConnect` on the cleartext side
          // of the secure pair, the `readable` handler is cleared
          // and no further handshake handling will happen.
          securePair.encrypted.once('readable', onReadable);
          for await (const data of response) {
            // We feed the server's handshake response back into the
            // encrypted end of the secure pair.
            securePair.encrypted.write(data);
          }
        }).catch(onError);
      };
      securePair.cleartext.once('error', onError);
      securePair.cleartext.once('secureConnect', onSecureConnect);
      securePair.encrypted.once('readable', onReadable);
    });
  }

  // TODO listen for 'drain' event when socket.write returns false.
  // TODO implement incomplete request cancelation (2.2.1.6)
  sendMessage(packetType, data, resetConnection) {
    const message = new _message.default({
      type: packetType,
      resetConnection: resetConnection
    });
    message.end(data);
    this.outgoingMessageStream.write(message);
    return message;
  }

  /**
   * Read the next incoming message from the socket.
   */
  async readMessage() {
    const result = await this.incomingMessageIterator.next();
    if (result.done) {
      throw new Error('unexpected end of message stream');
    }
    return result.value;
  }
}
var _default = exports.default = MessageIO;
module.exports = MessageIO;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfbmF0aXZlRHVwbGV4cGFpciIsIl9pbnRlcm9wUmVxdWlyZURlZmF1bHQiLCJyZXF1aXJlIiwidGxzIiwiX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQiLCJfZXZlbnRzIiwiX21lc3NhZ2UiLCJfcGFja2V0IiwiX2luY29taW5nTWVzc2FnZVN0cmVhbSIsIl9vdXRnb2luZ01lc3NhZ2VTdHJlYW0iLCJfZ2V0UmVxdWlyZVdpbGRjYXJkQ2FjaGUiLCJlIiwiV2Vha01hcCIsInIiLCJ0IiwiX19lc01vZHVsZSIsImRlZmF1bHQiLCJoYXMiLCJnZXQiLCJuIiwiX19wcm90b19fIiwiYSIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yIiwidSIsInByb3RvdHlwZSIsImhhc093blByb3BlcnR5IiwiY2FsbCIsImkiLCJzZXQiLCJvYmoiLCJNZXNzYWdlSU8iLCJFdmVudEVtaXR0ZXIiLCJjb25zdHJ1Y3RvciIsInNvY2tldCIsInBhY2tldFNpemUiLCJkZWJ1ZyIsInRsc05lZ290aWF0aW9uQ29tcGxldGUiLCJpbmNvbWluZ01lc3NhZ2VTdHJlYW0iLCJJbmNvbWluZ01lc3NhZ2VTdHJlYW0iLCJpbmNvbWluZ01lc3NhZ2VJdGVyYXRvciIsIlN5bWJvbCIsImFzeW5jSXRlcmF0b3IiLCJvdXRnb2luZ01lc3NhZ2VTdHJlYW0iLCJPdXRnb2luZ01lc3NhZ2VTdHJlYW0iLCJwaXBlIiwiYXJncyIsImxlbmd0aCIsImxvZyIsInNlY3VyZVBhaXIiLCJjbGVhcnRleHQiLCJzZXRNYXhTZW5kRnJhZ21lbnQiLCJzdGFydFRscyIsImNyZWRlbnRpYWxzRGV0YWlscyIsImhvc3RuYW1lIiwidHJ1c3RTZXJ2ZXJDZXJ0aWZpY2F0ZSIsIm1heFZlcnNpb24iLCJpbmNsdWRlcyIsInNlY3VyZUNvbnRleHQiLCJjcmVhdGVTZWN1cmVDb250ZXh0IiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJkdXBsZXhwYWlyIiwiRHVwbGV4UGFpciIsImNvbm5lY3QiLCJzb2NrZXQxIiwic2VydmVybmFtZSIsInJlamVjdFVuYXV0aG9yaXplZCIsImVuY3J5cHRlZCIsInNvY2tldDIiLCJvblNlY3VyZUNvbm5lY3QiLCJyZW1vdmVMaXN0ZW5lciIsIm9uUmVhZGFibGUiLCJvbkVycm9yIiwib25jZSIsImVyciIsImRlc3Ryb3kiLCJjaXBoZXIiLCJnZXRDaXBoZXIiLCJuYW1lIiwidmVyc2lvbiIsImVtaXQiLCJ1bnBpcGUiLCJtZXNzYWdlIiwiTWVzc2FnZSIsInR5cGUiLCJUWVBFIiwiUFJFTE9HSU4iLCJyZXNldENvbm5lY3Rpb24iLCJjaHVuayIsInJlYWQiLCJ3cml0ZSIsImVuZCIsInJlYWRNZXNzYWdlIiwidGhlbiIsInJlc3BvbnNlIiwiZGF0YSIsImNhdGNoIiwic2VuZE1lc3NhZ2UiLCJwYWNrZXRUeXBlIiwicmVzdWx0IiwibmV4dCIsImRvbmUiLCJFcnJvciIsInZhbHVlIiwiX2RlZmF1bHQiLCJleHBvcnRzIiwibW9kdWxlIl0sInNvdXJjZXMiOlsiLi4vc3JjL21lc3NhZ2UtaW8udHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IER1cGxleFBhaXIgZnJvbSAnbmF0aXZlLWR1cGxleHBhaXInO1xuXG5pbXBvcnQgeyBEdXBsZXggfSBmcm9tICdzdHJlYW0nO1xuaW1wb3J0ICogYXMgdGxzIGZyb20gJ3Rscyc7XG5pbXBvcnQgeyBTb2NrZXQgfSBmcm9tICduZXQnO1xuaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJztcblxuaW1wb3J0IERlYnVnIGZyb20gJy4vZGVidWcnO1xuXG5pbXBvcnQgTWVzc2FnZSBmcm9tICcuL21lc3NhZ2UnO1xuaW1wb3J0IHsgVFlQRSB9IGZyb20gJy4vcGFja2V0JztcblxuaW1wb3J0IEluY29taW5nTWVzc2FnZVN0cmVhbSBmcm9tICcuL2luY29taW5nLW1lc3NhZ2Utc3RyZWFtJztcbmltcG9ydCBPdXRnb2luZ01lc3NhZ2VTdHJlYW0gZnJvbSAnLi9vdXRnb2luZy1tZXNzYWdlLXN0cmVhbSc7XG5cbmNsYXNzIE1lc3NhZ2VJTyBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIGRlY2xhcmUgc29ja2V0OiBTb2NrZXQ7XG4gIGRlY2xhcmUgZGVidWc6IERlYnVnO1xuXG4gIGRlY2xhcmUgdGxzTmVnb3RpYXRpb25Db21wbGV0ZTogYm9vbGVhbjtcblxuICBkZWNsYXJlIHByaXZhdGUgaW5jb21pbmdNZXNzYWdlU3RyZWFtOiBJbmNvbWluZ01lc3NhZ2VTdHJlYW07XG4gIGRlY2xhcmUgb3V0Z29pbmdNZXNzYWdlU3RyZWFtOiBPdXRnb2luZ01lc3NhZ2VTdHJlYW07XG5cbiAgZGVjbGFyZSBzZWN1cmVQYWlyPzoge1xuICAgIGNsZWFydGV4dDogdGxzLlRMU1NvY2tldDtcbiAgICBlbmNyeXB0ZWQ6IER1cGxleDtcbiAgfTtcblxuICBkZWNsYXJlIGluY29taW5nTWVzc2FnZUl0ZXJhdG9yOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8TWVzc2FnZT47XG5cbiAgY29uc3RydWN0b3Ioc29ja2V0OiBTb2NrZXQsIHBhY2tldFNpemU6IG51bWJlciwgZGVidWc6IERlYnVnKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuc29ja2V0ID0gc29ja2V0O1xuICAgIHRoaXMuZGVidWcgPSBkZWJ1ZztcblxuICAgIHRoaXMudGxzTmVnb3RpYXRpb25Db21wbGV0ZSA9IGZhbHNlO1xuXG4gICAgdGhpcy5pbmNvbWluZ01lc3NhZ2VTdHJlYW0gPSBuZXcgSW5jb21pbmdNZXNzYWdlU3RyZWFtKHRoaXMuZGVidWcpO1xuICAgIHRoaXMuaW5jb21pbmdNZXNzYWdlSXRlcmF0b3IgPSB0aGlzLmluY29taW5nTWVzc2FnZVN0cmVhbVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTtcblxuICAgIHRoaXMub3V0Z29pbmdNZXNzYWdlU3RyZWFtID0gbmV3IE91dGdvaW5nTWVzc2FnZVN0cmVhbSh0aGlzLmRlYnVnLCB7IHBhY2tldFNpemU6IHBhY2tldFNpemUgfSk7XG5cbiAgICB0aGlzLnNvY2tldC5waXBlKHRoaXMuaW5jb21pbmdNZXNzYWdlU3RyZWFtKTtcbiAgICB0aGlzLm91dGdvaW5nTWVzc2FnZVN0cmVhbS5waXBlKHRoaXMuc29ja2V0KTtcbiAgfVxuXG4gIHBhY2tldFNpemUoLi4uYXJnczogW251bWJlcl0pIHtcbiAgICBpZiAoYXJncy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBwYWNrZXRTaXplID0gYXJnc1swXTtcbiAgICAgIHRoaXMuZGVidWcubG9nKCdQYWNrZXQgc2l6ZSBjaGFuZ2VkIGZyb20gJyArIHRoaXMub3V0Z29pbmdNZXNzYWdlU3RyZWFtLnBhY2tldFNpemUgKyAnIHRvICcgKyBwYWNrZXRTaXplKTtcbiAgICAgIHRoaXMub3V0Z29pbmdNZXNzYWdlU3RyZWFtLnBhY2tldFNpemUgPSBwYWNrZXRTaXplO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnNlY3VyZVBhaXIpIHtcbiAgICAgIHRoaXMuc2VjdXJlUGFpci5jbGVhcnRleHQuc2V0TWF4U2VuZEZyYWdtZW50KHRoaXMub3V0Z29pbmdNZXNzYWdlU3RyZWFtLnBhY2tldFNpemUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLm91dGdvaW5nTWVzc2FnZVN0cmVhbS5wYWNrZXRTaXplO1xuICB9XG5cbiAgLy8gTmVnb3RpYXRlIFRMUyBlbmNyeXB0aW9uLlxuICBzdGFydFRscyhjcmVkZW50aWFsc0RldGFpbHM6IHRscy5TZWN1cmVDb250ZXh0T3B0aW9ucywgaG9zdG5hbWU6IHN0cmluZywgdHJ1c3RTZXJ2ZXJDZXJ0aWZpY2F0ZTogYm9vbGVhbikge1xuICAgIGlmICghY3JlZGVudGlhbHNEZXRhaWxzLm1heFZlcnNpb24gfHwgIVsnVExTdjEuMicsICdUTFN2MS4xJywgJ1RMU3YxJ10uaW5jbHVkZXMoY3JlZGVudGlhbHNEZXRhaWxzLm1heFZlcnNpb24pKSB7XG4gICAgICBjcmVkZW50aWFsc0RldGFpbHMubWF4VmVyc2lvbiA9ICdUTFN2MS4yJztcbiAgICB9XG5cbiAgICBjb25zdCBzZWN1cmVDb250ZXh0ID0gdGxzLmNyZWF0ZVNlY3VyZUNvbnRleHQoY3JlZGVudGlhbHNEZXRhaWxzKTtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBkdXBsZXhwYWlyID0gbmV3IER1cGxleFBhaXIoKTtcbiAgICAgIGNvbnN0IHNlY3VyZVBhaXIgPSB0aGlzLnNlY3VyZVBhaXIgPSB7XG4gICAgICAgIGNsZWFydGV4dDogdGxzLmNvbm5lY3Qoe1xuICAgICAgICAgIHNvY2tldDogZHVwbGV4cGFpci5zb2NrZXQxIGFzIFNvY2tldCxcbiAgICAgICAgICBzZXJ2ZXJuYW1lOiBob3N0bmFtZSxcbiAgICAgICAgICBzZWN1cmVDb250ZXh0OiBzZWN1cmVDb250ZXh0LFxuICAgICAgICAgIHJlamVjdFVuYXV0aG9yaXplZDogIXRydXN0U2VydmVyQ2VydGlmaWNhdGVcbiAgICAgICAgfSksXG4gICAgICAgIGVuY3J5cHRlZDogZHVwbGV4cGFpci5zb2NrZXQyXG4gICAgICB9O1xuXG4gICAgICBjb25zdCBvblNlY3VyZUNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICAgIHNlY3VyZVBhaXIuZW5jcnlwdGVkLnJlbW92ZUxpc3RlbmVyKCdyZWFkYWJsZScsIG9uUmVhZGFibGUpO1xuICAgICAgICBzZWN1cmVQYWlyLmNsZWFydGV4dC5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBvbkVycm9yKTtcbiAgICAgICAgc2VjdXJlUGFpci5jbGVhcnRleHQucmVtb3ZlTGlzdGVuZXIoJ3NlY3VyZUNvbm5lY3QnLCBvblNlY3VyZUNvbm5lY3QpO1xuXG4gICAgICAgIC8vIElmIHdlIGVuY291bnRlciBhbnkgZXJyb3JzIGZyb20gdGhpcyBwb2ludCBvbixcbiAgICAgICAgLy8gd2UganVzdCBmb3J3YXJkIHRoZW0gdG8gdGhlIGFjdHVhbCBuZXR3b3JrIHNvY2tldC5cbiAgICAgICAgc2VjdXJlUGFpci5jbGVhcnRleHQub25jZSgnZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgICAgICAgdGhpcy5zb2NrZXQuZGVzdHJveShlcnIpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBjaXBoZXIgPSBzZWN1cmVQYWlyLmNsZWFydGV4dC5nZXRDaXBoZXIoKTtcbiAgICAgICAgaWYgKGNpcGhlcikge1xuICAgICAgICAgIHRoaXMuZGVidWcubG9nKCdUTFMgbmVnb3RpYXRlZCAoJyArIGNpcGhlci5uYW1lICsgJywgJyArIGNpcGhlci52ZXJzaW9uICsgJyknKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZW1pdCgnc2VjdXJlJywgc2VjdXJlUGFpci5jbGVhcnRleHQpO1xuXG4gICAgICAgIHNlY3VyZVBhaXIuY2xlYXJ0ZXh0LnNldE1heFNlbmRGcmFnbWVudCh0aGlzLm91dGdvaW5nTWVzc2FnZVN0cmVhbS5wYWNrZXRTaXplKTtcblxuICAgICAgICB0aGlzLm91dGdvaW5nTWVzc2FnZVN0cmVhbS51bnBpcGUodGhpcy5zb2NrZXQpO1xuICAgICAgICB0aGlzLnNvY2tldC51bnBpcGUodGhpcy5pbmNvbWluZ01lc3NhZ2VTdHJlYW0pO1xuXG4gICAgICAgIHRoaXMuc29ja2V0LnBpcGUoc2VjdXJlUGFpci5lbmNyeXB0ZWQpO1xuICAgICAgICBzZWN1cmVQYWlyLmVuY3J5cHRlZC5waXBlKHRoaXMuc29ja2V0KTtcblxuICAgICAgICBzZWN1cmVQYWlyLmNsZWFydGV4dC5waXBlKHRoaXMuaW5jb21pbmdNZXNzYWdlU3RyZWFtKTtcbiAgICAgICAgdGhpcy5vdXRnb2luZ01lc3NhZ2VTdHJlYW0ucGlwZShzZWN1cmVQYWlyLmNsZWFydGV4dCk7XG5cbiAgICAgICAgdGhpcy50bHNOZWdvdGlhdGlvbkNvbXBsZXRlID0gdHJ1ZTtcblxuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBvbkVycm9yID0gKGVycj86IEVycm9yKSA9PiB7XG4gICAgICAgIHNlY3VyZVBhaXIuZW5jcnlwdGVkLnJlbW92ZUxpc3RlbmVyKCdyZWFkYWJsZScsIG9uUmVhZGFibGUpO1xuICAgICAgICBzZWN1cmVQYWlyLmNsZWFydGV4dC5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBvbkVycm9yKTtcbiAgICAgICAgc2VjdXJlUGFpci5jbGVhcnRleHQucmVtb3ZlTGlzdGVuZXIoJ3NlY3VyZUNvbm5lY3QnLCBvblNlY3VyZUNvbm5lY3QpO1xuXG4gICAgICAgIHNlY3VyZVBhaXIuY2xlYXJ0ZXh0LmRlc3Ryb3koKTtcbiAgICAgICAgc2VjdXJlUGFpci5lbmNyeXB0ZWQuZGVzdHJveSgpO1xuXG4gICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgfTtcblxuICAgICAgY29uc3Qgb25SZWFkYWJsZSA9ICgpID0+IHtcbiAgICAgICAgLy8gV2hlbiB0aGVyZSBpcyBoYW5kc2hha2UgZGF0YSBvbiB0aGUgZW5jcnlwdGVkIHN0cmVhbSBvZiB0aGUgc2VjdXJlIHBhaXIsXG4gICAgICAgIC8vIHdlIHdyYXAgaXQgaW50byBhIGBQUkVMT0dJTmAgbWVzc2FnZSBhbmQgc2VuZCBpdCB0byB0aGUgc2VydmVyLlxuICAgICAgICAvL1xuICAgICAgICAvLyBGb3IgZWFjaCBgUFJFTE9HSU5gIG1lc3NhZ2Ugd2Ugc2VudCB3ZSBnZXQgYmFjayBleGFjdGx5IG9uZSByZXNwb25zZSBtZXNzYWdlXG4gICAgICAgIC8vIHRoYXQgY29udGFpbnMgdGhlIHNlcnZlcidzIGhhbmRzaGFrZSByZXNwb25zZSBkYXRhLlxuICAgICAgICBjb25zdCBtZXNzYWdlID0gbmV3IE1lc3NhZ2UoeyB0eXBlOiBUWVBFLlBSRUxPR0lOLCByZXNldENvbm5lY3Rpb246IGZhbHNlIH0pO1xuXG4gICAgICAgIGxldCBjaHVuaztcbiAgICAgICAgd2hpbGUgKGNodW5rID0gc2VjdXJlUGFpci5lbmNyeXB0ZWQucmVhZCgpKSB7XG4gICAgICAgICAgbWVzc2FnZS53cml0ZShjaHVuayk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vdXRnb2luZ01lc3NhZ2VTdHJlYW0ud3JpdGUobWVzc2FnZSk7XG4gICAgICAgIG1lc3NhZ2UuZW5kKCk7XG5cbiAgICAgICAgdGhpcy5yZWFkTWVzc2FnZSgpLnRoZW4oYXN5bmMgKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgLy8gU2V0dXAgcmVhZGFibGUgaGFuZGxlciBmb3IgdGhlIG5leHQgcm91bmQgb2YgaGFuZHNoYWtpbmcuXG4gICAgICAgICAgLy8gSWYgd2UgZW5jb3VudGVyIGEgYHNlY3VyZUNvbm5lY3RgIG9uIHRoZSBjbGVhcnRleHQgc2lkZVxuICAgICAgICAgIC8vIG9mIHRoZSBzZWN1cmUgcGFpciwgdGhlIGByZWFkYWJsZWAgaGFuZGxlciBpcyBjbGVhcmVkXG4gICAgICAgICAgLy8gYW5kIG5vIGZ1cnRoZXIgaGFuZHNoYWtlIGhhbmRsaW5nIHdpbGwgaGFwcGVuLlxuICAgICAgICAgIHNlY3VyZVBhaXIuZW5jcnlwdGVkLm9uY2UoJ3JlYWRhYmxlJywgb25SZWFkYWJsZSk7XG5cbiAgICAgICAgICBmb3IgYXdhaXQgKGNvbnN0IGRhdGEgb2YgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgIC8vIFdlIGZlZWQgdGhlIHNlcnZlcidzIGhhbmRzaGFrZSByZXNwb25zZSBiYWNrIGludG8gdGhlXG4gICAgICAgICAgICAvLyBlbmNyeXB0ZWQgZW5kIG9mIHRoZSBzZWN1cmUgcGFpci5cbiAgICAgICAgICAgIHNlY3VyZVBhaXIuZW5jcnlwdGVkLndyaXRlKGRhdGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkuY2F0Y2gob25FcnJvcik7XG4gICAgICB9O1xuXG4gICAgICBzZWN1cmVQYWlyLmNsZWFydGV4dC5vbmNlKCdlcnJvcicsIG9uRXJyb3IpO1xuICAgICAgc2VjdXJlUGFpci5jbGVhcnRleHQub25jZSgnc2VjdXJlQ29ubmVjdCcsIG9uU2VjdXJlQ29ubmVjdCk7XG4gICAgICBzZWN1cmVQYWlyLmVuY3J5cHRlZC5vbmNlKCdyZWFkYWJsZScsIG9uUmVhZGFibGUpO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gVE9ETyBsaXN0ZW4gZm9yICdkcmFpbicgZXZlbnQgd2hlbiBzb2NrZXQud3JpdGUgcmV0dXJucyBmYWxzZS5cbiAgLy8gVE9ETyBpbXBsZW1lbnQgaW5jb21wbGV0ZSByZXF1ZXN0IGNhbmNlbGF0aW9uICgyLjIuMS42KVxuICBzZW5kTWVzc2FnZShwYWNrZXRUeXBlOiBudW1iZXIsIGRhdGE/OiBCdWZmZXIsIHJlc2V0Q29ubmVjdGlvbj86IGJvb2xlYW4pIHtcbiAgICBjb25zdCBtZXNzYWdlID0gbmV3IE1lc3NhZ2UoeyB0eXBlOiBwYWNrZXRUeXBlLCByZXNldENvbm5lY3Rpb246IHJlc2V0Q29ubmVjdGlvbiB9KTtcbiAgICBtZXNzYWdlLmVuZChkYXRhKTtcbiAgICB0aGlzLm91dGdvaW5nTWVzc2FnZVN0cmVhbS53cml0ZShtZXNzYWdlKTtcbiAgICByZXR1cm4gbWVzc2FnZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFkIHRoZSBuZXh0IGluY29taW5nIG1lc3NhZ2UgZnJvbSB0aGUgc29ja2V0LlxuICAgKi9cbiAgYXN5bmMgcmVhZE1lc3NhZ2UoKTogUHJvbWlzZTxNZXNzYWdlPiB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5pbmNvbWluZ01lc3NhZ2VJdGVyYXRvci5uZXh0KCk7XG5cbiAgICBpZiAocmVzdWx0LmRvbmUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigndW5leHBlY3RlZCBlbmQgb2YgbWVzc2FnZSBzdHJlYW0nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0LnZhbHVlO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1lc3NhZ2VJTztcbm1vZHVsZS5leHBvcnRzID0gTWVzc2FnZUlPO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxJQUFBQSxpQkFBQSxHQUFBQyxzQkFBQSxDQUFBQyxPQUFBO0FBR0EsSUFBQUMsR0FBQSxHQUFBQyx1QkFBQSxDQUFBRixPQUFBO0FBRUEsSUFBQUcsT0FBQSxHQUFBSCxPQUFBO0FBSUEsSUFBQUksUUFBQSxH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