import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { AppShell } from "@/components/layout/AppShell";
import { StudioProvider } from "@/data/studio";
import { LanguageProvider, useI18n } from "@/i18n/LanguageProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import NotFound from "@/pages/NotFound";
import RollCall from "@/pages/RollCall";
import StudentProfile from "@/pages/StudentProfile";
import Students from "@/pages/Students";
import Studio from "@/pages/Studio";
import Timetable from "@/pages/Timetable";
import Today from "@/pages/Today";
import Users from "@/pages/Users";
import Reports from "@/pages/Reports";

const TITLES: Record<string, string> = {
  "/": "meta.today",
  "/timetable": "meta.timetable",
  "/students": "meta.students",
  "/studio": "meta.studio",
  "/users": "meta.users",
  "/reports": "meta.reports",
};

function ScrollToTop() {
  const [location] = useLocation();
  const { t } = useI18n();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });

    const path = location.replace(/\/$/, "") || "/";
    let key = TITLES[path];
    if (!key && path.startsWith("/students/")) key = "meta.student";
    if (!key && path.startsWith("/roll-call/")) key = "meta.rollcall";
    document.title = `${t(key ?? "meta.notfound")} · Little Fawn Art Studio`;
  }, [location, t]);

  return null;
}

function Router() {
  return (
    <AppShell>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Today} />
        <Route path="/timetable" component={Timetable} />
        <Route path="/students" component={Students} />
        <Route path="/students/:id" component={StudentProfile} />
        <Route path="/reports" component={Reports} />
        <Route path="/roll-call/:classId" component={RollCall} />
        <Route path="/studio" component={Studio} />
        <Route path="/users" component={Users} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <StudioProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                borderRadius: "16px",
                border: "2px solid #E8DBC6",
                background: "#FFFDF8",
                color: "#3F342B",
                fontFamily: "inherit",
                fontWeight: 700,
              },
            }}
          />
          <Router />
        </StudioProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
