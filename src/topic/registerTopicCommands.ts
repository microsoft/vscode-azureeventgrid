/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { AzureTreeDataProvider, IActionContext, IAzureNode, IAzureParentNode } from 'vscode-azureextensionui';
import { createChildNode } from '../commands/createChildNode';
import { deleteNode } from '../commands/deleteNode';
import { openInPortal } from '../commands/openInPortal';
import { ext } from '../extensionVariables';
import { TopicProvider } from './tree/TopicProvider';
import { TopicTreeItem } from './tree/TopicTreeItem';

export function registerTopicCommands(): void {
    ext.topicTree = new AzureTreeDataProvider(new TopicProvider(), 'azureEventGridTopic.loadMore', ext.ui, ext.reporter);
    ext.context.subscriptions.push(ext.topicTree);
    ext.context.subscriptions.push(vscode.window.registerTreeDataProvider('azureEventGridTopicExplorer', ext.topicTree));

    ext.actionHandler.registerCommand('azureEventGridTopic.refresh', async (node?: IAzureNode) => await ext.topicTree.refresh(node));
    ext.actionHandler.registerCommand('azureEventGridTopic.loadMore', async (node: IAzureNode) => await ext.topicTree.loadMore(node));
    ext.actionHandler.registerCommand('azureEventGridTopic.openInPortal', async (node?: IAzureNode) => await openInPortal(ext.topicTree, TopicTreeItem.contextValue, node));
    ext.actionHandler.registerCommand('azureEventGridTopic.deleteTopic', async (node?: IAzureNode) => await deleteNode(ext.topicTree, TopicTreeItem.contextValue, node));
    ext.actionHandler.registerCommand('azureEventGridTopic.createTopic', async function (this: IActionContext, node?: IAzureParentNode): Promise<void> { await createChildNode(this, ext.topicTree, AzureTreeDataProvider.subscriptionContextValue, node); });
}
