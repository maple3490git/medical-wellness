"use client";

import { useMemo, useState } from "react";
import { Users, Plus, ShieldCheck, UserCog, MoreHorizontal } from "lucide-react";
import { users } from "@/data/users";
import { roles } from "@/data/roles";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Table, { TableRow, Td } from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import Dropdown, { DropdownTrigger, DropdownItem } from "@/components/ui/Dropdown";
import { useToast } from "@/context/ToastContext";
import { formatDateTime } from "@/lib/utils";
import type { User } from "@/lib/types";
import SearchInput from "@/components/ui/SearchInput";
import PageHeader from "@/components/ui/PageHeader";

export default function UtilisateursPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Tous");
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState<User | null>(null);

  const filtered = useMemo(() => {
    let list = [...users];
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((u) => `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    if (roleFilter !== "Tous") list = list.filter((u) => u.role === roleFilter);
    return list;
  }, [search, roleFilter]);

  const active = users.filter((u) => u.status === "active").length;

  const roleActions = (u: User) => (
    <>
      <DropdownItem
        icon="pencil"
        onClick={() => {
          setOpenEdit(u);
          showToast("Formulaire de modification chargé (démo).", "info");
        }}
      >
        Modifier
      </DropdownItem>
      <DropdownItem
        icon="ban"
        danger
        onClick={() => showToast(`${u.firstName} ${u.lastName} a été désactivé.`, "info")}
      >
        Désactiver
      </DropdownItem>
      <DropdownItem
        icon="trash"
        danger
        onClick={() => showToast("Suppression impossible : contrainte d'intégrité (prototype).", "error")}
      >
        Supprimer
      </DropdownItem>
    </>
  );

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader title="Utilisateurs" subtitle={`${users.length} comptes · ${active} actifs`}>
<div className="flex gap-2">
          <button onClick={() => showToast("Rôles & permissions — module dédié.", "info")} className="btn-outline">
            <ShieldCheck size={15} /> Rôles
          </button>
          <button onClick={() => setOpenAdd(true)} className="btn-gold">
            <Plus size={15} /> Inviter un utilisateur
          </button>
        </div>
</PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Comptes actifs</p>
          <p className="font-display text-xl font-bold text-emerald-600 dark:text-emerald-400">{active}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Connectés aujourd'hui</p>
          <p className="font-display text-xl font-bold">7</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Rôles système</p>
          <p className="font-display text-xl font-bold">{roles.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[rgb(var(--text-muted))]">Départements</p>
          <p className="font-display text-xl font-bold">6</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un utilisateur..." />
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {["Tous", ...roles.map((r) => r.id)].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`chip shrink-0 ${roleFilter === r ? "bg-noir-900 text-white dark:bg-gold-500 dark:text-noir-950" : "border border-[rgb(var(--border))] hover:border-gold-400"}`}
            >
              {r === "Tous" ? "Tous" : roles.find((x) => x.id === r)?.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="hidden lg:block">
          <Table headers={["Utilisateur", "E-mail", "Rôle", "Département", "Dernière connexion", "Statut", ""]}>
            {filtered.map((u) => (
              <TableRow key={u.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar firstName={u.firstName} lastName={u.lastName} size="sm" status={u.status === "active"} />
                    <div>
                      <p className="font-medium text-sm">{u.firstName} {u.lastName}</p>
                      <p className="text-[11px] text-[rgb(var(--text-muted))]">{u.phone}</p>
                    </div>
                  </div>
                </Td>
                <Td>{u.email}</Td>
                <Td>
                  <Badge color="gold">{u.roleLabel}</Badge>
                </Td>
                <Td>{u.department ?? "—"}</Td>
                <Td className="text-[rgb(var(--text-muted))]">{formatDateTime(u.lastLogin)}</Td>
                <Td>
                  <Badge color={u.status === "active" ? "emerald" : "zinc"} dot>
                    {u.status === "active" ? "Actif" : "Désactivé"}
                  </Badge>
                </Td>
                <Td align="right">
                  <Dropdown trigger={<DropdownTrigger><MoreHorizontal size={16} className="text-[rgb(var(--text-muted))]" /></DropdownTrigger>}>
                    {(close) => (
                      <>
                        {roleActions(u)}
                      </>
                    )}
                  </Dropdown>
                </Td>
              </TableRow>
            ))}
          </Table>
        </div>

        <div className="lg:hidden divide-y divide-[rgb(var(--border))]">
          {filtered.map((u) => (
            <div key={u.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar firstName={u.firstName} lastName={u.lastName} size="sm" status={u.status === "active"} />
                  <div>
                    <p className="font-medium text-sm">{u.firstName} {u.lastName}</p>
                    <p className="text-[11px] text-[rgb(var(--text-muted))]">{u.email}</p>
                  </div>
                </div>
                <Badge color={u.status === "active" ? "emerald" : "zinc"} dot>{u.status === "active" ? "Actif" : "Désactivé"}</Badge>
              </div>
              <div className="flex items-center justify-between mt-2.5">
                <Badge color="gold">{u.roleLabel}</Badge>
                <span className="text-[11px] text-[rgb(var(--text-muted))]">Dernière connexion : {formatDateTime(u.lastLogin)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite modal */}
      <Modal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        title="Inviter un utilisateur"
        subtitle="Un e-mail d'invitation avec identifiants temporaires sera envoyé."
        footer={
          <>
            <button onClick={() => setOpenAdd(false)} className="btn-outline">Annuler</button>
            <button onClick={() => { setOpenAdd(false); showToast("Invitation envoyée par e-mail.", "success"); }} className="btn-gold">
              <Plus size={15} /> Envoyer l'invitation
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="input-label">Prénom *</label>
            <input className="input" placeholder="Prénom" />
          </div>
          <div>
            <label className="input-label">Nom *</label>
            <input className="input" placeholder="Nom" />
          </div>
          <div className="sm:col-span-2">
            <label className="input-label">E-mail professionnel *</label>
            <input type="email" className="input" placeholder="prenom.nom@medical-wellness.ma" />
          </div>
          <div>
            <label className="input-label">Rôle</label>
            <select className="input">
              {roles.filter((r) => r.id !== "employe").map((r) => <option key={r.id}>{r.label}</option>)}
              <option>Employé (accès restreint)</option>
            </select>
          </div>
          <div>
            <label className="input-label">Département</label>
            <select className="input">
              {["Direction", "Accueil & Réception", "Médical", "Laboratoire", "SPA & Esthétique", "Comptabilité", "Fitness"].map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <label className="sm:col-span-2 flex items-center gap-2 text-sm text-[rgb(var(--text-muted))]">
            <input type="checkbox" className="accent-[#d4af37]" defaultChecked /> Envoyer les identifiants temporaires par SMS également
          </label>
        </div>
      </Modal>
    </div>
  );
}