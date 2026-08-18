import { useEffect, useState } from "react";
import { Authenticator, ThemeProvider } from "@aws-amplify/ui-react";
import App from "../App";
import { getPickerName } from "../lib/auth";
import { hasPickModel } from "../lib/amplify";
import LiveBoardPage from "./LiveBoardPage";
import StandingsPage from "./StandingsPage";

type View = "picks" | "live" | "standings";

const authTheme = {
  name: "roth-picks",
  tokens: {
    colors: {
      font: {
        primary: { value: "#f4efe4" },
        secondary: { value: "#f4efe4" },
        tertiary: { value: "#f4efe4" },
        interactive: { value: "#f4efe4" },
      },
      background: {
        primary: { value: "#0d1f17" },
        secondary: { value: "#143526" },
      },
    },
  },
};

function AuthenticatedShell({
  signOut,
}: {
  signOut?: () => void;
}) {
  const [view, setView] = useState<View>("picks");
  const [userLabel, setUserLabel] = useState("Family");

  useEffect(() => {
    void getPickerName().then(setUserLabel);
  }, []);

  const handleSignOut = () => {
    signOut?.();
  };

  return (
    <>
      <nav className="app-nav" aria-label="Primary">
        <button
          type="button"
          className={view === "picks" ? "is-active" : undefined}
          onClick={() => setView("picks")}
        >
          Picks
        </button>
        <button
          type="button"
          className={view === "live" ? "is-active" : undefined}
          onClick={() => setView("live")}
        >
          Live
        </button>
        <button
          type="button"
          className={view === "standings" ? "is-active" : undefined}
          onClick={() => setView("standings")}
        >
          Standings
        </button>
      </nav>

      {view === "picks" ? (
        <App userLabel={userLabel} onSignOut={handleSignOut} />
      ) : view === "live" ? (
        <LiveBoardPage userLabel={userLabel} onSignOut={handleSignOut} />
      ) : (
        <StandingsPage userLabel={userLabel} onSignOut={handleSignOut} />
      )}
    </>
  );
}

function BackendNotice() {
  return (
    <div className="sign-in">
      <div className="sign-in__panel">
        <div className="auth-mast">
          <p className="auth-mast__league">Backend setup required</p>
          <h1>Deploy picks API</h1>
          <p className="auth-mast__sub">
            Deploy the Amplify backend, then refresh this page.
          </p>
        </div>
        <p className="auth-foot">
          In AWS Amplify Hosting, connect this repo with app root{" "}
          <code>apps/picks</code> and deploy. That runs Cognito + AppSync +
          the hosted PWA in one pipeline.
        </p>
      </div>
    </div>
  );
}

export default function Root() {
  if (!hasPickModel()) {
    return <BackendNotice />;
  }

  return (
    <ThemeProvider theme={authTheme} colorMode="dark">
      <Authenticator hideSignUp loginMechanisms={["email"]}>
        {({ signOut }) => <AuthenticatedShell signOut={signOut} />}
      </Authenticator>
    </ThemeProvider>
  );
}
