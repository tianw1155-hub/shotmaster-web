import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../stores/useAdminStore';
import { getEvalSets } from '../../services/apiService';
import {
  Camera,
  Play,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

export const AIEvalPage: React.FC = () => {
  const token = useAdminStore((s) => s.token);
  const [evalSets, setEvalSets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSetId, setSelectedSetId] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<any | null>(null);

  useEffect(() => {
    const fetchEvalSets = async () => {
      setLoading(true);
      try {
        const res = await getEvalSets(token, 1, 100, 'active');
        setEvalSets(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchEvalSets();
  }, [token]);

  // 模拟运行AI评测
  const handleRunEvaluation = async () => {
    if (!selectedSetId) return;
    setRunning(true);
    setResults(null);

    // 模拟评测过程（实际应调用后端API）
    setTimeout(() => {
      setResults({
        totalImages: 50,
        accuracy: 0.82,
        precision: 0.85,
        recall: 0.78,
        f1Score: 0.81,
        groundedness: 0.90,
        descQuality: 4.2,
        dimensionScores: {
          scene: { accuracy: 0.88, correct: 44, total: 50 },
          lighting: { accuracy: 0.80, correct: 40, total: 50 },
          composition: { accuracy: 0.82, correct: 41, total: 50 },
          params: { accuracy: 0.75, correct: 38, total: 50 },
          postProcessing: { accuracy: 0.78, correct: 39, total: 50 },
          equipment: { accuracy: 0.85, correct: 43, total: 50 },
        },
        errors: [
          { imageId: 12, dimension: 'params', expected: 'ISO 100-400', actual: 'ISO 800' },
          { imageId: 23, dimension: 'lighting', expected: '逆光', actual: '顺光' },
        ],
      });
      setRunning(false);
    }, 3000);
  };

  const dimensionLabels: Record<string, string> = {
    scene: '场景选择',
    lighting: '光线运用',
    composition: '构图技巧',
    params: '参数建议',
    postProcessing: '后期调色',
    equipment: '推荐装备',
  };

  return (
    <div className="space-y-6">
      {/* 顶部说明 */}
      <div className="bg-white rounded-md shadow-sm p-6">
        <div className="flex items-start gap-4">
          <Camera className="w-8 h-8 text-purple-500 flex-shrink-0" />
          <div>
            <h2 className="text-lg font-semibold text-slate-800">AI评测中心</h2>
            <p className="text-sm text-slate-500 mt-1">
              自动化评测AI模型在各维度的表现，生成准确率、F1分数等关键指标报告。
              基于标注的Ground Truth与AI输出进行对比分析。
            </p>
          </div>
        </div>
      </div>

      {/* 选择评测集并运行 */}
      <div className="bg-white rounded-md shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">运行评测</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">选择评测集</label>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock className="w-4 h-4 animate-spin" />
                加载中...
              </div>
            ) : evalSets.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-xl">
                <AlertCircle className="w-4 h-4" />
                暂无已发布的评测集，请先在评测集管理中创建并发布
              </div>
            ) : (
              <select
                value={selectedSetId || ''}
                onChange={(e) => setSelectedSetId(Number(e.target.value))}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
              >
                <option value="">请选择评测集</option>
                {evalSets.map((set) => (
                  <option key={set.id} value={set.id}>
                    {set.name}（{set.imageCount || 0}张图片）
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="flex items-end">
            <button
              onClick={handleRunEvaluation}
              disabled={!selectedSetId || running}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {running ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  评测中...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  开始评测
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 评测结果 */}
      {results && (
        <div className="space-y-6">
          {/* 总体指标 */}
          <div className="bg-white rounded-md shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">评测结果</h3>
                <p className="text-sm text-slate-500">评测了 {results.totalImages} 张图片</p>
              </div>
              <BarChart3 className="w-5 h-5 text-slate-400" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <p className="text-2xl font-bold text-slate-800">{(results.accuracy * 100).toFixed(1)}%</p>
                <p className="text-xs text-slate-500 mt-1">准确率</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <p className="text-2xl font-bold text-slate-800">{(results.precision * 100).toFixed(1)}%</p>
                <p className="text-xs text-slate-500 mt-1">精确率</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <p className="text-2xl font-bold text-slate-800">{(results.recall * 100).toFixed(1)}%</p>
                <p className="text-xs text-slate-500 mt-1">召回率</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <p className="text-2xl font-bold text-green-600">{(results.f1Score * 100).toFixed(1)}%</p>
                <p className="text-xs text-slate-500 mt-1">F1分数</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <p className="text-2xl font-bold text-blue-600">{(results.groundedness * 100).toFixed(1)}%</p>
                <p className="text-xs text-slate-500 mt-1">内容一致性</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-xl">
                <p className="text-2xl font-bold text-amber-600">{results.descQuality.toFixed(1)}</p>
                <p className="text-xs text-slate-500 mt-1">描述质量(1-5)</p>
              </div>
            </div>
          </div>

          {/* 分维度得分 */}
          <div className="bg-white rounded-md shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">分维度准确率</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(results.dimensionScores).map(([dim, score]: [string, any]) => (
                <div key={dim} className="p-4 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-700">{dimensionLabels[dim]}</span>
                    <span className={`text-sm font-semibold ${
                      score.accuracy >= 0.8 ? 'text-green-600' : score.accuracy >= 0.6 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {(score.accuracy * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full ${
                        score.accuracy >= 0.8 ? 'bg-green-500' : score.accuracy >= 0.6 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${score.accuracy * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>正确: {score.correct}</span>
                    <span>总数: {score.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 错误分析 */}
          {results.errors && results.errors.length > 0 && (
            <div className="bg-white rounded-md shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">错误分析</h3>
              <div className="space-y-3">
                {results.errors.slice(0, 10).map((err: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-red-50 rounded-xl">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        图片 #{err.imageId} - {dimensionLabels[err.dimension]}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        期望: {err.expected} · 实际: {err.actual}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 评测建议 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-md p-6">
            <div className="flex items-start gap-4">
              <TrendingUp className="w-6 h-6 text-purple-500 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-purple-800 mb-1">优化建议</h4>
                <p className="text-sm text-purple-700">
                  {results.f1Score >= 0.8
                    ? 'AI模型整体表现良好，建议继续保持。'
                    : `当前F1分数为 ${(results.f1Score * 100).toFixed(1)}%，建议重点关注准确率较低的维度（如${dimensionLabels[Object.entries(results.dimensionScores).sort((a: any, b: any) => a[1].accuracy - b[1].accuracy)[0][0]]}）进行优化。`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 等待评测 */}
      {running && (
        <div className="bg-white rounded-md shadow-sm p-12 text-center">
          <Clock className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-spin" />
          <p className="text-lg font-semibold text-slate-800">正在评测AI模型...</p>
          <p className="text-sm text-slate-500 mt-2">对比Ground Truth与AI输出，计算各维度准确率</p>
        </div>
      )}
    </div>
  );
};