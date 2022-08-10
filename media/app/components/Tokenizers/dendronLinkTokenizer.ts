/* eslint-disable */
// Create reference instance
// TODO: 考虑为 dendron link 撰写 custom extension https://marked.js.org/using_pro#extensions
export const dendronLinkTokenizer  = {
	link(src: string) {
		const match = src.match(
            // https://regex101.com/r/fwrEaz/1
            /(?:(?:(?:<([^ ]+)(?:.*)>)\[\[(?:<\/\1>))|(?:\[\[))(?:(?:(?:<([^ ]+)(?:.*)>)(.+?)(?:<\/\2>))|(.+?))(?:(?:(?:<([^ ]+)(?:.*)>)\]\](?:<\/\5>))|(?:\]\]))/
		);
		if (match) {
			/**webview 上点击实际跳转的链接 */
			let href = '';
			/**当 text 不存在时，webview 上显示可点击的标题 */
			let title = '';
			let raw = match[0]
			/**webview 上显示可点击的标题 */
			let text = match[4]
			if (text) {
				title = getLinkComponent(text).title;
				href = getLinkComponent(text).href;
				console.log('title', title)
				console.log('href',href)
			}
			return {
				type: 'link',
				raw,
				text: text + "test",
				href,
				title,
				tokens: [], //  NOTE: 必须要有
			};
		}

		// return false to use original codespan tokenizer
		return false;
	},
};

function getLinkComponent(source: string) {
	const alias = getAlias(source);
	const noteName = getNoteName(source);
	return {
		title: alias ? alias : noteName,
		href: getFileAbsolutePath(source),
	};
}


function getAlias(source: string) {
	const re = /[\w\W]+(?=\|)/; // https://regex101.com/r/TK8HYU/1
	// eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
	const parts = source.match(re) as string[] | null;
	if (parts) {
		return parts[0];
	}
}

function getNoteName(source: string) {
	const alias = getAlias(source);
	return cleanup(source)
		.replace(`${alias}|`, '')
		.split('.')
		.pop() as string
}


function getFileAbsolutePath(source: string) {
	const alias = getAlias(source);
	// TODO: 该处应由用户自行配置
	const prefix = ""
	const path = (prefix + cleanup(source)
		.replace(`${alias}|`, '') + ".md").replace(" ", "%20")
	console.log(path)
	return path
}

function cleanup(source: string) {
	return removeXVaultWikiLink(removeAnchor(source))
}

function removeAnchor(source: string) {
	if (source.includes('#')) {
		return source.replace(/#[\w\W]*/, ''); // https://regex101.com/r/icL4Ru/1
	}
	return source;
}

/**
 * @description remove "dendron://vault-name/" in wikilink
 * @url https://wiki.dendron.so/notes/3i4ABJutl7NGeXRHTnUEC/#enablexvaultwikilink
 */
function removeXVaultWikiLink(source: string) {
	debugger
	const re = /dendron:\/\/[^\/]+\//g // https://regex101.com/r/KGPl2z/1
	return source.replace(re, "")
}