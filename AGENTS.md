# Repository Guidelines

## Project Structure & Module Organization
- 根目录为 uni-app (Vue 3 + TypeScript) 项目。核心业务放在 `src/`：`data/` 存放离线 JSON 词条与景点，`stores/` 管理 Pinia 状态，`types/` 定义共享接口。
- 页面逻辑位于 `pages/`（例如 `pages/index/` 词汇首页、`pages/map/` 地图视图），复用组件集中在 `components/`。
- `static/` 保存随包资源：`static/img/` 为词条插图，`static/markers/` 存放地图图标。构建产物写入 `unpackage/`，请勿手改。

## Build, Test, and Development Commands
- `npm install`：安装依赖。
- `npm run dev`：驱动 uni 构建，生成 `unpackage/dist/dev/mp-weixin/`，然后在微信开发者工具导入调试。
- `npm run build`：产出发布包。
- `npx tsc --noEmit`：运行严格类型检查，提交前必跑。

## Coding Style & Naming Conventions
- 统一使用 Vue 3 `<script setup>` + Composition API；组件文件 PascalCase (`MiniPlayerBar.vue`)，函数/refs camelCase，目录及 JSON 字段保持小写 + 连字符。
- JSON 采用 2 空格缩进、双引号、ISO 8601 时间戳 (`updatedAt`)，并提供双语字段 (`name.zh`/`name.en`) 与来源 `sources[]`。
- 样式建议 `scoped`，类名遵循块__元素模式 (`map-page__term-card`)。

## Testing Guidelines
- 当前无自动化测试，最少执行 `npx tsc --noEmit`。地图、词条搜索、音频播放需在微信开发者工具进行人工走查。
- 若新增逻辑或数据，请在 PR 中说明验证步骤，必要时附测试数据或录屏。

## Commit & Pull Request Guidelines
- Commit Message 采用 `<scope>: <imperative>`（例如 `data: add mitten crab entry`、`map: refine marker icons`）；保持单一关注点。
- PR 必须写明目标、主要修改点、执行的校验命令（`tsc`, DevTools 测试等），列出受影响的 JSON/配置文件，并附 UI 截图或 GIF（涉及界面变化时）。

## Security & Configuration Tips
- `.env*` 已忽略，任何密钥仅存本地。若修改 demo AppID，请同时更新 `manifest.json` 与 `project.config.json`。
- `static/` 资源会随包分发，添加前确认版权；引用外部素材时务必在 JSON 的 `sources` 内注明出处，便于后续审计。
