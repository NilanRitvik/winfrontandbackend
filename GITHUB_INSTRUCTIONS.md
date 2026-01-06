# How to Upload Your Code to GitHub

I have already initialized the local repository and committed your files. Now you just need to connect it to GitHub.

### Step 1: Create a Repository on GitHub
1.  Log in to [GitHub](https://github.com).
2.  Click the **+** icon in the top right and select **New repository**.
3.  Name it (e.g., `win365-roulette`).
4.  Make it **Private** or **Public**.
5.  **Do NOT** check "Add a README", ".gitignore", or "license" (we already have them).
6.  Click **Create repository**.

### Step 2: Push Your Code
Once created, you will see a page with commands. Look for the section **"…or push an existing repository from the command line"**.

Copy and run the following commands in your terminal (VS Code):

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/win365-roulette.git
git push -u origin main
```

*(Replace `YOUR_USERNAME` and `win365-roulette` with the actual URL shown on your GitHub page)*.

### Step 3: Deployment
After pushing to GitHub, you can proceed with the **DEPLOYMENT_GUIDE.md** I created earlier to deploy to Vercel, as Vercel imports directly from GitHub.
