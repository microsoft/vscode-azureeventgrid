/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { AzureActionHandler, AzureTreeDataProvider, IAzureNode, IAzureUserInput } from 'vscode-azureextensionui';
import TelemetryReporter from 'vscode-extension-telemetry';
import { deleteNode } from '../commands/deleteNode';
import { openInPortal } from '../commands/openInPortal';
import { EventSubscriptionProvider } from './tree/EventSubscriptionProvider';
import { EventSubscriptionTreeItem } from './tree/EventSubscriptionTreeItem';

export function registerEventSubscriptionCommands(context: vscode.ExtensionContext, actionHandler: AzureActionHandler, ui: IAzureUserInput, reporter: TelemetryReporter | undefined): void {
    const tree: AzureTreeDataProvider = new AzureTreeDataProvider(new EventSubscriptionProvider(), 'azureEventGridSubscription.loadMore', ui, reporter);
    context.subscriptions.push(tree);
    context.subscriptions.push(vscode.window.registerTreeDataProvider('azureEventGridSubscriptionExplorer', tree));

    actionHandler.registerCommand('azureEventGridSubscription.refresh', async (node?: IAzureNode) => await tree.refresh(node));
    actionHandler.registerCommand('azureEventGridSubscription.loadMore', async (node: IAzureNode) => await tree.loadMore(node));
    actionHandler.registerCommand('azureEventGridSubscription.openInPortal', async (node?: IAzureNode) => await openInPortal(tree, EventSubscriptionTreeItem.contextValue, node));
    actionHandler.registerCommand('azureEventGridSubscription.deleteEventSubscription', async (node?: IAzureNode) => await deleteNode(tree, EventSubscriptionTreeItem.contextValue, node));
}
