import { useState, type FormEvent } from "react";
import { savePickerProfile } from "../lib/auth";
import { renameMyPicks } from "../lib/picksApi";
import { detectTimeZone, TIME_ZONES } from "../lib/timezone";

type Props = {
  initialName?: string;
  initialTimeZone?: string;
  allowSkip?: boolean;
  onSaved: (profile: { name: string; timeZone: string }) => void;
  onCancel?: () => void;
};

export default function ProfilePage({
  initialName = "",
  initialTimeZone,
  allowSkip = false,
  onSaved,
  onCancel,
}: Props) {
  const [name, setName] = useState(initialName);
  const [timeZone, setTimeZone] = useState(initialTimeZone ?? detectTimeZone());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const saved = await savePickerProfile(name, timeZone);
      await renameMyPicks(saved.name);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  }

  const extraZones = TIME_ZONES.some((entry) => entry.id === timeZone)
    ? []
    : [{ id: timeZone, label: `${timeZone} (detected)` }];

  return (
    <div className="sign-in">
      <div className="sign-in__glow" aria-hidden="true" />
      <div className="sign-in__panel">
        <div className="auth-mast">
          <p className="auth-mast__league">Family pool · Profile</p>
          <h1>Your profile</h1>
          <p className="auth-mast__sub">
            Name on the board · kickoff times in your zone
          </p>
        </div>

        <form className="temp-form" onSubmit={(event) => void handleSubmit(event)}>
          <label>
            <span>Display name</span>
            <input
              autoComplete="nickname"
              autoFocus
              maxLength={24}
              minLength={2}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Josh"
              required
            />
          </label>
          <label>
            <span>Time zone</span>
            <select
              value={timeZone}
              onChange={(event) => setTimeZone(event.target.value)}
            >
              {extraZones.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
              {TIME_ZONES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </label>
          {error ? <p className="temp-form__error">{error}</p> : null}
          <button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save profile"}
          </button>
          {allowSkip && onCancel ? (
            <button
              type="button"
              className="sign-out"
              style={{ justifySelf: "center" }}
              onClick={onCancel}
            >
              Cancel
            </button>
          ) : null}
        </form>
      </div>
    </div>
  );
}
