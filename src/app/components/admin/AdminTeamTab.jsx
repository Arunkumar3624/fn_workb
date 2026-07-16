import { useState } from "react";
import { Plus, ShieldAlert, Lock, ShieldX, X } from "lucide-react";
import { INITIAL_TEAM } from "../../data/mockAdminData";

const ROLE_BADGE = {
  "Super Admin": "bg-amber-100 text-amber-700",
  "Tier 1 Support": "bg-slate-100 text-slate-600",
  "Dispute Specialist": "bg-indigo-100 text-indigo-700",
};

function ToggleSwitch({ checked, onChange, disabled, dimmed }) {
  return (
    <div
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : onChange}
      onKeyDown={(event) => {
        if (disabled || (event.key !== "Enter" && event.key !== " ")) return;
        event.preventDefault();
        onChange();
      }}
      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ease-in-out ${
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      } ${dimmed ? "opacity-60 grayscale" : ""} ${checked ? "bg-emerald-500" : "bg-slate-200"}`}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
          checked ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </div>
  );
}

export default function AdminTeamTab() {
  const [team, setTeam] = useState(INITIAL_TEAM);
  const [selectedMemberId, setSelectedMemberId] = useState(INITIAL_TEAM[0].id);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const selectedMember = team.find((m) => m.id === selectedMemberId) ?? null;

  const togglePermission = (memberId, key) => {
    setTeam((current) =>
      current.map((member) =>
        member.id === memberId
          ? { ...member, permissions: { ...member.permissions, [key]: !member.permissions[key] } }
          : member
      )
    );
  };

  const revokeAccess = (memberId) => {
    setTeam((current) => current.filter((member) => member.id !== memberId));
    setSelectedMemberId(null);
  };

  const handleAddMember = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const role = formData.get("role");
    const newMember = {
      id: Date.now(),
      name: formData.get("fullName"),
      role,
      status: "Active",
      permissions: {
        viewChats: true,
        redactMessages: role === "Super Admin" || role === "Dispute Specialist",
        sendWarnings: true,
        refundEscrow: role === "Super Admin",
        forceRelease: role === "Super Admin",
        approveKyc: role === "Super Admin" || role === "Dispute Specialist",
        banUsers: role === "Super Admin",
      },
    };

    setTeam((current) => [...current, newMember]);
    setIsAddModalOpen(false);
  };

  return (
    <div className="p-7">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[#0A1128]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Team Access
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">Role-based permissions. Only Super Admins can touch escrow.</p>
        </div>
      </div>

      <div className="rounded-3xl bg-white/30 border border-white/50 p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl p-5 shadow-lg shadow-slate-200/40">
              <div className="mb-4 flex items-center justify-between gap-3 px-1">
                <h3 className="text-sm font-bold text-slate-900">Active Roster</h3>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-black"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Member
                </button>
              </div>

              <div className="space-y-2">
                {team.map((member) => {
                  const isSelected = selectedMemberId === member.id;
                  const initials = member.name
                    .split(" ")
                    .map((word) => word[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  return (
                    <button
                      key={member.id}
                      onClick={() => setSelectedMemberId(member.id)}
                      className={`w-full rounded-xl border-l-4 px-4 py-3 text-left transition-all ${
                        isSelected
                          ? "border-[#FF6B35] bg-white/50 shadow-inner"
                          : "border-transparent hover:bg-white/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-[#0A1128]">{member.name}</p>
                          <span
                            className={`mt-1 inline-block rounded-md px-2 py-0.5 text-xs font-bold ${
                              ROLE_BADGE[member.role] ?? "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {member.role}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedMember ? (
              <div>
                <div className="mb-5">
                  <h2 className="text-2xl font-extrabold text-[#0A1128]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Access Control Matrix
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Viewing permissions for <span className="font-semibold text-slate-700">{selectedMember.name}</span>
                    {" - "}
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold ${
                        ROLE_BADGE[selectedMember.role] ?? "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {selectedMember.role}
                    </span>
                  </p>
                  {selectedMember.role === "Super Admin" && (
                    <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      Super Admins have unrestricted God-Mode access.
                    </span>
                  )}
                </div>

                <div className="mb-4 rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl p-6 shadow-lg shadow-slate-200/40">
                  <h3 className="mb-1 text-sm font-bold text-slate-900">Content Moderation</h3>
                  <div>
                    {[
                      { key: "viewChats", label: "View Chats" },
                      { key: "redactMessages", label: "Redact Messages" },
                      { key: "sendWarnings", label: "Send Warnings" },
                    ].map(({ key, label }) => {
                      const isSuper = selectedMember.role === "Super Admin";
                      const checked = isSuper ? true : selectedMember.permissions[key];

                      return (
                        <div key={key} className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0">
                          <span className="text-sm font-medium text-slate-600">{label}</span>
                          <ToggleSwitch checked={checked} disabled={isSuper} onChange={() => togglePermission(selectedMember.id, key)} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-4 rounded-2xl border border-red-200 bg-white/60 backdrop-blur-xl p-6 shadow-lg shadow-slate-200/40">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-red-600">Financial Escrow</h3>
                    <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">
                      HIGH RISK
                    </span>
                  </div>
                  <div
                    className={`rounded-xl ${
                      selectedMember.role === "Tier 1 Support" || selectedMember.name.toLowerCase().includes("support")
                        ? "bg-slate-50/80"
                        : ""
                    }`}
                  >
                    {[
                      { key: "refundEscrow", label: "Refund Escrow" },
                      { key: "forceRelease", label: "Force Release Escrow" },
                    ].map(({ key, label }) => {
                      const isSuper = selectedMember.role === "Super Admin";
                      const isSupport =
                        selectedMember.role === "Tier 1 Support" || selectedMember.name.toLowerCase().includes("support");
                      const lockedOut = !isSuper;
                      const checked = isSuper ? true : selectedMember.permissions[key];

                      return (
                        <div
                          key={key}
                          className={`flex items-center justify-between border-b border-slate-100 px-3 py-3 last:border-0 ${
                            isSupport ? "opacity-60 grayscale" : ""
                          }`}
                        >
                          <span className="flex items-center gap-1.5 text-sm font-medium text-slate-600">{label}</span>
                          {isSupport ? (
                            <Lock size={20} className="text-slate-400" />
                          ) : (
                            <ToggleSwitch
                              checked={checked}
                              disabled={isSuper || lockedOut}
                              dimmed={lockedOut}
                              onChange={() => togglePermission(selectedMember.id, key)}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-4 rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl p-6 shadow-lg shadow-slate-200/40">
                  <h3 className="mb-1 text-sm font-bold text-slate-900">User Management</h3>
                  <div>
                    {[
                      { key: "approveKyc", label: "Approve KYC" },
                      { key: "banUsers", label: "Ban Users" },
                    ].map(({ key, label }) => {
                      const isSuper = selectedMember.role === "Super Admin";
                      const checked = isSuper ? true : selectedMember.permissions[key];

                      return (
                        <div key={key} className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0">
                          <span className="text-sm font-medium text-slate-600">{label}</span>
                          <ToggleSwitch checked={checked} disabled={isSuper} onChange={() => togglePermission(selectedMember.id, key)} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedMember.role !== "Super Admin" && (
                  <button
                    onClick={() => revokeAccess(selectedMember.id)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white/50 px-5 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
                  >
                    <ShieldX className="h-4 w-4" />
                    Revoke Access
                  </button>
                )}
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/40 text-sm text-slate-400">
                Select a team member to view their permissions
              </div>
            )}
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <form onSubmit={handleAddMember} className="w-full max-w-md overflow-hidden rounded-2xl border border-white/70 bg-white/80 backdrop-blur-2xl shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <h2 className="text-lg font-bold text-slate-950">Add New Team Member</h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close add member modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4 p-6">
              <label className="flex flex-col gap-1.5 text-sm font-bold text-slate-700">
                Full Name
                <input
                  name="fullName"
                  required
                  className="rounded-lg border border-slate-300 p-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900"
                  placeholder="Enter full name"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-bold text-slate-700">
                Email Address
                <input
                  name="email"
                  type="email"
                  required
                  className="rounded-lg border border-slate-300 p-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900"
                  placeholder="name@company.com"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-bold text-slate-700">
                Role Selection
                <select
                  name="role"
                  required
                  defaultValue="Tier 1 Support"
                  className="rounded-lg border border-slate-300 bg-white p-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900"
                >
                  <option>Tier 1 Support</option>
                  <option>Dispute Specialist</option>
                  <option>Super Admin</option>
                </select>
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-black"
              >
                Add Member
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
