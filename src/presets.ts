export interface MCPServerPreset {
	name: string
	displayName: string
	command: string
	args: string[]
	description: string
}

export const MCP_SERVER_PRESETS: MCPServerPreset[] = [
	{
		name: 'context7',
		displayName: 'Context7 MCP',
		command: 'npx',
		args: ['context7-mcp'],
		description: 'Official library documentation lookup'
	},
	{
		name: 'sequential-thinking',
		displayName: 'Sequential Thinking MCP',
		command: 'npx',
		args: ['sequential-thinking-mcp'],
		description: 'Multi-step reasoning and analysis'
	},
	{
		name: 'arxiv',
		displayName: 'ArXiv MCP',
		command: 'npx',
		args: ['arxiv-mcp-server'],
		description: 'Search and download academic papers'
	},
	{
		name: 'playwright',
		displayName: 'Playwright MCP',
		command: 'npx',
		args: ['playwright-mcp'],
		description: 'Browser automation and testing'
	},
	{
		name: 'serena',
		displayName: 'Serena MCP',
		command: 'npx',
		args: ['serena-mcp'],
		description: 'Semantic code understanding'
	},
	{
		name: 'youtube',
		displayName: 'YouTube MCP',
		command: 'npx',
		args: ['youtube-mcp'],
		description: 'YouTube content access'
	},
	{
		name: 'notion',
		displayName: 'Notion MCP',
		command: 'npx',
		args: ['notion-mcp'],
		description: 'Notion workspace integration'
	},
	{
		name: 'chrome-tabs',
		displayName: 'Chrome Tabs MCP',
		command: 'npx',
		args: ['chrome-tabs-mcp'],
		description: 'Browser tab access and control'
	}
]