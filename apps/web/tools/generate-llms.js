#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const CLEAN_CONTENT_REGEX = {
	comments: /\/\*[\s\S]*?\*\/|\/\/.*$/gm,
	templateLiterals: /`[\s\S]*?`/g,
	strings: /'[^']*'|"[^"]*"/g,
	jsxExpressions: /\{.*?\}/g,
	htmlEntities: {
		quot: /&quot;/g,
		amp: /&amp;/g,
		lt: /&lt;/g,
		gt: /&gt;/g,
		apos: /&apos;/g
	}
};

const EXTRACTION_REGEX = {
	route: /<Route\s+[^>]*>/g,
	path: /path=["']([^"']+)["']/,
	element: /element=\{<(\w+)[^}]*\/?\s*>\}/,
	helmet: /<Helmet[^>]*?>([\s\S]*?)<\/Helmet>/i,
	helmetTest: /<Helmet[\s\S]*?<\/Helmet>/i,
	title: /<title[^>]*?>\s*(.*?)\s*<\/title>/i,
	description: /<meta\s+name=["']description["']\s+content=["'](.*?)["']/i
};

const SITE = 'https://puxijietech.com';
const VERIFIED_MODELS = [
	{ slug: 'g34', name: 'G34', category: 'IPX7 waterproof Bluetooth speaker' },
	{ slug: 'g31', name: 'G31', category: 'IPX6 waterproof Bluetooth speaker' },
	{ slug: 'g23', name: 'G23', category: 'portable wireless Bluetooth speaker' },
	{ slug: 'g21', name: 'G21', category: 'portable wireless Bluetooth speaker' },
	{ slug: 'g14', name: 'G14', category: 'portable wireless Bluetooth speaker' },
	{ slug: 'a5', name: 'A5', category: 'portable wireless Bluetooth speaker' },
	{ slug: 'f19', name: 'F19', category: 'mini portable Bluetooth speaker with TWS' },
	{ slug: 'g29', name: 'G29', category: 'round desktop Bluetooth speaker with TF AUX USB playback' },
	{ slug: 'g06', name: 'G06', category: 'portable wireless Bluetooth speaker' },
	{ slug: 'c-01', name: 'C-01 Bell', category: 'specialty speaker with wireless charging' },
	{ slug: 'c-01-cotton', name: 'C-01 Cotton', category: 'specialty speaker with wireless charging' },
	{ slug: 'me-136', name: 'ME-136', category: 'Bluetooth earbuds' },
	{ slug: 'me-88p', name: 'ME-88P', category: 'Bluetooth earbuds' },
	{ slug: 'me-636', name: 'ME-636', category: 'Bluetooth earbuds' },
	{ slug: 'me-176', name: 'ME-176', category: 'Bluetooth earbuds' },
];

function cleanContent(content) {
	return content
		.replace(CLEAN_CONTENT_REGEX.comments, '')
		.replace(CLEAN_CONTENT_REGEX.templateLiterals, '""')
		.replace(CLEAN_CONTENT_REGEX.strings, '""');
}

function cleanText(text) {
	if (!text) return text;

	return text
		.replace(CLEAN_CONTENT_REGEX.jsxExpressions, '')
		.replace(CLEAN_CONTENT_REGEX.htmlEntities.quot, '"')
		.replace(CLEAN_CONTENT_REGEX.htmlEntities.amp, '&')
		.replace(CLEAN_CONTENT_REGEX.htmlEntities.lt, '<')
		.replace(CLEAN_CONTENT_REGEX.htmlEntities.gt, '>')
		.replace(CLEAN_CONTENT_REGEX.htmlEntities.apos, "'")
		.trim();
}

function extractRoutes(appJsxPath) {
	if (!fs.existsSync(appJsxPath)) return new Map();

	try {
		const content = fs.readFileSync(appJsxPath, 'utf8');
		const routes = new Map();
		const routeMatches = [...content.matchAll(EXTRACTION_REGEX.route)];

		for (const match of routeMatches) {
			const routeTag = match[0];
			const pathMatch = routeTag.match(EXTRACTION_REGEX.path);
			const elementMatch = routeTag.match(EXTRACTION_REGEX.element);
			const isIndex = routeTag.includes('index');

			if (elementMatch) {
				const componentName = elementMatch[1];
				let routePath;

				if (isIndex) {
					routePath = '/';
				} else if (pathMatch) {
					routePath = pathMatch[1].startsWith('/') ? pathMatch[1] : `/${pathMatch[1]}`;
				}

				routes.set(componentName, routePath);
			}
		}

		return routes;
	} catch (error) {
		return new Map();
	}
}

function findReactFiles(dir) {
	if (!fs.existsSync(dir)) return [];

	return fs.readdirSync(dir, { withFileTypes: true }).flatMap(item => {
		const fullPath = path.join(dir, item.name);
		if (item.isDirectory()) {
			return findReactFiles(fullPath);
		}
		if (!/\.(jsx?|tsx?)$/.test(item.name)) {
			return [];
		}
		return [fullPath];
	});
}

