const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// =============================================
// SHARED HELPERS
// =============================================
const splitLines = (str) => (str || "").split("\n").filter(Boolean).map(s => s.trim());
const splitComma = (str) => (str || "").split(",").filter(Boolean).map(s => s.trim());

// CHANGED: social links are now comma-separated: "GitHub: https://..., Telegram: https://..."
const parseSocialLinks = (socialStr) => {
    if (!socialStr) return [];
    return splitComma(socialStr).map(item => {
        const colonIdx = item.indexOf(":");
        const label = item.substring(0, colonIdx).trim();
        const url = item.substring(colonIdx + 1).trim();
        const href = url.startsWith("http") ? url : "https://" + url;
        return { label, url, href };
    });
};


// =============================================
// YOUR ORIGINAL TEMPLATE 1 HELPERS
// =============================================
const generateTemp1Experience = (expList) =>
    expList.map(exp => `
        <div class="entry">
            <div class="entry-title">${exp.title} | ${exp.company}</div>
            <div class="entry-sub">${exp.startDate} – ${exp.endDate}</div>
            <div class="entry-desc">${exp.description}</div>
        </div>
    `).join("");

const generateTemp1Education = (eduList) =>
    eduList.map(edu => `
        <div class="entry" style="margin-bottom:0;">
            <div class="entry-title">${edu.degree} | ${edu.school}</div>
            <div class="entry-sub">${edu.startDate} – ${edu.endDate}</div>
        </div>
    `).join("");

const generateTemp1Projects = (projList) =>
    projList.map(proj => `
        <div class="entry">
            <div class="entry-title">${proj.name}</div>
            <div class="entry-sub">
                <a href="${proj.link}" target="_blank" style="color:inherit; text-decoration:none;">
                    ${proj.link}
                </a>
            </div>
            <div class="entry-desc">${proj.description}</div>
        </div>
    `).join("");

// CHANGED: skills split by comma instead of newline
const generateTemp1Skills = (skillsStr) =>
    splitComma(skillsStr).map(s => `<li>${s}</li>`).join("");

const generateTemp1Tags = (str) =>
    str.split(",").filter(Boolean).map(s => `<li>${s.trim()}</li>`).join("");

// CHANGED: social links now parsed by comma via parseSocialLinks
const generateTemp1SocialLinks = (socialStr) =>
    parseSocialLinks(socialStr).map(s =>
        `<div class="social-item"><span class="social-label">${s.label}:</span><a href="${s.href}" target="_blank">${s.label}</a></div>`
    ).join("");


// =============================================
// YOUR ORIGINAL TEMPLATE 2 HELPERS
// =============================================
const generateTemp2Experience = (expList) =>
    expList.map(exp => `
        <div class="cv-entry">
            <div class="cv-entry-header">
                <div>
                    <div class="cv-entry-title">${exp.title}</div>
                    <div class="cv-entry-sub">${exp.company}</div>
                </div>
                <div class="cv-entry-date">${exp.startDate} – ${exp.endDate}</div>
            </div>
            <div class="cv-entry-desc">${exp.description}</div>
        </div>
    `).join("");

const generateTemp2Education = (eduList) =>
    eduList.map(edu => `
        <div class="cv-entry">
            <div class="cv-entry-header">
                <div>
                    <div class="cv-entry-title">${edu.degree}</div>
                    <div class="cv-entry-sub">${edu.school}</div>
                </div>
                <div class="cv-entry-date">${edu.startDate} – ${edu.endDate}</div>
            </div>
        </div>
    `).join("");

const generateTemp2Projects = (projList) =>
    projList.map(proj => `
        <div class="cv-entry">
            <div class="cv-entry-title">${proj.name}</div>
            <a class="cv-entry-link" href="${proj.link}" target="_blank">${proj.link}</a>
            <div class="cv-entry-desc">${proj.description}</div>
        </div>
    `).join("");

// CHANGED: always split by comma now (skills and tools both comma-separated)
const generateTemp2Tags = (str, splitter = ",") =>
    splitComma(str).map(s => `<span class="cv-skill-tag">${s}</span>`).join("");

// CHANGED: social links now parsed by comma via parseSocialLinks
const generateTemp2SocialLinks = (socialStr) =>
    parseSocialLinks(socialStr).map(s =>
        `<div class="cv-contact-item">
            <span class="cv-contact-label">${s.label}</span>
            <a href="${s.href}" target="_blank" style="color:#b8b8d0; font-size:0.72rem; word-break:break-all;">${s.label}</a>
        </div>`
    ).join("");


