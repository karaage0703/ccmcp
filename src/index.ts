import { stdout } from 'node:process'
import pc from 'picocolors'
import { configManager } from './config.js'
import { InteractiveTUI, displayServerList, type TUIItem } from './tui.js'
import { MCPServerMonitor } from './monitor.js'
import type { MCPServer } from './types.js'

class CCMCPApp {
	private monitor = new MCPServerMonitor()

	async run(): Promise<void> {
		try {
			// Show welcome message
			this.showWelcome()

			// Check if running in CI/non-interactive mode
			if (process.env.CI === 'true' || !process.stdout.isTTY) {
				await this.runNonInteractive()
				return
			}

			// Start interactive mode
			await this.runInteractive()
		} catch (error) {
			console.error(pc.red('Error:'), error instanceof Error ? error.message : 'Unknown error')
			process.exit(1)
		}
	}

	private showWelcome(): void {
		stdout.write(pc.bold(pc.blue('\n  🔧 ccmcp - Claude Code MCP Control Panel\n')))
		stdout.write(pc.gray('  Interactive MCP server management tool\n'))
	}

	private async runNonInteractive(): Promise<void> {
		const servers = await configManager.listServers()
		displayServerList(servers)
	}

	private async runInteractive(): Promise<void> {
		let running = true

		while (running) {
			const servers = await configManager.listServers()
			
			// Check server status
			const statusList = await this.monitor.checkAllServers(servers)
			const statusMap = new Map(statusList.map(s => [s.name, s]))

			// Create menu items
			const menuItems: TUIItem[] = [
				{ label: '📋 List all servers', value: 'list' },
				{ label: '🔄 Refresh status', value: 'refresh' },
				...servers.map(server => {
					const status = statusMap.get(server.name)
					let itemStatus: TUIItem['status'] = 'enabled'
					
					if (status) {
						itemStatus = status.running ? 'running' : 'error'
					}
					
					return {
						label: `${server.enabled ? '✓' : '✗'} ${server.name}`,
						value: `toggle:${server.name}`,
						status: itemStatus
					}
				}),
				{ label: '❌ Quit', value: 'quit' }
			]

			const tui = new InteractiveTUI('MCP Server Manager')
			tui.setItems(menuItems)
			
			const choice = await tui.show()
			
			if (!choice || choice === 'quit') {
				running = false
				continue
			}

			await this.handleChoice(choice, servers)
		}

		stdout.write(pc.green('\n  👋 Goodbye!\n\n'))
	}

	private async handleChoice(choice: string, servers: MCPServer[]): Promise<void> {
		switch (choice) {
			case 'list':
				await this.showDetailedList(servers)
				break
				
			case 'refresh':
				stdout.write(pc.yellow('\n  🔄 Refreshing server status...\n'))
				await new Promise(resolve => setTimeout(resolve, 1000)) // Brief pause
				break
				
			default:
				if (choice.startsWith('toggle:')) {
					const serverName = choice.replace('toggle:', '')
					await this.toggleServer(serverName)
				}
		}
	}

	private async showDetailedList(servers: MCPServer[]): Promise<void> {
		stdout.write('\x1b[2J\x1b[H') // Clear screen
		
		stdout.write(pc.bold(pc.blue('\n  📋 Detailed Server Information\n\n')))
		
		if (servers.length === 0) {
			stdout.write(pc.yellow('  No MCP servers configured\n'))
		} else {
			// Check server status
			const statusList = await this.monitor.checkAllServers(servers)
			const statusMap = new Map(statusList.map(s => [s.name, s]))
			
			for (const server of servers) {
				const status = statusMap.get(server.name)
				
				stdout.write(pc.bold(`  ${server.name}\n`))
				stdout.write(pc.gray(`    Command: ${server.command}\n`))
				stdout.write(pc.gray(`    Args: ${server.args.join(' ')}\n`))
				
				if (status) {
					const statusText = status.running 
						? pc.green('✓ Running') 
						: pc.red('✗ Not running')
					stdout.write(`    Status: ${statusText}`)
					
					if (status.error) {
						stdout.write(pc.red(` (${status.error})`))
					}
					stdout.write('\n')
				}
				
				stdout.write('\n')
			}
		}
		
		stdout.write(pc.gray('  Press any key to continue...'))
		
		// Wait for keypress
		return new Promise(resolve => {
			process.stdin.setRawMode(true)
			process.stdin.resume()
			process.stdin.once('data', () => {
				process.stdin.setRawMode(false)
				process.stdin.pause()
				resolve()
			})
		})
	}

	private async toggleServer(serverName: string): Promise<void> {
		try {
			const confirmed = await InteractiveTUI.showConfirmation(
				`Disable server '${serverName}'?`
			)
			
			if (confirmed) {
				await configManager.toggleServer(serverName)
				stdout.write(pc.green(`\n  ✓ Server '${serverName}' disabled\n`))
			} else {
				stdout.write(pc.gray('\n  Operation cancelled\n'))
			}
		} catch (error) {
			stdout.write(pc.red(`\n  ✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`))
		}
		
		// Brief pause to show message
		await new Promise(resolve => setTimeout(resolve, 1500))
	}
}

// Run the app
if (import.meta.url === `file://${process.argv[1]}`) {
	const app = new CCMCPApp()
	app.run().catch(console.error)
}