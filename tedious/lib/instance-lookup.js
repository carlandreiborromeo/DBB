"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.instanceLookup = instanceLookup;
exports.parseBrowserResponse = parseBrowserResponse;
var _dns = _interopRequireDefault(require("dns"));
var _abortError = _interopRequireDefault(require("./errors/abort-error"));
var _sender = require("./sender");
var _withTimeout = require("./utils/with-timeout");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const SQL_SERVER_BROWSER_PORT = 1434;
const TIMEOUT = 2 * 1000;
const RETRIES = 3;
// There are three bytes at the start of the response, whose purpose is unknown.
const MYSTERY_HEADER_LENGTH = 3;
// Most of the functionality has been determined from from jTDS's MSSqlServerInfo class.
async function instanceLookup(options) {
  const server = options.server;
  if (typeof server !== 'string') {
    throw new TypeError('Invalid arguments: "server" must be a string');
  }
  const instanceName = options.instanceName;
  if (typeof instanceName !== 'string') {
    throw new TypeError('Invalid arguments: "instanceName" must be a string');
  }
  const timeout = options.timeout === undefined ? TIMEOUT : options.timeout;
  if (typeof timeout !== 'number') {
    throw new TypeError('Invalid arguments: "timeout" must be a number');
  }
  const retries = options.retries === undefined ? RETRIES : options.retries;
  if (typeof retries !== 'number') {
    throw new TypeError('Invalid arguments: "retries" must be a number');
  }
  if (options.lookup !== undefined && typeof options.lookup !== 'function') {
    throw new TypeError('Invalid arguments: "lookup" must be a function');
  }
  const lookup = options.lookup ?? _dns.default.lookup;
  if (options.port !== undefined && typeof options.port !== 'number') {
    throw new TypeError('Invalid arguments: "port" must be a number');
  }
  const port = options.port ?? SQL_SERVER_BROWSER_PORT;
  const signal = options.signal;
  if (signal.aborted) {
    throw new _abortError.default();
  }
  let response;
  for (let i = 0; i <= retries; i++) {
    try {
      response = await (0, _withTimeout.withTimeout)(timeout, async signal => {
        const request = Buffer.from([0x02]);
        return await (0, _sender.sendMessage)(options.server, port, lookup, signal, request);
      }, signal);
    } catch (err) {
      // If the current attempt timed out, continue with the next
      if (!signal.aborted && err instanceof Error && err.name === 'TimeoutError') {
        continue;
      }
      throw err;
    }
  }
  if (!response) {
    throw new Error('Failed to get response from SQL Server Browser on ' + server);
  }
  const message = response.toString('ascii', MYSTERY_HEADER_LENGTH);
  const foundPort = parseBrowserResponse(message, instanceName);
  if (!foundPort) {
    throw new Error('Port for ' + instanceName + ' not found in ' + options.server);
  }
  return foundPort;
}
function parseBrowserResponse(response, instanceName) {
  let getPort;
  const instances = response.split(';;');
  for (let i = 0, len = instances.length; i < len; i++) {
    const instance = instances[i];
    const parts = instance.split(';');
    for (let p = 0, partsLen = parts.length; p < partsLen; p += 2) {
      const name = parts[p];
      const value = parts[p + 1];
      if (name === 'tcp' && getPort) {
        const port = parseInt(value, 10);
        return port;
      }
      if (name === 'InstanceName') {
        if (value.toUpperCase() === instanceName.toUpperCase()) {
          getPort = true;
        } else {
          getPort = false;
        }
      }
    }
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfZG5zIiwiX2ludGVyb3BSZXF1aXJlRGVmYXVsdCIsInJlcXVpcmUiLCJfYWJvcnRFcnJvciIsIl9zZW5kZXIiLCJfd2l0aFRpbWVvdXQiLCJvYmoiLCJfX2VzTW9kdWxlIiwiZGVmYXVsdCIsIlNRTF9TRVJWRVJfQlJPV1NFUl9QT1JUIiwiVElNRU9VVCIsIlJFVFJJRVMiLCJNWVNURVJZX0hFQURFUl9MRU5HVEgiLCJpbnN0YW5jZUxvb2t1cCIsIm9wdGlvbnMiLCJzZXJ2ZXIiLCJUeXBlRXJyb3IiLCJpbnN0YW5jZU5hbWUiLCJ0aW1lb3V0IiwidW5kZWZpbmVkIiwicmV0cmllcyIsImxvb2t1cCIsImRucyIsInBvcnQiLCJzaWduYWwiLCJhYm9ydGVkIiwiQWJvcnRFcnJvciIsInJlc3BvbnNlIiwiaSIsIndpdGhUaW1lb3V0IiwicmVxdWVzdCIsIkJ1ZmZlciIsImZyb20iLCJzZW5kTWVzc2FnZSIsImVyciIsIkVycm9yIiwibmFtZSIsIm1lc3NhZ2UiLCJ0b1N0cmluZyIsImZvdW5kUG9ydCIsInBhcnNlQnJvd3NlclJlc3BvbnNlIiwiZ2V0UG9ydCIsImluc3RhbmNlcyIsInNwbGl0IiwibGVuIiwibGVuZ3RoIiwiaW5zdGFuY2UiLCJwYXJ0cyIsInAiLCJwYXJ0c0xlbiIsInZhbHVlIiwicGFyc2VJbnQiLCJ0b1VwcGVyQ2FzZSJdLCJzb3VyY2VzIjpbIi4uL3NyYy9pbnN0YW5jZS1sb29rdXAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGRucyBmcm9tICdkbnMnO1xuXG5pbXBvcnQgQWJvcnRFcnJvciBmcm9tICcuL2Vycm9ycy9hYm9ydC1lcnJvcic7XG5pbXBvcnQgeyBzZW5kTWVzc2FnZSB9IGZyb20gJy4vc2VuZGVyJztcbmltcG9ydCB7IHdpdGhUaW1lb3V0IH0gZnJvbSAnLi91dGlscy93aXRoLXRpbWVvdXQnO1xuXG5jb25zdCBTUUxfU0VSVkVSX0JST1dTRVJfUE9SVCA9IDE0MzQ7XG5jb25zdCBUSU1FT1VUID0gMiAqIDEwMDA7XG5jb25zdCBSRVRSSUVTID0gMztcbi8vIFRoZXJlIGFyZSB0aHJlZSBieXRlcyBhdCB0aGUgc3RhcnQgb2YgdGhlIHJlc3BvbnNlLCB3aG9zZSBwdXJwb3NlIGlzIHVua25vd24uXG5jb25zdCBNWVNURVJZX0hFQURFUl9MRU5HVEggPSAzO1xuXG50eXBlIExvb2t1cEZ1bmN0aW9uID0gKGhvc3RuYW1lOiBzdHJpbmcsIG9wdGlvbnM6IGRucy5Mb29rdXBBbGxPcHRpb25zLCBjYWxsYmFjazogKGVycjogTm9kZUpTLkVycm5vRXhjZXB0aW9uIHwgbnVsbCwgYWRkcmVzc2VzOiBkbnMuTG9va3VwQWRkcmVzc1tdKSA9PiB2b2lkKSA9PiB2b2lkO1xuXG4vLyBNb3N0IG9mIHRoZSBmdW5jdGlvbmFsaXR5IGhhcyBiZWVuIGRldGVybWluZWQgZnJvbSBmcm9tIGpURFMncyBNU1NxbFNlcnZlckluZm8gY2xhc3MuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5zdGFuY2VMb29rdXAob3B0aW9uczogeyBzZXJ2ZXI6IHN0cmluZywgaW5zdGFuY2VOYW1lOiBzdHJpbmcsIHRpbWVvdXQ/OiBudW1iZXIsIHJldHJpZXM/OiBudW1iZXIsIHBvcnQ/OiBudW1iZXIsIGxvb2t1cD86IExvb2t1cEZ1bmN0aW9uLCBzaWduYWw6IEFib3J0U2lnbmFsIH0pIHtcbiAgY29uc3Qgc2VydmVyID0gb3B0aW9ucy5zZXJ2ZXI7XG4gIGlmICh0eXBlb2Ygc2VydmVyICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgYXJndW1lbnRzOiBcInNlcnZlclwiIG11c3QgYmUgYSBzdHJpbmcnKTtcbiAgfVxuXG4gIGNvbnN0IGluc3RhbmNlTmFtZSA9IG9wdGlvbnMuaW5zdGFuY2VOYW1lO1xuICBpZiAodHlwZW9mIGluc3RhbmNlTmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGFyZ3VtZW50czogXCJpbnN0YW5jZU5hbWVcIiBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gIH1cblxuICBjb25zdCB0aW1lb3V0ID0gb3B0aW9ucy50aW1lb3V0ID09PSB1bmRlZmluZWQgPyBUSU1FT1VUIDogb3B0aW9ucy50aW1lb3V0O1xuICBpZiAodHlwZW9mIHRpbWVvdXQgIT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBhcmd1bWVudHM6IFwidGltZW91dFwiIG11c3QgYmUgYSBudW1iZXInKTtcbiAgfVxuXG4gIGNvbnN0IHJldHJpZXMgPSBvcHRpb25zLnJldHJpZXMgPT09IHVuZGVmaW5lZCA/IFJFVFJJRVMgOiBvcHRpb25zLnJldHJpZXM7XG4gIGlmICh0eXBlb2YgcmV0cmllcyAhPT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGFyZ3VtZW50czogXCJyZXRyaWVzXCIgbXVzdCBiZSBhIG51bWJlcicpO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMubG9va3VwICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIG9wdGlvbnMubG9va3VwICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBhcmd1bWVudHM6IFwibG9va3VwXCIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gIH1cbiAgY29uc3QgbG9va3VwID0gb3B0aW9ucy5sb29rdXAgPz8gZG5zLmxvb2t1cDtcblxuICBpZiAob3B0aW9ucy5wb3J0ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIG9wdGlvbnMucG9ydCAhPT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGFyZ3VtZW50czogXCJwb3J0XCIgbXVzdCBiZSBhIG51bWJlcicpO1xuICB9XG4gIGNvbnN0IHBvcnQgPSBvcHRpb25zLnBvcnQgPz8gU1FMX1NFUlZFUl9CUk9XU0VSX1BPUlQ7XG5cbiAgY29uc3Qgc2lnbmFsID0gb3B0aW9ucy5zaWduYWw7XG5cbiAgaWYgKHNpZ25hbC5hYm9ydGVkKSB7XG4gICAgdGhyb3cgbmV3IEFib3J0RXJyb3IoKTtcbiAgfVxuXG4gIGxldCByZXNwb25zZTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8PSByZXRyaWVzOyBpKyspIHtcbiAgICB0cnkge1xuICAgICAgcmVzcG9uc2UgPSBhd2FpdCB3aXRoVGltZW91dCh0aW1lb3V0LCBhc3luYyAoc2lnbmFsKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSBCdWZmZXIuZnJvbShbMHgwMl0pO1xuICAgICAgICByZXR1cm4gYXdhaXQgc2VuZE1lc3NhZ2Uob3B0aW9ucy5zZXJ2ZXIsIHBvcnQsIGxvb2t1cCwgc2lnbmFsLCByZXF1ZXN0KTtcbiAgICAgIH0sIHNpZ25hbCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAvLyBJZiB0aGUgY3VycmVudCBhdHRlbXB0IHRpbWVkIG91dCwgY29udGludWUgd2l0aCB0aGUgbmV4dFxuICAgICAgaWYgKCFzaWduYWwuYWJvcnRlZCAmJiBlcnIgaW5zdGFuY2VvZiBFcnJvciAmJiBlcnIubmFtZSA9PT0gJ1RpbWVvdXRFcnJvcicpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gIH1cblxuICBpZiAoIXJlc3BvbnNlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gZ2V0IHJlc3BvbnNlIGZyb20gU1FMIFNlcnZlciBCcm93c2VyIG9uICcgKyBzZXJ2ZXIpO1xuICB9XG5cbiAgY29uc3QgbWVzc2FnZSA9IHJlc3BvbnNlLnRvU3RyaW5nKCdhc2NpaScsIE1ZU1RFUllfSEVBREVSX0xFTkdUSCk7XG4gIGNvbnN0IGZvdW5kUG9ydCA9IHBhcnNlQnJvd3NlclJlc3BvbnNlKG1lc3NhZ2UsIGluc3RhbmNlTmFtZSk7XG5cbiAgaWYgKCFmb3VuZFBvcnQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1BvcnQgZm9yICcgKyBpbnN0YW5jZU5hbWUgKyAnIG5vdCBmb3VuZCBpbiAnICsgb3B0aW9ucy5zZXJ2ZXIpO1xuICB9XG5cbiAgcmV0dXJuIGZvdW5kUG9ydDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQnJvd3NlclJlc3BvbnNlKHJlc3BvbnNlOiBzdHJpbmcsIGluc3RhbmNlTmFtZTogc3RyaW5nKSB7XG4gIGxldCBnZXRQb3J0O1xuXG4gIGNvbnN0IGluc3RhbmNlcyA9IHJlc3BvbnNlLnNwbGl0KCc7OycpO1xuICBmb3IgKGxldCBpID0gMCwgbGVuID0gaW5zdGFuY2VzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgY29uc3QgaW5zdGFuY2UgPSBpbnN0YW5jZXNbaV07XG4gICAgY29uc3QgcGFydHMgPSBpbnN0YW5jZS5zcGxpdCgnOycpO1xuXG4gICAgZm9yIChsZXQgcCA9IDAsIHBhcnRzTGVuID0gcGFydHMubGVuZ3RoOyBwIDwgcGFydHNMZW47IHAgKz0gMikge1xuICAgICAgY29uc3QgbmFtZSA9IHBhcnRzW3BdO1xuICAgICAgY29uc3QgdmFsdWUgPSBwYXJ0c1twICsgMV07XG5cbiAgICAgIGlmIChuYW1lID09PSAndGNwJyAmJiBnZXRQb3J0KSB7XG4gICAgICAgIGNvbnN0IHBvcnQgPSBwYXJzZUludCh2YWx1ZSwgMTApO1xuICAgICAgICByZXR1cm4gcG9ydDtcbiAgICAgIH1cblxuICAgICAgaWYgKG5hbWUgPT09ICdJbnN0YW5jZU5hbWUnKSB7XG4gICAgICAgIGlmICh2YWx1ZS50b1VwcGVyQ2FzZSgpID09PSBpbnN0YW5jZU5hbWUudG9VcHBlckNhc2UoKSkge1xuICAgICAgICAgIGdldFBvcnQgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGdldFBvcnQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUEsSUFBQUEsSUFBQSxHQUFBQyxzQkFBQSxDQUFBQyxPQUFBO0FBRUEsSUFBQUMsV0FBQSxHQUFBRixzQkFBQSxDQUFBQyxPQUFBO0FBQ0EsSUFBQUUsT0FBQSxHQUFBRixPQUFBO0FBQ0EsSUFBQUcsWUFBQSxHQUFBSCxPQUFBO0FBQW1ELFNBQUFELHVCQUFBSyxHQUFBLFdBQUFBLEdBQUEsSUFBQUEsR0FBQSxDQUFBQyxVQUFBLEdBQUFELEdBQUEsS0FBQUUsT0FBQSxFQUFBRixHQUFBO0FBRW5ELE1BQU1HLHVCQUF1QixHQUFHLElBQUk7QUFDcEMsTUFBTUMsT0FBTyxHQUFHLENBQUMsR0FBRyxJQUFJO0FBQ3hCLE1BQU1DLE9BQU8sR0FBRyxDQUFDO0FBQ2pCO0FBQ0EsTUFBTUMscUJBQXFCLEdBQUcsQ0FBQztBQUkvQjtBQUNPLGVBQWVDLGNBQWNBLENBQUNDLE9BQWtKLEVBQUU7RUFDdkwsTUFBTUMsTUFBTSxHQUFHRCxPQUFPLENBQUNDLE1BQU07RUFDN0IsSUFBSSxPQUFPQSxNQUFNLEtBQUssUUFBUSxFQUFFO0lBQzlCLE1BQU0sSUFBSUMsU0FBUyxDQUFDLDhDQUE4QyxDQUFDO0VBQ3JFO0VBRUEsTUFBTUMsWUFBWSxHQUFHSCxPQUFPLENBQUNHLFlBQVk7RUFDekMsSUFBSSxPQUFPQSxZQUFZLEtBQUssUUFBUSxFQUFFO0lBQ3BDLE1BQU0sSUFBSUQsU0FBUyxDQUFDLG9EQUFvRCxDQUFDO0VBQzNFO0VBRUEsTUFBTUUsT0FBTyxHQUFHSixPQUFPLENBQUNJLE9BQU8sS0FBS0MsU0FBUyxHQUFHVCxPQUFPLEdBQUdJLE9BQU8sQ0FBQ0ksT0FBTztFQUN6RSxJQUFJLE9BQU9BLE9BQU8sS0FBSyxRQUFRLEVBQUU7SUFDL0IsTUFBTSxJQUFJRixTQUFTLENBQUMsK0NBQStDLENBQUM7RUFDdEU7RUFFQSxNQUFNSSxPQUFPLEdBQUdOLE9BQU8sQ0FBQ00sT0FBTyxLQUFLRCxTQUFTLEdBQUdSLE9BQU8sR0FBR0csT0FBTyxDQUFDTSxPQUFPO0VBQ3pFLElBQUksT0FBT0EsT0FBTyxLQUFLLFFBQVEsRUFBRTtJQUMvQixNQUFNLElBQUlKLFNBQVMsQ0FBQywrQ0FBK0MsQ0FBQztFQUN0RTtFQUVBLElBQUlGLE9BQU8sQ0FBQ08sTUFBTSxLQUFLRixTQUFTLElBQUksT0FBT0wsT0FBTyxDQUFDTyxNQUFNLEtBQUssVUFBVSxFQUFFO0lBQ3hFLE1BQU0sSUFBSUwsU0FBUyxDQUFDLGdEQUFnRCxDQUFDO0VBQ3ZFO0VBQ0EsTUFBTUssTUFBTSxHQUFHUCxPQUFPLENBQUNPLE1BQU0sSUFBSUMsWUFBRyxDQUFDRCxNQUFNO0VBRTNDLElBQUlQLE9BQU8sQ0FBQ1MsSUFBSSxLQUFLSixTQUFTLElBQUksT0FBT0wsT0FBTyxDQUFDUyxJQUFJLEtBQUssUUFBUSxFQUFFO0lBQ2xFLE1BQU0sSUFBSVAsU0FBUyxDQUFDLDRDQUE0QyxDQUFDO0VBQ25FO0VBQ0EsTUFBTU8sSUFBSSxHQUFHVCxPQUFPLENBQUNTLElBQUksSUFBSWQsdUJBQXVCO0VBRXBELE1BQU1lLE1BQU0sR0FBR1YsT0FBTyxDQUFDVSxNQUFNO0VBRTdCLElBQUlBLE1BQU0sQ0FBQ0MsT0FBTyxFQUFFO0lBQ2xCLE1BQU0sSUFBSUMsbUJBQVUsQ0FBQyxDQUFDO0VBQ3hCO0VBRUEsSUFBSUMsUUFBUTtFQUVaLEtBQUssSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxJQUFJUixPQUFPLEVBQUVRLENBQUMsRUFBRSxFQUFFO0lBQ2pDLElBQUk7TUFDRkQsUUFBUSxHQUFHLE1BQU0sSUFBQUUsd0JBQVcsRUFBQ1gsT0FBTyxFQUFFLE1BQU9NLE1BQU0sSUFBSztRQUN0RCxNQUFNTSxPQUFPLEdBQUdDLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkMsT0FBTyxNQUFNLElBQUFDLG1CQUFXLEVBQUNuQixPQUFPLENBQUNDLE1BQU0sRUFBRVEsSUFBSSxFQUFFRixNQUFNLEVBQUVHLE1BQU0sRUFBRU0sT0FBTyxDQUFDO01BQ3pFLENBQUMsRUFBRU4sTUFBTSxDQUFDO0lBQ1osQ0FBQyxDQUFDLE9BQU9VLEdBQUcsRUFBRTtNQUNaO01BQ0EsSUFBSSxDQUFDVixNQUFNLENBQUNDLE9BQU8sSUFBSVMsR0FBRyxZQUFZQyxLQUFLLElBQUlELEdBQUcsQ0FBQ0UsSUFBSSxLQUFLLGNBQWMsRUFBRTtRQUMxRTtNQUNGO01BRUEsTUFBTUYsR0FBRztJQUNYO0VBQ0Y7RUFFQSxJQUFJLENBQUNQLFFBQVEsRUFBRTtJQUNiLE1BQU0sSUFBSVEsS0FBSyxDQUFDLG9EQUFvRCxHQUFHcEIsTUFBTSxDQUFDO0VBQ2hGO0VBRUEsTUFBTXNCLE9BQU8sR0FBR1YsUUFBUSxDQUFDVyxRQUFRLENBQUMsT0FBTyxFQUFFMUIscUJBQXFCLENBQUM7RUFDakUsTUFBTTJCLFNBQVMsR0FBR0Msb0JBQW9CLENBQUNILE9BQU8sRUFBRXBCLFlBQVksQ0FBQztFQUU3RCxJQUFJLENBQUNzQixTQUFTLEVBQUU7SUFDZCxNQUFNLElBQUlKLEtBQUssQ0FBQyxXQUFXLEdBQUdsQixZQUFZLEdBQUcsZ0JBQWdCLEdBQUdILE9BQU8sQ0FBQ0MsTUFBTSxDQUFDO0VBQ2pGO0VBRUEsT0FBT3dCLFNBQVM7QUFDbEI7QUFFTyxTQUFTQyxvQkFBb0JBLENBQUNiLFFBQWdCLEVBQUVWLFlBQW9CLEVBQUU7RUFDM0UsSUFBSXdCLE9BQU87RUFFWCxNQUFNQyxTQUFTLEdBQUdmLFFBQVEsQ0FBQ2dCLEtBQUssQ0FBQyxJQUFJLENBQUM7RUFDdEMsS0FBSyxJQUFJZixDQUFDLEdBQUcsQ0FBQyxFQUFFZ0IsR0FBRyxHQUFHRixTQUFTLENBQUNHLE1BQU0sRUFBRWpCLENBQUMsR0FBR2dCLEdBQUcsRUFBRWhCLENBQUMsRUFBRSxFQUFFO0lBQ3BELE1BQU1rQixRQUFRLEdBQUdKLFNBQVMsQ0FBQ2QsQ0FBQyxDQUFDO0lBQzdCLE1BQU1tQixLQUFLLEdBQUdELFFBQVEsQ0FBQ0gsS0FBSyxDQUFDLEdBQUcsQ0FBQztJQUVqQyxLQUFLLElBQUlLLENBQUMsR0FBRyxDQUFDLEVBQUVDLFFBQVEsR0FBR0YsS0FBSyxDQUFDRixNQUFNLEVBQUVHLENBQUMsR0FBR0MsUUFBUSxFQUFFRCxDQUFDLElBQUksQ0FBQyxFQUFFO01BQzdELE1BQU1aLElBQUksR0FBR1csS0FBSyxDQUFDQyxDQUFDLENBQUM7TUFDckIsTUFBTUUsS0FBSyxHQUFHSCxLQUFLLENBQUNDLENBQUMsR0FBRyxDQUFDLENBQUM7TUFFMUIsSUFBSVosSUFBSSxLQUFLLEtBQUssSUFBSUssT0FBTyxFQUFFO1FBQzdCLE1BQU1sQixJQUFJLEdBQUc0QixRQUFRLENBQUNELEtBQUssRUFBRSxFQUFFLENBQUM7UUFDaEMsT0FBTzNCLElBQUk7TUFDYjtNQUVBLElBQUlhLElBQUksS0FBSyxjQUFjLEVBQUU7UUFDM0IsSUFBSWMsS0FBSyxDQUFDRSxXQUFXLENBQUMsQ0FBQyxLQUFLbkMsWUFBWSxDQUFDbUMsV0FBVyxDQUFDLENBQUMsRUFBRTtVQUN0RFgsT0FBTyxHQUFHLElBQUk7UUFDaEIsQ0FBQyxNQUFNO1VBQ0xBLE9BQU8sR0FBRyxLQUFLO1FBQ2pCO01BQ0Y7SUFDRjtFQUNGO0FBQ0YifQ==