import React from 'react';

// Static component for SSR
const WeatherWidgetSSR = ({ 
  location = 'San Francisco',
  hydrationStrategy = 'interaction',
  priority = 'low' 
}) => {
  // Default weather data for SSR
  const weatherData = {
    location,
    temperature: 22,
    condition: 'Sunny',
    humidity: 65,
    windSpeed: 12,
    forecast: [
      { day: 'Today', high: 22, low: 15, condition: 'Sunny' },
      { day: 'Tomorrow', high: 25, low: 18, condition: 'Cloudy' },
      { day: 'Tuesday', high: 20, low: 12, condition: 'Rainy' }
    ]
  };

  const expanded = false;
  const isHydrated = false;

  const getConditionIcon = (condition) => {
    const icons = {
      Sunny: '☀️',
      Cloudy: '☁️',
      Rainy: '🌧️',
      Windy: '💨'
    };
    return icons[condition] || '🌤️';
  };

  const getConditionColor = (condition) => {
    const colors = {
      Sunny: '#ff9800',
      Cloudy: '#9e9e9e',
      Rainy: '#2196f3',
      Windy: '#4caf50'
    };
    return colors[condition] || '#607d8b';
  };

  return (
    <div 
      style={{
        border: `2px solid ${getConditionColor(weatherData.condition)}`,
        borderRadius: '8px',
        padding: '20px',
        margin: '20px',
        backgroundColor: '#f8f9fa',
        cursor: 'default',
        transition: 'all 0.3s ease',
        transform: expanded ? 'scale(1.02)' : 'scale(1)',
        boxShadow: expanded ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      {/* Island Status Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
        padding: '8px',
        backgroundColor: isHydrated ? '#e8f5e9' : '#fff3e0',
        borderRadius: '4px',
        border: `1px solid ${isHydrated ? '#4caf50' : '#ff9800'}`
      }}>
        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
          🏝️ Weather Island
        </span>
        <span style={{
          fontSize: '11px',
          color: isHydrated ? '#2e7d32' : '#ef6c00',
          fontWeight: 'bold'
        }}>
          {isHydrated ? '✅ HYDRATED' : '⏳ HYDRATING...'}
        </span>
      </div>

      {/* Main Weather Display */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px'
      }}>
        <div>
          <h3 style={{ 
            margin: 0, 
            color: getConditionColor(weatherData.condition),
            fontSize: '18px'
          }}>
            📍 {weatherData.location}
          </h3>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#333',
            margin: '5px 0'
          }}>
            {weatherData.temperature}°C
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '16px',
            color: getConditionColor(weatherData.condition)
          }}>
            <span style={{ marginRight: '8px', fontSize: '24px' }}>
              {getConditionIcon(weatherData.condition)}
            </span>
            {weatherData.condition}
          </div>
        </div>
        
        <div style={{
          textAlign: 'right',
          fontSize: '12px',
          color: '#666'
        }}>
          <div>💧 {weatherData.humidity}%</div>
          <div style={{ marginTop: '5px' }}>💨 {weatherData.windSpeed} km/h</div>
          <div style={{ 
            marginTop: '10px', 
            fontSize: '10px',
            color: expanded ? '#4caf50' : '#ff9800',
            fontWeight: 'bold'
          }}>
            {expanded ? '🔽 Click to collapse' : '🔼 Click to expand'}
          </div>
        </div>
      </div>

      {/* Expanded Forecast */}
      {expanded && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: 'white',
          borderRadius: '6px',
          border: '1px solid #e0e0e0'
        }}>
          <h4 style={{ 
            margin: '0 0 15px 0', 
            color: '#333',
            fontSize: '14px',
            borderBottom: '1px solid #eee',
            paddingBottom: '8px'
          }}>
            📅 3-Day Forecast
          </h4>
          
          {weatherData.forecast.map((day, index) => (
            <div 
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: index < weatherData.forecast.length - 1 ? '1px solid #f0f0f0' : 'none'
              }}
            >
              <div style={{ fontWeight: '500', fontSize: '13px' }}>
                {day.day}
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                fontSize: '13px'
              }}>
                <span style={{ marginRight: '8px' }}>
                  {getConditionIcon(day.condition)}
                </span>
                <span style={{ color: '#666', marginRight: '10px' }}>
                  {day.high}°/{day.low}°
                </span>
                <span style={{ color: getConditionColor(day.condition) }}>
                  {day.condition}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Island Info */}
      <div style={{
        marginTop: '15px',
        padding: '8px',
        backgroundColor: '#e3f2fd',
        borderRadius: '4px',
        fontSize: '11px',
        color: '#1976d2'
      }}>
        <strong>🚀 Island Info:</strong> Hydration: {hydrationStrategy} | Priority: {priority} | 
        Status: Interactive {expanded ? '(expanded)' : '(collapsed)'}
      </div>
    </div>
  );
};

// Main component that decides which version to use
const WeatherWidget = (props) => {
  // For SSR, always use the SSR component
  if (typeof window === 'undefined') {
    return <WeatherWidgetSSR {...props} />;
  }
  
  // On client, use the SSR component initially
  return <WeatherWidgetSSR {...props} />;
};

export default WeatherWidget;