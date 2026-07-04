import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, Check, ChevronRight, Clock, BookOpen, Play, Star, Gamepad2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { variants } from '../lib/motion';
import { useGameStore } from '../stores/useGameStore';
import { PageLayout } from '../components/layout/PageLayout';
import { HeroBack } from '../components/ui/HeroBack';
import { Card, Badge, Button, ProgressBar } from '../components/ui/Button';
import { InteractiveLesson, type ConceptConfig } from '../components/lesson/InteractiveLesson';
import { exposureConfig } from '../components/lesson/concepts/exposure';
import { wbConfig } from '../components/lesson/concepts/wb';
import { isoConfig } from '../components/lesson/concepts/iso';
import { apertureConfig } from '../components/lesson/concepts/aperture';
import { focalConfig } from '../components/lesson/concepts/focal';

const conceptList: ConceptConfig[] = [exposureConfig, wbConfig, isoConfig, apertureConfig, focalConfig];

type CatColor = 'default' | 'gold' | 'accent';

const categoryLabels: Record<string, { label: string; color: CatColor }> = {
  composition: { label: '构图', color: 'default' },
  light: { label: '光线', color: 'gold' },
  color: { label: '色彩', color: 'default' },
  narrative: { label: '叙事', color: 'accent' },
};

const difficultyLabels: Record<string, string> = {
  beginner: '入门', intermediate: '进阶', advanced: '高级',
};

const difficultyColors: Record<string, 'accent' | 'gold' | 'ink-muted'> = {
  beginner: 'accent',
  intermediate: 'gold',
  advanced: 'ink-muted',
};

