import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  X,
  PlaySquare,
  FileText,
  BookOpen,
  Link as LinkIcon
} from "lucide-react";
import { LearningContent } from "../../../types";

const initialContents: LearningContent[] = [
  { 
    id: "lc1", 
    title: "Mastering PRD Prompts", 
    description: "Learn how to write the perfect prompts to get the best PRDs from the AI.", 
    category: "Video", 
    url: "https://youtube.com/watch?v=example", 
    isPublished: true 
  },
  { 
    id: "lc2", 
    title: "Agile Development Basics", 
    description: "A comprehensive guide on how PRDs fit into the Agile methodology.", 
    category: "Guide", 
    url: "https://example.com/agile-guide", 
    isPublished: true 
  },
  { 
    id: "lc3", 
    title: "Understanding User Personas", 
    description: "Read about creating effective user personas for your product requirements.", 
    category: "Article", 
    url: "https://example.com/personas", 
    isPublished: false 
  },
];

export function LearningContentManagement() {
  const [contents, setContents] = useState<LearningContent[]>(initialContents);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const defaultForm: Partial<LearningContent> = { title: "", description: "", category: "Video", url: "", isPublished: true };
  const [formData, setFormData] = useState<Partial<LearningContent>>(defaultForm);

  const filteredContents = contents.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (editingId) {
      setContents(contents.map(c => c.id === editingId ? { ...c, ...formData } as LearningContent : c));
      setEditingId(null);
    } else {
      const newContent = {
        ...formData,
        id: `lc_${Math.random().toString(36).substr(2, 9)}`,
      } as LearningContent;
      setContents([...contents, newContent]);
      setIsAdding(false);
    }
    setFormData(defaultForm);
  };

  const startEdit = (c: LearningContent) => {
    setEditingId(c.id);
    setFormData(c);
    setIsAdding(false);
  };

  const deleteContent = (id: string) => {
    setContents(contents.filter(c => c.id !== id));
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case "Video": return <PlaySquare className="w-4 h-4" />;
      case "Article": return <FileText className="w-4 h-4" />;
      case "Guide": return <BookOpen className="w-4 h-4" />;
      default: return <LinkIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Learning Content</h2>
          <p className="text-muted-foreground">Manage educational materials available to users with the Learning Content feature.</p>
        </div>
        <Button className="gap-2" onClick={() => { setIsAdding(true); setEditingId(null); setFormData(defaultForm); }}>
          <Plus className="w-4 h-4" /> Add Content
        </Button>
      </div>

      {(isAdding || editingId) && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{isAdding ? "Add Learning Content" : "Edit Content"}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => { setIsAdding(false); setEditingId(null); }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input 
                  value={formData.title || ""} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. How to use prompt variables"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                >
                  <option value="Video">Video</option>
                  <option value="Article">Article</option>
                  <option value="Guide">Guide</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={formData.description || ""} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Short description of the content..."
              />
            </div>

            <div className="space-y-2">
              <Label>URL / Link</Label>
              <Input 
                value={formData.url || ""} 
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox" 
                id="content-publish" 
                checked={formData.isPublished || false} 
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })} 
              />
              <Label htmlFor="content-publish">Published (visible to members)</Label>
            </div>
          </CardContent>
          <div className="p-6 pt-0 flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setIsAdding(false); setEditingId(null); }}>Cancel</Button>
            <Button onClick={handleSave}>{editingId ? "Save Changes" : "Create Content"}</Button>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search content..." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredContents.map((content) => (
              <Card key={content.id} className="overflow-hidden group hover:border-primary/50 transition-colors">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                        {getCategoryIcon(content.category)}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {content.category}
                      </span>
                    </div>
                    <Badge variant={content.isPublished ? "secondary" : "outline"} className={content.isPublished ? "bg-emerald-100 text-emerald-800" : "text-slate-500"}>
                      {content.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-1">{content.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{content.description}</p>
                  <div className="flex items-center gap-1 text-xs text-blue-500 hover:underline cursor-pointer">
                    <LinkIcon className="w-3 h-3" />
                    <span className="truncate max-w-[200px]">{content.url}</span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex gap-2 border-t mt-4 bg-slate-50/50">
                  <Button variant="ghost" size="sm" className="flex-1" onClick={() => startEdit(content)}>
                    <Edit className="w-3.5 h-3.5 mr-2" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => deleteContent(content.id)}>
                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
