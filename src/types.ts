export interface MCPServer {
	name: string
	command: string
	args: string[]
	enabled: boolean
	status?: 'running' | 'stopped' | 'error'
}

export interface ServerConfig {
	command: string
	args: string[]
	env?: Record<string, string>
	type?: string
	timeout?: number
	alwaysAllow?: string[]
}

export interface ClaudeDesktopConfig {
	mcpServers: Record<string, ServerConfig>
}

export interface BackupConfig {
	disabledServers: Record<string, ServerConfig>
}

export interface ConfigManager {
	load(): Promise<ClaudeDesktopConfig>
	save(config: ClaudeDesktopConfig): Promise<void>
	listServers(): Promise<MCPServer[]>
	toggleServer(serverName: string): Promise<{ newState: boolean }>
	loadBackup(): Promise<BackupConfig>
	saveBackup(config: BackupConfig): Promise<void>
	getBackupPath(): string
	enableServer(serverName: string): Promise<void>
	disableServer(serverName: string): Promise<void>
	addServer(name: string, command: string, args: string[]): Promise<void>
}