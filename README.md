# SSR vs CSR Demo - React Hydration & Module Federation

This repository demonstrates the differences between Server-Side Rendering (SSR) and Client-Side Rendering (CSR), including proper React hydration and Module Federation integration.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- npm

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/SSR.git
   cd SSR
   ```

2. **Install dependencies for both apps**
   ```bash
   # Install SSR app dependencies
   cd ssr-app
   npm install
   cd ..

   # Install CSR app dependencies  
   cd csr-app
   npm install
   cd ..
   ```

3. **Start both applications**
   ```bash
   # Terminal 1: Start SSR app (Next.js on port 3002)
   cd ssr-app
   npm run dev

   # Terminal 2: Start CSR app (React on port 3003)
   cd csr-app
   npm start
   ```

## 📱 Demo Applications

### SSR App (Port 3002)
- **URL**: http://localhost:3002
- **Framework**: Next.js with Module Federation
- **Features**: 
  - Server-side rendering
  - Pre-rendered HTML components
  - API endpoints for HTML fragments
  - Module Federation host

### CSR App (Port 3003)  
- **URL**: http://localhost:3003
- **Framework**: Create React App with Module Federation
- **Features**:
  - Client-side rendering
  - React hydration demos
  - Module Federation consumer
  - Interactive state management

## 🎯 Demo Features

### 1. **🔴 CSR Demo** 
- Pure client-side rendering
- Loading states and JavaScript parsing
- View source shows empty `<div id="root">`

### 2. **🟢 SSR HTML in CSR**
- Fetches pre-rendered HTML from SSR server
- Direct HTML injection
- Fast first paint demonstration

### 3. **⚡ Proper React Hydration** 
- SSR component with JavaScript interactivity
- Click row selection with state management
- Message passing between SSR and CSR components
- Performance metrics tracking

### 4. **🔄 Module Federation**
- SSR components consumed by CSR app
- Dynamic component loading
- Shared React components across applications

## 🧪 Performance Comparison

| Metric | SSR | CSR |
|--------|-----|-----|
| **Time to First Byte (TTFB)** | Slower ⚠️ | Faster ✓ |
| **First Contentful Paint (FCP)** | **Much Faster ✓✓** | Much Slower ✗ |
| **Time to Interactive (TTI)** | Moderate | Slower ✗ |
| **SEO Friendliness** | **Excellent ✓✓** | Poor ✗ |

## 🔍 Key Demonstrations

### View Source Test
- **SSR**: Right-click → View Source → See complete HTML with data
- **CSR**: Right-click → View Source → See only empty `<div id="root"></div>`

### Network Performance
- **SSR**: Initial HTML document contains full content
- **CSR**: Initial HTML is empty, content loads after JS bundle

### Interactive Hydration
- **SSR Component**: Pre-rendered HTML + JavaScript event listeners
- **State Communication**: Selection updates flow from SSR to CSR parent
- **Real-time Updates**: Click any row to see state synchronization

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   SSR App       │    │   CSR App       │
│  (Next.js)      │    │  (React)        │
│  Port 3002      │    │  Port 3003      │
│                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ SSR Pages   │ │    │ │ CSR Pages   │ │
│ │ API Routes  │ │◄───┤ │ Hydration   │ │
│ │ Components  │ │    │ │ Demos       │ │
│ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │
│ Module Federation│    │ Module Federation│
│     (Host)      │    │   (Consumer)    │
└─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
SSR/
├── README.md
├── csr-app/                    # React CSR Application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FederatedComponents.tsx
│   │   │   ├── HeavyCSRComponent.tsx
│   │   │   ├── SSRHtmlSection.tsx
│   │   │   ├── ProperHydrationDemo.tsx
│   │   │   ├── InteractiveTable.tsx
│   │   │   └── TabMenu.tsx
│   │   ├── pages/
│   │   │   └── CSRDemo.tsx
│   │   └── App.tsx
│   ├── config-overrides.js     # Module Federation config
│   └── package.json
└── ssr-app/                    # Next.js SSR Application  
    ├── components/
    │   └── InteractiveTable.js
    ├── pages/
    │   ├── api/
    │   │   ├── html-fragment.js
    │   │   ├── interactive-fragment.js
    │   │   └── react-fragment.js
    │   ├── index.js
    │   └── ssr-demo.js
    ├── src/components/
    │   ├── ProductCard.js
    │   └── UserProfile.js
    ├── next.config.js           # Module Federation config
    └── package.json
```

## 🛠️ Technical Features

### Module Federation Setup
- **SSR App**: Exposes `ProductCard` and `UserProfile` components
- **CSR App**: Consumes federated components from SSR app
- **Runtime Sharing**: React and ReactDOM shared between applications

### Hydration Implementation
- **Server-Safe Components**: Components that can render on server without hooks
- **Event Listener Injection**: JavaScript added to SSR HTML for interactivity  
- **Message Communication**: PostMessage API for SSR ↔ CSR state sync
- **Performance Monitoring**: Fetch time, hydration time, and interaction metrics

### API Endpoints
- `/api/html-fragment`: Returns static pre-rendered HTML
- `/api/react-fragment`: Returns interactive SSR component with JavaScript
- `/api/interactive-fragment`: Advanced interactive component (legacy)

## 🎓 Learning Objectives

This demo teaches:

1. **SSR Benefits**: Fast first paint, SEO optimization, accessibility
2. **CSR Limitations**: Blank initial state, SEO challenges, slower FCP
3. **Hydration Process**: Making SSR content interactive with CSR
4. **Module Federation**: Sharing components across applications
5. **Performance Optimization**: Measuring and comparing rendering strategies
6. **State Management**: Communication between different rendering strategies

## 🚀 Development Tips

### For SSR Components
- Avoid React hooks in server-rendered components
- Use `typeof window === 'undefined'` checks for browser-only code
- Implement event listeners via script injection for interactivity

### For CSR Hydration
- Use PostMessage API for cross-component communication
- Implement proper error handling for failed hydration
- Monitor performance metrics to verify optimization benefits

### Module Federation
- Ensure React version compatibility between apps
- Use shared dependencies to avoid duplication
- Test federated components in isolation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Next Steps

- [ ] Add TypeScript to SSR app
- [ ] Implement React 18 Streaming SSR
- [ ] Add service worker for offline functionality
- [ ] Implement incremental static regeneration (ISR)
- [ ] Add automated performance testing
- [ ] Deploy to production with CDN

---

**Built with ❤️ to demonstrate SSR vs CSR performance differences and proper React hydration techniques.**