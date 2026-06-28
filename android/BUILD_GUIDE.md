# 掌纹智析 APK 构建指南

## 方案：GitHub Actions 自动构建（推荐，免费）

### 步骤 1：在 GitHub 创建仓库

1. 打开 https://github.com/new
2. Repository name: `ai-palm-print`
3. Public（公开，GitHub Actions 免费）
4. 不勾选 Initialize
5. 点击 **Create repository**

### 步骤 2：生成 GitHub Personal Access Token

1. 打开 https://github.com/settings/tokens/new
2. Note: `ai-palm-push`
3. Expiration: 90 days
4. 勾选 `repo`（完整仓库权限）
5. 点击 **Generate token**
6. 复制 token（形如 `ghp_xxxxxxxx`）

### 步骤 3：推送代码到 GitHub

在 WorkBuddy 里执行命令（把 YOUR_TOKEN 替换成你的 token）：

```bash
cd "/g/2026-5-21/AI掌纹项目/ai-plam/app_rn"
git remote add github https://YOUR_TOKEN@github.com/eddiechausk/ai-palm-print.git
git push github android:main
```

### 步骤 4：等待构建完成

1. 打开 https://github.com/eddiechausk/ai-palm-print/actions
2. 点击最新的 workflow run
3. 等待约 10-15 分钟
4. 构建成功后，点击 **Artifacts** 下载 APK

## 当前状态

| 项目 | 状态 |
|------|------|
| Gitee 仓库 | ✅ `android` 分支已推送 |
| CI 配置文件 | ✅ 已创建（GitHub Actions + Gitee Go 两个格式） |
| GitHub 仓库 | ⏳ 需要手动创建 |
| APK 构建 | ⏳ 等待 CI 触发 |

## 备用方案：本地 WSL 构建

如果不想用 GitHub Actions，可以在 WSL2（Ubuntu）里构建：

```bash
# 1. 安装 Ubuntu WSL
wsl --install -d Ubuntu

# 2. 在 Ubuntu 里安装依赖
sudo apt update && sudo apt install -y openjdk-17-jdk unzip
cd /mnt/g/2026-5-21/AI掌纹项目/ai-plam/app_rn
npm install
cd android && ./gradlew assembleDebug
```

APK 路径：`android/app/build/outputs/apk/debug/app-debug.apk`
