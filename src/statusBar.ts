import { statusBarEntry, state } from './extension';

export function showStatusBarEntry() {
	statusBarEntry.show();
}
export function hideStatusBarEntry() {
	statusBarEntry.hide();
}
export function updateStatusBarEntry() {
	if (statusBarEntry) {
		const completedTasks = state.tasks.filter(t => t.done);
		statusBarEntry.text = `( ${completedTasks.length} / ${state.tasks.length} )`;
	}
}