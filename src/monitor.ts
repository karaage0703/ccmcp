import { spawn } from 'node:child_process'
import type { MCPServer } from './types.js'

export interface ServerStatus {
	name: string
	running: boolean
	pid?: number
	error?: string
}

export class MCPServerMonitor {
	async checkServerStatus(server: MCPServer): Promise<ServerStatus> {
		try {
			// For simple check, try to spawn the command with --help or similar
			// This is a basic implementation - a more sophisticated one would 
			// try to connect to the actual MCP server
			const result = await this.testCommand(server.command, server.args)
			
			return {
				name: server.name,
				running: result.success,
				error: result.success ? undefined : result.error
			}
		} catch (error) {
			return {
				name: server.name,
				running: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			}
		}
	}

	async checkAllServers(servers: MCPServer[]): Promise<ServerStatus[]> {
		const promises = servers.map(server => this.checkServerStatus(server))
		return Promise.all(promises)
	}

	private testCommand(command: string, args: string[]): Promise<{ success: boolean; error?: string }> {
		return new Promise((resolve) => {
			const child = spawn(command, [...args, '--help'], {
				stdio: 'pipe',
				timeout: 5000
			})

			let hasResolved = false

			child.on('spawn', () => {
				if (!hasResolved) {
					hasResolved = true
					child.kill()
					resolve({ success: true })
				}
			})

			child.on('error', (error) => {
				if (!hasResolved) {
					hasResolved = true
					resolve({ 
						success: false, 
						error: `Command not found: ${error.message}` 
					})
				}
			})

			child.on('exit', (code) => {
				if (!hasResolved) {
					hasResolved = true
					resolve({ 
						success: code === 0 || code === null,
						error: code !== 0 && code !== null ? `Exit code: ${code}` : undefined
					})
				}
			})

			// Fallback timeout
			setTimeout(() => {
				if (!hasResolved) {
					hasResolved = true
					child.kill()
					resolve({ success: false, error: 'Timeout' })
				}
			}, 6000)
		})
	}
}