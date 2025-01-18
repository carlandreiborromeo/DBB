"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _helpers = require("./helpers");
var _token = require("./token");
const FEATURE_ID = {
  SESSIONRECOVERY: 0x01,
  FEDAUTH: 0x02,
  COLUMNENCRYPTION: 0x04,
  GLOBALTRANSACTIONS: 0x05,
  AZURESQLSUPPORT: 0x08,
  UTF8_SUPPORT: 0x0A,
  TERMINATOR: 0xFF
};
function featureExtAckParser(buf, offset, _options) {
  let fedAuth;
  let utf8Support;
  while (true) {
    let featureId;
    ({
      value: featureId,
      offset
    } = (0, _helpers.readUInt8)(buf, offset));
    if (featureId === FEATURE_ID.TERMINATOR) {
      return new _helpers.Result(new _token.FeatureExtAckToken(fedAuth, utf8Support), offset);
    }
    let featureAckDataLen;
    ({
      value: featureAckDataLen,
      offset
    } = (0, _helpers.readUInt32LE)(buf, offset));
    if (buf.length < offset + featureAckDataLen) {
      throw new _helpers.NotEnoughDataError(offset + featureAckDataLen);
    }
    const featureData = buf.slice(offset, offset + featureAckDataLen);
    offset += featureAckDataLen;
    switch (featureId) {
      case FEATURE_ID.FEDAUTH:
        fedAuth = featureData;
        break;
      case FEATURE_ID.UTF8_SUPPORT:
        utf8Support = !!featureData[0];
        break;
    }
  }
}
var _default = exports.default = featureExtAckParser;
module.exports = featureExtAckParser;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfaGVscGVycyIsInJlcXVpcmUiLCJfdG9rZW4iLCJGRUFUVVJFX0lEIiwiU0VTU0lPTlJFQ09WRVJZIiwiRkVEQVVUSCIsIkNPTFVNTkVOQ1JZUFRJT04iLCJHTE9CQUxUUkFOU0FDVElPTlMiLCJBWlVSRVNRTFNVUFBPUlQiLCJVVEY4X1NVUFBPUlQiLCJURVJNSU5BVE9SIiwiZmVhdHVyZUV4dEFja1BhcnNlciIsImJ1ZiIsIm9mZnNldCIsIl9vcHRpb25zIiwiZmVkQXV0aCIsInV0ZjhTdXBwb3J0IiwiZmVhdHVyZUlkIiwidmFsdWUiLCJyZWFkVUludDgiLCJSZXN1bHQiLCJGZWF0dXJlRXh0QWNrVG9rZW4iLCJmZWF0dXJlQWNrRGF0YUxlbiIsInJlYWRVSW50MzJMRSIsImxlbmd0aCIsIk5vdEVub3VnaERhdGFFcnJvciIsImZlYXR1cmVEYXRhIiwic2xpY2UiLCJfZGVmYXVsdCIsImV4cG9ydHMiLCJkZWZhdWx0IiwibW9kdWxlIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Rva2VuL2ZlYXR1cmUtZXh0LWFjay1wYXJzZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTm90RW5vdWdoRGF0YUVycm9yLCByZWFkVUludDMyTEUsIHJlYWRVSW50OCwgUmVzdWx0IH0gZnJvbSAnLi9oZWxwZXJzJztcbmltcG9ydCB7IHR5cGUgUGFyc2VyT3B0aW9ucyB9IGZyb20gJy4vc3RyZWFtLXBhcnNlcic7XG5cbmltcG9ydCB7IEZlYXR1cmVFeHRBY2tUb2tlbiB9IGZyb20gJy4vdG9rZW4nO1xuXG5jb25zdCBGRUFUVVJFX0lEID0ge1xuICBTRVNTSU9OUkVDT1ZFUlk6IDB4MDEsXG4gIEZFREFVVEg6IDB4MDIsXG4gIENPTFVNTkVOQ1JZUFRJT046IDB4MDQsXG4gIEdMT0JBTFRSQU5TQUNUSU9OUzogMHgwNSxcbiAgQVpVUkVTUUxTVVBQT1JUOiAweDA4LFxuICBVVEY4X1NVUFBPUlQ6IDB4MEEsXG4gIFRFUk1JTkFUT1I6IDB4RkZcbn07XG5cbmZ1bmN0aW9uIGZlYXR1cmVFeHRBY2tQYXJzZXIoYnVmOiBCdWZmZXIsIG9mZnNldDogbnVtYmVyLCBfb3B0aW9uczogUGFyc2VyT3B0aW9ucyk6IFJlc3VsdDxGZWF0dXJlRXh0QWNrVG9rZW4+IHtcbiAgbGV0IGZlZEF1dGg6IEJ1ZmZlciB8IHVuZGVmaW5lZDtcbiAgbGV0IHV0ZjhTdXBwb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgbGV0IGZlYXR1cmVJZDtcbiAgICAoeyB2YWx1ZTogZmVhdHVyZUlkLCBvZmZzZXQgfSA9IHJlYWRVSW50OChidWYsIG9mZnNldCkpO1xuXG4gICAgaWYgKGZlYXR1cmVJZCA9PT0gRkVBVFVSRV9JRC5URVJNSU5BVE9SKSB7XG4gICAgICByZXR1cm4gbmV3IFJlc3VsdChuZXcgRmVhdHVyZUV4dEFja1Rva2VuKGZlZEF1dGgsIHV0ZjhTdXBwb3J0KSwgb2Zmc2V0KTtcbiAgICB9XG5cbiAgICBsZXQgZmVhdHVyZUFja0RhdGFMZW47XG4gICAgKHsgdmFsdWU6IGZlYXR1cmVBY2tEYXRhTGVuLCBvZmZzZXQgfSA9IHJlYWRVSW50MzJMRShidWYsIG9mZnNldCkpO1xuXG4gICAgaWYgKGJ1Zi5sZW5ndGggPCBvZmZzZXQgKyBmZWF0dXJlQWNrRGF0YUxlbikge1xuICAgICAgdGhyb3cgbmV3IE5vdEVub3VnaERhdGFFcnJvcihvZmZzZXQgKyBmZWF0dXJlQWNrRGF0YUxlbik7XG4gICAgfVxuXG4gICAgY29uc3QgZmVhdHVyZURhdGEgPSBidWYuc2xpY2Uob2Zmc2V0LCBvZmZzZXQgKyBmZWF0dXJlQWNrRGF0YUxlbik7XG4gICAgb2Zmc2V0ICs9IGZlYXR1cmVBY2tEYXRhTGVuO1xuXG4gICAgc3dpdGNoIChmZWF0dXJlSWQpIHtcbiAgICAgIGNhc2UgRkVBVFVSRV9JRC5GRURBVVRIOlxuICAgICAgICBmZWRBdXRoID0gZmVhdHVyZURhdGE7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBGRUFUVVJFX0lELlVURjhfU1VQUE9SVDpcbiAgICAgICAgdXRmOFN1cHBvcnQgPSAhIWZlYXR1cmVEYXRhWzBdO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgZmVhdHVyZUV4dEFja1BhcnNlcjtcbm1vZHVsZS5leHBvcnRzID0gZmVhdHVyZUV4dEFja1BhcnNlcjtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBQUEsUUFBQSxHQUFBQyxPQUFBO0FBR0EsSUFBQUMsTUFBQSxHQUFBRCxPQUFBO0FBRUEsTUFBTUUsVUFBVSxHQUFHO0VBQ2pCQyxlQUFlLEVBQUUsSUFBSTtFQUNyQkMsT0FBTyxFQUFFLElBQUk7RUFDYkMsZ0JBQWdCLEVBQUUsSUFBSTtFQUN0QkMsa0JBQWtCLEVBQUUsSUFBSTtFQUN4QkMsZUFBZSxFQUFFLElBQUk7RUFDckJDLFlBQVksRUFBRSxJQUFJO0VBQ2xCQyxVQUFVLEVBQUU7QUFDZCxDQUFDO0FBRUQsU0FBU0MsbUJBQW1CQSxDQUFDQyxHQUFXLEVBQUVDLE1BQWMsRUFBRUMsUUFBdUIsRUFBOEI7RUFDN0csSUFBSUMsT0FBMkI7RUFDL0IsSUFBSUMsV0FBZ0M7RUFFcEMsT0FBTyxJQUFJLEVBQUU7SUFDWCxJQUFJQyxTQUFTO0lBQ2IsQ0FBQztNQUFFQyxLQUFLLEVBQUVELFNBQVM7TUFBRUo7SUFBTyxDQUFDLEdBQUcsSUFBQU0sa0JBQVMsRUFBQ1AsR0FBRyxFQUFFQyxNQUFNLENBQUM7SUFFdEQsSUFBSUksU0FBUyxLQUFLZCxVQUFVLENBQUNPLFVBQVUsRUFBRTtNQUN2QyxPQUFPLElBQUlVLGVBQU0sQ0FBQyxJQUFJQyx5QkFBa0IsQ0FBQ04sT0FBTyxFQUFFQyxXQUFXLENBQUMsRUFBRUgsTUFBTSxDQUFDO0lBQ3pFO0lBRUEsSUFBSVMsaUJBQWlCO0lBQ3JCLENBQUM7TUFBRUosS0FBSyxFQUFFSSxpQkFBaUI7TUFBRVQ7SUFBTyxDQUFDLEdBQUcsSUFBQVUscUJBQVksRUFBQ1gsR0FBRyxFQUFFQyxNQUFNLENBQUM7SUFFakUsSUFBSUQsR0FBRyxDQUFDWSxNQUFNLEdBQUdYLE1BQU0sR0FBR1MsaUJBQWlCLEVBQUU7TUFDM0MsTUFBTSxJQUFJRywyQkFBa0IsQ0FBQ1osTUFBTSxHQUFHUyxpQkFBaUIsQ0FBQztJQUMxRDtJQUVBLE1BQU1JLFdBQVcsR0FBR2QsR0FBRyxDQUFDZSxLQUFLLENBQUNkLE1BQU0sRUFBRUEsTUFBTSxHQUFHUyxpQkFBaUIsQ0FBQztJQUNqRVQsTUFBTSxJQUFJUyxpQkFBaUI7SUFFM0IsUUFBUUwsU0FBUztNQUNmLEtBQUtkLFVBQVUsQ0FBQ0UsT0FBTztRQUNyQlUsT0FBTyxHQUFHVyxXQUFXO1FBQ3JCO01BQ0YsS0FBS3ZCLFVBQVUsQ0FBQ00sWUFBWTtRQUMxQk8sV0FBVyxHQUFHLENBQUMsQ0FBQ1UsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUM5QjtJQUNKO0VBQ0Y7QUFDRjtBQUFDLElBQUFFLFFBQUEsR0FBQUMsT0FBQSxDQUFBQyxPQUFBLEdBRWNuQixtQkFBbUI7QUFDbENvQixNQUFNLENBQUNGLE9BQU8sR0FBR2xCLG1CQUFtQiJ9