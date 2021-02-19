import vscode, { ConfigurationTarget, Uri, workspace } from 'vscode';
import { Link } from '../TheTask';
import { VscodeContext } from '../types';

/**
 * Create new untitled file with provided content and language;
 */
export async function openInUntitled(content: string, language?: string): Promise<void> {
	const document = await vscode.workspace.openTextDocument({
		language,
		content,
	});
	vscode.window.showTextDocument(document);
}
/**
 * Open file by absolute path in the editor(tab).
 */
export async function openFileInEditor(path: string) {
	const document = await vscode.workspace.openTextDocument(path);
	vscode.window.showTextDocument(document);
}
/**
 * Given only start and end lines - get the full Range with characters.
 */
export function getFullRangeFromLines(document: vscode.TextDocument, lineStart: number, lineEnd: number): vscode.Range {
	const lineAtTheEnd = document.lineAt(lineEnd);
	return new vscode.Range(lineStart, 0, lineEnd, lineAtTheEnd.range.end.character);
}
/**
 * Set vscode context.
 */
export async function setContext(context: VscodeContext, value: any) {
	return await vscode.commands.executeCommand('setContext', context, value);
}
/**
 * Open URL in default browser.
 */
export async function followLinks(links: Link[]) {
	let link: string | undefined = links[0].value;
	if (links.length > 1) {
		link = await vscode.window.showQuickPick(links.map(l => l.value));
		if (!link) {
			return;
		}
	}
	followLink(link);
}
/**
 * Opens a link externally using the default application.
 */
export async function followLink(linkString: string) {
	return await vscode.env.openExternal(Uri.parse(linkString));
}
/**
 * Open vscode Settings GUI with input value set to the specified value.
 */
export function openSettingGuiAt(settingName: string) {
	vscode.commands.executeCommand('workbench.action.openSettings', settingName);
}
/**
 * Vscode input has a noisy propmt.
 * This function makes some space between text and the prompt
 * by using several non-breaking spaces.
 */
export function inputOffset(text: string): string {
	return `${text}${' '.repeat(8)}`;
}
/**
 * Get word range, but using regexp defining word as a thing surrounded by spaces
 */
export function getWordRangeAtPosition(document: vscode.TextDocument, position: vscode.Position) {
	return document.getWordRangeAtPosition(position, /\S+/);
}
/**
 * Get a word at position (word delimiter is a whitespace)
 */
export function getWordAtPosition(document: vscode.TextDocument, position: vscode.Position) {
	const wordRange = getWordRangeAtPosition(document, position);
	if (wordRange) {
		return document.getText(wordRange);
	}
	return undefined;
}
/**
 * Updates global setting with new value.
 */
export async function updateSetting(settingName: string, newValue: unknown) {
	const settings = workspace.getConfiguration(undefined, null);
	return settings.update(settingName, newValue, ConfigurationTarget.Global);
}