// =============================================
// YOUR ORIGINAL TEMPLATE 1 BUILDER
// =============================================
const buildTemp1 = ({ fullName, email, phone, location, jobTitle, summary, experience, education, skills, projects, socialLinks, languages, tools }) => `
<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CV — ${fullName}</title>
    <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #faf7ff; display: flex; justify-content: center; padding: 48px 20px; font-family: 'DM Sans', sans-serif; color: #222; }
        .cv { background: #fff; width: 720px; min-height: 1020px; padding: 52px 56px; box-shadow: 0 8px 48px rgba(0,0,0,0.10); animation: up 0.4s ease; }
        @keyframes up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .cv-header { text-align: center; padding-bottom: 18px; border-bottom: 2px solid #1a3a8f; }
        .cv-name { font-family: 'EB Garamond', serif; font-size: 2.2rem; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #1a3a8f; }
        .cv-job-title { font-size: 0.78rem; letter-spacing: 3px; text-transform: uppercase; color: #555; margin-top: 4px; }
        .cv-contacts { display: flex; justify-content: center; flex-wrap: wrap; gap: 10px 28px; margin-top: 14px; font-size: 0.78rem; color: #444; padding-top: 12px; border-top: 1px solid #ddd; }
        .cv-contacts a { color: #1a3a8f; text-decoration: none; }
        .cv-contacts a:hover { text-decoration: underline; }
        .cv-profile { padding: 20px 0; border-bottom: 1px solid #ddd; }
        .section-label { font-size: 0.7rem; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: #1a3a8f; margin-bottom: 6px; }
        .section-label-line { width: 28px; height: 2px; background: #1a3a8f; margin-bottom: 10px; }
        .cv-profile p { font-size: 0.82rem; color: #444; line-height: 1.75; }
        .cv-body { display: grid; grid-template-columns: 170px 1fr; padding-top: 20px; border-bottom: 1px solid #ddd; padding-bottom: 20px; }
        .col-left { padding-right: 28px; border-right: 1px solid #ddd; }
        .col-right { padding-left: 32px; }
        .entry { margin-bottom: 14px; }
        .entry-title { font-size: 0.83rem; font-weight: 500; color: #222; }
        .entry-sub { font-size: 0.76rem; color: #555; margin-top: 1px; }
        .entry-desc { font-size: 0.76rem; color: #666; margin-top: 4px; line-height: 1.65; }
        .cv-list { list-style: none; padding: 0; }
        .cv-list li { font-size: 0.78rem; color: #444; padding: 2px 0; position: relative; padding-left: 12px; }
        .cv-list li::before { content: '•'; position: absolute; left: 0; color: #1a3a8f; }
        .social-item { font-size: 0.76rem; margin-bottom: 6px; }
        .social-label { font-weight: 600; color: #1a3a8f; margin-right: 4px; }
        .social-item a { color: #444; text-decoration: none; word-break: break-all; }
        .social-item a:hover { text-decoration: underline; }
        @media print { body { background: none; padding: 0; } .cv { box-shadow: none; } }
        ::-webkit-scrollbar { display: none; }
    </style>
</head>
<body data-template="1">
<div class="cv">
    <div class="cv-header">
        <div class="cv-name">${fullName}</div>
        <div class="cv-job-title">${jobTitle}</div>
        <div class="cv-contacts">
            <span>${phone}</span>
            <span>${email}</span>
            <span>${location}</span>
            ${parseSocialLinks(socialLinks).map(s => `<a href="${s.href}" target="_blank">${s.label}</a>`).join("")}
        </div>
    </div>
    <div class="cv-profile">
        <div class="section-label">Profil</div>
        <div class="section-label-line"></div>
        <p>${summary}</p>
    </div>
    <div class="cv-body">
        <div class="col-left"><div class="section-label">Ish tajribasi</div><div class="section-label-line"></div></div>
        <div class="col-right">${generateTemp1Experience(experience)}</div>
    </div>
    <div class="cv-body">
        <div class="col-left"><div class="section-label">Ta'lim</div><div class="section-label-line"></div></div>
        <div class="col-right">${generateTemp1Education(education)}</div>
    </div>
    <div class="cv-body">
        <div class="col-left"><div class="section-label">Loyihalar</div><div class="section-label-line"></div></div>
        <div class="col-right">${generateTemp1Projects(projects)}</div>
    </div>
    <div class="cv-body">
        <div class="col-left"><div class="section-label">Ko'nikmalar</div><div class="section-label-line"></div></div>
        <div class="col-right"><ul class="cv-list" style="columns:2; column-gap:24px;">${generateTemp1Skills(skills)}</ul></div>
    </div>
    ${tools ? `<div class="cv-body"><div class="col-left"><div class="section-label">Dasturlar</div><div class="section-label-line"></div></div><div class="col-right"><ul class="cv-list" style="columns:2; column-gap:24px;">${generateTemp1Tags(tools)}</ul></div></div>` : ""}
    ${languages ? `<div class="cv-body"><div class="col-left"><div class="section-label">Tillar</div><div class="section-label-line"></div></div><div class="col-right"><ul class="cv-list">${generateTemp1Tags(languages)}</ul></div></div>` : ""}
    ${socialLinks ? `<div class="cv-body" style="border-bottom:none; padding-bottom:0;"><div class="col-left"><div class="section-label">Havolalar</div><div class="section-label-line"></div></div><div class="col-right">${generateTemp1SocialLinks(socialLinks)}</div></div>` : ""}
</div>
</body>
</html>
`;


