/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// tslint:disable-next-line:no-require-imports
import EventGridManagementClient = require('azure-arm-eventgrid');
import { EventSubscription } from 'azure-arm-eventgrid/lib/models';
import { SubscriptionClient } from 'azure-arm-resource';
import { Location } from 'azure-arm-resource/lib/subscription/models';
import { IAzureNode, IAzureTreeItem, IChildProvider } from 'vscode-azureextensionui';
import { localize } from '../../utils/localize';
import { treeUtils } from '../../utils/treeUtils';
import { EventSubscriptionTreeItem } from './EventSubscriptionTreeItem';

export class EventSubscriptionProvider implements IChildProvider {
    public readonly childTypeLabel: string = localize('eventSubscription', 'Event Subscription');

    public hasMoreChildren(): boolean {
        return false;
    }

    public async loadMoreChildren(node: IAzureNode): Promise<IAzureTreeItem[]> {
        const client: EventGridManagementClient = treeUtils.getEventGridClient(node);

        // There is no "listAll" method - we have to list individually by location
        const listByLocationTasks: Promise<EventSubscription[]>[] = (await listLocations(node)).map(async (location: Location) => {
            try {
                // tslint:disable-next-line:no-non-null-assertion
                return await client.eventSubscriptions.listRegionalBySubscription(location.name!);
            } catch (error) {
                // Ignore errors for regions where EventGrid is not supported
                // tslint:disable-next-line:no-unsafe-any
                if (error && error.code === 'NoRegisteredProviderFound') {
                    return [];
                } else {
                    throw error;
                }
            }
        });
        const eventSubscriptions: EventSubscription[] = (<EventSubscription[]>[]).concat(...(await Promise.all([client.eventSubscriptions.listGlobalBySubscription()].concat(...listByLocationTasks))));
        return eventSubscriptions.map((es: EventSubscription) => new EventSubscriptionTreeItem(es));
    }
}

async function listLocations(node: IAzureNode): Promise<Location[]> {
    const client: SubscriptionClient = new SubscriptionClient(node.credentials);
    // tslint:disable-next-line:no-non-null-assertion
    return await client.subscriptions.listLocations(node.subscription.subscriptionId!);
}
