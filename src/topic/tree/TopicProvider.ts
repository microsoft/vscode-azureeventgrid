/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// tslint:disable-next-line:no-require-imports
import EventGridManagementClient = require('azure-arm-eventgrid');
import { Topic, TopicsListResult } from 'azure-arm-eventgrid/lib/models';
import { IAzureNode, IAzureTreeItem, IChildProvider } from 'vscode-azureextensionui';
import { localize } from '../../utils/localize';
import { TopicTreeItem } from './TopicTreeItem';

export class TopicProvider implements IChildProvider {
    public readonly childTypeLabel: string = localize('topic', 'Topic');

    public hasMoreChildren(): boolean {
        return false;
    }

    public async loadMoreChildren(node: IAzureNode): Promise<IAzureTreeItem[]> {
        const client: EventGridManagementClient = new EventGridManagementClient(node.credentials, node.subscriptionId);
        const topics: TopicsListResult = await client.topics.listBySubscription();
        return topics.map((topic: Topic) => new TopicTreeItem(topic));
    }
}
