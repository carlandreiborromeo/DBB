"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _helpers = require("./helpers");
var _token = require("./token");
function parseChallenge(buffer) {
  const challenge = {};
  challenge.magic = buffer.slice(0, 8).toString('utf8');
  challenge.type = buffer.readInt32LE(8);
  challenge.domainLen = buffer.readInt16LE(12);
  challenge.domainMax = buffer.readInt16LE(14);
  challenge.domainOffset = buffer.readInt32LE(16);
  challenge.flags = buffer.readInt32LE(20);
  challenge.nonce = buffer.slice(24, 32);
  challenge.zeroes = buffer.slice(32, 40);
  challenge.targetLen = buffer.readInt16LE(40);
  challenge.targetMax = buffer.readInt16LE(42);
  challenge.targetOffset = buffer.readInt32LE(44);
  challenge.oddData = buffer.slice(48, 56);
  challenge.domain = buffer.slice(56, 56 + challenge.domainLen).toString('ucs2');
  challenge.target = buffer.slice(56 + challenge.domainLen, 56 + challenge.domainLen + challenge.targetLen);
  return challenge;
}
function sspiParser(buf, offset, _options) {
  let tokenLength;
  ({
    offset,
    value: tokenLength
  } = (0, _helpers.readUInt16LE)(buf, offset));
  if (buf.length < offset + tokenLength) {
    throw new _helpers.NotEnoughDataError(offset + tokenLength);
  }
  const data = buf.slice(offset, offset + tokenLength);
  offset += tokenLength;
  return new _helpers.Result(new _token.SSPIToken(parseChallenge(data), data), offset);
}
var _default = exports.default = sspiParser;
module.exports = sspiParser;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfaGVscGVycyIsInJlcXVpcmUiLCJfdG9rZW4iLCJwYXJzZUNoYWxsZW5nZSIsImJ1ZmZlciIsImNoYWxsZW5nZSIsIm1hZ2ljIiwic2xpY2UiLCJ0b1N0cmluZyIsInR5cGUiLCJyZWFkSW50MzJMRSIsImRvbWFpbkxlbiIsInJlYWRJbnQxNkxFIiwiZG9tYWluTWF4IiwiZG9tYWluT2Zmc2V0IiwiZmxhZ3MiLCJub25jZSIsInplcm9lcyIsInRhcmdldExlbiIsInRhcmdldE1heCIsInRhcmdldE9mZnNldCIsIm9kZERhdGEiLCJkb21haW4iLCJ0YXJnZXQiLCJzc3BpUGFyc2VyIiwiYnVmIiwib2Zmc2V0IiwiX29wdGlvbnMiLCJ0b2tlbkxlbmd0aCIsInZhbHVlIiwicmVhZFVJbnQxNkxFIiwibGVuZ3RoIiwiTm90RW5vdWdoRGF0YUVycm9yIiwiZGF0YSIsIlJlc3VsdCIsIlNTUElUb2tlbiIsIl9kZWZhdWx0IiwiZXhwb3J0cyIsImRlZmF1bHQiLCJtb2R1bGUiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvdG9rZW4vc3NwaS10b2tlbi1wYXJzZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTm90RW5vdWdoRGF0YUVycm9yLCByZWFkVUludDE2TEUsIFJlc3VsdCB9IGZyb20gJy4vaGVscGVycyc7XG5pbXBvcnQgeyB0eXBlIFBhcnNlck9wdGlvbnMgfSBmcm9tICcuL3N0cmVhbS1wYXJzZXInO1xuXG5pbXBvcnQgeyBTU1BJVG9rZW4gfSBmcm9tICcuL3Rva2VuJztcblxuaW50ZXJmYWNlIERhdGEge1xuICBtYWdpYzogc3RyaW5nO1xuICB0eXBlOiBudW1iZXI7XG4gIGRvbWFpbkxlbjogbnVtYmVyO1xuICBkb21haW5NYXg6IG51bWJlcjtcbiAgZG9tYWluT2Zmc2V0OiBudW1iZXI7XG4gIGZsYWdzOiBudW1iZXI7XG4gIG5vbmNlOiBCdWZmZXI7XG4gIHplcm9lczogQnVmZmVyO1xuICB0YXJnZXRMZW46IG51bWJlcjtcbiAgdGFyZ2V0TWF4OiBudW1iZXI7XG4gIHRhcmdldE9mZnNldDogbnVtYmVyO1xuICBvZGREYXRhOiBCdWZmZXI7XG4gIGRvbWFpbjogc3RyaW5nO1xuICB0YXJnZXQ6IEJ1ZmZlcjtcbn1cblxuZnVuY3Rpb24gcGFyc2VDaGFsbGVuZ2UoYnVmZmVyOiBCdWZmZXIpIHtcbiAgY29uc3QgY2hhbGxlbmdlOiBQYXJ0aWFsPERhdGE+ID0ge307XG5cbiAgY2hhbGxlbmdlLm1hZ2ljID0gYnVmZmVyLnNsaWNlKDAsIDgpLnRvU3RyaW5nKCd1dGY4Jyk7XG4gIGNoYWxsZW5nZS50eXBlID0gYnVmZmVyLnJlYWRJbnQzMkxFKDgpO1xuICBjaGFsbGVuZ2UuZG9tYWluTGVuID0gYnVmZmVyLnJlYWRJbnQxNkxFKDEyKTtcbiAgY2hhbGxlbmdlLmRvbWFpbk1heCA9IGJ1ZmZlci5yZWFkSW50MTZMRSgxNCk7XG4gIGNoYWxsZW5nZS5kb21haW5PZmZzZXQgPSBidWZmZXIucmVhZEludDMyTEUoMTYpO1xuICBjaGFsbGVuZ2UuZmxhZ3MgPSBidWZmZXIucmVhZEludDMyTEUoMjApO1xuICBjaGFsbGVuZ2Uubm9uY2UgPSBidWZmZXIuc2xpY2UoMjQsIDMyKTtcbiAgY2hhbGxlbmdlLnplcm9lcyA9IGJ1ZmZlci5zbGljZSgzMiwgNDApO1xuICBjaGFsbGVuZ2UudGFyZ2V0TGVuID0gYnVmZmVyLnJlYWRJbnQxNkxFKDQwKTtcbiAgY2hhbGxlbmdlLnRhcmdldE1heCA9IGJ1ZmZlci5yZWFkSW50MTZMRSg0Mik7XG4gIGNoYWxsZW5nZS50YXJnZXRPZmZzZXQgPSBidWZmZXIucmVhZEludDMyTEUoNDQpO1xuICBjaGFsbGVuZ2Uub2RkRGF0YSA9IGJ1ZmZlci5zbGljZSg0OCwgNTYpO1xuICBjaGFsbGVuZ2UuZG9tYWluID0gYnVmZmVyLnNsaWNlKDU2LCA1NiArIGNoYWxsZW5nZS5kb21haW5MZW4pLnRvU3RyaW5nKCd1Y3MyJyk7XG4gIGNoYWxsZW5nZS50YXJnZXQgPSBidWZmZXIuc2xpY2UoNTYgKyBjaGFsbGVuZ2UuZG9tYWluTGVuLCA1NiArIGNoYWxsZW5nZS5kb21haW5MZW4gKyBjaGFsbGVuZ2UudGFyZ2V0TGVuKTtcblxuICByZXR1cm4gY2hhbGxlbmdlIGFzIERhdGE7XG59XG5cbmZ1bmN0aW9uIHNzcGlQYXJzZXIoYnVmOiBCdWZmZXIsIG9mZnNldDogbnVtYmVyLCBfb3B0aW9uczogUGFyc2VyT3B0aW9ucyk6IFJlc3VsdDxTU1BJVG9rZW4+IHtcbiAgbGV0IHRva2VuTGVuZ3RoO1xuICAoeyBvZmZzZXQsIHZhbHVlOiB0b2tlbkxlbmd0aCB9ID0gcmVhZFVJbnQxNkxFKGJ1Ziwgb2Zmc2V0KSk7XG5cbiAgaWYgKGJ1Zi5sZW5ndGggPCBvZmZzZXQgKyB0b2tlbkxlbmd0aCkge1xuICAgIHRocm93IG5ldyBOb3RFbm91Z2hEYXRhRXJyb3Iob2Zmc2V0ICsgdG9rZW5MZW5ndGgpO1xuICB9XG5cbiAgY29uc3QgZGF0YSA9IGJ1Zi5zbGljZShvZmZzZXQsIG9mZnNldCArIHRva2VuTGVuZ3RoKTtcbiAgb2Zmc2V0ICs9IHRva2VuTGVuZ3RoO1xuXG4gIHJldHVybiBuZXcgUmVzdWx0KG5ldyBTU1BJVG9rZW4ocGFyc2VDaGFsbGVuZ2UoZGF0YSksIGRhdGEpLCBvZmZzZXQpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBzc3BpUGFyc2VyO1xubW9kdWxlLmV4cG9ydHMgPSBzc3BpUGFyc2VyO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxJQUFBQSxRQUFBLEdBQUFDLE9BQUE7QUFHQSxJQUFBQyxNQUFBLEdBQUFELE9BQUE7QUFtQkEsU0FBU0UsY0FBY0EsQ0FBQ0MsTUFBYyxFQUFFO0VBQ3RDLE1BQU1DLFNBQXdCLEdBQUcsQ0FBQyxDQUFDO0VBRW5DQSxTQUFTLENBQUNDLEtBQUssR0FBR0YsTUFBTSxDQUFDRyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDQyxRQUFRLENBQUMsTUFBTSxDQUFDO0VBQ3JESCxTQUFTLENBQUNJLElBQUksR0FBR0wsTUFBTSxDQUFDTSxXQUFXLENBQUMsQ0FBQyxDQUFDO0VBQ3RDTCxTQUFTLENBQUNNLFNBQVMsR0FBR1AsTUFBTSxDQUFDUSxXQUFXLENBQUMsRUFBRSxDQUFDO0VBQzVDUCxTQUFTLENBQUNRLFNBQVMsR0FBR1QsTUFBTSxDQUFDUSxXQUFXLENBQUMsRUFBRSxDQUFDO0VBQzVDUCxTQUFTLENBQUNTLFlBQVksR0FBR1YsTUFBTSxDQUFDTSxXQUFXLENBQUMsRUFBRSxDQUFDO0VBQy9DTCxTQUFTLENBQUNVLEtBQUssR0FBR1gsTUFBTSxDQUFDTSxXQUFXLENBQUMsRUFBRSxDQUFDO0VBQ3hDTCxTQUFTLENBQUNXLEtBQUssR0FBR1osTUFBTSxDQUFDRyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQztFQUN0Q0YsU0FBUyxDQUFDWSxNQUFNLEdBQUdiLE1BQU0sQ0FBQ0csS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUM7RUFDdkNGLFNBQVMsQ0FBQ2EsU0FBUyxHQUFHZCxNQUFNLENBQUNRLFdBQVcsQ0FBQyxFQUFFLENBQUM7RUFDNUNQLFNBQVMsQ0FBQ2MsU0FBUyxHQUFHZixNQUFNLENBQUNRLFdBQVcsQ0FBQyxFQUFFLENBQUM7RUFDNUNQLFNBQVMsQ0FBQ2UsWUFBWSxHQUFHaEIsTUFBTSxDQUFDTSxXQUFXLENBQUMsRUFBRSxDQUFDO0VBQy9DTCxTQUFTLENBQUNnQixPQUFPLEdBQUdqQixNQUFNLENBQUNHLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDO0VBQ3hDRixTQUFTLENBQUNpQixNQUFNLEdBQUdsQixNQUFNLENBQUNHLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHRixTQUFTLENBQUNNLFNBQVMsQ0FBQyxDQUFDSCxRQUFRLENBQUMsTUFBTSxDQUFDO0VBQzlFSCxTQUFTLENBQUNrQixNQUFNLEdBQUduQixNQUFNLENBQUNHLEtBQUssQ0FBQyxFQUFFLEdBQUdGLFNBQVMsQ0FBQ00sU0FBUyxFQUFFLEVBQUUsR0FBR04sU0FBUyxDQUFDTSxTQUFTLEdBQUdOLFNBQVMsQ0FBQ2EsU0FBUyxDQUFDO0VBRXpHLE9BQU9iLFNBQVM7QUFDbEI7QUFFQSxTQUFTbUIsVUFBVUEsQ0FBQ0MsR0FBVyxFQUFFQyxNQUFjLEVBQUVDLFFBQXVCLEVBQXFCO0VBQzNGLElBQUlDLFdBQVc7RUFDZixDQUFDO0lBQUVGLE1BQU07SUFBRUcsS0FBSyxFQUFFRDtFQUFZLENBQUMsR0FBRyxJQUFBRSxxQkFBWSxFQUFDTCxHQUFHLEVBQUVDLE1BQU0sQ0FBQztFQUUzRCxJQUFJRCxHQUFHLENBQUNNLE1BQU0sR0FBR0wsTUFBTSxHQUFHRSxXQUFXLEVBQUU7SUFDckMsTUFBTSxJQUFJSSwyQkFBa0IsQ0FBQ04sTUFBTSxHQUFHRSxXQUFXLENBQUM7RUFDcEQ7RUFFQSxNQUFNSyxJQUFJLEdBQUdSLEdBQUcsQ0FBQ2xCLEtBQUssQ0FBQ21CLE1BQU0sRUFBRUEsTUFBTSxHQUFHRSxXQUFXLENBQUM7RUFDcERGLE1BQU0sSUFBSUUsV0FBVztFQUVyQixPQUFPLElBQUlNLGVBQU0sQ0FBQyxJQUFJQyxnQkFBUyxDQUFDaEMsY0FBYyxDQUFDOEIsSUFBSSxDQUFDLEVBQUVBLElBQUksQ0FBQyxFQUFFUCxNQUFNLENBQUM7QUFDdEU7QUFBQyxJQUFBVSxRQUFBLEdBQUFDLE9BQUEsQ0FBQUMsT0FBQSxHQUVjZCxVQUFVO0FBQ3pCZSxNQUFNLENBQUNGLE9BQU8sR0FBR2IsVUFBVSJ9