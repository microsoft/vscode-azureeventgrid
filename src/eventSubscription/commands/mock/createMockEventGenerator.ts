/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fse from 'fs-extra';
import * as path from 'path';
import { IActionContext, IAzureNode, IAzureQuickPickItem } from 'vscode-azureextensionui';
import { ext } from '../../../extensionVariables';
import { fsUtils } from '../../../utils/fsUtils';
import { localize } from '../../../utils/localize';
import { EndpointUrlStep } from '../../createWizard/EndpointUrlStep';
import { IEndpointUrlWizardContext } from '../../createWizard/IEndpointUrlWizardContext';
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

export async function createMockEventGenerator(actionContext: IActionContext, node?: IAzureNode<EventSubscriptionTreeItem>): Promise<void> {
    let eventType: string;
    let topic: string;
    let destination: {};
    let fileName: string;
    if (node) {
        eventType = getEventTypeFromTopic(node.treeItem.topic);
        topic = node.treeItem.topic;
        destination = {
            eventSubscriptionId: node.id
        };
        fileName = node.treeItem.label;
    } else {
        eventType = await promptForEventType();
        topic = '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/testgroup/providers/Microsoft.Provider/namespaces/testresource';
        const urlContext: IEndpointUrlWizardContext = {};
        const urlStep: EndpointUrlStep<IEndpointUrlWizardContext> = new EndpointUrlStep();
        await urlStep.prompt(urlContext);
        destination = {
            endpointUrl: urlContext.endpointUrl
        };
        fileName = 'test';
    }

    actionContext.properties.eventType = eventType;

    let schemaFileName: string | undefined;
    let eventSubTypePattern: string;
    let subjectPattern: string;
    switch (eventType) {
        case EventType.Storage:
            schemaFileName = 'Storage';
            eventSubTypePattern = 'Blob(Created|Deleted)';
            subjectPattern = '/blobServices/default/containers/[a-zA-Z0-9]+/blobs/[a-zA-Z0-9]+';
            break;
        case EventType.Resources:
            schemaFileName = 'Resource';
            eventSubTypePattern = 'Resource(Write|Delete)(Success|Failure|Cancel)';
            subjectPattern = '/subscriptions\/[a-zA-Z0-9]+\/resourceGroups\/[a-zA-Z0-9]+\/providers\/Microsoft\\.[a-zA-Z0-9]+\/[a-zA-Z0-9]+';
            break;
        case EventType.ContainerRegistry:
            schemaFileName = 'ContainerRegistry';
            eventSubTypePattern = 'Image(Pushed|Deleted)';
            subjectPattern = '[a-zA-Z0-9]+:[0-9]\\.[0-9]\\.[0-9]';
            break;
        case EventType.Devices:
            schemaFileName = 'IotHub';
            eventSubTypePattern = 'Device(Created|Deleted)';
            subjectPattern = 'devices/[a-zA-Z0-9]+';
            break;
        case EventType.EventHub:
            schemaFileName = 'EventHub';
            eventSubTypePattern = 'CaptureFileCreated';
            // Get the event hub name from the topic id and use that as the subject
            subjectPattern = topic.substring(topic.lastIndexOf('/') + 1);
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
    if (schemaFileName) {
        eventSchema.properties.data = <{}>await fse.readJson(path.join(templatesPath, `${schemaFileName}.json`));
    }

    eventSchema.properties.topic.default = topic;
    eventSchema.properties.eventType.pattern = `${eventType.replace('.', '\\.')}\\.${eventSubTypePattern}`;
    eventSchema.properties.subject.pattern = subjectPattern;

    const definitionsPath: string = path.join(templatesPath, 'definitions', `${schemaFileName}.json`);
    if (await fse.pathExists(definitionsPath)) {
        eventSchema.definitions = <{}>await fse.readJson(definitionsPath);
    }

    const eventGenerator: IMockEventGenerator = {
        destination: destination,
        numberOfEvents: 1,
        jsonSchemaFakerOptions: {
            useDefaultValue: true,
            alwaysFakeOptionals: true
        },
        schema: eventSchema
    };

    await fsUtils.showNewFile(JSON.stringify(eventGenerator, undefined, 2), fileName, '.eventGenerator.json');
}

export function getEventTypeFromTopic(topic: string): EventType {
    if (/^\/subscriptions\/[^\/]+$/i.test(topic) || /^\/subscriptions\/.*\/resourceGroups\/[^\/]+$/i.test(topic)) {
        return EventType.Resources;
    } else {
        const result: RegExpExecArray | null = /^\/subscriptions\/.*\/resourceGroups\/.*\/providers\/(.*)\/[^\/]+$/i.exec(topic);
        if (result && result.length > 1) {
            switch (result[1].toLowerCase()) {
                case 'microsoft.storage/storageaccounts':
                    return EventType.Storage;
                case 'microsoft.containerregistry/registries':
                    return EventType.ContainerRegistry;
                case 'microsoft.devices/iothubs':
                    return EventType.Devices;
                case 'microsoft.eventhub/namespaces':
                    return EventType.EventHub;
                case 'microsoft.eventgrid/topics':
                    return EventType.Custom;
                default:
            }
        }

        throw new Error(localize('unsupportedType', 'The topic type for this Event Subscription is not yet supported.'));
    }
}

export async function promptForEventType(): Promise<EventType> {
    const picks: IAzureQuickPickItem<EventType>[] = Object.keys(EventType).map((key: string) => {
        return {
            label: key,
            description: EventType[key],
            data: EventType[key]
        };
    });

    return (await ext.ui.showQuickPick(picks, { placeHolder: localize('selectEventType', 'Select an event type') })).data;
}
