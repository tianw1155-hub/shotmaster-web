import { useState, useEffect } from 'react';
import { X, Camera, ImageIcon, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Button';
import { usePermissionStore } from '../../stores/usePermissionStore';

export function PermissionModal() {
  const [isAnimating, setIsAnimating] = useState(false);
  const { pendingRequestType, setPermission, checkPermission, resolvePendingRequest } = usePermissionStore();

  useEffect(() => {
    if (pendingRequestType) {
      setIsAnimating(true);
    }
  }, [pendingRequestType]);

  const handleGrant = (grantType: 'permanent' | 'whileUsing') => {
    if (!pendingRequestType) return;
    setPermission(pendingRequestType, grantType);
    setIsAnimating(false);
    setTimeout(() => {
      resolvePendingRequest(checkPermission(pendingRequestType));
    }, 200);
  };

  const handleDeny = () => {
    if (!pendingRequestType) return;
    setPermission(pendingRequestType, 'denied');
    setIsAnimating(false);
    setTimeout(() => {
      resolvePendingRequest(false);
    }, 200);
  };

  const handleClose = () => {
    if (!pendingRequestType) return;
    setIsAnimating(false);
    setTimeout(() => {
      resolvePendingRequest(checkPermission(pendingRequestType));
    }, 200);
  };

  if (!pendingRequestType) return null;

  const title = pendingRequestType === 'camera' ? '访问摄像头' : '访问相册';
  const description = pendingRequestType === 'camera' 
    ? '为了让您能够拍摄照片，我们需要访问您的摄像头。您可以选择始终允许或仅在使用期间允许。'
    : '为了让您能够上传图片，我们需要访问您的相册。您可以选择始终允许或仅在使用期间允许。';
  const icon = pendingRequestType === 'camera' ? <Camera className="w-8 h-8" /> : <ImageIcon className="w-8 h-8" />;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isAnimating ? 1 : 0 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: isAnimating ? 1 : 0.9, opacity: isAnimating ? 1 : 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="max-w-sm w-full p-6 border-2 border-accent/20">
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-md bg-surface-muted flex items-center justify-center text-ink-secondary hover:bg-surface transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                {icon}
              </div>
            </div>

            <h3 className="font-display text-lg font-bold text-ink text-center mb-2">
              {title}
            </h3>

            <p className="text-sm text-ink-secondary text-center mb-6">
              {description}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleGrant('permanent')}
                className="w-full py-3 px-4 rounded-md bg-accent text-white font-medium hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                始终允许
              </button>

              <button
                onClick={() => handleGrant('whileUsing')}
                className="w-full py-3 px-4 rounded-md bg-surface-card border border-line text-ink font-medium hover:bg-surface-muted transition-colors"
              >
                仅在使用期间允许
              </button>

              <button
                onClick={handleDeny}
                className="w-full py-3 px-4 rounded-md text-ink-secondary font-medium hover:text-ink hover:bg-surface-muted/50 transition-colors"
              >
                不允许
              </button>
            </div>

            <p className="text-xs text-ink-muted text-center mt-4">
              您可以在浏览器设置中随时更改权限
            </p>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}