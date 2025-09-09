import { stdin, stdout } from 'node:process'
import pc from 'picocolors'
import type { MCPServer } from './types.js'

export interface TUIItem {
	label: string
	value: string
	status?: 'enabled' | 'disabled' | 'running' | 'stopped' | 'error'
}

export class InteractiveTUI {
	private selectedIndex = 0
	private items: TUIItem[] = []
	private title = ''

	constructor(title: string) {
		this.title = title
	}

	setItems(items: TUIItem[]): void {
		this.items = items
		this.selectedIndex = Math.min(this.selectedIndex, items.length - 1)
	}

	private renderScreen(): void {
		// Clear screen
		stdout.write('\x1b[2J\x1b[H')
		
		// Title
		stdout.write(pc.bold(pc.blue(`\n  ${this.title}\n\n`)))
		
		if (this.items.length === 0) {
			stdout.write(pc.yellow('  No MCP servers found\n'))
			return
		}

		// Items
		this.items.forEach((item, index) => {
			const isSelected = index === this.selectedIndex
			const prefix = isSelected ? pc.green('▶ ') : '  '
			
			let statusColor = pc.gray
			let statusText = ''
			
			switch (item.status) {
				case 'enabled':
					statusColor = pc.green
					statusText = ' ✓'
					break
				case 'disabled':
					statusColor = pc.red
					statusText = ' ✗'
					break
				case 'running':
					statusColor = pc.green
					statusText = ' ●'
					break
				case 'stopped':
					statusColor = pc.red
					statusText = ' ○'
					break
				case 'error':
					statusColor = pc.red
					statusText = ' !'
					break
			}
			
			const label = isSelected 
				? pc.inverse(item.label)
				: item.label
				
			stdout.write(`${prefix}${label}${statusColor(statusText)}\n`)
		})
		
		// Instructions
		stdout.write(pc.gray('\n  ↑/↓: Navigate  SPACE: Toggle  Q: Quit\n'))
	}

	async show(): Promise<string | null> {
		return new Promise((resolve) => {
			// Set raw mode for key capture
			stdin.setRawMode(true)
			stdin.resume()
			stdin.setEncoding('utf8')
			
			const cleanup = () => {
				stdin.setRawMode(false)
				stdin.pause()
				stdin.removeAllListeners('data')
			}

			this.renderScreen()

			stdin.on('data', (key: string) => {
				const keyCode = key.charCodeAt(0)
				
				// Debug: uncomment to see key codes
				// console.log('Key pressed:', key, 'KeyCode:', keyCode)
				
				switch (keyCode) {
					case 3: // Ctrl+C
					case 113: // q
					case 81: // Q
						cleanup()
						resolve(null)
						break
						
					case 27: // Escape sequence
						if (key.length === 3) {
							const arrow = key.charCodeAt(2)
							if (arrow === 65) { // Up arrow
								this.selectedIndex = Math.max(0, this.selectedIndex - 1)
								this.renderScreen()
							} else if (arrow === 66) { // Down arrow
								this.selectedIndex = Math.min(this.items.length - 1, this.selectedIndex + 1)
								this.renderScreen()
							}
						}
						break
						
					case 32: // Space
						if (this.items.length > 0) {
							cleanup()
							resolve(this.items[this.selectedIndex].value)
						}
						break
						
					case 13: // Enter
						if (this.items.length > 0) {
							cleanup()
							resolve(this.items[this.selectedIndex].value)
						}
						break
				}
			})
		})
	}

	static async showConfirmation(message: string): Promise<boolean> {
		stdout.write(`\n${pc.yellow('?')} ${message} ${pc.gray('(y/N)')} `)
		
		return new Promise((resolve) => {
			stdin.setRawMode(true)
			stdin.resume()
			stdin.setEncoding('utf8')
			
			const cleanup = () => {
				stdin.setRawMode(false)
				stdin.pause()
				stdin.removeAllListeners('data')
				stdout.write('\n')
			}

			stdin.once('data', (key: string) => {
				cleanup()
				const response = key.toLowerCase().trim()
				resolve(response === 'y' || response === 'yes')
			})
		})
	}
}

export function displayServerList(servers: MCPServer[]): void {
	stdout.write(pc.bold(pc.blue('\n  MCP Servers\n\n')))
	
	if (servers.length === 0) {
		stdout.write(pc.yellow('  No MCP servers configured\n'))
		return
	}
	
	servers.forEach(server => {
		const status = server.enabled ? pc.green('✓ Enabled') : pc.red('✗ Disabled')
		stdout.write(`  ${pc.bold(server.name)} - ${status}\n`)
		stdout.write(pc.gray(`    Command: ${server.command} ${server.args.join(' ')}\n`))
	})
	
	stdout.write('\n')
}