import "./main.js";

const BASE_IMAGE = new URL("../assets/base.PNG", import.meta.url).href;

/** Hover composites: full-frame PNGs with one component highlighted. */
const TOPICS = [
  {
    id: "ancient-architectural",
    label: "Ancient Architectural Sonic Knowledge",
    image: new URL("../assets/PNG_image 6.PNG", import.meta.url).href,
    hit: { left: "8%", top: "18%", width: "22%", height: "22%" },
    labelPos: { left: "2%", top: "8%" },
  },
  {
    id: "sonic-militarization",
    label: "Sonic Militarization",
    image: new URL("../assets/PNG_image 9.PNG", import.meta.url).href,
    hit: { left: "42%", top: "2%", width: "18%", height: "20%" },
    labelPos: { right: "4%", top: "10%" },
  },
  {
    id: "sonic-healing",
    label: "Sonic Healing",
    image: new URL("../assets/PNG_image 2.PNG", import.meta.url).href,
    hit: { left: "52%", top: "38%", width: "20%", height: "18%" },
    labelPos: { right: "2%", top: "34%" },
  },
  {
    id: "sound-system-archival",
    label: "Sound System Archival",
    image: new URL("../assets/PNG_image 10.PNG", import.meta.url).href,
    hit: { left: "55%", top: "48%", width: "22%", height: "22%" },
    labelPos: { right: "0%", top: "50%" },
  },
  {
    id: "sound-laws",
    label: "Sound Laws, Suppression & Amplificxation",
    image: new URL("../assets/PNG_image.PNG", import.meta.url).href,
    hit: { left: "32%", top: "62%", width: "28%", height: "22%" },
    labelPos: { right: "4%", top: "72%" },
  },
  {
    id: "sound-system-research",
    label: "Sound System Research",
    image: new URL("../assets/PNG_image 7.PNG", import.meta.url).href,
    hit: { left: "12%", top: "58%", width: "26%", height: "26%" },
    labelPos: { left: "2%", top: "78%" },
  },
];

const MOBILE_BREAKPOINT = "(max-width: 720px)";

function isMobileLayout() {
  return window.matchMedia(MOBILE_BREAKPOINT).matches;
}

function initHome() {
  const stage = document.querySelector(".illustration-stage");
  const hero = document.getElementById("hero-illustration");
  const labelsRoot = stage?.querySelector(".topic-labels");
  if (!stage || !hero) return;

  const mobile = isMobileLayout();

  const setActive = (id) => {
    const topic = TOPICS.find((t) => t.id === id);
    hero.src = topic ? topic.image : BASE_IMAGE;
    document.querySelectorAll(".topic-label").forEach((el) => {
      el.classList.toggle("is-active", el.dataset.topic === id);
    });
  };

  const clearActive = () => {
    hero.src = BASE_IMAGE;
    document.querySelectorAll(".topic-label").forEach((el) => {
      el.classList.remove("is-active");
    });
  };

  TOPICS.forEach((topic) => {
    const researchHref = `research.html#${topic.id}`;

    if (mobile) {
      const link = document.createElement("a");
      link.className = "topic-hit";
      link.href = researchHref;
      link.setAttribute("aria-label", topic.label);
      Object.assign(link.style, topic.hit);
      link.addEventListener("touchstart", () => setActive(topic.id), {
        passive: true,
      });
      stage.appendChild(link);
      return;
    }

    const hit = document.createElement("button");
    hit.type = "button";
    hit.className = "topic-hit";
    hit.setAttribute("aria-label", topic.label);
    Object.assign(hit.style, topic.hit);
    hit.addEventListener("mouseenter", () => setActive(topic.id));
    hit.addEventListener("focus", () => setActive(topic.id));
    stage.appendChild(hit);

    const label = document.createElement("a");
    label.className = "topic-label";
    label.href = researchHref;
    label.dataset.topic = topic.id;
    label.textContent = topic.label;
    Object.assign(label.style, topic.labelPos);
    label.addEventListener("mouseenter", () => setActive(topic.id));
    label.addEventListener("focus", () => setActive(topic.id));
    labelsRoot?.appendChild(label);
  });

  if (!mobile) {
    stage.addEventListener("mouseleave", clearActive);
  }
}

initHome();