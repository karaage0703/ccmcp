import { readFile, writeFile, access } from 'node:fs/promises'
import { join } from 'node:path'
import { homedir } from 'node:os'
import type { ClaudeDesktopConfig, MCPServer, ConfigManager, BackupConfig } from './types.js'

export class ClaudeConfigManager implements ConfigManager {
	private readonly configPath: string
	private readonly backupPath: string

	constructor() {
		this.configPath = join(homedir(), '.claude.json')
		this.backupPath = join(homedir(), '.ccmcp_backup.json')
	}

	getBackupPath(): string {
		return this.backupPath
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
		const backup = await this.loadBackup()
		const servers: MCPServer[] = []
		
		// Add active servers
		for (const [name, serverConfig] of Object.entries(config.mcpServers)) {
			servers.push({
				name,
				command: serverConfig.command,
				args: serverConfig.args,
				enabled: true // Active servers are enabled
			})
		}
		
		// Add disabled servers from backup
		for (const [name, serverConfig] of Object.entries(backup.disabledServers)) {
			servers.push({
				name,
				command: serverConfig.command,
				args: serverConfig.args,
				enabled: false // Backup servers are disabled
			})
		}
		
		return servers
	}

	async toggleServer(serverName: string): Promise<{ newState: boolean }> {
		const config = await this.load()
		const backup = await this.loadBackup()
		
		// Check if server is currently active
		if (config.mcpServers[serverName]) {
			// Server is active, disable it (move to backup)
			backup.disabledServers[serverName] = config.mcpServers[serverName]
			delete config.mcpServers[serverName]
			
			await Promise.all([
				this.save(config),
				this.saveBackup(backup)
			])
			
			return { newState: false } // Now disabled
		}
		
		// Check if server is in backup (disabled)
		if (backup.disabledServers[serverName]) {
			// Server is disabled, enable it (move back to active)
			config.mcpServers[serverName] = backup.disabledServers[serverName]
			delete backup.disabledServers[serverName]
			
			await Promise.all([
				this.save(config),
				this.saveBackup(backup)
			])
			
			return { newState: true } // Now enabled
		}
		
		throw new Error(`Server '${serverName}' not found`)
	}

	async enableServer(serverName: string): Promise<void> {
		const backup = await this.loadBackup()
		
		if (backup.disabledServers[serverName]) {
			// Server is disabled, enable it
			await this.toggleServer(serverName)
		} else {
			// Server might already be enabled or not found
			const config = await this.load()
			if (!config.mcpServers[serverName]) {
				throw new Error(`Server '${serverName}' not found`)
			}
			// Already enabled, do nothing
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
			// Server is active, disable it
			await this.toggleServer(serverName)
		} else {
			// Server might already be disabled or not found
			const backup = await this.loadBackup()
			if (!backup.disabledServers[serverName]) {
				throw new Error(`Server '${serverName}' not found`)
			}
			// Already disabled, do nothing
		}
	}

	async loadBackup(): Promise<BackupConfig> {
		try {
			await access(this.backupPath)
			const content = await readFile(this.backupPath, 'utf-8')
			return JSON.parse(content)
		} catch {
			return { disabledServers: {} }
		}
	}

	async saveBackup(config: BackupConfig): Promise<void> {
		const content = JSON.stringify(config, null, 2)
		await writeFile(this.backupPath, content, 'utf-8')
	}
}

export const configManager = new ClaudeConfigManager()