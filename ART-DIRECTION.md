# 手绘剪纸剧场：素材与演出

应用技能：项目 .agents/skills/visual-novel，来源 gamedev-skills/awesome-gamedev-agent-skills。遵循角色层／背景层与文本数据分离、表情换层、离散位置、短转场、精确节点恢复。当前用户需求是表现力，因此不为了技能清单增加自动播放、语音、引擎迁移。

第一遍计划：夜蓝 #202940、舞台蓝 #34445c、纸白 #f4f5fc、橡皮粉 #ef9db6、灯光黄 #ffd684。Georgia／宋体对白，系统无衬线操作。手绘纸纤维／粗墨线角色；舞台维持约 300px，底部对白不加长。

```
[ 幕名 / 片名 / 语言 / 回看 / 重开 ]
[ 背景：试镜／夜宵／正式演出       ]
[ 杯子      橡皮      钥匙         ]
[ 对白／选择                      ]
```

复审：不走默认动漫人物／校园背景，保留物件喜剧身份。用目光、惊讶、得意、角色靠近、道具特写改变阅读节奏；镜头变化由节点触发，不自动闪烁。标题移出画面，防止盖住立绘。生成素材不烘焙文字，以保留中文／英文和可访问标签。

素材计划：一张透明 3×3 角色图集，行杯子／橡皮／钥匙，列平常／惊讶／得意；一张三行背景图集，行试镜／夜宵／正式演出。采用 CSS 直接选取图集区域，保留原始透明度，不修改或重绘生成位图。内置 imagegen 模式，无 API key。

验收：角色图集网格及透明度、背景分隔、资源复制到项目；节点表情与镜头变化、语言保持进度、上一句恢复场景、三幕背景切换；响应式与 reduced-motion；原有分支／记忆测试继续通过。实际好玩与情感效果仍需玩家反馈。


## 最终生成提示词与保存位置

使用内置 imagegen，未使用 CLI。角色原图保存在 web/play/assets/actors-v1.png（1254×1254，RGBA，alpha 范围 0–255），场景原图保存在 web/play/assets/scenes-v1.png（1024×1536，RGB）。两张原图均复制到项目并由网页引用。CSS 使用实际分隔边界：角色行 0–470／470–860／860–1254，背景行 0–480／480–928／928–1536；不对生成位图做裁切或重绘。

### 角色图集

Use case: illustration-story. Asset type: transparent sprite atlas for a comedic visual novel called Object Theatre. Make a production-ready 3 by 3 grid sprite sheet, exactly nine separate full-body anthropomorphic tabletop object characters on a genuinely transparent canvas. All nine cells equal size, perfectly aligned centers, ample empty padding in each cell, no characters touching or crossing cell edges. ROW 1: the same cream ceramic mug with right handle and dark coffee, little mitten hands and short legs. ROW 2: the same pink rectangular eraser with a violet sleeve on its left third, little hands and feet. ROW 3: the same golden key with round bow and two teeth, little gloved hands and feet; recognizable horizontal key body. COLUMNS: 1 relaxed deadpan neutral, 2 exaggerated shocked / flustered expression, 3 smug triumphant / playful expression. Maintain exact character identity and relative proportions across expressions. Bold uneven dark navy ink outlines, tactile painted cut-paper gouache, charming indie comic theatre, subtle paper fibers inside objects only, expressive eyebrow shapes and mouths, no humans or anime people. Palette navy ink #202940, cream ceramic, pink #ef9db6, golden #ffd684, violet sleeve. Stylized flat 2D illustrations, crisp readable silhouettes, not realistic, not 3D. No floor, no backgrounds, no shadows outside the silhouette, no text, no labels, no borders, no watermark. Equal 3x3 cells usable via CSS background-position, square canvas.

### 背景图集

Use case: illustration-story. Asset type: three-scene background atlas for a small comedic tabletop-object visual novel. One portrait image divided into exactly THREE equal-height full-width horizontal panels, edge to edge, no gutters or frames. Each panel is a wide landscape theatre background, no characters, no lettering. TOP PANEL: makeshift tabletop audition set, navy-blue curtains, a small lamp at far left, paper scenery flats and miniature stage wings, playful taped-together props, a clean empty foreground shelf. MIDDLE PANEL: quiet after-rehearsal midnight snack table, a low paper-shade lamp at far left, empty mismatched tiny chairs behind the table, cozy paper napkins and an empty snack plate to the side, softer violet blue and honey lighting, clear foreground. BOTTOM PANEL: full opening-night tiny theatre, deep navy curtains pulled open with warm golden footlights, playful pink ribbon side decor, distant softly painted silhouettes of staplers and paperclip audience at far edges only, a wide empty performance apron. Consistent straight-on camera and same foreground tabletop horizon in all three scenes: horizon about 60 percent down each panel, clear actor space at center and right, no large objects blocking actors. Hand-painted gouache and cut-paper scenery, indie stage comedy, tactile paper fibers, deliberate bold navy ink outlines, rich deep blues #202940, pink #ef9db6 and honey-gold #ffd684, subtle light, expressive handcrafted visual novel production art, not photorealistic or 3D. No text, no UI, no speech bubbles, no people, no mug, no key, no eraser, no watermark. Equal panel heights and straight unambiguous horizontal splits are essential for CSS atlas use.

## 实际验证记录

- 内置生成的九个角色表情已检查轮廓与透明度；两张图片已保存到项目。针对生成图集不等分的情况，使用实际坐标显示。
- 演出层独立在 presentation.js：表情、说话者、特写与背景切换不改故事图或选择记忆。
- test_presentation.js、test_comedy_story.js 通过；图遍历仍为 85 节点与 1536 路线，抽样完整推进与记忆回访测试通过。
- 独立浏览器标签页从首幕完整走到喝茶结局，三幕背景、特写、跨框抢按钮均实际检查；语言切换和刷新保留节点。浏览器错误日志为空。
- 390×844 英文选择页实际文档宽 390，无横向溢出；已重置临时视口。已提供 reduced-motion CSS，未做屏幕阅读器全流程验收。
- 首次试画面发现人事通知遮住钥匙、特写话筒遮脸，已分别移高通知和在特写时收起道具。其他角色退到两侧，避免叠在主角身后。
- 用户标签页已更新并保留第三幕原进度。最终截图 preview-art.png；额外截图 preview-art-meta.png、preview-art-night.png（中间检查版）。
- 本次版本随静态视觉小说公开部署；新增素材不证明娱乐或情感效果已提升，等待实际反馈。