// =============================================
// YOUR ORIGINAL TEMPLATE 2 BUILDER
// =============================================
const buildTemp2 = ({ fullName, email, phone, location, jobTitle, summary, experience, education, skills, projects, socialLinks, languages, tools }) => {
    const initials = fullName
        ? fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
        : "CV";
    return `
<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CV — ${fullName}</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --ink: #1a1a2e; --muted: #6b6b8a; --rule: #d9d9e8; --accent: #c8a96e; --sidebar-bg: #1a1a2e; }
        body { background: #e8e7e3; display: flex; justify-content: center; align-items: flex-start; min-height: 100vh; padding: 48px 20px; font-family: 'DM Sans', sans-serif; }
        .cv-sheet { width: 794px; min-height: 1123px; background: #fff; box-shadow: 0 12px 60px rgba(0,0,0,0.15); display: grid; grid-template-columns: 255px 1fr; font-size: 13px; line-height: 1.5; animation: fadeUp 0.5s ease; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .cv-left { background: var(--sidebar-bg); color: #c0c0d8; padding: 44px 28px; }
        .cv-avatar { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #c8a96e 0%, #8b5e3c 100%); display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 2rem; color: #fff; margin-bottom: 20px; border: 3px solid rgba(200,169,110,0.4); }
        .cv-name { font-family: 'Playfair Display', serif; font-size: 1.6rem; color: #fff; line-height: 1.2; margin-bottom: 4px; }
        .cv-jobtitle { font-size: 0.72rem; color: var(--accent); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 32px; }
        .cv-left-section { margin-bottom: 24px; }
        .cv-left-heading { font-size: 0.62rem; letter-spacing: 2.5px; text-transform: uppercase; color: var(--accent); border-bottom: 1px solid rgba(200,169,110,0.3); padding-bottom: 5px; margin-bottom: 12px; }
        .cv-contact-item { display: flex; flex-direction: column; margin-bottom: 10px; font-size: 0.77rem; color: #b8b8d0; }
        .cv-contact-label { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(200,169,110,0.75); margin-bottom: 2px; }
        .cv-skill-tag { display: inline-block; background: rgba(200,169,110,0.12); border: 1px solid rgba(200,169,110,0.28); color: #c8c8e0; padding: 3px 9px; border-radius: 2px; font-size: 0.7rem; margin: 3px 3px 3px 0; }
        .cv-right { padding: 44px 36px; }
        .cv-summary { font-size: 0.82rem; color: var(--muted); border-left: 3px solid var(--accent); padding-left: 14px; margin-bottom: 34px; line-height: 1.75; font-style: italic; }
        .cv-section { margin-bottom: 30px; }
        .cv-section-heading { font-family: 'Playfair Display', serif; font-size: 1rem; color: var(--ink); border-bottom: 1px solid var(--rule); padding-bottom: 6px; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }
        .cv-section-heading::before { content: ''; display: inline-block; width: 16px; height: 2px; background: var(--accent); flex-shrink: 0; }
        .cv-entry { margin-bottom: 18px; }
        .cv-entry-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px; }
        .cv-entry-title { font-weight: 500; font-size: 0.88rem; color: var(--ink); }
        .cv-entry-sub { font-size: 0.78rem; color: var(--accent); font-weight: 500; margin-top: 1px; }
        .cv-entry-date { font-size: 0.7rem; color: var(--muted); white-space: nowrap; margin-left: 12px; flex-shrink: 0; background: #f5f4f0; padding: 2px 8px; border-radius: 2px; margin-top: 2px; }
        .cv-entry-desc { font-size: 0.78rem; color: #555570; margin-top: 5px; line-height: 1.65; }
        .cv-entry-link { font-size: 0.73rem; color: var(--accent); text-decoration: none; display: block; margin-top: 2px; }
        .cv-entry-link:hover { text-decoration: underline; }
        @media print { body { background: none; padding: 0; } .cv-sheet { box-shadow: none; width: 100%; } }
        ::-webkit-scrollbar { display: none; }
    </style>
</head>
<body data-template="2">
<div class="cv-sheet">
    <div class="cv-left">
        <div class="cv-avatar">${initials}</div>
        <div class="cv-name">${fullName}</div>
        <div class="cv-jobtitle">${jobTitle}</div>
        <div class="cv-left-section">
            <div class="cv-left-heading">Aloqa</div>
            <div class="cv-contact-item"><span class="cv-contact-label">Elektron pochta</span>${email}</div>
            <div class="cv-contact-item"><span class="cv-contact-label">Telefon</span>${phone}</div>
            <div class="cv-contact-item"><span class="cv-contact-label">Manzil</span>${location}</div>
        </div>
        ${socialLinks ? `<div class="cv-left-section"><div class="cv-left-heading">Havolalar</div>${generateTemp2SocialLinks(socialLinks)}</div>` : ""}
        <div class="cv-left-section"><div class="cv-left-heading">Ko'nikmalar</div>${generateTemp2Tags(skills)}</div>
        ${tools ? `<div class="cv-left-section"><div class="cv-left-heading">Dasturlar</div>${generateTemp2Tags(tools)}</div>` : ""}
        ${languages ? `<div class="cv-left-section"><div class="cv-left-heading">Tillar</div>${generateTemp2Tags(languages)}</div>` : ""}
    </div>
    <div class="cv-right">
        <div class="cv-summary">${summary}</div>
        <div class="cv-section"><div class="cv-section-heading">Ish tajribasi</div>${generateTemp2Experience(experience)}</div>
        <div class="cv-section"><div class="cv-section-heading">Ta'lim</div>${generateTemp2Education(education)}</div>
        <div class="cv-section"><div class="cv-section-heading">Loyihalar</div>${generateTemp2Projects(projects)}</div>
    </div>
</div>
</body>
</html>
`;
};