function extractHelmetData(content, filePath, routes) {
	const cleanedContent = cleanContent(content);

	if (!EXTRACTION_REGEX.helmetTest.test(cleanedContent)) {
		return null;
	}

	const helmetMatch = content.match(EXTRACTION_REGEX.helmet);
	if (!helmetMatch) return null;

	const helmetContent = helmetMatch[1];
	const titleMatch = helmetContent.match(EXTRACTION_REGEX.title);
	const descMatch = helmetContent.match(EXTRACTION_REGEX.description);

	const title = cleanText(titleMatch?.[1]);
	const description = cleanText(descMatch?.[1]);

	const fileName = path.basename(filePath, path.extname(filePath));
	const url = routes.length && routes.has(fileName)
		? routes.get(fileName)
		: generateFallbackUrl(fileName);

	return {
		url,
		title: title || 'Untitled Page',
		description: description || 'No description available'
	};
}

function generateFallbackUrl(fileName) {
	const cleanName = fileName.replace(/Page$/, '').toLowerCase();
	return cleanName === 'app' ? '/' : `/${cleanName}`;
}

function absoluteUrl(pathname) {
	return `${SITE}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}

function generateLlmsTxt() {
	const lines = [];
	lines.push('# Puxijie');
	lines.push('');
	lines.push('Puxijie is a B2B OEM/ODM audio manufacturer for waterproof Bluetooth speakers, portable wireless speakers, specialty speakers, and Bluetooth earbuds.');
	lines.push('');
	lines.push('## Buyer Intent');
	lines.push('- OEM Bluetooth speaker manufacturer');
	lines.push('- Waterproof speaker wholesale supplier');
	lines.push('- Private label portable speaker factory');
	lines.push('- Bluetooth earbuds wholesale');
	lines.push('- IPX6/IPX7 outdoor speaker sourcing');
	lines.push('- RFQ-ready consumer electronics procurement');
	lines.push('');
	lines.push('## Public Pricing Policy');
	lines.push('Product pages do not publish unit prices. RFQs are quoted by project after quantity, destination market, packaging, logo, compliance, and timeline are confirmed.');
	lines.push('');
	lines.push('## Verified Product Models');
	for (const model of VERIFIED_MODELS) {
		lines.push(`- ${model.name} (${model.category}): ${absoluteUrl(`/en/model/${model.slug}`)}`);
	}
	lines.push('');
	lines.push('## Crawlable Product Data');
	lines.push('Product pages expose model code, category, IP rating where applicable, chipset, Bluetooth version, battery configuration, transmission distance, MOQ guidance, color options, package size, carton quantity, carton weight, and buyer RFQ notes.');
	lines.push('');
	lines.push('## Important Pages');
	lines.push(`- Products: ${absoluteUrl('/en/products')}`);
	lines.push(`- B2B & Wholesale: ${absoluteUrl('/en/b2b')}`);
	lines.push(`- Factory and company profile: ${absoluteUrl('/en/about-us')}`);
	lines.push(`- Lab reports and compliance support: ${absoluteUrl('/en/lab')}`);
	lines.push(`- FAQ: ${absoluteUrl('/en/faq')}`);
	lines.push(`- News and buyer education: ${absoluteUrl('/en/news')}`);
	lines.push(`- Contact: ${absoluteUrl('/en/contact')}`);
	lines.push('');
	lines.push('## Contact');
	lines.push('Primary buyer contact: WeChat ID EricH0625.');
	return `${lines.join('\n')}\n`;
}

function ensureDirectoryExists(dirPath) {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
}

function findExistingPath(candidates) {
	return candidates.find(candidate => fs.existsSync(candidate)) ?? null;
}

function processPageFile(filePath, routes) {
	try {
		const content = fs.readFileSync(filePath, 'utf8');
		return extractHelmetData(content, filePath, routes);
	} catch (error) {
		console.error(`❌ Error processing ${filePath}:`, error.message);
		return null;
	}
}

function main() {
	const appJsxPath = findExistingPath([
		path.join(process.cwd(), 'src', 'app', 'App.jsx'),
		path.join(process.cwd(), 'src', 'App.jsx'),
	]);
	const pageRoots = [
		path.join(process.cwd(), 'src', 'features'),
		path.join(process.cwd(), 'src', 'pages'),
	];

	const routes = extractRoutes(appJsxPath);
	const reactFiles = pageRoots.flatMap(findReactFiles);

	let pages = reactFiles
		.map(filePath => processPageFile(filePath, routes))
		.filter(Boolean);

	if (pages.length === 0) {
		console.error('❌ No pages with Helmet components found!');
		process.exit(1);
	}


	const llmsTxtContent = generateLlmsTxt(pages);
	const outputPath = path.join(process.cwd(), 'public', 'llms.txt');

	ensureDirectoryExists(path.dirname(outputPath));
	fs.writeFileSync(outputPath, llmsTxtContent, 'utf8');
}

const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
	main();
}
