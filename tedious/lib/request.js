"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _events = require("events");
var _errors = require("./errors");
var _types = require("./always-encrypted/types");
/**
 * The callback is called when the request has completed, either successfully or with an error.
 * If an error occurs during execution of the statement(s), then `err` will describe the error.
 *
 * As only one request at a time may be executed on a connection, another request should not
 * be initiated until this callback is called.
 *
 * This callback is called before `requestCompleted` is emitted.
 */

/**
 * ```js
 * const { Request } = require('tedious');
 * const request = new Request("select 42, 'hello world'", (err, rowCount) {
 *   // Request completion callback...
 * });
 * connection.execSql(request);
 * ```
 */
class Request extends _events.EventEmitter {
  /**
   * @private
   */

  /**
   * @private
   */

  /**
   * @private
   */

  /**
   * @private
   */

  /**
   * @private
   */

  /**
   * @private
   */

  /**
   * @private
   */

  /**
   * @private
   */

  /**
   * @private
   */

  /**
   * @private
   */

  /**
   * @private
   */

  /**
   * @private
   */

  /**
   * @private
   */

  /**
   * @private
   */

  /**
   * @private
   */

  /**
   * This event, describing result set columns, will be emitted before row
   * events are emitted. This event may be emitted multiple times when more
   * than one recordset is produced by the statement.
   *
   * An array like object, where the columns can be accessed either by index
   * or name. Columns with a name that is an integer are not accessible by name,
   * as it would be interpreted as an array index.
   */

  /**
   * The request has been prepared and can be used in subsequent calls to execute and unprepare.
   */

  /**
   * The request encountered an error and has not been prepared.
   */

  /**
   * A row resulting from execution of the SQL statement.
   */

  /**
   * All rows from a result set have been provided (through `row` events).
   *
   * This token is used to indicate the completion of a SQL statement.
   * As multiple SQL statements can be sent to the server in a single SQL batch, multiple `done` can be generated.
   * An `done` event is emitted for each SQL statement in the SQL batch except variable declarations.
   * For execution of SQL statements within stored procedures, `doneProc` and `doneInProc` events are used in place of `done`.
   *
   * If you are using [[Connection.execSql]] then SQL server may treat the multiple calls with the same query as a stored procedure.
   * When this occurs, the `doneProc` and `doneInProc` events may be emitted instead. You must handle both events to ensure complete coverage.
   */

  /**
   * `request.on('doneInProc', function (rowCount, more, rows) { });`
   *
   * Indicates the completion status of a SQL statement within a stored procedure. All rows from a statement
   * in a stored procedure have been provided (through `row` events).
   *
   * This event may also occur when executing multiple calls with the same query using [[execSql]].
   */

  /**
   * Indicates the completion status of a stored procedure. This is also generated for stored procedures
   * executed through SQL statements.\
   * This event may also occur when executing multiple calls with the same query using [[execSql]].
   */

  /**
   * A value for an output parameter (that was added to the request with [[addOutputParameter]]).
   * See also `Using Parameters`.
   */

  /**
   * This event gives the columns by which data is ordered, if `ORDER BY` clause is executed in SQL Server.
   */

  on(event, listener) {
    return super.on(event, listener);
  }

  /**
   * @private
   */

  /**
   * @private
   */

  /**
   * @private
   */

  /**
   * @private
   */

  /**
   * @private
   */

  /**
   * @private
   */

  /**
   * @private
   */

  /**
   * @private
   */

  /**
   * @private
   */

  /**
   * @private
   */

  /**
   * @private
   */

  /**
   * @private
   */

  /**
   * @private
   */

  emit(event, ...args) {
    return super.emit(event, ...args);
  }

  /**
   * @param sqlTextOrProcedure
   *   The SQL statement to be executed
   *
   * @param callback
   *   The callback to execute once the request has been fully completed.
   */
  constructor(sqlTextOrProcedure, callback, options) {
    super();
    this.sqlTextOrProcedure = sqlTextOrProcedure;
    this.parameters = [];
    this.parametersByName = {};
    this.preparing = false;
    this.handle = undefined;
    this.canceled = false;
    this.paused = false;
    this.error = undefined;
    this.connection = undefined;
    this.timeout = undefined;
    this.userCallback = callback;
    this.statementColumnEncryptionSetting = options && options.statementColumnEncryptionSetting || _types.SQLServerStatementColumnEncryptionSetting.UseConnectionSetting;
    this.cryptoMetadataLoaded = false;
    this.callback = function (err, rowCount, rows) {
      if (this.preparing) {
        this.preparing = false;
        if (err) {
          this.emit('error', err);
        } else {
          this.emit('prepared');
        }
      } else {
        this.userCallback(err, rowCount, rows);
        this.emit('requestCompleted');
      }
    };
  }

  /**
   * @param name
   *   The parameter name. This should correspond to a parameter in the SQL,
   *   or a parameter that a called procedure expects. The name should not start with `@`.
   *
   * @param type
   *   One of the supported data types.
   *
   * @param value
   *   The value that the parameter is to be given. The Javascript type of the
   *   argument should match that documented for data types.
   *
   * @param options
   *   Additional type options. Optional.
   */
  // TODO: `type` must be a valid TDS value type
  addParameter(name, type, value, options) {
    const {
      output = false,
      length,
      precision,
      scale
    } = options ?? {};
    const parameter = {
      type: type,
      name: name,
      value: value,
      output: output,
      length: length,
      precision: precision,
      scale: scale
    };
    this.parameters.push(parameter);
    this.parametersByName[name] = parameter;
  }

  /**
   * @param name
   *   The parameter name. This should correspond to a parameter in the SQL,
   *   or a parameter that a called procedure expects.
   *
   * @param type
   *   One of the supported data types.
   *
   * @param value
   *   The value that the parameter is to be given. The Javascript type of the
   *   argument should match that documented for data types
   *
   * @param options
   *   Additional type options. Optional.
   */
  addOutputParameter(name, type, value, options) {
    this.addParameter(name, type, value, {
      ...options,
      output: true
    });
  }

  /**
   * @private
   */
  makeParamsParameter(parameters) {
    let paramsParameter = '';
    for (let i = 0, len = parameters.length; i < len; i++) {
      const parameter = parameters[i];
      if (paramsParameter.length > 0) {
        paramsParameter += ', ';
      }
      paramsParameter += '@' + parameter.name + ' ';
      paramsParameter += parameter.type.declaration(parameter);
      if (parameter.output) {
        paramsParameter += ' OUTPUT';
      }
    }
    return paramsParameter;
  }

