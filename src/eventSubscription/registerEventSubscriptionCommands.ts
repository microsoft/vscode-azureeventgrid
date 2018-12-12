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
import { createMockEventGenerator } from './commands/mock/createMockEventGenerator';
import { MockCodeLensProvider } from './commands/mock/MockCodeLensProvider';
import { previewEvents } from './commands/mock/previewEvents';
import { sendEvents } from './commands/mock/sendEvents';
import { EventSubscriptionProvider } from './tree/EventSubscriptionProvider';
import { EventSubscriptionTreeItem } from './tree/EventSubscriptionTreeItem';

export function registerEventSubscriptionCommands(): void {
    ext.eventSubscriptionTree = new AzureTreeDataProvider(EventSubscriptionProvider, 'azureEventGridSubscription.loadMore');
    ext.context.subscriptions.push(ext.eventSubscriptionTree);
    ext.context.subscriptions.push(vscode.window.registerTreeDataProvider('azureEventGridSubscriptionExplorer', ext.eventSubscriptionTree));

    ext.context.subscriptions.push(vscode.languages.registerCodeLensProvider({ pattern: '**/*.[eE][vV][eE][nN][tT][gG][eE][nN][eE][rR][aA][tT][oO][rR].[jJ][sS][oO]{[nN],[nN][cC]}' }, new MockCodeLensProvider()));

    registerCommand('azureEventGridSubscription.refresh', async (node?: AzureTreeItem) => await ext.eventSubscriptionTree.refresh(node));
    registerCommand('azureEventGridSubscription.loadMore', async (node: AzureTreeItem) => await ext.eventSubscriptionTree.loadMore(node));
    registerCommand('azureEventGridSubscription.openInPortal', async (node?: AzureTreeItem) => await openInPortal(ext.eventSubscriptionTree, EventSubscriptionTreeItem.contextValue, node));
    registerCommand('azureEventGridSubscription.deleteEventSubscription', async (node?: AzureTreeItem) => await deleteNode(ext.eventSubscriptionTree, EventSubscriptionTreeItem.contextValue, node));
    registerCommand('azureEventGridSubscription.createEventSubscription', async function (this: IActionContext, node?: AzureParentTreeItem): Promise<void> { await createChildNode(this, ext.eventSubscriptionTree, SubscriptionTreeItem.contextValue, node); });
    registerCommand('azureEventGridSubscription.createMockEventGenerator', async function (this: IActionContext, node?: EventSubscriptionTreeItem): Promise<void> { await createMockEventGenerator(this, node); });
    registerCommand('azureEventGridSubscription.sendEvents', async (uri: vscode.Uri) => await sendEvents(uri));
    registerCommand('azureEventGridSubscription.previewEvents', async (uri: vscode.Uri) => await previewEvents(uri));
}
