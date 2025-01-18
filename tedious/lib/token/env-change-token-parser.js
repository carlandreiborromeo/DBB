"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _collation = require("../collation");
var _token = require("./token");
var _helpers = require("./helpers");
const types = {
  1: {
    name: 'DATABASE',
    event: 'databaseChange'
  },
  2: {
    name: 'LANGUAGE',
    event: 'languageChange'
  },
  3: {
    name: 'CHARSET',
    event: 'charsetChange'
  },
  4: {
    name: 'PACKET_SIZE',
    event: 'packetSizeChange'
  },
  7: {
    name: 'SQL_COLLATION',
    event: 'sqlCollationChange'
  },
  8: {
    name: 'BEGIN_TXN',
    event: 'beginTransaction'
  },
  9: {
    name: 'COMMIT_TXN',
    event: 'commitTransaction'
  },
  10: {
    name: 'ROLLBACK_TXN',
    event: 'rollbackTransaction'
  },
  13: {
    name: 'DATABASE_MIRRORING_PARTNER',
    event: 'partnerNode'
  },
  17: {
    name: 'TXN_ENDED'
  },
  18: {
    name: 'RESET_CONNECTION',
    event: 'resetConnection'
  },
  20: {
    name: 'ROUTING_CHANGE',
    event: 'routingChange'
  }
};
function _readNewAndOldValue(buf, offset, length, type) {
  switch (type.name) {
    case 'DATABASE':
    case 'LANGUAGE':
    case 'CHARSET':
    case 'PACKET_SIZE':
    case 'DATABASE_MIRRORING_PARTNER':
      {
        let newValue;
        ({
          offset,
          value: newValue
        } = (0, _helpers.readBVarChar)(buf, offset));
        let oldValue;
        ({
          offset,
          value: oldValue
        } = (0, _helpers.readBVarChar)(buf, offset));
        switch (type.name) {
          case 'PACKET_SIZE':
            return new _helpers.Result(new _token.PacketSizeEnvChangeToken(parseInt(newValue), parseInt(oldValue)), offset);
          case 'DATABASE':
            return new _helpers.Result(new _token.DatabaseEnvChangeToken(newValue, oldValue), offset);
          case 'LANGUAGE':
            return new _helpers.Result(new _token.LanguageEnvChangeToken(newValue, oldValue), offset);
          case 'CHARSET':
            return new _helpers.Result(new _token.CharsetEnvChangeToken(newValue, oldValue), offset);
          case 'DATABASE_MIRRORING_PARTNER':
            return new _helpers.Result(new _token.DatabaseMirroringPartnerEnvChangeToken(newValue, oldValue), offset);
        }
        throw new Error('unreachable');
      }
    case 'SQL_COLLATION':
    case 'BEGIN_TXN':
    case 'COMMIT_TXN':
    case 'ROLLBACK_TXN':
    case 'RESET_CONNECTION':
      {
        let newValue;
        ({
          offset,
          value: newValue
        } = (0, _helpers.readBVarByte)(buf, offset));
        let oldValue;
        ({
          offset,
          value: oldValue
        } = (0, _helpers.readBVarByte)(buf, offset));
        switch (type.name) {
          case 'SQL_COLLATION':
            {
              const newCollation = newValue.length ? _collation.Collation.fromBuffer(newValue) : undefined;
              const oldCollation = oldValue.length ? _collation.Collation.fromBuffer(oldValue) : undefined;
              return new _helpers.Result(new _token.CollationChangeToken(newCollation, oldCollation), offset);
            }
          case 'BEGIN_TXN':
            return new _helpers.Result(new _token.BeginTransactionEnvChangeToken(newValue, oldValue), offset);
          case 'COMMIT_TXN':
            return new _helpers.Result(new _token.CommitTransactionEnvChangeToken(newValue, oldValue), offset);
          case 'ROLLBACK_TXN':
            return new _helpers.Result(new _token.RollbackTransactionEnvChangeToken(newValue, oldValue), offset);
          case 'RESET_CONNECTION':
            return new _helpers.Result(new _token.ResetConnectionEnvChangeToken(newValue, oldValue), offset);
        }
        throw new Error('unreachable');
      }
    case 'ROUTING_CHANGE':
      {
        let routePacket;
        ({
          offset,
          value: routePacket
        } = (0, _helpers.readUsVarByte)(buf, offset));
        let oldValue;
        ({
          offset,
          value: oldValue
        } = (0, _helpers.readUsVarByte)(buf, offset));

        // Routing Change:
        // Byte 1: Protocol (must be 0)
        // Bytes 2-3 (USHORT): Port number
        // Bytes 4-5 (USHORT): Length of server data in unicode (2byte chars)
        // Bytes 6-*: Server name in unicode characters
        const protocol = routePacket.readUInt8(0);
        if (protocol !== 0) {
          throw new Error('Unknown protocol byte in routing change event');
        }
        const port = routePacket.readUInt16LE(1);
        const serverLen = routePacket.readUInt16LE(3);
        // 2 bytes per char, starting at offset 5
        const server = routePacket.toString('ucs2', 5, 5 + serverLen * 2);
        const newValue = {
          protocol: protocol,
          port: port,
          server: server
        };
        return new _helpers.Result(new _token.RoutingEnvChangeToken(newValue, oldValue), offset);
      }
    default:
      {
        console.error('Tedious > Unsupported ENVCHANGE type ' + type.name);

        // skip unknown bytes
        return new _helpers.Result(undefined, offset + length - 1);
      }
  }
}
function envChangeParser(buf, offset, _options) {
  let tokenLength;
  ({
    offset,
    value: tokenLength
  } = (0, _helpers.readUInt16LE)(buf, offset));
  if (buf.length < offset + tokenLength) {
    throw new _helpers.NotEnoughDataError(offset + tokenLength);
  }
  let typeNumber;
  ({
    offset,
    value: typeNumber
  } = (0, _helpers.readUInt8)(buf, offset));
  const type = types[typeNumber];
  if (!type) {
    console.error('Tedious > Unsupported ENVCHANGE type ' + typeNumber);
    return new _helpers.Result(undefined, offset + tokenLength - 1);
  }
  return _readNewAndOldValue(buf, offset, tokenLength, type);
}
var _default = exports.default = envChangeParser;
module.exports = envChangeParser;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfY29sbGF0aW9uIiwicmVxdWlyZSIsIl90b2tlbiIsIl9oZWxwZXJzIiwidHlwZXMiLCJuYW1lIiwiZXZlbnQiLCJfcmVhZE5ld0FuZE9sZFZhbHVlIiwiYnVmIiwib2Zmc2V0IiwibGVuZ3RoIiwidHlwZSIsIm5ld1ZhbHVlIiwidmFsdWUiLCJyZWFkQlZhckNoYXIiLCJvbGRWYWx1ZSIsIlJlc3VsdCIsIlBhY2tldFNpemVFbnZDaGFuZ2VUb2tlbiIsInBhcnNlSW50IiwiRGF0YWJhc2VFbnZDaGFuZ2VUb2tlbiIsIkxhbmd1YWdlRW52Q2hhbmdlVG9rZW4iLCJDaGFyc2V0RW52Q2hhbmdlVG9rZW4iLCJEYXRhYmFzZU1pcnJvcmluZ1BhcnRuZXJFbnZDaGFuZ2VUb2tlbiIsIkVycm9yIiwicmVhZEJWYXJCeXRlIiwibmV3Q29sbGF0aW9uIiwiQ29sbGF0aW9uIiwiZnJvbUJ1ZmZlciIsInVuZGVmaW5lZCIsIm9sZENvbGxhdGlvbiIsIkNvbGxhdGlvbkNoYW5nZVRva2VuIiwiQmVnaW5UcmFuc2FjdGlvbkVudkNoYW5nZVRva2VuIiwiQ29tbWl0VHJhbnNhY3Rpb25FbnZDaGFuZ2VUb2tlbiIsIlJvbGxiYWNrVHJhbnNhY3Rpb25FbnZDaGFuZ2VUb2tlbiIsIlJlc2V0Q29ubmVjdGlvbkVudkNoYW5nZVRva2VuIiwicm91dGVQYWNrZXQiLCJyZWFkVXNWYXJCeXRlIiwicHJvdG9jb2wiLCJyZWFkVUludDgiLCJwb3J0IiwicmVhZFVJbnQxNkxFIiwic2VydmVyTGVuIiwic2VydmVyIiwidG9TdHJpbmciLCJSb3V0aW5nRW52Q2hhbmdlVG9rZW4iLCJjb25zb2xlIiwiZXJyb3IiLCJlbnZDaGFuZ2VQYXJzZXIiLCJfb3B0aW9ucyIsInRva2VuTGVuZ3RoIiwiTm90RW5vdWdoRGF0YUVycm9yIiwidHlwZU51bWJlciIsIl9kZWZhdWx0IiwiZXhwb3J0cyIsImRlZmF1bHQiLCJtb2R1bGUiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvdG9rZW4vZW52LWNoYW5nZS10b2tlbi1wYXJzZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdHlwZSBQYXJzZXJPcHRpb25zIH0gZnJvbSAnLi9zdHJlYW0tcGFyc2VyJztcbmltcG9ydCB7IENvbGxhdGlvbiB9IGZyb20gJy4uL2NvbGxhdGlvbic7XG5cbmltcG9ydCB7XG4gIERhdGFiYXNlRW52Q2hhbmdlVG9rZW4sXG4gIExhbmd1YWdlRW52Q2hhbmdlVG9rZW4sXG4gIENoYXJzZXRFbnZDaGFuZ2VUb2tlbixcbiAgUGFja2V0U2l6ZUVudkNoYW5nZVRva2VuLFxuICBCZWdpblRyYW5zYWN0aW9uRW52Q2hhbmdlVG9rZW4sXG4gIENvbW1pdFRyYW5zYWN0aW9uRW52Q2hhbmdlVG9rZW4sXG4gIFJvbGxiYWNrVHJhbnNhY3Rpb25FbnZDaGFuZ2VUb2tlbixcbiAgRGF0YWJhc2VNaXJyb3JpbmdQYXJ0bmVyRW52Q2hhbmdlVG9rZW4sXG4gIFJlc2V0Q29ubmVjdGlvbkVudkNoYW5nZVRva2VuLFxuICBSb3V0aW5nRW52Q2hhbmdlVG9rZW4sXG4gIENvbGxhdGlvbkNoYW5nZVRva2VuLFxuICB0eXBlIEVudkNoYW5nZVRva2VuXG59IGZyb20gJy4vdG9rZW4nO1xuXG5pbXBvcnQgeyBOb3RFbm91Z2hEYXRhRXJyb3IsIHJlYWRCVmFyQnl0ZSwgcmVhZEJWYXJDaGFyLCByZWFkVUludDE2TEUsIHJlYWRVSW50OCwgcmVhZFVzVmFyQnl0ZSwgUmVzdWx0IH0gZnJvbSAnLi9oZWxwZXJzJztcblxuY29uc3QgdHlwZXM6IHsgW2tleTogbnVtYmVyXTogeyBuYW1lOiBzdHJpbmcsIGV2ZW50Pzogc3RyaW5nIH19ID0ge1xuICAxOiB7XG4gICAgbmFtZTogJ0RBVEFCQVNFJyxcbiAgICBldmVudDogJ2RhdGFiYXNlQ2hhbmdlJ1xuICB9LFxuICAyOiB7XG4gICAgbmFtZTogJ0xBTkdVQUdFJyxcbiAgICBldmVudDogJ2xhbmd1YWdlQ2hhbmdlJ1xuICB9LFxuICAzOiB7XG4gICAgbmFtZTogJ0NIQVJTRVQnLFxuICAgIGV2ZW50OiAnY2hhcnNldENoYW5nZSdcbiAgfSxcbiAgNDoge1xuICAgIG5hbWU6ICdQQUNLRVRfU0laRScsXG4gICAgZXZlbnQ6ICdwYWNrZXRTaXplQ2hhbmdlJ1xuICB9LFxuICA3OiB7XG4gICAgbmFtZTogJ1NRTF9DT0xMQVRJT04nLFxuICAgIGV2ZW50OiAnc3FsQ29sbGF0aW9uQ2hhbmdlJ1xuICB9LFxuICA4OiB7XG4gICAgbmFtZTogJ0JFR0lOX1RYTicsXG4gICAgZXZlbnQ6ICdiZWdpblRyYW5zYWN0aW9uJ1xuICB9LFxuICA5OiB7XG4gICAgbmFtZTogJ0NPTU1JVF9UWE4nLFxuICAgIGV2ZW50OiAnY29tbWl0VHJhbnNhY3Rpb24nXG4gIH0sXG4gIDEwOiB7XG4gICAgbmFtZTogJ1JPTExCQUNLX1RYTicsXG4gICAgZXZlbnQ6ICdyb2xsYmFja1RyYW5zYWN0aW9uJ1xuICB9LFxuICAxMzoge1xuICAgIG5hbWU6ICdEQVRBQkFTRV9NSVJST1JJTkdfUEFSVE5FUicsXG4gICAgZXZlbnQ6ICdwYXJ0bmVyTm9kZSdcbiAgfSxcbiAgMTc6IHtcbiAgICBuYW1lOiAnVFhOX0VOREVEJ1xuICB9LFxuICAxODoge1xuICAgIG5hbWU6ICdSRVNFVF9DT05ORUNUSU9OJyxcbiAgICBldmVudDogJ3Jlc2V0Q29ubmVjdGlvbidcbiAgfSxcbiAgMjA6IHtcbiAgICBuYW1lOiAnUk9VVElOR19DSEFOR0UnLFxuICAgIGV2ZW50OiAncm91dGluZ0NoYW5nZSdcbiAgfVxufTtcblxuZnVuY3Rpb24gX3JlYWROZXdBbmRPbGRWYWx1ZShidWY6IEJ1ZmZlciwgb2Zmc2V0OiBudW1iZXIsIGxlbmd0aDogbnVtYmVyLCB0eXBlOiB7IG5hbWU6IHN0cmluZywgZXZlbnQ/OiBzdHJpbmcgfSk6IFJlc3VsdDxFbnZDaGFuZ2VUb2tlbiB8IHVuZGVmaW5lZD4ge1xuICBzd2l0Y2ggKHR5cGUubmFtZSkge1xuICAgIGNhc2UgJ0RBVEFCQVNFJzpcbiAgICBjYXNlICdMQU5HVUFHRSc6XG4gICAgY2FzZSAnQ0hBUlNFVCc6XG4gICAgY2FzZSAnUEFDS0VUX1NJWkUnOlxuICAgIGNhc2UgJ0RBVEFCQVNFX01JUlJPUklOR19QQVJUTkVSJzoge1xuICAgICAgbGV0IG5ld1ZhbHVlO1xuICAgICAgKHsgb2Zmc2V0LCB2YWx1ZTogbmV3VmFsdWUgfSA9IHJlYWRCVmFyQ2hhcihidWYsIG9mZnNldCkpO1xuXG4gICAgICBsZXQgb2xkVmFsdWU7XG4gICAgICAoeyBvZmZzZXQsIHZhbHVlOiBvbGRWYWx1ZSB9ID0gcmVhZEJWYXJDaGFyKGJ1Ziwgb2Zmc2V0KSk7XG5cbiAgICAgIHN3aXRjaCAodHlwZS5uYW1lKSB7XG4gICAgICAgIGNhc2UgJ1BBQ0tFVF9TSVpFJzpcbiAgICAgICAgICByZXR1cm4gbmV3IFJlc3VsdChuZXcgUGFja2V0U2l6ZUVudkNoYW5nZVRva2VuKHBhcnNlSW50KG5ld1ZhbHVlKSwgcGFyc2VJbnQob2xkVmFsdWUpKSwgb2Zmc2V0KTtcblxuICAgICAgICBjYXNlICdEQVRBQkFTRSc6XG4gICAgICAgICAgcmV0dXJuIG5ldyBSZXN1bHQobmV3IERhdGFiYXNlRW52Q2hhbmdlVG9rZW4obmV3VmFsdWUsIG9sZFZhbHVlKSwgb2Zmc2V0KTtcblxuICAgICAgICBjYXNlICdMQU5HVUFHRSc6XG4gICAgICAgICAgcmV0dXJuIG5ldyBSZXN1bHQobmV3IExhbmd1YWdlRW52Q2hhbmdlVG9rZW4obmV3VmFsdWUsIG9sZFZhbHVlKSwgb2Zmc2V0KTtcblxuICAgICAgICBjYXNlICdDSEFSU0VUJzpcbiAgICAgICAgICByZXR1cm4gbmV3IFJlc3VsdChuZXcgQ2hhcnNldEVudkNoYW5nZVRva2VuKG5ld1ZhbHVlLCBvbGRWYWx1ZSksIG9mZnNldCk7XG5cbiAgICAgICAgY2FzZSAnREFUQUJBU0VfTUlSUk9SSU5HX1BBUlRORVInOlxuICAgICAgICAgIHJldHVybiBuZXcgUmVzdWx0KG5ldyBEYXRhYmFzZU1pcnJvcmluZ1BhcnRuZXJFbnZDaGFuZ2VUb2tlbihuZXdWYWx1ZSwgb2xkVmFsdWUpLCBvZmZzZXQpO1xuICAgICAgfVxuXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3VucmVhY2hhYmxlJyk7XG4gICAgfVxuXG4gICAgY2FzZSAnU1FMX0NPTExBVElPTic6XG4gICAgY2FzZSAnQkVHSU5fVFhOJzpcbiAgICBjYXNlICdDT01NSVRfVFhOJzpcbiAgICBjYXNlICdST0xMQkFDS19UWE4nOlxuICAgIGNhc2UgJ1JFU0VUX0NPTk5FQ1RJT04nOiB7XG4gICAgICBsZXQgbmV3VmFsdWU7XG4gICAgICAoeyBvZmZzZXQsIHZhbHVlOiBuZXdWYWx1ZSB9ID0gcmVhZEJWYXJCeXRlKGJ1Ziwgb2Zmc2V0KSk7XG5cbiAgICAgIGxldCBvbGRWYWx1ZTtcbiAgICAgICh7IG9mZnNldCwgdmFsdWU6IG9sZFZhbHVlIH0gPSByZWFkQlZhckJ5dGUoYnVmLCBvZmZzZXQpKTtcblxuICAgICAgc3dpdGNoICh0eXBlLm5hbWUpIHtcbiAgICAgICAgY2FzZSAnU1FMX0NPTExBVElPTic6IHtcbiAgICAgICAgICBjb25zdCBuZXdDb2xsYXRpb24gPSBuZXdWYWx1ZS5sZW5ndGggPyBDb2xsYXRpb24uZnJvbUJ1ZmZlcihuZXdWYWx1ZSkgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgY29uc3Qgb2xkQ29sbGF0aW9uID0gb2xkVmFsdWUubGVuZ3RoID8gQ29sbGF0aW9uLmZyb21CdWZmZXIob2xkVmFsdWUpIDogdW5kZWZpbmVkO1xuXG4gICAgICAgICAgcmV0dXJuIG5ldyBSZXN1bHQobmV3IENvbGxhdGlvbkNoYW5nZVRva2VuKG5ld0NvbGxhdGlvbiwgb2xkQ29sbGF0aW9uKSwgb2Zmc2V0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhc2UgJ0JFR0lOX1RYTic6XG4gICAgICAgICAgcmV0dXJuIG5ldyBSZXN1bHQobmV3IEJlZ2luVHJhbnNhY3Rpb25FbnZDaGFuZ2VUb2tlbihuZXdWYWx1ZSwgb2xkVmFsdWUpLCBvZmZzZXQpO1xuXG4gICAgICAgIGNhc2UgJ0NPTU1JVF9UWE4nOlxuICAgICAgICAgIHJldHVybiBuZXcgUmVzdWx0KG5ldyBDb21taXRUcmFuc2FjdGlvbkVudkNoYW5nZVRva2VuKG5ld1ZhbHVlLCBvbGRWYWx1ZSksIG9mZnNldCk7XG5cbiAgICAgICAgY2FzZSAnUk9MTEJBQ0tfVFhOJzpcbiAgICAgICAgICByZXR1cm4gbmV3IFJlc3VsdChuZXcgUm9sbGJhY2tUcmFuc2FjdGlvbkVudkNoYW5nZVRva2VuKG5ld1ZhbHVlLCBvbGRWYWx1ZSksIG9mZnNldCk7XG5cbiAgICAgICAgY2FzZSAnUkVTRVRfQ09OTkVDVElPTic6XG4gICAgICAgICAgcmV0dXJuIG5ldyBSZXN1bHQobmV3IFJlc2V0Q29ubmVjdGlvbkVudkNoYW5nZVRva2VuKG5ld1ZhbHVlLCBvbGRWYWx1ZSksIG9mZnNldCk7XG4gICAgICB9XG5cbiAgICAgIHRocm93IG5ldyBFcnJvcigndW5yZWFjaGFibGUnKTtcbiAgICB9XG5cbiAgICBjYXNlICdST1VUSU5HX0NIQU5HRSc6IHtcbiAgICAgIGxldCByb3V0ZVBhY2tldDtcbiAgICAgICh7IG9mZnNldCwgdmFsdWU6IHJvdXRlUGFja2V0IH0gPSByZWFkVXNWYXJCeXRlKGJ1Ziwgb2Zmc2V0KSk7XG5cbiAgICAgIGxldCBvbGRWYWx1ZTtcbiAgICAgICh7IG9mZnNldCwgdmFsdWU6IG9sZFZhbHVlIH0gPSByZWFkVXNWYXJCeXRlKGJ1Ziwgb2Zmc2V0KSk7XG5cbiAgICAgIC8vIFJvdXRpbmcgQ2hhbmdlOlxuICAgICAgLy8gQnl0ZSAxOiBQcm90b2NvbCAobXVzdCBiZSAwKVxuICAgICAgLy8gQnl0ZXMgMi0zIChVU0hPUlQpOiBQb3J0IG51bWJlclxuICAgICAgLy8gQnl0ZXMgNC01IChVU0hPUlQpOiBMZW5ndGggb2Ygc2VydmVyIGRhdGEgaW4gdW5pY29kZSAoMmJ5dGUgY2hhcnMpXG4gICAgICAvLyBCeXRlcyA2LSo6IFNlcnZlciBuYW1lIGluIHVuaWNvZGUgY2hhcmFjdGVyc1xuICAgICAgY29uc3QgcHJvdG9jb2wgPSByb3V0ZVBhY2tldC5yZWFkVUludDgoMCk7XG4gICAgICBpZiAocHJvdG9jb2wgIT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIHByb3RvY29sIGJ5dGUgaW4gcm91dGluZyBjaGFuZ2UgZXZlbnQnKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcG9ydCA9IHJvdXRlUGFja2V0LnJlYWRVSW50MTZMRSgxKTtcbiAgICAgIGNvbnN0IHNlcnZlckxlbiA9IHJvdXRlUGFja2V0LnJlYWRVSW50MTZMRSgzKTtcbiAgICAgIC8vIDIgYnl0ZXMgcGVyIGNoYXIsIHN0YXJ0aW5nIGF0IG9mZnNldCA1XG4gICAgICBjb25zdCBzZXJ2ZXIgPSByb3V0ZVBhY2tldC50b1N0cmluZygndWNzMicsIDUsIDUgKyAoc2VydmVyTGVuICogMikpO1xuXG4gICAgICBjb25zdCBuZXdWYWx1ZSA9IHtcbiAgICAgICAgcHJvdG9jb2w6IHByb3RvY29sLFxuICAgICAgICBwb3J0OiBwb3J0LFxuICAgICAgICBzZXJ2ZXI6IHNlcnZlclxuICAgICAgfTtcblxuICAgICAgcmV0dXJuIG5ldyBSZXN1bHQobmV3IFJvdXRpbmdFbnZDaGFuZ2VUb2tlbihuZXdWYWx1ZSwgb2xkVmFsdWUpLCBvZmZzZXQpO1xuICAgIH1cblxuICAgIGRlZmF1bHQ6IHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1RlZGlvdXMgPiBVbnN1cHBvcnRlZCBFTlZDSEFOR0UgdHlwZSAnICsgdHlwZS5uYW1lKTtcblxuICAgICAgLy8gc2tpcCB1bmtub3duIGJ5dGVzXG4gICAgICByZXR1cm4gbmV3IFJlc3VsdCh1bmRlZmluZWQsIG9mZnNldCArIGxlbmd0aCAtIDEpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBlbnZDaGFuZ2VQYXJzZXIoYnVmOiBCdWZmZXIsIG9mZnNldDogbnVtYmVyLCBfb3B0aW9uczogUGFyc2VyT3B0aW9ucyk6IFJlc3VsdDxFbnZDaGFuZ2VUb2tlbiB8IHVuZGVmaW5lZD4ge1xuICBsZXQgdG9rZW5MZW5ndGg7XG4gICh7IG9mZnNldCwgdmFsdWU6IHRva2VuTGVuZ3RoIH0gPSByZWFkVUludDE2TEUoYnVmLCBvZmZzZXQpKTtcblxuICBpZiAoYnVmLmxlbmd0aCA8IG9mZnNldCArIHRva2VuTGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IE5vdEVub3VnaERhdGFFcnJvcihvZmZzZXQgKyB0b2tlbkxlbmd0aCk7XG4gIH1cblxuICBsZXQgdHlwZU51bWJlcjtcbiAgKHsgb2Zmc2V0LCB2YWx1ZTogdHlwZU51bWJlciB9ID0gcmVhZFVJbnQ4KGJ1Ziwgb2Zmc2V0KSk7XG5cbiAgY29uc3QgdHlwZSA9IHR5cGVzW3R5cGVOdW1iZXJdO1xuXG4gIGlmICghdHlwZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1RlZGlvdXMgPiBVbnN1cHBvcnRlZCBFTlZDSEFOR0UgdHlwZSAnICsgdHlwZU51bWJlcik7XG4gICAgcmV0dXJuIG5ldyBSZXN1bHQodW5kZWZpbmVkLCBvZmZzZXQgKyB0b2tlbkxlbmd0aCAtIDEpO1xuICB9XG5cbiAgcmV0dXJuIF9yZWFkTmV3QW5kT2xkVmFsdWUoYnVmLCBvZmZzZXQsIHRva2VuTGVuZ3RoLCB0eXBlKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZW52Q2hhbmdlUGFyc2VyO1xubW9kdWxlLmV4cG9ydHMgPSBlbnZDaGFuZ2VQYXJzZXI7XG4iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLElBQUFBLFVBQUEsR0FBQUMsT0FBQTtBQUVBLElBQUFDLE1BQUEsR0FBQUQsT0FBQTtBQWVBLElBQUFFLFFBQUEsR0FBQUYsT0FBQTtBQUVBLE1BQU1HLEtBQXlELEdBQUc7RUFDaEUsQ0FBQyxFQUFFO0lBQ0RDLElBQUksRUFBRSxVQUFVO0lBQ2hCQyxLQUFLLEVBQUU7RUFDVCxDQUFDO0VBQ0QsQ0FBQyxFQUFFO0lBQ0RELElBQUksRUFBRSxVQUFVO0lBQ2hCQyxLQUFLLEVBQUU7RUFDVCxDQUFDO0VBQ0QsQ0FBQyxFQUFFO0lBQ0RELElBQUksRUFBRSxTQUFTO0lBQ2ZDLEtBQUssRUFBRTtFQUNULENBQUM7RUFDRCxDQUFDLEVBQUU7SUFD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