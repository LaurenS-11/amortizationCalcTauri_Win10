# 🏠 Tauri Amortization Calculator

A modern, fast, and secure desktop amortization calculator built with **Tauri**, **Rust**, and modern web technologies.

![Tauri](https://img.shields.io/badge/Tauri-1.5-blue.svg)
![Rust](https://img.shields.io/badge/Rust-1.70+-orange.svg)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## ✨ Features

- **🚀 Lightning Fast**: Rust backend for instant calculations
- **📊 Interactive Charts**: Beautiful visualizations with Chart.js
- **💾 Export Data**: CSV export functionality
- **🎨 Modern UI**: Responsive design with smooth animations
- **🔒 Secure**: Tauri's security-first architecture
- **📦 Small Binary**: ~15MB total size vs 150MB+ Electron apps
- **⚡ Native Performance**: Uses system webview, not bundled browser

## 🎯 What It Does

Calculate and visualize loan amortization schedules with:
- **Monthly payment calculations** using standard amortization formulas
- **Interactive payment tables** with extra payment support
- **Real-time charts** showing principal vs interest over time
- **Export capabilities** for financial planning
- **Responsive design** that works on any screen size

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Grid & Flexbox
- **JavaScript (ES6+)** - Vanilla JS for UI interactions
- **Chart.js** - Interactive data visualization
- **Vite** - Fast development and building

### Backend
- **Rust** - Safe, fast calculations
- **Tauri** - Desktop app framework
- **Serde** - JSON serialization

## 🚀 Getting Started

### Prerequisites Setup (Educational Guide)

This project requires both **Node.js** and **Rust** because Tauri uses a unique architecture:
- **Node.js**: Powers the frontend development tools (Vite, npm packages)
- **Rust**: Powers the native backend that handles calculations and system interactions

#### 1. Install Node.js (JavaScript Runtime)
**What it does**: Node.js lets us run JavaScript on the server/development machine, not just in browsers.

**Download**: [nodejs.org](https://nodejs.org/) - Choose the **LTS version** (Long Term Support)

**Windows Installation**:
- Download the `.msi` installer
- ✅ Check "Add to PATH" during installation
- ✅ Check "Install additional tools" (includes build tools for native modules)

**Verify installation**:
```bash
node --version    # Should show v18.x.x or later
npm --version     # Should show 9.x.x or later
```

#### 2. Install Rust (Systems Programming Language)
**What it does**: Rust provides memory safety, zero-cost abstractions, and blazing performance for our backend calculations.

**Why Rust for desktop apps?**
- **Memory Safe**: No buffer overflows, null pointer dereferences, or memory leaks
- **Fast**: Performance comparable to C/C++ but much safer
- **Cross-platform**: Same code runs on Windows, macOS, and Linux

**Installation via Rustup**:
1. Visit [rustup.rs](https://rustup.rs/)
2. Download `rustup-init.exe` for Windows
3. Run it and follow the prompts (default options are fine)
4. Restart your terminal/PowerShell

**Verify installation**:
```bash
rustc --version    # Rust compiler version
cargo --version    # Cargo package manager version
```

#### 3. Install Visual Studio Build Tools (Windows Only)
**Why needed**: Rust needs a C++ compiler for linking and some dependencies.

**Options**:
- **Option A**: Install "Build Tools for Visual Studio 2022" (minimal)
- **Option B**: Full Visual Studio Community (includes IDE)
- **Option C**: If you have VS Code, it might prompt to install automatically

#### 4. Install Tauri CLI (After Rust is installed)
**What it does**: Provides commands to build, develop, and package Tauri applications.

```bash
npm install -g @tauri-apps/cli
# or install locally in project
npm install --save-dev @tauri-apps/cli
```

### Installation Steps (Complete Walkthrough)

#### Step 1: Project Setup
```bash
# Navigate to your projects directory
cd C:\Users\YourName\Documents\

# Clone or download the project
git clone <repository-url>
cd amortization-calc-tauri

# Install frontend dependencies
npm install
```

**What `npm install` does**:
- Reads `package.json` to see what packages we need
- Downloads packages from npm registry
- Creates `node_modules/` folder with all dependencies
- Creates `package-lock.json` to lock specific versions

**Packages installed**:
- `vite`: Fast build tool and dev server
- `@tauri-apps/api`: JavaScript bindings to communicate with Rust backend
- `@tauri-apps/cli`: Command-line tools for Tauri development
- `chart.js`: Charting library for visualizations

#### Step 2: Generate Icons (Required for Tauri)
**Why needed**: Tauri apps need icons for:
- Windows: `.ico` files for the executable
- macOS: `.icns` files for the app bundle
- Linux: `.png` files for desktop entries

```bash
# Create an icon from SVG (we provide app-icon.svg)
npx tauri icon app-icon.svg
```

**What this creates**:
```
src-tauri/icons/
├── 32x32.png          # Small icon for taskbar
├── 128x128.png        # Medium icon for file explorer
├── 128x128@2x.png     # High-DPI version
├── icon.ico           # Windows executable icon
├── icon.icns          # macOS app bundle icon
└── icon.png           # Default fallback icon
```

#### Step 3: Build Frontend Assets
```bash
# Build the frontend (HTML, CSS, JS) for production
npm run build
```

**What happens**:
1. **Vite processes files**:
   - Bundles JavaScript modules
   - Minifies CSS and JS
   - Optimizes images
   - Creates hash-based filenames for caching

2. **Creates `dist/` folder**:
   ```
   dist/
   ├── index.html              # Main HTML file
   ├── assets/
   │   ├── index-[hash].css    # Bundled and minified CSS
   │   └── index-[hash].js     # Bundled and minified JavaScript
   ```

3. **Tauri will serve these files**: The Rust backend serves these static files to the webview

#### Step 4: Build Rust Backend
```bash
cd src-tauri
cargo build
```

**What `cargo build` does**:
1. **Reads `Cargo.toml`**: Similar to `package.json` for Rust
2. **Downloads crates**: Rust packages from crates.io
3. **Compiles dependencies**: All external libraries
4. **Compiles our code**: The main.rs file with our business logic
5. **Links everything**: Creates the final executable

**Key dependencies installed**:
- `tauri`: Main framework for desktop app creation
- `serde`: Serialization/deserialization for JSON data
- `serde_json`: JSON handling specifically
- `csv`: CSV file generation for exports

#### Step 5: Run in Development Mode
```bash
cd ..  # Go back to project root
npm run tauri:dev
```

**What happens in dev mode**:
1. **Vite dev server starts**: Serves frontend with hot-reload on `http://localhost:1420`
2. **Rust app compiles**: Builds the backend if needed
3. **Tauri window opens**: Native desktop window that loads the dev server
4. **Hot reload active**: Changes to frontend automatically refresh
5. **Rust changes require restart**: Backend changes need manual restart

### Development (Educational Deep Dive)

#### Understanding the Development Workflow

**Tauri's Unique Architecture**:
Unlike traditional desktop apps, Tauri uses a **web frontend + native backend** approach:

```
┌─────────────────────┐    ┌───────────────────────┐
│    Web Frontend     │    │    Rust Backend       │
│  (HTML/CSS/JS)      │◄──►│   (Native Code)       │
│                     │    │                       │
│ • User Interface    │    │ • File System Access │
│ • User Interactions │    │ • Calculations        │
│ • Charts & Graphics │    │ • Security Layer      │
│ • Form Validation   │    │ • System APIs         │
└─────────────────────┘    └───────────────────────┘
       WebView                    Native Process
```

**Communication Bridge**:
- **Frontend → Backend**: JavaScript calls Rust functions via `invoke()`
- **Backend → Frontend**: Rust returns data as JSON
- **Security**: Only explicitly allowed functions can be called

#### Development Commands Explained

**Start development server:**
```bash
npm run tauri:dev
```

**What this command does step-by-step**:

1. **Checks `package.json` scripts**:
   ```json
   "scripts": {
     "tauri:dev": "tauri dev"
   }
   ```

2. **Tauri reads `src-tauri/tauri.conf.json`**:
   ```json
   "build": {
     "beforeDevCommand": "npm run dev",
     "devPath": "http://localhost:1420"
   }
   ```

3. **Starts Vite dev server** (`npm run dev`):
   - Compiles JavaScript/CSS in real-time
   - Serves files on `http://localhost:1420`
   - Watches for file changes
   - Enables hot module replacement (HMR)

4. **Compiles Rust backend** (if changed):
   - Reads `src-tauri/Cargo.toml` for dependencies
   - Compiles `src-tauri/src/main.rs`
   - Links all dependencies
   - Creates executable

5. **Launches desktop window**:
   - Creates native window using system webview
   - Loads `http://localhost:1420` in the webview
   - Establishes IPC (Inter-Process Communication) bridge
   - Applies security policies from config

**Development Features Active**:
- ✅ **Hot Reload**: Frontend changes instantly visible
- ✅ **DevTools**: Right-click → Inspect Element (same as browser)
- ✅ **Console Logging**: `console.log()` works for debugging
- ✅ **Network Tab**: Monitor API calls to Rust backend
- ✅ **Error Overlay**: Build errors shown in the app window

**Build for production:**
```bash
npm run tauri:build
```

**Production build process**:

1. **Frontend optimization** (`npm run build`):
   ```bash
   vite build
   ```
   - **Tree shaking**: Removes unused code
   - **Minification**: Reduces file sizes
   - **Code splitting**: Separates vendor and app code
   - **Asset optimization**: Compresses images, etc.
   - **Creates `dist/` folder** with optimized files

2. **Backend compilation**:
   ```bash
   cargo build --release
   ```
   - **Release mode**: Maximum optimizations enabled
   - **No debug symbols**: Smaller binary size
   - **Aggressive inlining**: Function calls optimized away
   - **Dead code elimination**: Unused code removed

3. **App bundling**:
   - **Windows**: Creates `.exe` and `.msi` installer
   - **macOS**: Creates `.app` bundle and `.dmg` disk image
   - **Linux**: Creates `.deb` package and `AppImage`

4. **Code signing** (if configured):
   - **Windows**: Authenticode signing
   - **macOS**: Apple Developer Program signing
   - **Linux**: GPG signing

#### 📁 Local Build Output Locations

When you build locally using `npm run tauri build`, the executables are created in:

```
src-tauri/target/release/bundle/
├── deb/
│   └── amortization-calculator_*.deb     # Debian package (Linux)
├── appimage/
│   └── amortization-calculator_*.AppImage # Portable Linux app
├── msi/
│   └── amortization-calculator_*.msi     # Windows installer
├── nsis/
│   └── amortization-calculator.exe      # Windows executable
├── dmg/
│   └── amortization-calculator_*.dmg    # macOS disk image
└── macos/
    └── amortization-calculator.app      # macOS application bundle
```

**File Sizes**: All builds are approximately **15MB** (much smaller than Electron alternatives!)

**Distribution**: These files can be shared and installed on other computers without requiring development tools.

## 📖 Usage Guide

### Basic Calculation
1. Enter **Principal Amount** (loan amount)
2. Set **Annual Interest Rate** (%)
3. Choose **Loan Term** (years or months)
4. Click **Calculate**

### Advanced Features
- **Interactive Chart**: Hover over data points for details
- **Payment Table**: View detailed payment breakdown
- **Extra Payments**: Add one-time payments to see impact
- **Export CSV**: Download complete payment schedule

### Example Calculation
- **Principal**: $250,000
- **Rate**: 6.5% annual
- **Term**: 30 years
- **Result**: $1,580.17 monthly payment

## 🏗️ Project Architecture (Educational Deep Dive)

### Understanding Tauri's Hybrid Architecture

**Traditional Desktop Apps**:
```
┌─────────────────────────────────────┐
│          Native Application         │
│  (C++, C#, Java, Qt, etc.)         │
│                                     │
│  UI + Logic + System Access        │
│  All in one process                 │
└─────────────────────────────────────┘
```

**Electron Apps**:
```
┌─────────────────────────────────────┐
│         Chromium Browser            │
│  ┌─────────────────────────────┐    │
│  │     Web Frontend            │    │
│  │   (HTML/CSS/JS)             │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │     Node.js Backend         │    │
│  │   (JavaScript)              │    │
│  └─────────────────────────────┘    │
│                                     │
│  Large bundle (~150MB+)             │
└─────────────────────────────────────┘
```

**Tauri Apps** (Our approach):
```
┌─────────────────────────────────────┐
│        System WebView               │
│  ┌─────────────────────────────┐    │
│  │     Web Frontend            │    │
│  │   (HTML/CSS/JS)             │    │
│  │   • User Interface          │    │
│  │   • Charts & Animations     │    │
│  │   • Form Validation         │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
              ↕ IPC Bridge
┌─────────────────────────────────────┐
│        Rust Backend                 │
│  • File System Access              │
│  • Mathematical Calculations       │
│  • CSV Export                      │
│  • Security Layer                  │
│  • System API Access               │
│                                     │
│  Small binary (~15MB)               │
└─────────────────────────────────────┘
```

### File Structure Explained

```
amortization-calc-tauri/
├── 📁 Frontend (Web Technologies)
│   ├── index.html                 # Main HTML entry point
│   ├── src/
│   │   ├── main.js               # JavaScript application logic
│   │   └── style.css             # Modern CSS styling
│   ├── package.json              # Node.js dependencies & scripts
│   ├── vite.config.js            # Build tool configuration
│   └── dist/                     # Built frontend (generated)
│       ├── index.html            # Optimized HTML
│       └── assets/               # Bundled CSS/JS/images
│
├── 📁 Backend (Rust/Tauri)
│   └── src-tauri/
│       ├── src/
│       │   ├── main.rs           # Rust application entry point
│       │   └── lib.rs            # Additional Rust modules (optional)
│       ├── Cargo.toml            # Rust dependencies & metadata
│       ├── tauri.conf.json       # Tauri app configuration
│       ├── build.rs              # Build script (optional)
│       ├── icons/                # App icons for all platforms
│       └── target/               # Compiled Rust code (generated)
│
├── 📁 Configuration & Assets
│   ├── app-icon.svg              # Source icon for generation
│   ├── .github/
│   │   └── copilot-instructions.md # AI coding assistant instructions
│   └── README.md                 # This documentation
```

#### Key Files Deep Dive

**`index.html`** - The frontend entry point:
```html
<!DOCTYPE html>
<html>
<head>
    <!-- Meta tags, title, CSS links -->
</head>
<body>
    <!-- Calculator UI elements -->
    <div id="app">
        <!-- Input forms, charts, results -->
    </div>
    
    <!-- JavaScript entry point -->
    <script type="module" src="/src/main.js"></script>
</body>
</html>
```

**`src/main.js`** - Frontend logic and Tauri communication:
```javascript
import { invoke } from '@tauri-apps/api/tauri';

// Call Rust backend functions
const result = await invoke('calculate_amortization', {
    principal: 250000,
    rate: 6.5,
    years: 30
});

// Update UI with results
displayResults(result);
```

**`src/style.css`** - Modern styling:
```css
/* CSS Grid for responsive layout */
.calculator-grid {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 2rem;
}

/* Glass morphism effects */
.glass-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 12px;
}
```

**`src-tauri/src/main.rs`** - Rust backend:
```rust
// Tauri command that can be called from frontend
#[tauri::command]
fn calculate_amortization(
    principal: f64,
    rate: f64,
    years: f64
) -> Result<AmortizationData, String> {
    // Mathematical calculations here
    // Return structured data as JSON
}

// Main function - app entry point
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            calculate_amortization,
            export_to_csv
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**`src-tauri/Cargo.toml`** - Rust dependencies:
```toml
[package]
name = "amortization-calc-tauri"
version = "1.0.0"
edition = "2021"

[dependencies]
tauri = { version = "1.5", features = ["fs-write-file", "shell-open"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
csv = "1.3"
```

**`src-tauri/tauri.conf.json`** - App configuration:
```json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:1420",
    "distDir": "../dist"
  },
  "tauri": {
    "allowlist": {
      "fs": { "writeFile": true },
      "shell": { "open": true }
    },
    "windows": [{
      "title": "Amortization Calculator",
      "width": 1200,
      "height": 800
    }]
  }
}
```

## 🔄 CI/CD & Multi-Platform Builds

This project features a robust **GitHub Actions** workflow that automatically builds the application for **Windows**, **Linux**, and **macOS** whenever a new version tag is pushed.

### 🏗️ Automated Build Pipeline

The CI/CD system creates native installers for all major platforms:

| Platform | Artifacts Generated | Runner |
|----------|-------------------|--------|
| **Windows** | `.msi` installer, `.exe` executable | `windows-latest` |
| **Linux** | `.deb` package, `.AppImage` | `ubuntu-22.04` |
| **macOS** | `.dmg` disk image, `.app` bundle | `macos-latest` |

### 🚀 How It Works

1. **Trigger**: Push a version tag (e.g., `v1.0.0`) to trigger builds
2. **Parallel Execution**: All three platforms build simultaneously 
3. **Dependency Management**: Automatic installation of platform-specific requirements
4. **Artifact Upload**: Built packages are automatically uploaded and available for download
5. **Caching**: Rust dependencies are cached to speed up subsequent builds

### 🔧 Linux Build Configuration

The Linux build required special attention to dependency management:

```yaml
runs-on: ubuntu-22.04  # Specific version for package compatibility
```

**Required System Dependencies:**
- `libwebkit2gtk-4.0-dev` - WebKit engine for the UI
- `libjavascriptcoregtk-4.0-dev` - JavaScript execution engine
- `libgtk-3-dev` - GTK development libraries
- `libayatana-appindicator3-dev` - System tray support
- `librsvg2-dev` - SVG rendering
- `libdbus-1-dev` - System communication
- `libudev-dev` - Device management
- `libsoup2.4-dev` - HTTP client library
- `pkg-config` - Build configuration
- Standard build tools (`build-essential`, `curl`, `wget`, `libssl-dev`)

### 🎯 Usage

To trigger a new build:

```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```

### 📦 Download Builds

After successful completion, artifacts are available in the GitHub Actions tab:
- Go to your repository → Actions → Select the workflow run
- Scroll down to "Artifacts" section
- Download platform-specific builds

### 📥 Downloading Pre-Built Executables

If you don't want to build from source, you can download ready-to-use executables from our automated builds:

#### **GitHub Actions Artifacts**

1. **Navigate to the repository**: https://github.com/LaurenS-11/amortizationCalcTauri_Win10
2. **Click the "Actions" tab** at the top of the repository
3. **Find the latest successful workflow run** (look for green checkmarks)
4. **Scroll down to the "Artifacts" section** at the bottom of the run page

#### **Available Downloads**

| Artifact Package | Platform | Contains | File Size |
|------------------|----------|----------|-----------|
| **`linux-builds`** | Linux | `.deb` package + `.AppImage` | ~15MB |
| **`windows-builds`** | Windows | `.msi` installer + `.exe` | ~15MB |
| **`macos-builds`** | macOS | `.dmg` disk image + `.app` bundle | ~15MB |

#### **Installation Instructions**

**Linux Users:**
```bash
# Option 1: Install .deb package (Ubuntu/Debian)
sudo dpkg -i amortization-calculator_*.deb

# Option 2: Run AppImage (any Linux distribution)
chmod +x amortization-calculator_*.AppImage
./amortization-calculator_*.AppImage
```

**Windows Users:**
```cmd
# Option 1: Run the MSI installer (recommended)
# Double-click the .msi file and follow the installer

# Option 2: Run the standalone executable
# Just double-click the .exe file
```

**macOS Users:**
```bash
# Option 1: Mount and install from DMG
# Double-click the .dmg file and drag the app to Applications

# Option 2: Run the .app bundle directly
# Double-click the .app file
```

#### **Artifact Retention**
- **Availability**: Artifacts are available for **90 days** after the build
- **Access**: No GitHub account required for download
- **Updates**: New builds are created automatically when version tags are pushed

#### **Troubleshooting Downloads**
- **File not found**: The artifact may have expired (90+ days old)
- **Permission denied**: On Linux/macOS, you may need to make files executable: `chmod +x filename`
- **Security warnings**: Some systems may warn about unsigned executables - this is normal for open-source builds

### 🛠️ Development Notes

This CI/CD setup demonstrates:
- **Cross-platform compatibility** - Single codebase, multiple native outputs
- **Dependency resolution** - Handling different package managers and system requirements
- **Build optimization** - Caching strategies for faster builds
- **Artifact management** - Organized distribution of build outputs

The workflow configuration showcases advanced GitHub Actions techniques including matrix builds, conditional steps, and artifact handling for desktop application deployment.

---

**Built with ❤️ using Tauri, Rust, and modern web technologies**
