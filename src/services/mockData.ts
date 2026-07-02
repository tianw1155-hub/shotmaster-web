import { GalleryImage, Course, Achievement, CommunityWork, Chapter } from '../types';

// 参考图库
export const mockGalleryImages: GalleryImage[] = [
  { id: 'g1', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', title: '日出金山', category: 'landscape', difficulty: 'intermediate', tags: ['日出', '山脉', '金色时刻'], author: 'Sven Pieren', authorUrl: 'https://unsplash.com/@sven_pieren' },
  { id: 'g2', url: 'https://images.unsplash.com/photo-1493976040374-85c2e8f7145e?w=800', title: '京都小巷', category: 'street', difficulty: 'beginner', tags: ['建筑', '街道', '对称'], author: 'Michael', authorUrl: 'https://unsplash.com/@michael75' },
  { id: 'g3', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800', title: '自然人像', category: 'portrait', difficulty: 'beginner', tags: ['人像', '自然光', '户外'], author: 'Amin Oussar', authorUrl: 'https://unsplash.com/@aminuss' },
  { id: 'g4', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', title: '光影人像', category: 'portrait', difficulty: 'advanced', tags: ['人像', '侧光', '明暗'], author: 'Andras Vas', authorUrl: 'https://unsplash.com/@andras_vas' },
  { id: 'g5', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800', title: '星空雪山', category: 'landscape', difficulty: 'advanced', tags: ['星空', '夜景', '长曝光'], author: 'Jackson Hendry', authorUrl: 'https://unsplash.com/@actionjackson801' },
  { id: 'g6', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800', title: '逆光剪影', category: 'light', difficulty: 'intermediate', tags: ['逆光', '剪影', '夕阳'], author: 'Sasha Freemind', authorUrl: 'https://unsplash.com/@sashafreemind' },
  { id: 'g7', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800', title: '湖面倒影', category: 'composition', difficulty: 'intermediate', tags: ['倒影', '对称', '自然'], author: 'v2osk', authorUrl: 'https://unsplash.com/@v2osk' },
  { id: 'g8', url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800', title: '晨雾森林', category: 'color', difficulty: 'intermediate', tags: ['绿色', '雾气', '宁静'], author: 'Christian Boragine', authorUrl: 'https://unsplash.com/@boragine' },
  { id: 'g9', url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800', title: '林间小道', category: 'composition', difficulty: 'beginner', tags: ['引导线', '森林', '小径'], author: 'Geranimo', authorUrl: 'https://unsplash.com/@geraninmo' },
  { id: 'g10', url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800', title: '草原日落', category: 'color', difficulty: 'beginner', tags: ['日落', '暖色', '开阔'], author: 'Sven Pieren', authorUrl: 'https://unsplash.com/@sven_pieren' },
  { id: 'g11', url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800', title: '咖啡时光', category: 'still', difficulty: 'beginner', tags: ['室内', '柔光', '暖调'], author: 'Isaac Benhesed', authorUrl: 'https://unsplash.com/@isaacbenhesed' },
  { id: 'g12', url: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800', title: '海边少女', category: 'portrait', difficulty: 'intermediate', tags: ['海边', '背影', '浪漫'], author: 'Marina Vitale', authorUrl: 'https://unsplash.com/@marina_mv08' },
  { id: 'g13', url: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800', title: '城市夜景', category: 'light', difficulty: 'advanced', tags: ['夜景', '灯光', '长曝光'], author: 'Zac Ong', authorUrl: 'https://unsplash.com/@zacong' },
  { id: 'g14', url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800', title: '雪山远眺', category: 'landscape', difficulty: 'beginner', tags: ['雪山', '蓝白', '简洁'], author: 'Mads Eneqvist', authorUrl: 'https://unsplash.com/@madseneqvist' },
  { id: 'g15', url: 'https://images.unsplash.com/photo-1494253109108-2e9360336c0e?w=800', title: '复古色调', category: 'color', difficulty: 'advanced', tags: ['复古', '暖色', '胶片'], author: 'Annie Spratt', authorUrl: 'https://unsplash.com/@anniespratt' },
  { id: 'g16', url: 'https://images.unsplash.com/photo-1534528741775-53989a4037e1?w=800', title: '时尚人像', category: 'portrait', difficulty: 'advanced', tags: ['时尚', '特写', '精致'], author: 'Samuel Dixon', authorUrl: 'https://unsplash.com/@samueldixon' },
  { id: 'g17', url: 'https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?w=800', title: '瀑布流水', category: 'composition', difficulty: 'intermediate', tags: ['流水', '长曝光', '动感'], author: 'v2osk', authorUrl: 'https://unsplash.com/@v2osk' },
  { id: 'g18', url: 'https://images.unsplash.com/photo-1504198453319-5ce911b9a6e3?w=800', title: '赛博朋克', category: 'color', difficulty: 'advanced', tags: ['霓虹', '暗调', '未来'], author: 'Simon White', authorUrl: 'https://unsplash.com/@simon_white' },
  { id: 'g19', url: 'https://images.unsplash.com/photo-1493238798108-c1d9a1f8b8c0?w=800', title: '极简建筑', category: 'composition', difficulty: 'advanced', tags: ['极简', '几何', '线条'], author: 'Tobias Keller', authorUrl: 'https://unsplash.com/@tokeller' },
  { id: 'g20', url: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fe8?w=800', title: '金色麦田', category: 'light', difficulty: 'beginner', tags: ['麦田', '阳光', '温暖'], author: 'Sven Pieren', authorUrl: 'https://unsplash.com/@sven_pieren' },
  { id: 'g21', url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800', title: '海岸线', category: 'landscape', difficulty: 'intermediate', tags: ['海岸', '蓝色', '广阔'], author: 'Sean Pierce', authorUrl: 'https://unsplash.com/@prevailz' },
  { id: 'g22', url: 'https://images.unsplash.com/photo-1444065381814-865dc9da92c0?w=800', title: '街拍瞬间', category: 'street', difficulty: 'intermediate', tags: ['街拍', '瞬间', '城市'], author: 'Jackie Alexander', authorUrl: 'https://unsplash.com/@jackiealexander' },
  { id: 'g23', url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5f?w=800', title: '面包静物', category: 'still', difficulty: 'beginner', tags: ['食物', '暖光', '质感'], author: 'Melanie Rosillo Galvan', authorUrl: 'https://unsplash.com/@meluxrose' },
  { id: 'g24', url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800', title: '秋日树林', category: 'color', difficulty: 'beginner', tags: ['秋天', '金黄', '色彩'], author: 'Magdalena Smolnicka', authorUrl: 'https://unsplash.com/@magdasmolnicka' },
  { id: 'g25', url: 'https://images.unsplash.com/photo-1517495306984-f84210f8daa0?w=800', title: '城市街角', category: 'street', difficulty: 'beginner', tags: ['街拍', '光影', '城市'], author: 'Nicholas Green', authorUrl: 'https://unsplash.com/@nickxshotz' },
  { id: 'g26', url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800', title: '花卉特写', category: 'still', difficulty: 'intermediate', tags: ['花卉', '微距', '柔焦'], author: 'Rachel McDermott', authorUrl: 'https://unsplash.com/@rachcmcd' },
  { id: 'g27', url: 'https://images.unsplash.com/photo-14552188769-a3c41b7c2e6b?w=800', title: '街头人物', category: 'street', difficulty: 'advanced', tags: ['人物', '街头', '故事'], author: 'Jon Tyson', authorUrl: 'https://unsplash.com/@jontyson' },
  { id: 'g28', url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800', title: '旅行风景', category: 'landscape', difficulty: 'beginner', tags: ['旅行', '自然', '壮丽'], author: 'Sven Pieren', authorUrl: 'https://unsplash.com/@sven_pieren' },
  { id: 'g29', url: 'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=800', title: '建筑几何', category: 'composition', difficulty: 'intermediate', tags: ['建筑', '几何', '线条'], author: 'Tristan B.', authorUrl: 'https://unsplash.com/@777tristanb' },
  { id: 'g30', url: 'https://images.unsplash.com/photo-1554233141-30232b89e9a0?w=800', title: '逆光花卉', category: 'light', difficulty: 'intermediate', tags: ['逆光', '花卉', '通透'], author: 'Rachel McDermott', authorUrl: 'https://unsplash.com/@rachcmcd' },
  { id: 'g31', url: '/images/level1-rule-of-thirds-overlay.jpg', title: '三分法日落', category: 'composition', difficulty: 'beginner', tags: ['三分法', '日落', '山脉'], author: 'Artem Sapegin', authorUrl: 'https://unsplash.com/@sapegin' },
  { id: 'l1', url: '/images/levels/level1.jpg', title: '三分法日落', category: 'composition', difficulty: 'beginner', tags: ['三分法', '日落', '山脉'], author: 'Sven Pieren', authorUrl: 'https://unsplash.com/@sven_pieren' },
  { id: 'l2', url: '/images/levels/level2.jpg', title: '对称大桥', category: 'composition', difficulty: 'beginner', tags: ['对称', '桥梁', '夜景'], author: 'Michael', authorUrl: 'https://unsplash.com/@michael75' },
  { id: 'l3', url: '/images/levels/level3.jpg', title: '林间小路', category: 'composition', difficulty: 'beginner', tags: ['引导线', '森林', '小路'], author: 'Geranimo', authorUrl: 'https://unsplash.com/@geraninmo' },
  { id: 'l4', url: '/images/levels/level4.jpg', title: '窗户框架', category: 'composition', difficulty: 'beginner', tags: ['框架', '窗户', '建筑'], author: 'Zoshua Colah', authorUrl: 'https://unsplash.com/@zoshuacolah' },
  { id: 'l5', url: '/images/levels/level5.jpg', title: '前景花卉', category: 'composition', difficulty: 'beginner', tags: ['前景', '虚化', '花卉'], author: 'Bruce Kee', authorUrl: 'https://unsplash.com/@brucekee' },
  { id: 'l6', url: '/images/levels/level6.jpg', title: '极简飞鸟', category: 'composition', difficulty: 'beginner', tags: ['留白', '极简', '飞鸟'], author: 'Javier Garcia Chavez', authorUrl: 'https://unsplash.com/@sacks08' },
  { id: 'l7', url: '/images/levels/level7.jpg', title: '黄金人像', category: 'composition', difficulty: 'beginner', tags: ['黄金比例', '人像', '自然'], author: 'Rachel McDermott', authorUrl: 'https://unsplash.com/@rachcmcd' },
  { id: 'l8', url: '/images/levels/level8.jpg', title: '对角线楼梯', category: 'composition', difficulty: 'intermediate', tags: ['对角线', '楼梯', '建筑'], author: 'Rubén García', authorUrl: 'https://unsplash.com/@rubengg' },
  { id: 'l9', url: '/images/levels/level9.jpg', title: '极简建筑', category: 'composition', difficulty: 'intermediate', tags: ['极简', '建筑', '几何'], author: 'Tristan B.', authorUrl: 'https://unsplash.com/@777tristanb' },
  { id: 'l10', url: '/images/levels/level10.jpg', title: '山脉日出', category: 'composition', difficulty: 'intermediate', tags: ['综合', '风光', '日出'], author: 'Dawid Zawiła', authorUrl: 'https://unsplash.com/@dave__93' },
  { id: 'l11', url: '/images/levels/level11.jpg', title: '顺光人像', category: 'light', difficulty: 'beginner', tags: ['顺光', '人像', '户外'], author: 'Amin Oussar', authorUrl: 'https://unsplash.com/@aminuss' },
  { id: 'l12', url: '/images/levels/level12.jpg', title: '侧光人像', category: 'light', difficulty: 'beginner', tags: ['侧光', '人像', '光影'], author: 'Andras Vas', authorUrl: 'https://unsplash.com/@andras_vas' },
  { id: 'l13', url: '/images/levels/level13.jpg', title: '逆光剪影', category: 'light', difficulty: 'intermediate', tags: ['逆光', '剪影', '日落'], author: 'Sasha Freemind', authorUrl: 'https://unsplash.com/@sashafreemind' },
  { id: 'l14', url: '/images/levels/level14.jpg', title: '柔光人像', category: 'light', difficulty: 'beginner', tags: ['柔光', '人像', '自然光'], author: 'Marius Muresan', authorUrl: 'https://unsplash.com/@mariusmuresan' },
  { id: 'l15', url: '/images/levels/level15.jpg', title: '硬光人像', category: 'light', difficulty: 'intermediate', tags: ['硬光', '对比', '人像'], author: 'Andras Vas', authorUrl: 'https://unsplash.com/@andras_vas' },
  { id: 'l16', url: '/images/levels/level16.jpg', title: '黄金时刻', category: 'light', difficulty: 'beginner', tags: ['黄金时刻', '日落', '山脉'], author: 'Sven Pieren', authorUrl: 'https://unsplash.com/@sven_pieren' },
  { id: 'l17', url: '/images/levels/level17.jpg', title: '阴天散射', category: 'light', difficulty: 'beginner', tags: ['散射光', '阴天', '人像'], author: 'Krzysztof Kowalik', authorUrl: 'https://unsplash.com/@krzysiek' },
  { id: 'l18', url: '/images/levels/level18.jpg', title: '窗光人像', category: 'light', difficulty: 'beginner', tags: ['窗光', '室内', '人像'], author: 'Marius Muresan', authorUrl: 'https://unsplash.com/@mariusmuresan' },
  { id: 'l19', url: '/images/levels/level19.jpg', title: '林间光束', category: 'light', difficulty: 'intermediate', tags: ['光质', '森林', '丁达尔'], author: 'Erik van Dijk', authorUrl: 'https://unsplash.com/@erikvandijk' },
  { id: 'l20', url: '/images/levels/level20.jpg', title: '光影图案', category: 'light', difficulty: 'intermediate', tags: ['光影', '图案', '建筑'], author: 'Coline Haslé', authorUrl: 'https://unsplash.com/@colinehasle' },
  { id: 'l21', url: '/images/levels/level21.jpg', title: '暖色秋日', category: 'color', difficulty: 'beginner', tags: ['暖色', '秋天', '橙红'], author: 'Magdalena Smolnicka', authorUrl: 'https://unsplash.com/@magdasmolnicka' },
  { id: 'l22', url: '/images/levels/level22.jpg', title: '冷色冬日', category: 'color', difficulty: 'beginner', tags: ['冷色', '蓝色', '冬季'], author: 'Ebba Thoresson', authorUrl: 'https://unsplash.com/@ebbathoresson' },
  { id: 'l23', url: '/images/levels/level23.jpg', title: '对比色渐变', category: 'color', difficulty: 'intermediate', tags: ['对比色', '渐变', '色彩'], author: 'Codioful (Formerly Gradienta)', authorUrl: 'https://unsplash.com/@codioful' },
  { id: 'l24', url: '/images/levels/level24.jpg', title: '邻近色自然', category: 'color', difficulty: 'beginner', tags: ['邻近色', '绿色', '自然'], author: 'Christian Boragine', authorUrl: 'https://unsplash.com/@boragine' },
  { id: 'l25', url: '/images/levels/level25.jpg', title: '色彩情绪', category: 'color', difficulty: 'intermediate', tags: ['情绪', '紫调', '人像'], author: 'Marshal Quast', authorUrl: 'https://unsplash.com/@mquast' },
  { id: 'l26', url: '/images/levels/level26.jpg', title: '黑白人像', category: 'color', difficulty: 'intermediate', tags: ['单色', '黑白', '人像'], author: 'Rachel McDermott', authorUrl: 'https://unsplash.com/@rachcmcd' },
  { id: 'l27', url: '/images/levels/level27.jpg', title: '中性灰调', category: 'color', difficulty: 'intermediate', tags: ['灰调', '低饱和', '极简'], author: 'Melanie Rosillo Galvan', authorUrl: 'https://unsplash.com/@meluxrose' },
  { id: 'l28', url: '/images/levels/level28.jpg', title: '高饱和街拍', category: 'color', difficulty: 'intermediate', tags: ['高饱和', '街拍', '色彩'], author: 'Simon White', authorUrl: 'https://unsplash.com/@simon_white' },
  { id: 'l29', url: '/images/levels/level29.jpg', title: '复古风景', category: 'color', difficulty: 'intermediate', tags: ['复古', '胶片', '风景'], author: 'Annie Spratt', authorUrl: 'https://unsplash.com/@anniespratt' },
  { id: 'l30', url: '/images/levels/level30.jpg', title: '色彩综合', category: 'color', difficulty: 'intermediate', tags: ['综合', '色彩', '创意'], author: 'Robert Katzki', authorUrl: 'https://unsplash.com/@katzki' },
  { id: 'l31', url: '/images/levels/level31.jpg', title: '人像表情', category: 'portrait', difficulty: 'beginner', tags: ['人像', '表情', '自然'], author: 'atelierbyvineeth', authorUrl: 'https://unsplash.com/@atelierbyvineeth' },
  { id: 'l32', url: '/images/levels/level32.jpg', title: '风景层次', category: 'landscape', difficulty: 'beginner', tags: ['层次', '风景', '前景'], author: 'Maciek Sulkowski', authorUrl: 'https://unsplash.com/@macieksulkowski' },
  { id: 'l33', url: '/images/levels/level33.jpg', title: '静物咖啡', category: 'still', difficulty: 'beginner', tags: ['静物', '咖啡', '质感'], author: 'Isaac Benhesed', authorUrl: 'https://unsplash.com/@isaacbenhesed' },
  { id: 'l34', url: '/images/levels/level34.jpg', title: '街拍瞬间', category: 'street', difficulty: 'intermediate', tags: ['街拍', '瞬间', '城市'], author: 'Jackie Alexander', authorUrl: 'https://unsplash.com/@jackiealexander' },
  { id: 'l35', url: '/images/levels/level35.jpg', title: '故事街拍', category: 'street', difficulty: 'intermediate', tags: ['叙事', '街拍', '故事'], author: 'Nicholas Green', authorUrl: 'https://unsplash.com/@nickxshotz' },
  { id: 'l36', url: '/images/levels/level36.jpg', title: '运动模糊', category: 'street', difficulty: 'intermediate', tags: ['动感', '运动', '模糊'], author: 'James Lee', authorUrl: 'https://unsplash.com/@jbl12761' },
  { id: 'l37', url: '/images/levels/level37.jpg', title: '动静流水', category: 'landscape', difficulty: 'intermediate', tags: ['动静', '长曝光', '流水'], author: 'Mads Eneqvist', authorUrl: 'https://unsplash.com/@madseneqvist' },
  { id: 'l38', url: '/images/levels/level38.jpg', title: '特写人像', category: 'portrait', difficulty: 'intermediate', tags: ['特写', '人像', '冲击力'], author: 'Marina Vitale', authorUrl: 'https://unsplash.com/@marina_mv08' },
  { id: 'l39', url: '/images/levels/level39.jpg', title: '环境人像', category: 'portrait', difficulty: 'intermediate', tags: ['环境人像', '自然', '户外'], author: '🇸🇮 Janko Ferlič', authorUrl: 'https://unsplash.com/@itfeelslikefilm' },
  { id: 'l40', url: '/images/levels/level40.jpg', title: '组照系列', category: 'street', difficulty: 'intermediate', tags: ['系列', '组照', '故事'], author: 'Jon Tyson', authorUrl: 'https://unsplash.com/@jontyson' },
  { id: 'l41', url: '/images/levels/level41.jpg', title: '城市夜景', category: 'light', difficulty: 'advanced', tags: ['夜景', '城市', '灯光'], author: 'Zac Ong', authorUrl: 'https://unsplash.com/@zacong' },
  { id: 'l42', url: '/images/levels/level42.jpg', title: '星空银河', category: 'landscape', difficulty: 'advanced', tags: ['星空', '银河', '夜景'], author: 'Jackson Hendry', authorUrl: 'https://unsplash.com/@actionjackson801' },
  { id: 'l43', url: '/images/levels/level43.jpg', title: '长曝瀑布', category: 'landscape', difficulty: 'advanced', tags: ['长曝光', '瀑布', '流水'], author: 'v2osk', authorUrl: 'https://unsplash.com/@v2osk' },
  { id: 'l44', url: '/images/levels/level44.jpg', title: '双重曝光', category: 'portrait', difficulty: 'advanced', tags: ['双重曝光', '创意', '人像'], author: 'Luke Moss', authorUrl: 'https://unsplash.com/@lmoss_photo' },
  { id: 'l45', url: '/images/levels/level45.jpg', title: '人文纪实', category: 'street', difficulty: 'advanced', tags: ['纪实', '人文', '街拍'], author: 'Annie Spratt', authorUrl: 'https://unsplash.com/@anniespratt' },
  { id: 'l46', url: '/images/levels/level46.jpg', title: '风光大片', category: 'landscape', difficulty: 'advanced', tags: ['风光', '山脉', '日落'], author: 'Sven Pieren', authorUrl: 'https://unsplash.com/@sven_pieren' },
  { id: 'l47', url: '/images/levels/level47.jpg', title: '时尚人像', category: 'portrait', difficulty: 'advanced', tags: ['时尚', '人像', '杂志'], author: 'Samuel Dixon', authorUrl: 'https://unsplash.com/@samueldixon' },
  { id: 'l48', url: '/images/levels/level48.jpg', title: '建筑艺术', category: 'composition', difficulty: 'advanced', tags: ['建筑', '几何', '艺术'], author: 'Tobias Keller', authorUrl: 'https://unsplash.com/@tokeller' },
  { id: 'l49', url: '/images/levels/level49.jpg', title: '观念摄影', category: 'color', difficulty: 'advanced', tags: ['观念', '创意', '抽象'], author: 'Ahmet Ölçüm', authorUrl: 'https://unsplash.com/@ahmetolcum' },
  { id: 'l50', url: '/images/levels/level50.jpg', title: '大师综合', category: 'landscape', difficulty: 'advanced', tags: ['综合', '大师', '风光'], author: 'Sean Pierce', authorUrl: 'https://unsplash.com/@prevailz' },
];

// 课程列表
export const mockCourses: Course[] = [
  { id: 'c1', title: '摄影入门基础', description: '了解相机基本参数，光圈、快门、ISO的关系', category: 'composition', difficulty: 'beginner', duration: '45分钟', lessons: 5, unlocked: true, completed: false, thumbnail: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400', requiredLevel: 1 },
  { id: 'c2', title: '三分法构图', description: '学习最基础的构图法则，让照片更具美感', category: 'composition', difficulty: 'beginner', duration: '30分钟', lessons: 4, unlocked: true, completed: false, thumbnail: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400', requiredLevel: 1 },
  { id: 'c3', title: '光线运用入门', description: '认识不同光线的特点，学会利用自然光', category: 'light', difficulty: 'beginner', duration: '40分钟', lessons: 5, unlocked: false, completed: false, thumbnail: 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=400', requiredLevel: 3 },
  { id: 'c4', title: '人像摄影基础', description: '人像拍摄的基本姿势和构图技巧', category: 'narrative', difficulty: 'intermediate', duration: '50分钟', lessons: 6, unlocked: false, completed: false, thumbnail: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400', requiredLevel: 5 },
  { id: 'c5', title: '色彩理论基础', description: '学习色彩搭配原理，让照片更和谐', category: 'color', difficulty: 'intermediate', duration: '35分钟', lessons: 4, unlocked: false, completed: false, thumbnail: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400', requiredLevel: 7 },
  { id: 'c6', title: '风景摄影进阶', description: '掌握风景摄影的曝光技巧和构图方法', category: 'composition', difficulty: 'intermediate', duration: '55分钟', lessons: 7, unlocked: false, completed: false, thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400', requiredLevel: 10 },
  { id: 'c7', title: '街拍叙事技巧', description: '用镜头讲述城市故事，捕捉决定性瞬间', category: 'narrative', difficulty: 'advanced', duration: '60分钟', lessons: 8, unlocked: false, completed: false, thumbnail: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba77b?w=400', requiredLevel: 15 },
  { id: 'c8', title: '夜景摄影全攻略', description: '从器材到参数，全面掌握夜景拍摄', category: 'light', difficulty: 'advanced', duration: '65分钟', lessons: 9, unlocked: false, completed: false, thumbnail: 'https://images.unsplash.com/photo-1493514789931-586cb221d7a7?w=400', requiredLevel: 18 },
];

// 成就列表
export const mockAchievements: Achievement[] = [
  { id: 'a1', name: '初出茅庐', description: '完成第1关', icon: '🌱', color: 'mint', unlocked: false, progress: 0 },
  { id: 'a2', name: '构图学徒', description: '完成构图基础篇全部5关', icon: '📐', color: 'sky', unlocked: false, progress: 0 },
  { id: 'a3', name: '光线掌控者', description: '光线运用篇全3星', icon: '☀️', color: 'sun', unlocked: false, progress: 0 },
  { id: 'a4', name: '色彩大师', description: '色彩搭配篇全3星', icon: '🎨', color: 'grape', unlocked: false, progress: 0 },
  { id: 'a5', name: '百连达人', description: '连续通关100次', icon: '🔥', color: 'primary', unlocked: false, progress: 0 },
  { id: 'a6', name: '挑战者', description: '完成50个随机挑战关卡', icon: '⚔️', color: 'primary', unlocked: false, progress: 0 },
  { id: 'a7', name: '完美主义者', description: '累计获得50个3星', icon: '⭐', color: 'sun', unlocked: false, progress: 0 },
  { id: 'a8', name: '摄影达人', description: '达到等级20', icon: '🏆', color: 'sun', unlocked: false, progress: 0 },
];

// 固定关卡配置类型
interface FixedLevelConfig {
  chapter: Chapter;
  title: string;
  imageId: string;
  focus: string;
  constraints: string[];
}

// 固定教学关卡配置（1-50关，按难度从低到高）
export const fixedLevelsConfig: FixedLevelConfig[] = [
  // ===== 构图基础篇 1-10 (难度1-2) =====
  { chapter: 'composition', title: '三分法入门', imageId: 'l1', focus: '三分法则', constraints: ['使用三分法构图'] },
  { chapter: 'composition', title: '对称之美', imageId: 'l2', focus: '对称构图', constraints: ['保持画面左右对称'] },
  { chapter: 'composition', title: '引导线发现', imageId: 'l3', focus: '引导线', constraints: ['利用线条引导视线'] },
  { chapter: 'composition', title: '框架构图', imageId: 'l4', focus: '框架', constraints: ['用环境元素做框架'] },
  { chapter: 'composition', title: '前景运用', imageId: 'l5', focus: '前景', constraints: ['加入有意义的前景'] },
  { chapter: 'composition', title: '留白艺术', imageId: 'l6', focus: '留白', constraints: ['画面留白不少于30%'] },
  { chapter: 'composition', title: '黄金分割', imageId: 'l7', focus: '黄金比例', constraints: ['主体放在黄金分割点'] },
  { chapter: 'composition', title: '对角线韵律', imageId: 'l8', focus: '对角线', constraints: ['运用对角线构图'] },
  { chapter: 'composition', title: '极简入门', imageId: 'l9', focus: '极简', constraints: ['画面元素不超过3个'] },
  { chapter: 'composition', title: '构图综合', imageId: 'l10', focus: '综合构图', constraints: ['运用两种以上构图法'] },

  // ===== 光线运用篇 11-20 (难度2-3) =====
  { chapter: 'light', title: '顺光基础', imageId: 'l11', focus: '顺光', constraints: ['光源在拍摄者后方'] },
  { chapter: 'light', title: '侧光魅力', imageId: 'l12', focus: '侧光', constraints: ['光源在主体侧面45度'] },
  { chapter: 'light', title: '逆光剪影', imageId: 'l13', focus: '逆光', constraints: ['利用逆光拍剪影'] },
  { chapter: 'light', title: '柔光质感', imageId: 'l14', focus: '柔光', constraints: ['使用柔和漫射光'] },
  { chapter: 'light', title: '硬光对比', imageId: 'l15', focus: '硬光', constraints: ['强光下的明暗对比'] },
  { chapter: 'light', title: '日出日落', imageId: 'l16', focus: '黄金时刻', constraints: ['利用黄金时刻光线'] },
  { chapter: 'light', title: '阴天散射', imageId: 'l17', focus: '散射光', constraints: ['利用阴天的柔和光线'] },
  { chapter: 'light', title: '室内自然光', imageId: 'l18', focus: '窗光', constraints: ['利用窗光拍摄'] },
  { chapter: 'light', title: '光线质感', imageId: 'l19', focus: '光质', constraints: ['表现出光线的软硬质感'] },
  { chapter: 'light', title: '光影游戏', imageId: 'l20', focus: '光影', constraints: ['利用光影创造氛围'] },

  // ===== 色彩搭配篇 21-30 (难度3) =====
  { chapter: 'color', title: '暖色调入门', imageId: 'l21', focus: '暖色', constraints: ['画面以暖色为主'] },
  { chapter: 'color', title: '冷色调入门', imageId: 'l22', focus: '冷色', constraints: ['画面以冷色为主'] },
  { chapter: 'color', title: '对比色冲击', imageId: 'l23', focus: '对比色', constraints: ['使用互补色对比'] },
  { chapter: 'color', title: '邻近色和谐', imageId: 'l24', focus: '邻近色', constraints: ['使用邻近色搭配'] },
  { chapter: 'color', title: '色彩情绪', imageId: 'l25', focus: '色彩心理', constraints: ['用色彩传达情绪'] },
  { chapter: 'color', title: '单色美学', imageId: 'l26', focus: '单色', constraints: ['控制画面在2种颜色内'] },
  { chapter: 'color', title: '中性灰调', imageId: 'l27', focus: '灰调', constraints: ['整体低饱和灰调'] },
  { chapter: 'color', title: '高饱和冲击', imageId: 'l28', focus: '高饱和', constraints: ['使用高饱和色彩'] },
  { chapter: 'color', title: '复古色调', imageId: 'l29', focus: '复古色', constraints: ['模拟复古胶片色调'] },
  { chapter: 'color', title: '色彩综合', imageId: 'l30', focus: '色彩综合', constraints: ['运用色彩表达主题'] },

  // ===== 叙事技巧篇 31-40 (难度3-4) =====
  { chapter: 'narrative', title: '人像表情', imageId: 'l31', focus: '人像', constraints: ['捕捉自然的表情'] },
  { chapter: 'narrative', title: '风景层次', imageId: 'l32', focus: '层次', constraints: ['前景中景背景分明'] },
  { chapter: 'narrative', title: '静物质感', imageId: 'l33', focus: '质感', constraints: ['表现出物体质感'] },
  { chapter: 'narrative', title: '街拍瞬间', imageId: 'l34', focus: '决定性瞬间', constraints: ['捕捉决定性瞬间'] },
  { chapter: 'narrative', title: '故事性构图', imageId: 'l35', focus: '叙事', constraints: ['让观者感受故事'] },
  { chapter: 'narrative', title: '运动模糊', imageId: 'l36', focus: '动感', constraints: ['表现出速度感'] },
  { chapter: 'narrative', title: '动静对比', imageId: 'l37', focus: '动静', constraints: ['同时包含动态和静态元素'] },
  { chapter: 'narrative', title: '特写冲击力', imageId: 'l38', focus: '特写', constraints: ['突出主体特写'] },
  { chapter: 'narrative', title: '环境人像', imageId: 'l39', focus: '环境人像', constraints: ['人像与环境结合'] },
  { chapter: 'narrative', title: '组照思维', imageId: 'l40', focus: '系列', constraints: ['考虑多张照片的连贯性'] },

  // ===== 综合大师篇 41-50 (难度4-5) =====
  { chapter: 'master', title: '夜景入门', imageId: 'l41', focus: '夜景', constraints: ['长曝光或高ISO夜景'] },
  { chapter: 'master', title: '星空摄影', imageId: 'l42', focus: '星空', constraints: ['拍摄星空或星轨'] },
  { chapter: 'master', title: '长曝光流水', imageId: 'l43', focus: '长曝光', constraints: ['使用长曝光拍流水'] },
  { chapter: 'master', title: '双重曝光', imageId: 'l44', focus: '创意', constraints: ['后期双重曝光效果'] },
  { chapter: 'master', title: '人文纪实', imageId: 'l45', focus: '纪实', constraints: ['真实记录人文故事'] },
  { chapter: 'master', title: '风光大片', imageId: 'l46', focus: '风光', constraints: ['具备商业风光片水准'] },
  { chapter: 'master', title: '时尚人像', imageId: 'l47', focus: '时尚', constraints: ['时尚杂志风格'] },
  { chapter: 'master', title: '建筑艺术', imageId: 'l48', focus: '建筑', constraints: ['建筑摄影艺术感'] },
  { chapter: 'master', title: '观念摄影', imageId: 'l49', focus: '观念', constraints: ['表达抽象概念'] },
  { chapter: 'master', title: '大师终极', imageId: 'l50', focus: '综合', constraints: ['综合运用所有技巧'] },
];

// 随机约束条件池
export const randomConstraints = [
  '使用三分法构图', '包含倒影元素', '低角度拍摄', '高角度俯拍',
  '利用前景虚化', '使用对角线构图', '黄金比例构图', '极简画面',
  '包含人物剪影', '利用自然框架', '对称构图', '引导线构图',
  '逆光拍摄', '侧光拍摄', '包含运动模糊', '使用浅景深',
];

// 社区挑战作品
export const mockCommunityWorks: CommunityWork[] = [
  { id: 'w1', author: '摄影达人', avatar: '📸', authorId: 'u2', authorLevel: 15, authorStars: 35, authorCompletedCount: 18, authorStreak: 12, authorFollowers: 128, authorFollowing: 45, topAchievements: ['🏆通关达人', '⭐三星收集者', '🔥连胜高手'], topWorks: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200'], image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', votes: 234, createdAt: '2小时前' },
  { id: 'w2', author: '光影追逐者', avatar: '🌅', authorId: 'u3', authorLevel: 12, authorStars: 28, authorCompletedCount: 14, authorStreak: 8, authorFollowers: 89, authorFollowing: 32, topAchievements: ['🌟初学者', '📷勤奋练习'], topWorks: ['https://images.unsplash.com/photo-1493976040374-85c2e8f7145e?w=200', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200'], image: 'https://images.unsplash.com/photo-1493976040374-85c2e8f7145e?w=400', votes: 198, createdAt: '3小时前' },
  { id: 'w3', author: '色彩魔法师', avatar: '🎨', authorId: 'u4', authorLevel: 18, authorStars: 42, authorCompletedCount: 22, authorStreak: 15, authorFollowers: 256, authorFollowing: 67, topAchievements: ['🏆通关达人', '⭐三星收集者', '🎨色彩大师', '🔥连胜高手'], topWorks: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200'], image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', votes: 156, createdAt: '5小时前' },
  { id: 'w4', author: '街头猎人', avatar: '📷', authorId: 'u5', authorLevel: 10, authorStars: 22, authorCompletedCount: 11, authorStreak: 5, authorFollowers: 45, authorFollowing: 28, topAchievements: ['🌟初学者', '📷勤奋练习'], topWorks: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'], image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', votes: 142, createdAt: '6小时前' },
  { id: 'w5', author: '新手小白', avatar: '🌱', authorId: 'u6', authorLevel: 3, authorStars: 8, authorCompletedCount: 4, authorStreak: 2, authorFollowers: 12, authorFollowing: 15, topAchievements: ['🌟初学者'], topWorks: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200'], image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400', votes: 89, createdAt: '8小时前' },
  { id: 'w6', author: '逆光控', avatar: '☀️', authorId: 'u7', authorLevel: 8, authorStars: 18, authorCompletedCount: 9, authorStreak: 4, authorFollowers: 34, authorFollowing: 22, topAchievements: ['🌟初学者', '📷勤奋练习'], topWorks: ['https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200'], image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400', votes: 76, createdAt: '12小时前' },
];
