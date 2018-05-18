/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Uri, window } from "vscode";
import { fsUtils } from "../../../utils/fsUtils";
import { generateEvents } from "./generateEvents";
import { IMockEventGenerator } from "./IMockEventGenerator";

export async function previewEvents(uri: Uri): Promise<void> {
    const [events]: [{}[], IMockEventGenerator] = await generateEvents(uri);
    const viewColumn: number | undefined = window.activeTextEditor !== undefined && window.activeTextEditor.viewColumn !== undefined ? window.activeTextEditor.viewColumn + 1 : undefined;
    await fsUtils.showNewFile(JSON.stringify(events, undefined, 2), 'eventsPreview', '.json', viewColumn);
}
