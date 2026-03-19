import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { Project, PipelineConfig } from '@/types/pipeline';
import { generateGroovy } from '@/lib/generateGroovy';
import { defaultPipelineConfig } from '@/types/pipeline';
import { toast } from 'sonner';

export function useProjects() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user!.id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Project[];
    },
    enabled: !!user,
  });

  const createProject = useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      const config = defaultPipelineConfig;
      const groovy = generateGroovy(config);
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          user_id: user!.id,
          name,
          description,
          json_config: config as any,
          generated_groovy: groovy,
        }])
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Proyecto creado');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, json_config, generated_groovy, ...rest }: Partial<Project> & { id: string }) => {
      const updates: Record<string, unknown> = { ...rest, updated_at: new Date().toISOString() };
      if (json_config) {
        updates.json_config = json_config as unknown as Record<string, unknown>;
        updates.generated_groovy = generateGroovy(json_config as PipelineConfig);
      }
      if (generated_groovy && !json_config) {
        updates.generated_groovy = generated_groovy;
      }
      const { error } = await supabase
        .from('projects')
        .update(updates as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Proyecto eliminado');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const cloneProject = useMutation({
    mutationFn: async (project: Project) => {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          user_id: user!.id,
          name: `${project.name} (copia)`,
          description: project.description,
          json_config: project.json_config as any,
          generated_groovy: project.generated_groovy,
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Proyecto clonado');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return {
    projects: projectsQuery.data ?? [],
    isLoading: projectsQuery.isLoading,
    createProject,
    updateProject,
    deleteProject,
    cloneProject,
  };
}
