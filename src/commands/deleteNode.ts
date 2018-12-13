/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureTreeDataProvider, AzureTreeItem } from 'vscode-azureextensionui';

export async function deleteNode(tree: AzureTreeDataProvider, expectedContextValue: string, node?: AzureTreeItem): Promise<void> {
    if (!node) {
        node = await tree.showTreeItemPicker(expectedContextValue);
    }

    await node.deleteTreeItem();
}
