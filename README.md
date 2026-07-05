# Colored Areas

A VS Code extension that colorizes code regions delimited by comments. Use `//region` and `//endregion` to define blocks with colored backgrounds and borders, improving visual code organization.

## Features

- **Colorizes regions** defined with `//region` and `//endregion`
- **Inline color** — specify the color with a colon: `//region:#ff6b6b`
- **CSS colors** — also supports named colors: `//region:coral`
- **Cyclic palette** — if no color is specified, cycles through a default palette
- **Alpha support** — embed alpha in hex: `//region:#ff6b6b80` (per-region alpha overrides the global opacity setting)
- **Nesting** — regions can be nested; each level gets a different color
- **Color picker** — hex colors show a clickable square that opens VS Code's native color picker
- **Folding** — regions are collapsible/expandable
- **40+ languages** — JavaScript, Python, HTML, CSS, SQL, C++, Java, Rust, Go, and more
- **High performance** — throttled updates to avoid editor lag

## Installation

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "Colored Areas"
4. Click Install

Or from the terminal:

```bash
code --install-extension colored-areas
```

## Usage

Write `//region` to start a block and `//endregion` to close it:

```javascript
//region Database Module
function connect() {
  //region: Settings
  const pool = new ConnectionPool();
  //endregion

  return pool.acquire();
}
//endregion
```

### Specifying a color

Use a colon (`:`) after `region` to specify an inline color, otherwise the region uses the palette:

| Format | Example | Behavior |
|--------|---------|----------|
| No color | `//region My Section` | Uses cyclic palette |
| Hex with `#` | `//region:#ff6b6b` | Inline color |
| Hex without `#` | `//region:ff6b6b` | Inline color |
| Short hex | `//region:#f00` | Inline color |
| CSS color name | `//region:coral` | Inline color |
| Hex with alpha | `//region:#ff6b6b80` | Inline color + alpha override |

The colon is **required** for inline color — `//region red` uses "red" as the label, not as a color.

### Without color (cyclic palette)

```typescript
//region Database     → uses palette color #1
// ... code ...
//endregion

//region API Routes   → uses palette color #2
// ... code ...
//endregion
```

### Nesting

```python
#region Backend               → level 0: color #1
class App:
    #region Auth              → level 1: color #2
    def login(self): ...
    def logout(self): ...
    #endregion

    #region Database          → level 1: color #3
    def query(self): ...
    #endregion
#endregion
```

### Alpha

The global `coloredAreas.opacity` controls the default opacity (0.2 by default). To override it per-region, embed alpha in the hex color:

```javascript
//region:#ff6b6b80    → uses alpha 0x80/255 ≈ 0.50
//region:#ff6b6b      → uses global opacity (0.2)
```

**Priority**: inline hex alpha > global `opacity` setting.

## Supported languages

| Comment | Languages |
|------------|-----------|
| `//` | JavaScript, TypeScript, C, C++, C#, Java, Go, Rust, Swift, Kotlin, Dart, PHP, Pascal |
| `#` | Python, Ruby, Shell, R, YAML, TOML, Perl, Dockerfile, GraphQL, CoffeeScript |
| `--` | SQL, Lua, Haskell |
| `<!-- -->` | HTML, XML |
| `/* */` | CSS, SCSS, Less |
| `%` | Erlang, LaTeX |
| `;` | Lisp |
| `REM` | Batch |

If your language is not listed, use `coloredAreas.languageOverrides`:

```json
{
  "coloredAreas.languageOverrides": {
    "mylang": {
      "lineComment": "//"
    }
  }
}
```

## Configuration

| Property | Default | Description |
|-----------|---------|-------------|
| `coloredAreas.enabled` | `true` | Enable/disable highlighting |
| `coloredAreas.renderMode` | `"full"` | Mode: `full`, `background`, `gutter`, `border` |
| `coloredAreas.opacity` | `0.2` | Default background opacity (0.0 - 1.0). Can be overridden per region via hex alpha channel |
| `coloredAreas.colors` | *10-color palette* | Colors for the cyclic palette |
| `coloredAreas.languageOverrides` | `{}` | Override comment syntax per language |

### Render modes

- `full` — background + left border (recommended)
- `background` — background color only
- `gutter` — left border only
- `border` — left border only

### Commands

- `Colored Areas: Toggle Highlighting` — toggle highlighting on/off

## Development

```bash
# Clone
git clone https://github.com/user/colored-areas
cd colored-areas

# Install dependencies
npm install

# Compile
npm run compile

# Run in development mode (F5 in VS Code)
code .
```

## License

MIT
