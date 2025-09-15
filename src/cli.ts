import { stdout } from 'node:process'
import { readFile, writeFile, access } from 'node:fs/promises'
import { join } from 'node:path'
import { homedir } from 'node:os'
import pc from 'picocolors'
import { configManager } from './config.js'
import type { ClaudeDesktopConfig } from './types.js'

interface MmcpServer {
	command: string
	args: string[]
	env?: Record<string, string>
}

interface MmcpConfig {
	mcpServers: Record<string, MmcpServer>
	agents?: string[]
}

export async function handleCliArgs(): Promise<boolean> {
	const [command] = process.argv.slice(2)

	switch (command) {
		case 'export-to-mmcp':
			await exportToMmcp()
			return true
		case 'import-from-mmcp':
			await importFromMmcp()
			return true
		default:
			return false
	}
}

async function exportToMmcp(): Promise<void> {
	try {
		stdout.write(pc.bold(pc.blue('\n  📤 Exporting Claude Code MCP servers to mmcp\n\n')))

		// Read Claude Code configuration
		const claudeConfig = await configManager.load()
		const serverCount = Object.keys(claudeConfig.mcpServers).length

		if (serverCount === 0) {
			stdout.write(pc.yellow('  ⚠️  No MCP servers found in Claude Code configuration\n'))
			stdout.write(pc.gray('  Make sure you have MCP servers configured in ~/.claude.json\n\n'))
			return
		}

		stdout.write(pc.cyan(`  🔍 Found ${serverCount} MCP server(s):\n`))
		for (const [name, config] of Object.entries(claudeConfig.mcpServers)) {
			stdout.write(pc.gray(`    • ${name} (${config.command})\n`))
		}
		stdout.write('\n')

		// Read existing mmcp configuration
		const mmcpPath = join(homedir(), '.mmcp.json')
		let mmcpConfig: MmcpConfig = { mcpServers: {} }

		try {
			await access(mmcpPath)
			const mmcpContent = await readFile(mmcpPath, 'utf-8')
			const existingConfig = JSON.parse(mmcpContent)
			// Preserve existing structure and merge servers
			mmcpConfig = {
				mcpServers: existingConfig.mcpServers || {},
				...(existingConfig.agents && { agents: existingConfig.agents })
			}
		} catch {
			// File doesn't exist, that's okay
		}

		// Convert and merge servers
		let newServersCount = 0
		let updatedServersCount = 0

		for (const [name, claudeServerConfig] of Object.entries(claudeConfig.mcpServers)) {
			const mmcpServer: MmcpServer = {
				command: claudeServerConfig.command,
				args: claudeServerConfig.args
			}

			if (claudeServerConfig.env && Object.keys(claudeServerConfig.env).length > 0) {
				mmcpServer.env = claudeServerConfig.env
			}

			if (mmcpConfig.mcpServers[name]) {
				updatedServersCount++
				stdout.write(pc.yellow(`    ✓ Updated: ${name}\n`))
			} else {
				newServersCount++
				stdout.write(pc.green(`    ✓ Added: ${name}\n`))
			}

			mmcpConfig.mcpServers[name] = mmcpServer
		}

		// Write mmcp configuration
		const mmcpContent = JSON.stringify(mmcpConfig, null, 2)
		await writeFile(mmcpPath, mmcpContent, 'utf-8')

		stdout.write('\n')
		stdout.write(pc.green('  ✅ Export completed successfully!\n'))
		stdout.write(pc.gray(`    • New servers: ${newServersCount}\n`))
		stdout.write(pc.gray(`    • Updated servers: ${updatedServersCount}\n`))
		stdout.write(pc.gray(`    • Saved to: ${mmcpPath}\n\n`))

		stdout.write(pc.bold(pc.cyan('  🚀 Next steps:\n')))
		stdout.write(pc.gray('    1. Install mmcp (if not installed): npm install -g mmcp\n'))
		stdout.write(pc.gray('    2. Add target CLI: mmcp agents add codex-cli\n'))
		stdout.write(pc.gray('    3. Apply settings: mmcp apply\n\n'))

	} catch (error) {
		stdout.write(pc.red(`\n  ❌ Export failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\n`))
		process.exit(1)
	}
}

async function importFromMmcp(): Promise<void> {
	stdout.write(pc.bold(pc.blue('\n  📥 Importing from mmcp to Claude Code\n\n')))
	stdout.write(pc.yellow('  ⚠️  Import functionality will be implemented in a future version\n'))
	stdout.write(pc.gray('  For now, please use mmcp commands directly:\n'))
	stdout.write(pc.gray('    mmcp agents add claude-code\n'))
	stdout.write(pc.gray('    mmcp apply\n\n'))
}