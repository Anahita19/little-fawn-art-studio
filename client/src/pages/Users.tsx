import { useState } from "react";
import { Check, Crown, KeyRound, Save, ShieldCheck, UserCog } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useStudio } from "@/data/studio";
import { useI18n } from "@/i18n/LanguageProvider";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { FawnMark } from "@/components/brand/FawnMark";

type Role = "user" | "teacher" | "admin";
type Draft = { role: Role; teacherId: string | null };

export default function Users() {
  const { t, tr, n } = useI18n();
  const { user } = useAuth();
  const { data: studio } = useStudio();
  const usersQuery = trpc.users.list.useQuery(undefined, { enabled: user?.role === "admin", retry: false });
  const utils = trpc.useUtils();
  const updateAccess = trpc.users.updateAccess.useMutation({
    onSuccess: () => {
      void utils.users.list.invalidate();
      toast.success(t("users.saved"));
    },
    onError: (error) => toast.error(error.message),
  });
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});

  if (user?.role !== "admin") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md p-8 text-center">
          <KeyRound className="mx-auto text-[#B4562A]" size={34} />
          <h1 className="mt-3 font-display text-2xl font-extrabold">{t("users.restricted")}</h1>
          <p className="mt-2 text-[12px] font-semibold leading-relaxed text-ink-soft">{t("users.restricted.body")}</p>
        </Card>
      </div>
    );
  }

  if (usersQuery.isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><FawnMark className="h-14 w-14 animate-pulse" title={t("app.name")} /></div>;
  }

  if (usersQuery.error) {
    return <Card className="p-8 text-center"><p className="font-display text-xl font-extrabold">{t("users.error")}</p><p className="mt-2 text-sm font-semibold text-ink-soft">{usersQuery.error.message}</p></Card>;
  }

  const rows = usersQuery.data ?? [];
  const getDraft = (row: (typeof rows)[number]): Draft => drafts[row.id] ?? { role: row.role, teacherId: row.teacherId };
  const changeDraft = (id: number, next: Partial<Draft>, row: (typeof rows)[number]) => {
    const current = getDraft(row);
    setDrafts((value) => ({ ...value, [id]: { ...current, ...next } }));
  };
  const roleLabel = (role: Role) => t(`users.role.${role}`);

  return (
    <div>
      <PageHeader
        eyebrow={t("users.eyebrow")}
        title={t("users.title")}
        subtitle={t("users.subtitle")}
        underline="mint"
        actions={<span className="sticker text-[11px]"><ShieldCheck size={13} strokeWidth={2.8} />{t("users.secure")}</span>}
      />

      <Card className="mb-4 overflow-hidden p-0" tape>
        <div className="grid gap-4 bg-[#DCC9F0]/40 p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5">
          <div>
            <p className="font-display text-[19px] font-extrabold">{t("users.heading")}</p>
            <p className="mt-1 max-w-2xl text-[12px] font-semibold leading-relaxed text-ink-soft">{t("users.body")}</p>
          </div>
          <div className="flex items-center gap-2 rounded-[15px] border-2 border-line bg-card px-3 py-2">
            <UserCog size={18} />
            <div><p className="font-display text-xl font-extrabold leading-none">{n(rows.length)}</p><p className="text-[10px] font-bold text-ink-soft">{t("users.accounts")}</p></div>
          </div>
        </div>
      </Card>

      <div className="grid gap-3">
        {rows.map((row) => {
          const draft = getDraft(row);
          const dirty = draft.role !== row.role || draft.teacherId !== row.teacherId;
          const linkedTeacher = studio.teachers.find((teacher) => teacher.id === draft.teacherId);
          return (
            <Card key={row.id} className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-line bg-[#FBE9CF] text-lg font-extrabold text-ink">
                    {(row.name || row.email || "?").slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-display text-[16px] font-extrabold">{row.name || t("users.unnamed")}</p>
                    <p className="truncate text-[11px] font-semibold text-ink-soft">{row.email || t("users.noEmail")}</p>
                    <p className="mt-1 text-[10px] font-bold text-ink-soft">{t("users.lastSeen")}: {new Date(row.lastSignedIn).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:w-[440px]">
                  <label className="block"><span className="mb-1 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink-soft">{t("users.roleLabel")}</span>
                    <select className="field w-full" value={draft.role} onChange={(event) => changeDraft(row.id, { role: event.target.value as Role, teacherId: event.target.value === "teacher" ? draft.teacherId : null }, row)}>
                      <option value="user">{roleLabel("user")}</option><option value="teacher">{roleLabel("teacher")}</option><option value="admin">{roleLabel("admin")}</option>
                    </select>
                  </label>
                  <label className="block"><span className="mb-1 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink-soft">{t("users.teacherLink")}</span>
                    <select className="field w-full" value={draft.teacherId ?? ""} disabled={draft.role !== "teacher"} onChange={(event) => changeDraft(row.id, { teacherId: event.target.value || null }, row)}>
                      <option value="">{t("users.noTeacher")}</option>
                      {studio.teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{tr(teacher.name)}</option>)}
                    </select>
                  </label>
                </div>
                <button type="button" className="btn btn-primary btn-sm shrink-0 lg:w-28" disabled={!dirty || (draft.role === "teacher" && !draft.teacherId) || updateAccess.isPending} onClick={() => updateAccess.mutate({ id: row.id, role: draft.role, teacherId: draft.role === "teacher" ? draft.teacherId : null })}>
                  {dirty ? <><Save size={13} />{t("users.save")}</> : <><Check size={13} />{t("users.savedShort")}</>}
                </button>
              </div>
              {draft.role === "teacher" && linkedTeacher && <p className="mt-3 flex items-center gap-1.5 rounded-[10px] border-2 border-dashed border-line bg-[#EAF5E7] px-2.5 py-2 text-[10.5px] font-bold text-[#42784D]"><Crown size={12} />{t("users.teacherAccess", { name: tr(linkedTeacher.name) })}</p>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
