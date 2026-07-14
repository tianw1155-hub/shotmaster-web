import React, { useState, useEffect, useRef } from 'react';
import { useAdminStore } from '../../stores/useAdminStore';
import { getWeeklyChallenge, setWeeklyChallenge, uploadImage, WeeklyChallengeData } from '../../services/apiService';
import { Image, Save, RefreshCw, CheckCircle, AlertCircle, Link, Tag, User, Upload, Camera } from 'lucide-react';

export const WeeklyChallengePage: React.FC = () => {
  const token = useAdminStore((s) => s.token);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [challenge, setChallenge] = useState<WeeklyChallengeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    url: '',
    title: '',
    category: 'landscape',
    difficulty: 'intermediate',
    tags: '',
    author: '',
    authorUrl: '',
  });

  const fetchChallenge = async () => {
    setLoading(true);
    try {
      const data = await getWeeklyChallenge();
      setChallenge(data);
      if (data) {
        setFormData({
          url: data.url,
          title: data.title,
          category: data.category,
          difficulty: data.difficulty,
          tags: data.tags?.join(', ') || '',
          author: data.author || '',
          authorUrl: data.authorUrl || '',
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenge();
  }, [token]);

  const handleSave = async () => {
    if (!formData.url || !formData.title) {
      setMessage({ type: 'error', text: '图片URL和标题不能为空' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const res = await setWeeklyChallenge(token, {
        url: formData.url,
        title: formData.title,
        category: formData.category,
        difficulty: formData.difficulty,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        author: formData.author,
        authorUrl: formData.authorUrl,
      });
      setMessage({ type: 'success', text: '保存成功！本周挑战已更新' });
      setChallenge(res.data);
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || '保存失败' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      setMessage({ type: 'error', text: '只支持 JPG、PNG、GIF、WebP 格式' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: '文件大小不能超过 5MB' });
      return;
    }

    setUploading(true);
    setMessage(null);
    try {
      const res = await uploadImage(token, file);
      if (res.success) {
        const fullUrl = `${window.location.origin}${res.url}`;
        setFormData({ ...formData, url: fullUrl });
        setMessage({ type: 'success', text: '上传成功！图片已自动填入URL' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || '上传失败' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">本周挑战管理</h1>
          <p className="text-sm text-slate-500 mt-1">设置社区首页展示的每周挑战图片</p>
        </div>
      </div>

      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-xl ${
          message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          )}
          <span className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Image className="w-5 h-5 text-amber-500" />
            当前挑战图片预览
          </h2>
          <div className="relative rounded-xl overflow-hidden bg-slate-100 aspect-video">
            {challenge?.url ? (
              <img
                src={challenge.url}
                alt={challenge.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                暂无图片
              </div>
            )}
          </div>
          {challenge && (
            <div className="mt-4 space-y-2">
              <h3 className="font-semibold text-slate-800">{challenge.title}</h3>
              <div className="flex flex-wrap gap-2">
                {challenge.tags?.map((tag: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              {challenge.author && (
                <p className="text-sm text-slate-500">作者：{challenge.author}</p>
              )}
              {challenge.startDate && challenge.endDate && (
                <p className="text-sm text-slate-500">
                  周期：{challenge.startDate} ~ {challenge.endDate}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Save className="w-5 h-5 text-amber-500" />
            设置挑战图片
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1">
                <Link className="w-4 h-4" /> 图片URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="请输入图片URL"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1">
                <Upload className="w-4 h-4" /> 上传本地图片
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
                id="challenge-image-upload"
              />
              <label
                htmlFor="challenge-image-upload"
                className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  uploading
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-slate-300 hover:border-amber-500 hover:bg-amber-50'
                }`}
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
                    <span className="text-amber-700 font-medium">上传中...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5 text-amber-500" />
                    <span className="text-slate-600">点击选择本地图片（支持 JPG、PNG、GIF、WebP，最大5MB）</span>
                  </>
                )}
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                挑战标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="请输入挑战标题"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  分类
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                >
                  <option value="landscape">风景</option>
                  <option value="portrait">人像</option>
                  <option value="street">街拍</option>
                  <option value="still_life">静物</option>
                  <option value="architecture">建筑</option>
                  <option value="composition">构图</option>
                  <option value="lighting">光线</option>
                  <option value="color">色彩</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  难度
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                >
                  <option value="beginner">初级</option>
                  <option value="intermediate">中级</option>
                  <option value="advanced">高级</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1">
                <Tag className="w-4 h-4" /> 标签（逗号分隔）
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="例如：山脉, 风景, 日出"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1">
                <User className="w-4 h-4" /> 作者
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="图片作者名称"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1">
                <Link className="w-4 h-4" /> 作者主页URL
              </label>
              <input
                type="text"
                value={formData.authorUrl}
                onChange={(e) => setFormData({ ...formData, authorUrl: e.target.value })}
                placeholder="作者Unsplash主页等"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  保存为本周挑战
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
