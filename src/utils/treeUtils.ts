/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// tslint:disable-next-line:no-require-imports
import EventGridManagementClient = require('azure-arm-eventgrid');
import * as path from 'path';
import { IAzureNode } from 'vscode-azureextensionui';
import { ArgumentError } from './errors';

export namespace treeUtils {
    export interface IThemedIconPath {
        light: string;
        dark: string;
    }

    export function getIconPath(iconName: string): string {
        return path.join(__filename, '..', '..', '..', '..', 'resources', `${iconName}.svg`);
    }

    export function getThemedIconPath(iconName: string): IThemedIconPath {
        return {
            light: path.join(__filename, '..', '..', '..', '..', 'resources', 'light', `${iconName}.svg`),
            dark: path.join(__filename, '..', '..', '..', '..', 'resources', 'dark', `${iconName}.svg`)
        };
    }

    export function getEventGridClient(node: IAzureNode): EventGridManagementClient {
        if (node.subscription.subscriptionId) {
            return new EventGridManagementClient(node.credentials, node.subscription.subscriptionId);
        } else {
            throw new ArgumentError(node.subscription);
        }
    }
}
