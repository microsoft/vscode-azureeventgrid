/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fse from 'fs-extra';
import * as path from 'path';
import { IAzureNode } from 'vscode-azureextensionui';
import { ext } from '../../../extensionVariables';
import { fsUtils } from '../../../utils/fsUtils';
import { localize } from '../../../utils/localize';
import { EventSubscriptionTreeItem } from '../../tree/EventSubscriptionTreeItem';
import { IEventSchema } from './IEventSchema';
import { IMockEventGenerator } from './IMockEventGenerator';

export enum EventType {
    Storage = 'Microsoft.Storage',
    Resources = 'Microsoft.Resources',
    ContainerRegistry = 'Microsoft.ContainerRegistry',
    Devices = 'Microsoft.Devices',
    EventHub = 'Microsoft.EventHub',
    Custom = 'Fabrikam'
}

export async function createMockEventGenerator(node?: IAzureNode<EventSubscriptionTreeItem>): Promise<void> {
    if (!node) {
        node = <IAzureNode<EventSubscriptionTreeItem>>await ext.eventSubscriptionTree.showNodePicker(EventSubscriptionTreeItem.contextValue);
    }

    const eventType: string = getEventTypeFromTopic(node.treeItem.topic);

    let fileName: string | undefined;
    let eventSubTypePattern: string;
    let subjectPattern: string;
    switch (eventType) {
        case EventType.Storage:
            fileName = 'Storage';
            eventSubTypePattern = 'Blob(Created|Deleted)';
            subjectPattern = '/blobServices/default/containers/[a-zA-Z0-9]+/blobs/[a-zA-Z0-9]+';
            break;
        case EventType.Resources:
            fileName = 'Resource';
            eventSubTypePattern = 'Resource(Write|Delete)(Success|Failure|Cancel)';
            subjectPattern = '/subscriptions\/[a-zA-Z0-9]+\/resourceGroups\/[a-zA-Z0-9]+\/providers\/Microsoft\\.[a-zA-Z0-9]+\/[a-zA-Z0-9]+';
            break;
        case EventType.ContainerRegistry:
            fileName = 'ContainerRegistry';
            eventSubTypePattern = 'Image(Pushed|Deleted)';
            subjectPattern = '[a-zA-Z0-9]+:[0-9]\\.[0-9]\\.[0-9]';
            break;
        case EventType.Devices:
            fileName = 'IotHub';
            eventSubTypePattern = 'Device(Created|Deleted)';
            subjectPattern = 'devices/[a-zA-Z0-9]+';
            break;
        case EventType.EventHub:
            fileName = 'EventHub';
            eventSubTypePattern = 'CaptureFileCreated';
            // Get the event hub name from the topic id and use that as the subject
            subjectPattern = node.treeItem.topic.substring(node.treeItem.topic.lastIndexOf('/') + 1);
            break;
        case EventType.Custom:
            eventSubTypePattern = '[a-zA-Z0-9]+';
            subjectPattern = '[a-zA-Z0-9]+';
            break;
        default:
            throw new RangeError();
    }

    const templatesPath: string = ext.context.asAbsolutePath(path.join('resources', 'templates'));
    const eventSchema: IEventSchema = <IEventSchema>await fse.readJson(path.join(templatesPath, 'Event.json'));
    if (fileName) {
        eventSchema.properties.data = <{}>await fse.readJson(path.join(templatesPath, `${fileName}.json`));
    }

    eventSchema.properties.topic.default = node.treeItem.topic;
    eventSchema.properties.eventType.pattern = `${eventType.replace('.', '\\.')}\\.${eventSubTypePattern}`;
    eventSchema.properties.subject.pattern = subjectPattern;

    const definitionsPath: string = path.join(templatesPath, 'definitions', `${fileName}.json`);
    if (await fse.pathExists(definitionsPath)) {
        eventSchema.definitions = <{}>await fse.readJson(definitionsPath);
    }

    const eventGenerator: IMockEventGenerator = {
        eventSubscriptionId: node.id,
        numberOfEvents: 1,
        jsonSchemaFakerOptions: {
            useDefaultValue: true,
            alwaysFakeOptionals: true
        },
        eventSchema: eventSchema
    };

    await fsUtils.showNewFile(JSON.stringify(eventGenerator, undefined, 2), node.treeItem.label, '.eventGenerator.json');
}

function getEventTypeFromTopic(topic: string): EventType {
    if (/^\/subscriptions\/[^\/]+$/i.test(topic)) {
        return EventType.Resources;
    } else if (/^\/subscriptions\/.*\/resourceGroups\/[^\/]+$/i.test(topic)) {
        return EventType.Resources;
    } else if (/^\/subscriptions\/.*\/resourceGroups\/.*\/providers\/microsoft.storage\/storageaccounts\/[^\/]+$/i.test(topic)) {
        return EventType.Storage;
    } else if (/^\/subscriptions\/.*\/resourceGroups\/.*\/providers\/microsoft.containerregistry\/registries\/[^\/]+$/i.test(topic)) {
        return EventType.ContainerRegistry;
    } else if (/^\/subscriptions\/.*\/resourceGroups\/.*\/providers\/microsoft.devices\/iothubs\/[^\/]+$/i.test(topic)) {
        return EventType.Devices;
    } else if (/^\/subscriptions\/.*\/resourceGroups\/.*\/providers\/microsoft.eventhub\/namespaces\/[^\/]+$/i.test(topic)) {
        return EventType.EventHub;
    } else if (/^\/subscriptions\/.*\/resourceGroups\/.*\/providers\/microsoft.eventgrid\/topics\/[^\/]+$/i.test(topic)) {
        return EventType.Custom;
    } else {
        throw new Error(localize('unsupportedType', 'The topic type for this Event Subscription is not yet supported.'));
    }
}
