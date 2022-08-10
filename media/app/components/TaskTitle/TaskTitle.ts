import { marked } from 'marked';
import { mapStores } from 'pinia';
import { defineComponent, h, VNodeArrayChildren } from 'vue';
import { useStore } from '../../store';
import { dendronLinkTokenizer } from '../Tokenizers/dendronLinkTokenizer';

// @ts-ignore
// TODO: type safe
// TODO: 为什么必须在这里 (media/app/TaskTitle) 使用 tokenizer 才会生效，在 (src/extension.ts) 却不会， marked.use() 不是全局生效的吗？
marked.use({ tokenizer: dendronLinkTokenizer });

export default defineComponent({
	name: 'TaskTitle',
	props: {
		stuff: {
			required: true,
			default: '',
			type: String,
		},
	},
	data: () => ({}),
	computed: {
		...mapStores(useStore),
	},
	methods: {
		updateFilterValue(e: MouseEvent) {
			const newValue: string | undefined = (e.target as HTMLElement)?.innerText;
			if (!newValue) {
				return;
			}
			if (e.ctrlKey) {
				this.storeStore.updateFilterValue(newValue, true);
			} else {
				this.storeStore.updateFilterValue(newValue);
			}
			this.storeStore.focusFilterInput();
		},
		styleForTag(tag: string) {
			if (tag in this.storeStore.config.tagStyles) {
				return this.storeStore.config.tagStyles[tag];
			}
			return undefined;
		},
	},
	render() {
		const returnEl = h('span', {}, []);
		const words = this.stuff.split(' ');
		const currentWords = [];

		const updateFilterValue = this.updateFilterValue;

		for (const word of words) {
			if (
				word.length > 1 &&
				(word[0] === '#' || word[0] === '+' || word[0] === '@')
			) {
				const currentWordsAsText = `${currentWords.join(' ')} `;
				currentWords.length = 0;
				(returnEl.children as VNodeArrayChildren)?.push(h('span', {
					innerHTML: marked(currentWordsAsText),
				}));

				let style;
				if (word[0] === '#') {
					style = this.styleForTag(word.slice(1));
				}

				(returnEl.children as VNodeArrayChildren)?.push(h('span', {
					class: word[0] === '#' ? 'task__tag' : word[0] === '+' ? 'task__project' : 'task__context',
					style,
					innerText: word,
					onClick(event: MouseEvent) {
						updateFilterValue(event);
					},
				}));

				(returnEl.children as VNodeArrayChildren)?.push(h('span', ' '));
			} else {
				currentWords.push(word);
			}
		}

		const currentWordsAsText = currentWords.join(' ');

		(returnEl.children as VNodeArrayChildren)?.push(h('span', {
			innerHTML: marked(currentWordsAsText),
		}));

		return returnEl;
	},
});
