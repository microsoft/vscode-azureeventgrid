/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// tslint:disable-next-line:no-require-imports
import EventGridManagementClient = require('azure-arm-eventgrid');
import { Topic, TopicsListResult } from 'azure-arm-eventgrid/lib/models';
import { AzureWizard, IActionContext, IAzureNode, IAzureTreeItem, IChildProvider, LocationListStep, ResourceGroupListStep } from 'vscode-azureextensionui';
import { ext } from '../../extensionVariables';
import { localize } from '../../utils/localize';
import { ITopicWizardContext } from '../createWizard/ITopicWizardContext';
import { TopicCreateStep } from '../createWizard/TopicCreateStep';
import { TopicNameStep } from '../createWizard/TopicNameStep';
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

    public async createChild(node: IAzureNode, showCreatingNode: (label: string) => void, actionContext?: IActionContext): Promise<IAzureTreeItem> {
        const wizardContext: ITopicWizardContext = {
            credentials: node.credentials,
            subscriptionId: node.subscriptionId,
            subscriptionDisplayName: node.subscriptionDisplayName
        };

        const wizard: AzureWizard<ITopicWizardContext> = new AzureWizard(
            [
                new TopicNameStep(),
                new ResourceGroupListStep(),
                new LocationListStep()
            ],
            [
                new TopicCreateStep()
            ],
            wizardContext
        );

        // https://github.com/Microsoft/vscode-azuretools/issues/120
        // tslint:disable-next-line:strict-boolean-expressions
        actionContext = actionContext || <IActionContext>{ properties: {}, measurements: {} };

        await wizard.prompt(actionContext, ext.ui);
        // tslint:disable-next-line:no-non-null-assertion
        showCreatingNode(wizardContext.newTopicName!);
        await wizard.execute(actionContext, ext.outputChannel);
        // tslint:disable-next-line:no-non-null-assertion
        return new TopicTreeItem(wizardContext.topic!);
    }
}
