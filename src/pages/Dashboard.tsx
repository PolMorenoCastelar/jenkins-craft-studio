import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  GitBranch,
  Plus,
  MoreVertical,
  Pencil,
  Copy,
  Trash2,
  LogOut,
  Loader2,
  Search,
  Layers,
} from 'lucide-react';
import type { Project } from '@/types/pipeline';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { projects, isLoading, createProject, deleteProject, cloneProject } = useProjects();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (!newName.trim()) return;
    createProject.mutate(
      { name: newName.trim(), description: newDesc.trim() },
      {
        onSuccess: (project) => {
          setDialogOpen(false);
          setNewName('');
          setNewDesc('');
          navigate(`/editor/${project.id}`);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">JenkinsFlow Architect</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Mis Proyectos</h1>
            <p className="text-sm text-muted-foreground">
              Gestiona tus pipelines de Jenkins
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                Nuevo Proyecto
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Crear Proyecto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Mi Pipeline CI/CD"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Pipeline para build y deploy..."
                    className="bg-background"
                    rows={3}
                  />
                </div>
                <Button onClick={handleCreate} className="w-full" disabled={createProject.isPending}>
                  {createProject.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Crear
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar proyectos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-3">
            <Layers className="h-12 w-12 opacity-40" />
            <p>{projects.length === 0 ? 'No tienes proyectos aún' : 'Sin resultados'}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={() => navigate(`/editor/${project.id}`)}
                onClone={() => cloneProject.mutate(project)}
                onDelete={() => deleteProject.mutate(project.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  onEdit,
  onClone,
  onDelete,
}: {
  project: Project;
  onEdit: () => void;
  onClone: () => void;
  onDelete: () => void;
}) {
  const stageCount = (project.json_config as any)?.stages?.length ?? 0;
  const updated = new Date(project.updated_at).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      className="stage-card cursor-pointer group animate-fade-in"
      onClick={onEdit}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1 min-w-0 flex-1">
          <h3 className="font-semibold text-foreground truncate">{project.name}</h3>
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-border">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
              <Pencil className="h-4 w-4 mr-2" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClone(); }}>
              <Copy className="h-4 w-4 mr-2" /> Clonar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
        <span>{stageCount} stage{stageCount !== 1 ? 's' : ''}</span>
        <span>·</span>
        <span>{updated}</span>
      </div>
    </div>
  );
}