  /**
   * @private
   */
  validateParameters(collation) {
    for (let i = 0, len = this.parameters.length; i < len; i++) {
      const parameter = this.parameters[i];
      try {
        parameter.value = parameter.type.validate(parameter.value, collation);
      } catch (error) {
        throw new _errors.RequestError('Validation failed for parameter \'' + parameter.name + '\'. ' + error.message, 'EPARAM', {
          cause: error
        });
      }
    }
  }

  /**
   * Temporarily suspends the flow of data from the database. No more `row` events will be emitted until [[resume] is called.
   * If this request is already in a paused state, calling [[pause]] has no effect.
   */
  pause() {
    if (this.paused) {
      return;
    }
    this.emit('pause');
    this.paused = true;
  }

  /**
   * Resumes the flow of data from the database.
   * If this request is not in a paused state, calling [[resume]] has no effect.
   */
  resume() {
    if (!this.paused) {
      return;
    }
    this.paused = false;
    this.emit('resume');
  }

  /**
   * Cancels a request while waiting for a server response.
   */
  cancel() {
    if (this.canceled) {
      return;
    }
    this.canceled = true;
    this.emit('cancel');
  }

  /**
   * Sets a timeout for this request.
   *
   * @param timeout
   *   The number of milliseconds before the request is considered failed,
   *   or `0` for no timeout. When no timeout is set for the request,
   *   the [[ConnectionOptions.requestTimeout]] of the [[Connection]] is used.
   */
  setTimeout(timeout) {
    this.timeout = timeout;
  }
}
var _default = exports.default = Request;
module.exports = Request;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfZXZlbnRzIiwicmVxdWlyZSIsIl9lcnJvcnMiLCJfdHlwZXMiLCJSZXF1ZXN0IiwiRXZlbnRFbWl0dGVyIiwib24iLCJldmVudCIsImxpc3RlbmVyIiwiZW1pdCIsImFyZ3MiLCJjb25zdHJ1Y3RvciIsInNxbFRleHRPclByb2NlZHVyZSIsImNhbGxiYWNrIiwib3B0aW9ucyIsInBhcmFtZXRlcnMiLCJwYXJhbWV0ZXJzQnlOYW1lIiwicHJlcGFyaW5nIiwiaGFuZGxlIiwidW5kZWZpbmVkIiwiY2FuY2VsZWQiLCJwYXVzZWQiLCJlcnJvciIsImNvbm5lY3Rpb24iLCJ0aW1lb3V0IiwidXNlckNhbGxiYWNrIiwic3RhdGVtZW50Q29sdW1uRW5jcnlwdGlvblNldHRpbmciLCJTUUxTZXJ2ZXJTdGF0ZW1lbnRDb2x1bW5FbmNyeXB0aW9uU2V0dGluZyIsIlVzZUNvbm5lY3Rpb25TZXR0aW5nIiwiY3J5cHRvTWV0YWRhdGFMb2FkZWQiLCJlcnIiLCJyb3dDb3VudCIsInJvd3MiLCJhZGRQYXJhbWV0ZXIiLCJuYW1lIiwidHlwZSIsInZhbHVlIiwib3V0cHV0IiwibGVuZ3RoIiwicHJlY2lzaW9uIiwic2NhbGUiLCJwYXJhbWV0ZXIiLCJwdXNoIiwiYWRkT3V0cHV0UGFyYW1ldGVyIiwibWFrZVBhcmFtc1BhcmFtZXRlciIsInBhcmFtc1BhcmFtZXRlciIsImkiLCJsZW4iLCJkZWNsYXJhdGlvbiIsInZhbGlkYXRlUGFyYW1ldGVycyIsImNvbGxhdGlvbiIsInZhbGlkYXRlIiwiUmVxdWVzdEVycm9yIiwibWVzc2FnZSIsImNhdXNlIiwicGF1c2UiLCJyZXN1bWUiLCJjYW5jZWwiLCJzZXRUaW1lb3V0IiwiX2RlZmF1bHQiLCJleHBvcnRzIiwiZGVmYXVsdCIsIm1vZHVsZSJdLCJzb3VyY2VzIjpbIi4uL3NyYy9yZXF1ZXN0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgeyB0eXBlIFBhcmFtZXRlciwgdHlwZSBEYXRhVHlwZSB9IGZyb20gJy4vZGF0YS10eXBlJztcbmltcG9ydCB7IFJlcXVlc3RFcnJvciB9IGZyb20gJy4vZXJyb3JzJztcblxuaW1wb3J0IENvbm5lY3Rpb24gZnJvbSAnLi9jb25uZWN0aW9uJztcbmltcG9ydCB7IHR5cGUgTWV0YWRhdGEgfSBmcm9tICcuL21ldGFkYXRhLXBhcnNlcic7XG5pbXBvcnQgeyBTUUxTZXJ2ZXJTdGF0ZW1lbnRDb2x1bW5FbmNyeXB0aW9uU2V0dGluZyB9IGZyb20gJy4vYWx3YXlzLWVuY3J5cHRlZC90eXBlcyc7XG5pbXBvcnQgeyB0eXBlIENvbHVtbk1ldGFkYXRhIH0gZnJvbSAnLi90b2tlbi9jb2xtZXRhZGF0YS10b2tlbi1wYXJzZXInO1xuaW1wb3J0IHsgQ29sbGF0aW9uIH0gZnJvbSAnLi9jb2xsYXRpb24nO1xuXG4vKipcbiAqIFRoZSBjYWxsYmFjayBpcyBjYWxsZWQgd2hlbiB0aGUgcmVxdWVzdCBoYXMgY29tcGxldGVkLCBlaXRoZXIgc3VjY2Vzc2Z1bGx5IG9yIHdpdGggYW4gZXJyb3IuXG4gKiBJZiBhbiBlcnJvciBvY2N1cnMgZHVyaW5nIGV4ZWN1dGlvbiBvZiB0aGUgc3RhdGVtZW50KHMpLCB0aGVuIGBlcnJgIHdpbGwgZGVzY3JpYmUgdGhlIGVycm9yLlxuICpcbiAqIEFzIG9ubHkgb25lIHJlcXVlc3QgYXQgYSB0aW1lIG1heSBiZSBleGVjdXRlZCBvbiBhIGNvbm5lY3Rpb24sIGFub3RoZXIgcmVxdWVzdCBzaG91bGQgbm90XG4gKiBiZSBpbml0aWF0ZWQgdW50aWwgdGhpcyBjYWxsYmFjayBpcyBjYWxsZWQuXG4gKlxuICogVGhpcyBjYWxsYmFjayBpcyBjYWxsZWQgYmVmb3JlIGByZXF1ZXN0Q29tcGxldGVkYCBpcyBlbWl0dGVkLlxuICovXG50eXBlIENvbXBsZXRpb25DYWxsYmFjayA9XG4gIC8qKlxuICAgKiBAcGFyYW0gZXJyb3JcbiAgICogICBJZiBhbiBlcnJvciBvY2N1cnJlZCwgYW4gZXJyb3Igb2JqZWN0LlxuICAgKlxuICAgKiBAcGFyYW0gcm93Q291bnRcbiAgICogICBUaGUgbnVtYmVyIG9mIHJvd3MgZW1pdHRlZCBhcyByZXN1bHQgb2YgZXhlY3V0aW5nIHRoZSBTUUwgc3RhdGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0gcm93c1xuICAgKiAgIFJvd3MgYXMgYSByZXN1bHQgb2YgZXhlY3V0aW5nIHRoZSBTUUwgc3RhdGVtZW50LlxuICAgKiAgIFdpbGwgb25seSBiZSBhdmFpbGFibGUgaWYgW1tDb25uZWN0aW9uT3B0aW9ucy5yb3dDb2xsZWN0aW9uT25SZXF1ZXN0Q29tcGxldGlvbl1dIGlzIGB0cnVlYC5cbiAgICovXG4gIC8vIFRPRE86IEZpZ3VyZSBvdXQgaG93IHRvIHR5cGUgdGhlIGByb3dzYCBwYXJhbWV0ZXIgaGVyZS5cbiAgKGVycm9yOiBFcnJvciB8IG51bGwgfCB1bmRlZmluZWQsIHJvd0NvdW50PzogbnVtYmVyLCByb3dzPzogYW55KSA9PiB2b2lkO1xuXG5leHBvcnQgaW50ZXJmYWNlIFBhcmFtZXRlck9wdGlvbnMge1xuICBvdXRwdXQ/OiBib29sZWFuO1xuICBsZW5ndGg/OiBudW1iZXI7XG4gIHByZWNpc2lvbj86IG51bWJlcjtcbiAgc2NhbGU/OiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBSZXF1ZXN0T3B0aW9ucyB7XG4gIHN0YXRlbWVudENvbHVtbkVuY3J5cHRpb25TZXR0aW5nPzogU1FMU2VydmVyU3RhdGVtZW50Q29sdW1uRW5jcnlwdGlvblNldHRpbmc7XG59XG5cbi8qKlxuICogYGBganNcbiAqIGNvbnN0IHsgUmVxdWVzdCB9ID0gcmVxdWlyZSgndGVkaW91cycpO1xuICogY29uc3QgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KFwic2VsZWN0IDQyLCAnaGVsbG8gd29ybGQnXCIsIChlcnIsIHJvd0NvdW50KSB7XG4gKiAgIC8vIFJlcXVlc3QgY29tcGxldGlvbiBjYWxsYmFjay4uLlxuICogfSk7XG4gKiBjb25uZWN0aW9uLmV4ZWNTcWwocmVxdWVzdCk7XG4gKiBgYGBcbiAqL1xuY2xhc3MgUmVxdWVzdCBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZGVjbGFyZSBzcWxUZXh0T3JQcm9jZWR1cmU6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBkZWNsYXJlIHBhcmFtZXRlcnM6IFBhcmFtZXRlcltdO1xuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGRlY2xhcmUgcGFyYW1ldGVyc0J5TmFtZTogeyBba2V5OiBzdHJpbmddOiBQYXJhbWV0ZXIgfTtcbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBkZWNsYXJlIHByZXBhcmluZzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBkZWNsYXJlIGNhbmNlbGVkOiBib29sZWFuO1xuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGRlY2xhcmUgcGF1c2VkOiBib29sZWFuO1xuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGRlY2xhcmUgdXNlckNhbGxiYWNrOiBDb21wbGV0aW9uQ2FsbGJhY2s7XG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZGVjbGFyZSBoYW5kbGU6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBkZWNsYXJlIGVycm9yOiBFcnJvciB8IHVuZGVmaW5lZDtcbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBkZWNsYXJlIGNvbm5lY3Rpb246IENvbm5lY3Rpb24gfCB1bmRlZmluZWQ7XG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZGVjbGFyZSB0aW1lb3V0OiBudW1iZXIgfCB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBkZWNsYXJlIHJvd3M/OiBBcnJheTxhbnk+O1xuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGRlY2xhcmUgcnN0PzogQXJyYXk8YW55PjtcbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBkZWNsYXJlIHJvd0NvdW50PzogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZGVjbGFyZSBjYWxsYmFjazogQ29tcGxldGlvbkNhbGxiYWNrO1xuXG5cbiAgZGVjbGFyZSBzaG91bGRIb25vckFFPzogYm9vbGVhbjtcbiAgZGVjbGFyZSBzdGF0ZW1lbnRDb2x1bW5FbmNyeXB0aW9uU2V0dGluZzogU1FMU2VydmVyU3RhdGVtZW50Q29sdW1uRW5jcnlwdGlvblNldHRpbmc7XG4gIGRlY2xhcmUgY3J5cHRvTWV0YWRhdGFMb2FkZWQ6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFRoaXMgZXZlbnQsIGRlc2NyaWJpbmcgcmVzdWx0IHNldCBjb2x1bW5zLCB3aWxsIGJlIGVtaXR0ZWQgYmVmb3JlIHJvd1xuICAgKiBldmVudHMgYXJlIGVtaXR0ZWQuIFRoaXMgZXZlbnQgbWF5IGJlIGVtaXR0ZWQgbXVsdGlwbGUgdGltZXMgd2hlbiBtb3JlXG4gICAqIHRoYW4gb25lIHJlY29yZHNldCBpcyBwcm9kdWNlZCBieSB0aGUgc3RhdGVtZW50LlxuICAgKlxuICAgKiBBbiBhcnJheSBsaWtlIG9iamVjdCwgd2hlcmUgdGhlIGNvbHVtbnMgY2FuIGJlIGFjY2Vzc2VkIGVpdGhlciBieSBpbmRleFxuICAgKiBvciBuYW1lLiBDb2x1bW5zIHdpdGggYSBuYW1lIHRoYXQgaXMgYW4gaW50ZWdlciBhcmUgbm90IGFjY2Vzc2libGUgYnkgbmFtZSxcbiAgICogYXMgaXQgd291bGQgYmUgaW50ZXJwcmV0ZWQgYXMgYW4gYXJyYXkgaW5kZXguXG4gICAqL1xuICBvbihcbiAgICBldmVudDogJ2NvbHVtbk1ldGFkYXRhJyxcbiAgICBsaXN0ZW5lcjpcbiAgICAoY29sdW1uczogQ29sdW1uTWV0YWRhdGFbXSB8IHsgW2tleTogc3RyaW5nXTogQ29sdW1uTWV0YWRhdGEgfSkgPT4gdm9pZFxuICApOiB0aGlzXG5cbiAgLyoqXG4gICAqIFRoZSByZXF1ZXN0IGhhcyBiZWVuIHByZXBhcmVkIGFuZCBjYW4gYmUgdXNlZCBpbiBzdWJzZXF1ZW50IGNhbGxzIHRvIGV4ZWN1dGUgYW5kIHVucHJlcGFyZS5cbiAgICovXG4gIG9uKGV2ZW50OiAncHJlcGFyZWQnLCBsaXN0ZW5lcjogKCkgPT4gdm9pZCk6IHRoaXNcblxuICAvKipcbiAgICogVGhlIHJlcXVlc3QgZW5jb3VudGVyZWQgYW4gZXJyb3IgYW5kIGhhcyBub3QgYmVlbiBwcmVwYXJlZC5cbiAgICovXG4gIG9uKGV2ZW50OiAnZXJyb3InLCBsaXN0ZW5lcjogKGVycjogRXJyb3IpID0+IHZvaWQpOiB0aGlzXG5cbiAgLyoqXG4gICAqIEEgcm93IHJlc3VsdGluZyBmcm9tIGV4ZWN1dGlvbiBvZiB0aGUgU1FMIHN0YXRlbWVudC5cbiAgICovXG4gIG9uKFxuICAgIGV2ZW50OiAncm93JyxcbiAgICBsaXN0ZW5lcjpcbiAgICAgIC8qKlxuICAgICAgICogQW4gYXJyYXkgb3Igb2JqZWN0IChkZXBlbmRzIG9uIFtbQ29ubmVjdGlvbk9wdGlvbnMudXNlQ29sdW1uTmFtZXNdXSksIHdoZXJlIHRoZSBjb2x1bW5zIGNhbiBiZSBhY2Nlc3NlZCBieSBpbmRleC9uYW1lLlxuICAgICAgICogRWFjaCBjb2x1bW4gaGFzIHR3byBwcm9wZXJ0aWVzLCBgbWV0YWRhdGFgIGFuZCBgdmFsdWVg77yaXG4gICAgICAgKlxuICAgICAgICogKiBgbWV0YWRhdGFgXG4gICAgICAgKlxuICAgICAgICogICAgVGhlIHNhbWUgZGF0YSB0aGF0IGlzIGV4cG9zZWQgaW4gdGhlIGBjb2x1bW5NZXRhZGF0YWAgZXZlbnQuXG4gICAgICAgKlxuICAgICAgICogKiBgdmFsdWVgXG4gICAgICAgKlxuICAgICAgICogICAgVGhlIGNvbHVtbidzIHZhbHVlLiBJdCB3aWxsIGJlIGBudWxsYCBmb3IgYSBgTlVMTGAuXG4gICAgICAgKiAgICBJZiB0aGVyZSBhcmUgbXVsdGlwbGUgY29sdW1ucyB3aXRoIHRoZSBzYW1lIG5hbWUsIHRoZW4gdGhpcyB3aWxsIGJlIGFuIGFycmF5IG9mIHRoZSB2YWx1ZXMuXG4gICAgICAgKi9cbiAgICAgIChjb2x1bW5zOiBhbnkpID0+IHZvaWRcbiAgKTogdGhpc1xuXG4gIC8qKlxuICAgKiBBbGwgcm93cyBmcm9tIGEgcmVzdWx0IHNldCBoYXZlIGJlZW4gcHJvdmlkZWQgKHRocm91Z2ggYHJvd2AgZXZlbnRzKS5cbiAgICpcbiAgICogVGhpcyB0b2tlbiBpcyB1c2VkIHRvIGluZGljYXRlIHRoZSBjb21wbGV0aW9uIG9mIGEgU1FMIHN0YXRlbWVudC5cbiAgICogQXMgbXVsdGlwbGUgU1FMIHN0YXRlbWVudHMgY2FuIGJlIHNlbnQgdG8gdGhlIHNlcnZlciBpbiBhIHNpbmdsZSBTUUwgYmF0Y2gsIG11bHRpcGxlIGBkb25lYCBjYW4gYmUgZ2VuZXJhdGVkLlxuICAgKiBBbiBgZG9uZWAgZXZlbnQgaXMgZW1pdHRlZCBmb3IgZWFjaCBTUUwgc3RhdGVtZW50IGluIHRoZSBTUUwgYmF0Y2ggZXhjZXB0IHZhcmlhYmxlIGRlY2xhcmF0aW9ucy5cbiAgICogRm9yIGV4ZWN1dGlvbiBvZiBTUUwgc3RhdGVtZW50cyB3aXRoaW4gc3RvcmVkIHByb2NlZHVyZXMsIGBkb25lUHJvY2AgYW5kIGBkb25lSW5Qcm9jYCBldmVudHMgYXJlIHVzZWQgaW4gcGxhY2Ugb2YgYGRvbmVgLlxuICAgKlxuICAgKiBJZiB5b3UgYXJlIHVzaW5nIFtbQ29ubmVjdGlvbi5leGVjU3FsXV0gdGhlbiBTUUwgc2VydmVyIG1heSB0cmVhdCB0aGUgbXVsdGlwbGUgY2FsbHMgd2l0aCB0aGUgc2FtZSBxdWVyeSBhcyBhIHN0b3JlZCBwcm9jZWR1cmUuXG4gICAqIFdoZW4gdGhpcyBvY2N1cnMsIHRoZSBgZG9uZVByb2NgIGFuZCBgZG9uZUluUHJvY2AgZXZlbnRzIG1heSBiZSBlbWl0dGVkIGluc3RlYWQuIFlvdSBtdXN0IGhhbmRsZSBib3RoIGV2ZW50cyB0byBlbnN1cmUgY29tcGxldGUgY292ZXJhZ2UuXG4gICAqL1xuICBvbihcbiAgICBldmVudDogJ2RvbmUnLFxuICAgIGxpc3RlbmVyOlxuICAgICAgLyoqXG4gICAgICAgKiBAcGFyYW0gcm93Q291bnRcbiAgICAgICAqICAgVGhlIG51bWJlciBvZiByZXN1bHQgcm93cy4gTWF5IGJlIGB1bmRlZmluZWRgIGlmIG5vdCBhdmFpbGFibGUuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIG1vcmVcbiAgICAgICAqICAgSWYgdGhlcmUgYXJlIG1vcmUgcmVzdWx0cyB0byBjb21lIChwcm9iYWJseSBiZWNhdXNlIG11bHRpcGxlIHN0YXRlbWVudHMgYXJlIGJlaW5nIGV4ZWN1dGVkKSwgdGhlbiBgdHJ1ZWAuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHJzdFxuICAgICAgICogICBSb3dzIGFzIGEgcmVzdWx0IG9mIGV4ZWN1dGluZyB0aGUgU1FMIHN0YXRlbWVudC5cbiAgICAgICAqICAgV2lsbCBvbmx5IGJlIGF2YWlsYWJsZSBpZiBDb25uZWN0aW9uJ3MgW1tDb25uZWN0aW9uT3B0aW9ucy5yb3dDb2xsZWN0aW9uT25Eb25lXV0gaXMgYHRydWVgLlxuICAgICAgICovXG4gICAgICAocm93Q291bnQ6IG51bWJlciB8IHVuZGVmaW5lZCwgbW9yZTogYm9vbGVhbiwgcnN0PzogYW55W10pID0+IHZvaWRcbiAgKTogdGhpc1xuXG4gIC8qKlxuICAgKiBgcmVxdWVzdC5vbignZG9uZUluUHJvYycsIGZ1bmN0aW9uIChyb3dDb3VudCwgbW9yZSwgcm93cykgeyB9KTtgXG4gICAqXG4gICAqIEluZGljYXRlcyB0aGUgY29tcGxldGlvbiBzdGF0dXMgb2YgYSBTUUwgc3RhdGVtZW50IHdpdGhpbiBhIHN0b3JlZCBwcm9jZWR1cmUuIEFsbCByb3dzIGZyb20gYSBzdGF0ZW1lbnRcbiAgICogaW4gYSBzdG9yZWQgcHJvY2VkdXJlIGhhdmUgYmVlbiBwcm92aWRlZCAodGhyb3VnaCBgcm93YCBldmVudHMpLlxuICAgKlxuICAgKiBUaGlzIGV2ZW50IG1heSBhbHNvIG9jY3VyIHdoZW4gZXhlY3V0aW5nIG11bHRpcGxlIGNhbGxzIHdpdGggdGhlIHNhbWUgcXVlcnkgdXNpbmcgW1tleGVjU3FsXV0uXG4gICAqL1xuICBvbihcbiAgICBldmVudDogJ2RvbmVJblByb2MnLFxuICAgIGxpc3RlbmVyOlxuICAgICAgLyoqXG4gICAgICAgKiBAcGFyYW0gcm93Q291bnRcbiAgICAgICAqICAgVGhlIG51bWJlciBvZiByZXN1bHQgcm93cy4gTWF5IGJlIGB1bmRlZmluZWRgIGlmIG5vdCBhdmFpbGFibGUuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIG1vcmVcbiAgICAgICAqICAgSWYgdGhlcmUgYXJlIG1vcmUgcmVzdWx0cyB0byBjb21lIChwcm9iYWJseSBiZWNhdXNlIG11bHRpcGxlIHN0YXRlbWVudHMgYXJlIGJlaW5nIGV4ZWN1dGVkKSwgdGhlbiBgdHJ1ZWAuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHJzdFxuICAgICAgICogICBSb3dzIGFzIGEgcmVzdWx0IG9mIGV4ZWN1dGluZyB0aGUgU1FMIHN0YXRlbWVudC5cbiAgICAgICAqICAgV2lsbCBvbmx5IGJlIGF2YWlsYWJsZSBpZiBDb25uZWN0aW9uJ3MgW1tDb25uZWN0aW9uT3B0aW9ucy5yb3dDb2xsZWN0aW9uT25Eb25lXV0gaXMgYHRydWVgLlxuICAgICAgICovXG4gICAgICAocm93Q291bnQ6IG51bWJlciB8IHVuZGVmaW5lZCwgbW9yZTogYm9vbGVhbiwgcnN0PzogYW55W10pID0+IHZvaWRcbiAgKTogdGhpc1xuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgdGhlIGNvbXBsZXRpb24gc3RhdHVzIG9mIGEgc3RvcmVkIHByb2NlZHVyZS4gVGhpcyBpcyBhbHNvIGdlbmVyYXRlZCBmb3Igc3RvcmVkIHByb2NlZHVyZXNcbiAgICogZXhlY3V0ZWQgdGhyb3VnaCBTUUwgc3RhdGVtZW50cy5cXFxuICAgKiBUaGlzIGV2ZW50IG1heSBhbHNvIG9jY3VyIHdoZW4gZXhlY3V0aW5nIG11bHRpcGxlIGNhbGxzIHdpdGggdGhlIHNhbWUgcXVlcnkgdXNpbmcgW1tleGVjU3FsXV0uXG4gICAqL1xuICBvbihcbiAgICBldmVudDogJ2RvbmVQcm9jJyxcbiAgICBsaXN0ZW5lcjpcbiAgICAgIC8qKlxuICAgICAgICogQHBhcmFtIHJvd0NvdW50XG4gICAgICAgKiAgIFRoZSBudW1iZXIgb2YgcmVzdWx0IHJvd3MuIE1heSBiZSBgdW5kZWZpbmVkYCBpZiBub3QgYXZhaWxhYmxlLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSBtb3JlXG4gICAgICAgKiAgIElmIHRoZXJlIGFyZSBtb3JlIHJlc3VsdHMgdG8gY29tZSAocHJvYmFibHkgYmVjYXVzZSBtdWx0aXBsZSBzdGF0ZW1lbnRzIGFyZSBiZWluZyBleGVjdXRlZCksIHRoZW4gYHRydWVgLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSByc3RcbiAgICAgICAqICAgUm93cyBhcyBhIHJlc3VsdCBvZiBleGVjdXRpbmcgdGhlIFNRTCBzdGF0ZW1lbnQuXG4gICAgICAgKiAgIFdpbGwgb25seSBiZSBhdmFpbGFibGUgaWYgQ29ubmVjdGlvbidzIFtbQ29ubmVjdGlvbk9wdGlvbnMucm93Q29sbGVjdGlvbk9uRG9uZV1dIGlzIGB0cnVlYC5cbiAgICAgICAqL1xuICAgICAgKHJvd0NvdW50OiBudW1iZXIgfCB1bmRlZmluZWQsIG1vcmU6IGJvb2xlYW4sIHByb2NSZXR1cm5TdGF0dXNWYWx1ZTogbnVtYmVyLCByc3Q/OiBhbnlbXSkgPT4gdm9pZFxuICApOiB0aGlzXG5cbiAgLyoqXG4gICAqIEEgdmFsdWUgZm9yIGFuIG91dHB1dCBwYXJhbWV0ZXIgKHRoYXQgd2FzIGFkZGVkIHRvIHRoZSByZXF1ZXN0IHdpdGggW1thZGRPdXRwdXRQYXJhbWV0ZXJdXSkuXG4gICAqIFNlZSBhbHNvIGBVc2luZyBQYXJhbWV0ZXJzYC5cbiAgICovXG4gIG9uKFxuICAgIGV2ZW50OiAncmV0dXJuVmFsdWUnLFxuICAgIGxpc3RlbmVyOlxuICAgICAgLyoqXG4gICAgICAgKiBAcGFyYW0gcGFyYW1ldGVyTmFtZVxuICAgICAgICogICBUaGUgcGFyYW1ldGVyIG5hbWUuIChEb2VzIG5vdCBzdGFydCB3aXRoICdAJy4pXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHZhbHVlXG4gICAgICAgKiAgIFRoZSBwYXJhbWV0ZXIncyBvdXRwdXQgdmFsdWUuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIG1ldGFkYXRhXG4gICAgICAgKiAgIFRoZSBzYW1lIGRhdGEgdGhhdCBpcyBleHBvc2VkIGluIHRoZSBgY29sdW1uTWV0YURhdGFgIGV2ZW50LlxuICAgICAgICovXG4gICAgICAocGFyYW1ldGVyTmFtZTogc3RyaW5nLCB2YWx1ZTogdW5rbm93biwgbWV0YWRhdGE6IE1ldGFkYXRhKSA9PiB2b2lkXG4gICk6IHRoaXNcblxuICAvKipcbiAgICogVGhpcyBldmVudCBnaXZlcyB0aGUgY29sdW1ucyBieSB3aGljaCBkYXRhIGlzIG9yZGVyZWQsIGlmIGBPUkRFUiBCWWAgY2xhdXNlIGlzIGV4ZWN1dGVkIGluIFNRTCBTZXJ2ZXIuXG4gICAqL1xuICBvbihcbiAgICBldmVudDogJ29yZGVyJyxcbiAgICBsaXN0ZW5lcjpcbiAgICAgIC8qKlxuICAgICAgICogQHBhcmFtIG9yZGVyQ29sdW1uc1xuICAgICAgICogICBBbiBhcnJheSBvZiBjb2x1bW4gbnVtYmVycyBpbiB0aGUgcmVzdWx0IHNldCBieSB3aGljaCBkYXRhIGlzIG9yZGVyZWQuXG4gICAgICAgKi9cbiAgICAgIChvcmRlckNvbHVtbnM6IG51bWJlcltdKSA9PiB2b2lkXG4gICk6IHRoaXNcblxuICBvbihldmVudDogJ3JlcXVlc3RDb21wbGV0ZWQnLCBsaXN0ZW5lcjogKCkgPT4gdm9pZCk6IHRoaXNcblxuICBvbihldmVudDogJ2NhbmNlbCcsIGxpc3RlbmVyOiAoKSA9PiB2b2lkKTogdGhpc1xuXG4gIG9uKGV2ZW50OiAncGF1c2UnLCBsaXN0ZW5lcjogKCkgPT4gdm9pZCk6IHRoaXNcblxuICBvbihldmVudDogJ3Jlc3VtZScsIGxpc3RlbmVyOiAoKSA9PiB2b2lkKTogdGhpc1xuXG4gIG9uKGV2ZW50OiBzdHJpbmcgfCBzeW1ib2wsIGxpc3RlbmVyOiAoLi4uYXJnczogYW55W10pID0+IHZvaWQpIHtcbiAgICByZXR1cm4gc3VwZXIub24oZXZlbnQsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZW1pdChldmVudDogJ2NvbHVtbk1ldGFkYXRhJywgY29sdW1uczogQ29sdW1uTWV0YWRhdGFbXSB8IHsgW2tleTogc3RyaW5nXTogQ29sdW1uTWV0YWRhdGEgfSk6IGJvb2xlYW5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBlbWl0KGV2ZW50OiAncHJlcGFyZWQnKTogYm9vbGVhblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGVtaXQoZXZlbnQ6ICdlcnJvcicsIGVycjogRXJyb3IpOiBib29sZWFuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZW1pdChldmVudDogJ3JvdycsIGNvbHVtbnM6IGFueSk6IGJvb2xlYW5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBlbWl0KGV2ZW50OiAnZG9uZScsIHJvd0NvdW50OiBudW1iZXIgfCB1bmRlZmluZWQsIG1vcmU6IGJvb2xlYW4sIHJzdD86IGFueVtdKTogYm9vbGVhblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGVtaXQoZXZlbnQ6ICdkb25lSW5Qcm9jJywgcm93Q291bnQ6IG51bWJlciB8IHVuZGVmaW5lZCwgbW9yZTogYm9vbGVhbiwgcnN0PzogYW55W10pOiBib29sZWFuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZW1pdChldmVudDogJ2RvbmVQcm9jJywgcm93Q291bnQ6IG51bWJlciB8IHVuZGVmaW5lZCwgbW9yZTogYm9vbGVhbiwgcHJvY1JldHVyblN0YXR1c1ZhbHVlOiBudW1iZXIsIHJzdD86IGFueVtdKTogYm9vbGVhblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGVtaXQoZXZlbnQ6ICdyZXR1cm5WYWx1ZScsIHBhcmFtZXRlck5hbWU6IHN0cmluZywgdmFsdWU6IHVua25vd24sIG1ldGFkYXRhOiBNZXRhZGF0YSk6IGJvb2xlYW5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBlbWl0KGV2ZW50OiAncmVxdWVzdENvbXBsZXRlZCcpOiBib29sZWFuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZW1pdChldmVudDogJ2NhbmNlbCcpOiBib29sZWFuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZW1pdChldmVudDogJ3BhdXNlJyk6IGJvb2xlYW5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBlbWl0KGV2ZW50OiAncmVzdW1lJyk6IGJvb2xlYW5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBlbWl0KGV2ZW50OiAnb3JkZXInLCBvcmRlckNvbHVtbnM6IG51bWJlcltdKTogYm9vbGVhblxuICBlbWl0KGV2ZW50OiBzdHJpbmcgfCBzeW1ib2wsIC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgcmV0dXJuIHN1cGVyLmVtaXQoZXZlbnQsIC4uLmFyZ3MpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBzcWxUZXh0T3JQcm9jZWR1cmVcbiAgICogICBUaGUgU1FMIHN0YXRlbWVudCB0byBiZSBleGVjdXRlZFxuICAgKlxuICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICogICBUaGUgY2FsbGJhY2sgdG8gZXhlY3V0ZSBvbmNlIHRoZSByZXF1ZXN0IGhhcyBiZWVuIGZ1bGx5IGNvbXBsZXRlZC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHNxbFRleHRPclByb2NlZHVyZTogc3RyaW5nIHwgdW5kZWZpbmVkLCBjYWxsYmFjazogQ29tcGxldGlvbkNhbGxiYWNrLCBvcHRpb25zPzogUmVxdWVzdE9wdGlvbnMpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5zcWxUZXh0T3JQcm9jZWR1cmUgPSBzcWxUZXh0T3JQcm9jZWR1cmU7XG4gICAgdGhpcy5wYXJhbWV0ZXJzID0gW107XG4gICAgdGhpcy5wYXJhbWV0ZXJzQnlOYW1lID0ge307XG4gICAgdGhpcy5wcmVwYXJpbmcgPSBmYWxzZTtcbiAgICB0aGlzLmhhbmRsZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmNhbmNlbGVkID0gZmFsc2U7XG4gICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcbiAgICB0aGlzLmVycm9yID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuY29ubmVjdGlvbiA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnRpbWVvdXQgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy51c2VyQ2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB0aGlzLnN0YXRlbWVudENvbHVtbkVuY3J5cHRpb25TZXR0aW5nID0gKG9wdGlvbnMgJiYgb3B0aW9ucy5zdGF0ZW1lbnRDb2x1bW5FbmNyeXB0aW9uU2V0dGluZykgfHwgU1FMU2VydmVyU3RhdGVtZW50Q29sdW1uRW5jcnlwdGlvblNldHRpbmcuVXNlQ29ubmVjdGlvblNldHRpbmc7XG4gICAgdGhpcy5jcnlwdG9NZXRhZGF0YUxvYWRlZCA9IGZhbHNlO1xuICAgIHRoaXMuY2FsbGJhY2sgPSBmdW5jdGlvbihlcnI6IEVycm9yIHwgdW5kZWZpbmVkIHwgbnVsbCwgcm93Q291bnQ/OiBudW1iZXIsIHJvd3M/OiBhbnkpIHtcbiAgICAgIGlmICh0aGlzLnByZXBhcmluZykge1xuICAgICAgICB0aGlzLnByZXBhcmluZyA9IGZhbHNlO1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgdGhpcy5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5lbWl0KCdwcmVwYXJlZCcpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnVzZXJDYWxsYmFjayhlcnIsIHJvd0NvdW50LCByb3dzKTtcbiAgICAgICAgdGhpcy5lbWl0KCdyZXF1ZXN0Q29tcGxldGVkJyk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gbmFtZVxuICAgKiAgIFRoZSBwYXJhbWV0ZXIgbmFtZS4gVGhpcyBzaG91bGQgY29ycmVzcG9uZCB0byBhIHBhcmFtZXRlciBpbiB0aGUgU1FMLFxuICAgKiAgIG9yIGEgcGFyYW1ldGVyIHRoYXQgYSBjYWxsZWQgcHJvY2VkdXJlIGV4cGVjdHMuIFRoZSBuYW1lIHNob3VsZCBub3Qgc3RhcnQgd2l0aCBgQGAuXG4gICAqXG4gICAqIEBwYXJhbSB0eXBlXG4gICAqICAgT25lIG9mIHRoZSBzdXBwb3J0ZWQgZGF0YSB0eXBlcy5cbiAgICpcbiAgICogQHBhcmFtIHZhbHVlXG4gICAqICAgVGhlIHZhbHVlIHRoYXQgdGhlIHBhcmFtZXRlciBpcyB0byBiZSBnaXZlbi4gVGhlIEphdmFzY3JpcHQgdHlwZSBvZiB0aGVcbiAgICogICBhcmd1bWVudCBzaG91bGQgbWF0Y2ggdGhhdCBkb2N1bWVudGVkIGZvciBkYXRhIHR5cGVzLlxuICAgKlxuICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgKiAgIEFkZGl0aW9uYWwgdHlwZSBvcHRpb25zLiBPcHRpb25hbC5cbiAgICovXG4gIC8vIFRPRE86IGB0eXBlYCBtdXN0IGJlIGEgdmFsaWQgVERTIHZhbHVlIHR5cGVcbiAgYWRkUGFyYW1ldGVyKG5hbWU6IHN0cmluZywgdHlwZTogRGF0YVR5cGUsIHZhbHVlPzogdW5rbm93biwgb3B0aW9ucz86IFJlYWRvbmx5PFBhcmFtZXRlck9wdGlvbnM+IHwgbnVsbCkge1xuICAgIGNvbnN0IHsgb3V0cHV0ID0gZmFsc2UsIGxlbmd0aCwgcHJlY2lzaW9uLCBzY2FsZSB9ID0gb3B0aW9ucyA/PyB7fTtcblxuICAgIGNvbnN0IHBhcmFtZXRlcjogUGFyYW1ldGVyID0ge1xuICAgICAgdHlwZTogdHlwZSxcbiAgICAgIG5hbWU6IG5hbWUsXG4gICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICBvdXRwdXQ6IG91dHB1dCxcbiAgICAgIGxlbmd0aDogbGVuZ3RoLFxuICAgICAgcHJlY2lzaW9uOiBwcmVjaXNpb24sXG4gICAgICBzY2FsZTogc2NhbGVcbiAgICB9O1xuXG4gICAgdGhpcy5wYXJhbWV0ZXJzLnB1c2gocGFyYW1ldGVyKTtcbiAgICB0aGlzLnBhcmFtZXRlcnNCeU5hbWVbbmFtZV0gPSBwYXJhbWV0ZXI7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIG5hbWVcbiAgICogICBUaGUgcGFyYW1ldGVyIG5hbWUuIFRoaXMgc2hvdWxkIGNvcnJlc3BvbmQgdG8gYSBwYXJhbWV0ZXIgaW4gdGhlIFNRTCxcbiAgICogICBvciBhIHBhcmFtZXRlciB0aGF0IGEgY2FsbGVkIHByb2NlZHVyZSBleHBlY3RzLlxuICAgKlxuICAgKiBAcGFyYW0gdHlwZVxuICAgKiAgIE9uZSBvZiB0aGUgc3VwcG9ydGVkIGRhdGEgdHlwZXMuXG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZVxuICAgKiAgIFRoZSB2YWx1ZSB0aGF0IHRoZSBwYXJhbWV0ZXIgaXMgdG8gYmUgZ2l2ZW4uIFRoZSBKYXZhc2NyaXB0IHR5cGUgb2YgdGhlXG4gICAqICAgYXJndW1lbnQgc2hvdWxkIG1hdGNoIHRoYXQgZG9jdW1lbnRlZCBmb3IgZGF0YSB0eXBlc1xuICAgKlxuICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgKiAgIEFkZGl0aW9uYWwgdHlwZSBvcHRpb25zLiBPcHRpb25hbC5cbiAgICovXG4gIGFkZE91dHB1dFBhcmFtZXRlcihuYW1lOiBzdHJpbmcsIHR5cGU6IERhdGFUeXBlLCB2YWx1ZT86IHVua25vd24sIG9wdGlvbnM/OiBSZWFkb25seTxQYXJhbWV0ZXJPcHRpb25zPiB8IG51bGwpIHtcbiAgICB0aGlzLmFkZFBhcmFtZXRlcihuYW1lLCB0eXBlLCB2YWx1ZSwgeyAuLi5vcHRpb25zLCBvdXRwdXQ6IHRydWUgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG1ha2VQYXJhbXNQYXJhbWV0ZXIocGFyYW1ldGVyczogUGFyYW1ldGVyW10pIHtcbiAgICBsZXQgcGFyYW1zUGFyYW1ldGVyID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHBhcmFtZXRlcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IHBhcmFtZXRlciA9IHBhcmFtZXRlcnNbaV07XG4gICAgICBpZiAocGFyYW1zUGFyYW1ldGVyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcGFyYW1zUGFyYW1ldGVyICs9ICcsICc7XG4gICAgICB9XG4gICAgICBwYXJhbXNQYXJhbWV0ZXIgKz0gJ0AnICsgcGFyYW1ldGVyLm5hbWUgKyAnICc7XG4gICAgICBwYXJhbXNQYXJhbWV0ZXIgKz0gcGFyYW1ldGVyLnR5cGUuZGVjbGFyYXRpb24ocGFyYW1ldGVyKTtcbiAgICAgIGlmIChwYXJhbWV0ZXIub3V0cHV0KSB7XG4gICAgICAgIHBhcmFtc1BhcmFtZXRlciArPSAnIE9VVFBVVCc7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwYXJhbXNQYXJhbWV0ZXI7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHZhbGlkYXRlUGFyYW1ldGVycyhjb2xsYXRpb246IENvbGxhdGlvbiB8IHVuZGVmaW5lZCkge1xuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSB0aGlzLnBhcmFtZXRlcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IHBhcmFtZXRlciA9IHRoaXMucGFyYW1ldGVyc1tpXTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgcGFyYW1ldGVyLnZhbHVlID0gcGFyYW1ldGVyLnR5cGUudmFsaWRhdGUocGFyYW1ldGVyLnZhbHVlLCBjb2xsYXRpb24pO1xuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICB0aHJvdyBuZXcgUmVxdWVzdEVycm9yKCdWYWxpZGF0aW9uIGZhaWxlZCBmb3IgcGFyYW1ldGVyIFxcJycgKyBwYXJhbWV0ZXIubmFtZSArICdcXCcuICcgKyBlcnJvci5tZXNzYWdlLCAnRVBBUkFNJywgeyBjYXVzZTogZXJyb3IgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRlbXBvcmFyaWx5IHN1c3BlbmRzIHRoZSBmbG93IG9mIGRhdGEgZnJvbSB0aGUgZGF0YWJhc2UuIE5vIG1vcmUgYHJvd2AgZXZlbnRzIHdpbGwgYmUgZW1pdHRlZCB1bnRpbCBbW3Jlc3VtZV0gaXMgY2FsbGVkLlxuICAgKiBJZiB0aGlzIHJlcXVlc3QgaXMgYWxyZWFkeSBpbiBhIHBhdXNlZCBzdGF0ZSwgY2FsbGluZyBbW3BhdXNlXV0gaGFzIG5vIGVmZmVjdC5cbiAgICovXG4gIHBhdXNlKCkge1xuICAgIGlmICh0aGlzLnBhdXNlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmVtaXQoJ3BhdXNlJyk7XG4gICAgdGhpcy5wYXVzZWQgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc3VtZXMgdGhlIGZsb3cgb2YgZGF0YSBmcm9tIHRoZSBkYXRhYmFzZS5cbiAgICogSWYgdGhpcyByZXF1ZXN0IGlzIG5vdCBpbiBhIHBhdXNlZCBzdGF0ZSwgY2FsbGluZyBbW3Jlc3VtZV1dIGhhcyBubyBlZmZlY3QuXG4gICAqL1xuICByZXN1bWUoKSB7XG4gICAgaWYgKCF0aGlzLnBhdXNlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xuICAgIHRoaXMuZW1pdCgncmVzdW1lJyk7XG4gIH1cblxuICAvKipcbiAgICogQ2FuY2VscyBhIHJlcXVlc3Qgd2hpbGUgd2FpdGluZyBmb3IgYSBzZXJ2ZXIgcmVzcG9uc2UuXG4gICAqL1xuICBjYW5jZWwoKSB7XG4gICAgaWYgKHRoaXMuY2FuY2VsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmNhbmNlbGVkID0gdHJ1ZTtcbiAgICB0aGlzLmVtaXQoJ2NhbmNlbCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgYSB0aW1lb3V0IGZvciB0aGlzIHJlcXVlc3QuXG4gICAqXG4gICAqIEBwYXJhbSB0aW1lb3V0XG4gICAqICAgVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgYmVmb3JlIHRoZSByZXF1ZXN0IGlzIGNvbnNpZGVyZWQgZmFpbGVkLFxuICAgKiAgIG9yIGAwYCBmb3Igbm8gdGltZW91dC4gV2hlbiBubyB0aW1lb3V0IGlzIHNldCBmb3IgdGhlIHJlcXVlc3QsXG4gICAqICAgdGhlIFtbQ29ubmVjdGlvbk9wdGlvbnMucmVxdWVzdFRpbWVvdXRdXSBvZiB0aGUgW1tDb25uZWN0aW9uXV0gaXMgdXNlZC5cbiAgICovXG4gIHNldFRpbWVvdXQodGltZW91dD86IG51bWJlcikge1xuICAgIHRoaXMudGltZW91dCA9IHRpbWVvdXQ7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUmVxdWVzdDtcbm1vZHVsZS5leHBvcnRzID0gUmVxdWVzdDtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBQUEsT0FBQSxHQUFBQyxPQUFBO0FBRUEsSUFBQUMsT0FBQSxHQUFBRCxPQUFBO0FBSUEsSUFBQUUsTUFBQSxHQUFBRixPQUFBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQTJCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNRyxPQUFPLFNBQVNDLG9CQUFZLENBQUM7RUFDakM7QUFDRjtBQUNBOztFQUVFO0FBQ0Y7QUFDQTs7RUFFRTtBQUNGO0FBQ0E7O0VBRUU7QUFDRjtBQUNBOztFQUVFO0FBQ0Y7QUFDQTs7RUFFRTtBQUNGO0FBQ0E7O0VBRUU7QUFDRjtBQUNBOztFQUVFO0FBQ0Y7QUFDQTs7RUFFRTtBQUNGO0FBQ0E7O0VBRUU7QUFDRjtBQUNBOztFQUVFO0FBQ0Y7QUFDQTs7RUFHRTtBQUNGO0FBQ0E7O0VBRUU7QUFDRjtBQUNBOztFQUVFO0FBQ0Y7QUFDQTs7RUFHRTtBQUNGO0FB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