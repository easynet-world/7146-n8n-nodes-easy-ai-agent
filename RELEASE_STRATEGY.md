# Release Strategy

## Hardcoded Patch-Only Releases

This project is configured to **ONLY** do patch releases, regardless of commit type.

### Configuration

The `.releaserc.json` file explicitly maps ALL commit types to patch releases:

```json
"releaseRules": [
  { "type": "feat", "release": "patch" },
  { "type": "fix", "release": "patch" },
  { "type": "docs", "release": "patch" },
  { "type": "style", "release": "patch" },
  { "type": "refactor", "release": "patch" },
  { "type": "perf", "release": "patch" },
  { "type": "test", "release": "patch" },
  { "type": "chore", "release": "patch" },
  { "type": "ci", "release": "patch" },
  { "type": "build", "release": "patch" },
  { "type": "revert", "release": "patch" },
  { "type": "*", "release": "patch" }
]
```

### Version Progression

- **Starting Version**: `0.0.1`
- **Every Commit**: Increments patch version
- **Example**: `0.0.1` → `0.0.2` → `0.0.3` → `0.0.4` → ...

### Commit Types That Trigger Patches

| Commit Type | Example | Release Type |
|-------------|---------|--------------|
| `feat:` | `feat: add new feature` | patch |
| `fix:` | `fix: resolve bug` | patch |
| `docs:` | `docs: update README` | patch |
| `style:` | `style: format code` | patch |
| `refactor:` | `refactor: improve code` | patch |
| `perf:` | `perf: optimize performance` | patch |
| `test:` | `test: add unit tests` | patch |
| `chore:` | `chore: update dependencies` | patch |
| `ci:` | `ci: update GitHub Actions` | patch |
| `build:` | `build: update build config` | patch |
| `revert:` | `revert: undo previous change` | patch |
| Any other type | `anything: any message` | patch |

### Why Patch-Only?

1. **Simplicity**: No need to think about commit types
2. **Consistency**: Every change gets a release
3. **Predictability**: Always know the next version will be a patch
4. **npm Compatibility**: Works perfectly with npm's versioning system

### Important Notes

- **No Major Releases**: Never goes to 1.0.0, 2.0.0, etc.
- **No Minor Releases**: Never goes to 0.1.0, 0.2.0, etc.
- **Only Patches**: Always 0.0.x format
- **Every Push**: Triggers a new patch release
