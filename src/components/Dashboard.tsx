import { useState } from 'react';
import { useCryptoData } from '../hooks/useCryptoData';
import { CryptoCard } from './CryptoCard';
import { PriceChart } from './PriceChart';
import { Activity, Loader2, AlertCircle } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import type { Theme, Currency } from '../context/PreferencesContext';

export function Dashboard() {
  const { data, loading, error, ASSETS } = useCryptoData();
  const [selectedAsset, setSelectedAsset] = useState<string>(ASSETS[0] || 'BTCUSDT');
  const { theme, setTheme, currency, setCurrency, exchangeRates } = usePreferences();
  const rate = exchangeRates[currency] || 1;

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px' }}>
        <Loader2 className="animate-spin" size={48} color="var(--accent-color)" />
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem' }}>Loading market data...</p>
      </div>
    );
  }

  if (error || Object.keys(data).length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px' }}>
        <AlertCircle size={48} color="var(--danger-color)" />
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem' }}>{error || "Failed to load data"}</p>
      </div>
    );
  }

  const selectedData = data[selectedAsset];
  const isPositive = selectedData ? selectedData.change24h >= 0 : true;
  const chartColor = isPositive ? '#10b981' : '#ef4444';

  return (
    <div style={{ padding: '32px', maxWidth: '1440px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ 
          background: 'var(--glass-bg)', 
          padding: '12px', 
          borderRadius: '12px',
          border: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px var(--accent-glow)'
        }}>
          <Activity size={28} color="var(--accent-color)" />
        </div>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }} className="text-gradient">Pulse Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Real-time Cryptocurrency Markets</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px' }}>
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="select-input"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="JPY">JPY (¥)</option>
          </select>
          <select 
            value={theme} 
            onChange={(e) => setTheme(e.target.value as Theme)}
            className="select-input"
          >
            <option value="dark">Dark Theme</option>
            <option value="light">Light Theme</option>
            <option value="neon">Neon Theme</option>
          </select>
        </div>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '24px',
        marginBottom: '40px'
      }}>
        {ASSETS.map(assetId => {
          const assetData = data[assetId];
          if (!assetData) return null;
          return (
            <CryptoCard 
              key={assetId} 
              data={assetData} 
              isSelected={selectedAsset === assetId}
              onClick={() => setSelectedAsset(assetId)}
            />
          );
        })}
      </div>

      {selectedData && (
        <div className="glass-panel" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>{selectedData.name} Overview</h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Last 24 hours</p>
            </div>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: 700,
              color: isPositive ? 'var(--success-color)' : 'var(--danger-color)'
            }}>
              {new Intl.NumberFormat(currency === 'JPY' ? 'ja-JP' : currency === 'EUR' ? 'de-DE' : 'en-US', { 
                style: 'currency', 
                currency: currency,
                minimumFractionDigits: (selectedData.price * rate) < 1 ? 4 : currency === 'JPY' ? 0 : 2,
                maximumFractionDigits: (selectedData.price * rate) < 1 ? 4 : currency === 'JPY' ? 0 : 2,
              }).format(selectedData.price * rate)}
            </div>
          </div>
          
          <PriceChart 
            data={selectedData.history} 
            color={chartColor} 
          />
        </div>
      )}
    </div>
  );
}
