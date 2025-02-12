import { useEffect } from "react";

const SecurityLayer = () => {
  useEffect(() => {
    // Disable Right Click
    const disableRightClick = (event: MouseEvent) => event.preventDefault();

    // Disable Keyboard Shortcuts
    const disableShortcuts = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) && // Windows (Ctrl) & Mac (Command ⌘)
        ["p", "s", "u", "i", "j"].includes(event.key.toLowerCase())
      ) {
        event.preventDefault();
      }

      // Block Print Screen
      if (event.key === "PrintScreen") {
        alert("Screenshots are disabled on this website!");
        event.preventDefault();
      }
    };

    document.addEventListener("contextmenu", disableRightClick);
    document.addEventListener("keydown", disableShortcuts);

    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("keydown", disableShortcuts);
    };
  }, []);

  return null;
};

export default SecurityLayer;
