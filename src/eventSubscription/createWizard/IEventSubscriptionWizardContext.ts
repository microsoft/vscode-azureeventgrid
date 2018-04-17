/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { EventSubscription } from "azure-arm-eventgrid/lib/models";
import { IRelatedNameWizardContext, ISubscriptionWizardContext } from "vscode-azureextensionui";
import { TopicType } from "./TopicTypeStep";

export interface IEventSubscriptionWizardContext extends ISubscriptionWizardContext, IRelatedNameWizardContext {
    eventSubscription?: EventSubscription;

    newEventSubscriptionName?: string;
    topicType?: TopicType;
    endpointUrl?: string;
}
