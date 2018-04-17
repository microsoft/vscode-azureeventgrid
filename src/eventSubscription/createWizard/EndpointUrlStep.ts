/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureWizardPromptStep, IAzureUserInput } from 'vscode-azureextensionui';
import { localize } from '../../utils/localize';
import { IEventSubscriptionWizardContext } from "./IEventSubscriptionWizardContext";

export class EndpointUrlStep extends AzureWizardPromptStep<IEventSubscriptionWizardContext> {
    public async prompt(wizardContext: IEventSubscriptionWizardContext, ui: IAzureUserInput): Promise<IEventSubscriptionWizardContext> {
        if (!wizardContext.endpointUrl) {
            wizardContext.endpointUrl = (await ui.showInputBox({
                placeHolder: localize('urlPlaceholder', 'Subscriber Endpoint'),
                prompt: localize('urlPrompt', 'Provide a subscriber endpoint.')
            })).trim();
        }

        return wizardContext;
    }
}
