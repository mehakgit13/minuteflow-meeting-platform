import {
  Bot,
  FileDown,
  LockKeyhole,
  MessageSquareText,
  PlugZap,
  Radio,
  Search,
  Sparkles,
  Tags,
  UsersRound,
} from "lucide-react";

const placeholders = [
  { title: "Live meeting bot", description: "Automatically join supported online meetings and capture the conversation.", icon: Bot },
  { title: "Live speech-to-text", description: "Convert live meeting audio into speaker-labelled transcript segments.", icon: Radio },
  { title: "Meeting integrations", description: "Connect Zoom, Google Meet, calendars, CRM tools and other work apps.", icon: PlugZap },
  { title: "Team collaboration", description: "Share meetings, comments, highlights and follow-up tasks with teammates.", icon: UsersRound },
  { title: "Real user authentication", description: "The assignment currently assumes a default logged-in user.", icon: LockKeyhole },
];

const availableBonusFeatures = [
  { title: "Global search across meetings", icon: Search },
  { title: "Tags and topic filtering", icon: Tags },
  { title: "TXT and Markdown export", icon: FileDown },
];

const plannedBonusFeatures = [
  { title: "Transcript comments and highlights", icon: MessageSquareText },
  { title: "PDF export", icon: FileDown },
  { title: "Ask this meeting chat", icon: Sparkles },
];

export default function SettingsPage() {
  return (
    <>
      <section className="page-head">
        <div>
          <p className="eyebrow">WORKSPACE</p>
          <h1>Settings and integrations</h1>
          <p>Review demo assumptions, available bonus features, and planned integrations.</p>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-heading">
          <div>
            <p className="eyebrow">MOCKED FOR THE ASSIGNMENT</p>
            <h2>Placeholder capabilities</h2>
          </div>
          <span className="settings-status-badge">Coming soon</span>
        </div>

        <div className="placeholder-grid">
          {placeholders.map((item) => {
            const Icon = item.icon;
            return (
              <article className="settings-card" key={item.title}>
                <div className="settings-card-icon"><Icon size={20} /></div>
                <span className="source-pill">Coming soon</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <button type="button" className="secondary" disabled>Not available in demo</button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-heading">
          <div>
            <p className="eyebrow">BONUS FEATURES</p>
            <h2>Extra product capabilities</h2>
          </div>
        </div>

        <div className="bonus-feature-grid">
          <article className="settings-card bonus-card bonus-card-ready">
            <h3>Available in the project</h3>
            <ul>
              {availableBonusFeatures.map((feature) => {
                const Icon = feature.icon;
                return <li key={feature.title}><Icon size={16} />{feature.title}</li>;
              })}
            </ul>
          </article>

          <article className="settings-card bonus-card">
            <h3>Planned extensions</h3>
            <ul>
              {plannedBonusFeatures.map((feature) => {
                const Icon = feature.icon;
                return <li key={feature.title}><Icon size={16} />{feature.title}</li>;
              })}
            </ul>
          </article>
        </div>
      </section>
    </>
  );
}
