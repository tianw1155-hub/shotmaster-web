import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Send, CheckCircle, Bug, Lightbulb, HelpCircle, Heart, MessageSquare } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/ui/Button';
import { variants } from '../lib/motion';
import { submitTextFeedback } from '../services/apiService';

const categories = [
  { value: 'bug', label: '问题反馈', icon: Bug, color: 'text-red-500 bg-red-50' },
  { value: 'suggestion', label: '功能建议', icon: Lightbulb, color: 'text-amber-500 bg-amber-50' },
  { value: 'question', label: '使用咨询', icon: HelpCircle, color: 'text-blue-500 bg-blue-50' },
  { value: 'praise', label: '表扬鼓励', icon: Heart, color: 'text-pink-500 bg-pink-50' },
  { value: 'other', label: '其他', icon: MessageSquare, color: 'text-slate-500 bg-slate-50' },
];

export const FeedbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useGameStore();
  const [category, setCategory] = useState('suggestion');
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await submitTextFeedback({
        userId: user.id,
        username: user.name || user.phone || '',
        category,
        content: content.trim(),
        contact: contact.trim() || undefined,
      });
      setSubmitted(true);
    } catch (e) {
      console.error('提交反馈失败:', e);
      alert('提交失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <PageLayout desktop="single">
        <div className="max-w-lg mx-auto w-full px-6 py-12 flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6"
          >
            <CheckCircle className="w-12 h-12 text-green-500" strokeWidth={1.5} />
          </motion.div>
          <h2 className="font-display text-xl font-bold text-ink mb-2">反馈提交成功</h2>
          <p className="text-ink-muted text-sm text-center mb-8">感谢您的反馈，我们会认真阅读并持续改进！</p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => { setSubmitted(false); setContent(''); setContact(''); setCategory('suggestion'); }}>
              继续反馈
            </Button>
            <Button variant="primary" onClick={() => navigate('/profile')}>
              返回我的
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout desktop="single">
      <div className="max-w-lg mx-auto w-full px-6 py-6 space-y-6">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/profile')}
            aria-label="返回"
            className="w-10 h-10 rounded-full bg-surface-card border border-line flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-ink" strokeWidth={1.25} />
          </button>
          <h1 className="font-display text-xl font-bold text-ink">帮助与反馈</h1>
        </div>

        {/* 反馈类型 */}
        <motion.div variants={variants.fadeUp} initial="hidden" animate="show">
          <h3 className="text-sm font-medium text-ink-secondary mb-3">反馈类型</h3>
          <div className="grid grid-cols-3 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-md border transition-all ${
                    isSelected
                      ? 'border-accent bg-accent/5 shadow-sm'
                      : 'border-line bg-surface-card hover:bg-surface-muted/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-md flex items-center justify-center ${isSelected ? cat.color : 'bg-surface-muted'}`}>
                    <Icon className={`w-5 h-5 ${isSelected ? '' : 'text-ink-muted'}`} strokeWidth={1.25} />
                  </div>
                  <span className={`text-xs ${isSelected ? 'text-accent font-medium' : 'text-ink-secondary'}`}>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* 反馈内容 */}
        <motion.div variants={variants.fadeUp} initial="hidden" animate="show">
          <h3 className="text-sm font-medium text-ink-secondary mb-3">反馈内容</h3>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="请详细描述您遇到的问题或建议..."
            rows={6}
            maxLength={500}
            className="w-full p-4 rounded-md border border-line bg-surface-card text-ink placeholder:text-ink-muted text-sm resize-none focus:outline-none focus:border-accent transition-colors"
          />
          <div className="flex justify-end mt-1">
            <span className="text-xs text-ink-muted">{content.length}/500</span>
          </div>
        </motion.div>

        {/* 联系方式 */}
        <motion.div variants={variants.fadeUp} initial="hidden" animate="show">
          <h3 className="text-sm font-medium text-ink-secondary mb-3">联系方式<span className="text-ink-muted ml-1">（选填）</span></h3>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="留下邮箱或微信号，方便我们联系您"
            maxLength={100}
            className="w-full p-4 rounded-md border border-line bg-surface-card text-ink placeholder:text-ink-muted text-sm focus:outline-none focus:border-accent transition-colors"
          />
        </motion.div>

        {/* 提交按钮 */}
        <motion.div variants={variants.fadeUp} initial="hidden" animate="show" className="pt-2">
          <Button
            variant="primary"
            className="w-full"
            disabled={!content.trim() || submitting}
            onClick={handleSubmit}
          >
            {submitting ? '提交中...' : '提交反馈'}
          </Button>
        </motion.div>
      </div>
    </PageLayout>
  );
};
