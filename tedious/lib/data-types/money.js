"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _moneyn = _interopRequireDefault(require("./moneyn"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const SHIFT_LEFT_32 = (1 << 16) * (1 << 16);
const SHIFT_RIGHT_32 = 1 / SHIFT_LEFT_32;
const NULL_LENGTH = Buffer.from([0x00]);
const DATA_LENGTH = Buffer.from([0x08]);
const Money = {
  id: 0x3C,
  type: 'MONEY',
  name: 'Money',
  declaration: function () {
    return 'money';
  },
  generateTypeInfo: function () {
    return Buffer.from([_moneyn.default.id, 0x08]);
  },
  generateParameterLength(parameter, options) {
    if (parameter.value == null) {
      return NULL_LENGTH;
    }
    return DATA_LENGTH;
  },
  *generateParameterData(parameter, options) {
    if (parameter.value == null) {
      return;
    }
    const value = parameter.value * 10000;
    const buffer = Buffer.alloc(8);
    buffer.writeInt32LE(Math.floor(value * SHIFT_RIGHT_32), 0);
    buffer.writeInt32LE(value & -1, 4);
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
    // money： -922337203685477.5808 to 922337203685477.5807
    // in javascript -922337203685477.5808 === -922337203685477.6
    //                922337203685477.5807 === 922337203685477.6
    // javascript number doesn't have enough precision.
    if (value < -922337203685477.6 || value > 922337203685477.6) {
      throw new TypeError('Value must be between -922337203685477.5808 and 922337203685477.5807, inclusive.');
    }
    return value;
  }
};
var _default = exports.default = Money;
module.exports = Money;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfbW9uZXluIiwiX2ludGVyb3BSZXF1aXJlRGVmYXVsdCIsInJlcXVpcmUiLCJvYmoiLCJfX2VzTW9kdWxlIiwiZGVmYXVsdCIsIlNISUZUX0xFRlRfMzIiLCJTSElGVF9SSUdIVF8zMiIsIk5VTExfTEVOR1RIIiwiQnVmZmVyIiwiZnJvbSIsIkRBVEFfTEVOR1RIIiwiTW9uZXkiLCJpZCIsInR5cGUiLCJuYW1lIiwiZGVjbGFyYXRpb24iLCJnZW5lcmF0ZVR5cGVJbmZvIiwiTW9uZXlOIiwiZ2VuZXJhdGVQYXJhbWV0ZXJMZW5ndGgiLCJwYXJhbWV0ZXIiLCJvcHRpb25zIiwidmFsdWUiLCJnZW5lcmF0ZVBhcmFtZXRlckRhdGEiLCJidWZmZXIiLCJhbGxvYyIsIndyaXRlSW50MzJMRSIsIk1hdGgiLCJmbG9vciIsInZhbGlkYXRlIiwicGFyc2VGbG9hdCIsImlzTmFOIiwiVHlwZUVycm9yIiwiX2RlZmF1bHQiLCJleHBvcnRzIiwibW9kdWxlIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL2RhdGEtdHlwZXMvbW9uZXkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdHlwZSBEYXRhVHlwZSB9IGZyb20gJy4uL2RhdGEtdHlwZSc7XG5pbXBvcnQgTW9uZXlOIGZyb20gJy4vbW9uZXluJztcblxuY29uc3QgU0hJRlRfTEVGVF8zMiA9ICgxIDw8IDE2KSAqICgxIDw8IDE2KTtcbmNvbnN0IFNISUZUX1JJR0hUXzMyID0gMSAvIFNISUZUX0xFRlRfMzI7XG5cbmNvbnN0IE5VTExfTEVOR1RIID0gQnVmZmVyLmZyb20oWzB4MDBdKTtcbmNvbnN0IERBVEFfTEVOR1RIID0gQnVmZmVyLmZyb20oWzB4MDhdKTtcblxuY29uc3QgTW9uZXk6IERhdGFUeXBlID0ge1xuICBpZDogMHgzQyxcbiAgdHlwZTogJ01PTkVZJyxcbiAgbmFtZTogJ01vbmV5JyxcblxuICBkZWNsYXJhdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICdtb25leSc7XG4gIH0sXG5cbiAgZ2VuZXJhdGVUeXBlSW5mbzogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5mcm9tKFtNb25leU4uaWQsIDB4MDhdKTtcbiAgfSxcblxuICBnZW5lcmF0ZVBhcmFtZXRlckxlbmd0aChwYXJhbWV0ZXIsIG9wdGlvbnMpIHtcbiAgICBpZiAocGFyYW1ldGVyLnZhbHVlID09IG51bGwpIHtcbiAgICAgIHJldHVybiBOVUxMX0xFTkdUSDtcbiAgICB9XG5cbiAgICByZXR1cm4gREFUQV9MRU5HVEg7XG4gIH0sXG5cbiAgKiBnZW5lcmF0ZVBhcmFtZXRlckRhdGEocGFyYW1ldGVyLCBvcHRpb25zKSB7XG4gICAgaWYgKHBhcmFtZXRlci52YWx1ZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdmFsdWUgPSBwYXJhbWV0ZXIudmFsdWUgKiAxMDAwMDtcblxuICAgIGNvbnN0IGJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg4KTtcbiAgICBidWZmZXIud3JpdGVJbnQzMkxFKE1hdGguZmxvb3IodmFsdWUgKiBTSElGVF9SSUdIVF8zMiksIDApO1xuICAgIGJ1ZmZlci53cml0ZUludDMyTEUodmFsdWUgJiAtMSwgNCk7XG4gICAgeWllbGQgYnVmZmVyO1xuICB9LFxuXG4gIHZhbGlkYXRlOiBmdW5jdGlvbih2YWx1ZSk6IG51bWJlciB8IG51bGwge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdmFsdWUgPSBwYXJzZUZsb2F0KHZhbHVlKTtcbiAgICBpZiAoaXNOYU4odmFsdWUpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIG51bWJlci4nKTtcbiAgICB9XG4gICAgLy8gbW9uZXnvvJogLTkyMjMzNzIwMzY4NTQ3Ny41ODA4IHRvIDkyMjMzNzIwMzY4NTQ3Ny41ODA3XG4gICAgLy8gaW4gamF2YXNjcmlwdCAtOTIyMzM3MjAzNjg1NDc3LjU4MDggPT09IC05MjIzMzcyMDM2ODU0NzcuNlxuICAgIC8vICAgICAgICAgICAgICAgIDkyMjMzNzIwMzY4NTQ3Ny41ODA3ID09PSA5MjIzMzcyMDM2ODU0NzcuNlxuICAgIC8vIGphdmFzY3JpcHQgbnVtYmVyIGRvZXNuJ3QgaGF2ZSBlbm91Z2ggcHJlY2lzaW9uLlxuICAgIGlmICh2YWx1ZSA8IC05MjIzMzcyMDM2ODU0NzcuNiB8fCB2YWx1ZSA+IDkyMjMzNzIwMzY4NTQ3Ny42KSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdWYWx1ZSBtdXN0IGJlIGJldHdlZW4gLTkyMjMzNzIwMzY4NTQ3Ny41ODA4IGFuZCA5MjIzMzcyMDM2ODU0NzcuNTgwNywgaW5jbHVzaXZlLicpO1xuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgTW9uZXk7XG5tb2R1bGUuZXhwb3J0cyA9IE1vbmV5O1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxJQUFBQSxPQUFBLEdBQUFDLHNCQUFBLENBQUFDLE9BQUE7QUFBOEIsU0FBQUQsdUJBQUFFLEdBQUEsV0FBQUEsR0FBQSxJQUFBQSxHQUFBLENBQUFDLFVBQUEsR0FBQUQsR0FBQSxLQUFBRSxPQUFBLEVBQUFGLEdBQUE7QUFFOUIsTUFBTUcsYUFBYSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQzNDLE1BQU1DLGNBQWMsR0FBRyxDQUFDLEdBQUdELGFBQWE7QUFFeEMsTUFBTUUsV0FBVyxHQUFHQyxNQUFNLENBQUNDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3ZDLE1BQU1DLFdBQVcsR0FBR0YsTUFBTSxDQUFDQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUV2QyxNQUFNRSxLQUFlLEdBQUc7RUFDdEJDLEVBQUUsRUFBRSxJQUFJO0VBQ1JDLElBQUksRUFBRSxPQUFPO0VBQ2JDLElBQUksRUFBRSxPQUFPO0VBRWJDLFdBQVcsRUFBRSxTQUFBQSxDQUFBLEVBQVc7SUFDdEIsT0FBTyxPQUFPO0VBQ2hCLENBQUM7RUFFREMsZ0JBQWdCLEVBQUUsU0FBQUEsQ0FBQSxFQUFXO0lBQzNCLE9BQU9SLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDLENBQUNRLGVBQU0sQ0FBQ0wsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO0VBQ3ZDLENBQUM7RUFFRE0sdUJBQXVCQSxDQUFDQyxTQUFTLEVBQUVDLE9BQU8sRUFBRTtJQUMxQyxJQUFJRCxTQUFTLENBQUNFLEtBQUssSUFBSSxJQUFJLEVBQUU7TUFDM0IsT0FBT2QsV0FBVztJQUNwQjtJQUVBLE9BQU9HLFdBQVc7RUFDcEIsQ0FBQztFQUVELENBQUVZLHFCQUFxQkEsQ0FBQ0gsU0FBUyxFQUFFQyxPQUFPLEVBQUU7SUFDMUMsSUFBSUQsU0FBUyxDQUFDRSxLQUFLLElBQUksSUFBSSxFQUFFO01BQzNCO0lBQ0Y7SUFFQSxNQUFNQSxLQUFLLEdBQUdGLFNBQVMsQ0FBQ0UsS0FBSyxHQUFHLEtBQUs7SUFFckMsTUFBTUUsTUFBTSxHQUFHZixNQUFNLENBQUNnQixLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzlCRCxNQUFNLENBQUNFLFlBQVksQ0FBQ0MsSUFBSSxDQUFDQyxLQUFLLENBQUNOLEtBQUssR0FBR2YsY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzFEaUIsTUFBTSxDQUFDRSxZQUFZLENBQUNKLEtBQUssR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbEMsTUFBTUUsTUFBTTtFQUNkLENBQUM7RUFFREssUUFBUSxFQUFFLFNBQUFBLENBQVNQLEtBQUssRUFBaUI7SUFDdkMsSUFBSUEsS0FBSyxJQUFJLElBQUksRUFBRTtNQUNqQixPQUFPLElBQUk7SUFDYjtJQUNBQSxLQUFLLEdBQUdRLFVBQVUsQ0FBQ1IsS0FBSyxDQUFDO0lBQ3pCLElBQUlTLEtBQUssQ0FBQ1QsS0FBSyxDQUFDLEVBQUU7TUFDaEIsTUFBTSxJQUFJVSxTQUFTLENBQUMsaUJBQWlCLENBQUM7SUFDeEM7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBLElBQUlWLEtBQUssR0FBRyxDQUFDLGlCQUFpQixJQUFJQSxLQUFLLEdBQUcsaUJBQWlCLEVBQUU7TUFDM0QsTUFBTSxJQUFJVSxTQUFTLENBQUMsa0ZBQWtGLENBQUM7SUFDekc7SUFFQSxPQUFPVixLQUFLO0VBQ2Q7QUFDRixDQUFDO0FBQUMsSUFBQVcsUUFBQSxHQUFBQyxPQUFBLENBQUE3QixPQUFBLEdBRWFPLEtBQUs7QUFDcEJ1QixNQUFNLENBQUNELE9BQU8sR0FBR3RCLEtBQUsifQ==