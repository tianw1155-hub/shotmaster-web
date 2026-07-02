import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, Check, ChevronRight, Clock, BookOpen, Play, Star } from 'lucide-react';
import { useGameStore } from '../stores/useGameStore';
import { TopBar, BottomNav } from '../components/game/GameComponents';
import { Card, Badge, Button, ProgressBar } from '../components/ui/Button';

const categoryLabels: Record<string, { label: string; color: 'sky' | 'sun' | 'grape' | 'primary' }> = {
  composition: { label: '构图', color: 'sky' },
  light: { label: '光线', color: 'sun' },
  color: { label: '色彩', color: 'grape' },
  narrative: { label: '叙事', color: 'primary' },
};

const difficultyLabels: Record<string, string> = {
  beginner: '入门', intermediate: '进阶', advanced: '高级',
};

export function LearnPage() {
  const navigate = useNavigate();
  const { user, courses } = useGameStore();

  const completedCount = courses.filter(c => c.completed).length;
  const progress = (completedCount / courses.length) * 100;

  return (
    <div className="min-h-screen bg-surface pb-20">
      <TopBar />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        <div className="animate-fade-in">
          <h1 className="font-display text-2xl font-bold text-ink mb-1">学习中心</h1>
          <p className="text-ink-secondary text-sm">系统化摄影课程，随等级提升解锁</p>
        </div>

        {/* 进度 */}
        <Card className="p-4 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-medium text-ink">学习进度</h3>
              <p className="text-ink-muted text-sm">已完成 {completedCount}/{courses.length} 门课程</p>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-sun fill-sun" />
              <span className="text-xl font-bold text-ink">{Math.round(progress)}%</span>
            </div>
          </div>
          <ProgressBar value={progress} color="sun" />
        </Card>

        {/* 课程列表 */}
        <div className="space-y-3">
          {courses.map((course, idx) => {
            const catInfo = categoryLabels[course.category];
            const isLocked = course.requiredLevel > user.level;

            return (
              <button
                key={course.id}
                disabled={isLocked}
                onClick={() => navigate(`/learn/${course.id}`)}
                className={`w-full text-left animate-slide-up ${isLocked ? 'opacity-60' : ''}`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <Card className={`p-3 flex items-center gap-3 ${!isLocked ? 'hover:bg-gray-50' : ''} transition-colors`}>
                  <div className="relative">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className={`w-20 h-20 rounded-2xl object-cover ${course.completed ? 'ring-2 ring-mint' : ''}`}
                    />
                    {course.completed && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-mint flex items-center justify-center border-2 border-white">
                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                      </div>
                    )}
                    {isLocked && (
                      <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                        <Lock className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-ink truncate">{course.title}</h3>
                    <p className="text-ink-muted text-xs mt-0.5 line-clamp-2">{course.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge color={catInfo.color}>{catInfo.label}</Badge>
                      <span className="text-ink-muted text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {course.duration}
                      </span>
                      <span className="text-ink-muted text-xs">{course.lessons}节</span>
                      {isLocked && (
                        <span className="text-ink-muted text-xs">Lv.{course.requiredLevel}解锁</span>
                      )}
                    </div>
                  </div>

                  {!isLocked && <ChevronRight className="w-5 h-5 text-ink-muted flex-shrink-0" />}
                </Card>
              </button>
            );
          })}
        </div>
      </main>

      <BottomNav active="learn" />
    </div>
  );
}

export function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { courses, user, completeCourse } = useGameStore();

  const course = courses.find(c => c.id === id);

  if (!course) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-ink-secondary">课程不存在</p>
      </div>
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
    <div className="min-h-screen bg-surface pb-20">
      <TopBar />

      <main className="max-w-lg mx-auto">
        <div className="relative animate-fade-in">
          <img src={course.thumbnail} alt={course.title} className="w-full aspect-video object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-md"
          >
            <ChevronRight className="w-5 h-5 text-ink rotate-180" />
          </button>
          {!isLocked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={() => completeCourse(course.id)}
                className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/40 hover:scale-110 transition-transform"
              >
                {course.completed ? <Check className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white ml-1" />}
              </button>
            </div>
          )}
        </div>

        <div className="px-4 -mt-8 relative z-10 space-y-4">
          <div className="animate-slide-up">
            <h1 className="font-display text-2xl font-bold text-ink mb-2">{course.title}</h1>
            <div className="flex items-center gap-2">
              <Badge color="sky">{difficultyLabels[course.difficulty]}</Badge>
              <Badge color="sun">{course.duration}</Badge>
              {course.completed && <Badge color="mint"><Check className="w-3 h-3 mr-1 inline" />已完成</Badge>}
            </div>
          </div>

          {isLocked ? (
            <Card className="p-6 text-center animate-slide-up">
              <Lock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-ink font-medium">课程已锁定</p>
              <p className="text-ink-muted text-sm mt-1">需要达到等级 {course.requiredLevel} 才能解锁</p>
              <p className="text-ink-muted text-xs mt-2">当前等级：{user.level}</p>
            </Card>
          ) : (
            <>
              <Card className="p-4 animate-slide-up">
                <h3 className="font-medium text-ink mb-2">课程介绍</h3>
                <p className="text-ink-secondary text-sm">{course.description}</p>
              </Card>

              <Card className="p-4 animate-slide-up">
                <h3 className="font-medium text-ink mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  课程内容
                </h3>
                <div className="space-y-2">
                  {lessons.map((lesson, i) => (
                    <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${course.completed ? 'bg-mint text-white' : 'bg-white text-ink-muted border border-gray-100'}`}>
                        {course.completed ? <Check className="w-4 h-4" /> : <span className="text-sm">{i + 1}</span>}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-ink">{lesson.title}</p>
                        <p className="text-ink-muted text-xs">{lesson.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Button
                variant={course.completed ? 'secondary' : 'primary'}
                size="lg"
                className="w-full animate-slide-up"
                onClick={() => completeCourse(course.id)}
              >
                {course.completed ? <><Check className="w-5 h-5" />已完成</> : <><Play className="w-5 h-5" />开始学习</>}
              </Button>
            </>
          )}
        </div>
      </main>

      <BottomNav active="learn" />
    </div>
  );
}
