/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { EventGridManagementClient } from 'azure-arm-eventgrid';
import { Topic } from 'azure-arm-eventgrid/lib/models';
import { createAzureClient, DialogResponses, IAzureNode, IAzureTreeItem } from 'vscode-azureextensionui';
import { ext } from '../../extensionVariables';
import { azureUtils } from '../../utils/azureUtils';
import { ArgumentError } from '../../utils/errors';
import { localize } from '../../utils/localize';
import { treeUtils } from '../../utils/treeUtils';

export class TopicTreeItem implements IAzureTreeItem {
    public static contextValue: string = 'azureEventGridTopic';
    public readonly contextValue: string = TopicTreeItem.contextValue;
    public readonly id: string;

    private readonly _name: string;
    private readonly _resourceGroup: string;

    public constructor(topic: Topic) {
        if (!topic.id || !topic.name) {
            throw new ArgumentError(topic);
        }

        this.id = topic.id;
        this._name = topic.name;
        this._resourceGroup = azureUtils.getResourceGroupFromId(topic.id);
    }

    public get label(): string {
        return this._name;
    }

    public get iconPath(): string {
        return treeUtils.getIconPath(TopicTreeItem.contextValue);
    }

    public async deleteTreeItem(node: IAzureNode<TopicTreeItem>): Promise<void> {
        const message: string = localize('confirmDelete', 'Are you sure you want to delete topic "{0}"?', this._name);
        await ext.ui.showWarningMessage(message, { modal: true }, DialogResponses.deleteResponse, DialogResponses.cancel);

        ext.outputChannel.show(true);
        ext.outputChannel.appendLine(localize('deleting', 'Deleting topic "{0}"...', this._name));
        const client: EventGridManagementClient = createAzureClient(node, EventGridManagementClient);
        await client.topics.deleteMethod(this._resourceGroup, this._name);
        ext.outputChannel.appendLine(localize('successfullyDeleted', 'Successfully deleted topic "{0}".', this._name));
    }
}
