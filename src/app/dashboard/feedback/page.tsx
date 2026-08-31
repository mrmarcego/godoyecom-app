import { MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Card, CardBody, EmptyState, Badge } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

interface FeedbackRow {
  id: string;
  message: string;
  created_at: string;
  read_at: string | null;
  admin: { full_name: string } | null;
}

export default async function FeedbackPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: feedback } = await supabase
    .from("feedback")
    .select("id, message, created_at, read_at, admin:admin_id(full_name)")
    .eq("student_id", user!.id)
    .order("created_at", { ascending: false });

  const rows = (feedback ?? []) as unknown as FeedbackRow[];
  const hasUnread = rows.some((f) => !f.read_at);
  if (hasUnread) {
    await supabase.rpc("mark_all_feedback_read");
  }

  return (
    <div>
      <PageHeader
        title="Feedback"
        description="Comentarios privados que el equipo de Godoyecom te ha dejado. Solo tú los puedes ver."
      />

      {!rows.length ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<MessageSquare size={28} />}
              title="Todavía no tienes feedback"
              description="Cuando el equipo te deje un comentario privado, lo vas a ver aquí."
            />
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((f) => (
            <Card key={f.id}>
              <CardBody className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-ink-primary">
                    {f.admin?.full_name || "Equipo Godoyecom"}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    {!f.read_at && <Badge variant="brand">Nuevo</Badge>}
                    <span className="text-xs text-ink-muted">
                      {formatDateTime(f.created_at)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-ink-secondary whitespace-pre-wrap">
                  {f.message}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
