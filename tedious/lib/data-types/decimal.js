"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _decimaln = _interopRequireDefault(require("./decimaln"));
var _writableTrackingBuffer = _interopRequireDefault(require("../tracking-buffer/writable-tracking-buffer"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const NULL_LENGTH = Buffer.from([0x00]);
const Decimal = {
  id: 0x37,
  type: 'DECIMAL',
  name: 'Decimal',
  declaration: function (parameter) {
    return 'decimal(' + this.resolvePrecision(parameter) + ', ' + this.resolveScale(parameter) + ')';
  },
  resolvePrecision: function (parameter) {
    if (parameter.precision != null) {
      return parameter.precision;
    } else if (parameter.value === null) {
      return 1;
    } else {
      return 18;
    }
  },
  resolveScale: function (parameter) {
    if (parameter.scale != null) {
      return parameter.scale;
    } else {
      return 0;
    }
  },
  generateTypeInfo(parameter, _options) {
    let precision;
    if (parameter.precision <= 9) {
      precision = 0x05;
    } else if (parameter.precision <= 19) {
      precision = 0x09;
    } else if (parameter.precision <= 28) {
      precision = 0x0D;
    } else {
      precision = 0x11;
    }
    return Buffer.from([_decimaln.default.id, precision, parameter.precision, parameter.scale]);
  },
  generateParameterLength(parameter, options) {
    if (parameter.value == null) {
      return NULL_LENGTH;
    }
    const precision = parameter.precision;
    if (precision <= 9) {
      return Buffer.from([0x05]);
    } else if (precision <= 19) {
      return Buffer.from([0x09]);
    } else if (precision <= 28) {
      return Buffer.from([0x0D]);
    } else {
      return Buffer.from([0x11]);
    }
  },
  *generateParameterData(parameter, options) {
    if (parameter.value == null) {
      return;
    }
    const sign = parameter.value < 0 ? 0 : 1;
    const value = Math.round(Math.abs(parameter.value * Math.pow(10, parameter.scale)));
    const precision = parameter.precision;
    if (precision <= 9) {
      const buffer = Buffer.alloc(5);
      buffer.writeUInt8(sign, 0);
      buffer.writeUInt32LE(value, 1);
      yield buffer;
    } else if (precision <= 19) {
      const buffer = new _writableTrackingBuffer.default(9);
      buffer.writeUInt8(sign);
      buffer.writeUInt64LE(value);
      yield buffer.data;
    } else if (precision <= 28) {
      const buffer = new _writableTrackingBuffer.default(13);
      buffer.writeUInt8(sign);
      buffer.writeUInt64LE(value);
      buffer.writeUInt32LE(0x00000000);
      yield buffer.data;
    } else {
      const buffer = new _writableTrackingBuffer.default(17);
      buffer.writeUInt8(sign);
      buffer.writeUInt64LE(value);
      buffer.writeUInt32LE(0x00000000);
      buffer.writeUInt32LE(0x00000000);
      yield buffer.data;
    }
  },
  validate: function (value) {
    if (value == null) {
      return null;
    }
    value = parseFloat(value);
    if (isNaN(value)) {
      throw new TypeError('Invalid number.');
    }
    return value;
  }
};
var _default = exports.default = Decimal;
module.exports = Decimal;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfZGVjaW1hbG4iLCJfaW50ZXJvcFJlcXVpcmVEZWZhdWx0IiwicmVxdWlyZSIsIl93cml0YWJsZVRyYWNraW5nQnVmZmVyIiwib2JqIiwiX19lc01vZHVsZSIsImRlZmF1bHQiLCJOVUxMX0xFTkdUSCIsIkJ1ZmZlciIsImZyb20iLCJEZWNpbWFsIiwiaWQiLCJ0eXBlIiwibmFtZSIsImRlY2xhcmF0aW9uIiwicGFyYW1ldGVyIiwicmVzb2x2ZVByZWNpc2lvbiIsInJlc29sdmVTY2FsZSIsInByZWNpc2lvbiIsInZhbHVlIiwic2NhbGUiLCJnZW5lcmF0ZVR5cGVJbmZvIiwiX29wdGlvbnMiLCJEZWNpbWFsTiIsImdlbmVyYXRlUGFyYW1ldGVyTGVuZ3RoIiwib3B0aW9ucyIsImdlbmVyYXRlUGFyYW1ldGVyRGF0YSIsInNpZ24iLCJNYXRoIiwicm91bmQiLCJhYnMiLCJwb3ciLCJidWZmZXIiLCJhbGxvYyIsIndyaXRlVUludDgiLCJ3cml0ZVVJbnQzMkxFIiwiV3JpdGFibGVUcmFja2luZ0J1ZmZlciIsIndyaXRlVUludDY0TEUiLCJkYXRhIiwidmFsaWRhdGUiLCJwYXJzZUZsb2F0IiwiaXNOYU4iLCJUeXBlRXJyb3IiLCJfZGVmYXVsdCIsImV4cG9ydHMiLCJtb2R1bGUiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvZGF0YS10eXBlcy9kZWNpbWFsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHR5cGUgRGF0YVR5cGUgfSBmcm9tICcuLi9kYXRhLXR5cGUnO1xuaW1wb3J0IERlY2ltYWxOIGZyb20gJy4vZGVjaW1hbG4nO1xuaW1wb3J0IFdyaXRhYmxlVHJhY2tpbmdCdWZmZXIgZnJvbSAnLi4vdHJhY2tpbmctYnVmZmVyL3dyaXRhYmxlLXRyYWNraW5nLWJ1ZmZlcic7XG5cbmNvbnN0IE5VTExfTEVOR1RIID0gQnVmZmVyLmZyb20oWzB4MDBdKTtcblxuY29uc3QgRGVjaW1hbDogRGF0YVR5cGUgJiB7IHJlc29sdmVQcmVjaXNpb246IE5vbk51bGxhYmxlPERhdGFUeXBlWydyZXNvbHZlUHJlY2lzaW9uJ10+LCByZXNvbHZlU2NhbGU6IE5vbk51bGxhYmxlPERhdGFUeXBlWydyZXNvbHZlU2NhbGUnXT4gfSA9IHtcbiAgaWQ6IDB4MzcsXG4gIHR5cGU6ICdERUNJTUFMJyxcbiAgbmFtZTogJ0RlY2ltYWwnLFxuXG4gIGRlY2xhcmF0aW9uOiBmdW5jdGlvbihwYXJhbWV0ZXIpIHtcbiAgICByZXR1cm4gJ2RlY2ltYWwoJyArICh0aGlzLnJlc29sdmVQcmVjaXNpb24ocGFyYW1ldGVyKSkgKyAnLCAnICsgKHRoaXMucmVzb2x2ZVNjYWxlKHBhcmFtZXRlcikpICsgJyknO1xuICB9LFxuXG4gIHJlc29sdmVQcmVjaXNpb246IGZ1bmN0aW9uKHBhcmFtZXRlcikge1xuICAgIGlmIChwYXJhbWV0ZXIucHJlY2lzaW9uICE9IG51bGwpIHtcbiAgICAgIHJldHVybiBwYXJhbWV0ZXIucHJlY2lzaW9uO1xuICAgIH0gZWxzZSBpZiAocGFyYW1ldGVyLnZhbHVlID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gMTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIDE4O1xuICAgIH1cbiAgfSxcblxuICByZXNvbHZlU2NhbGU6IGZ1bmN0aW9uKHBhcmFtZXRlcikge1xuICAgIGlmIChwYXJhbWV0ZXIuc2NhbGUgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHBhcmFtZXRlci5zY2FsZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICB9LFxuXG4gIGdlbmVyYXRlVHlwZUluZm8ocGFyYW1ldGVyLCBfb3B0aW9ucykge1xuICAgIGxldCBwcmVjaXNpb247XG4gICAgaWYgKHBhcmFtZXRlci5wcmVjaXNpb24hIDw9IDkpIHtcbiAgICAgIHByZWNpc2lvbiA9IDB4MDU7XG4gICAgfSBlbHNlIGlmIChwYXJhbWV0ZXIucHJlY2lzaW9uISA8PSAxOSkge1xuICAgICAgcHJlY2lzaW9uID0gMHgwOTtcbiAgICB9IGVsc2UgaWYgKHBhcmFtZXRlci5wcmVjaXNpb24hIDw9IDI4KSB7XG4gICAgICBwcmVjaXNpb24gPSAweDBEO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcmVjaXNpb24gPSAweDExO1xuICAgIH1cblxuICAgIHJldHVybiBCdWZmZXIuZnJvbShbRGVjaW1hbE4uaWQsIHByZWNpc2lvbiwgcGFyYW1ldGVyLnByZWNpc2lvbiEsIHBhcmFtZXRlci5zY2FsZSFdKTtcbiAgfSxcblxuICBnZW5lcmF0ZVBhcmFtZXRlckxlbmd0aChwYXJhbWV0ZXIsIG9wdGlvbnMpIHtcbiAgICBpZiAocGFyYW1ldGVyLnZhbHVlID09IG51bGwpIHtcbiAgICAgIHJldHVybiBOVUxMX0xFTkdUSDtcbiAgICB9XG5cbiAgICBjb25zdCBwcmVjaXNpb24gPSBwYXJhbWV0ZXIucHJlY2lzaW9uITtcbiAgICBpZiAocHJlY2lzaW9uIDw9IDkpIHtcbiAgICAgIHJldHVybiBCdWZmZXIuZnJvbShbMHgwNV0pO1xuICAgIH0gZWxzZSBpZiAocHJlY2lzaW9uIDw9IDE5KSB7XG4gICAgICByZXR1cm4gQnVmZmVyLmZyb20oWzB4MDldKTtcbiAgICB9IGVsc2UgaWYgKHByZWNpc2lvbiA8PSAyOCkge1xuICAgICAgcmV0dXJuIEJ1ZmZlci5mcm9tKFsweDBEXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBCdWZmZXIuZnJvbShbMHgxMV0pO1xuICAgIH1cbiAgfSxcblxuICAqIGdlbmVyYXRlUGFyYW1ldGVyRGF0YShwYXJhbWV0ZXIsIG9wdGlvbnMpIHtcbiAgICBpZiAocGFyYW1ldGVyLnZhbHVlID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzaWduID0gcGFyYW1ldGVyLnZhbHVlIDwgMCA/IDAgOiAxO1xuICAgIGNvbnN0IHZhbHVlID0gTWF0aC5yb3VuZChNYXRoLmFicyhwYXJhbWV0ZXIudmFsdWUgKiBNYXRoLnBvdygxMCwgcGFyYW1ldGVyLnNjYWxlISkpKTtcbiAgICBjb25zdCBwcmVjaXNpb24gPSBwYXJhbWV0ZXIucHJlY2lzaW9uITtcbiAgICBpZiAocHJlY2lzaW9uIDw9IDkpIHtcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg1KTtcbiAgICAgIGJ1ZmZlci53cml0ZVVJbnQ4KHNpZ24sIDApO1xuICAgICAgYnVmZmVyLndyaXRlVUludDMyTEUodmFsdWUsIDEpO1xuICAgICAgeWllbGQgYnVmZmVyO1xuICAgIH0gZWxzZSBpZiAocHJlY2lzaW9uIDw9IDE5KSB7XG4gICAgICBjb25zdCBidWZmZXIgPSBuZXcgV3JpdGFibGVUcmFja2luZ0J1ZmZlcig5KTtcbiAgICAgIGJ1ZmZlci53cml0ZVVJbnQ4KHNpZ24pO1xuICAgICAgYnVmZmVyLndyaXRlVUludDY0TEUodmFsdWUpO1xuICAgICAgeWllbGQgYnVmZmVyLmRhdGE7XG4gICAgfSBlbHNlIGlmIChwcmVjaXNpb24gPD0gMjgpIHtcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBXcml0YWJsZVRyYWNraW5nQnVmZmVyKDEzKTtcbiAgICAgIGJ1ZmZlci53cml0ZVVJbnQ4KHNpZ24pO1xuICAgICAgYnVmZmVyLndyaXRlVUludDY0TEUodmFsdWUpO1xuICAgICAgYnVmZmVyLndyaXRlVUludDMyTEUoMHgwMDAwMDAwMCk7XG4gICAgICB5aWVsZCBidWZmZXIuZGF0YTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgYnVmZmVyID0gbmV3IFdyaXRhYmxlVHJhY2tpbmdCdWZmZXIoMTcpO1xuICAgICAgYnVmZmVyLndyaXRlVUludDgoc2lnbik7XG4gICAgICBidWZmZXIud3JpdGVVSW50NjRMRSh2YWx1ZSk7XG4gICAgICBidWZmZXIud3JpdGVVSW50MzJMRSgweDAwMDAwMDAwKTtcbiAgICAgIGJ1ZmZlci53cml0ZVVJbnQzMkxFKDB4MDAwMDAwMDApO1xuICAgICAgeWllbGQgYnVmZmVyLmRhdGE7XG4gICAgfVxuICB9LFxuXG4gIHZhbGlkYXRlOiBmdW5jdGlvbih2YWx1ZSk6IG51bWJlciB8IG51bGwge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdmFsdWUgPSBwYXJzZUZsb2F0KHZhbHVlKTtcbiAgICBpZiAoaXNOYU4odmFsdWUpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIG51bWJlci4nKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBEZWNpbWFsO1xubW9kdWxlLmV4cG9ydHMgPSBEZWNpbWFsO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxJQUFBQSxTQUFBLEdBQUFDLHNCQUFBLENBQUFDLE9BQUE7QUFDQSxJQUFBQyx1QkFBQSxHQUFBRixzQkFBQSxDQUFBQyxPQUFBO0FBQWlGLFNBQUFELHVCQUFBRyxHQUFBLFdBQUFBLEdBQUEsSUFBQUEsR0FBQSxDQUFBQyxVQUFBLEdBQUFELEdBQUEsS0FBQUUsT0FBQSxFQUFBRixHQUFBO0FBRWpGLE1BQU1HLFdBQVcsR0FBR0MsTUFBTSxDQUFDQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUV2QyxNQUFNQyxPQUF3SSxHQUFHO0VBQy9JQyxFQUFFLEVBQUUsSUFBSTtFQUNSQyxJQUFJLEVBQUUsU0FBUztFQUNmQyxJQUFJLEVBQUUsU0FBUztFQUVmQyxXQUFXLEVBQUUsU0FBQUEsQ0FBU0MsU0FBUyxFQUFFO0lBQy9CLE9BQU8sVUFBVSxHQUFJLElBQUksQ0FBQ0MsZ0JBQWdCLENBQUNELFNBQVMsQ0FBRSxHQUFHLElBQUksR0FBSSxJQUFJLENBQUNFLFlBQVksQ0FBQ0YsU0FBUyxDQUFFLEdBQUcsR0FBRztFQUN0RyxDQUFDO0VBRURDLGdCQUFnQixFQUFFLFNBQUFBLENBQVNELFNBQVMsRUFBRTtJQUNwQyxJQUFJQSxTQUFTLENBQUNHLFNBQVMsSUFBSSxJQUFJLEVBQUU7TUFDL0IsT0FBT0gsU0FBUyxDQUFDRyxTQUFTO0lBQzVCLENBQUMsTUFBTSxJQUFJSCxTQUFTLENBQUNJLEtBQUssS0FBSyxJ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