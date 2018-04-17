/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureTreeDataProvider, IActionContext, IAzureParentNode } from 'vscode-azureextensionui';

export async function createChildNode(actionContext: IActionContext, tree: AzureTreeDataProvider, expectedContextValue: string, node?: IAzureParentNode): Promise<void> {
    if (!node) {
        node = <IAzureParentNode>await tree.showNodePicker(expectedContextValue);
    }

    await node.createChild(actionContext);
}
