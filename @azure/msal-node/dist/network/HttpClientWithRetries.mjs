/*! @azure/msal-node v2.16.2 2024-11-19 */
'use strict';
import { HeaderNames } from '@azure/msal-common/node';
import { HttpMethod } from '../utils/Constants.mjs';

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
class HttpClientWithRetries {
    constructor(httpClientNoRetries, retryPolicy) {
        this.httpClientNoRetries = httpClientNoRetries;
        this.retryPolicy = retryPolicy;
    }
    async sendNetworkRequestAsyncHelper(httpMethod, url, options) {
        if (httpMethod === HttpMethod.GET) {
            return this.httpClientNoRetries.sendGetRequestAsync(url, options);
        }
        else {
            return this.httpClientNoRetries.sendPostRequestAsync(url, options);
        }
    }
    async sendNetworkRequestAsync(httpMethod, url, options) {
        // the underlying network module (custom or HttpClient) will make the call
        let response = await this.sendNetworkRequestAsyncHelper(httpMethod, url, options);
        let currentRetry = 0;
        while (await this.retryPolicy.pauseForRetry(response.status, currentRetry, response.headers[HeaderNames.RETRY_AFTER])) {
            response = await this.sendNetworkRequestAsyncHelper(httpMethod, url, options);
            currentRetry++;
        }
        return response;
    }
    async sendGetRequestAsync(url, options) {
        return this.sendNetworkRequestAsync(HttpMethod.GET, url, options);
    }
    async sendPostRequestAsync(url, options) {
        return this.sendNetworkRequestAsync(HttpMethod.POST, url, options);
    }
}

export { HttpClientWithRetries };
//# sourceMappingURL=HttpClientWithRetries.mjs.map
