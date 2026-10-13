# 💻 Daniel - Web Developer Portfolio

A modern, responsive, and performance-optimized developer portfolio built to showcase full-stack web applications and internship readiness.

## 🚀 Tech Stack
- **Structure**: Semantic HTML5
- **Styling**: Tailwind CSS (Utility-First CSS)
- **Scripting**: Vanilla JavaScript (ES6+)
- **Icons**: Font Awesome 6 / Lucide Icons
- **Form Delivery**: Web3Forms (Serverless contact form)
- **Deployment**: GitHub Pages / Vercel

---

## 📂 Project Structure

```text
daniel-portfolio/
│
├── index.html                 # Main website file (Home, About, Projects, Certifications, Contact)
│
├── assets/
│   ├── css/
│   │   └── style.css          # Custom styling & overrides
│   ├── js/
│   │   └── main.js            # Mobile navigation, active section observer, contact handler
│   ├── images/
│   │   ├── hero/              # Avatar / Hero illustrations
│   │   ├── projects/          # Project screenshots & thumbnails
│   │   └── certs/             # Certificate credentials & badges
│   └── docs/
│       └── resume.pdf         # Downloadable Resume PDF
│
├── .gitignore                 # Files ignored by git
└── README.md                  # Project documentation
```

---

## 💻 Getting Started Locally

1. **Clone or Open in VS Code**:
   Open the `daniel-portfolio` folder directly in VS Code.
2. **Preview in Browser**:
   - Right-click `index.html` and select **"Open with Live Server"** (using the VS Code Live Server extension), or
   - Double-click `index.html` in your file explorer to open it directly in any browser.

---

## 🌐 Deploying to GitHub Pages

1. Initialize git and commit:
   ```bash
   git add .
   git commit -m "feat: initial portfolio structure"
   ```
2. Link your GitHub repository:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/daniel-portfolio.git
   git push -u origin main
   ```
3. In your GitHub repository:
   - Go to **Settings** > **Pages**.
   - Under **Build and deployment**, select **Source: Deploy from a branch**.
   - Select branch `main` and folder `/ (root)`.
   - Click **Save**. Your site will be live within 1–2 minutes!
