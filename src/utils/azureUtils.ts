/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { EventGridManagementClient } from "azure-arm-eventgrid";
import { addExtensionUserAgent, IAzureNode, ISubscriptionWizardContext } from "vscode-azureextensionui";
import { localize } from "./localize";

export namespace azureUtils {
    function parseResourceId(id: string): RegExpMatchArray {
        const matches: RegExpMatchArray | null = id.match(/\/subscriptions\/(.*)\/resourceGroups\/(.*)\/providers\/(.*)\/(.*)/);

        if (matches === null || matches.length < 3) {
            throw new Error(localize('invalidResourceId', 'Invalid Azure Resource Id'));
        }

        return matches;
    }

    export function getResourceGroupFromId(id: string): string {
        return parseResourceId(id)[2];
    }

    export function getEventGridManagementClient(nodeOrContext: IAzureNode | ISubscriptionWizardContext): EventGridManagementClient {
        const client: EventGridManagementClient = new EventGridManagementClient(nodeOrContext.credentials, nodeOrContext.subscriptionId, nodeOrContext.environment.resourceManagerEndpointUrl);
        addExtensionUserAgent(client);
        return client;
    }
}
