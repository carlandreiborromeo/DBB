"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _floatn = _interopRequireDefault(require("./floatn"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const NULL_LENGTH = Buffer.from([0x00]);
const Float = {
  id: 0x3E,
  type: 'FLT8',
  name: 'Float',
  declaration: function () {
    return 'float';
  },
  generateTypeInfo() {
    return Buffer.from([_floatn.default.id, 0x08]);
  },
  generateParameterLength(parameter, options) {
    if (parameter.value == null) {
      return NULL_LENGTH;
    }
    return Buffer.from([0x08]);
  },
  *generateParameterData(parameter, options) {
    if (parameter.value == null) {
      return;
    }
    const buffer = Buffer.alloc(8);
    buffer.writeDoubleLE(parseFloat(parameter.value), 0);
    yield buffer;
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
var _default = exports.default = Float;
module.exports = Float;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfZmxvYXRuIiwiX2ludGVyb3BSZXF1aXJlRGVmYXVsdCIsInJlcXVpcmUiLCJvYmoiLCJfX2VzTW9kdWxlIiwiZGVmYXVsdCIsIk5VTExfTEVOR1RIIiwiQnVmZmVyIiwiZnJvbSIsIkZsb2F0IiwiaWQiLCJ0eXBlIiwibmFtZSIsImRlY2xhcmF0aW9uIiwiZ2VuZXJhdGVUeXBlSW5mbyIsIkZsb2F0TiIsImdlbmVyYXRlUGFyYW1ldGVyTGVuZ3RoIiwicGFyYW1ldGVyIiwib3B0aW9ucyIsInZhbHVlIiwiZ2VuZXJhdGVQYXJhbWV0ZXJEYXRhIiwiYnVmZmVyIiwiYWxsb2MiLCJ3cml0ZURvdWJsZUxFIiwicGFyc2VGbG9hdCIsInZhbGlkYXRlIiwiaXNOYU4iLCJUeXBlRXJyb3IiLCJfZGVmYXVsdCIsImV4cG9ydHMiLCJtb2R1bGUiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvZGF0YS10eXBlcy9mbG9hdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB0eXBlIERhdGFUeXBlIH0gZnJvbSAnLi4vZGF0YS10eXBlJztcbmltcG9ydCBGbG9hdE4gZnJvbSAnLi9mbG9hdG4nO1xuXG5jb25zdCBOVUxMX0xFTkdUSCA9IEJ1ZmZlci5mcm9tKFsweDAwXSk7XG5cbmNvbnN0IEZsb2F0OiBEYXRhVHlwZSA9IHtcbiAgaWQ6IDB4M0UsXG4gIHR5cGU6ICdGTFQ4JyxcbiAgbmFtZTogJ0Zsb2F0JyxcblxuICBkZWNsYXJhdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICdmbG9hdCc7XG4gIH0sXG5cbiAgZ2VuZXJhdGVUeXBlSW5mbygpIHtcbiAgICByZXR1cm4gQnVmZmVyLmZyb20oW0Zsb2F0Ti5pZCwgMHgwOF0pO1xuICB9LFxuXG4gIGdlbmVyYXRlUGFyYW1ldGVyTGVuZ3RoKHBhcmFtZXRlciwgb3B0aW9ucykge1xuICAgIGlmIChwYXJhbWV0ZXIudmFsdWUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIE5VTExfTEVOR1RIO1xuICAgIH1cblxuICAgIHJldHVybiBCdWZmZXIuZnJvbShbMHgwOF0pO1xuICB9LFxuXG4gICogZ2VuZXJhdGVQYXJhbWV0ZXJEYXRhKHBhcmFtZXRlciwgb3B0aW9ucykge1xuICAgIGlmIChwYXJhbWV0ZXIudmFsdWUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg4KTtcbiAgICBidWZmZXIud3JpdGVEb3VibGVMRShwYXJzZUZsb2F0KHBhcmFtZXRlci52YWx1ZSksIDApO1xuICAgIHlpZWxkIGJ1ZmZlcjtcbiAgfSxcblxuICB2YWxpZGF0ZTogZnVuY3Rpb24odmFsdWUpOiBudW1iZXIgfCBudWxsIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHZhbHVlID0gcGFyc2VGbG9hdCh2YWx1ZSk7XG4gICAgaWYgKGlzTmFOKHZhbHVlKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBudW1iZXIuJyk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgRmxvYXQ7XG5tb2R1bGUuZXhwb3J0cyA9IEZsb2F0O1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxJQUFBQSxPQUFBLEdBQUFDLHNCQUFBLENBQUFDLE9BQUE7QUFBOEIsU0FBQUQsdUJBQUFFLEdBQUEsV0FBQUEsR0FBQSxJQUFBQSxHQUFBLENBQUFDLFVBQUEsR0FBQUQsR0FBQSxLQUFBRSxPQUFBLEVBQUFGLEdBQUE7QUFFOUIsTUFBTUcsV0FBVyxHQUFHQyxNQUFNLENBQUNDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBRXZDLE1BQU1DLEtBQWUsR0FBRztFQUN0QkMsRUFBRSxFQUFFLElBQUk7RUFDUkMsSUFBSSxFQUFFLE1BQU07RUFDWkMsSUFBSSxFQUFFLE9BQU87RUFFYkMsV0FBVyxFQUFFLFNBQUFBLENBQUEsRUFBVztJQUN0QixPQUFPLE9BQU87RUFDaEIsQ0FBQztFQUVEQyxnQkFBZ0JBLENBQUEsRUFBRztJQUNqQixPQUFPUCxNQUFNLENBQUNDLElBQUksQ0FBQyxDQUFDTyxlQUFNLENBQUNMLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztFQUN2QyxDQUFDO0VBRURNLHVCQUF1QkEsQ0FBQ0MsU0FBUyxFQUFFQyxPQUFPLEVBQUU7SUFDMUMsSUFBSUQsU0FBUyxDQUFDRSxLQUFLLElBQUksSUFBSSxFQUFFO01BQzNCLE9BQU9iLFdBQVc7SUFDcEI7SUFFQSxPQUFPQyxNQUFNLENBQUNDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQzVCLENBQUM7RUFFRCxDQUFFWSxxQkFBcUJBLENBQUNILFNBQVMsRUFBRUMsT0FBTyxFQUFFO0lBQzFDLElBQUlELFNBQVMsQ0FBQ0UsS0FBSyxJQUFJLElBQUksRUFBRTtNQUMzQjtJQUNGO0lBRUEsTUFBTUUsTUFBTSxHQUFHZCxNQUFNLENBQUNlLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDOUJELE1BQU0sQ0FBQ0UsYUFBYSxDQUFDQyxVQUFVLENBQUNQLFNBQVMsQ0FBQ0UsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3BELE1BQU1FLE1BQU07RUFDZCxDQUFDO0VBRURJLFFBQVEsRUFBRSxTQUFBQSxDQUFTTixLQUFLLEVBQWlCO0lBQ3ZDLElBQUlBLEtBQUssSUFBSSxJQUFJLEVBQUU7TUFDakIsT0FBTyxJQUFJO0lBQ2I7SUFDQUEsS0FBSyxHQUFHSyxVQUFVLENBQUNMLEtBQUssQ0FBQztJQUN6QixJQUFJTyxLQUFLLENBQUNQLEtBQUssQ0FBQyxFQUFFO01BQ2hCLE1BQU0sSUFBSVEsU0FBUyxDQUFDLGlCQUFpQixDQUFDO0lBQ3hDO0lBQ0EsT0FBT1IsS0FBSztFQUNkO0FBQ0YsQ0FBQztBQUFDLElBQUFTLFFBQUEsR0FBQUMsT0FBQSxDQUFBeEIsT0FBQSxHQUVhSSxLQUFLO0FBQ3BCcUIsTUFBTSxDQUFDRCxPQUFPLEdBQUdwQixLQUFLIn0=