// =============================================
// NEW TEMPLATE 3 — Exact match Image 1
// Clean white, Merriweather serif, centered purple headers,
// single column, skills inline row, exp company bold top-left
// =============================================
const buildTemp3 = ({ fullName, email, phone, location, jobTitle, summary, experience, education, skills, projects, socialLinks, languages, tools }) => {
    const socials = parseSocialLinks(socialLinks);

    const expHtml = (experience || []).map(exp => `
        <div class="exp-block">
            <div class="exp-company">${exp.company}</div>
            <div class="exp-role">${exp.title}</div>
            <div class="exp-date">${exp.startDate} - ${exp.endDate}</div>
            <div class="exp-desc">${exp.description}</div>
        </div>`).join("");

    const eduHtml = (education || []).map(edu => `
        <div class="edu-block">
            ${edu.school} | ${edu.degree} | ${edu.startDate} - ${edu.endDate}
        </div>`).join("");

    const projHtml = (projects || []).length ? (projects || []).map(proj => `
        <div class="exp-block">
            <div class="exp-role">${proj.name}</div>
            <a href="${proj.link}" target="_blank" class="proj-link">${proj.link}</a>
            <div class="exp-desc">${proj.description}</div>
        </div>`).join("") : "";

    // CHANGED: skills split by comma
    const allSkills = [
        ...splitComma(skills),
        ...splitComma(tools),
    ];
    const skillsHtml = allSkills.map(s => `<span class="skill-chip">${s}</span>`).join("&nbsp;&nbsp;&nbsp;");
    const langsHtml = splitComma(languages).map(s => `<span class="skill-chip">${s}</span>`).join("&nbsp;&nbsp;&nbsp;");

    return `<!DOCTYPE html>
<html lang="uz">
<head>
<meta charset="UTF-8">
<title>CV — ${fullName}</title>
<link href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&family=Source+Serif+4:wght@300;400;600&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:#fff;display:flex;justify-content:center;padding:40px 20px;font-family:'Inter',sans-serif;color:#1a1a1a}
.cv{background:#fff;width:780px;min-height:1040px;padding:48px 60px;box-shadow:0 2px 24px rgba(0,0,0,0.08)}

/* HEADER */
.cv-header{text-align:center;padding-bottom:22px}
.cv-name{font-family:'Merriweather',serif;font-size:1.85rem;font-weight:700;letter-spacing:1px;color:#111;margin-bottom:6px}
.cv-jobtitle{font-size:0.82rem;color:#444;font-weight:400;margin-bottom:12px;letter-spacing:0.5px}
.cv-meta{display:flex;justify-content:center;flex-wrap:wrap;gap:6px 24px;font-size:0.74rem;color:#555}
.cv-meta a{color:#555;text-decoration:none}
.cv-meta a:hover{text-decoration:underline}

/* DIVIDER */
.divider{border:none;border-top:1.5px solid #6b46c1;margin:18px 0}
.divider-thin{border:none;border-top:1px solid #e0e0e0;margin:16px 0}

/* SECTION */
.section-heading{font-family:'Merriweather',serif;font-size:1rem;font-weight:700;color:#6b46c1;text-align:center;letter-spacing:0.5px;margin-bottom:16px}

/* SKILLS ROW */
.skills-wrap{text-align:center;font-size:0.79rem;color:#333;line-height:2.2}
.skill-chip{display:inline}

/* EXPERIENCE */
.exp-block{margin-bottom:22px}
.exp-company{font-size:0.92rem;font-weight:600;color:#111}
.exp-role{font-size:0.88rem;font-weight:600;color:#333;margin-top:1px}
.exp-date{font-size:0.72rem;color:#888;margin-top:2px;margin-bottom:6px}
.exp-desc{font-size:0.78rem;color:#444;line-height:1.8}
.proj-link{font-size:0.73rem;color:#6b46c1;text-decoration:none;display:block;margin:2px 0 4px}

/* EDUCATION */
.edu-block{font-size:0.82rem;color:#333;margin-bottom:10px;line-height:1.6}

/* SECTION WRAPPER */
.section{margin-bottom:4px}
</style>
</head>
<body>
<div class="cv">

  <div class="cv-header">
    <div class="cv-name">${fullName}</div>
    <div class="cv-jobtitle">${jobTitle}</div>
    <div class="cv-meta">
      <span>${phone}</span>
      <span>${email}</span>
      ${socials.map(s => `<a href="${s.href}" target="_blank">${s.label}</a>`).join("")}
      <span>${location}</span>
    </div>
  </div>

  <hr class="divider">

  <div class="section">
    <div class="section-heading">Qisqacha ma'lumot</div>
    <div style="font-size:0.8rem;color:#444;line-height:1.85;text-align:justify">${summary}</div>
  </div>

  <hr class="divider">

  ${allSkills.length ? `<div class="section">
    <div class="section-heading">Ko'nikmalar</div>
    <div class="skills-wrap">${skillsHtml}</div>
  </div><hr class="divider">` : ""}

  ${languages ? `<div class="section">
    <div class="section-heading">Tillar</div>
    <div class="skills-wrap">${langsHtml}</div>
  </div><hr class="divider">` : ""}

  <div class="section">
    <div class="section-heading">Ish tajribasi</div>
    ${expHtml}
  </div>

  <hr class="divider">

  <div class="section">
    <div class="section-heading">Ta'lim</div>
    ${eduHtml}
  </div>

  ${projHtml ? `<hr class="divider"><div class="section"><div class="section-heading">Loyihalar</div>${projHtml}</div>` : ""}

</div>
</body>
</html>`;
};


