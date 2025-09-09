import { readFile, writeFile, access } from 'node:fs/promises'
import { join } from 'node:path'
import { homedir } from 'node:os'
import type { ClaudeDesktopConfig, MCPServer, ConfigManager } from './types.js'

export class ClaudeConfigManager implements ConfigManager {
	private readonly configPath: string

	constructor() {
		this.configPath = join(homedir(), '.claude.json')
	}

	async load(): Promise<ClaudeDesktopConfig> {
		try {
			await access(this.configPath)
			const content = await readFile(this.configPath, 'utf-8')
			const fullConfig = JSON.parse(content)
			
			// Extract only the mcpServers part for our purposes
			const config: ClaudeDesktopConfig = {
				mcpServers: fullConfig.mcpServers || {}
			}
			
			return config
		} catch {
			// If file doesn't exist or is invalid, return default config
			return {
				mcpServers: {}
			}
		}
	}

	async save(config: ClaudeDesktopConfig): Promise<void> {
		// Load the full config file first
		const content = await readFile(this.configPath, 'utf-8')
		const fullConfig = JSON.parse(content)
		
		// Update only the mcpServers part
		fullConfig.mcpServers = config.mcpServers
		
		// Save the full config back
		const updatedContent = JSON.stringify(fullConfig, null, 2)
		await writeFile(this.configPath, updatedContent, 'utf-8')
	}

	async listServers(): Promise<MCPServer[]> {
		const config = await this.load()
		const servers: MCPServer[] = []
		
		for (const [name, serverConfig] of Object.entries(config.mcpServers)) {
			servers.push({
				name,
				command: serverConfig.command,
				args: serverConfig.args,
				enabled: !serverConfig.disabled, // disabled: true means not enabled
			})
		}
		
		return servers
	}

	async toggleServer(serverName: string): Promise<void> {
		const config = await this.load()
		
		if (config.mcpServers[serverName]) {
			// Server exists, toggle its disabled state
			const server = config.mcpServers[serverName]
			server.disabled = !server.disabled
		} else {
			throw new Error(`Server '${serverName}' not found`)
		}
		
		await this.save(config)
	}

	async enableServer(serverName: string): Promise<void> {
		const config = await this.load()
		
		if (config.mcpServers[serverName]) {
			config.mcpServers[serverName].disabled = false
			await this.save(config)
		} else {
			throw new Error(`Server '${serverName}' not found`)
		}
	}

	async addServer(name: string, command: string, args: string[]): Promise<void> {
		const config = await this.load()
		
		if (config.mcpServers[name]) {
			throw new Error(`Server '${name}' already exists`)
		}
		
		config.mcpServers[name] = { command, args }
		await this.save(config)
	}

	async disableServer(serverName: string): Promise<void> {
		const config = await this.load()
		
		if (config.mcpServers[serverName]) {
			config.mcpServers[serverName].disabled = true
			await this.save(config)
		} else {
			throw new Error(`Server '${serverName}' not found`)
		}
	}
}

export const configManager = new ClaudeConfigManager()