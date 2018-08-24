/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureNameStep, ResourceGroupListStep, resourceGroupNamingRules } from 'vscode-azureextensionui';
import { ext } from '../../extensionVariables';
import { localize } from '../../utils/localize';
import { IEventSubscriptionWizardContext } from "./IEventSubscriptionWizardContext";

export class EventSubscriptionNameStep extends AzureNameStep<IEventSubscriptionWizardContext> {
    public async prompt(wizardContext: IEventSubscriptionWizardContext): Promise<IEventSubscriptionWizardContext> {
        if (!wizardContext.newEventSubscriptionName) {
            const suggestedName: string | undefined = wizardContext.relatedNameTask ? await wizardContext.relatedNameTask : undefined;
            wizardContext.newEventSubscriptionName = (await ext.ui.showInputBox({
                value: suggestedName,
                placeHolder: localize('namePlaceholder', 'Event subscription name'),
                prompt: localize('namePrompt', 'Provide an event subscription name.'),
                validateInput: this.validateName
            })).trim();

            if (!wizardContext.relatedNameTask) {
                wizardContext.relatedNameTask = this.generateRelatedName(wizardContext, wizardContext.newEventSubscriptionName, resourceGroupNamingRules);
            }
        }

        return wizardContext;
    }

    protected async isRelatedNameAvailable(wizardContext: IEventSubscriptionWizardContext, name: string): Promise<boolean> {
        return ResourceGroupListStep.isNameAvailable(wizardContext, name);
    }

    private async validateName(name: string | undefined): Promise<string | undefined> {
        name = name ? name.trim() : '';

        const min: number = 3;
        const max: number = 64;
        if (name.length < min || name.length > max) {
            return localize('invalidLength', 'The name must be between {0} and {1} characters.', min, max);
        } else if (name.match(/[^a-zA-Z0-9\-]/) !== null) {
            return localize('invalidChars', "The name can only contain letters, numbers, and hyphens.");
        } else {
            return undefined;
        }
    }
}
