<template>
  <section class="home-page" aria-label="SunSense homepage">
    <div class="home-glow home-glow-a" aria-hidden="true"></div>
    <div class="home-glow home-glow-b" aria-hidden="true"></div>

    <section class="hero-section mb-5" aria-labelledby="home-hero-title">
      <div class="hero-shell">
        <div class="hero-content text-center">
          <div class="hero-eyebrow-wrap">
            <p class="section-eyebrow mb-3">SunSense for young Australians</p>
          </div>
          <h1 id="home-hero-title" class="hero-title mb-3">
            Understand today's UV and make protection decisions earlier.
          </h1>
          <p class="hero-text mb-4">
            SunSense helps you check live UV conditions, understand why exposure matters, and turn the number into
            simple action.
          </p>

          <div class="hero-actions" role="group" aria-label="Primary navigation">
            <RouterLink to="/dashboard" class="cta-btn cta-btn--primary text-decoration-none">
              Check today's UV
            </RouterLink>
            <RouterLink to="/awareness" class="cta-btn cta-btn--secondary text-decoration-none">
              Learn the risk
            </RouterLink>
            <RouterLink to="/prevention" class="cta-btn cta-btn--secondary text-decoration-none">
              Get protection
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <section class="mb-5" aria-labelledby="pathways-title">
      <div class="section-intro mb-3 mb-md-4">
        <p class="section-eyebrow mb-2">Explore SunSense</p>
        <h2 id="pathways-title" class="section-heading mb-2">Start where you need help most.</h2>
        <p class="section-copy mb-0">Start with live conditions, explore the visual data, or move straight into protection tools.</p>
      </div>

      <div class="row g-3 g-md-4">
        <div v-for="item in pathways" :key="item.title" class="col-12 col-lg-4">
          <RouterLink :to="item.to" class="pathway-card soft-card h-100 text-decoration-none">
            <span class="pathway-card__kicker" :class="`pathway-card__kicker--${item.tone}`">
              {{ item.kicker }}
            </span>
            <h3 class="pathway-card__title mt-3 mb-2">{{ item.title }}</h3>
            <p class="pathway-card__text mb-3">{{ item.text }}</p>
            <ul class="pathway-list list-unstyled mb-4">
              <li v-for="point in item.points" :key="point">{{ point }}</li>
            </ul>
            <span class="pathway-link">
              {{ item.cta }}
            </span>
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="mb-5" aria-labelledby="human-language-title">
      <div class="human-card soft-card">
        <div class="row g-4 align-items-center">
          <div class="col-12 col-lg-5">
            <p class="section-eyebrow mb-2">Human language</p>
            <h2 id="human-language-title" class="section-heading mb-2">
              SunSense explains the number, not just the reading.
            </h2>
            <p class="section-copy mb-0">
              A UV value on its own can be abstract. We translate it into a plain-language message so you know how fast
              risk can build and what protection makes sense right now.
            </p>
          </div>

          <div class="col-12 col-lg-7">
            <div class="translation-panel">
              <div class="translation-column translation-column--raw">
                <p class="translation-label mb-2">Raw UV number</p>
                <div class="translation-chip">
                  <span class="translation-value">UV 8</span>
                </div>
              </div>

              <div class="translation-divider" aria-hidden="true"></div>

              <div class="translation-column translation-column--meaning">
                <p class="translation-label mb-2">What that means for you</p>
                <div class="translation-message">
                  <p class="translation-risk mb-1">High risk.</p>
                  <p class="translation-text mb-0">
                    Your skin can start getting damaged quickly. Use protection, reapply sunscreen, and seek shade
                    during stronger UV hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="mb-5" aria-labelledby="final-cta-title">
      <div class="final-cta soft-card text-center">
        <div class="final-cta__eyebrow-wrap">
          <p class="section-eyebrow mb-2">Ready to check in?</p>
        </div>
        <h2 id="final-cta-title" class="section-heading mb-2">See today's UV and get simple guidance fast.</h2>
        <p class="section-copy final-cta__text mb-4">
          Open the UV Tracker to check current conditions, today's risk level, and the daily trend.
        </p>
        <RouterLink to="/dashboard" class="cta-btn cta-btn--primary text-decoration-none">
          Go to UV Tracker
        </RouterLink>
      </div>
    </section>
  </section>
</template>

