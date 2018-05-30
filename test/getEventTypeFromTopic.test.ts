/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as assert from 'assert';
import { EventType, getEventTypeFromTopic } from '../src/eventSubscription/commands/mock/createMockEventGenerator';

suite('getEventTypeFromTopic Tests', () => {
    test('ContainerRegistry', () => {
        const result: string = getEventTypeFromTopic('/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testgroup/providers/Microsoft.ContainerRegistry/registries/testresource');
        assert.equal(result, EventType.ContainerRegistry);
    });

    test('EventGridTopic', () => {
        const result: string = getEventTypeFromTopic('/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testgroup/providers/Microsoft.EventGrid/topics/testresource');
        assert.equal(result, EventType.Custom);
    });

    test('Devices', () => {
        const result: string = getEventTypeFromTopic('/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testgroup/providers/Microsoft.Devices/IotHubs/testresource');
        assert.equal(result, EventType.Devices);
    });

    test('EventHub', () => {
        const result: string = getEventTypeFromTopic('/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testgroup/providers/Microsoft.EventHub/namespaces/testresource');
        assert.equal(result, EventType.EventHub);
    });

    test('Subscription', () => {
        const result: string = getEventTypeFromTopic('/subscriptions/00000000-0000-0000-0000-000000000000');
        assert.equal(result, EventType.Resources);
    });

    test('ResourceGroup', () => {
        const result: string = getEventTypeFromTopic('/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testgroup');
        assert.equal(result, EventType.Resources);
    });

    test('Storage', () => {
        const result: string = getEventTypeFromTopic('/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testgroup/providers/Microsoft.Storage/storageAccounts/testresource');
        assert.equal(result, EventType.Storage);
    });
});
