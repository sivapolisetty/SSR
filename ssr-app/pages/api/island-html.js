import React from 'react';
import { renderToString } from 'react-dom/server';
import InteractiveDataTable from '../../src/islands/InteractiveDataTable';
import WeatherWidget from '../../src/islands/WeatherWidget';
import ShoppingCart from '../../src/islands/ShoppingCart';
import Counter from '../../src/islands/Counter';

// Island component registry
const ISLAND_COMPONENTS = {
  InteractiveDataTable,
  WeatherWidget,
  ShoppingCart,
  Counter
};

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { component, props = '{}', strategy = 'lazy', priority = 'normal', islandId } = req.query;
  
  try {
    // Parse props
    let componentProps = {};
    try {
      componentProps = JSON.parse(props);
    } catch (e) {
      console.warn('Failed to parse props:', props);
    }

    // Get the component
    const Component = ISLAND_COMPONENTS[component];
    if (!Component) {
      return res.status(404).json({ 
        error: `Component "${component}" not found`,
        available: Object.keys(ISLAND_COMPONENTS)
      });
    }

    // Add island metadata to props
    const enhancedProps = {
      ...componentProps,
      hydrationStrategy: strategy,
      priority,
      islandId
    };

    console.log(`🏝️ Rendering SSR HTML for island: ${component}`);

    // Render component to HTML string
    const htmlContent = renderToString(React.createElement(Component, enhancedProps));
    
    // Wrap with island boundary markers
    const wrappedHtml = `
      <div 
        data-island="${component}" 
        data-island-id="${islandId}"
        data-hydration-strategy="${strategy}"
        data-priority="${priority}"
        data-props="${encodeURIComponent(props)}"
        data-ssr-rendered="true"
        data-render-time="${Date.now()}"
      >
        ${htmlContent}
      </div>
    `;

    // Set appropriate headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60'); // Cache for 1 minute
    
    // Return the HTML
    res.status(200).send(wrappedHtml);
    
  } catch (error) {
    console.error('Error rendering island HTML:', error);
    
    // Return error HTML that can still be hydrated
    const errorHtml = `
      <div 
        data-island="${component}" 
        data-island-id="${islandId}"
        data-hydration-strategy="${strategy}"
        data-priority="${priority}"
        data-props="${encodeURIComponent(props)}"
        data-ssr-error="true"
        style="padding: 20px; border: 2px solid #f44336; border-radius: 8px; background-color: #ffebee; color: #c62828; margin: 20px;"
      >
        <h3>🚨 SSR Error: ${component}</h3>
        <p>Failed to render server-side HTML</p>
        <details>
          <summary>Error Details</summary>
          <pre style="font-size: 12px; white-space: pre-wrap;">${error.message}</pre>
        </details>
        <p style="font-size: 12px; margin-top: 10px;">
          Component will attempt to hydrate with JavaScript fallback.
        </p>
      </div>
    `;
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(500).send(errorHtml);
  }
}