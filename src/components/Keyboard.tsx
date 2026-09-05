import { Suspense, useEffect, useRef, useState } from "react";
import { Application, SplineEvent } from "@splinetool/runtime";
import Spline from "@splinetool/react-spline";
import { useSounds } from "../hooks/useSounds";

type Skill = {
  id: number;
  name: string;
  label: string;
  shortDescription: string;
};

const SKILLS: Record<string, Skill> = {
  js: { id: 1, name: "js", label: "JavaScript", shortDescription: "yeeting code into the DOM since '95, no cap!" },
  ts: { id: 2, name: "ts", label: "TypeScript", shortDescription: "JavaScript's overachieving cousin who's always flexing" },
  html: { id: 3, name: "html", label: "HTML", shortDescription: "the internet's granddad, still bussin' fr fr!" },
  css: { id: 4, name: "css", label: "CSS", shortDescription: "styling with the ultimate drip, no cap" },
  react: { id: 5, name: "react", label: "React", shortDescription: "components go brrr, hooks hit different" },
  vue: { id: 6, name: "vue", label: "Vue", shortDescription: "the chill pill for your frontend, it hits different!" },
  nextjs: { id: 7, name: "nextjs", label: "Next.js", shortDescription: "the drama queen of front-end frameworks, and we stan!" },
  tailwind: { id: 8, name: "tailwind", label: "Tailwind", shortDescription: "utility classes hitting different fr fr" },
  nodejs: { id: 9, name: "nodejs", label: "Node.js", shortDescription: "JavaScript said 'sike, I'm backend now', deadass!" },
  express: { id: 10, name: "express", label: "Express", shortDescription: "middlewares go dummy hard, no cap!" },
  postgres: { id: 11, name: "postgres", label: "PostgreSQL", shortDescription: "SQL but make it fashion, purr" },
  mongodb: { id: 12, name: "mongodb", label: "MongoDB", shortDescription: "flexin' with that NoSQL drip, respectfully!" },
  git: { id: 13, name: "git", label: "Git", shortDescription: "the code's personal bodyguard, no cap!" },
  github: { id: 14, name: "github", label: "GitHub", shortDescription: "sliding into those pull requests, IYKYK!" },
  prettier: { id: 15, name: "prettier", label: "Prettier", shortDescription: "making your code not a whole mess, thank u next" },
  npm: { id: 16, name: "npm", label: "NPM", shortDescription: "package manager said 'I gotchu fam', period!" },
  firebase: { id: 17, name: "firebase", label: "Firebase", shortDescription: "your app's ultimate wingman, but watch out for vendor lock-in!" },
  wordpress: { id: 18, name: "wordpress", label: "WordPress", shortDescription: "the grandpa of CMS, still rocking that cane" },
  linux: { id: 19, name: "linux", label: "Linux", shortDescription: "where 'chmod 777' is the ultimate flex" },
  docker: { id: 20, name: "docker", label: "Docker", shortDescription: "The best containerization!" },
  nginx: { id: 21, name: "nginx", label: "NginX", shortDescription: "reverse proxy go zoom zoom, sheesh!" },
  aws: { id: 22, name: "aws", label: "AWS", shortDescription: "always extra, making everything more complicated, period!" },
  vim: { id: 23, name: "vim", label: "Vim", shortDescription: "exit? In this economy? Ight, imma head out!" },
  vercel: { id: 24, name: "vercel", label: "Vercel", shortDescription: "helps you deploy and go touch grass!" },
};

export default function Keyboard() {
  const [splineApp, setSplineApp] = useState<Application>();
  const selectedSkillRef = useRef<Skill | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const { playPressSound, playReleaseSound } = useSounds();

  const handleMouseHover = (e: SplineEvent) => {
    if (!splineApp || selectedSkillRef.current?.name === e.target.name) return;

    if (e.target.name === "body" || e.target.name === "platform") {
      if (selectedSkillRef.current) playReleaseSound();
      setSelectedSkill(null);
      selectedSkillRef.current = null;
      if (splineApp.getVariable("heading") && splineApp.getVariable("desc")) {
        splineApp.setVariable("heading", "");
        splineApp.setVariable("desc", "");
      }
    } else {
      if (!selectedSkillRef.current || selectedSkillRef.current.name !== e.target.name) {
        const skill = SKILLS[e.target.name];
        if (skill) {
          if (selectedSkillRef.current) playReleaseSound();
          playPressSound();
          setSelectedSkill(skill);
          selectedSkillRef.current = skill;
        }
      }
    }
  };

  const handleSplineInteractions = () => {
    if (!splineApp) return;

    const isInputFocused = () => {
      const activeElement = document.activeElement;
      return (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          (activeElement as HTMLElement).isContentEditable)
      );
    };

    splineApp.addEventListener("keyUp", () => {
      if (!splineApp || isInputFocused()) return;
      playReleaseSound();
      splineApp.setVariable("heading", "");
      splineApp.setVariable("desc", "");
    });

    splineApp.addEventListener("keyDown", (e) => {
      if (!splineApp || isInputFocused()) return;
      const skill = SKILLS[e.target.name];
      if (skill) {
        playPressSound();
        setSelectedSkill(skill);
        selectedSkillRef.current = skill;
        splineApp.setVariable("heading", skill.label);
        splineApp.setVariable("desc", skill.shortDescription);
      }
    });

    splineApp.addEventListener("mouseHover", handleMouseHover);
  };

  useEffect(() => {
    if (!selectedSkill || !splineApp) return;
    splineApp.setVariable("heading", selectedSkill.label);
    splineApp.setVariable("desc", selectedSkill.shortDescription);
  }, [selectedSkill, splineApp]);

  useEffect(() => {
    if (!splineApp) return;
    handleSplineInteractions();
  }, [splineApp]);

  return (
    <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-white/50">Loading 3D Keyboard...</div>}>
      <Spline
        className="w-full h-full"
        onLoad={(app: Application) => setSplineApp(app)}
        scene="/assets/skills-keyboard.spline"
      />
    </Suspense>
  );
}
