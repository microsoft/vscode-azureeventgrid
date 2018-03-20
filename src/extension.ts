/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as vscode from 'vscode';
import { AzureActionHandler, AzureUserInput, callWithTelemetryAndErrorHandling, IActionContext, IAzureUserInput } from 'vscode-azureextensionui';
import TelemetryReporter from 'vscode-extension-telemetry';
import { registerEventSubscriptionCommands } from './eventSubscription/registerEventSubscriptionCommands';
import { registerTopicCommands } from './topic/registerTopicCommands';

export let extensionOutputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext): void {
    let reporter: TelemetryReporter | undefined;
    try {
        // tslint:disable-next-line:non-literal-require no-unsafe-any
        const packageInfo: IPackageInfo = require(context.asAbsolutePath('./package.json'));
        reporter = new TelemetryReporter(packageInfo.name, packageInfo.version, packageInfo.aiKey);
    } catch (error) {
        // swallow exceptions so that telemetry doesn't affect user
    }

    extensionOutputChannel = vscode.window.createOutputChannel('Azure Event Grid');
    context.subscriptions.push(extensionOutputChannel);

    // tslint:disable-next-line:no-floating-promises
    callWithTelemetryAndErrorHandling('azureEventGrid.activate', reporter, extensionOutputChannel, async function (this: IActionContext): Promise<void> {
        this.properties.isActivationEvent = 'true';
        const ui: IAzureUserInput = new AzureUserInput(context.globalState);
        const actionHandler: AzureActionHandler = new AzureActionHandler(context, extensionOutputChannel, reporter);

        registerTopicCommands(context, actionHandler, ui, reporter);
        registerEventSubscriptionCommands(context, actionHandler, ui, reporter);

        actionHandler.registerCommand('azureEventGrid.selectSubscriptions', async () => await vscode.commands.executeCommand('azure-account.selectSubscriptions'));
    });
}

// tslint:disable-next-line:no-empty
export function deactivate(): void {
}

interface IPackageInfo {
    name: string;
    version: string;
    aiKey: string;
}
