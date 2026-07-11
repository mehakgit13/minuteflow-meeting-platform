import {
  Bot,
  CheckCircle2,
  Database,
  ExternalLink,
  FileDown,
  Github,
  Globe2,
  LockKeyhole,
  MessageSquareText,
  Moon,
  PlugZap,
  Radio,
  Search,
  Sparkles,
  Tags,
  UserRound,
  UsersRound,
} from "lucide-react";

const placeholders = [
  {
    title: "Live meeting bot",
    description:
      "Automatically join supported online meetings and capture the conversation.",
    icon: Bot,
  },
  {
    title: "Live speech-to-text",
    description:
      "Convert live meeting audio into speaker-labelled transcript segments.",
    icon: Radio,
  },
  {
    title: "Meeting integrations",
    description:
      "Connect Zoom, Google Meet, calendars, CRM tools and other work apps.",
    icon: PlugZap,
  },
  {
    title: "Team collaboration",
    description:
      "Share meetings, comments, highlights and follow-up tasks with teammates.",
    icon: UsersRound,
  },
  {
    title: "Real user authentication",
    description:
      "The assignment currently assumes a default logged-in demo user.",
    icon: LockKeyhole,
  },
];

const availableFeatures = [
  { title: "Meeting and action-item CRUD", icon: CheckCircle2 },
  { title: "Global meeting search", icon: Search },
  { title: "Participant, date and topic filters", icon: Tags },
  { title: "TXT and Markdown export", icon: FileDown },
  { title: "Print / Save as PDF", icon: FileDown },
  { title: "Dark mode", icon: Moon },
  { title: "Persistent SQLite storage", icon: Database },
];

const plannedFeatures = [
  {
    title: "Transcript comments and highlights",
    icon: MessageSquareText,
  },
  {
    title: "Ask-this-meeting AI chat",
    icon: Sparkles,
  },
  {
    title: "Workspace collaboration",
    icon: UsersRound,
  },
];

export default function SettingsPage() {
  const userName =
    process.env.NEXT_PUBLIC_USER_NAME || "Mehak Yadav";

  const userEmail =
    process.env.NEXT_PUBLIC_USER_EMAIL ||
    "mehak.yadav.ug23@nsut.ac.in";

  return (
    <>
      <section className="page-head">
        <div>
          <p className="eyebrow">WORKSPACE</p>
          <h1>Settings and integrations</h1>
          <p>
            Review account information, implemented capabilities,
            demo assumptions and project links.
          </p>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-heading">
          <div>
            <p className="eyebrow">ACCOUNT</p>
            <h2>Demo profile</h2>
          </div>

          <span className="settings-status-badge">
            Default logged-in user
          </span>
        </div>

        <div className="account-settings-card">
          <div className="account-avatar">
            <UserRound size={24} />
          </div>

          <div className="account-details">
            <div>
              <span>Name</span>
              <b>{userName}</b>
            </div>

            <div>
              <span>Email</span>
              <b>{userEmail}</b>
            </div>

            <div>
              <span>Authentication</span>
              <b>Mocked for assignment</b>
            </div>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-heading">
          <div>
            <p className="eyebrow">AVAILABLE NOW</p>
            <h2>Implemented capabilities</h2>
          </div>

          <span className="settings-status-badge is-success">
            Working
          </span>
        </div>

        <div className="settings-feature-grid">
          {availableFeatures.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                className="settings-feature-card"
                key={feature.title}
              >
                <span>
                  <Icon size={18} />
                </span>
                <b>{feature.title}</b>
              </article>
            );
          })}
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-heading">
          <div>
            <p className="eyebrow">MOCKED FOR THE ASSIGNMENT</p>
            <h2>Placeholder capabilities</h2>
          </div>

          <span className="settings-status-badge">
            Coming soon
          </span>
        </div>

        <div className="placeholder-grid">
          {placeholders.map((item) => {
            const Icon = item.icon;

            return (
              <article className="settings-card" key={item.title}>
                <div className="settings-card-icon">
                  <Icon size={20} />
                </div>

                <span className="source-pill">Coming soon</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>

                <button
                  type="button"
                  className="secondary"
                  disabled
                >
                  Not available in demo
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-heading">
          <div>
            <p className="eyebrow">BONUS ROADMAP</p>
            <h2>Planned extensions</h2>
          </div>
        </div>

        <div className="bonus-feature-grid">
          <article className="settings-card bonus-card">
            <h3>Next product improvements</h3>

            <ul>
              {plannedFeatures.map((feature) => {
                const Icon = feature.icon;

                return (
                  <li key={feature.title}>
                    <Icon size={16} />
                    {feature.title}
                  </li>
                );
              })}
            </ul>
          </article>

          <article className="settings-card bonus-card">
            <h3>Deployment architecture</h3>

            <ul>
              <li>
                <Globe2 size={16} />
                Next.js frontend on Netlify
              </li>
              <li>
                <Database size={16} />
                FastAPI and persistent SQLite on Railway
              </li>
              <li>
                <Github size={16} />
                Public source repository on GitHub
              </li>
            </ul>
          </article>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-heading">
          <div>
            <p className="eyebrow">PROJECT INFORMATION</p>
            <h2>Developer and live services</h2>
          </div>
        </div>

        <div className="project-link-grid">
          <article className="settings-card project-info-card">
            <h3>Developed by</h3>

            <p>
              <b>Mehak Yadav</b>
              <br />
              Netaji Subhas University of Technology
              <br />
              Electronics and Communication Engineering
            </p>

            <a
              className="secondary settings-link"
              href="https://github.com/mehakgit13/minuteflow-meeting-platform"
              target="_blank"
              rel="noreferrer"
            >
              <Github size={16} />
              GitHub repository
              <ExternalLink size={14} />
            </a>
          </article>

          <article className="settings-card project-info-card">
            <h3>Live services</h3>

            <p>
              Frontend deployed on Netlify.
              <br />
              Backend API deployed on Railway.
              <br />
              SQLite stored on a persistent volume.
            </p>

            <div className="project-link-actions">
              <a
                className="secondary settings-link"
                href="https://minuteflow-meeting-platform-production.up.railway.app/docs"
                target="_blank"
                rel="noreferrer"
              >
                API documentation
                <ExternalLink size={14} />
              </a>

              <a
                className="secondary settings-link"
                href="https://minuteflow-meeting-platform-production.up.railway.app/api/health"
                target="_blank"
                rel="noreferrer"
              >
                API health
                <ExternalLink size={14} />
              </a>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