<script setup>
const pathways = [
  {
    title: "UV Tracker",
    kicker: "Today",
    tone: "warm",
    text: "Check today's UV, current risk, safer window, peak window, and the daily UV trend for your location.",
    points: ["Live UV and risk level", "Peak and safer window", "Daily UV trend chart"],
    cta: "Open UV Tracker",
    to: "/dashboard",
  },
  {
    title: "Awareness",
    kicker: "Understand",
    tone: "sky",
    text: "Explore two visualisations that show skin cancer impact trends and the monthly UV index trend in Melbourne.",
    points: ["Skin Cancer Impact Trends", "Monthly UV index trend in Melbourne", "Visual data for awareness"],
    cta: "Explore Awareness",
    to: "/awareness",
  },
  {
    title: "Prevention",
    kicker: "Act",
    tone: "mint",
    text: "Get sunscreen advice, clothing guidance, and reminders that help protection fit into everyday life.",
    points: ["Sunscreen and clothing guidance", "Reminder tools", "Simple next steps you can actually use"],
    cta: "Open Prevention",
    to: "/prevention",
  },
];
</script>

<style scoped>
.home-page {
  position: relative;
  isolation: isolate;
}

.home-glow {
  position: absolute;
  z-index: -1;
  border-radius: 999px;
  filter: blur(42px);
  pointer-events: none;
}

.home-glow-a {
  width: min(440px, 68vw);
  height: 250px;
  top: -28px;
  left: -34px;
  background: radial-gradient(circle at 30% 30%, rgba(196, 236, 216, 0.7), rgba(196, 236, 216, 0));
}

.home-glow-b {
  width: min(420px, 66vw);
  height: 230px;
  top: 48%;
  right: -42px;
  background: radial-gradient(circle at 50% 50%, rgba(255, 222, 188, 0.42), rgba(255, 222, 188, 0));
}

.hero-shell {
  padding: 1.1rem 0 0.35rem;
}

.hero-content {
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pathway-card,
.human-card,
.final-cta {
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.68);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9));
  box-shadow: 0 18px 40px rgba(19, 33, 59, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.pathway-card {
  padding: 1.3rem;
}

.human-card,
.final-cta {
  padding: 1.35rem;
}

.human-card {
  background:
    radial-gradient(circle at top left, rgba(212, 241, 223, 0.72), transparent 42%),
    radial-gradient(circle at bottom right, rgba(227, 238, 255, 0.84), transparent 42%),
    linear-gradient(180deg, rgba(248, 252, 249, 0.98), rgba(255, 255, 255, 0.92));
  border-color: rgba(206, 219, 236, 0.82);
}

.section-intro {
  max-width: 840px;
}

.section-eyebrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgba(67, 87, 112, 0.84);
}

.section-eyebrow::before {
  content: "";
  width: 24px;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(118, 177, 148, 0.95), rgba(244, 183, 108, 0.88));
}

.hero-eyebrow-wrap,
.final-cta__eyebrow-wrap {
  width: 100%;
  display: flex;
  justify-content: flex-start;
}

.hero-title {
  font-size: clamp(2.45rem, 3.6vw, 3.75rem);
  line-height: 1.1;
  letter-spacing: -0.04em;
  font-weight: 800;
  color: #132238;
  max-width: 22ch;
  margin-left: auto;
  margin-right: auto;
  text-wrap: balance;
}

.hero-text,
.section-copy,
.pathway-card__text,
.translation-text {
  color: rgba(78, 91, 110, 0.92);
  font-size: 1.02rem;
  line-height: 1.64;
  max-width: 68ch;
}

.hero-text {
  max-width: 52ch;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  border-radius: 999px;
  padding: 0.75rem 1.2rem;
  font-weight: 700;
  transition: transform 0.22s ease, box-shadow 0.22s ease, background 0.22s ease, color 0.22s ease;
}

.cta-btn:hover,
.cta-btn:focus-visible {
  transform: translateY(-2px);
}

.cta-btn--primary {
  color: #ffffff;
  background: #172034;
  box-shadow: 0 14px 28px rgba(23, 32, 52, 0.18);
}

.cta-btn--primary:hover,
.cta-btn--primary:focus-visible {
  background: #1d2942;
  color: #ffffff;
}

.cta-btn--secondary {
  color: #172034;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(23, 32, 52, 0.1);
}

