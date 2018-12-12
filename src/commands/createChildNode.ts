/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureParentTreeItem, AzureTreeDataProvider, IActionContext } from 'vscode-azureextensionui';

export async function createChildNode(actionContext: IActionContext, tree: AzureTreeDataProvider, expectedContextValue: string, node?: AzureParentTreeItem): Promise<void> {
    if (!node) {
        node = <AzureParentTreeItem>await tree.showTreeItemPicker(expectedContextValue);
    }

    await node.createChild(actionContext);
}
