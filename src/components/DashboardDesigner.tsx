import React, { useState } from 'react';
import {
  INITIAL_DASHBOARD_WIDGETS,
  DashboardWidgetConfig,
} from '../data/configData';

interface DashboardDesignerProps {
  onShowToast: (msg: string) => void;
  onSaveLayout?: (widgets: DashboardWidgetConfig[]) => void;
}

export const DashboardDesigner: React.FC<DashboardDesignerProps> = ({
  onShowToast,
  onSaveLayout,
}) => {
  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>(INITIAL_DASHBOARD_WIDGETS);
  const [selectedPreset, setSelectedPreset] = useState<string>('Standard Enterprise');
  const [density, setDensity] = useState<'Standard' | 'Compact' | 'Executive High-Level'>('Standard');

  const toggleWidget = (id: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );
  };

  const setWidgetSize = (id: string, size: DashboardWidgetConfig['size']) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, size } : w))
    );
  };

  const applyPreset = (presetName: string) => {
    setSelectedPreset(presetName);
    if (presetName === 'Executive Board') {
      setWidgets((prev) =>
        prev.map((w) => ({
          ...w,
          enabled: ['widget-kpis', 'widget-agents', 'widget-donut', 'widget-toprisks'].includes(w.id),
        }))
      );
      onShowToast('Applied "Executive Board" dashboard preset.');
    } else if (presetName === 'Risk Committee') {
      setWidgets((prev) =>
        prev.map((w) => ({
          ...w,
          enabled: ['widget-kpis', 'widget-trend', 'widget-toprisks', 'widget-risk-table'].includes(w.id),
        }))
      );
      onShowToast('Applied "Risk Committee" dashboard preset.');
    } else if (presetName === 'Audit & Compliance') {
      setWidgets((prev) =>
        prev.map((w) => ({
          ...w,
          enabled: ['widget-kpis', 'widget-donut', 'widget-coverage', 'widget-tasks', 'widget-risk-table'].includes(w.id),
        }))
      );
      onShowToast('Applied "Audit & Compliance" dashboard preset.');
    } else {
      setWidgets(INITIAL_DASHBOARD_WIDGETS);
      onShowToast('Restored Standard Enterprise layout.');
    }
  };

  const handleSaveAndPublish = () => {
    if (onSaveLayout) {
      onSaveLayout(widgets);
    }
    onShowToast('Dashboard configuration validated and published for organization.');
  };

  return (
    <div className="panel" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px' }}>Universal Dashboard Designer</h2>
          <p style={{ margin: '3px 0 0', fontSize: '11px', color: 'var(--muted)' }}>
            Configure visible widgets, metrics, layout density, and departmental presets without modifying code.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="secondary"
            onClick={() => applyPreset('Standard Enterprise')}
            style={{ fontSize: '11px' }}
          >
            Reset to Default
          </button>
          <button
            className="primary"
            onClick={handleSaveAndPublish}
            style={{ fontSize: '11px' }}
          >
            💾 Save & Publish Layout
          </button>
        </div>
      </div>

      {/* Preset Pickers */}
      <div style={{ background: 'var(--panel2)', border: '1px solid var(--line)', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
        <b style={{ fontSize: '11px', display: 'block', marginBottom: '8px', color: 'var(--cyan)' }}>
          Departmental Preset Layouts
        </b>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['Standard Enterprise', 'Executive Board', 'Risk Committee', 'Audit & Compliance'].map((preset) => (
            <button
              key={preset}
              onClick={() => applyPreset(preset)}
              style={{
                border: '1px solid',
                borderColor: selectedPreset === preset ? 'var(--cyan)' : 'var(--line)',
                background: selectedPreset === preset ? '#087cff22' : 'transparent',
                color: selectedPreset === preset ? 'var(--cyan)' : 'var(--text)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Widget List */}
      <div>
        <b style={{ fontSize: '12px', display: 'block', marginBottom: '10px' }}>
          Configurable Dashboard Widgets ({widgets.filter((w) => w.enabled).length} Enabled / {widgets.length} Total)
        </b>

        <div style={{ display: 'grid', gap: '8px' }}>
          {widgets.map((widget) => (
            <div
              key={widget.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                background: widget.enabled ? 'var(--panel2)' : '#030c1a',
                opacity: widget.enabled ? 1 : 0.6,
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <b style={{ fontSize: '11px', color: widget.enabled ? '#fff' : 'var(--muted)' }}>
                    {widget.name}
                  </b>
                  <span
                    style={{
                      background: 'var(--panel)',
                      border: '1px solid var(--line)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '9px',
                      color: 'var(--cyan)',
                    }}
                  >
                    {widget.category}
                  </span>
                </div>
                <small style={{ color: 'var(--muted)', display: 'block', marginTop: '2px' }}>
                  {widget.description}
                </small>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {(['1x1', '2x1', 'full'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setWidgetSize(widget.id, s)}
                      disabled={!widget.enabled}
                      style={{
                        padding: '3px 6px',
                        fontSize: '9px',
                        borderRadius: '4px',
                        border: '1px solid var(--line)',
                        background: widget.size === s ? '#087cff' : 'transparent',
                        color: widget.size === s ? '#fff' : 'var(--muted)',
                        cursor: widget.enabled ? 'pointer' : 'default',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => toggleWidget(widget.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid',
                    background: widget.enabled ? '#ff426d25' : '#00d5ad25',
                    color: widget.enabled ? '#ff7390' : '#49e5c5',
                    borderColor: widget.enabled ? '#ff426d60' : '#00d5ad60',
                  }}
                >
                  {widget.enabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
