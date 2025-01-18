"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _iconvLite = _interopRequireDefault(require("iconv-lite"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const NULL_LENGTH = Buffer.from([0xFF, 0xFF, 0xFF, 0xFF]);
const Text = {
  id: 0x23,
  type: 'TEXT',
  name: 'Text',
  hasTableName: true,
  declaration: function () {
    return 'text';
  },
  resolveLength: function (parameter) {
    const value = parameter.value;
    if (value != null) {
      return value.length;
    } else {
      return -1;
    }
  },
  generateTypeInfo(parameter, _options) {
    const buffer = Buffer.alloc(10);
    buffer.writeUInt8(this.id, 0);
    buffer.writeInt32LE(parameter.length, 1);
    if (parameter.collation) {
      parameter.collation.toBuffer().copy(buffer, 5, 0, 5);
    }
    return buffer;
  },
  generateParameterLength(parameter, options) {
    const value = parameter.value;
    if (value == null) {
      return NULL_LENGTH;
    }
    const buffer = Buffer.alloc(4);
    buffer.writeInt32LE(value.length, 0);
    return buffer;
  },
  generateParameterData: function* (parameter, options) {
    const value = parameter.value;
    if (value == null) {
      return;
    }
    yield value;
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
var _default = exports.default = Text;
module.exports = Text;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfaWNvbnZMaXRlIiwiX2ludGVyb3BSZXF1aXJlRGVmYXVsdCIsInJlcXVpcmUiLCJvYmoiLCJfX2VzTW9kdWxlIiwiZGVmYXVsdCIsIk5VTExfTEVOR1RIIiwiQnVmZmVyIiwiZnJvbSIsIlRleHQiLCJpZCIsInR5cGUiLCJuYW1lIiwiaGFzVGFibGVOYW1lIiwiZGVjbGFyYXRpb24iLCJyZXNvbHZlTGVuZ3RoIiwicGFyYW1ldGVyIiwidmFsdWUiLCJsZW5ndGgiLCJnZW5lcmF0ZVR5cGVJbmZvIiwiX29wdGlvbnMiLCJidWZmZXIiLCJhbGxvYyIsIndyaXRlVUludDgiLCJ3cml0ZUludDMyTEUiLCJjb2xsYXRpb24iLCJ0b0J1ZmZlciIsImNvcHkiLCJnZW5lcmF0ZVBhcmFtZXRlckxlbmd0aCIsIm9wdGlvbnMiLCJnZW5lcmF0ZVBhcmFtZXRlckRhdGEiLCJ2YWxpZGF0ZSIsIlR5cGVFcnJvciIsIkVycm9yIiwiY29kZXBhZ2UiLCJpY29udiIsImVuY29kZSIsIl9kZWZhdWx0IiwiZXhwb3J0cyIsIm1vZHVsZSJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kYXRhLXR5cGVzL3RleHQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGljb252IGZyb20gJ2ljb252LWxpdGUnO1xuXG5pbXBvcnQgeyB0eXBlIERhdGFUeXBlIH0gZnJvbSAnLi4vZGF0YS10eXBlJztcblxuY29uc3QgTlVMTF9MRU5HVEggPSBCdWZmZXIuZnJvbShbMHhGRiwgMHhGRiwgMHhGRiwgMHhGRl0pO1xuXG5jb25zdCBUZXh0OiBEYXRhVHlwZSA9IHtcbiAgaWQ6IDB4MjMsXG4gIHR5cGU6ICdURVhUJyxcbiAgbmFtZTogJ1RleHQnLFxuXG4gIGhhc1RhYmxlTmFtZTogdHJ1ZSxcblxuICBkZWNsYXJhdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICd0ZXh0JztcbiAgfSxcblxuICByZXNvbHZlTGVuZ3RoOiBmdW5jdGlvbihwYXJhbWV0ZXIpIHtcbiAgICBjb25zdCB2YWx1ZSA9IHBhcmFtZXRlci52YWx1ZSBhcyBCdWZmZXIgfCBudWxsO1xuXG4gICAgaWYgKHZhbHVlICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB2YWx1ZS5sZW5ndGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG4gIH0sXG5cbiAgZ2VuZXJhdGVUeXBlSW5mbyhwYXJhbWV0ZXIsIF9vcHRpb25zKSB7XG4gICAgY29uc3QgYnVmZmVyID0gQnVmZmVyLmFsbG9jKDEwKTtcbiAgICBidWZmZXIud3JpdGVVSW50OCh0aGlzLmlkLCAwKTtcbiAgICBidWZmZXIud3JpdGVJbnQzMkxFKHBhcmFtZXRlci5sZW5ndGghLCAxKTtcblxuICAgIGlmIChwYXJhbWV0ZXIuY29sbGF0aW9uKSB7XG4gICAgICBwYXJhbWV0ZXIuY29sbGF0aW9uLnRvQnVmZmVyKCkuY29weShidWZmZXIsIDUsIDAsIDUpO1xuICAgIH1cblxuICAgIHJldHVybiBidWZmZXI7XG4gIH0sXG5cbiAgZ2VuZXJhdGVQYXJhbWV0ZXJMZW5ndGgocGFyYW1ldGVyLCBvcHRpb25zKSB7XG4gICAgY29uc3QgdmFsdWUgPSBwYXJhbWV0ZXIudmFsdWUgYXMgQnVmZmVyIHwgbnVsbDtcblxuICAgIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gTlVMTF9MRU5HVEg7XG4gICAgfVxuXG4gICAgY29uc3QgYnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpO1xuICAgIGJ1ZmZlci53cml0ZUludDMyTEUodmFsdWUubGVuZ3RoLCAwKTtcbiAgICByZXR1cm4gYnVmZmVyO1xuICB9LFxuXG4gIGdlbmVyYXRlUGFyYW1ldGVyRGF0YTogZnVuY3Rpb24qKHBhcmFtZXRlciwgb3B0aW9ucykge1xuICAgIGNvbnN0IHZhbHVlID0gcGFyYW1ldGVyLnZhbHVlIGFzIEJ1ZmZlciB8IG51bGw7XG5cbiAgICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHlpZWxkIHZhbHVlO1xuICB9LFxuXG4gIHZhbGlkYXRlOiBmdW5jdGlvbih2YWx1ZSwgY29sbGF0aW9uKTogQnVmZmVyIHwgbnVsbCB7XG4gICAgaWYgKHZhbHVlID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIHN0cmluZy4nKTtcbiAgICB9XG5cbiAgICBpZiAoIWNvbGxhdGlvbikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBjb2xsYXRpb24gd2FzIHNldCBieSB0aGUgc2VydmVyIGZvciB0aGUgY3VycmVudCBjb25uZWN0aW9uLicpO1xuICAgIH1cblxuICAgIGlmICghY29sbGF0aW9uLmNvZGVwYWdlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBjb2xsYXRpb24gc2V0IGJ5IHRoZSBzZXJ2ZXIgaGFzIG5vIGFzc29jaWF0ZWQgZW5jb2RpbmcuJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGljb252LmVuY29kZSh2YWx1ZSwgY29sbGF0aW9uLmNvZGVwYWdlKTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgVGV4dDtcbm1vZHVsZS5leHBvcnRzID0gVGV4dDtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBQUEsVUFBQSxHQUFBQyxzQkFBQSxDQUFBQyxPQUFBO0FBQStCLFNBQUFELHVCQUFBRSxHQUFBLFdBQUFBLEdBQUEsSUFBQUEsR0FBQSxDQUFBQyxVQUFBLEdBQUFELEdBQUEsS0FBQUUsT0FBQSxFQUFBRixHQUFBO0FBSS9CLE1BQU1HLFdBQVcsR0FBR0MsTUFBTSxDQUFDQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUV6RCxNQUFNQyxJQUFjLEdBQUc7RUFDckJDLEVBQUUsRUFBRSxJQUFJO0VBQ1JDLElBQUksRUFBRSxNQUFNO0VBQ1pDLElBQUksRUFBRSxNQUFN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