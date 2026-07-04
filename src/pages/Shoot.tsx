import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Camera, SwitchCamera, X, Image as ImageIcon, Grid3X3, Check, Upload, ChevronRight, AlertCircle, RefreshCw, Maximize2, Layers } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore';
import { getLevel, chapterInfo } from '../services/levelService';
import { CompositionOverlay } from '../components/game/GameComponents';
import { inferCompositionRule, compositionRuleLabels } from '../utils/compositionUtils';
import { PageLayout } from '../components/layout/PageLayout';

type CameraError = null | 'denied' | 'unavailable' | 'notsecure';

export function ShootPage() {
  const { levelId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [showGrid, setShowGrid] = useState(true);
  const [showReference, setShowReference] = useState(true);
  const [showGuideLines, setShowGuideLines] = useState(true);
  const [referenceExpanded, setReferenceExpanded] = useState(false);
  const [mode, setMode] = useState<'camera' | 'upload'>(searchParams.get('mode') === 'upload' ? 'upload' : 'camera');
  const fromParam = searchParams.get('from') ? `&from=${searchParams.get('from')}` : '';
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<CameraError>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const { user, setCapturedImage, weeklyChallengeImage, getAllGalleryImages, customGalleryImages } = useGameStore();
  const lid = parseInt(levelId || '1');
  const level = getLevel(lid, user.levelStars[lid] || 0, user.completedLevels.includes(lid));
  const info = chapterInfo[level.chapter];
  const fromCommunity = searchParams.get('from') === 'community';
  const fromGallery = searchParams.get('from') === 'gallery';
  const galleryImageId = searchParams.get('imageId');

  const allGalleryImages = [...customGalleryImages, ...getAllGalleryImages()];
  const galleryImage = galleryImageId ? allGalleryImages.find(img => img.id === galleryImageId) : null;

  const referenceImage = fromGallery && galleryImage
    ? galleryImage
    : level.referenceImage;

  const compositionRule = inferCompositionRule(referenceImage);

  // 检测摄像头能力
  const detectCameraError = (): CameraError => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      // 非安全上下文（HTTP 非 localhost）或不支持摄像头
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return 'notsecure';
      }
      return 'unavailable';
    }
    return null;
  };

  // 摄像头初始化
  const initCamera = async () => {
    // 先检测能力
    const detected = detectCameraError();
    if (detected) {
      setCameraError(detected);
      return;
    }

    setIsRetrying(true);
    setCameraError(null);

    try {
      if (stream) stream.getTracks().forEach(t => t.stop());
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setCameraError(null);
    } catch (err) {
      const error = err as DOMException;
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setCameraError('denied');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setCameraError('unavailable');
      } else {
        setCameraError('unavailable');
      }
    } finally {
      setIsRetrying(false);
    }
  };

  // 摄像头初始化（mode 变化时触发）
  useEffect(() => {
    if (mode !== 'camera') return;
    initCamera();

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [facingMode, mode]);

  const handleRetryCamera = () => {
    initCamera();
  };

  const handleSwitchToUpload = () => {
    setCameraError(null);
    setMode('upload');
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);

    setTimeout(() => {
      setIsCapturing(false);
      if (fromGallery) {
        navigate('/gallery/score');
      } else if (fromCommunity) {
        navigate('/community/score');
      } else {
        navigate(`/score/${lid}${fromParam}`);
      }
    }, 500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCapturedImage(dataUrl);
      if (fromGallery) {
        navigate('/gallery/score');
      } else if (fromCommunity) {
        navigate('/community/score');
      } else {
        navigate(`/score/${lid}${fromParam}`);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <PageLayout immersive>
      <div className="relative min-h-screen">
      {/* 模式切换 */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-ink/60 to-transparent">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-ink/30 backdrop-blur flex items-center justify-center text-surface"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex bg-ink/30 backdrop-blur rounded-full p-1">
            <button
              onClick={() => setMode('camera')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                mode === 'camera' ? 'bg-accent text-surface' : 'text-surface/70'
              }`}
            >
              拍摄
            </button>
            <button
              onClick={() => setMode('upload')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                mode === 'upload' ? 'bg-accent text-surface' : 'text-surface/70'
              }`}
            >
              上传
            </button>
          </div>

          {mode === 'camera' && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${showGrid ? 'bg-accent' : 'bg-ink/30 backdrop-blur'} text-surface`}
                title="构图网格"
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowGuideLines(!showGuideLines)}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${showGuideLines ? 'bg-accent' : 'bg-ink/30 backdrop-blur'} text-surface`}
                title="参考线"
              >
                <Layers className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowReference(!showReference)}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${showReference ? 'bg-accent' : 'bg-ink/30 backdrop-blur'} text-surface`}
                title="参考图"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {mode === 'camera' ? (
        cameraError ? (
          /* 摄像头错误提示 */
          <div className="min-h-screen flex flex-col items-center justify-center p-8">
            <div className="max-w-sm w-full text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-red-500/20 flex items-center justify-center mb-5">
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>

              <h2 className="font-display text-xl font-bold text-surface mb-2">
                {cameraError === 'denied' ? '摄像头权限被拒绝' :
                 cameraError === 'notsecure' ? '需要安全连接' : '摄像头不可用'}
              </h2>

              <p className="text-surface/60 text-sm mb-6 leading-relaxed">
                {cameraError === 'denied'
                  ? '请在浏览器设置中允许访问摄像头，然后重试。或者使用上传图片方式完成本关。'
                  : cameraError === 'notsecure'
                  ? '摄像头功能需要 HTTPS 或 localhost 环境。请使用上传图片方式完成本关。'
                  : '未检测到可用的摄像头设备。请使用上传图片方式完成本关。'}
              </p>

              <div className="flex flex-col gap-3">
                {cameraError === 'denied' && (
                  <button
                    onClick={handleRetryCamera}
                    disabled={isRetrying}
                    className="w-full px-6 py-3.5 rounded-md bg-accent text-surface font-medium shadow-lg shadow-accent/30 hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`} />
                    {isRetrying ? '正在重试...' : '重新获取权限'}
                  </button>
                )}
                <button
                  onClick={handleSwitchToUpload}
                  className="w-full px-6 py-3.5 rounded-md bg-surface-card/10 text-surface font-medium hover:bg-surface-card/15 transition-all flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  改用上传图片
                </button>
              </div>

              <div className="mt-6 bg-surface-card/5 rounded-md p-4 text-left">
                <p className="text-surface/80 text-sm mb-2">📌 本关要求</p>
                <p className="text-surface/60 text-sm mb-1">参考图：{level.referenceImage.title}</p>
                {level.constraints?.map((c, i) => (
                  <p key={i} className="text-accent/80 text-sm">🎯 {c}</p>
                ))}
              </div>
            </div>
          </div>
        ) : (
        <>
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-screen object-cover" />
          <canvas ref={canvasRef} className="hidden" />

          {/* 构图辅助线 */}
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="border border-white/20" />
                ))}
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-6 h-6 border-2 border-accent rounded-full" />
              </div>
            </div>
          )}

          {/* 参考图叠加 */}
          {showReference && (
            <div className="absolute top-20 right-4 w-32 rounded-md overflow-hidden border-2 border-white/40 shadow-xl cursor-pointer"
              onClick={() => setReferenceExpanded(true)}
            >
              <div className="relative">
                <img src={referenceImage.url} alt="参考" className="w-full aspect-square object-cover" />
                {showGuideLines && (
                  <CompositionOverlay rule={compositionRule} showLabel={false} />
                )}
                <div className="absolute top-1 right-1 w-6 h-6 bg-ink/50 rounded-full flex items-center justify-center">
                  <Maximize2 className="w-3.5 h-3.5 text-surface" />
                </div>
              </div>
              <div className="bg-ink/60 backdrop-blur px-2 py-1">
                <p className="text-surface text-xs truncate">{referenceImage.title}</p>
                {showGuideLines && (
                  <p className="text-accent-soft text-xs">{compositionRuleLabels[compositionRule]}</p>
                )}
              </div>
            </div>
          )}

          {/* 参考图放大弹窗 */}
          {referenceExpanded && showReference && (
            <div
              className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
              onClick={() => setReferenceExpanded(false)}
            >
              <div className="relative max-w-lg w-full max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <div className="relative rounded-md overflow-hidden">
                  <img src={referenceImage.url} alt="参考图" className="w-full h-auto max-h-[70vh] object-contain bg-ink" />
                  {showGuideLines && (
                    <CompositionOverlay rule={compositionRule} showLabel={true} />
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-surface font-medium">{referenceImage.title}</h3>
                    <p className="text-surface/60 text-sm">{compositionRuleLabels[compositionRule]} · {info.label}</p>
                  </div>
                  <button
                    onClick={() => setReferenceExpanded(false)}
                    className="w-10 h-10 rounded-full bg-surface-card/10 flex items-center justify-center text-surface hover:bg-surface-card/20"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {level.constraints && !fromGallery && (
                  <div className="mt-3 space-y-1">
                    {level.constraints.map((c, i) => (
                      <p key={i} className="text-accent/90 text-sm">🎯 {c}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI 提示 */}
          <div className="absolute top-32 left-4 right-32 space-y-2">
            <div className="bg-ink/40 backdrop-blur rounded-xl px-3 py-2">
              <p className="text-surface text-sm">📷 {info.label} · {level.title}</p>
            </div>
            {level.constraints?.map((c, i) => (
              <div key={i} className="bg-accent/30 backdrop-blur rounded-xl px-3 py-2">
                <p className="text-surface text-sm">🎯 {c}</p>
              </div>
            ))}
          </div>

          {/* 底部控制 */}
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-ink/80 to-transparent">
            <div className="flex items-center justify-center gap-8">
              <div className="w-14 h-14" />
              <button
                onClick={handleCapture}
                disabled={isCapturing}
                className="w-20 h-20 rounded-full bg-surface flex items-center justify-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <div className={`w-16 h-16 rounded-full border-4 border-ink/10 flex items-center justify-center ${isCapturing ? 'bg-accent animate-pulse' : ''}`}>
                  {!isCapturing && <Camera className="w-7 h-7 text-ink" />}
                </div>
              </button>
              <button
                onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
                className="w-14 h-14 rounded-full bg-ink/30 backdrop-blur flex items-center justify-center text-surface"
              >
                <SwitchCamera className="w-6 h-6" />
              </button>
            </div>
            <p className="text-center text-surface/60 text-sm mt-3">点击拍摄完成本关</p>
          </div>
        </>
        )
      ) : (
        /* 上传模式 */
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-sm border-2 border-dashed border-surface-card/20 rounded-md p-12 text-center hover:border-accent/50 transition-colors"
          >
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            <div className="w-16 h-16 mx-auto rounded-full bg-surface-card/10 flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-accent" />
            </div>
            <p className="text-surface font-medium mb-1">点击上传你的作品</p>
            <p className="text-surface/40 text-sm">支持 JPG / PNG</p>
          </button>

          <div className="mt-6 max-w-sm w-full bg-surface-card/5 rounded-md p-4">
            <p className="text-surface/80 text-sm mb-2">📌 本关要求</p>
            <p className="text-surface/60 text-sm mb-1">参考图：{level.referenceImage.title}</p>
            {level.constraints?.map((c, i) => (
              <p key={i} className="text-accent/80 text-sm">🎯 {c}</p>
            ))}
          </div>

          <button
            onClick={() => setMode('camera')}
            className="mt-6 text-surface/60 text-sm hover:text-surface flex items-center gap-1"
          >
            <Camera className="w-4 h-4" />
            切换到拍摄模式
          </button>
        </div>
      )}
    </div>
    </PageLayout>
  );
}
