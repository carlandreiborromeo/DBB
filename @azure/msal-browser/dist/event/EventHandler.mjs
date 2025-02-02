/*! @azure/msal-browser v4.0.1 2025-01-15 */
'use strict';
import { Logger } from '@azure/msal-common/browser';
import { createGuid } from '../utils/BrowserUtils.mjs';

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
class EventHandler {
    constructor(logger) {
        this.eventCallbacks = new Map();
        this.logger = logger || new Logger({});
    }
    /**
     * Adds event callbacks to array
     * @param callback - callback to be invoked when an event is raised
     * @param eventTypes - list of events that this callback will be invoked for, if not provided callback will be invoked for all events
     * @param callbackId - Identifier for the callback, used to locate and remove the callback when no longer required
     */
    addEventCallback(callback, eventTypes, callbackId) {
        if (typeof window !== "undefined") {
            const id = callbackId || createGuid();
            if (this.eventCallbacks.has(id)) {
                this.logger.error(`Event callback with id: ${id} is already registered. Please provide a unique id or remove the existing callback and try again.`);
                return null;
            }
            this.eventCallbacks.set(id, [callback, eventTypes || []]);
            this.logger.verbose(`Event callback registered with id: ${id}`);
            return id;
        }
        return null;
    }
    /**
     * Removes callback with provided id from callback array
     * @param callbackId
     */
    removeEventCallback(callbackId) {
        this.eventCallbacks.delete(callbackId);
        this.logger.verbose(`Event callback ${callbackId} removed.`);
    }
    /**
     * Emits events by calling callback with event message
     * @param eventType
     * @param interactionType
     * @param payload
     * @param error
     */
    emitEvent(eventType, interactionType, payload, error) {
        if (typeof window !== "undefined") {
            const message = {
                eventType: eventType,
                interactionType: interactionType || null,
                payload: payload || null,
                error: error || null,
                timestamp: Date.now(),
            };
            this.eventCallbacks.forEach(([callback, eventTypes], callbackId) => {
                if (eventTypes.length === 0 ||
                    eventTypes.includes(eventType)) {
                    this.logger.verbose(`Emitting event to callback ${callbackId}: ${eventType}`);
                    callback.apply(null, [message]);
                }
            });
        }
    }
}

export { EventHandler };
//# sourceMappingURL=EventHandler.mjs.map
