"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _iconvLite = _interopRequireDefault(require("iconv-lite"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const MAX = (1 << 16) - 1;
const UNKNOWN_PLP_LEN = Buffer.from([0xfe, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
const PLP_TERMINATOR = Buffer.from([0x00, 0x00, 0x00, 0x00]);
const NULL_LENGTH = Buffer.from([0xFF, 0xFF]);
const MAX_NULL_LENGTH = Buffer.from([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
const VarChar = {
  id: 0xA7,
  type: 'BIGVARCHR',
  name: 'VarChar',
  maximumLength: 8000,
  declaration: function (parameter) {
    const value = parameter.value;
    let length;
    if (parameter.length) {
      length = parameter.length;
    } else if (value != null) {
      length = value.length || 1;
    } else if (value === null && !parameter.output) {
      length = 1;
    } else {
      length = this.maximumLength;
    }
    if (length <= this.maximumLength) {
      return 'varchar(' + length + ')';
    } else {
      return 'varchar(max)';
    }
  },
  resolveLength: function (parameter) {
    const value = parameter.value;
    if (parameter.length != null) {
      return parameter.length;
    } else if (value != null) {
      return value.length || 1;
    } else {
      return this.maximumLength;
    }
  },
  generateTypeInfo(parameter) {
    const buffer = Buffer.alloc(8);
    buffer.writeUInt8(this.id, 0);
    if (parameter.length <= this.maximumLength) {
      buffer.writeUInt16LE(parameter.length, 1);
    } else {
      buffer.writeUInt16LE(MAX, 1);
    }
    if (parameter.collation) {
      parameter.collation.toBuffer().copy(buffer, 3, 0, 5);
    }
    return buffer;
  },
  generateParameterLength(parameter, options) {
    const value = parameter.value;
    if (value == null) {
      if (parameter.length <= this.maximumLength) {
        return NULL_LENGTH;
      } else {
        return MAX_NULL_LENGTH;
      }
    }
    if (parameter.length <= this.maximumLength) {
      const buffer = Buffer.alloc(2);
      buffer.writeUInt16LE(value.length, 0);
      return buffer;
    } else {
      return UNKNOWN_PLP_LEN;
    }
  },
  *generateParameterData(parameter, options) {
    const value = parameter.value;
    if (value == null) {
      return;
    }
    if (parameter.length <= this.maximumLength) {
      yield value;
    } else {
      if (value.length > 0) {
        const buffer = Buffer.alloc(4);
        buffer.writeUInt32LE(value.length, 0);
        yield buffer;
        yield value;
      }
      yield PLP_TERMINATOR;
    }
  },
  validate: function (value, collation) {
    if (value == null) {
      return null;
    }
    if (typeof value !== 'string') {
      throw new TypeError('Invalid string.');
    }
    if (!collation) {
      throw new Error('No collation was set by the server for the current connection.');
    }
    if (!collation.codepage) {
      throw new Error('The collation set by the server has no associated encoding.');
    }
    return _iconvLite.default.encode(value, collation.codepage);
  }
};
var _default = exports.default = VarChar;
module.exports = VarChar;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfaWNvbnZMaXRlIiwiX2ludGVyb3BSZXF1aXJlRGVmYXVsdCIsInJlcXVpcmUiLCJvYmoiLCJfX2VzTW9kdWxlIiwiZGVmYXVsdCIsIk1BWCIsIlVOS05PV05fUExQX0xFTiIsIkJ1ZmZlciIsImZyb20iLCJQTFBfVEVSTUlOQVRPUiIsIk5VTExfTEVOR1RIIiwiTUFYX05VTExfTEVOR1RIIiwiVmFyQ2hhciIsImlkIiwidHlwZSIsIm5hbWUiLCJtYXhpbXVtTGVuZ3RoIiwiZGVjbGFyYXRpb24iLCJwYXJhbWV0ZXIiLCJ2YWx1ZSIsImxlbmd0aCIsIm91dHB1dCIsInJlc29sdmVMZW5ndGgiLCJnZW5lcmF0ZVR5cGVJbmZvIiwiYnVmZmVyIiwiYWxsb2MiLCJ3cml0ZVVJbnQ4Iiwid3JpdGVVSW50MTZMRSIsImNvbGxhdGlvbiIsInRvQnVmZmVyIiwiY29weSIsImdlbmVyYXRlUGFyYW1ldGVyTGVuZ3RoIiwib3B0aW9ucyIsImdlbmVyYXRlUGFyYW1ldGVyRGF0YSIsIndyaXRlVUludDMyTEUiLCJ2YWxpZGF0ZSIsIlR5cGVFcnJvciIsIkVycm9yIiwiY29kZXBhZ2UiLCJpY29udiIsImVuY29kZSIsIl9kZWZhdWx0IiwiZXhwb3J0cyIsIm1vZHVsZSJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kYXRhLXR5cGVzL3ZhcmNoYXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGljb252IGZyb20gJ2ljb252LWxpdGUnO1xuXG5pbXBvcnQgeyB0eXBlIERhdGFUeXBlIH0gZnJvbSAnLi4vZGF0YS10eXBlJztcblxuY29uc3QgTUFYID0gKDEgPDwgMTYpIC0gMTtcbmNvbnN0IFVOS05PV05fUExQX0xFTiA9IEJ1ZmZlci5mcm9tKFsweGZlLCAweGZmLCAweGZmLCAweGZmLCAweGZmLCAweGZmLCAweGZmLCAweGZmXSk7XG5jb25zdCBQTFBfVEVSTUlOQVRPUiA9IEJ1ZmZlci5mcm9tKFsweDAwLCAweDAwLCAweDAwLCAweDAwXSk7XG5cbmNvbnN0IE5VTExfTEVOR1RIID0gQnVmZmVyLmZyb20oWzB4RkYsIDB4RkZdKTtcbmNvbnN0IE1BWF9OVUxMX0xFTkdUSCA9IEJ1ZmZlci5mcm9tKFsweEZGLCAweEZGLCAweEZGLCAweEZGLCAweEZGLCAweEZGLCAweEZGLCAweEZGXSk7XG5cbmNvbnN0IFZhckNoYXI6IHsgbWF4aW11bUxlbmd0aDogbnVtYmVyIH0gJiBEYXRhVHlwZSA9IHtcbiAgaWQ6IDB4QTcsXG4gIHR5cGU6ICdCSUdWQVJDSFInLFxuICBuYW1lOiAnVmFyQ2hhcicsXG4gIG1heGltdW1MZW5ndGg6IDgwMDAsXG5cbiAgZGVjbGFyYXRpb246IGZ1bmN0aW9uKHBhcmFtZXRlcikge1xuICAgIGNvbnN0IHZhbHVlID0gcGFyYW1ldGVyLnZhbHVlIGFzIEJ1ZmZlciB8IG51bGw7XG5cbiAgICBsZXQgbGVuZ3RoO1xuICAgIGlmIChwYXJhbWV0ZXIubGVuZ3RoKSB7XG4gICAgICBsZW5ndGggPSBwYXJhbWV0ZXIubGVuZ3RoO1xuICAgIH0gZWxzZSBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgbGVuZ3RoID0gdmFsdWUubGVuZ3RoIHx8IDE7XG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gbnVsbCAmJiAhcGFyYW1ldGVyLm91dHB1dCkge1xuICAgICAgbGVuZ3RoID0gMTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGVuZ3RoID0gdGhpcy5tYXhpbXVtTGVuZ3RoO1xuICAgIH1cblxuICAgIGlmIChsZW5ndGggPD0gdGhpcy5tYXhpbXVtTGVuZ3RoKSB7XG4gICAgICByZXR1cm4gJ3ZhcmNoYXIoJyArIGxlbmd0aCArICcpJztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICd2YXJjaGFyKG1heCknO1xuICAgIH1cbiAgfSxcblxuICByZXNvbHZlTGVuZ3RoOiBmdW5jdGlvbihwYXJhbWV0ZXIpIHtcbiAgICBjb25zdCB2YWx1ZSA9IHBhcmFtZXRlci52YWx1ZSBhcyBCdWZmZXIgfCBudWxsO1xuXG4gICAgaWYgKHBhcmFtZXRlci5sZW5ndGggIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHBhcmFtZXRlci5sZW5ndGg7XG4gICAgfSBlbHNlIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdmFsdWUubGVuZ3RoIHx8IDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLm1heGltdW1MZW5ndGg7XG4gICAgfVxuICB9LFxuXG4gIGdlbmVyYXRlVHlwZUluZm8ocGFyYW1ldGVyKSB7XG4gICAgY29uc3QgYnVmZmVyID0gQnVmZmVyLmFsbG9jKDgpO1xuICAgIGJ1ZmZlci53cml0ZVVJbnQ4KHRoaXMuaWQsIDApO1xuXG4gICAgaWYgKHBhcmFtZXRlci5sZW5ndGghIDw9IHRoaXMubWF4aW11bUxlbmd0aCkge1xuICAgICAgYnVmZmVyLndyaXRlVUludDE2TEUocGFyYW1ldGVyLmxlbmd0aCEsIDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICBidWZmZXIud3JpdGVVSW50MTZMRShNQVgsIDEpO1xuICAgIH1cblxuICAgIGlmIChwYXJhbWV0ZXIuY29sbGF0aW9uKSB7XG4gICAgICBwYXJhbWV0ZXIuY29sbGF0aW9uLnRvQnVmZmVyKCkuY29weShidWZmZXIsIDMsIDAsIDUpO1xuICAgIH1cblxuICAgIHJldHVybiBidWZmZXI7XG4gIH0sXG5cbiAgZ2VuZXJhdGVQYXJhbWV0ZXJMZW5ndGgocGFyYW1ldGVyLCBvcHRpb25zKSB7XG4gICAgY29uc3QgdmFsdWUgPSBwYXJhbWV0ZXIudmFsdWUgYXMgQnVmZmVyIHwgbnVsbDtcblxuICAgIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgICBpZiAocGFyYW1ldGVyLmxlbmd0aCEgPD0gdGhpcy5tYXhpbXVtTGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBOVUxMX0xFTkdUSDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBNQVhfTlVMTF9MRU5HVEg7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBhcmFtZXRlci5sZW5ndGghIDw9IHRoaXMubWF4aW11bUxlbmd0aCkge1xuICAgICAgY29uc3QgYnVmZmVyID0gQnVmZmVyLmFsbG9jKDIpO1xuICAgICAgYnVmZmVyLndyaXRlVUludDE2TEUodmFsdWUubGVuZ3RoLCAwKTtcbiAgICAgIHJldHVybiBidWZmZXI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBVTktOT1dOX1BMUF9MRU47XG4gICAgfVxuICB9LFxuXG4gICpnZW5lcmF0ZVBhcmFtZXRlckRhdGEocGFyYW1ldGVyLCBvcHRpb25zKSB7XG4gICAgY29uc3QgdmFsdWUgPSBwYXJhbWV0ZXIudmFsdWUgYXMgQnVmZmVyIHwgbnVsbDtcblxuICAgIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHBhcmFtZXRlci5sZW5ndGghIDw9IHRoaXMubWF4aW11bUxlbmd0aCkge1xuICAgICAgeWllbGQgdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh2YWx1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KTtcbiAgICAgICAgYnVmZmVyLndyaXRlVUludDMyTEUodmFsdWUubGVuZ3RoLCAwKTtcbiAgICAgICAgeWllbGQgYnVmZmVyO1xuXG4gICAgICAgIHlpZWxkIHZhbHVlO1xuICAgICAgfVxuXG4gICAgICB5aWVsZCBQTFBfVEVSTUlOQVRPUjtcbiAgICB9XG4gIH0sXG5cbiAgdmFsaWRhdGU6IGZ1bmN0aW9uKHZhbHVlLCBjb2xsYXRpb24pOiBCdWZmZXIgfCBudWxsIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgc3RyaW5nLicpO1xuICAgIH1cblxuICAgIGlmICghY29sbGF0aW9uKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGNvbGxhdGlvbiB3YXMgc2V0IGJ5IHRoZSBzZXJ2ZXIgZm9yIHRoZSBjdXJyZW50IGNvbm5lY3Rpb24uJyk7XG4gICAgfVxuXG4gICAgaWYgKCFjb2xsYXRpb24uY29kZXBhZ2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIGNvbGxhdGlvbiBzZXQgYnkgdGhlIHNlcnZlciBoYXMgbm8gYXNzb2NpYXRlZCBlbmNvZGluZy4nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gaWNvbnYuZW5jb2RlKHZhbHVlLCBjb2xsYXRpb24uY29kZXBhZ2UpO1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBWYXJDaGFyO1xubW9kdWxlLmV4cG9ydHMgPSBWYXJDaGFyO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxJQUFBQSxVQUFBLEdBQUFDLHNCQUFBLENBQUFDLE9BQUE7QUFBK0IsU0FBQUQsdUJBQUFFLEdBQUEsV0FBQUEsR0FBQSxJQUFBQSxHQUFBLENBQUFDLFVBQUEsR0FBQUQsR0FBQSxLQUFBRSxPQUFBLEVBQUFGLEdBQUE7QUFJL0IsTUFBTUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDO0FBQ3pCLE1BQU1DLGVBQWUsR0FBR0MsTUFBTSxDQUFDQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDckYsTUFBTUMsY0FBYyxHQUFHRixNQUFNLENBQUNDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBRTVELE1BQU1FLFdBQVcsR0FBR0gsTUFBTSxDQUFDQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0MsTUFBTUcsZUFBZSxHQUFHSixNQUFNLENBQUNDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFB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