/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { EventGridManagementClient } from 'azure-arm-eventgrid';
import { Topic, TopicsListResult } from 'azure-arm-eventgrid/lib/models';
import * as vscode from 'vscode';
import { AzureWizard, createAzureClient, IActionContext, LocationListStep, ResourceGroupListStep, SubscriptionTreeItem } from 'vscode-azureextensionui';
import { localize } from '../../utils/localize';
import { ITopicWizardContext } from '../createWizard/ITopicWizardContext';
import { TopicCreateStep } from '../createWizard/TopicCreateStep';
import { TopicNameStep } from '../createWizard/TopicNameStep';
import { TopicTreeItem } from './TopicTreeItem';

export class TopicProvider extends SubscriptionTreeItem {
    public readonly childTypeLabel: string = localize('topic', 'Topic');

    public hasMoreChildrenImpl(): boolean {
        return false;
    }

    public async loadMoreChildrenImpl(_clearCache: boolean): Promise<TopicTreeItem[]> {
        const client: EventGridManagementClient = createAzureClient(this.root, EventGridManagementClient);
        const topics: TopicsListResult = await client.topics.listBySubscription();
        return topics.map((topic: Topic) => new TopicTreeItem(this, topic));
    }

    public async createChildImpl(showCreatingNode: (label: string) => void, actionContext?: IActionContext): Promise<TopicTreeItem> {
        const wizardContext: ITopicWizardContext = Object.assign({}, this.root);

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

        await wizard.prompt(actionContext);
        // tslint:disable-next-line:no-non-null-assertion
        showCreatingNode(wizardContext.newTopicName!);
        const message: string = localize('creatingTopic', 'Creating topic "{0}"...', wizardContext.newTopicName);
        await vscode.window.withProgress({ title: message, location: vscode.ProgressLocation.Notification }, async () => {
            // tslint:disable-next-line:no-non-null-assertion
            await wizard.execute(actionContext!);
        });
        // tslint:disable-next-line:no-non-null-assertion
        return new TopicTreeItem(this, wizardContext.topic!);
    }
}
