import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../stores/useAdminStore';
import { getSystemConfigs, updateSystemConfig } from '../../services/apiService';
import {
  Settings,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface ConfigItem {
  id: number;
  key: string;
  value: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

const configLabels: Record<string, { label: string; type: 'text' | 'number' | 'textarea' | 'select'; options?: string[] }> = {
  'ai_model_version': { label: 'AI模型版本', type: 'text' },
  'daily_free_quota': { label: '每日免费配额（已废弃）', type: 'number' },
  'gallery_refresh_hours': { label: '图库刷新周期（小时）', type: 'number' },
  'max_upload_size': { label: '最大上传文件大小（MB）', type: 'number' },
  'allowed_image_types': { label: '允许的图片类型', type: 'text' },
  'default_language': { label: '默认语言', type: 'select', options: ['zh-CN', 'en-US'] },
  'maintenance_mode': { label: '维护模式', type: 'select', options: ['off', 'on'] },
  'maintenance_message': { label: '维护提示信息', type: 'textarea' },
};

export const SettingsPage: React.FC = () => {
  const token = useAdminStore((s) => s.token);
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await getSystemConfigs(token);
      setConfigs(res.data || []);
      // 初始化编辑值
      const values: Record<string, string> = {};
      (res.data || []).forEach((cfg: ConfigItem) => {
        values[cfg.key] = cfg.value;
      });
      setEditedValues(values);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, [token]);

  const handleSave = async (key: string) => {
    setSaving(key);
    setMessage(null);
    try {
      await updateSystemConfig(token, key, editedValues[key] || '');
      setMessage({ type: 'success', text: '配置已保存' });
      fetchConfigs();
    } catch (e) {
      setMessage({ type: 'error', text: '保存失败' });
    } finally {
      setSaving(null);
    }
  };

  const handleChange = (key: string, value: string) => {
    setEditedValues({ ...editedValues, [key]: value });
  };

  // 获取或创建默认配置项
  const getConfigRows = () => {
    const existingKeys = configs.map((c) => c.key);
    const rows: { key: string; label: string; type: string; options?: string[]; value: string; remark: string }[] = [];

    // 先添加已存在的配置
    configs.forEach((cfg) => {
      const meta = configLabels[cfg.key] || { label: cfg.key, type: 'text' };
      rows.push({
        key: cfg.key,
        label: meta.label,
        type: meta.type,
        options: meta.options,
        value: editedValues[cfg.key] || cfg.value,
        remark: cfg.remark,
      });
    });

    // 添加预设但未存在的配置
    Object.entries(configLabels).forEach(([key, meta]) => {
      if (!existingKeys.includes(key)) {
        rows.push({
          key,
          label: meta.label,
          type: meta.type,
          options: meta.options,
          value: editedValues[key] || '',
          remark: '',
        });
      }
    });

    return rows;
  };

  const configRows = getConfigRows();

  return (
    <div className="space-y-6">
      {/* 顶部说明 */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <Settings className="w-8 h-8 text-slate-500 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-slate-800">系统配置</h2>
              <p className="text-sm text-slate-500 mt-1">
                管理系统全局配置项，包括AI模型参数、用户权限设置等。
              </p>
            </div>
          </div>
          <button
            onClick={fetchConfigs}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </button>
        </div>
      </div>

      {/* 消息提示 */}
      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-xl ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* 配置列表 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {configRows.map((row) => (
              <div key={row.key} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="lg:w-1/4">
                    <label className="block text-sm font-medium text-slate-700">{row.label}</label>
                    <p className="text-xs text-slate-400 mt-1">{row.key}</p>
                  </div>
                  <div className="lg:w-2/4">
                    {row.type === 'textarea' ? (
                      <textarea
                        value={row.value}
                        onChange={(e) => handleChange(row.key, e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
                        rows={3}
                      />
                    ) : row.type === 'select' && row.options ? (
                      <select
                        value={row.value}
                        onChange={(e) => handleChange(row.key, e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                      >
                        {row.options.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : row.type === 'number' ? (
                      <input
                        type="number"
                        value={row.value}
                        onChange={(e) => handleChange(row.key, e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                      />
                    ) : (
                      <input
                        type="text"
                        value={row.value}
                        onChange={(e) => handleChange(row.key, e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                      />
                    )}
                  </div>
                  <div className="lg:w-1/4 flex items-center gap-3">
                    {row.remark && (
                      <span className="text-xs text-slate-400">{row.remark}</span>
                    )}
                    <button
                      onClick={() => handleSave(row.key)}
                      disabled={saving === row.key}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition disabled:opacity-50"
                    >
                      {saving === row.key ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      保存
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 注意事项 */}
      <div className="bg-slate-50 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">注意事项</h3>
        <ul className="text-xs text-slate-600 space-y-2">
          <li>• 配置修改后立即生效，部分配置可能需要重启服务</li>
          <li>• AI模型版本修改会影响后续所有AI评测结果</li>
          <li>• 开启维护模式后，用户将无法访问前台应用</li>
        </ul>
      </div>
    </div>
  );
};