export interface MCPServer {
	name: string
	command: string
	args: string[]
	enabled: boolean
	status?: 'running' | 'stopped' | 'error'
}

export interface ClaudeDesktopConfig {
	mcpServers: Record<string, {
		command: string
		args: string[]
		disabled?: boolean
	}>
}

export interface ConfigManager {
	load(): Promise<ClaudeDesktopConfig>
	save(config: ClaudeDesktopConfig): Promise<void>
	listServers(): Promise<MCPServer[]>
	toggleServer(serverName: string): Promise<void>
	enableServer(serverName: string): Promise<void>
	disableServer(serverName: string): Promise<void>
	addServer(name: string, command: string, args: string[]): Promise<void>
}