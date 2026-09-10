# 铅造的小站

纯静态个人页，无依赖、无后端，可直接部署到 GitHub Pages。

## 文件结构

- `index.html` 首页
- `books.html` 书架
- `bestiary.html` 怪物笔记
- `notes.html` 怪念头
- `assets/style.css` 唯一的样式表

## 本地预览

直接双击 `index.html` 用浏览器打开即可，不需要服务器。
如果要更严谨，可在本目录运行：

```
python -m http.server 8000
```

然后访问 http://localhost:8000

## 部署到 GitHub Pages

1. 新建一个仓库，例如 `qiandao`，把 `site/` 里的文件放到仓库根目录。
2. 推送到 GitHub。
3. 仓库 Settings → Pages → Source 选 `Deploy from a branch`，分支选 `main`，目录选 `/ (root)`。
4. 等一两分钟，访问 `https://<用户名>.github.io/<仓库名>/`。

若想用 `https://<用户名>.github.io/` 作为地址，仓库名需取为 `<用户名>.github.io`。
