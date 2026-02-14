import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { __ } from "@/lib/i18n";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, ExternalLink } from "lucide-react";

type FormRow = {
  post_id: number;
  post_title: string;
  form_id: string;
  form_title: string;
  mailbox: string;
  mailbox_id: string;
  providers: string;
  provider_ids: number[];
  field_count: number;
  edit_link: string;
  view_link: string;
};

type PostTypeGroup = {
  label: string;
  posts: FormRow[];
};

type UsageResponse = {
  by_post_type: Record<string, PostTypeGroup>;
};

export default function FormsUsagePage() {
  const [data, setData] = useState<UsageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiGet<UsageResponse & { data?: { by_post_type?: UsageResponse["by_post_type"] } }>("/forms/usage")
      .then((res) => {
        if (cancelled) return;
        // Support both direct { by_post_type } and wrapped { data: { by_post_type } }
        const byPostType = res.by_post_type ?? (res as any).data?.by_post_type ?? {};
        setData({ by_post_type: byPostType });
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? __("errorOccurred"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">{__("forms")}</h2>
        <p className="text-muted-foreground">{__("loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">{__("forms")}</h2>
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  const byPostType = data?.by_post_type ?? {};
  const entries = Object.entries(byPostType);

  if (entries.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">{__("forms")}</h2>
        <p className="text-muted-foreground">{__("noFormsOnSite")}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-lg font-semibold">{__("forms")}</h2>

      {entries.map(([postType, group]) => (
        <section key={postType}>
          <h3 className="text-base font-medium mb-3">{group.label}</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{__("formId")}</TableHead>
                  <TableHead>{__("postTitle")}</TableHead>
                  <TableHead>{__("mailbox")}</TableHead>
                  <TableHead>{__("providers")}</TableHead>
                  <TableHead className="text-right">{__("fieldsCount")}</TableHead>
                  <TableHead className="w-[100px] text-right">{__("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.posts.map((row) => (
                  <TableRow key={`${row.post_id}-${row.form_id}`}>
                    <TableCell className="font-mono text-xs">{row.form_id || "—"}</TableCell>
                    <TableCell>
                      <span className="font-medium">{row.post_title || __("untitled")}</span>
                      {row.form_title ? (
                        <span className="block text-xs text-muted-foreground">
                          {row.form_title}
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell>{row.mailbox}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {row.providers || "—"}
                    </TableCell>
                    <TableCell className="text-right">{row.field_count}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {row.edit_link ? (
                          <a
                            href={row.edit_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                            title={__("edit")}
                          >
                            <Pencil className="h-4 w-4" />
                          </a>
                        ) : null}
                        {row.view_link ? (
                          <a
                            href={row.view_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                            title={__("view")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      ))}
    </div>
  );
}
