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
import { ArgumentError } from '../../../utils/errors';
import { localize } from '../../../utils/localize';
import { EventSubscriptionTreeItem } from '../../tree/EventSubscriptionTreeItem';
import { IMockEventGenerator } from "../mock/IMockEventGenerator";
import { generateEvents } from './generateEvents';

export async function sendEvents(uri: Uri): Promise<void> {
    const message: string = localize('sending', 'Sending events...');
    await window.withProgress({ location: ProgressLocation.Notification, title: message }, async (progress: Progress<{}>): Promise<void> => {
        progress.report({
            percentage: 10,
            message: localize('generating', 'Generating events...')
        });
        const [events, eventGenerator]: [{}[], IMockEventGenerator] = await generateEvents(uri);

        progress.report({
            percentage: 25,
            message: localize('querying', 'Querying for Event Subscription endpoint...')
        });

        const node: IAzureNode | undefined = await ext.eventSubscriptionTree.findNode(eventGenerator.eventSubscriptionId);
        if (node) {
            const treeItem: EventSubscriptionTreeItem = <EventSubscriptionTreeItem>node.treeItem;
            const client: EventGridManagementClient = new EventGridManagementClient(node.credentials, node.subscriptionId);
            const url: EventSubscriptionFullUrl = await client.eventSubscriptions.getFullUrl(treeItem.topic, treeItem.name);

            if (url.endpointUrl) {
                progress.report({
                    percentage: 75,
                    message: message
                });
                await <Thenable<void>>requestP.post(
                    // tslint:disable-next-line:no-non-null-assertion
                    url.endpointUrl!,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'aeg-event-type': 'Notification'
                        },
                        body: JSON.stringify(events)
                    }
                );

                window.showInformationMessage(localize('sent', 'Successfully sent events.'));
            } else {
                throw new ArgumentError(url);
            }
        } else {
            throw new Error(localize('failedToFindNode', 'Failed to find Event Grid Subscription with id "{0}".', eventGenerator.eventSubscriptionId));
        }
    });
}
