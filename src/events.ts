import { window, workspace } from 'vscode';
import * as vscode from 'vscode';
import { G, globalState, LAST_VISIT_STORAGE_KEY, config, updateState, state } from './extension';
import { updateCompletions } from './completionProviders';
import { showStatusBarEntry, updateStatusBarEntry, hideStatusBarEntry } from './statusBar';
import { updateEditorDecorations } from './decorations';
import { updateAllTreeViews } from './treeViewProviders/treeViews';
import { resetAllRecurringTasks } from './commands';
import { setContext } from './vscodeUtils';
import dayjs from 'dayjs';

export const THE_RIGHT_FILE = 'todomd:isActive';

export function onChangeActiveTextEditor(editor: vscode.TextEditor | undefined): void {
	if (isTheRightFileFormat(editor)) {
		enterTheRightFile(editor!);
	} else {
		if (state.theRightFileOpened) {
			exitTheRightFile();
		}
	}
}

export function checkIfNewDayArrived(): boolean {
	const lastVisit = globalState.get<string | undefined>(LAST_VISIT_STORAGE_KEY);
	if (lastVisit && !dayjs().isSame(lastVisit, 'day')) {
		// window.showInformationMessage('new day');
		globalState.update(LAST_VISIT_STORAGE_KEY, new Date());
		state.newDayArrived = true;
		state.fileWasReset = false;
		return true;
	}
	// first visit ever?
	if (!lastVisit) {
		// window.showInformationMessage('first ever visit');
		globalState.update(LAST_VISIT_STORAGE_KEY, new Date());
	}
	return false;
}

export function onChangeTextDocument(): void {
	const activeTextEditor = window.activeTextEditor;
	if (activeTextEditor && state.theRightFileOpened) {
		updateEverything(activeTextEditor);
	}
}

export function isTheRightFileFormat(editor?: vscode.TextEditor): boolean {
	if (editor === undefined) {
		editor = window.activeTextEditor;
		if (editor === undefined) {
			return false;
		}
	}
	const documentFilter: vscode.DocumentFilter = {
		pattern: config.activatePattern,
	};
	return vscode.languages.match(documentFilter, editor.document) !== 0;
}
export function enterTheRightFile(editor: vscode.TextEditor) {
	state.theRightFileOpened = true;
	updateEverything(editor);
	G.changeTextDocumentDisposable = workspace.onDidChangeTextDocument(onChangeTextDocument);
	updateCompletions();
	showStatusBarEntry();
	updateStatusBarEntry();
	checkIfNewDayArrived();
	if (state.newDayArrived && !state.fileWasReset) {
		// vscode.window.showInformationMessage('SHOULD RESET ALL IN FILE');
		resetAllRecurringTasks(editor);
		state.fileWasReset = true;
	}
	setContext(THE_RIGHT_FILE, true);
}
export async function exitTheRightFile() {
	state.theRightFileOpened = false;
	if (G.changeTextDocumentDisposable) {
		G.changeTextDocumentDisposable.dispose();
	}
	if (G.contextAutocompleteDisposable) {
		G.contextAutocompleteDisposable.dispose();
		G.tagAutocompleteDisposable.dispose();
		G.projectAutocompleteDisposable.dispose();
		G.generalAutocompleteDisposable.dispose();
	}
	hideStatusBarEntry();
	setContext(THE_RIGHT_FILE, false);
	await updateState();
	updateAllTreeViews();
}

export async function updateEverything(editor?: vscode.TextEditor) {
	if (!editor) {
		return;
	}
	await updateState(editor.document);
	updateEditorDecorations(editor);
	updateStatusBarEntry();
	updateAllTreeViews();
}
