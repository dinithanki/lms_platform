import { useEffect } from "react";
import { useDialogStore } from "../store/dialogStore";
import { Button, Dialog } from "./ui/index.jsx";

export default function CustomDialog() {
  const { isOpen, type, title, message, confirmLabel, cancelLabel, confirm, cancel } = useDialogStore();

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Enter" && event.target?.tagName !== "BUTTON") confirm();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, confirm]);

  return <Dialog open={isOpen} title={title} description={message} onClose={type === "confirm" ? cancel : confirm} footer={<>
    {type === "confirm" && <Button variant="secondary" onClick={cancel}>{cancelLabel}</Button>}
    <Button variant={type === "confirm" ? "primary" : "danger"} onClick={confirm}>{confirmLabel}</Button>
  </>}>
    <p className="text-sm text-[var(--app-muted)]">{type === "confirm" ? "Please confirm this action to continue." : ""}</p>
  </Dialog>;
}
