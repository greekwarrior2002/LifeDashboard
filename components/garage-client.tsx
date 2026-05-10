"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Car,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Wrench,
} from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import {
  SERVICE_TYPE_LABELS,
  type GarageAlert,
  type GarageCar,
  type GarageServiceRecord,
  type GarageServiceType,
  type GarageSnapshot,
} from "@/lib/types/garage";
import { cn } from "@/lib/utils";

const serviceOptions = Object.entries(SERVICE_TYPE_LABELS) as Array<
  [GarageServiceType, string]
>;

type Mode = "card" | "page";

const emptyCarForm = {
  make: "",
  model: "",
  year: new Date().getFullYear(),
  nickname: "",
  mileageKm: 0,
  vin: "",
  notes: "",
  oilInterval: 8000,
  airInterval: 24000,
  cabinInterval: 20000,
  timingInterval: 100000,
};

function serviceForm(carId = "") {
  return {
    carId,
    type: "oil_change" as GarageServiceType,
    label: "",
    date: new Date().toISOString().slice(0, 10),
    mileageKm: 0,
    cost: 0,
    shop: "DIY",
    notes: "",
    receiptUrl: "",
  };
}

async function parseGarageResponse(res: Response): Promise<GarageSnapshot> {
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail ?? json.error ?? "garage_request_failed");
  return json as GarageSnapshot;
}

function fullName(car: GarageCar): string {
  return `${car.year} ${car.make} ${car.model}`;
}

function alertToneClass(alert: GarageAlert): string {
  if (alert.tone === "danger") return "border-neon-rose/30 bg-neon-rose/10 text-neon-rose";
  if (alert.tone === "warn") return "border-neon-amber/30 bg-neon-amber/10 text-neon-amber";
  if (alert.tone === "good") return "border-neon-emerald/30 bg-neon-emerald/10 text-neon-emerald";
  return "border-white/[0.08] bg-white/[0.02] text-subtle";
}