export function LearnPage() {
  const navigate = useNavigate();
  const { user, courses } = useGameStore();
  const [activeConcept, setActiveConcept] = useState<ConceptConfig | null>(null);

  const completedCount = courses.filter(c => c.completed).length;
  const progress = courses.length > 0 ? (completedCount / courses.length) * 100 : 0;

  if (activeConcept) {
    return (
      <PageLayout>
        <InteractiveLesson concept={activeConcept} onComplete={() => setActiveConcept(null)} />
      </PageLayout>
    );
  }

  // Group courses by category
  const grouped = courses.reduce<Record<string, typeof courses>>((acc, c) => {
    (acc[c.category] ??= []).push(c);
    return acc;
  }, {});

  return (
    <PageLayout desktop="split">
      {/* Left: course list rail */}
      <div className="py-6 space-y-6">
        <motion.div variants={variants.fadeUp} initial="hidden" animate="show">
          <h1 className="font-display text-2xl font-bold text-ink mb-1">学习中心</h1>
          <p className="text-ink-muted text-sm">系统化摄影课程，随等级提升解锁</p>
        </motion.div>

        {/* Interactive practice hub */}
        <motion.section variants={variants.fadeUp} initial="hidden" animate="show" transition={{ delay: 0.03 }}>
          <div className="flex items-center gap-2 mb-2">
            <Gamepad2 className="w-4 h-4 text-accent" strokeWidth={1.25} />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">动手练习</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {conceptList.map((c) => (
              <button
                key={c.key}
                onClick={() => setActiveConcept(c)}
                className="rounded-md border border-line px-3 py-3 text-sm text-left hover:bg-surface-muted transition-colors group"
              >
                <div className="font-medium text-ink group-hover:text-accent transition-colors">{c.title}</div>
                <div className="text-ink-muted text-[11px] mt-0.5 leading-tight">{c.kicker}</div>
              </button>
            ))}
          </div>
        </motion.section>

        {/* Course list grouped by category */}
        <div className="space-y-6">
          {Object.entries(grouped).map(([catKey, catCourses], gi) => {
            const catInfo = categoryLabels[catKey];
            return (
              <motion.section
                key={catKey}
                variants={variants.fadeUp}
                initial="hidden"
                animate="show"
                transition={{ delay: gi * 0.06 }}
              >
                <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2 px-1">
                  {catInfo.label}
                </h2>
                <div className="divide-y divide-line border-b border-line">
                  {catCourses.map((course, idx) => {
                    const isLocked = course.requiredLevel > user.level;
                    return (
                      <motion.button
                        key={course.id}
                        disabled={isLocked}
                        onClick={() => navigate(`/learn/${course.id}`)}
                        className={`w-full text-left group ${isLocked ? 'opacity-50' : ''}`}
                        variants={variants.stagger(idx)}
                        initial="hidden"
                        animate="show"
                        whileTap={!isLocked ? { y: 1 } : undefined}
                      >
                        <div className={`py-3 flex items-center gap-3 ${!isLocked ? 'hover:bg-surface-muted/60' : ''} transition-colors`}>
                          <div className="relative flex-shrink-0">
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className={`w-16 h-16 rounded-md object-cover ${course.completed ? 'ring-1 ring-accent' : ''}`}
                              loading="lazy"
                            />
                            {course.completed && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                              </div>
                            )}
                            {isLocked && (
                              <div className="absolute inset-0 bg-ink/40 rounded-md flex items-center justify-center">
                                <Lock className="w-5 h-5 text-white" strokeWidth={1.25} />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-ink text-sm truncate">{course.title}</h3>
                            <p className="text-ink-muted text-xs mt-0.5 line-clamp-2">{course.description}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-ink-muted text-[11px] flex items-center gap-1">
                                <Clock className="w-3 h-3" strokeWidth={1.25} />
                                {course.duration}
                              </span>
                              <span className="text-ink-muted text-[11px]">{course.lessons}节</span>
                              {isLocked && (
                                <span className="text-ink-muted text-[11px]">Lv.{course.requiredLevel}解锁</span>
                              )}
                            </div>
                          </div>

                          {!isLocked && (
                            <ChevronRight className="w-4 h-4 text-ink-muted flex-shrink-0 group-hover:text-ink transition-colors" strokeWidth={1.25} />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.section>
            );
          })}
        </div>
      </div>

      {/* Right: progress overview (desktop sidebar) */}
      <aside className="py-6">
        <motion.div
          variants={variants.fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.05 }}
          className="sticky top-28 space-y-4"
        >
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium text-ink text-sm">学习进度</h3>
                <p className="text-ink-muted text-xs mt-0.5">
                  已完成 {completedCount}/{courses.length} 门课程
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-gold fill-gold" strokeWidth={1.25} />
                <span className="text-xl font-bold text-ink">{Math.round(progress)}%</span>
              </div>
            </div>
            <ProgressBar value={progress} color="gold" />
          </Card>

          {/* Quick stats */}
          <div className="divide-y divide-line">
            {[
              { label: '已解锁', value: `${courses.filter(c => c.requiredLevel <= user.level).length}/${courses.length}` },
              { label: '当前等级', value: `Lv.${user.level}` },
              { label: '下一等级', value: `Lv.${user.level + 1}` },
            ].map((stat, i) => (
              <div key={stat.label} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-ink-muted">{stat.label}</span>
                <span className="font-medium text-ink">{stat.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </aside>
    </PageLayout>
  );
}

export function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { courses, user, completeCourse } = useGameStore();

  const course = courses.find(c => c.id === id);

  if (!course) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-20">
          <motion.p
            variants={variants.fadeUp}
            initial="hidden"
            animate="show"
            className="text-ink-muted"
          >
            课程不存在
          </motion.p>
        </div>
      </PageLayout>
    );
  }

  const isLocked = course.requiredLevel > user.level;

  const lessons = [
    { id: 1, title: '课程介绍与学习方法', duration: '5分钟' },
    { id: 2, title: '核心概念讲解', duration: '10分钟' },
    { id: 3, title: '实例演示', duration: '15分钟' },
    { id: 4, title: '实战练习', duration: '10分钟' },
    { id: 5, title: '总结与作业', duration: '5分钟' },
  ].slice(0, course.lessons);

  return (
    <PageLayout>
      <div className="py-6 space-y-6">
        {/* Hero */}
        <motion.div
          variants={variants.fadeUp}
          initial="hidden"
          animate="show"
          className="relative overflow-hidden rounded-md"
        >
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full aspect-video object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
          <HeroBack onClick={() => navigate(-1)} />
          {!isLocked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={() => completeCourse(course.id)}
                className="w-16 h-16 rounded-full bg-accent flex items-center justify-center shadow-elevated hover:scale-105 active:scale-95 transition-transform"
              >
                {course.completed ? (
                  <Check className="w-8 h-8 text-white" strokeWidth={1.25} />
                ) : (
                  <Play className="w-8 h-8 text-white ml-1" strokeWidth={1.25} />
                )}
              </button>
            </div>
          )}
        </motion.div>

        {/* Title row */}
        <motion.div
          variants={variants.fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.04 }}
        >
          <h1 className="font-display text-2xl font-bold text-ink mb-2">{course.title}</h1>
          <div className="flex items-center gap-2">
            <Badge color={difficultyColors[course.difficulty] ?? 'default'}>
              {difficultyLabels[course.difficulty]}
            </Badge>
            <Badge color="gold">{course.duration}</Badge>
            <Badge color="default">{course.lessons} 节课</Badge>
            {course.completed && (
              <Badge color="accent">
                <Check className="w-3 h-3 mr-1 inline" strokeWidth={1.25} />
                已完成
              </Badge>
            )}
          </div>
        </motion.div>

        {isLocked ? (
          <motion.div variants={variants.fadeUp} initial="hidden" animate="show" transition={{ delay: 0.06 }}>
            <Card className="p-8 text-center">
              <Lock className="w-10 h-10 text-ink-muted mx-auto mb-3" strokeWidth={1.25} />
              <p className="text-ink font-medium">课程已锁定</p>
              <p className="text-ink-muted text-sm mt-1">
                需要达到等级 {course.requiredLevel} 才能解锁
              </p>
              <p className="text-ink-muted text-xs mt-2">当前等级：Lv.{user.level}</p>
            </Card>
          </motion.div>
        ) : (
          <>
            {/* Content area: split on desktop */}
            <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6 space-y-6 lg:space-y-0">
              {/* Left: course content */}
              <div className="space-y-5">
                {/* Course description */}
                <motion.div
                  variants={variants.fadeUp}
                  initial="hidden"
                  animate="show"
                  transition={{ delay: 0.08 }}
                >
                  <h3 className="font-medium text-ink text-sm mb-2">课程介绍</h3>
                  <p className="text-ink-muted text-sm leading-relaxed">{course.description}</p>
                </motion.div>

                {/* Lesson list */}
                <motion.div
                  variants={variants.fadeUp}
                  initial="hidden"
                  animate="show"
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="font-medium text-ink text-sm mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-accent" strokeWidth={1.25} />
                    课程内容
                  </h3>
                  <div className="divide-y divide-line border-y border-line">
                    {lessons.map((lesson, i) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 py-2.5"
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                            course.completed
                              ? 'bg-accent text-white'
                              : 'bg-surface-muted text-ink-muted'
                          }`}
                        >
                          {course.completed ? (
                            <Check className="w-3.5 h-3.5" strokeWidth={1.25} />
                          ) : (
                            <span className="text-xs">{i + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-ink">{lesson.title}</p>
                          <p className="text-ink-muted text-xs">{lesson.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Right: sticky action card */}
              <aside>
                <motion.div
                  variants={variants.fadeUp}
                  initial="hidden"
                  animate="show"
                  transition={{ delay: 0.12 }}
                  className="sticky top-28"
                >
                  <Card className="p-5 space-y-4">
                    <div className="text-center">
                      <p className="text-ink font-medium text-sm">
                        {course.completed ? '课程已完成' : '继续学习'}
                      </p>
                      <p className="text-ink-muted text-xs mt-1">
                        {course.lessons} 节课 · {course.duration}
                      </p>
                    </div>

                    <Button
                      variant={course.completed ? 'secondary' : 'accent'}
                      size="lg"
                      className="w-full"
                      onClick={() => completeCourse(course.id)}
                    >
                      {course.completed ? (
                        <>
                          <Check className="w-5 h-5" strokeWidth={1.25} />
                          已完成
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" strokeWidth={1.25} />
                          开始学习
                        </>
                      )}
                    </Button>

                    <div className="divide-y divide-line text-sm">
                      <div className="flex items-center justify-between py-2">
                        <span className="text-ink-muted">难度</span>
                        <span className="text-ink font-medium">
                          {difficultyLabels[course.difficulty]}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-ink-muted">等级要求</span>
                        <span className="text-ink font-medium">Lv.{course.requiredLevel}</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-ink-muted">进度</span>
                        <span className="text-ink font-medium">
                          {course.completed ? '100%' : '0%'}
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </aside>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}
