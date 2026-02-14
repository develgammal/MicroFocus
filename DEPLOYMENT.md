# GitHub Pages Deployment Guide

## 🚀 Current Project Setup

### Step 1: Commit and Push

```bash
# Commit the GitHub Actions workflow
git commit -m "Add GitHub Actions deployment for GitHub Pages"

# Push to GitHub
git push origin master
```

### Step 2: Enable GitHub Actions Deployment

1. Go to your repository: `https://github.com/YOUR_USERNAME/MicroFocus`
2. Click **Settings** tab
3. Click **Pages** in left sidebar
4. Under **Build and deployment**:
   - **Source**: Select **"GitHub Actions"** (not "Deploy from a branch")
   - That's it! No folder selection needed
5. Save changes

### Step 3: Monitor Deployment

1. Go to **Actions** tab in your repo
2. Watch the "Deploy to GitHub Pages" workflow run
3. Once completed (green checkmark), your site is live at:
   ```
   https://YOUR_USERNAME.github.io/MicroFocus/
   ```

### Step 4: Troubleshoot (if needed)

**If you see permission errors:**
1. Settings → Actions → General
2. Workflow permissions → Select "Read and write permissions"
3. Save and re-run the workflow

---

## 🤖 Prompt for Future Projects

Use this prompt with any AI assistant when starting a new Vite project:

```
Set up GitHub Pages deployment with GitHub Actions for my Vite project.

Project info:
- Repository: [REPO_NAME]
- Framework: [Vue 3 / React / Svelte]
- Build tool: Vite
- Main branch: [main/master]
- GitHub username: [USERNAME]

Requirements:
1. Create `.github/workflows/deploy.yml` with GitHub Actions workflow that:
   - Triggers on push to main branch
   - Runs npm ci and npm run build
   - Deploys to GitHub Pages using actions/deploy-pages@v4
   - Uses proper caching for node_modules
   
2. Configure `vite.config.ts` (or vite.config.js):
   - Set base to '/[REPO_NAME]/' for GitHub Pages
   - Keep dist as output directory
   
3. Update .gitignore to exclude:
   - dist/
   - docs/
   - Any build directories
   
4. Provide instructions to:
   - Push the workflow to GitHub
   - Enable "GitHub Actions" as Pages source
   - Verify deployment
   
5. Include common troubleshooting for:
   - Base path 404 errors
   - Workflow permissions
   - Asset loading issues

Use latest stable versions of all actions.
```

---

## 📋 Quick Setup Checklist

For any new Vite project deploying to GitHub Pages:

### Files to Create

- [ ] `.github/workflows/deploy.yml` - Workflow file
- [ ] Update `vite.config.ts` with correct base path
- [ ] Add `dist/` and `docs/` to `.gitignore`

### GitHub Configuration  

- [ ] Push code to repository
- [ ] Settings → Pages → Source: "GitHub Actions"
- [ ] Verify first deployment completes

### Configuration Template

**vite.config.ts:**
```typescript
export default defineConfig({
  base: '/REPO_NAME/', // Replace with actual repo name
  // ... other config
})
```

**Workflow file:** See `.github/workflows/deploy.yml` in this project

---

## 🔧 Common Issues & Solutions

### 404 Error on Deployed Site
**Cause:** Incorrect base path  
**Fix:** Ensure `vite.config.ts` has `base: '/YOUR_REPO_NAME/'`

### Assets Not Loading
**Cause:** Absolute paths or wrong base  
**Fix:** Use relative imports, check base path

### Workflow Permission Denied
**Cause:** Insufficient workflow permissions  
**Fix:** Settings → Actions → General → Enable read/write permissions

### Old Content Showing
**Cause:** Browser cache or CDN delay  
**Fix:** Hard refresh (Ctrl+Shift+R) or wait a few minutes

### Workflow Doesn't Run
**Cause:** Actions not enabled or wrong branch  
**Fix:** Check Settings → Actions is enabled, verify branch name in workflow

---

## 🎯 Why GitHub Actions vs Branch Deploy?

| GitHub Actions | Branch Deploy (docs/) |
|----------------|----------------------|
| ✅ No build files in repo | ❌ Commits 1000+ build files |
| ✅ Automatic on every push | ❌ Manual build + commit |
| ✅ Visible build logs | ❌ No logs if build fails |
| ✅ Can add tests, linting | ❌ No CI/CD pipeline |
| ✅ Industry standard | ⚠️ Works but outdated |
| ✅ Clean git history | ❌ Polluted with build commits |

---

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions for Pages](https://github.com/actions/deploy-pages)
- [Vite Static Deploy Guide](https://vitejs.dev/guide/static-deploy.html)

---

Built with ❤️ using Vue 3 + Vite + GitHub Actions