// =============================================
// NEW TEMPLATE 4 — Exact match Image 2
// Bold purple two-column, "Hello I'm" left + boxed sidebar right
// =============================================
const buildTemp4 = ({ fullName, email, phone, location, jobTitle, summary, experience, education, skills, projects, socialLinks, languages, tools }) => {
    const socials = parseSocialLinks(socialLinks);

    const expHtml = (experience || []).map(exp => `
        <div class="exp-block">
            <div class="exp-meta">${exp.company} | ${exp.startDate} - ${exp.endDate}</div>
            <div class="exp-role">${exp.title}</div>
            <div class="exp-desc">${exp.description}</div>
        </div>`).join("");

    const eduHtml = (education || []).map(edu => `
        <div class="edu-block">
            <div class="edu-date">${edu.startDate} - ${edu.endDate}</div>
            <div class="edu-deg">${edu.degree}</div>
            <div class="edu-school">${edu.school}</div>
        </div>`).join("");

    // CHANGED: skills split by comma
    const skillsHtml = splitComma(skills).map(s => `<div class="skill-line">${s}</div>`).join("");
    const toolsHtml = splitComma(tools).map(s => `<div class="skill-line">${s}</div>`).join("");
    const langsHtml = splitComma(languages).map(s => `<div class="skill-line">${s}</div>`).join("");

    const projHtml = (projects || []).map(proj => `
        <div class="exp-block">
            <div class="exp-role">${proj.name}</div>
            <a href="${proj.link}" target="_blank" class="proj-link">${proj.link}</a>
            <div class="exp-desc">${proj.description}</div>
        </div>`).join("");

    return `<!DOCTYPE html>
<html lang="uz">
<head>
<meta charset="UTF-8">
<title>CV — ${fullName}</title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:#f3f0fa;display:flex;justify-content:center;padding:40px 20px;font-family:'Montserrat',sans-serif;color:#111}
.cv{background:#fff;width:860px;min-height:1060px;display:grid;grid-template-columns:1fr 260px;box-shadow:0 4px 32px rgba(80,40,160,0.13)}

/* LEFT */
.cv-left{padding:44px 36px;border-right:2px solid #f0ecfa}
.badge{display:inline-block;border:2px solid #6b21d6;color:#6b21d6;font-size:0.58rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;padding:5px 12px;margin-bottom:20px}
.greeting{font-size:1.05rem;font-weight:500;color:#222;margin-bottom:2px}
.cv-name{font-size:2.3rem;font-weight:800;color:#6b21d6;line-height:1.1;margin-bottom:16px}
.cv-summary{font-size:0.78rem;color:#444;line-height:1.85;padding-bottom:26px;border-bottom:2px solid #6b21d6;margin-bottom:0}

.section-title{font-size:1.05rem;font-weight:800;color:#6b21d6;margin:26px 0 14px;text-transform:uppercase;letter-spacing:0.5px}
.exp-block{margin-bottom:20px}
.exp-meta{font-size:0.72rem;color:#888;margin-bottom:3px}
.exp-role{font-size:0.85rem;font-weight:700;color:#111}
.exp-desc{font-size:0.76rem;color:#555;margin-top:7px;line-height:1.75}
.proj-link{font-size:0.71rem;color:#6b21d6;text-decoration:none;display:block;margin-top:2px}

/* RIGHT SIDEBAR */
.cv-right{padding:44px 24px;background:#faf8ff}
.sidebar-block{margin-bottom:28px}
.sidebar-heading{display:inline-block;border:2px solid #6b21d6;color:#6b21d6;font-size:0.58rem;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:4px 10px;margin-bottom:14px}
.contact-line{font-size:0.75rem;color:#333;margin-bottom:8px;word-break:break-all}
.contact-link{font-size:0.72rem;color:#6b21d6;text-decoration:none;display:block;margin-bottom:8px;word-break:break-all}
.edu-block{margin-bottom:16px}
.edu-date{font-size:0.7rem;color:#888;font-style:italic}
.edu-deg{font-size:0.77rem;font-weight:600;color:#6b21d6;margin-top:1px}
.edu-school{font-size:0.8rem;font-weight:800;color:#111}
.skill-line{font-size:0.77rem;color:#333;padding:5px 0;border-bottom:1px solid #ede9f9}

@media print{body{background:none;padding:0}.cv{box-shadow:none}}
::-webkit-scrollbar{display:none}
</style>
</head>
<body>
<div class="cv">

  <!-- LEFT -->
  <div class="cv-left">
    <div class="badge">${jobTitle}</div>
    <div class="greeting">Salom, men</div>
    <div class="cv-name">${fullName}</div>
    <div class="cv-summary">${summary}</div>

    <div class="section-title">Ish tajribasi</div>
    ${expHtml}

    ${projHtml ? `<div class="section-title">Loyihalar</div>${projHtml}` : ""}
  </div>

  <!-- RIGHT -->
  <div class="cv-right">
    <div class="sidebar-block">
      <div class="sidebar-heading">Aloqa</div>
      <div class="contact-line">${email}</div>
      <div class="contact-line">${phone}</div>
      <div class="contact-line">${location}</div>
      ${socials.map(s => `<a href="${s.href}" target="_blank" class="contact-link">${s.label}</a>`).join("")}
    </div>

    <div class="sidebar-block">
      <div class="sidebar-heading">Ta'lim</div>
      ${eduHtml}
    </div>

    ${skills ? `<div class="sidebar-block"><div class="sidebar-heading">Ko'nikmalar</div>${skillsHtml}</div>` : ""}
    ${tools ? `<div class="sidebar-block"><div class="sidebar-heading">Dasturlar</div>${toolsHtml}</div>` : ""}
    ${languages ? `<div class="sidebar-block"><div class="sidebar-heading">Tillar</div>${langsHtml}</div>` : ""}
  </div>

</div>
</body>
</html>`;
};


// =============================================
// NEW TEMPLATE 5 — Exact match Image 3
// Large uppercase purple name, contact top-right,
// avatar circle, purple bar section titles, 2-col body
// =============================================
const buildTemp5 = ({ fullName, email, phone, location, jobTitle, summary, experience, education, skills, projects, socialLinks, languages, tools }) => {
    const socials = parseSocialLinks(socialLinks);
    const initials = fullName ? fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "CV";

    const expHtml = (experience || []).map(exp => `
        <div class="exp-block">
            <div class="exp-header">
                <div class="exp-role">${exp.title}</div>
                <div class="exp-meta">${exp.company} | ${exp.startDate} - ${exp.endDate}</div>
            </div>
            <div class="exp-desc">${exp.description}</div>
        </div>`).join("");

    // CHANGED: skills split by comma
    const skillsHtml = splitComma(skills).map(s => `<div class="list-item">${s}</div>`).join("");
    const toolsHtml = splitComma(tools).map(s => `<div class="list-item">${s}</div>`).join("");
    const langsHtml = splitComma(languages).map(s => `<div class="list-item">${s}</div>`).join("");

    const eduHtml = (education || []).map(edu => `
        <div class="edu-block">
            <div class="edu-role">${edu.degree}</div>
            <div class="edu-school">${edu.school}</div>
            <div class="edu-date">${edu.startDate} - ${edu.endDate}</div>
        </div>`).join("");

    const projHtml = (projects || []).map(proj => `
        <div class="exp-block">
            <div class="exp-role">${proj.name}</div>
            <a href="${proj.link}" target="_blank" class="proj-link">${proj.link}</a>
            <div class="exp-desc">${proj.description}</div>
        </div>`).join("");

    return `<!DOCTYPE html>
<html lang="uz">
<head>
<meta charset="UTF-8">
<title>CV — ${fullName}</title>
<link href="https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:#f0eef6;display:flex;justify-content:center;padding:40px 20px;font-family:'Raleway',sans-serif;color:#1a1a2e}
.cv{background:#fff;width:840px;min-height:1080px;box-shadow:0 4px 32px rgba(80,40,160,0.13)}

/* TOP HEADER */
.cv-header{display:grid;grid-template-columns:1fr 200px;align-items:start;padding:36px 44px 24px;border-bottom:1.5px solid #e0ddf0}
.cv-name{font-size:2.4rem;font-weight:900;color:#6b21d6;letter-spacing:3px;text-transform:uppercase;line-height:1.05}
.cv-jobtitle{font-size:0.8rem;color:#666;font-weight:400;margin-top:6px;letter-spacing:0.5px}
.cv-contact-col{text-align:right;font-size:0.76rem;color:#333;line-height:2}
.cv-contact-col a{color:#6b21d6;text-decoration:none;display:block}

/* PROFILE STRIP */
.cv-profile{display:grid;grid-template-columns:100px 1fr;gap:28px;padding:24px 44px;border-bottom:1.5px solid #e0ddf0;align-items:start}
.cv-avatar{width:86px;height:86px;border-radius:50%;background:#ede9f9;display:flex;align-items:center;justify-content:center;font-size:1.7rem;font-weight:800;color:#6b21d6;border:3px solid #c9b8f0}
.cv-bio{font-size:0.79rem;color:#444;line-height:1.85}

/* BODY */
.cv-body{display:grid;grid-template-columns:1fr 220px}
.body-left{padding:28px 32px 28px 44px;border-right:1.5px solid #e0ddf0}
.body-right{padding:28px 24px}

/* SECTION LABEL */
.section-label{display:flex;align-items:center;gap:0;margin-bottom:18px}
.section-label-bar{width:4px;height:100%;background:#6b21d6;margin-right:10px;align-self:stretch;min-height:22px}
.section-label-text{font-size:0.68rem;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#fff;background:#6b21d6;padding:5px 12px}

/* EXPERIENCE */
.exp-block{margin-bottom:22px}
.exp-header{display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:4px;margin-bottom:5px}
.exp-role{font-size:0.88rem;font-weight:600;color:#1a1a2e}
.exp-meta{font-size:0.71rem;color:#888}
.exp-desc{font-size:0.76rem;color:#444;line-height:1.8}
.proj-link{font-size:0.71rem;color:#6b21d6;text-decoration:none;display:block;margin-top:2px}

/* RIGHT SIDEBAR */
.list-item{font-size:0.78rem;color:#333;padding:4px 0;border-bottom:1px solid #f0ecfa}
.edu-block{margin-bottom:16px}
.edu-role{font-size:0.82rem;font-weight:600;color:#1a1a2e}
.edu-school{font-size:0.76rem;color:#6b21d6}
.edu-date{font-size:0.7rem;color:#999}
.sidebar-gap{height:20px}

@media print{body{background:none;padding:0}.cv{box-shadow:none}}
::-webkit-scrollbar{display:none}
</style>
</head>
<body>
<div class="cv">

  <!-- HEADER -->
  <div class="cv-header">
    <div>
      <div class="cv-name">${fullName}</div>
      <div class="cv-jobtitle">${jobTitle}</div>
    </div>
    <div class="cv-contact-col">
      <span>${phone}</span>
      <span>${email}</span>
      <span>${location}</span>
      ${socials.map(s => `<a href="${s.href}" target="_blank">${s.label}</a>`).join("")}
    </div>
  </div>

  <!-- PROFILE -->
  <div class="cv-profile">
    <div class="cv-avatar">${initials}</div>
    <div class="cv-bio">${summary}</div>
  </div>

  <!-- BODY -->
  <div class="cv-body">
    <div class="body-left">
      <div class="section-label">
        <div class="section-label-bar"></div>
        <div class="section-label-text">Ish tajribasi</div>
      </div>
      ${expHtml}

      ${projHtml ? `<div class="section-label" style="margin-top:10px"><div class="section-label-bar"></div><div class="section-label-text">Loyihalar</div></div>${projHtml}` : ""}
    </div>

    <div class="body-right">
      ${skills ? `<div class="section-label"><div class="section-label-bar"></div><div class="section-label-text">Ko'nikmalar</div></div>${skillsHtml}<div class="sidebar-gap"></div>` : ""}
      ${tools ? `<div class="section-label"><div class="section-label-bar"></div><div class="section-label-text">Dasturlar</div></div>${toolsHtml}<div class="sidebar-gap"></div>` : ""}
      ${languages ? `<div class="section-label"><div class="section-label-bar"></div><div class="section-label-text">Tillar</div></div>${langsHtml}<div class="sidebar-gap"></div>` : ""}
      <div class="section-label"><div class="section-label-bar"></div><div class="section-label-text">Ta'lim</div></div>
      ${eduHtml}
    </div>
  </div>

</div>
</body>
</html>`;
};


// =============================================
// NEW TEMPLATE 6 — Exact match Image 4
// Minimal black/white serif, "RESUME" label top-left,
// big stacked name, left sidebar edu + skills, right body
// =============================================
const buildTemp6 = ({ fullName, email, phone, location, jobTitle, summary, experience, education, skills, projects, socialLinks, languages, tools }) => {
    const socials = parseSocialLinks(socialLinks);

    const eduHtml = (education || []).map(edu => `
        <div class="edu-block">
            <div class="edu-role">${edu.degree}</div>
            <div class="edu-meta">${edu.school} | ${edu.startDate} - ${edu.endDate}</div>
        </div>`).join("");

    // CHANGED: skills split by comma
    const proSkills = splitComma(skills);
    const techSkills = splitComma(tools);
    const langList = splitComma(languages);

    const proSkillsHtml = proSkills.map(s => `<li>${s}</li>`).join("");
    const techSkillsHtml = techSkills.map(s => `<li>${s}</li>`).join("");
    const langSkillsHtml = langList.map(s => `<li>${s}</li>`).join("");

    const expHtml = (experience || []).map(exp => `
        <div class="exp-block">
            <div class="exp-top">
                <div class="exp-role">${exp.title} | ${exp.startDate} - ${exp.endDate}</div>
                <div class="exp-company">${exp.company}</div>
            </div>
            <div class="exp-desc">${exp.description}</div>
        </div>`).join("");

    const projHtml = (projects || []).map(proj => `
        <div class="exp-block">
            <div class="exp-role">${proj.name}</div>
            <a href="${proj.link}" target="_blank" class="proj-link">${proj.link}</a>
            <div class="exp-desc">${proj.description}</div>
        </div>`).join("");

    return `<!DOCTYPE html>
<html lang="uz">
<head>
<meta charset="UTF-8">
<title>CV — ${fullName}</title>
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:#f2f2f0;display:flex;justify-content:center;padding:40px 20px;font-family:'Lato',sans-serif;color:#111}
.cv{background:#fff;width:800px;min-height:1080px;display:grid;grid-template-rows:auto 1fr;box-shadow:0 2px 20px rgba(0,0,0,0.10)}

/* TOP HEADER */
.cv-header{padding:32px 36px 24px;border-bottom:1px solid #ccc;display:grid;grid-template-columns:1fr 230px;gap:20px;align-items:start}
.header-left{}
.resume-label{font-size:0.65rem;letter-spacing:3px;text-transform:uppercase;color:#888;margin-bottom:10px;font-family:'Lato',sans-serif}
.cv-name{font-family:'Libre Baskerville',serif;font-size:2.4rem;font-weight:700;color:#111;text-transform:uppercase;letter-spacing:1px;line-height:1.05}
.cv-jobtitle{font-size:0.78rem;color:#777;margin-top:8px;font-weight:300;letter-spacing:1px;border-top:1px solid #ddd;padding-top:8px}
.header-right{font-size:0.74rem;color:#444;line-height:1.9;padding-top:8px;border-left:1px solid #ddd;padding-left:20px}
.header-right div{display:flex;gap:6px}
.header-right span{color:#999;font-size:0.68rem;letter-spacing:0.5px;text-transform:uppercase;min-width:18px}
.header-right a{color:#333;text-decoration:none}

/* BODY */
.cv-body{display:grid;grid-template-columns:220px 1fr}

/* SIDEBAR */
.cv-sidebar{padding:28px 22px;border-right:1px solid #e0e0e0;background:#fafafa}
.sidebar-section{margin-bottom:28px}
.sidebar-title{font-size:0.64rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#111;border-bottom:2px solid #111;padding-bottom:5px;margin-bottom:12px}
.edu-block{margin-bottom:14px}
.edu-role{font-size:0.78rem;font-weight:700;color:#111}
.edu-meta{font-size:0.7rem;color:#666;margin-top:1px}
.skill-list{list-style:none;padding:0;margin-top:4px}
.skill-list li{font-size:0.75rem;color:#333;padding:3px 0;border-bottom:1px solid #eee;display:flex;align-items:center;gap:6px}
.skill-list li::before{content:"";display:inline-block;width:6px;height:6px;border-radius:50%;background:#bbb;flex-shrink:0}
.skill-sub{font-size:0.61rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#999;margin:10px 0 6px}

/* MAIN */
.cv-main{padding:28px 32px}
.main-section{margin-bottom:26px}
.main-title{font-size:0.9rem;font-weight:700;font-family:'Libre Baskerville',serif;color:#111;border-bottom:1px solid #ccc;padding-bottom:6px;margin-bottom:14px}
.about-text{font-size:0.79rem;color:#444;line-height:1.85}
.exp-block{margin-bottom:18px}
.exp-top{margin-bottom:4px}
.exp-role{font-size:0.8rem;font-weight:700;color:#111}
.exp-company{font-size:0.74rem;color:#555;margin-top:1px}
.exp-desc{font-size:0.76rem;color:#444;line-height:1.78;margin-top:5px}
.proj-link{font-size:0.71rem;color:#555;text-decoration:none;font-style:italic;display:block;margin-top:2px}

@media print{body{background:none;padding:0}.cv{box-shadow:none}}
::-webkit-scrollbar{display:none}
</style>
</head>
<body>
<div class="cv">

  <!-- HEADER -->
  <div class="cv-header">
    <div class="header-left">
      <div class="resume-label">Rezyume</div>
      <div class="cv-name">${fullName}</div>
      <div class="cv-jobtitle">${jobTitle}</div>
    </div>
    <div class="header-right">
      <div><span>M.</span>${location}</div>
      <div><span>E.</span>${email}</div>
      ${socials.map(s => `<div><span>W.</span><a href="${s.href}" target="_blank">${s.label}</a></div>`).join("")}
      <div><span>T.</span>${phone}</div>
    </div>
  </div>

  <!-- BODY -->
  <div class="cv-body">

    <!-- SIDEBAR -->
    <div class="cv-sidebar">
      <div class="sidebar-section">
        <div class="sidebar-title">Ta'lim</div>
        ${eduHtml}
      </div>

      ${proSkills.length || techSkills.length || langList.length ? `
      <div class="sidebar-section">
        <div class="sidebar-title">Ko'nikmalar</div>
        ${proSkills.length ? `<div class="skill-sub">// Kasbiy</div><ul class="skill-list">${proSkillsHtml}</ul>` : ""}
        ${techSkills.length ? `<div class="skill-sub">// Texnik</div><ul class="skill-list">${techSkillsHtml}</ul>` : ""}
        ${langList.length ? `<div class="skill-sub">// Tillar</div><ul class="skill-list">${langSkillsHtml}</ul>` : ""}
      </div>` : ""}
    </div>

    <!-- MAIN -->
    <div class="cv-main">
      <div class="main-section">
        <div class="main-title">Men haqimda</div>
        <div class="about-text">${summary}</div>
      </div>

      <div class="main-section">
        <div class="main-title">Ish tajribasi</div>
        ${expHtml}
      </div>

      ${projHtml ? `<div class="main-section"><div class="main-title">Loyihalar</div>${projHtml}</div>` : ""}
    </div>

  </div>

</div>
</body>
</html>`;
};


// =============================================
// MAIN ENDPOINT
// =============================================
app.post("/generateCV", (req, res) => {
    const resumeData = req.body;
    const { selectedTemplate } = resumeData;

    const builders = {
        temp1: buildTemp1,
        temp2: buildTemp2,
        temp3: buildTemp3,
        temp4: buildTemp4,
        temp5: buildTemp5,
        temp6: buildTemp6,
    };

    const builder = builders[selectedTemplate];
    if (!builder) {
        return res.status(400).json({ error: "Unknown template: " + selectedTemplate });
    }

    const html = builder(resumeData);
    res.json({ html });
});


app.get("/", (req, res) => {
    res.send("CV Generator Backend is running ✅");
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`CV server running on port ${PORT}`));