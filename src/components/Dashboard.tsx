import { useState } from 'react';
import { useCryptoData } from '../hooks/useCryptoData';
import { CryptoCard } from './CryptoCard';
import { PriceChart } from './PriceChart';
import { Activity, Loader2, AlertCircle, Home, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import type { Theme, Currency } from '../context/PreferencesContext';

export function Dashboard() {
  const { data, loading, error, ASSETS } = useCryptoData();
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null); // null means Home
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

  const selectedData = selectedAsset ? data[selectedAsset] : null;
  const isPositive = selectedData ? selectedData.change24h >= 0 : true;
  const chartColor = isPositive ? '#10b981' : '#ef4444';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-color)' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '300px', 
        borderRight: '1px solid var(--glass-border)', 
        background: 'var(--glass-bg)', 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh', 
        position: 'sticky', 
        top: 0,
        backdropFilter: 'blur(20px)',
        zIndex: 10
      }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ 
            background: 'var(--accent-glow)', 
            padding: '8px', 
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Activity size={24} color="var(--accent-color)" />
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }} className="text-gradient">Pulse</h1>
        </div>

        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div 
            onClick={() => setSelectedAsset(null)}
            style={{ 
              padding: '12px 16px', 
              cursor: 'pointer', 
              borderRadius: '12px', 
              background: selectedAsset === null ? 'var(--accent-glow)' : 'transparent',
              color: selectedAsset === null ? 'var(--accent-color)' : 'var(--text-color)',
              fontWeight: selectedAsset === null ? 600 : 500,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s ease'
            }}
            className={selectedAsset === null ? '' : 'sidebar-item-hover'}
          >
            <Home size={20} />
            Home
          </div>

          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginTop: '16px', marginBottom: '8px', paddingLeft: '16px', fontWeight: 600 }}>
            Markets
          </div>
          
          {ASSETS.map(assetId => {
            const assetData = data[assetId];
            if (!assetData) return null;
            const isSelected = selectedAsset === assetId;
            const isAssetPositive = assetData.change24h >= 0;
            return (
              <div 
                key={assetId}
                onClick={() => setSelectedAsset(assetId)}
                style={{ 
                  padding: '10px 16px', 
                  cursor: 'pointer', 
                  borderRadius: '12px', 
                  background: isSelected ? 'var(--accent-glow)' : 'transparent',
                  color: isSelected ? 'var(--accent-color)' : 'var(--text-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease'
                }}
                className={isSelected ? '' : 'sidebar-item-hover'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', 
                    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 'bold'
                  }}>
                    {assetData.symbol.substring(0, 3)}
                  </div>
                  <span style={{ fontWeight: isSelected ? 600 : 500 }}>{assetData.name}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {new Intl.NumberFormat(currency === 'JPY' ? 'ja-JP' : currency === 'EUR' ? 'de-DE' : 'en-US', {
                      style: 'currency', currency,
                      minimumFractionDigits: (assetData.price * rate) < 1 ? 4 : currency === 'JPY' ? 0 : 2,
                    }).format(assetData.price * rate)}
                  </span>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    color: isAssetPositive ? 'var(--success-color)' : 'var(--danger-color)',
                    display: 'flex', alignItems: 'center', gap: '2px'
                  }}>
                    {isAssetPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {Math.abs(assetData.change24h).toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, height: '100vh', overflowY: 'auto' }}>
        <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
          <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
                {selectedAsset === null ? 'Market Overview' : `${selectedData?.name} Dashboard`}
              </h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                {selectedAsset === null ? 'Real-time cryptocurrency tracking' : `Detailed metrics and chart for ${selectedData?.symbol}`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
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

          {selectedAsset === null ? (
            /* Home View */
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
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
                    isSelected={false}
                    onClick={() => setSelectedAsset(assetId)}
                  />
                );
              })}
            </div>
          ) : (
            /* Detail View */
            selectedData && (
              <div className="glass-panel" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ 
                      width: '64px', height: '64px', borderRadius: '50%', 
                      background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.5rem', fontWeight: 'bold', boxShadow: '0 8px 32px var(--accent-glow)'
                    }}>
                      {selectedData.symbol.substring(0, 3)}
                    </div>
                    <div>
                      <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {selectedData.name}
                        <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500, backgroundColor: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '12px' }}>
                          {selectedData.symbol}
                        </span>
                      </h2>
                      <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <BarChart3 size={16} /> Volume (24h): {new Intl.NumberFormat(currency === 'JPY' ? 'ja-JP' : currency === 'EUR' ? 'de-DE' : 'en-US', { style: 'currency', currency, notation: 'compact' }).format(selectedData.volume24h * rate)}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: '2.5rem', 
                      fontWeight: 700,
                      lineHeight: 1,
                      marginBottom: '8px',
                      color: 'var(--text-color)'
                    }}>
                      {new Intl.NumberFormat(currency === 'JPY' ? 'ja-JP' : currency === 'EUR' ? 'de-DE' : 'en-US', { 
                        style: 'currency', 
                        currency: currency,
                        minimumFractionDigits: (selectedData.price * rate) < 1 ? 4 : currency === 'JPY' ? 0 : 2,
                        maximumFractionDigits: (selectedData.price * rate) < 1 ? 4 : currency === 'JPY' ? 0 : 2,
                      }).format(selectedData.price * rate)}
                    </div>
                    <div style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      color: isPositive ? 'var(--success-color)' : 'var(--danger-color)',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      backgroundColor: isPositive ? 'var(--success-glow)' : 'var(--danger-glow)',
                      padding: '6px 12px',
                      borderRadius: '20px'
                    }}>
                      {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                      {Math.abs(selectedData.change24h).toFixed(2)}%
                    </div>
                  </div>
                </div>
                
                <div style={{ 
                  background: 'rgba(0,0,0,0.2)', 
                  borderRadius: '16px', 
                  padding: '24px',
                  border: '1px solid var(--glass-border)'
                }}>
                  <PriceChart 
                    data={selectedData.history} 
                    color={chartColor} 
                  />
                </div>

                {/* Decorative blob */}
                <div style={{
                  position: 'absolute',
                  top: '-10%',
                  right: '-5%',
                  width: '300px',
                  height: '300px',
                  background: chartColor,
                  filter: 'blur(120px)',
                  opacity: 0.1,
                  borderRadius: '50%',
                  pointerEvents: 'none',
                  zIndex: 0
                }} />
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}
