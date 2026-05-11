import { useEffect, useState } from 'react';
import type { CryptoData } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';

interface CryptoCardProps {
  data: CryptoData;
  onClick: () => void;
  isSelected: boolean;
}

export function CryptoCard({ data, onClick, isSelected }: CryptoCardProps) {
  const [flashClass, setFlashClass] = useState('');
  const isPositive = data.change24h >= 0;
  const { currency, exchangeRates } = usePreferences();
  const rate = exchangeRates[currency] || 1;

  useEffect(() => {
    if (data.previousPrice === null) return;
    
    if (data.price > data.previousPrice) {
      setFlashClass('flash-up');
      setTimeout(() => setFlashClass(''), 1000);
    } else if (data.price < data.previousPrice) {
      setFlashClass('flash-down');
      setTimeout(() => setFlashClass(''), 1000);
    }
  }, [data.price, data.previousPrice]);

  const displayPrice = data.price * rate;
  const displayVolume = data.volume24h * rate;

  const locale = currency === 'JPY' ? 'ja-JP' : currency === 'EUR' ? 'de-DE' : 'en-US';

  const formattedPrice = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: displayPrice < 1 ? 4 : currency === 'JPY' ? 0 : 2,
    maximumFractionDigits: displayPrice < 1 ? 4 : currency === 'JPY' ? 0 : 2,
  }).format(displayPrice);

  const formattedVolume = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(displayVolume);

  return (
    <div 
      className={`glass-panel ${flashClass}`} 
      onClick={onClick}
      style={{ 
        padding: '24px', 
        cursor: 'pointer',
        transform: isSelected ? 'translateY(-4px)' : 'none',
        borderColor: isSelected ? 'var(--accent-color)' : 'var(--glass-border)',
        boxShadow: isSelected ? '0 10px 40px var(--accent-glow)' : 'var(--glass-shadow)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              background: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent' 
            }}>
              {data.name}
            </span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500, backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px' }}>
              {data.symbol}
            </span>
          </h3>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px',
          color: isPositive ? 'var(--success-color)' : 'var(--danger-color)',
          fontWeight: 600,
          fontSize: '0.875rem',
          backgroundColor: isPositive ? 'var(--success-glow)' : 'var(--danger-glow)',
          padding: '4px 10px',
          borderRadius: '16px'
        }}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          {Math.abs(data.change24h).toFixed(2)}%
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Price</div>
        <div style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center' }}>
          {formattedPrice}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>24h Volume</div>
          <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{formattedVolume}</div>
        </div>
      </div>

      {/* Decorative gradient blob */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-20%',
        width: '150px',
        height: '150px',
        background: isPositive ? 'var(--success-color)' : 'var(--danger-color)',
        filter: 'blur(80px)',
        opacity: 0.15,
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
    </div>
  );
}
