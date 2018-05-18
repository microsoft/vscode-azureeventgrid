/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken, CodeLens, CodeLensProvider, Event, Position, Range, TextDocument } from 'vscode';
import { localize } from '../../../utils/localize';

export class MockCodeLensProvider implements CodeLensProvider {
    public onDidChangeCodeLenses?: Event<void> | undefined;

    public async provideCodeLenses(document: TextDocument, _token: CancellationToken): Promise<CodeLens[]> {
        return [
            {
                command: {
                    title: localize('sendEvents', 'Send Events'),
                    command: 'azureEventGridSubscription.sendEvents',
                    arguments: [document.uri]
                },
                range: new Range(new Position(0, 0), new Position(0, 0)),
                isResolved: true
            },
            {
                command: {
                    title: localize('previewEvents', 'Preview Events'),
                    command: 'azureEventGridSubscription.previewEvents',
                    arguments: [document.uri]
                },
                range: new Range(new Position(0, 0), new Position(0, 0)),
                isResolved: true
            }
        ];
    }
}
