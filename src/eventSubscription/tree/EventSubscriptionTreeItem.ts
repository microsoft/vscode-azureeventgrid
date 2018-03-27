/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// tslint:disable-next-line:no-require-imports
import EventGridManagementClient = require('azure-arm-eventgrid');
import { EventSubscription } from 'azure-arm-eventgrid/lib/models';
import { DialogResponses, IAzureNode, IAzureTreeItem } from 'vscode-azureextensionui';
import { extensionOutputChannel } from '../../extension';
import { ArgumentError } from '../../utils/errors';
import { localize } from '../../utils/localize';
import { treeUtils } from '../../utils/treeUtils';

export class EventSubscriptionTreeItem implements IAzureTreeItem {
    public static contextValue: string = 'azureEventGridSubscription';
    public readonly contextValue: string = EventSubscriptionTreeItem.contextValue;
    public readonly id: string;

    private readonly _name: string;
    private readonly _topic: string;

    public constructor(eventSubscription: EventSubscription) {
        if (!eventSubscription.id || !eventSubscription.name || !eventSubscription.topic) {
            throw new ArgumentError(eventSubscription);
        }

        this.id = eventSubscription.id;
        this._name = eventSubscription.name;
        this._topic = eventSubscription.topic;
    }

    public get label(): string {
        return this._name;
    }

    public get iconPath(): string {
        return treeUtils.getIconPath(EventSubscriptionTreeItem.contextValue);
    }

    public async deleteTreeItem(node: IAzureNode<EventSubscriptionTreeItem>): Promise<void> {
        const message: string = localize('confirmDelete', 'Are you sure you want to delete event subscription "{0}"?', this._name);
        await node.ui.showWarningMessage(message, DialogResponses.deleteResponse, DialogResponses.cancel);

        extensionOutputChannel.show(true);
        extensionOutputChannel.appendLine(localize('deleting', 'Deleting event subscription "{0}"...', this._name));
        const client: EventGridManagementClient = new EventGridManagementClient(node.credentials, node.subscriptionId);
        await client.eventSubscriptions.deleteMethod(this._topic, this._name);
        extensionOutputChannel.appendLine(localize('successfullyDeleted', 'Successfully deleted event subscription "{0}".', this._name));
    }
}
