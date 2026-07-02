import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../stores/useAdminStore';
import {
  getEvalSets,
  createEvalSet,
  deleteEvalSet,
  getEvalSetDetail,
  addEvalImage,
  updateEvalImage,
  deleteEvalImage,
} from '../../services/apiService';
import type { EvalSet, EvalImage } from '../../services/apiService';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Search,
  ChevronRight,
  X,
  Save,
  Edit3,
  ExternalLink,
  Upload,
  Link,
} from 'lucide-react';

export const EvalSetsPage: React.FC = () => {
  const navigate = useNavigate();
  const token = useAdminStore((s) => s.token);
  const [evalSets, setEvalSets] = useState<EvalSet[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // 创建评测集弹窗
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSetName, setNewSetName] = useState('');
  const [newSetDesc, setNewSetDesc] = useState('');
  const [creating, setCreating] = useState(false);

  // 图片详情/标注弹窗
  const [selectedSet, setSelectedSet] = useState<EvalSet | null>(null);
  const [images, setImages] = useState<EvalImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [editingImage, setEditingImage] = useState<EvalImage | null>(null);

  // 添加图片弹窗
  const [showAddImageModal, setShowAddImageModal] = useState(false);
  const [addImageMethod, setAddImageMethod] = useState<'upload' | 'url'>('url');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageTitle, setNewImageTitle] = useState('');
  const [newImageCategory, setNewImageCategory] = useState('');
  const [addingImage, setAddingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pageSize = 10;

  const fetchEvalSets = async () => {
    setLoading(true);
    try {
      const res = await getEvalSets(token, page, pageSize, undefined, keyword);
      setEvalSets(res.data || []);
      setTotal(res.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvalSets();
  }, [token, page, keyword]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(searchInput);
    setPage(1);
  };

  const handleCreate = async () => {
    if (!newSetName.trim()) return;
    setCreating(true);
    try {
      await createEvalSet(token, {
        name: newSetName,
        description: newSetDesc,
      });
      setShowCreateModal(false);
      setNewSetName('');
      setNewSetDesc('');
      fetchEvalSets();
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除该评测集及其所有图片吗？')) return;
    try {
      await deleteEvalSet(token, id);
      fetchEvalSets();
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenSet = async (set: EvalSet) => {
    setSelectedSet(set);
    setLoadingImages(true);
    try {
      const res = await getEvalSetDetail(token, set.id);
      setImages(res.data?.images || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleAddImage = async () => {
    if (!selectedSet) return;
    setShowAddImageModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 将文件转换为 base64 URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setNewImageUrl(base64Url);
      setNewImageTitle(file.name.replace(/\.[^/.]+$/, '') || '上传图片');
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmAddImage = async () => {
    if (!selectedSet || !newImageUrl.trim()) return;
    setAddingImage(true);
    try {
      await addEvalImage(token, selectedSet.id, {
        imageUrl: newImageUrl,
        title: newImageTitle || '评测图片',
        category: newImageCategory || '其他',
      });
      setShowAddImageModal(false);
      setNewImageUrl('');
      setNewImageTitle('');
      setNewImageCategory('');
      handleOpenSet(selectedSet);
    } catch (e) {
      console.error(e);
    } finally {
      setAddingImage(false);
    }
  };

  const handleSaveImage = async () => {
    if (!selectedSet || !editingImage) return;
    try {
      await updateEvalImage(token, selectedSet.id, editingImage.id, {
        title: editingImage.title,
        description: editingImage.description,
        category: editingImage.category,
        groundTruthScene: editingImage.groundTruthScene,
        groundTruthLight: editingImage.groundTruthLight,
        groundTruthComp: editingImage.groundTruthComp,
        groundTruthParams: editingImage.groundTruthParams,
        groundTruthPost: editingImage.groundTruthPost,
        groundTruthEquip: editingImage.groundTruthEquip,
        status: 'annotated',
      });
      setEditingImage(null);
      handleOpenSet(selectedSet);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!selectedSet || !window.confirm('确定要删除该图片吗？')) return;
    try {
      await deleteEvalImage(token, selectedSet.id, imageId);
      handleOpenSet(selectedSet);
    } catch (e) {
      console.error(e);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* 顶部栏 */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">评测集管理</h2>
            <p className="text-sm text-slate-500">管理标准评测数据集，用于AI模型质量评估</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            创建评测集
          </button>
        </div>
      </div>

      {/* 搜索 */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="搜索评测集名称"
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-200 transition"
        >
          搜索
        </button>
      </form>

      {/* 评测集列表 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : evalSets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <ImageIcon className="w-12 h-12 text-slate-300 mb-3" />
            <p>暂无评测集</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 text-amber-600 text-sm hover:underline"
            >
              创建第一个评测集
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {evalSets.map((set) => (
              <div
                key={set.id}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition cursor-pointer"
                onClick={() => handleOpenSet(set)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{set.name}</p>
                    <p className="text-sm text-slate-500">
                      {set.imageCount || 0} 张图片 · {set.status === 'draft' ? '草稿' : set.status === 'active' ? '已发布' : '已归档'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(set.id);
                    }}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        )}

        {total > pageSize && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              共 {total} 个评测集
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50 transition"
              >
                上一页
              </button>
              <span className="text-sm text-slate-600">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50 transition"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 创建评测集弹窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">创建评测集</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">名称</label>
                <input
                  type="text"
                  value={newSetName}
                  onChange={(e) => setNewSetName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  placeholder="请输入评测集名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
                <textarea
                  value={newSetDesc}
                  onChange={(e) => setNewSetDesc(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
                  placeholder="可选，描述评测集用途"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition"
                >
                  取消
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newSetName.trim() || creating}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition disabled:opacity-50"
                >
                  {creating ? '创建中...' : '创建'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 图片列表/标注弹窗 */}
      {selectedSet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{selectedSet.name}</h3>
                <p className="text-sm text-slate-500">{selectedSet.description || '暂无描述'}</p>
              </div>
              <button onClick={() => { setSelectedSet(null); setEditingImage(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {loadingImages ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 添加图片按钮 */}
                  <button
                    onClick={handleAddImage}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition w-full justify-center"
                  >
                    <Plus className="w-4 h-4" />
                    添加评测图片
                  </button>

                  {/* 图片列表 */}
                  {images.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p>暂无评测图片</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {images.map((img) => (
                        <div key={img.id} className="border border-slate-200 rounded-xl p-4">
                          <div className="relative mb-3">
                            <img
                              src={img.imageUrl}
                              alt={img.title || '评测图片'}
                              className="w-full h-48 object-cover rounded-lg bg-slate-100"
                            />
                            <a
                              href={img.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute top-2 right-2 p-1 bg-white/80 rounded-lg hover:bg-white transition"
                            >
                              <ExternalLink className="w-4 h-4 text-slate-600" />
                            </a>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-800">{img.title || '未命名'}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              img.status === 'annotated' ? 'bg-green-100 text-green-700' :
                              img.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {img.status === 'annotated' ? '已标注' : img.status === 'reviewed' ? '已审核' : '待标注'}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingImage(img)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition flex-1 justify-center"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              标注
                            </button>
                            <button
                              onClick={() => handleDeleteImage(img.id)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 标注编辑弹窗 */}
      {editingImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">标注 Ground Truth</h3>
              <button onClick={() => setEditingImage(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="mb-4">
                <img
                  src={editingImage.imageUrl}
                  alt=""
                  className="w-full max-h-64 object-contain rounded-lg bg-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">标题</label>
                  <input
                    type="text"
                    value={editingImage.title}
                    onChange={(e) => setEditingImage({ ...editingImage, title: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">分类</label>
                  <input
                    type="text"
                    value={editingImage.category}
                    onChange={(e) => setEditingImage({ ...editingImage, category: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    placeholder="风景/人像/建筑..."
                  />
                </div>

                {/* Ground Truth 标注 */}
                <div className="md:col-span-2 border-t border-slate-200 pt-4 mt-4">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">标准答案（Ground Truth）</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">场景选择</label>
                      <textarea
                        value={editingImage.groundTruthScene}
                        onChange={(e) => setEditingImage({ ...editingImage, groundTruthScene: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                        rows={2}
                        placeholder="正确场景描述..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">光线运用</label>
                      <textarea
                        value={editingImage.groundTruthLight}
                        onChange={(e) => setEditingImage({ ...editingImage, groundTruthLight: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                        rows={2}
                        placeholder="正确光线描述..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">构图技巧</label>
                      <textarea
                        value={editingImage.groundTruthComp}
                        onChange={(e) => setEditingImage({ ...editingImage, groundTruthComp: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                        rows={2}
                        placeholder="正确构图描述..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">参数建议</label>
                      <textarea
                        value={editingImage.groundTruthParams}
                        onChange={(e) => setEditingImage({ ...editingImage, groundTruthParams: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                        rows={2}
                        placeholder="正确参数建议..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">后期调色</label>
                      <textarea
                        value={editingImage.groundTruthPost}
                        onChange={(e) => setEditingImage({ ...editingImage, groundTruthPost: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                        rows={2}
                        placeholder="正确后期建议..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">推荐装备</label>
                      <textarea
                        value={editingImage.groundTruthEquip}
                        onChange={(e) => setEditingImage({ ...editingImage, groundTruthEquip: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                        rows={2}
                        placeholder="正确装备建议..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100">
              <button
                onClick={handleSaveImage}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition"
              >
                <Save className="w-4 h-4" />
                保存标注
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 添加图片弹窗 */}
      {showAddImageModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">添加评测图片</h3>
              <button onClick={() => setShowAddImageModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 选择添加方式 */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setAddImageMethod('upload')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition ${
                  addImageMethod === 'upload'
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Upload className="w-4 h-4" />
                上传图片
              </button>
              <button
                onClick={() => setAddImageMethod('url')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition ${
                  addImageMethod === 'url'
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Link className="w-4 h-4" />
                输入URL
              </button>
            </div>

            <div className="space-y-4">
              {addImageMethod === 'upload' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">选择图片</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-slate-200 rounded-xl hover:border-amber-400 hover:bg-amber-50 transition"
                  >
                    <Upload className="w-8 h-8 text-slate-400" />
                    <span className="text-sm text-slate-500">点击上传图片</span>
                    <span className="text-xs text-slate-400">支持 JPG、PNG、WebP 格式</span>
                  </button>
                  {newImageUrl && (
                    <div className="mt-3">
                      <img
                        src={newImageUrl}
                        alt="预览"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">图片URL</label>
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                  {newImageUrl && (
                    <div className="mt-3">
                      <img
                        src={newImageUrl}
                        alt="预览"
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">图片标题</label>
                <input
                  type="text"
                  value={newImageTitle}
                  onChange={(e) => setNewImageTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  placeholder="可选，图片标题"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">分类</label>
                <select
                  value={newImageCategory}
                  onChange={(e) => setNewImageCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                >
                  <option value="">选择分类</option>
                  <option value="风景">风景</option>
                  <option value="人像">人像</option>
                  <option value="建筑">建筑</option>
                  <option value="街拍">街拍</option>
                  <option value="静物">静物</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddImageModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmAddImage}
                  disabled={!newImageUrl.trim() || addingImage}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition disabled:opacity-50"
                >
                  {addingImage ? '添加中...' : '添加图片'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};