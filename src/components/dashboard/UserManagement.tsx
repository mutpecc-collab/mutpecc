import { useState, useEffect } from "react";
import { 
  Users, UserCheck, UserX, Shield, Clock, ChevronDown, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShowMoreButton } from "@/components/ShowMoreButton";
import { usePagination } from "@/hooks/usePagination";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRole extends Profile {
  role: AppRole;
  roleId: string;
}

export function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AppRole | "all">("all");

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const { data: roles, error: rolesError } = await supabase.from("user_roles").select("*").order("created_at", { ascending: false });
      if (rolesError) throw rolesError;
      if (roles && roles.length > 0) {
        const userIds = roles.map(r => r.user_id);
        const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", userIds);
        const usersWithRoles: UserWithRole[] = roles.map(role => {
          const profile = profiles?.find(p => p.user_id === role.user_id);
          return {
            ...(profile || { id: role.user_id, user_id: role.user_id, full_name: null, email: null, phone: null, bio: null, avatar_url: null, lessons_attended: 0, created_at: role.created_at, updated_at: role.created_at }),
            role: role.role, roleId: role.id,
          } as UserWithRole;
        });
        setUsers(usersWithRoles);
      }
    } catch (error) { console.error("Error fetching users:", error); }
    finally { setLoading(false); }
  };

  const handlePromote = async (userId: string, currentRole: AppRole, newRole: AppRole) => {
    const { error } = await supabase.from("user_roles").update({ role: newRole }).eq("user_id", userId);
    if (error) { toast({ title: "Error", description: "Failed to update user role.", variant: "destructive" }); }
    else { toast({ title: "Role Updated", description: `User has been updated to ${newRole}.` }); fetchUsers(); }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this user's role?")) return;
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId);
    if (error) { toast({ title: "Error", description: "Failed to remove user.", variant: "destructive" }); }
    else { toast({ title: "User Removed", description: "User role has been removed." }); fetchUsers(); }
  };

  const getRoleBadgeColor = (role: AppRole) => {
    switch (role) {
      case "executive": return "bg-purple-100 text-purple-700";
      case "counselor": return "bg-green-100 text-green-700";
      case "candidate": return "bg-blue-100 text-blue-700";
      case "member": return "bg-teal-100 text-teal-700";
      case "pending_member": return "bg-amber-100 text-amber-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const filteredUsers = filter === "all" ? users : users.filter(u => u.role === filter);
  const { paginatedItems, hasMore, showMore } = usePagination(filteredUsers, 10);
  const pendingCount = users.filter(u => u.role === "pending_member").length;
  const candidateCount = users.filter(u => u.role === "candidate").length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            User Management
          </CardTitle>
          <div className="flex items-center gap-2">
            {pendingCount > 0 && <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700">{pendingCount} pending</span>}
            {candidateCount > 0 && <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">{candidateCount} candidates</span>}
            <select value={filter} onChange={(e) => setFilter(e.target.value as AppRole | "all")} className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
              <option value="all">All Users</option>
              <option value="pending_member">Pending Members</option>
              <option value="member">Members</option>
              <option value="candidate">Candidates</option>
              <option value="counselor">Counselors</option>
              <option value="executive">Executives</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground text-center py-8">Loading users...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No users found</p>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedItems.map((user) => (
                <div key={user.roleId} className="p-4 bg-secondary/50 rounded-xl flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{user.full_name || user.email || "Unknown User"}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs rounded-full ${getRoleBadgeColor(user.role)}`}>{user.role.replace("_", " ")}</span>
                    {user.role === "pending_member" && (
                      <Button variant="warm" size="sm" onClick={() => handlePromote(user.user_id, user.role, "member")}>
                        <UserCheck className="w-4 h-4 mr-1" />Approve
                      </Button>
                    )}
                    {user.role === "candidate" && (
                      <Button variant="warm" size="sm" onClick={() => handlePromote(user.user_id, user.role, "counselor")}>
                        <Shield className="w-4 h-4 mr-1" />Promote to Counselor
                      </Button>
                    )}
                    {user.role === "member" && (
                      <div className="relative group">
                        <Button variant="outline" size="sm">Actions <ChevronDown className="w-3 h-3 ml-1" /></Button>
                        <div className="absolute right-0 top-full mt-1 bg-card border rounded-lg shadow-lg py-1 hidden group-hover:block z-10 min-w-[140px]">
                          <button onClick={() => handlePromote(user.user_id, user.role, "candidate")} className="w-full px-3 py-2 text-sm text-left hover:bg-secondary">Make Candidate</button>
                          <button onClick={() => handlePromote(user.user_id, user.role, "counselor")} className="w-full px-3 py-2 text-sm text-left hover:bg-secondary">Make Counselor</button>
                        </div>
                      </div>
                    )}
                    {user.role === "counselor" && (
                      <Button variant="outline" size="sm" onClick={() => handlePromote(user.user_id, user.role, "member")}>
                        <UserX className="w-4 h-4 mr-1" />Demote
                      </Button>
                    )}
                    {user.role !== "executive" && (
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveUser(user.user_id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <ShowMoreButton hasMore={hasMore} onClick={showMore} totalCount={filteredUsers.length} shownCount={paginatedItems.length} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
