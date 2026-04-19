import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { 
  Input 
} from "@/components/ui/input";
import { 
  Button 
} from "@/components/ui/button";
import { 
  Badge 
} from "@/components/ui/badge";
import { 
  Search,
  MoreVertical,
  UserPlus,
  Mail,
  Shield,
  Trash2,
  Edit,
  User as UserIcon,
  X,
  Check
} from "lucide-react";
import { User, Role } from "../../../types";
import { Label } from "@/components/ui/label";

const initialUsers: User[] = [
  { id: "1", name: "Hissamudin", email: "muhammad.hissamudin@gmail.com", role: "admin" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "member" },
  { id: "3", name: "Bob Wilson", email: "bob@wilson.com", role: "member" },
  { id: "4", name: "Alice Brown", email: "alice@brown.co", role: "member" },
  { id: "5", name: "Charlie Davis", email: "charlie@davis.dev", role: "member" },
];

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({ name: "", email: "", role: "member" });

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const handleSave = () => {
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } as User : u));
      setEditingUser(null);
    } else if (isAdding) {
      const newUser = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
      } as User;
      setUsers([...users, newUser]);
      setIsAdding(false);
    }
    setFormData({ name: "", email: "", role: "member" });
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setFormData(user);
    setIsAdding(false);
  };

  const startAdd = () => {
    setFormData({ name: "", email: "", role: "member" });
    setIsAdding(true);
    setEditingUser(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">Manage and monitor your application users.</p>
        </div>
        <Button className="gap-2" onClick={startAdd}>
          <UserPlus className="w-4 h-4" /> Add User
        </Button>
      </div>

      {(isAdding || editingUser) && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{isAdding ? "Add New User" : "Edit User"}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => { setIsAdding(false); setEditingUser(null); }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                placeholder="Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                placeholder="Email"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <select 
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </CardContent>
          <div className="p-6 pt-0 flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setIsAdding(false); setEditingUser(null); }}>Cancel</Button>
            <Button onClick={handleSave}>{editingUser ? "Save Changes" : "Create User"}</Button>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search users..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Filter</Button>
              <Button variant="outline" size="sm">Export</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground font-medium">
                  <th className="text-left py-4 px-2">User</th>
                  <th className="text-left py-4 px-2">Role</th>
                  <th className="text-left py-4 px-2">Status</th>
                  <th className="text-right py-4 px-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/50 transition-colors group">
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold">{user.name}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-1.5 capitalize">
                        {user.role === "admin" ? (
                          <Shield className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        {user.role}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-none">Active</Badge>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => startEdit(user)}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-red-600"
                          onClick={() => deleteUser(user.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
