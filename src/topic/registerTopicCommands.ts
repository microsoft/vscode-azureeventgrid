/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { AzureActionHandler, AzureTreeDataProvider, IAzureNode, IAzureUserInput } from 'vscode-azureextensionui';
import TelemetryReporter from 'vscode-extension-telemetry';
import { deleteNode } from '../commands/deleteNode';
import { openInPortal } from '../commands/openInPortal';
import { TopicProvider } from './tree/TopicProvider';
import { TopicTreeItem } from './tree/TopicTreeItem';

export function registerTopicCommands(context: vscode.ExtensionContext, actionHandler: AzureActionHandler, ui: IAzureUserInput, reporter: TelemetryReporter | undefined): void {
    const tree: AzureTreeDataProvider = new AzureTreeDataProvider(new TopicProvider(), 'azureEventGridTopic.loadMore', ui, reporter);
    context.subscriptions.push(tree);
    context.subscriptions.push(vscode.window.registerTreeDataProvider('azureEventGridTopicExplorer', tree));

    actionHandler.registerCommand('azureEventGridTopic.refresh', async (node?: IAzureNode) => await tree.refresh(node));
    actionHandler.registerCommand('azureEventGridTopic.loadMore', async (node: IAzureNode) => await tree.loadMore(node));
    actionHandler.registerCommand('azureEventGridTopic.openInPortal', async (node?: IAzureNode) => await openInPortal(tree, TopicTreeItem.contextValue, node));
    actionHandler.registerCommand('azureEventGridTopic.deleteTopic', async (node?: IAzureNode) => await deleteNode(tree, TopicTreeItem.contextValue, node));
}
