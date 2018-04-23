/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ExtensionContext, OutputChannel } from "vscode";
import { AzureActionHandler, AzureTreeDataProvider, IAzureUserInput } from "vscode-azureextensionui";
import TelemetryReporter from "vscode-extension-telemetry";

/**
 * Namespace for common variables used throughout the extension. They must be initialized in the activate() method of extension.ts
 */
export namespace ext {
    export let outputChannel: OutputChannel;
    export let ui: IAzureUserInput;
    export let reporter: TelemetryReporter | undefined;
    export let actionHandler: AzureActionHandler;
    export let context: ExtensionContext;
    export let topicTree: AzureTreeDataProvider;
    export let eventSubscriptionTree: AzureTreeDataProvider;
}