.cta-btn--secondary:hover,
.cta-btn--secondary:focus-visible {
  color: #172034;
  box-shadow: 0 12px 24px rgba(19, 33, 59, 0.1);
}

.section-heading {
  font-size: clamp(1.7rem, 2.6vw, 2.15rem);
  line-height: 1.18;
  letter-spacing: -0.025em;
  font-weight: 750;
  color: #122237;
  max-width: 28ch;
  text-wrap: balance;
}

.pathway-card {
  transition: transform 240ms ease, box-shadow 240ms ease, border-color 240ms ease;
}

.pathway-card:hover,
.pathway-card:focus-visible {
  transform: translateY(-3px);
  box-shadow: 0 24px 44px rgba(19, 33, 59, 0.1);
  border-color: rgba(198, 214, 233, 0.82);
}

.translation-label {
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(86, 100, 121, 0.8);
}

.pathway-card__title,
.translation-risk {
  color: #162339;
  font-weight: 800;
}

.pathway-card__title {
  font-size: 1.15rem;
  line-height: 1.25;
}

.pathway-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  color: inherit;
  min-height: 100%;
}

.pathway-card__kicker {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  border-radius: 999px;
  padding: 0.2rem 0.8rem;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.pathway-card__kicker--warm {
  background: rgba(255, 234, 212, 0.92);
  color: #97520f;
}

.pathway-card__kicker--sky {
  background: rgba(224, 238, 255, 0.92);
  color: #375d99;
}

.pathway-card__kicker--mint {
  background: rgba(223, 246, 235, 0.95);
  color: #23704b;
}

.pathway-list {
  display: grid;
  gap: 0.55rem;
}

.pathway-list li {
  position: relative;
  padding-left: 1rem;
  color: rgba(78, 91, 110, 0.92);
  font-size: 0.92rem;
}

.pathway-list li::before {
  content: "";
  position: absolute;
  top: 0.55rem;
  left: 0;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(76, 126, 108, 0.55);
}

.pathway-link {
  margin-top: auto;
  color: #172034;
  font-weight: 700;
}

.translation-panel {
  display: grid;
  grid-template-columns: minmax(0, 180px) 1px minmax(0, 1fr);
  gap: 1rem;
  align-items: stretch;
}

.translation-divider {
  background: linear-gradient(180deg, rgba(190, 205, 224, 0.2), rgba(190, 205, 224, 0.95), rgba(190, 205, 224, 0.2));
  border-radius: 999px;
}

.translation-chip,
.translation-message {
  border-radius: 22px;
  border: 1px solid rgba(204, 216, 231, 0.82);
  background: rgba(255, 255, 255, 0.92);
  padding: 1rem;
  min-height: 100%;
}

.translation-column--raw .translation-chip {
  display: flex;
  align-items: center;
  justify-content: center;
}

.translation-value {
  font-size: 2.35rem;
  line-height: 1;
  font-weight: 800;
  letter-spacing: -0.05em;
  color: #172034;
}

.translation-risk {
  font-size: 1.02rem;
}

.final-cta {
  background:
    radial-gradient(circle at top center, rgba(212, 241, 223, 0.6), transparent 48%),
    linear-gradient(180deg, rgba(252, 254, 252, 0.98), rgba(255, 255, 255, 0.92));
  display: flex;
  flex-direction: column;
  align-items: center;
}

.final-cta__text {
  margin-left: auto;
  margin-right: auto;
  max-width: 60ch;
}

@media (max-width: 991px) {
  .hero-text,
  .final-cta__text {
    max-width: 60ch;
  }

  .translation-panel {
    grid-template-columns: minmax(0, 1fr);
  }

  .translation-divider {
    width: 100%;
    height: 1px;
  }
}

@media (max-width: 767px) {
  .pathway-card,
  .human-card,
  .final-cta,
  .translation-chip,
  .translation-message {
    border-radius: 24px;
  }

  .pathway-card,
  .human-card,
  .final-cta {
    padding: 1.1rem;
  }

  .hero-shell {
    padding-top: 0.45rem;
  }

  .hero-title,
  .section-heading {
    max-width: none;
    text-wrap: pretty;
  }

  .hero-text,
  .section-copy,
  .pathway-card__text,
  .translation-text,
  .final-cta__text {
    max-width: none;
  }

}

@media (prefers-reduced-motion: reduce) {
  .cta-btn,
  .pathway-card {
    transition: none;
  }
}
</style>
