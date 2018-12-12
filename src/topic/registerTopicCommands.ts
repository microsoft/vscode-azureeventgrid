/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { AzureParentTreeItem, AzureTreeDataProvider, AzureTreeItem, IActionContext, registerCommand, SubscriptionTreeItem } from 'vscode-azureextensionui';
import { createChildNode } from '../commands/createChildNode';
import { deleteNode } from '../commands/deleteNode';
import { openInPortal } from '../commands/openInPortal';
import { ext } from '../extensionVariables';
import { TopicProvider } from './tree/TopicProvider';
import { TopicTreeItem } from './tree/TopicTreeItem';

export function registerTopicCommands(): void {
    ext.topicTree = new AzureTreeDataProvider(TopicProvider, 'azureEventGridTopic.loadMore');
    ext.context.subscriptions.push(ext.topicTree);
    ext.context.subscriptions.push(vscode.window.registerTreeDataProvider('azureEventGridTopicExplorer', ext.topicTree));

    registerCommand('azureEventGridTopic.refresh', async (node?: AzureTreeItem) => await ext.topicTree.refresh(node));
    registerCommand('azureEventGridTopic.loadMore', async (node: AzureTreeItem) => await ext.topicTree.loadMore(node));
    registerCommand('azureEventGridTopic.openInPortal', async (node?: AzureTreeItem) => await openInPortal(ext.topicTree, TopicTreeItem.contextValue, node));
    registerCommand('azureEventGridTopic.deleteTopic', async (node?: AzureTreeItem) => await deleteNode(ext.topicTree, TopicTreeItem.contextValue, node));
    registerCommand('azureEventGridTopic.createTopic', async function (this: IActionContext, node?: AzureParentTreeItem): Promise<void> { await createChildNode(this, ext.topicTree, SubscriptionTreeItem.contextValue, node); });
}
