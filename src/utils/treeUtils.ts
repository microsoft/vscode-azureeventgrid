/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from 'path';

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
}