export function GarageClient({ mode = "card" }: { mode?: Mode }) {
  const [garage, setGarage] = useState<GarageSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCarId, setActiveCarId] = useState<string | null>(null);
  const [carForm, setCarForm] = useState(emptyCarForm);
  const [svcForm, setSvcForm] = useState(serviceForm());
  const [editingService, setEditingService] = useState<GarageServiceRecord | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const next = await parseGarageResponse(
        await fetch("/api/garage", { cache: "no-store" }),
      );
      setGarage(next);
      setActiveCarId((current) => current ?? next.cars[0]?.id ?? null);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const activeCar = garage?.cars.find((car) => car.id === activeCarId) ?? garage?.cars[0];
  const recentServices = useMemo(
    () =>
      [...(garage?.services ?? [])].sort(
        (a, b) => b.date.localeCompare(a.date) || b.mileageKm - a.mileageKm,
      ),
    [garage?.services],
  );
  const activeServices = recentServices.filter((s) => s.carId === activeCar?.id);

  async function postJSON(url: string, method: string, body?: unknown) {
    setBusy(true);
    try {
      const next = await parseGarageResponse(
        await fetch(url, {
          method,
          headers: body ? { "Content-Type": "application/json" } : undefined,
          body: body ? JSON.stringify(body) : undefined,
        }),
      );
      setGarage(next);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function saveCar(event: FormEvent) {
    event.preventDefault();
    const body = {
      make: carForm.make,
      model: carForm.model,
      year: Number(carForm.year),
      nickname: carForm.nickname,
      mileageKm: Number(carForm.mileageKm),
      vin: carForm.vin,
      notes: carForm.notes,
      maintenanceIntervalsKm: {
        oil_change: Number(carForm.oilInterval),
        air_filter: Number(carForm.airInterval),
        cabin_filter: Number(carForm.cabinInterval),
        timing_service: Number(carForm.timingInterval),
      },
    };
    await postJSON("/api/garage", "POST", body);
    setCarForm(emptyCarForm);
  }

  async function saveService(event: FormEvent) {
    event.preventDefault();
    const body = {
      ...svcForm,
      mileageKm: Number(svcForm.mileageKm),
      cost: Number(svcForm.cost),
    };
    await postJSON(
      editingService ? `/api/garage/services/${editingService.id}` : "/api/garage/services",
      editingService ? "PATCH" : "POST",
      body,
    );
    setEditingService(null);
    setSvcForm(serviceForm(activeCar?.id));
  }

  function startServiceEdit(service: GarageServiceRecord) {
    setEditingService(service);
    setSvcForm({
      carId: service.carId,
      type: service.type,
      label: service.label,
      date: service.date,
      mileageKm: service.mileageKm,
      cost: service.cost,
      shop: service.shop,
      notes: service.notes ?? "",
      receiptUrl: service.receiptUrl ?? "",
    });
  }

  function selectCar(car: GarageCar) {
    setActiveCarId(car.id);
    setSvcForm((current) => ({ ...current, carId: car.id, mileageKm: car.mileageKm }));
  }

  if (loading) {
    return (
      <GlassCard glow="amber" className="p-5">
        <div className="flex min-h-[220px] items-center justify-center text-[12px] text-muted">
          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Loading garage...
        </div>
      </GlassCard>
    );
  }

  return (
    <div className={mode === "page" ? "space-y-5" : ""}>
      <GlassCard glow="amber" className="p-5">
        <CardHeader
          title="Garage"
          subtitle={`${garage?.cars.length ?? 0} vehicles · ${garage?.services.length ?? 0} service records`}
          icon={<Car className="h-4 w-4 text-neon-amber" />}
          right={
            mode === "card" ? (
              <Link
                href="/cars"
                className="flex h-7 items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.02] px-2 text-[11px] text-subtle transition-colors hover:text-white"
              >
                Manage <ChevronRight className="h-3 w-3" />
              </Link>
            ) : null
          }
        />

        {error ? (
          <div className="mt-4 rounded-lg border border-neon-rose/30 bg-neon-rose/10 px-3 py-2 text-[12px] text-neon-rose">
            {error}
          </div>
        ) : null}

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {(garage?.cars ?? []).map((car) => {
            const carAlerts = (garage?.alerts ?? []).filter((alert) => alert.carId === car.id);
            const latest = recentServices.find((service) => service.carId === car.id);
            return (
              <button
                key={car.id}
                type="button"
                onClick={() => selectCar(car)}
                className={cn(
                  "rounded-xl border border-white/[0.06] bg-white/[0.018] p-4 text-left ring-1 ring-transparent transition hover:border-white/[0.14] hover:bg-white/[0.035]",
                  activeCar?.id === car.id && mode === "page" && "ring-neon-amber/30",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-muted">{car.nickname}</p>
                    <p className="mt-1 text-[15px] font-semibold text-white">{fullName(car)}</p>
                    <p className="mt-1 font-mono text-[12px] text-subtle">
                      {car.mileageKm.toLocaleString()} km
                    </p>
                  </div>
                  <Wrench className="h-4 w-4 text-neon-amber" />
                </div>
                <div className="mt-4 space-y-1.5">
                  {carAlerts.slice(0, mode === "card" ? 2 : 3).map((alert) => (
                    <div
                      key={`${alert.label}-${alert.detail}`}
                      className={cn(
                        "rounded-md border px-2 py-1.5 text-[11px]",
                        alertToneClass(alert),
                      )}
                    >
                      <span className="font-medium">{alert.label}</span>
                      <span className="ml-1 opacity-80">{alert.detail}</span>
                    </div>
                  ))}
                  {latest ? (
                    <div className="rounded-md border border-white/[0.05] bg-white/[0.012] px-2 py-1.5 text-[11px] text-subtle">
                      Last service: {latest.label} · {latest.date}
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        {mode === "card" ? (
          <div className="mt-4 space-y-1.5">
            {recentServices.slice(0, 3).map((service) => {
              const car = garage?.cars.find((c) => c.id === service.carId);
              return (
                <div
                  key={service.id}
                  className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2 text-[11px]"
                >
                  <span className="text-muted">{service.date}</span>
                  <span className="min-w-0 flex-1 truncate px-3 text-subtle">
                    {car?.nickname}: {service.label}
                  </span>
                  <span className="font-mono text-white">${service.cost.toFixed(0)}</span>
                </div>
              );
            })}
            {recentServices.length === 0 ? (
              <div className="rounded-lg border border-dashed border-white/[0.08] bg-white/[0.012] px-3 py-4 text-center text-[12px] text-subtle">
                Add your first service record to start forecasting maintenance.
              </div>
            ) : null}
          </div>
        ) : null}
      </GlassCard>

      {mode === "page" && activeCar ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <GlassCard glow="blue" className="p-5">
            <CardHeader
              title={activeCar.nickname}
              subtitle={`${fullName(activeCar)} · ${activeCar.mileageKm.toLocaleString()} km`}
              right={
                <button
                  type="button"
                  onClick={() => {
                    setSvcForm(serviceForm(activeCar.id));
                    setEditingService(null);
                  }}
                  className="flex h-8 items-center gap-1.5 rounded-md border border-neon-blue/30 bg-neon-blue/10 px-2.5 text-[11px] text-white hover:bg-neon-blue/20"
                >
                  <Plus className="h-3.5 w-3.5" /> Add service
                </button>
              }
            />
            <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.06]">
              <div className="grid grid-cols-[1fr_110px_90px_72px] border-b border-white/[0.06] bg-white/[0.025] px-3 py-2 text-[10px] uppercase tracking-widest text-muted">
                <span>Service</span>
                <span>Mileage</span>
                <span>Cost</span>
                <span />
              </div>
              {activeServices.map((service) => (
                <div
                  key={service.id}
                  className="grid grid-cols-[1fr_110px_90px_72px] items-center border-b border-white/[0.04] px-3 py-2 text-[12px] last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-white">{service.label}</p>
                    <p className="truncate text-[11px] text-muted">
                      {service.date} · {service.shop}
                    </p>
                    {service.notes ? (
                      <p className="mt-1 truncate text-[11px] text-subtle">{service.notes}</p>
                    ) : null}
                  </div>
                  <span className="font-mono text-subtle">{service.mileageKm.toLocaleString()}</span>
                  <span className="font-mono text-white">${service.cost.toFixed(0)}</span>
                  <span className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => startServiceEdit(service)}
                      className="rounded-md border border-white/[0.08] p-1.5 text-subtle hover:text-white"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void postJSON(`/api/garage/services/${service.id}`, "DELETE")}
                      className="rounded-md border border-white/[0.08] p-1.5 text-subtle hover:text-neon-rose"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </div>
              ))}
              {activeServices.length === 0 ? (
                <div className="px-3 py-8 text-center text-[12px] text-subtle">
                  No service history yet for this car.
                </div>
              ) : null}
            </div>
          </GlassCard>

          <div className="space-y-5">
            <GarageServiceForm
              activeCar={activeCar}
              form={svcForm.carId ? svcForm : { ...svcForm, carId: activeCar.id, mileageKm: activeCar.mileageKm }}
              setForm={setSvcForm}
              editing={!!editingService}
              busy={busy}
              onSubmit={saveService}
              onCancel={() => {
                setEditingService(null);
                setSvcForm(serviceForm(activeCar.id));
              }}
            />
            <GarageCarForm
              form={carForm}
              setForm={setCarForm}
              busy={busy}
              onSubmit={saveCar}
            />
            <GlassCard glow="amber" className="p-4">
              <CardHeader title="Maintenance forecast" icon={<AlertTriangle className="h-4 w-4 text-neon-amber" />} />
              <div className="mt-3 space-y-1.5">
                {(garage?.alerts ?? [])
                  .filter((alert) => alert.carId === activeCar.id)
                  .map((alert) => (
                    <div
                      key={`${alert.label}-${alert.detail}`}
                      className={cn("rounded-md border px-2 py-1.5 text-[11px]", alertToneClass(alert))}
                    >
                      <p className="font-medium">{alert.label}</p>
                      <p className="opacity-80">{alert.detail}</p>
                    </div>
                  ))}
              </div>
            </GlassCard>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function GarageServiceForm({
  activeCar,
  form,
  setForm,
  editing,
  busy,
  onSubmit,
  onCancel,
}: {
  activeCar: GarageCar;
  form: ReturnType<typeof serviceForm>;
  setForm: (form: ReturnType<typeof serviceForm>) => void;
  editing: boolean;
  busy: boolean;
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
}) {
  return (
    <GlassCard glow="violet" className="p-4">
      <CardHeader title={editing ? "Edit service" : "Add service"} subtitle={activeCar.nickname} />
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <select
          value={form.type}
          onChange={(e) =>
            setForm({
              ...form,
              type: e.target.value as GarageServiceType,
              label: SERVICE_TYPE_LABELS[e.target.value as GarageServiceType],
            })
          }
          className="h-9 w-full rounded-md border border-white/[0.08] bg-black/20 px-2 text-[12px] text-white"
        >
          {serviceOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          placeholder="Label"
          className="h-9 w-full rounded-md border border-white/[0.08] bg-black/20 px-2 text-[12px] text-white placeholder:text-muted"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="h-9 rounded-md border border-white/[0.08] bg-black/20 px-2 text-[12px] text-white"
          />
          <input
            type="number"
            value={form.mileageKm}
            onChange={(e) => setForm({ ...form, mileageKm: Number(e.target.value) })}
            placeholder="Mileage"
            className="h-9 rounded-md border border-white/[0.08] bg-black/20 px-2 text-[12px] text-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={form.cost}
            onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
            placeholder="Cost"
            className="h-9 rounded-md border border-white/[0.08] bg-black/20 px-2 text-[12px] text-white"
          />
          <input
            value={form.shop}
            onChange={(e) => setForm({ ...form, shop: e.target.value })}
            placeholder="Shop / DIY"
            className="h-9 rounded-md border border-white/[0.08] bg-black/20 px-2 text-[12px] text-white placeholder:text-muted"
          />
        </div>
        <input
          value={form.receiptUrl}
          onChange={(e) => setForm({ ...form, receiptUrl: e.target.value })}
          placeholder="Receipt link"
          className="h-9 w-full rounded-md border border-white/[0.08] bg-black/20 px-2 text-[12px] text-white placeholder:text-muted"
        />
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Notes"
          rows={3}
          className="w-full rounded-md border border-white/[0.08] bg-black/20 px-2 py-2 text-[12px] text-white placeholder:text-muted"
        />
        <div className="flex gap-2">
          <button
            disabled={busy}
            className="flex h-9 flex-1 items-center justify-center rounded-md border border-neon-violet/30 bg-neon-violet/10 text-[12px] text-white hover:bg-neon-violet/20 disabled:opacity-50"
          >
            {editing ? "Save service" : "Add service"}
          </button>
          {editing ? (
            <button
              type="button"
              onClick={onCancel}
              className="h-9 rounded-md border border-white/[0.08] px-3 text-[12px] text-subtle hover:text-white"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </GlassCard>
  );
}

function GarageCarForm({
  form,
  setForm,
  busy,
  onSubmit,
}: {
  form: typeof emptyCarForm;
  setForm: (form: typeof emptyCarForm) => void;
  busy: boolean;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <GlassCard glow="emerald" className="p-4">
      <CardHeader title="Add vehicle" />
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <div className="grid grid-cols-2 gap-2">
          <input className="h-9 rounded-md border border-white/[0.08] bg-black/20 px-2 text-[12px] text-white placeholder:text-muted" placeholder="Make" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} />
          <input className="h-9 rounded-md border border-white/[0.08] bg-black/20 px-2 text-[12px] text-white placeholder:text-muted" placeholder="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
          <input type="number" className="h-9 rounded-md border border-white/[0.08] bg-black/20 px-2 text-[12px] text-white" placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
          <input type="number" className="h-9 rounded-md border border-white/[0.08] bg-black/20 px-2 text-[12px] text-white" placeholder="Mileage" value={form.mileageKm} onChange={(e) => setForm({ ...form, mileageKm: Number(e.target.value) })} />
        </div>
        <input className="h-9 w-full rounded-md border border-white/[0.08] bg-black/20 px-2 text-[12px] text-white placeholder:text-muted" placeholder="Nickname" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} />
        <input className="h-9 w-full rounded-md border border-white/[0.08] bg-black/20 px-2 text-[12px] text-white placeholder:text-muted" placeholder="VIN (optional)" value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} />
        <textarea className="w-full rounded-md border border-white/[0.08] bg-black/20 px-2 py-2 text-[12px] text-white placeholder:text-muted" placeholder="Notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button
          disabled={busy}
          className="flex h-9 w-full items-center justify-center rounded-md border border-neon-emerald/30 bg-neon-emerald/10 text-[12px] text-white hover:bg-neon-emerald/20 disabled:opacity-50"
        >
          Add vehicle
        </button>
      </form>
    </GlassCard>
  );
}
