import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "../hooks/use-theme";
import { Sun, Moon, Monitor } from "lucide-react";

const MotionMoon = motion.create(Moon);
const MotionSun = motion.create(Sun);
const MotionMonitor = motion.create(Monitor);

const ICON_CLASS = "size-7 absolute inset-0 m-auto";

export function ThemeToggle() {
  const { theme, cycleTheme } = useTheme();
  const hasInteractedRef = useRef(false);

  const handleCycleTheme = () => {
    hasInteractedRef.current = true;
    cycleTheme();
  };

  const initialAnimation = hasInteractedRef.current
    ? { y: "-150%", opacity: 0, scale: 0.7 }
    : false;

  return (
    <button
      onClick={handleCycleTheme}
      aria-label={theme ? `Toggle theme, current theme is ${theme}` : "Toggle theme"}
      title={theme ? `Toggle theme, current theme: ${theme}` : "Toggle theme"}
      className="aspect-square relative transition-all duration-200 flex items-center justify-center overflow-hidden bg-gray-300 hover:cursor-pointer hover:bg-[#b8bcc2] dark:hover:bg-[#404040] dark:bg-[#343434] rounded-2xl size-12 justify-self-end active:scale-94 md:hover:scale-96 md:active:scale-92"
    >
      <AnimatePresence mode="sync" initial={false}>
        {theme === "light" ? (
          <MotionSun
            initial={initialAnimation}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "150%", opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.3 }}
            key="sun"
            className={ICON_CLASS}
          />
        ) : theme === "dark" ? (
          <MotionMoon
            initial={initialAnimation}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "150%", opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.3 }}
            key="moon"
            className={ICON_CLASS}
          />
        ) : theme === "system" ? (
          <MotionMonitor
            initial={initialAnimation}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "150%", opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.3 }}
            key="monitor"
            className={ICON_CLASS}
          />
        ) : null}
      </AnimatePresence>
    </button>
  );
}
