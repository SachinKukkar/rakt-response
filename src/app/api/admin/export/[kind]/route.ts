import { NextResponse, type NextRequest } from "next/server";
import { getViewer } from "@/lib/auth";
import { toCsv } from "@/lib/csv";
import { createClient } from "@/lib/supabase/server";

const MAX_ROWS = 5000;

/**
 * Administrator-only CSV reports. Exports deliberately exclude phone numbers, email
 * addresses, PIN codes and coordinates, and every export is audit-logged.
 */
export async function GET(_request: NextRequest, { params }: RouteContext<"/api/admin/export/[kind]">) {
  const viewer = await getViewer();
  if (!viewer?.isAdmin) {
    return new NextResponse("Not found", { status: 404 });
  }
  const { kind } = await params;
  const supabase = await createClient();
  let csv: string;
  let rowCount = 0;

  if (kind === "donors") {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, blood_group, blood_group_verified, verification_status, is_active, created_at, donor_locations(state, district, city), donor_preferences(directory_visible, open_to_contact)")
      .eq("is_donor", true)
      .limit(MAX_ROWS);
    if (error) return new NextResponse("Export failed", { status: 500 });
    const rows = (data ?? []) as unknown as Array<{
      id: string;
      display_name: string | null;
      blood_group: string | null;
      blood_group_verified: boolean;
      verification_status: string;
      is_active: boolean;
      created_at: string;
      donor_locations: { state: string; district: string; city: string } | null;
      donor_preferences: { directory_visible: boolean; open_to_contact: boolean } | null;
    }>;
    rowCount = rows.length;
    csv = toCsv(
      ["donor_id", "display_name", "blood_group", "blood_group_verified", "verification_status", "active", "state", "district", "city", "in_directory", "open_to_contact", "registered_at"],
      rows.map((r) => [
        r.id,
        r.display_name,
        r.blood_group,
        r.blood_group_verified,
        r.verification_status,
        r.is_active,
        r.donor_locations?.state,
        r.donor_locations?.district,
        r.donor_locations?.city,
        r.donor_preferences?.directory_visible,
        r.donor_preferences?.open_to_contact,
        r.created_at,
      ]),
    );
  } else if (kind === "donations") {
    const { data, error } = await supabase
      .from("donation_records")
      .select("id, donor_id, donation_type, donation_date, centre_name, city, district, record_source, verification_status, verified_at, created_at")
      .order("donation_date", { ascending: false })
      .limit(MAX_ROWS);
    if (error) return new NextResponse("Export failed", { status: 500 });
    const rows = (data ?? []) as Array<Record<string, unknown>>;
    rowCount = rows.length;
    const headers = ["id", "donor_id", "donation_type", "donation_date", "centre_name", "city", "district", "record_source", "verification_status", "verified_at", "created_at"];
    csv = toCsv(headers, rows.map((r) => headers.map((h) => r[h])));
  } else if (kind === "requests") {
    const { data, error } = await supabase
      .from("blood_requests")
      .select("reference_code, blood_group, request_type, units_needed, hospital_name, city, district, urgency, status, required_by, verified_at, closed_at, created_at")
      .order("created_at", { ascending: false })
      .limit(MAX_ROWS);
    if (error) return new NextResponse("Export failed", { status: 500 });
    const rows = (data ?? []) as Array<Record<string, unknown>>;
    rowCount = rows.length;
    const headers = ["reference_code", "blood_group", "request_type", "units_needed", "hospital_name", "city", "district", "urgency", "status", "required_by", "verified_at", "closed_at", "created_at"];
    csv = toCsv(headers, rows.map((r) => headers.map((h) => r[h])));
  } else {
    return new NextResponse("Not found", { status: 404 });
  }

  await supabase.rpc("log_audit_event", {
    p_action: `export.${kind}_csv`,
    p_entity_type: "report",
    p_entity_id: null,
    p_metadata: { rows: rowCount },
  });

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rakt-response-${kind}-${date}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
