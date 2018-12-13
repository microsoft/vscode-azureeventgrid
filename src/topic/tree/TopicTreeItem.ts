/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { EventGridManagementClient } from 'azure-arm-eventgrid';
import { Topic } from 'azure-arm-eventgrid/lib/models';
import * as vscode from 'vscode';
import { AzureTreeItem, createAzureClient, DialogResponses } from 'vscode-azureextensionui';
import { ext } from '../../extensionVariables';
import { azureUtils } from '../../utils/azureUtils';
import { ArgumentError } from '../../utils/errors';
import { localize } from '../../utils/localize';
import { treeUtils } from '../../utils/treeUtils';
import { TopicProvider } from './TopicProvider';

export class TopicTreeItem extends AzureTreeItem {
    public static contextValue: string = 'azureEventGridTopic';
    public readonly contextValue: string = TopicTreeItem.contextValue;
    public readonly id: string;

    private readonly _name: string;
    private readonly _resourceGroup: string;

    public constructor(parent: TopicProvider, topic: Topic) {
        super(parent);
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

    public async deleteTreeItemImpl(): Promise<void> {
        const message: string = localize('confirmDelete', 'Are you sure you want to delete topic "{0}"?', this._name);
        await ext.ui.showWarningMessage(message, { modal: true }, DialogResponses.deleteResponse, DialogResponses.cancel);

        const client: EventGridManagementClient = createAzureClient(this.root, EventGridManagementClient);
        await vscode.window.withProgress({ title: localize('deleting', 'Deleting topic "{0}"...', this._name), location: vscode.ProgressLocation.Notification }, async () => {
            await client.topics.deleteMethod(this._resourceGroup, this._name);
        });
        vscode.window.showInformationMessage(localize('successfullyDeleted', 'Successfully deleted topic "{0}".', this._name));
    }
}
