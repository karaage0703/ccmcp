# ccmcp - Claude Code MCP Control Panel

🔧 Interactive MCP server management tool for Claude Desktop

## Features

- **📋 List MCP servers** - View all configured MCP servers
- **🔄 Toggle servers** - Enable/disable MCP servers with simple keystrokes
- **📊 Status monitoring** - Check if MCP servers are running
- **🎮 Interactive interface** - Navigate with arrow keys, toggle with space
- **🚀 Fast and lightweight** - Built with TypeScript for speed

## Installation

```bash
# Clone or download the ccmcp project
cd ccmcp
npm install
npm run build

# Run directly
npm start

# Or install globally (after build)
npm install -g .
ccmcp
```

## Usage

### Interactive Mode (Default)

Simply run `ccmcp` to start the interactive interface:

```bash
npm start
```

**Controls:**
- `↑/↓` - Navigate through servers
- `SPACE` - Toggle server (disable/enable)
- `Q` - Quit

### Non-Interactive Mode

Perfect for CI/scripts or non-TTY environments:

```bash
CI=true npm start
# Shows list of all configured servers
```

## How It Works

ccmcp directly manages your Claude Desktop configuration file:
- **Config Path**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Server Management**: Toggles servers by adding/removing them from `mcpServers`
- **Status Monitoring**: Tests server commands to check availability

## Configuration File Example

Your Claude Desktop config will look like this:

```json
{
  "mcpServers": {
    "markitdown": {
      "command": "/Users/username/.local/bin/uvx",
      "args": ["markitdown-mcp"]
    },
    "context7": {
      "command": "npx",
      "args": ["context7-mcp"]
    }
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Type check
npm run typecheck

# Build for distribution
npm run build
```

## Requirements

- Node.js 20.19.4 or later
- Claude Desktop installed and configured
- macOS (current implementation assumes macOS paths)

## Architecture

- **TypeScript** - Type-safe development
- **Native Node.js** - No external dependencies for UI
- **Direct file manipulation** - Reads/writes Claude config directly
- **Process monitoring** - Tests server availability

## Related Projects

- [ccusage](https://github.com/ryoppippi/ccusage) - Claude Code usage analysis tool that inspired this project

## License

MIT License - Feel free to use and modify!