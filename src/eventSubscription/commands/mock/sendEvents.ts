/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { EventGridManagementClient } from 'azure-arm-eventgrid';
import { EventSubscriptionFullUrl } from 'azure-arm-eventgrid/lib/models';
import * as requestP from 'request-promise';
import { Progress, ProgressLocation, Uri, window } from "vscode";
import { IAzureNode } from "vscode-azureextensionui";
import { ext } from '../../../extensionVariables';
import { azureUtils } from '../../../utils/azureUtils';
import { localize } from '../../../utils/localize';
import { EventSubscriptionTreeItem } from '../../tree/EventSubscriptionTreeItem';
import { IMockEventGenerator } from "../mock/IMockEventGenerator";
import { generateEvents } from './generateEvents';

export async function sendEvents(uri: Uri): Promise<void> {
    const mainMessage: string = localize('sending', 'Sending events...');
    await window.withProgress({ location: ProgressLocation.Notification, title: mainMessage }, async (progress: Progress<{}>): Promise<void> => {
        progress.report({
            percentage: 10,
            message: localize('generating', 'Generating events...')
        });

        const [events, eventGenerator]: [{}[], IMockEventGenerator] = await generateEvents(uri);

        progress.report({
            percentage: 25,
            message: localize('retrieving', 'Retrieving endpoint URL...')
        });

        const endpointUrl: string = await getEndpointUrl(eventGenerator);

        progress.report({
            percentage: 75,
            message: mainMessage
        });

        await <Thenable<void>>requestP.post(
            // tslint:disable-next-line:no-non-null-assertion
            endpointUrl,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'aeg-event-type': 'Notification'
                },
                body: JSON.stringify(events)
            }
        );

        window.showInformationMessage(localize('sent', 'Successfully sent events.'));
    });
}

async function getEndpointUrl(eventGenerator: IMockEventGenerator): Promise<string> {
    if (eventGenerator.destination) {
        if (eventGenerator.destination.endpointUrl) {
            return eventGenerator.destination.endpointUrl;
        } else if (eventGenerator.destination.eventSubscriptionId) {
            const node: IAzureNode | undefined = await ext.eventSubscriptionTree.findNode(eventGenerator.destination.eventSubscriptionId);
            if (node) {
                const treeItem: EventSubscriptionTreeItem = <EventSubscriptionTreeItem>node.treeItem;
                const client: EventGridManagementClient = azureUtils.getEventGridManagementClient(node);
                const url: EventSubscriptionFullUrl = await client.eventSubscriptions.getFullUrl(treeItem.topic, treeItem.name);
                if (url.endpointUrl) {
                    return url.endpointUrl;
                } else {
                    throw new Error(localize('failedToGetUrl', 'Failed to retrieve endpoint URL.'));
                }
            } else {
                throw new Error(localize('failedToFindNode', 'Failed to find Event Grid Subscription with id "{0}".', eventGenerator.destination.eventSubscriptionId));
            }
        }
    }

    throw new Error(localize('destinationRequired', 'You must specify either an "endpointUrl" or "eventSubscriptionId" as the destination.'));
}
